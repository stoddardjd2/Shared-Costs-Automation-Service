// Carousel.jsx (no TypeScript, no deps)
// Usage:
// <Carousel gap="1rem" slidesPerView={{ 0: 1, 640: 2, 1024: 3 }}>...</Carousel>

import { useEffect, useRef, useState, useCallback } from "react";

export default function Carousel({
  children,
  loop = true,
  autoPlay = false,
  interval = 4500,
  showIndicators = true,
  showArrows = true,
  slidesPerView = 1,
  gap = "0px",             // NEW: configurable gap between slides
  className = "",
  ariaLabel = "Carousel",
}) {
  const items = Array.isArray(children) ? children : [children].filter(Boolean);
  const count = items.length;

  // Responsive slidesPerView
  const resolveSPV = () => {
    if (typeof slidesPerView === "number") return Math.max(1, slidesPerView);
    const entries = Object.entries(slidesPerView || {})
      .map(([k, v]) => [parseInt(k, 10) || 0, Math.max(1, Number(v) || 1)])
      .sort((a, b) => a[0] - b[0]);
    const w = typeof window !== "undefined" ? window.innerWidth : 1920;
    let current = 1;
    for (const [min, val] of entries) {
      if (w >= min) current = val;
      else break;
    }
    return current;
  };

  const [spv, setSpv] = useState(resolveSPV);
  const pages = Math.max(1, Math.ceil(count / spv));
  const [index, setIndex] = useState(0);
  const [isAuto, setIsAuto] = useState(autoPlay);

  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isPointerDown = useRef(false);

  const clamp = (i) => Math.max(0, Math.min(i, pages - 1));
  const mod = (i) => ((i % pages) + pages) % pages;

  const goTo = useCallback(
    (i) => setIndex(() => (loop ? mod(i) : clamp(i))),
    [loop, pages]
  );

  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  // Recompute on resize
  useEffect(() => {
    const onResize = () => setSpv(resolveSPV());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [slidesPerView]);

  useEffect(() => setIndex((i) => clamp(i)), [spv, pages]);

  // Autoplay
  useEffect(() => {
    if (!isAuto || pages <= 1) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (loop ? mod(i + 1) : clamp(i + 1)));
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [isAuto, interval, loop, pages]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Pause on hover
  const onMouseEnter = () => setIsAuto(false);
  const onMouseLeave = () => autoPlay && setIsAuto(true);

  // Touch/drag
  const onPointerDown = (e) => {
    isPointerDown.current = true;
    touchStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    touchDeltaX.current = 0;
  };
  const onPointerMove = (e) => {
    if (!isPointerDown.current) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    touchDeltaX.current = x - touchStartX.current;
  };
  const onPointerUp = () => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    const threshold = 48;
    if (touchDeltaX.current > threshold) prev();
    else if (touchDeltaX.current < -threshold) next();
    touchDeltaX.current = 0;
  };

  // Slide sizing with gap: total track width must account for gaps between slides
  const slideBasis = `calc(${100 / spv}% - (${gap} * ${(spv - 1) / spv}))`;
  const translate = `translateX(-${index * 100}%)`;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={`relative select-none ${className}`}
    >
      {/* Track */}
      <div
        className="overflow-hidden rounded-2xl bg-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/30 shadow-sm"
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => {
          onMouseLeave();
          if (isPointerDown.current) onPointerUp();
        }}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        onMouseDown={(e) => {
          e.preventDefault();
          onPointerDown(e);
        }}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
      >
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: translate, gap }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`Item ${i + 1} of ${count}`}
              className="shrink-0"
              style={{ flexBasis: slideBasis }}
            >
              <div className="h-full w-full">{child}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {showArrows && pages > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white p-2 shadow-md ring-1 ring-black/10"
            disabled={!loop && index === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white p-2 shadow-md ring-1 ring-black/10"
            disabled={!loop && index === pages - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicators + autoplay toggle */}
      <div className="mt-3 flex items-center justify-center gap-3">
        {showIndicators && pages > 1 && (
          <div className="flex items-center gap-2">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                aria-label={`Go to page ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-gray-900" : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
        <div className="mx-2 h-4 w-px bg-gray-200" />
        <button
          type="button"
          onClick={() => setIsAuto((s) => !s)}
          className="text-xs rounded-full px-3 py-1 ring-1 ring-gray-300 bg-white hover:bg-gray-50 shadow-sm"
          aria-pressed={isAuto}
          disabled={pages <= 1}
        >
          {isAuto ? "Pause" : "Autoplay"}
        </button>
        <div className="mx-2 h-4 w-px bg-gray-200" />
        <span className="text-[11px] text-gray-500">
          {loop ? "Loop: on" : "Loop: off"} · {spv} per view
        </span>
      </div>
    </section>
  );
}
