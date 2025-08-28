import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { useEffect } from "react";
import { Workbox } from "workbox-window";

// google analytics
export default function Analytics() {
  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_ANALYTICS == "true") {
      const script = document.createElement("script");
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-VCE6S1V64T";
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "G-VCE6S1V64T");
    }
  }, []);

  return null;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const wb = new Workbox("/sw.js"); // vite-plugin-pwa handles this path
    wb.addEventListener("waiting", () => {
      // optional: show “Update available” UI, then:
      wb.messageSW({ type: "SKIP_WAITING" });
    });
    wb.register();
  });
}

