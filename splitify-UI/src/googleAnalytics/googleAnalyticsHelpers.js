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

export { trackCreateAccount };
