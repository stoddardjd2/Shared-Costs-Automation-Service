// PlaidConnectBanner.jsx
import React, { useEffect, useState } from "react";
import { Landmark, Link as LinkIcon } from "lucide-react";

export default function PlaidConnectBanner({
  handleConnect,
  loading,
  alwaysShowBanner = true,
}) {
  const [isHidden, setIsHidden] = useState(() =>
    JSON.parse(localStorage.getItem("hidePlaidConnect") || "false")
  );

  function handleClose() {
    setIsHidden(true);
    localStorage.setItem("hidePlaidConnect", "true");
  }

  function reopen() {
    setIsHidden(false);
    localStorage.setItem("hidePlaidConnect", "false");
  }

  // Collapsed mini-CTA when hidden
  if (isHidden && !alwaysShowBanner) {
    return (
      <div className="relative mb-6">
        {/* <button
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-none text-white w-8 h-8 rounded-lg cursor-pointer text-base transition-all duration-200 z-[3]"
          title="Show banner"
          onClick={reopen}
        >
          ×
        </button> */}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleConnect}
            className="bg-gradient-to-br from-blue-600 to-blue-700 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-md translate-y-0 hover:-translate-y-0.5 shadow-none hover:shadow-lg hover:shadow-black/10"
            disabled={loading}
          >
            <LinkIcon className="w-6 h-6" />
            <span>Find charges with Plaid</span>
          </button>
        </div>
      </div>
    );
  }

  // Full banner
  return (
    <div className="bg-slate-50 rounded-2xl p-1 mb-6">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white overflow-hidden shadow-[0_10px_25px_rgba(37,99,235,0.2)] mx-auto">
        {!alwaysShowBanner && (
          <button
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-none text-white w-8 h-8 rounded-lg cursor-pointer text-base transition-all duration-200 z-[3]"
            title="Dismiss"
            onClick={handleClose}
          >
            ×
          </button>
        )}

        <div className="relative z-[2]">
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 mt-2 flex  flex-shrink-0 bg-white/20 rounded-xl items-center justify-center backdrop-blur-md">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl max-w-[230px] mx-auto font-bold white text-center mb-2">
                Splitting a utility or variable bill?
              </div>
              <div className="text-base opacity-90 leading-relaxed text-center">
                {" "}
                Connect your bank so Splitify can keep your repeating requests
                updated with the latest amount.{" "}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={handleConnect}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-md translate-y-0 hover:-translate-y-0.5 shadow-none hover:shadow-lg hover:shadow-black/10"
              disabled={loading}
            >
              {/* <LinkIcon className="w-6 h-6" /> */}
              <span>Connect Bank</span>
            </button>
          </div>
          <div class="mt-3 text-xs text-white/60 text-center">
           *Securely connected with Plaid. Splitify never sees or stores your
            bank login.
          </div>
        </div>
      </div>
    </div>
  );
}
