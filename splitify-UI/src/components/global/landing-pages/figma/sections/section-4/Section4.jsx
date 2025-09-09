import Layout from "../../builders/Layout";
import CtaBtn from "../../builders/CtaBtn";
import { useEffect, useRef, useLayoutEffect, useState } from "react";
import FixedBackgroundSection from "./FixedBackgroundSection.jsx";
import View from "./View.jsx";
import { features1, features2, features3 } from "./features.jsx";
import HistoryImg from "./history-demo-phone.png";
import DashboardImg from "./dashboard-demo-phone.png";
import SplitImg from "./split-demo-phone.png";
import Footer from "../../builders/Footer.jsx";

/**
 * ScrollScale (smooth)
 * - No fade; always visible.
 * - Scales based on distance from the VIEWPORT center (stable target).
 * - Smooths changes over time using an exponential low-pass filter.
 *
 * Props:
 *  - containerRef: kept for API parity (not required when using viewport center)
 *  - minScale: scale at edges
 *  - maxScale: peak scale at center
 *  - falloff: fraction of viewport height where scale reaches ~min
 *  - smoothMs: time constant (ms) for smoothing; lower = snappier, higher = smoother
 *  - power: curve shaping; 1 = linear, 2 = ease-in at edges, 0.6 = softer
 */
/**
 * ScrollScale (no initial jump)
 * - Initializes at minScale before first paint (useLayoutEffect).
 * - Stays at minScale when off-screen.
 * - Smoothly interpolates toward target while visible.
 */
function ScrollScale({
  children,
  className = "",
  containerRef, // kept for API compatibility
  minScaleDefault = 0.6,
  maxScale = 1,
  falloff = 0.6,
  smoothMs = 120,
  powerDefault = 5.0,
}) {
  const [power, setPower] = useState(powerDefault);
  const [minScale, setMinScale] = useState(minScaleDefault);

  const ref = useRef(null);
  const rafRef = useRef(0);
  const activeRef = useRef(false);

  const animScaleRef = useRef(minScale);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    // Tailwind `sm` = 640px
    const mediaQuery = window.matchMedia("(min-width: 640px)");

    // Handler for changes
    const handleChange = (e) => {
      if (e.matches) {
        setPower(powerDefault); // screen >= sm
        setMinScale(minScaleDefault);
      } else {
        setPower(20); // screen < sm
        setMinScale(0.9);
      }
    };

    // Run it once on mount
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Set minScale BEFORE first paint to avoid any jump from 1 -> min
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    const initial = prefersReduced ? 1 : minScale;
    animScaleRef.current = initial;
    el.style.transform = `translateZ(0) scale(${initial})`;
  }, [minScale]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReduced) {
      animScaleRef.current = 1;
      el.style.transform = "translateZ(0) scale(1)";
      return;
    }

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const computeTargetScale = () => {
      const rect = el.getBoundingClientRect();
      const viewportH =
        window.innerHeight || document.documentElement.clientHeight;
      const vpCenter = viewportH / 2;
      const elCenter = rect.top + rect.height / 2;
      const dist = Math.abs(elCenter - vpCenter);
      const radius = Math.max(1, viewportH * falloff);
      let t = Math.min(1, dist / radius); // 0 @ center → 1 at/after radius
      if (power !== 1) t = Math.pow(t, power);
      const s = maxScale - (maxScale - minScale) * t;
      return clamp(s, minScale, maxScale);
    };

    const update = (now) => {
      const dt = Math.max(0, now - lastTimeRef.current);
      lastTimeRef.current = now;

      const target = computeTargetScale();
      const alpha = 1 - Math.exp(-(dt / Math.max(1, smoothMs))); // time-based smoothing
      animScaleRef.current += (target - animScaleRef.current) * alpha;

      el.style.transform = `translateZ(0) scale(${animScaleRef.current})`;
      rafRef.current = requestAnimationFrame(update);
    };

    const start = () => {
      if (rafRef.current) return;
      // Start from current (already minScale from layout effect) → no pop
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(update);
    };

    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      // Ensure off-screen stays at minScale (no jump on next entry)
      animScaleRef.current = minScale;
      el.style.transform = `translateZ(0) scale(${minScale})`;
    };

    // IO gates the loop; math uses viewport center so it’s robust
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !activeRef.current) {
          activeRef.current = true;
          start();
        } else if (!entry.isIntersecting && activeRef.current) {
          activeRef.current = false;
          stop();
        }
      },
      { threshold: 0 }
    );

    io.observe(el);

    const onResize = () => {
      // snap to correct target immediately on resize to avoid flicker
      const s = computeTargetScale();
      animScaleRef.current = s;
      el.style.transform = `translateZ(0) scale(${s})`;
    };
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      stop();
    };
  }, [minScale, maxScale, falloff, smoothMs, power]);

  return (
    <div
      ref={ref}
      className={`will-change-transform transform-gpu ${className}`}
      // Set initial style to minScale to avoid any FOUC/pop before effects run
      style={{ transform: `translateZ(0) scale(${minScale})` }}
    >
      {children}
    </div>
  );
}

export default function Section4() {
  const gridRef = useRef(null);

  return (
    <section className={`shadow-[0_-10px_30px_rgba(0,0,0,0.25)]`}>
      <FixedBackgroundSection>
        <Layout>
          <div className="col-span-12 rounded-xl">
            <div className="w-9/12 text-center mx-auto">
              <h2 className="mb-[20px] text-white">
                Designed to{" "}
                <span className="gradient-text brightness-[1.6]">
                  save your time.
                </span>
              </h2>
              <p className="w-5/6 mx-auto text-white">
                Splitify makes managing group bills easy. Scroll to see how.
              </p>
            </div>
          </div>

          <div
            ref={gridRef}
            className="mt-10 sm:mt-20 sm:my-40 col-span-12 grid grid-cols-12 gap-y-[0px] sm:gap-y-[270px]"
          >
            <ScrollScale className="col-span-12" containerRef={gridRef}>
              <View
                image={DashboardImg}
                features={features1}
                header={"View all your bills in one place."}
                body={
                  "Get alerted when you have overdue payments, view request details, and send new requests - all in one place."
                }
              />
            </ScrollScale>

            <ScrollScale className="col-span-12" containerRef={gridRef}>
              <View
                image={HistoryImg}
                features={features2}
                header={"View payment history & manage your requests."}
                body={
                  "View all payment requests, mark requests as paid, and adjust request details."
                }
              />
            </ScrollScale>

            <ScrollScale className="col-span-12" containerRef={gridRef}>
              <View
                image={SplitImg}
                features={features3}
                header={"Split bills & send requests in seconds."}
                body={
                  "Splitify makes it easy to split bills by automatically calculating costs per person."
                }
              />
            </ScrollScale>

            <ScrollScale
              className="my-[150px] col-span-12"
              containerRef={gridRef}
            >
              <div className="col-span-12 mx-auto text-center">
                <h1 className="flex flex-col mb-[23px] text-white">
                  <span>Less Stress.</span>
                  <span>More Time.</span>
                  <span>Start For Free.</span>
                </h1>
                <p className="text-[#EAEAEA]">
                  Say goodbye to being the group bill manager.
                </p>
                <CtaBtn text={"Sign Up Free"} className={"mx-auto"} />
              </div>
            </ScrollScale>
          </div>
        </Layout>
        <Footer />
      </FixedBackgroundSection>
    </section>
  );
}
