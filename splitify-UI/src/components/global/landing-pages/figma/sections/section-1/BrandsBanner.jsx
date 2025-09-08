// BrandsBanner.jsx
import { logos } from "./brandLogos";

export default function BrandsBanner({
  speed = 60,
  spacing = 16, // 👈 px — make smaller/greater to tighten/loosen
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
        className="group flex w-[200%] animate-marquee-ltr will-change-transform"
        style={{ animationDuration: `${speed}s` }}
      >
        <Row items={logos} spacing={spacing} />
        <Row items={logos} spacing={spacing} ariaHidden />
      </div>

      {/* Reduced motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-ltr { animation: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}

function Row({ items, spacing, ariaHidden = false }) {
  // We use per-item horizontal margins = spacing/2
  // and compute each cell width so the entire row is exactly 100% wide.
  // Math: total horizontal margins = items.length * spacing
  // basis = (100% - items*spacing) / items
  const cells = items.length;
  return (
    <ul
      className="flex w-full items-center py-12"
      aria-hidden={ariaHidden || undefined}
      style={
        {
          "--cells": cells,
          "--gap": `${spacing}px`,
          "--half-gap": `${spacing / 2}px`,
          "--cell-basis":
            `calc((100% - (var(--gap) * var(--cells))) / var(--cells))`,
        } 
      }
    >
      {items.map((item, i) => (
        <li
          key={i}
          className="
            flex items-center justify-center
            basis-[var(--cell-basis)]
            mx-[var(--half-gap)]
          "
        >
          <Brand item={item} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Brand renderer
 * - If your logos are React SVG components: pass the component
 * - If your logos are image URLs: pass strings
 * - If they’re JSX nodes: pass directly
 */
function Brand({ item }) {
  if (typeof item === "string") {
    // URL string → <img>
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
    // React component (e.g., imported SVG)
    const Logo = item;
    return <Logo className="h-6 md:h-7 lg:h-8" />;
  }
  // Already JSX?
  if (item && typeof item === "object" && item.type) return item;

  // Fallback: simple text label
  return (
    <span className="whitespace-nowrap text-[1.1rem] font-medium text-[#171717]">
      {String(item)}
    </span>
  );
}
