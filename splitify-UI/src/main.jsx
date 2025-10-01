import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { useEffect } from "react";
import { useRef } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ErrorBoundary from "./components/global/ErrorBoundary";
const GA_ID = import.meta.env.VITE_GA4_ID;
const ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === "true";

// google analytics
export default function Analytics() {
  const inited = useRef(false);

  useEffect(() => {
    if (!ENABLED || inited.current) return;
    inited.current = true;

    const already = Array.from(document.scripts).some((s) =>
      s.src?.includes("googletagmanager.com/gtag/js")
    );

    if (!already) {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
        GA_ID
      )}`;
      script.async = true;

      // Ensure gtag is initialized only after the script is loaded
      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag =
          window.gtag ||
          function gtag() {
            window.dataLayer.push(arguments);
          };

        // Init gtag after the script is loaded
        window.gtag("js", new Date());
        window.gtag("config", GA_ID, { send_page_view: false });
      };

      document.head.appendChild(script);
    } else {
      // If script already exists, initialize gtag immediately
      if (window.gtag) {
        window.gtag("js", new Date());
        window.gtag("config", GA_ID, { send_page_view: false });
      }
    }

    // Store ID for helpers
    window.__GA_ID = GA_ID;
  }, []);

  return null;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Analytics />
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}
      >
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
