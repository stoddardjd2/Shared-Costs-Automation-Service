import React, { useState, useEffect, useRef } from "react";
import SmartSplitLogo from "../../../../../assets/SmartSplitLogo.svg?react";
import { useNavigate } from "react-router-dom";
import { trackCreateAccount } from "../../../../../googleAnalytics/googleAnalyticsHelpers";
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(false);
  const fadeTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = (event) => {
      const scrollThreshold = 50;

      const windowScroll = window.scrollY || window.pageYOffset;
      const rootEl = document.getElementById("root");
      const rootScroll = rootEl ? rootEl.scrollTop : 0;
      const currentScrollY =
        windowScroll || rootScroll || event?.target?.scrollTop || 0;

      const shouldScroll = currentScrollY > scrollThreshold;
      setIsScrolled(shouldScroll);

      // Always clear pending fade-in timer
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }

      if (shouldScroll) {
        // Delay border appearance to line up with bg transition
        fadeTimerRef.current = setTimeout(() => {
          setTransitionComplete(true);
          fadeTimerRef.current = null;
        }, 250);
      } else {
        // Instantly remove border when at the top
        setTransitionComplete(false);
      }
    };

    let ticking = false;
    const scrollListener = (event) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll(event);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Listen to multiple scroll sources
    window.addEventListener("scroll", scrollListener, { passive: true });

    const rootEl = document.getElementById("root");
    if (rootEl) {
      rootEl.addEventListener("scroll", scrollListener, { passive: true });
    }
    document.addEventListener("scroll", scrollListener, { passive: true });

    // Initial position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", scrollListener);
      if (rootEl) rootEl.removeEventListener("scroll", scrollListener);
      document.removeEventListener("scroll", scrollListener);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const rootEl = document.getElementById("root");
    if (rootEl) rootEl.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <>
      <style>{`
        /* Scrolled background */
        .scrolled-gradient {
          background: radial-gradient(62.5% 175.13% at 97.01% 48.68%, #075C7B 31.33%, #022B3A 71.02%, #0C0C0C 100%);
        }

        /* One-way border fade-in using a pseudo element */
        .border-overlay {
          position: relative;
        }
        .border-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: inherit;
          opacity: 0; /* default hidden */
          pointer-events: none;
          /* No transition here so it snaps off instantly when class is removed */
          will-change: opacity;
        }
        .border-overlay.show-border::before {
          opacity: 1;
          animation: borderFadeIn 0.3s ease-out 0.25s both;
        }
        @keyframes borderFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Prefer reduced motion: remove long transitions/animations */
        @media (prefers-reduced-motion: reduce) {
          .nav-animate { transition: none !important; }
          .border-overlay.show-border::before { animation: none !important; opacity: 1 !important; }
        }

        /* iOS safe-area top padding helper for fixed bars */
        .safe-top {
          padding-top: env(safe-area-inset-top, 0px);
        }
      `}</style>

      <div className="relative">
        <nav
          className={`fixed top-2 left-0 right-0 z-50 nav-animate transition-all duration-500 ease-out safe-top ${
            isScrolled ? "py-2.5 sm:py-4 px-3 sm:px-5" : "py-2.5 sm:py-5"
          }`}
        >
          <div
            className={`nav-animate transition-all duration-500 ease-out border-overlay ${
              isScrolled
                ? `scrolled-gradient rounded-2xl px-3 sm:px-8 py-2 sm:py-4 shadow-2xl shadow-black/50 backdrop-blur-md ${
                    transitionComplete ? "show-border" : ""
                  }`
                : "px-3 sm:px-6 bg-transparent"
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Brand */}
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
                aria-label="Go to top"
              >
                <SmartSplitLogo className="w-9 h-9 sm:w-[45px] sm:h-[45px] shrink-0" />
                <span className="font-semibold leading-none text-white text-lg sm:text-2xl">
                  Splitify
                </span>
              </button>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Hide Login on very small screens to keep it clean */}
                <button
                  onClick={() => {
                    navigate("/login");
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-transform duration-300 hover:-translate-y-0.5 text-sm border-2 ${
                    isScrolled
                      ? `${
                          transitionComplete
                            ? "border-white/0 hover:border-white/80"
                            : "border-transparent"
                        } text-white hover:bg-white/10`
                      : "border-white/0 text-white hover:bg-black/5"
                  }`}
                >
                  <span className="inline sm:text-[1rem]">Login</span>
                </button>

                <button
                  className={`px-3 sm:px-7 py-2 sm:py-3 rounded-lg text-white font-semibold transition-transform duration-300 hover:-translate-y-0.5 text-sm sm:text-base shadow-md ${
                    isScrolled ? "bg-blue-600" : "bg-white/[8%]"
                  }`}
                  onClick={() => {
                    navigate("/signup");
                    trackCreateAccount("landing-navbar-CTA");
                  }}
                >
                  <span className="hidden sm:inline">
                    Create Your Free Account
                  </span>
                  <span className="sm:hidden">Sign up free</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
