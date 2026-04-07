import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const PREVIEW_CACHE_BUSTER_VERSION = "2026-04-07-preview-v2";
const PREVIEW_CACHE_BUSTER_KEY = "__pcb_version__";

const isPreviewEnv = () => {
  const h = window.location.hostname;
  try {
    if (window.self !== window.top) return true;
  } catch { return true; }
  return h.includes("lovableproject.com") || h.includes("preview") || h.startsWith("id-preview--");
};

(async () => {
  const needsPreviewReset = isPreviewEnv() && sessionStorage.getItem(PREVIEW_CACHE_BUSTER_KEY) !== PREVIEW_CACHE_BUSTER_VERSION;

  if (needsPreviewReset) {
    sessionStorage.setItem(PREVIEW_CACHE_BUSTER_KEY, PREVIEW_CACHE_BUSTER_VERSION);
    const regs = await navigator.serviceWorker?.getRegistrations?.().catch(() => []);
    await Promise.all((regs ?? []).map(r => r.unregister()));
    const keys = await caches.keys().catch(() => []);
    await Promise.all(keys.map(k => caches.delete(k)));

    const params = new URLSearchParams(location.search);
    params.set("v", PREVIEW_CACHE_BUSTER_VERSION);
    const query = params.toString();

    location.replace(`${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
    return;
  }
  createRoot(document.getElementById("root")!).render(<App />);
})();
