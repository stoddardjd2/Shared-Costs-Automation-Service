export default function ScrollScale({
  children,
  className = "",
  containerRef,
  minScale = 0.92,
  maxScale = 1.06,
  falloff = 0.55,
}) {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    const container = containerRef?.current;
    if (!el || !container) return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReduced) {
      el.style.transform = "translateZ(0) scale(1)";
      return;
    }

    const update = () => {
      if (!el || !container) return;

      const rect = el.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();

      // Center lines (in viewport coordinates)
      const elCenter = rect.top + rect.height / 2;
      const containerCenter = cRect.top + cRect.height / 2;

      const dist = Math.abs(elCenter - containerCenter);
      const radius = Math.max(1, cRect.height * falloff); // scale falloff range
      const t = Math.min(1, dist / radius); // 0..1
      const scale = maxScale - (maxScale - minScale) * t;

      el.style.transform = `translateZ(0) scale(${scale.toFixed(4)})`;
    };

    const loop = () => {
      update();
      rafRef.current = requestAnimationFrame(loop);
    };

    // Use IO only to start/stop the loop when off-screen
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !activeRef.current) {
          activeRef.current = true;
          if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && activeRef.current) {
          activeRef.current = false;
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
          }
        }
      },
      { threshold: 0 } // consider visible as soon as it touches the viewport
    );

    io.observe(el);

    // Initial position before first loop tick
    update();

    const onResize = () => update();
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [containerRef, minScale, maxScale, falloff]);

  return (
    <div
      ref={ref}
      className={`will-change-transform transform-gpu ${className}`}
      style={{ transform: "translateZ(0) scale(1)" }}
    >
      {children}
    </div>
  );
}
