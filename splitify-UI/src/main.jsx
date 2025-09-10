import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { useEffect } from "react";
import { useRef } from "react";
const GA_ID = import.meta.env.VITE_GA4_ID || "G-VCE6S1V64T";
const ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === "true";


// google analytics
export default function Analytics() {
  const inited = useRef(false);

  useEffect(() => {
    if (!ENABLED || inited.current) return;
    inited.current = true;

    // Avoid duplicate script injection
    const already = Array.from(document.scripts).some(s =>
      s.src?.includes("googletagmanager.com/gtag/js")
    );
    if (!already) {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
      script.async = true;
      document.head.appendChild(script);
    }

    // Bootstrap gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };

    // Store ID for helpers
    window.__GA_ID = GA_ID;

    // Init + disable auto page_view for SPA
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false });
  }, []);

  return null;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Analytics />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
