import { useEffect, useState } from "react";
import { useNegotiation } from "./hooks/useNegotiation.js";
import { API_BASE, FALLBACK_CROPS } from "./lib/format.js";
import Landing from "./components/Landing.jsx";
import SellPage from "./components/SellPage.jsx";
import MarketPage from "./components/MarketPage.jsx";
import Workspace from "./components/Workspace.jsx";

const viewFromHash = () => ({ "#sell": "sell", "#market": "market" })[window.location.hash] || "home";

export default function App() {
  const [meta, setMeta] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [view, setView] = useState(viewFromHash);
  const [sellCrop, setSellCrop] = useState("onion");
  const { state, start, reset } = useNegotiation();

  useEffect(() => {
    fetch(`${API_BASE}/api/meta`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setMeta)
      .catch(() => setMeta(null));
  }, []);

  // Browser back/forward moves between the landing page and the sell page.
  useEffect(() => {
    const on = () => setView(viewFromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const openSell = (crop) => {
    if (typeof crop === "string") setSellCrop(crop);
    setView("sell");
    window.location.hash = "sell";
  };

  const openMarket = (crop) => {
    if (typeof crop === "string") setSellCrop(crop);
    setView("market");
    window.location.hash = "market";
  };

  const onStart = (ctx) => {
    setReceipt(null);
    start(ctx);
    window.scrollTo({ top: 0 });
  };

  const onReset = () => {
    reset();
    setReceipt(null);
    openSell();
  };

  // From any screen, jump to the sell page or to a section of the landing page.
  const onNavigate = (id) => {
    reset();
    setReceipt(null);
    if (id === "sell") return openSell();
    if (id === "market") return openMarket();
    setView("home");
    history.replaceState(null, "", window.location.pathname);
    setTimeout(() => {
      if (id === "home") window.scrollTo({ top: 0 });
      else document.getElementById(id)?.scrollIntoView({ block: "start" });
    }, 60);
  };

  if (state.status === "idle") {
    const crops = meta?.crops || FALLBACK_CROPS;
    if (view === "market") {
      return <MarketPage crops={crops} live={meta?.live} initialCrop={sellCrop} onNavigate={onNavigate} onOpenSell={openSell} />;
    }
    if (view === "sell") {
      return (
        <SellPage crops={crops} buyers={meta?.buyers} location={meta?.location} live={meta?.live}
          initialCrop={sellCrop} onStart={onStart} onNavigate={onNavigate} />
      );
    }
    return <Landing crops={crops} buyers={meta?.buyers} live={meta?.live} onStart={onStart} onOpenSell={openSell} onOpenMarket={openMarket} />;
  }

  return <Workspace state={state} meta={meta} receipt={receipt} onApproved={setReceipt} onReset={onReset} onNavigate={onNavigate} />;
}
