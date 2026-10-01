import { createApp } from "./app.js";
import { config, isLive } from "./config.js";
import { log } from "./logger.js";

const server = createApp().listen(config.port, () => {
  log.info("server_started", { port: config.port, mode: isLive() ? "live-ai" : "offline-demo", model: config.llmModel });
});

const shutdown = (signal) => {
  log.info("shutting_down", { signal });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (e) => log.error("unhandled_rejection", { error: String(e) }));
