// InstallPWAButton.jsx
import { useEffect, useState, useCallback } from "react";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone
  );
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function PwaInstallPrompt({ className = "" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    // If already installed, hide the button
    if (isStandalone()) setInstalled(true);

    const handleBeforeInstallPrompt = (e) => {
      // Stop Chrome’s mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const onInstallClick = useCallback(async () => {
    // iOS: show instructions (no prompt API)
    if (isIOS() && !installed) {
      setShowIosHelp(true);
      return;
    }

    if (!deferredPrompt) return;

    // Must be called in a user gesture handler
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // After one use, the event can't be reused
    setDeferredPrompt(null);
    setCanInstall(false);

    // Optional: analytics
    console.log(`PWA install outcome: ${outcome}`);
  }, [deferredPrompt, installed]);

  // Hide if installed or no way to install yet
  // if (installed) return null;

  // const shouldShowButton = canInstall || isIOS();

  // if (!shouldShowButton) return null;

  return (
    <div className={className}>
      <button
        onClick={onInstallClick}
        className="px-4 py-2 rounded-2xl bg-blue-600 text-white shadow hover:bg-blue-700 transition"
      >
        Install SmartSplit
      </button>

      {/* Simple iOS tip sheet */}
      {showIosHelp && (
        <div className="mt-3 p-3 rounded-xl bg-white border shadow text-sm text-gray-700">
          <p className="font-medium mb-1">Add to Home Screen on iPhone/iPad</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>
              Tap the <span className="font-semibold">Share</span> icon in
              Safari.
            </li>
            <li>
              Choose <span className="font-semibold">Add to Home Screen</span>.
            </li>
            <li>
              Tap <span className="font-semibold">Add</span>.
            </li>
          </ol>
          <button
            onClick={() => setShowIosHelp(false)}
            className="mt-2 underline text-blue-600"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
// import { useState, useEffect } from "react";
// import { Smartphone } from "lucide-react";
// export default function PwaInstallPrompt({ fixed = false }) {
//   const [deferred, setDeferred] = useState(null);
//   const [show, setShow] = useState(true);

//   useEffect(() => {
//     const handler = (e) => {
//       e.preventDefault();
//       setDeferred(e);
//       setShow(true);
//     };
//     window.addEventListener("beforeinstallprompt", handler);
//     return () => window.removeEventListener("beforeinstallprompt", handler);
//   }, []);

//   async function handleClick() {
//     if (!deferred) return;

//     deferred.prompt();
//     await deferred.userChoice;
//     setDeferred(null);
//     setShow(false);
//   }

//   if (!show) return null;

//   if (!fixed) {
//     return (
//       <button
//         onClick={handleClick}
//         className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//       >
//         <Smartphone className="w-4 h-4 mr-3" />
//         Install Mobile App
//       </button>
//     );
//   }

//   return (
//     <button
//       className="fixed bottom-4 left-4 rounded-2xl px-4 py-2 shadow bg-blue-600 text-white"
//       onClick={handleClick}
//     >
//       Install App
//     </button>
//   );

// }
