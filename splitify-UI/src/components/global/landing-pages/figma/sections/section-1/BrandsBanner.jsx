// BrandsBanner.jsx
import { logos } from "./brandLogos";

export default function BrandsBanner({
  speed = 20,
  spacing = 16, 
  direction = "rtl", //"ltr" or "rtl"
  className = "",
}) {
  return (
    <div
      className={`relative overflow-hidden w-full ${className}`}
      aria-label="Trusted brands"
    >
      {/* Edge fade */}
      <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" />

      {/* Track: two rows back-to-back (200% width) */}
      <div
        className={`group flex w-[200%] ${
          direction === "rtl" ? "animate-marquee-rtl" : "animate-marquee-ltr"
        } will-change-transform`}
        style={{ animationDuration: `${speed}s` }}
      >
        <Row items={logos} spacing={spacing} />
        <Row items={logos} spacing={spacing} ariaHidden />
      </div>

      {/* Reduced motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-ltr,
          .animate-marquee-rtl {
            animation: none !important;
            transform: none !important;
          }
        }

        /* Keyframes */
        @keyframes marquee-ltr {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes marquee-rtl {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee-ltr {
          animation: marquee-ltr linear infinite;
        }
        .animate-marquee-rtl {
          animation: marquee-rtl linear infinite;
        }
      `}</style>
    </div>
  );
}

function Row({ items, spacing, ariaHidden = false }) {
  const cells = items.length;
  return (
    <ul
      className="flex w-full items-center py-12 sm:py-12"
      aria-hidden={ariaHidden || undefined}
      style={{
        "--cells": cells,
        "--gap": `${spacing}px`,
        "--half-gap": `${spacing / 2}px`,
        "--cell-basis": `calc((100% - (var(--gap) * var(--cells))) / var(--cells))`,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-center justify-center basis-[var(--cell-basis)] mx-[var(--half-gap)]"
        >
          <Brand item={item} />
        </li>
      ))}
    </ul>
  );
}

function Brand({ item }) {
  if (typeof item === "string") {
    return (
      <img
        src={item}
        alt="Brand"
        className="h-6 md:h-7 lg:h-8 object-contain"
        draggable={false}
      />
    );
  }
  if (typeof item === "function") {
    const Logo = item;
    return <Logo className="h-6 md:h-7 lg:h-8" />;
  }
  if (item && typeof item === "object" && item.type) return item;

  return (
    <span className="whitespace-nowrap text-[1.1rem] font-medium text-[#171717]">
      {String(item)}
    </span>
  );
}
