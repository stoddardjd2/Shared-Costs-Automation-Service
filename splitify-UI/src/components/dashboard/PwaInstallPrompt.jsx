import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

export default function PwaInstallPrompt({ fixed = false }) {
  const [promptEvent, setPromptEvent] = useState(null);
  const [show, setShow] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // installed / standalone detect
    const mql = window.matchMedia?.("(display-mode: standalone)");
    setIsStandalone(mql?.matches || window.navigator.standalone === true);
    const onChangeStandalone = (e) => setIsStandalone(e.matches);
    mql?.addEventListener?.("change", onChangeStandalone);

    // iOS (no beforeinstallprompt)
    const ua = navigator.userAgent || "";
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in window));

    // capture BIP once
    const onBIP = (e) => {
      e.preventDefault();
      setPromptEvent(e);
      setShow(true); // show only after event is available
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // hide after actual install
    const onInstalled = () => {
      setPromptEvent(null);
      setShow(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      mql?.removeEventListener?.("change", onChangeStandalone);
    };
  }, []);

  const handleClick = async () => {
    if (!promptEvent) return; // guard
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice; // 'accepted' | 'dismissed'
    // event can only be used once
    setPromptEvent(null);

    if (outcome === "accepted") {
      setShow(false); // hide permanently (installed or will install)
    } else {
      // dismissed: keep the button visible so user sees guidance,
      // but we cannot re-prompt until a new beforeinstallprompt fires (after reload/navigation)
      setShow(true);
    }
  };

  // Don’t show if already installed
  if (isStandalone) return null;

  // iOS fallback (no prompt API): show instructions
  if (isIOS && !promptEvent) {
    return fixed ? (
      <div className="fixed bottom-4 left-4 rounded-2xl px-4 py-2 shadow bg-blue-600 text-white">
        On iPhone: Share ▸ “Add to Home Screen”
      </div>
    ) : (
      <div className="flex items-center w-full px-4 py-2 text-sm text-gray-700">
        <Smartphone className="w-4 h-4 mr-3" />
        On iPhone: Share ▸ “Add to Home Screen”
      </div>
    );
  }

  // Chromium path: only render if we have an event (so clicking actually shows a prompt)
  if (!show || !promptEvent) return null;

  return fixed ? (
    <button
      onClick={handleClick}
      className="fixed bottom-4 left-4 rounded-2xl px-4 py-2 shadow bg-blue-600 text-white"
    >
      Install App
    </button>
  ) : (
    <button
      onClick={handleClick}
      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <Smartphone className="w-4 h-4 mr-3" />
      Install Mobile App
    </button>
  );
}
