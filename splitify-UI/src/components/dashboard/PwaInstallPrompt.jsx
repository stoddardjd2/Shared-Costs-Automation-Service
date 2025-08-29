import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

export default function PwaInstallPrompt({ fixed = false }) {
  const [promptEvent, setPromptEvent] = useState(null);
  const [show, setShow] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 1200 : true
  );
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Setup listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect standalone / installed
    const mql = window.matchMedia?.("(display-mode: standalone)");
    const standalone =
      (mql && mql.matches) || window.navigator.standalone === true;
    setIsStandalone(!!standalone);

    const onChangeStandalone = (e) => setIsStandalone(e.matches);
    mql?.addEventListener?.("change", onChangeStandalone);

    // iOS detection (no beforeinstallprompt)
    const ua = window.navigator.userAgent || "";
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in window));

    // Custom install prompt (Chromium only)
    const onBIP = (e) => {
      e.preventDefault();             // use our own UI
      setPromptEvent(e);              // store event for later .prompt()
      setShow(true);                  // now show the UI
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // Hide after installed
    const onInstalled = () => {
      setPromptEvent(null);
      setShow(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    // Track width to avoid using window.innerWidth in render
    const onResize = () => setIsMobile(window.innerWidth <= 1200);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("resize", onResize);
      mql?.removeEventListener?.("change", onChangeStandalone);
    };
  }, []);

  async function handleClick() {
    try {
      if (!promptEvent) return;
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice; // 'accepted' | 'dismissed'
      // console.log('PWA install choice:', outcome);
      setPromptEvent(null); // you can only prompt once
      setShow(false);
    } catch {
      setPromptEvent(null);
      setShow(false);
    }
  }

  // Don’t render if:
  // - Not mobile (your rule),
  // - Already installed/standalone,
  // - No prompt available (Chromium), and not on iOS fallback,
  // - Or we explicitly hid it.
  if (!isMobile || isStandalone || !show) {
    // iOS fallback: we still want to show guidance (no promptEvent on iOS)
    if (!(isIOS && !isStandalone && isMobile)) return null;
  }

  // iOS fallback UI (no beforeinstallprompt)
  if (isIOS && !promptEvent) {
    if (!fixed) {
      return (
        <div className="flex items-center w-full px-4 py-2 text-sm text-gray-700">
          <Smartphone className="w-4 h-4 mr-3" />
          On iPhone: Share → “Add to Home Screen”
        </div>
      );
    }
    return (
      <div className="fixed bottom-4 left-4 rounded-2xl px-4 py-2 shadow bg-blue-600 text-white">
        On iPhone: Share → “Add to Home Screen”
      </div>
    );
  }

  // Chromium prompt UI
  if (!promptEvent) return null;

  if (!fixed) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Smartphone className="w-4 h-4 mr-3" />
        Install Mobile App
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 left-4 rounded-2xl px-4 py-2 shadow bg-blue-600 text-white"
    >
      Install App
    </button>
  );
}
