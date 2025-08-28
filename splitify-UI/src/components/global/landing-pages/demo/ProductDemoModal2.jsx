import React, { $1 } from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackCreateAccount } from "../../../../googleAnalytics/googleAnalyticsHelpers";
// Inline SVG icons (no external deps)

/**
 * Configurable Product Demo Modal
 * ------------------------------------------------------------
 * - Drop-in React component for product walkthroughs / image tours.
 * - Fully configurable via a `slides` array of objects (see example usage below).
 * - Keyboard navigation (←/→, ESC), click-drag/touch swipe, focus trap, and ARIA labels.
 * - TailwindCSS styling (no external UI lib required). Uses lucide-react for icons.
 * - Optional autoplay with pause/resume.
 * - Optional thumbnails and progress indicator.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - slides: Array<{
 *      image: string;           // Image URL
 *      alt?: string;            // Image alt text
 *      eyebrow?: string;        // Small label above title
 *      title?: string;          // Slide title
 *      text?: string;           // Body text
 *      bullets?: string[];      // Optional bullet points
 *      caption?: string;        // Small caption under image
 *      cta?: { label: string; href?: string; onClick?: () => void };
 *      bg?: string;             // Optional per-slide bg like 'bg-slate-50'
 *    }>
 *  - initialIndex?: number (default 0)
 *  - showThumbnails?: boolean (default true)
 *  - autoplay?: boolean (default false)
 *  - autoplayMs?: number (default 4500)
 *  - onLastSlideComplete?: () => void // fires when autoplay finishes last slide
 *
 * Example usage (place outside component, e.g., parent page):
 *
 * const demoSlides = [
 *   {
 *     image: "/images/demo-1.png",
 *     alt: "Dashboard overview",
 *     eyebrow: "Overview",
 *     title: "See all your shared costs in one place",
 *     text: "SmartSplit keeps balances, due dates, and nudges in sync so you don’t have to.",
 *     bullets: [
 *       "Automatic reminders via SMS & email",
 *       "Real-time status across participants",
 *       "Bank-level security",
 *     ],
 *     caption: "Mock data for illustration.",
 *     cta: { label: "Start Free", href: "/signup" },
 *     bg: "bg-white",
 *   },
 *   {
 *     image: "/images/demo-2.png",
 *     alt: "Request creation",
 *     eyebrow: "Create",
 *     title: "Set up a request in seconds",
 *     text: "Choose who pays what, set the frequency, and we’ll handle the follow‑ups.",
 *     bullets: ["Custom splits", "Recurring schedules", "Overdue escalation"],
 *     cta: { label: "Try It Now", href: "/app" },
 *     bg: "bg-slate-50",
 *   },
 *   {
 *     image: "/images/demo-3.png",
 *     alt: "Payment methods",
 *     eyebrow: "Pay",
 *     title: "Get paid your way",
 *     text: "Venmo, Cash App, PayPal, or card — we’ll record the history for you.",
 *     bullets: ["Multiple payment options", "Auto‑reconciliation", "Exportable history"],
 *     bg: "bg-white",
 *   },
 * ];
 *
 * function Page() {
 *   const [open, setOpen] = useState(false);
 *   return (
 *     <div>
 *       <button className="btn-primary" onClick={() => setOpen(true)}>Open Demo</button>
 *       <ProductDemoModal
 *         isOpen={open}
 *         onClose={() => setOpen(false)}
 *         slides={demoSlides}
 *         autoplay
 *         autoplayMs={5000}
 *         showThumbnails
 *       />
 *     </div>
 *   );
 * }
 */

function useBodyScrollLock(locked) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = locked ? "hidden" : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function ProductDemoModal({
  isOpen,
  onClose,
  slides,
  initialIndex = 0,
  showThumbnails = true,
  autoplay = false,
  autoplayMs = 4500,
  onLastSlideComplete,
}) {
  const [index, setIndex] = useState(
    clamp(initialIndex, 0, (slides?.length || 1) - 1)
  );
  const [isPlaying, setIsPlaying] = useState(Boolean(autoplay));
  const containerRef = useRef(null);
  const startX = useRef(0);
  const deltaX = useRef(0);
  const focusTrapRef = useRef(null);

  const navigate = useNavigate();

  const count = slides?.length || 0;

  useBodyScrollLock(isOpen);

  // Reset index when slides change or modal opens
  useEffect(() => {
    if (isOpen) setIndex(clamp(initialIndex, 0, count - 1));
  }, [isOpen, initialIndex, count]);

  // Keyboard handlers
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Autoplay
  useEffect(() => {
    if (!isOpen || !isPlaying || count <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => {
        const next = i + 1;
        if (next >= count) {
          clearInterval(id);
          setIsPlaying(false);
          onLastSlideComplete?.();
          return i; // stay on last
        }
        return next;
      });
    }, autoplayMs);
    return () => clearInterval(id);
  }, [isOpen, isPlaying, autoplayMs, count, onLastSlideComplete]);

  // Basic focus trap to keep keyboard focus inside when open
  useEffect(() => {
    if (!isOpen) return;
    const root = focusTrapRef.current;
    if (!root) return;
    const focusable = root.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function handleTab(e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    root.addEventListener("keydown", handleTab);
    // Move focus to modal
    setTimeout(() => first?.focus(), 0);
    return () => root.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen || !count) return null;

  const current = slides[index] || {};

  function goNext() {
    setIndex((i) => clamp(i + 1, 0, count - 1));
  }
  function goPrev() {
    setIndex((i) => clamp(i - 1, 0, count - 1));
  }
  function goTo(i) {
    setIndex(clamp(i, 0, count - 1));
  }

  // Touch/drag swiping
  function onPointerDown(e) {
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    startX.current = x;
    deltaX.current = 0;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }
  function onPointerMove(e) {
    const x = e.clientX;
    deltaX.current = x - startX.current;
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${deltaX.current}px)`;
    }
  }
  function onPointerUp() {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    const threshold = 80; // px
    if (Math.abs(deltaX.current) > threshold) {
      if (deltaX.current < 0) goNext();
      else goPrev();
    }
    if (containerRef.current) {
      containerRef.current.style.transform = "translateX(0)";
      containerRef.current.style.transition = "transform 150ms ease-out";
      setTimeout(() => {
        if (containerRef.current) containerRef.current.style.transition = "";
      }, 160);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product demo"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        ref={focusTrapRef}
        className={classNames(
          "relative z-10 w-full max-w-[150vh] mx-auto",
          "rounded-2xl shadow-2xl border border-black/10",
          "bg-white overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="text-xs uppercase tracking-wider text-gray-500">
              {current.eyebrow || "Demo"}
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-300" />
            <div className="text-sm text-gray-600">
              {index + 1} / {count}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {autoplay && (
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
              >
                {isPlaying ? <Pause /> : <Play />}
                <span className="hidden sm:inline">
                  {isPlaying ? "Pause" : "Play"}
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close"
              autoFocus
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={classNames(
            "grid md:grid-cols-2",
            current.bg || "bg-white"
          )}
          onPointerDown={onPointerDown}
          onTouchStart={onPointerDown}
        >
          {/* Visual */}
          <div className="relative min-h-[280px] md:min-h-[420px] p-4 px-10 flex items-center justify-center">
            <div ref={containerRef} className="w-full will-change-transform">
              <img
                src={current.image}
                alt={current.alt || current.title || "Demo slide"}
                className="w-full h-auto rounded-xl shadow-md max-h-[500px] object-contain"
                draggable={false}
              />
              {current.caption && (
                <p className="mt-2 text-center text-xs text-gray-500">
                  {current.caption}
                </p>
              )}
            </div>

            {/* Prev / Next (overlay) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-2">
              <button
                onClick={goPrev}
                className="pointer-events-auto rounded-full bg-white/90 hover:bg-white p-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Previous slide"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={goNext}
                className="pointer-events-auto rounded-full bg-white/90 hover:bg-white p-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Next slide"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          {/* Text */}
          <div className="p-6 md:p-8 flex flex-col">
            {current.eyebrow && (
              <div className="text-xs font-medium uppercase tracking-wider text-blue-600 mb-2">
                {current.eyebrow}
              </div>
            )}
            {current.title && (
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                {current.title}
              </h3>
            )}
            {current.text && (
              <p className="mt-3 text-gray-600 leading-relaxed">
                {current.text}
              </p>
            )}

            {Array.isArray(current.bullets) && current.bullets.length > 0 && (
              <ul className="mt-4 space-y-2 text-gray-700">
                {current.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {current.cta && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    trackCreateAccount();
                    navigate("/signup");
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white px-4 py-2.5 font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {current.cta.label}
                </button>
              </div>
            )}

            {/* Dots */}
            <div className="mt-auto pt-6">
              <nav className="flex items-center gap-2" aria-label="Slides">
                {Array.from({ length: count }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={classNames(
                      "h-2.5 rounded-full transition-all",
                      i === index
                        ? "w-6 bg-blue-600"
                        : "w-2.5 bg-gray-300 hover:bg-gray-400"
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {showThumbnails && count > 1 && (
          <div className="px-4 py-3 border-t bg-white">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={classNames(
                    "m-[2px] shrink-0 w-20 h-14 rounded-lg overflow-hidden border",
                    i === index
                      ? "outline outline-2 outline-blue-600 border-transparent"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  aria-label={`Thumbnail ${i + 1}`}
                >
                  <img
                    src={s.image}
                    alt={s.alt || s.title || `Slide ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Optional: small helper button style if you want to copy-paste into your project
// .btn-primary { @apply inline-flex items-center justify-center rounded-xl bg-blue-600 text-white px-4 py-2.5 font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500; }
