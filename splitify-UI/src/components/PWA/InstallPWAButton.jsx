import React from "react";
import usePWAInstall from "./usePWAInstall";

export default function InstallPWAButton() {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();

  if (isInstalled) return null;

  // iOS: show helper UI because no programmatic prompt exists
  if (isIOS) {
    return (
      <button
        onClick={() => alert("To install: tap the Share icon, then 'Add to Home Screen'.")}
        className="px-4 py-2 rounded-2xl bg-black text-white hover:opacity-90"
      >
        How to install on iOS
      </button>
    );
  }

  // Chromium: show real install button if available
  if (canInstall) {
    return (
      <button
        onClick={async () => {
          const res = await promptInstall();
          console.log("Install choice:", res);
        }}
        className="px-4 py-2 rounded-2xl bg-black text-white hover:opacity-90"
      >
        Install app
      </button>
    );
  }

  // Nothing to show (either unsupported or not yet eligible)
  return null;
}
