import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isPreviewEnv = () => {
  const h = window.location.hostname;
  try {
    if (window.self !== window.top) return true;
  } catch { return true; }
  return h.includes("lovableproject.com") || h.includes("preview") || h.startsWith("id-preview--");
};

(async () => {
  if (isPreviewEnv() && !sessionStorage.getItem("__pcb__")) {
    sessionStorage.setItem("__pcb__", "1");
    const regs = await navigator.serviceWorker?.getRegistrations?.().catch(() => []);
    await Promise.all((regs ?? []).map(r => r.unregister()));
    const keys = await caches.keys().catch(() => []);
    await Promise.all(keys.map(k => caches.delete(k)));
    location.replace(`${location.pathname}?v=${Date.now()}${location.hash}`);
    return;
  }
  createRoot(document.getElementById("root")!).render(<App />);
})();
