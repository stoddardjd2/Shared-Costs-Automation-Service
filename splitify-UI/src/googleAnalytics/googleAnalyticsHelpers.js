function trackCreateAccount(variation) {
  if (import.meta.env.VITE_ENABLE_ANALYTICS == "true") {
    if (window.gtag) {
      window.gtag("event", "signup_click", {
        event_category: "engagement",
        event_label: `Create Account Button CTA-${variation}`,
      });
    }
  }
}

function ready() {
  return (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    window.__GA_ID
  );
}

function pageview(path, title) {
  if (!ready()) return;
  window.gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: path ?? window.location.pathname,
    page_title: title ?? document.title,
  });
}

function gaEvent(name, params = {}) {
  if (!ready()) return;
  window.gtag("event", name, params);
}

function setUserId(userId) {
  if (!ready() || userId == null) return;
  window.gtag("config", window.__GA_ID, { user_id: String(userId) });
}

function clearUserId() {
  if (!ready()) return;
  window.gtag("config", window.__GA_ID, { user_id: null });
}

export { trackCreateAccount, pageview, gaEvent, setUserId, clearUserId };
