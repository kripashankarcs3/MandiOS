import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config, isLive } from "./config.js";
import { BUYERS, CROPS, FARMER_LOCATION, publicBuyer } from "./data.js";
import { transportFor } from "./tools.js";
import { runSession } from "./session.js";
import { sessions } from "./store.js";
import { parseApproveBody, parseNegotiateQuery } from "./validation.js";
import { log } from "./logger.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(here, "../../client/dist");
const PACED = new Set(["thought", "tool", "msg", "guardrail", "notice", "plan"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buyersForClient() {
  return BUYERS.map((b) => ({ ...publicBuyer(b), transportPerQuintal: transportFor(b.mandi).perQuintal }));
}

function hindiReceipt(r) {
  return [
    "MandiOS: सौदा पक्का ✅",
    `रसीद: ${r.id}`,
    `फसल: ${r.quantity} क्विंटल ${r.cropHi}`,
    `खरीदार: ${r.buyerName} (${r.mandi})`,
    `भाव: ₹${r.price.toLocaleString("en-IN")} प्रति क्विंटल`,
    `भुगतान: ${r.paymentDays === 0 ? "आज नकद" : `${r.paymentDays} दिन में`}`,
    `खर्च काटकर हाथ में: ₹${r.totalNet.toLocaleString("en-IN")}`,
  ].join("\n");
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
      },
    },
  }));
  if (config.corsOrigin) app.use(cors({ origin: config.corsOrigin.split(",").map((s) => s.trim()) }));
  app.use(express.json({ limit: "10kb" }));

  const limiter = rateLimit({
    windowMs: 60_000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests. Wait a minute and try again." },
  });

  app.get("/api/health", (_req, res) => res.json({ ok: true, live: isLive() }));

  app.get("/api/meta", (_req, res) => {
    res.json({
      live: isLive(),
      location: FARMER_LOCATION,
      crops: Object.entries(CROPS).map(([id, c]) => ({ id, ...c })),
      buyers: buyersForClient(),
    });
  });

  // Server-Sent Events: the whole agent run streams live to the browser.
  app.get("/api/negotiate", limiter, async (req, res) => {
    const parsed = parseNegotiateQuery(req.query);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const ctx = parsed.value;

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write(": connected\n\n");

    const ac = new AbortController();
    let closed = false;
    res.on("close", () => { closed = true; ac.abort(); });
    const heartbeat = setInterval(() => { if (!closed) res.write(": ping\n\n"); }, 15000);

    const emit = async (type, data = {}) => {
      if (closed) return;
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
      if (PACED.has(type) && config.eventDelayMs > 0) await sleep(config.eventDelayMs);
    };

    const sessionId = crypto.randomUUID();
    const started = Date.now();
    log.info("session_start", { sessionId, ...ctx, live: isLive() });

    try {
      await emit("session", { sessionId, live: isLive(), ctx, buyers: buyersForClient() });
      const out = await runSession(ctx, emit, ac.signal);
      if (out) sessions.set(sessionId, { ctx, ranked: out.ranked, receipt: null });
      log.info("session_end", { sessionId, ms: Date.now() - started, deals: out?.ranked.length ?? 0, cancelled: !out });
    } catch (e) {
      if (!ac.signal.aborted) {
        log.error("session_error", { sessionId, error: e.message, stack: e.stack });
        await emit("error", { text: "Something went wrong during the negotiation. Run it again." });
      }
    } finally {
      clearInterval(heartbeat);
      if (!closed) {
        await emit("done");
        res.end();
      }
    }
  });

  // Human-in-the-loop: nothing is final until the farmer approves.
  app.post("/api/approve", limiter, (req, res) => {
    const parsed = parseApproveBody(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const { sessionId, buyerId } = parsed.value;

    const s = sessions.get(sessionId);
    if (!s) return res.status(404).json({ error: "This negotiation has expired. Run a new one." });
    if (s.receipt) return res.json(s.receipt); // idempotent

    const deal = s.ranked.find((d) => d.buyerId === buyerId);
    if (!deal) return res.status(400).json({ error: "That buyer has no deal in this negotiation." });

    const receipt = {
      id: `MO-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      approvedAt: new Date().toISOString(),
      crop: s.ctx.crop,
      cropHi: CROPS[s.ctx.crop].hi,
      quantity: s.ctx.quantity,
      ...deal,
    };
    receipt.message = hindiReceipt(receipt);
    receipt.whatsappUrl = `https://wa.me/?text=${encodeURIComponent(receipt.message)}`;
    sessions.update(sessionId, { receipt });
    log.info("deal_approved", { sessionId, buyerId, receiptId: receipt.id, totalNet: receipt.totalNet });
    res.json(receipt);
  });

  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST, { maxAge: "1h", index: false }));
    app.get("*", (_req, res) => res.sendFile(path.join(CLIENT_DIST, "index.html")));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    log.error("unhandled", { error: err.message });
    res.status(err.status || 500).json({ error: err.status === 400 ? "Bad request." : "Server error." });
  });

  return app;
}
