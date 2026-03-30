import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const PREVIEW_CACHE_RESET_KEY = "mla-preview-cache-reset";

const isPreviewHost = () =>
  window.location.hostname.startsWith("id-preview--");

const isPwaEnabledHost = () => !isPreviewHost();

const registerServiceWorker = async () => {
  if (!isPwaEnabledHost() || !("serviceWorker" in navigator)) return;

  await window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
};

const resetPreviewCaches = async () => {
  if (!isPreviewHost()) return false;

  const hasReset = sessionStorage.getItem(PREVIEW_CACHE_RESET_KEY) === "done";

  const [registrations, cacheKeys] = await Promise.all([
    "serviceWorker" in navigator ? navigator.serviceWorker.getRegistrations() : Promise.resolve([]),
    "caches" in window ? caches.keys() : Promise.resolve([]),
  ]);

  await Promise.all([
    ...registrations.map((registration) => registration.unregister()),
    ...cacheKeys.map((cacheKey) => caches.delete(cacheKey)),
  ]);

  if (!hasReset && (registrations.length > 0 || cacheKeys.length > 0)) {
    sessionStorage.setItem(PREVIEW_CACHE_RESET_KEY, "done");
    window.location.reload();
    return true;
  }

  return false;
};

const bootstrap = async () => {
  const didReload = await resetPreviewCaches();

  if (didReload) return;

  registerServiceWorker();
  createRoot(document.getElementById("root")!).render(<App />);
};

void bootstrap();
