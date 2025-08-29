// InstallPWAButton.jsx
import { useEffect, useState, useCallback, useMemo } from "react";

const DISMISS_KEY = "pwa-install-dismissed";

function isStandalone() {
  // iOS Safari sets navigator.standalone when launched from home screen.
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    !!window.navigator.standalone
  );
}

function getUA() {
  return (navigator.userAgent || "").toLowerCase();
}

function isIOS() {
  const ua = getUA();
  return /iphone|ipad|ipod/.test(ua);
}

function isSafariIOS() {
  const ua = getUA();
  // Safari on iOS lacks CriOS/FxiOS/EdgiOS tokens
  return isIOS() && !/crios|fxios|edgios/.test(ua);
}

function isInAppBrowserOnIOS() {
  return isIOS() && !isSafariIOS();
}

function isChromiumEnv() {
  const ua = getUA();
  // Covers Android Chrome/Edge/Samsung Internet and desktop Chromium
  return /chrome|chromium|edg|samsungbrowser/.test(ua) && !isIOS();
}

export default function InstallPWAButton({
  className = "",
  label = "Install SmartSplit",
  showShare = true,
  onOutcome, // optional ({type: 'installed'|'dismissed'|'shared'|'error'|'help_shown'})
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [showOpenInSafariHelp, setShowOpenInSafariHelp] = useState(false);
  const [error, setError] = useState(null);

  const dismissed = useMemo(
    () => localStorage.getItem(DISMISS_KEY) === "1",
    []
  );

  // Listen for installability + install events
  useEffect(() => {
    if (isStandalone()) setInstalled(true);

    const onBeforeInstallPrompt = (e) => {
      // Android/Desktop Chromium: app is installable
      e.preventDefault();
      if (!dismissed) {
        setDeferredPrompt(e);
        setCanInstall(true);
      }
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setCanInstall(false);
      onOutcome?.({ type: "installed" });
    };

    const mq = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayModeChange = () => {
      if (mq?.matches) setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    mq?.addEventListener?.("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      mq?.removeEventListener?.("change", onDisplayModeChange);
    };
  }, [dismissed, onOutcome]);

  const triggerInstallPrompt = useCallback(async () => {
    try {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      // After use, this event can't be reused
      setDeferredPrompt(null);
      setCanInstall(false);

      if (outcome === "dismissed") {
        localStorage.setItem(DISMISS_KEY, "1");
        onOutcome?.({ type: "dismissed" });
      }
      // If accepted, most browsers fire 'appinstalled' after success
    } catch (err) {
      setError(err?.message || "Unable to show install prompt.");
      onOutcome?.({ type: "error", error: err });
    }
  }, [deferredPrompt, onOutcome]);

  const onInstallClick = useCallback(() => {
    // If already a standalone PWA, no need to install
    if (installed) return;

    // iOS has no prompt API. Show instructions.
    if (isIOS()) {
      if (isInAppBrowserOnIOS()) {
        setShowOpenInSafariHelp(true);
      } else {
        setShowIosHelp(true);
      }
      onOutcome?.({ type: "help_shown" });
      return;
    }

    // Chromium platforms: use the captured event
    if (isChromiumEnv() && deferredPrompt) {
      triggerInstallPrompt();
      return;
    }

    // Fallback: try showing help for the platform (e.g., desktop Safari)
    setShowIosHelp(false);
    setShowOpenInSafariHelp(false);
    setError(
      "Your browser may not support a direct install prompt here. Try your browser menu's “Install app” / “Add to Home Screen”."
    );
  }, [installed, deferredPrompt, triggerInstallPrompt, onOutcome]);

  const onDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setCanInstall(false);
    setShowIosHelp(false);
    setShowOpenInSafariHelp(false);
    onOutcome?.({ type: "dismissed" });
  }, [onOutcome]);

  const onShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title || "SmartSplit",
          text: "Check out SmartSplit",
          url: window.location.href,
        });
        onOutcome?.({ type: "shared" });
      } else {
        setError("Sharing isn’t supported on this device/browser.");
      }
    } catch (err) {
      // User cancel is common; treat quietly
      if (err && err.name !== "AbortError") {
        setError("Could not open system share sheet.");
        onOutcome?.({ type: "error", error: err });
      }
    }
  }, [onOutcome]);

  // Decide if we should render the Install button
  // Show if:
  //  - Not already installed, AND
  //  - (Chromium can install now) OR (iOS where we show help) OR (iOS in-app browser where we show open-in-Safari first)
  const shouldShowInstall =
    !installed &&
    (canInstall || isIOS() || isInAppBrowserOnIOS() || isChromiumEnv());

  if (!shouldShowInstall && !showShare) return null;

  return (
    <div className={className}>
      {shouldShowInstall && (
        <button
          onClick={onInstallClick}
          className="px-4 py-2 rounded-2xl bg-blue-600 text-white shadow hover:bg-blue-700 transition"
        >
          {isIOS() ? "Add to Home Screen" : label}
        </button>
      )}

      {showShare && (
        <button
          onClick={onShare}
          className="ml-2 px-3 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          aria-label="Share"
        >
          Share
        </button>
      )}

      {/* iOS tip sheet */}
      {showIosHelp && (
        <div className="mt-3 p-3 rounded-xl bg-white border shadow text-sm text-gray-700 max-w-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium mb-1">
                Add to Home Screen on iPhone/iPad
              </p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Open this site in <span className="font-semibold">Safari</span>.</li>
                <li>Tap the <span className="font-semibold">Share</span> icon.</li>
                <li>
                  Choose <span className="font-semibold">Add to Home Screen</span>, then{" "}
                  <span className="font-semibold">Add</span>.
                </li>
              </ol>
              <p className="mt-2 text-xs text-gray-500">
                Tip: Make sure you have a valid <code>manifest.json</code> and
                service worker registered so iOS recognizes it as a web app.
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-800"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* iOS in-app browsers (Chrome/Firefox/Edge) need to open in Safari first */}
      {showOpenInSafariHelp && (
        <div className="mt-3 p-3 rounded-xl bg-white border shadow text-sm text-gray-700 max-w-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium mb-1">Open in Safari to install</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Tap the browser menu and choose <span className="font-semibold">Open in Safari</span>.</li>
                <li>Then tap <span className="font-semibold">Share</span> → <span className="font-semibold">Add to Home Screen</span>.</li>
              </ol>
              <p className="mt-2 text-xs text-gray-500">
                iOS only allows “Add to Home Screen” from Safari.
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-800"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Errors */}
      {error && (
        <div className="mt-2 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
