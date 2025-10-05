import React, { useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";

/**
 * Vertical timeline where:
 * - Content (header + body) can be on the LEFT or RIGHT (via `side` prop)
 * - A timeline DOT sits in the opposite column and is vertically centered with the HEADER
 * - The VERTICAL LINE starts at the first dot and ends at the last dot
 *
 * Props
 * ----
 * items: Array<{ id?: string | number, header: React.ReactNode, body?: React.ReactNode }>
 * className?: string (optional container className)
 * dotSize?: number (px)
 * side?: 'left' | 'right' (default 'left') – sets which side the CONTENT is on
 *
 * Example usage:
 *   const data = [
 *     { header: "Kickoff", body: "We met to outline goals and scope." },
 *     { header: "Design", body: "Wireframes, flows, and UI elements." },
 *     { header: "Build", body: "Implementation and integration." },
 *     { header: "Launch", body: "Ship it and iterate." },
 *   ];
 *   <TimelineLeft items={data} side="right" />  // content on RIGHT
 */

const steps = [
  {
    header: "Select people & split bill.",
    body: "Only you need an account. No need to hassle anyone to signup.",
  },
  {
    header: "Texts & emails sent.",
    body: "Email isn't enough. Splitify also uses text messages to send your requests - so you get paid faster.",
  },
  {
    header: "Follow-ups handled.",
    body: "Selected people will receive friendly text and email reminders until they complete their payments.",
  },
  {
    header: "Get paid.",
    body: `You choose how you want to get paid. 
No fees, no problem.`,
  },
  {
    header: "Repeats, automatically.",
    body: "Have bills that change? Connect your bank account and Splitify can update them with the latest cost.",
  },
];

export default function Steps({
  items = steps,
  className = "",
  dotSize = 14,
  side = "right",
}) {
  const containerRef = useRef(null);
  const headerRefs = useRef([]);
  const itemRefs = useRef([]);
  const [dotYs, setDotYs] = useState([]);
  const [visible, setVisible] = useState([]);

  const safeItems = Array.isArray(items) ? items : [];
  const isRight = side === "right";

  // Ensure refs/state array lengths track items length
  useMemo(() => {
    headerRefs.current = new Array(safeItems.length).fill(null);
    itemRefs.current = new Array(safeItems.length).fill(null);
    setVisible((prev) =>
      safeItems.map((_, i) => (typeof prev?.[i] === "boolean" ? prev[i] : false))
    );
  }, [safeItems.length]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const compute = () => {
      if (!containerRef.current) return;
      const containerTop =
        containerRef.current.getBoundingClientRect().top + window.scrollY;

      const ys = headerRefs.current.map((el) => {
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        const center =
          rect.top + window.scrollY + rect.height / 2 - containerTop;
        return Math.max(center, 0);
      });
      setDotYs(ys);
    };

    // Initial compute (twice: once immediately, once after layout settles)
    compute();
    const raf = requestAnimationFrame(compute);

    // Watch for resizes
    const ro = new ResizeObserver(() => compute());
    ro.observe(containerRef.current);
    headerRefs.current.forEach((el) => el && ro.observe(el));

    // Window resize
    window.addEventListener("resize", compute);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [safeItems.length]);

  // IntersectionObserver to reveal items on scroll
  useEffect(() => {
    if (!itemRefs.current?.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = itemRefs.current.indexOf(entry.target);
          if (idx === -1) return;
          if (entry.isIntersecting) {
            setVisible((v) => {
              if (v[idx]) return v;
              const next = [...v];
              next[idx] = true;
              return next;
            });
            // Reveal once; stop observing this item
            io.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.55,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [safeItems.length]);

  const hasLine = dotYs.length >= 2 && dotYs.every((y) => Number.isFinite(y));
  const firstY = hasLine ? dotYs[0] : 0;
  const lastY = hasLine ? dotYs[dotYs.length - 1] : 0;
  const lineHeight = hasLine ? Math.max(lastY - firstY, 0) : 0;

  const baseAnim =
"transition-[transform,opacity] duration-[1000ms] ease-out will-change-transform opacity-0 translate-x-8 transform-gpu"
  const shown = "opacity-100 translate-x-[-10]";

  return (
    <section
      ref={containerRef}
      className={[
       `relative w-full grid 
       gap-x-0 sm:gap-x-8
       `,
        // Tailwind sees both options statically
        isRight ? "grid-cols-[64px_1fr]" : "grid-cols-[1fr_64px]",
        className,
      ].join(" ")}
    >
      {/* When content is RIGHT, timeline column goes first; otherwise it's second */}
      {isRight ? (
        <>
          {/* LEFT column: timeline (dots + line) */}
          <div className="relative">
            {hasLine && (
              <div
                className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-[#316274]"
                style={{ top: firstY, height: lineHeight }}
                aria-hidden="true"
              />
            )}
            {dotYs.map((y, i) => (
              <div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#316274] shadow"
                style={{
                  top: y - dotSize / 2,
                  width: dotSize,
                  height: dotSize,
                }}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* RIGHT column: content */}
          <div className="flex flex-col">
            {safeItems.map((item, i) => (
              <article
                key={item?.id ?? i}
                ref={(el) => (itemRefs.current[i] = el)}
                className={`py-6 ${baseAnim} ${visible[i] ? shown : ""}`}
              >
                <h3 ref={(el) => (headerRefs.current[i] = el)} className="">
                  {item?.header}
                </h3>
                {item?.body ? <p className="mt-2">{item.body}</p> : null}
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* LEFT column: content */}
          <div className="flex flex-col">
            {safeItems.map((item, i) => (
              <article
                key={item?.id ?? i}
                ref={(el) => (itemRefs.current[i] = el)}
                className={`py-6 ${baseAnim} ${visible[i] ? shown : ""}`}
              >
                <h3 ref={(el) => (headerRefs.current[i] = el)} className="">
                  {item?.header}
                </h3>
                {item?.body ? <p className="mt-2">{item.body}</p> : null}
              </article>
            ))}
          </div>

          {/* RIGHT column: timeline (dots + line) */}
          <div className="relative">
            {hasLine && (
              <div
                className="absolute left-1/2 -translate-x-1/2 w-px bg-gray-300"
                style={{ top: firstY, height: lineHeight }}
                aria-hidden="true"
              />
            )}
            {dotYs.map((y, i) => (
              <div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 rounded-full ring-2 ring-white bg-blue-600 shadow"
                style={{
                  top: y - dotSize / 2,
                  width: dotSize,
                  height: dotSize,
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
