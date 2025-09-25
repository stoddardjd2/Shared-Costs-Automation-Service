import { logos } from "../sections/section-1/brandLogos";

export default function BrandsBanner({
  speed = 300,
  spacing = 90,
  direction = "rtl", //"ltr" or "rtl"
  className = "",
}) {
  // Duplicate logos to ensure smooth loop
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div
      className={`relative overflow-hidden  w-full ${className}`}
      aria-label="Trusted brands"
    >
      {/* Edge fade */}
      <div className="pointer-events-none absolute inset-0 z-10 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" />

      {/* Marquee wrapper */}
      <div className="marquee-wrapper">
        <div
          className={`marquee-content ${
            direction === "rtl" ? "marquee-rtl" : "marquee-ltr"
          }`}
          style={{
            "--duration": `${speed}s`,
            "--spacing": `${spacing}px`,
          }}
        >
          {/* First set */}   
          <div className="marquee-group">
            {duplicatedLogos.map((item, i) => (
              <div
                key={`first-${i}`}
                className="marquee-item h-8 md:h-9 lg:h-10"
              >
                <Brand item={item} />
              </div>
            ))}
          </div>

          {/* Spacer between groups */}
          <div style={{ width: `${spacing}px`, flexShrink: 0 }} />

          {/* Duplicate set for seamless loop */}
          <div className="marquee-group" aria-hidden="true">
            {duplicatedLogos.map((item, i) => (
              <div
                key={`second-${i}`}
                className="marquee-item h-8 md:h-9 lg:h-10"
              >
                <Brand item={item} />
              </div>
            ))}
          </div>
          <div style={{ width: `${spacing}px`, flexShrink: 0 }} />

          {/* Duplicate set for seamless loop */}
          <div className="marquee-group" aria-hidden="true">
            {duplicatedLogos.map((item, i) => (
              <div
                key={`second-${i}`}
                className="marquee-item h-8 md:h-9 lg:h-10"
              >
                <Brand item={item} />
              </div>
            ))}
          </div>
          <div style={{ width: `${spacing}px`, flexShrink: 0 }} />

          {/* Duplicate set for seamless loop */}
          <div className="marquee-group" aria-hidden="true">
            {duplicatedLogos.map((item, i) => (
              <div
                key={`second-${i}`}
                className="marquee-item h-8 md:h-9 lg:h-10"
              >
                <Brand item={item} />
              </div>
            ))}
          </div>
          <div style={{ width: `${spacing}px`, flexShrink: 0 }} />

          {/* Duplicate set for seamless loop */}
          <div className="marquee-group" aria-hidden="true">
            {duplicatedLogos.map((item, i) => (
              <div
                key={`second-${i}`}
                className="marquee-item h-8 md:h-9 lg:h-10"
              >
                <Brand item={item} />
              </div>
            ))}
          </div>
          <div style={{ width: `${spacing}px`, flexShrink: 0 }} />

          {/* Duplicate set for seamless loop */}
          <div className="marquee-group" aria-hidden="true">
            {duplicatedLogos.map((item, i) => (
              <div
                key={`second-${i}`}
                className="marquee-item h-8 md:h-9 lg:h-10"
              >
                <Brand item={item} />
              </div>
            ))}
          </div>
          <div style={{ width: `${spacing}px`, flexShrink: 0 }} />

          {/* Duplicate set for seamless loop */}
          <div className="marquee-group" aria-hidden="true">
            {duplicatedLogos.map((item, i) => (
              <div
                key={`second-${i}`}
                className="marquee-item h-8 md:h-9 lg:h-10"
              >
                <Brand item={item} />
              </div>
            ))}
          </div>
          <div style={{ width: `${spacing}px`, flexShrink: 0 }} />

          {/* Duplicate set for seamless loop */}
          <div className="marquee-group" aria-hidden="true">
            {duplicatedLogos.map((item, i) => (
              <div
                key={`second-${i}`}
                className="marquee-item h-8 md:h-9 lg:h-10"
              >
                <Brand item={item} />
              </div>
            ))}
          </div>
          <div style={{ width: `${spacing}px`, flexShrink: 0 }} />

          {/* Duplicate set for seamless loop */}
          <div className="marquee-group" aria-hidden="true">
            {duplicatedLogos.map((item, i) => (
              <div
                key={`second-${i}`}
                className="marquee-item h-8 md:h-9 lg:h-10"
              >
                <Brand item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`

@media (max-width: 480px) {
 .marquee-group {
          padding-bottom: 1rem !important;
        }
      }

        .marquee-wrapper {
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        
        .marquee-content {
          display: flex;
          animation: var(--animation) var(--duration) linear infinite;
        }
        
        .marquee-group {
          display: flex;
          align-items: center;
          gap: var(--spacing);
          padding: 3rem 0;
          white-space: nowrap;
          flex-shrink: 0;
        }
        

        .marquee-item {
          flex-shrink: 0;
        }
        
        .marquee-rtl {
          --animation: scroll-rtl;
        }
        
        .marquee-ltr {
          --animation: scroll-ltr;
        }
        
        @keyframes scroll-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scroll-ltr {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .marquee-content {
            animation-play-state: paused;
          }
        }
      `}</style>
    </div>
  );
}

function Brand({ item }) {
  if (typeof item === "string") {
    return (
      <img
        src={item}
        alt="Brand"
        className="h-6 !min-w-10 md:h-7 lg:h-8 w-auto object-contain"
        draggable={false}
      />
    );
  }
  if (typeof item === "function") {
    const Logo = item;
    return <Logo className="block h-full w-auto max-h-full max-w-full" />;
  }
  if (item && typeof item === "object" && item.type) return item;

  return (
    <span className="whitespace-nowrap !min-w-10 text-[1.1rem] font-medium text-[#171717]">
      {String(item)}
    </span>
  );
}
