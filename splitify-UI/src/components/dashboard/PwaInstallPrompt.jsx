// InstallPWAButton.jsx
import { useEffect, useState, useCallback } from "react";

const DISMISS_KEY = "pwa-install-dismissed";

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone;
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallPWAButton({ className = "" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());
  const [showIosHelp, setShowIosHelp] = useState(false);

  // Throttle/nag control
  const dismissed = localStorage.getItem(DISMISS_KEY) === "1";

  useEffect(() => {
    if (isStandalone()) setInstalled(true);

    const onBeforeInstallPrompt = (e) => {
      // Android/Chromium fires this when the app is installable
      e.preventDefault();           // prevent mini-infobar
      if (!dismissed) {
        setDeferredPrompt(e);
        setCanInstall(true);
      }
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setCanInstall(false);
    };

    const onDisplayModeChange = (e) => {
      // Some platforms update this after installation
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setInstalled(true);
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.matchMedia?.("(display-mode: standalone)")?.addEventListener?.("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.matchMedia?.("(display-mode: standalone)")?.removeEventListener?.("change", onDisplayModeChange);
    };
  }, [dismissed]);

  const onInstallClick = useCallback(async () => {
    // iOS: no prompt API — show instructions
    if (isIOS() && !installed) {
      setShowIosHelp(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();               // Android/Chromium shows native prompt
    const { outcome } = await deferredPrompt.userChoice;
    // After use, the event becomes unusable
    setDeferredPrompt(null);
    setCanInstall(false);

    if (outcome === "dismissed") {
      // Don’t keep nagging — remember this
      localStorage.setItem(DISMISS_KEY, "1");
    }
  }, [deferredPrompt, installed]);

  const onDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setCanInstall(false);
    setShowIosHelp(false);
  };

  // Don’t render if already installed
  // if (installed) return null;

  // // Show if Android can prompt OR iOS (show help)
  // const shouldShow = canInstall || isIOS();
  // if (!shouldShow) return null;

  return (
    <div className={className}>
      <button
        onClick={onInstallClick}
        className="px-4 py-2 rounded-2xl bg-blue-600 text-white shadow hover:bg-blue-700 transition"
      >
        Install SmartSplit
      </button>

      {/* iOS tip sheet */}
      {showIosHelp && (
        <div className="mt-3 p-3 rounded-xl bg-white border shadow text-sm text-gray-700 max-w-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium mb-1">Add to Home Screen on iPhone/iPad</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Open in <span className="font-semibold">Safari</span>.</li>
                <li>Tap the <span className="font-semibold">Share</span> icon.</li>
                <li>Choose <span className="font-semibold">Add to Home Screen</span>, then <span className="font-semibold">Add</span>.</li>
              </ol>
            </div>
            <button onClick={onDismiss} className="text-gray-500 hover:text-gray-800">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
