import React from "react";
import { Rocket } from "lucide-react";

/**
 * RocketTakeoff
 * ---------------------------------------------------
 * Props:
 * - play (bool): start animation (default true)
 * - loop (bool): repeat animation (default false)
 * - size (number): icon size in px (default 56)
 * - color (string): icon stroke color (default '#2563EB')
 * - duration (number): ms for the main takeoff (default 1200)
 * - delay (number): ms before starting (default 0)
 * - distance (number): travel distance in px (default 320)
 * - tiltStart (number): initial tilt in degrees (default -12)
 * - className (string): extra classes for outer wrapper
 * - onEnd (fn): callback when main takeoff animation ends
 */
export default function RocketTakeoff({
  play = true,
  loop = false,
  size = 56,
  color = "#ffffff",
  duration = 1200,
  delay = 0,
  distance = 320,
  tiltStart = -12,
  className = "",
  onEnd,
}) {
  const animationStyle = play
    ? {
        animation: `rocket-takeoff-up var(--rocket-duration) ease-in var(--rocket-delay) ${loop ? "infinite" : "forwards"}`,
      }
    : { animation: "none" };

  return (
    <div
      className={`rocket-takeoff-root relative inline-block overflow-visible pointer-events-none ${className}`}
      style={{
        // CSS variables to control the animation without editing CSS:
        ["--rocket-duration"]: `${duration}ms`,
        ["--rocket-delay"]: `${delay}ms`,
        ["--distance"]: `${distance}px`,
        ["--tilt-start"]: `${tiltStart}deg`,
      }}
      aria-hidden="true"
      role="img"
    >
      {/* Local CSS so this file is fully drop-in */}
      <style>{`
        .rocket-icon {
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          transform-origin: center;
          will-change: transform;
          filter: drop-shadow(0 6px 10px rgba(0,0,0,0.35));
        }

        .rocket-flame {
          position: absolute;
          left: 50%;
          bottom: -8px;
          width: 10px;
          height: 18px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: radial-gradient(50% 60% at 50% 20%, #fff 0%, #ffd178 30%, #ff7a00 65%, rgba(255,122,0,0) 100%);
          filter: blur(0.3px);
          opacity: 0.95;
          animation: rocket-flame-flicker 280ms ease-in-out infinite;
          transform-origin: top center;
          pointer-events: none;
        }

        .rocket-trail {
          position: absolute;
          left: 50%;
          bottom: -6px;
          width: 4px;
          height: 60px;
          transform: translateX(-50%) scaleY(0.2);
          background: linear-gradient(180deg, rgba(37,99,235,0.65) 0%, rgba(37,99,235,0.25) 60%, rgba(37,99,235,0) 100%);
          filter: blur(1px);
          border-radius: 999px;
          opacity: 0;
          animation: rocket-trail-stretch var(--rocket-duration) ease-out var(--rocket-delay) both;
        }

        .rocket-smoke {
          position: absolute;
          bottom: -2px;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: radial-gradient(50% 50% at 50% 50%, rgba(200,210,220,0.7) 0%, rgba(200,210,220,0.35) 60%, rgba(200,210,220,0) 100%);
          filter: blur(0.4px);
          opacity: 0.35;
          animation: rocket-smoke-pop 900ms ease-out both;
          pointer-events: none;
        }
        .rocket-smoke.s1 { left: calc(50% - 14px); animation-delay: calc(var(--rocket-delay) + 80ms); }
        .rocket-smoke.s2 { left: calc(50% + 6px);  animation-delay: calc(var(--rocket-delay) + 140ms); }
        .rocket-smoke.s3 { left: calc(50% - 2px);  animation-delay: calc(var(--rocket-delay) + 220ms); }

        /* ---- Keyframes ---- */
        @keyframes rocket-takeoff-up {
          0%   { transform: translate3d(0, 0, 0) rotate(var(--tilt-start)) scale(1); }
          12%  { transform: translate3d(0, -6px, 0) rotate(calc(var(--tilt-start) * 0.6)) scale(0.995); }
          22%  { transform: translate3d(0, -16px, 0) rotate(calc(var(--tilt-start) * 0.3)) scale(1.005); }
          40%  { transform: translate3d(0, calc(var(--distance) * -0.21875), 0) rotate(0deg); }
          70%  { transform: translate3d(0, calc(var(--distance) * -0.625), 0) rotate(2deg); }
          85%  { transform: translate3d(0, calc(var(--distance) * -0.8125), 0) rotate(0deg); }
          100% { transform: translate3d(0, calc(var(--distance) * -1), 0) rotate(0deg) scale(1.02); }
        }

        @keyframes rocket-flame-flicker {
          0%, 100% { transform: translateX(-50%) scaleY(0.65) translateY(0); opacity: 0.95; }
          25%      { transform: translateX(-50%) scaleY(1.15) translateY(2px); opacity: 1; }
          50%      { transform: translateX(-50%) scaleY(0.85) translateY(1px); opacity: 0.8; }
          75%      { transform: translateX(-50%) scaleY(1.05) translateY(3px); opacity: 0.9; }
        }

        @keyframes rocket-trail-stretch {
          0%   { transform: translateX(-50%) scaleY(0.2); opacity: 0; filter: blur(0); }
          15%  { opacity: 0.6; }
          60%  { transform: translateX(-50%) scaleY(1.2) translateY(20px); opacity: 0.5; filter: blur(1px); }
          100% { transform: translateX(-50%) scaleY(1.6) translateY(50px); opacity: 0; filter: blur(2px); }
        }

        @keyframes rocket-smoke-pop {
          0%   { transform: translate3d(0, 0, 0) scale(0.8); opacity: 0.35; filter: blur(0); }
          40%  { transform: translate3d(0, 8px, 0) scale(1.05); opacity: 0.5; }
          100% { transform: translate3d(0, 24px, 0) scale(1.35); opacity: 0; filter: blur(2px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .rocket-icon,
          .rocket-flame,
          .rocket-trail,
          .rocket-smoke {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Rocket */}
      <div
        className="rocket-icon"
        style={animationStyle}
        onAnimationEnd={onEnd}
      >
        <Rocket size={size} strokeWidth={2.2} color={color} />
        <div className="rocket-flame" />
        <div className="rocket-trail" />
      </div>

      {/* A couple of small smoke puffs near the launch point */}
      <div className="rocket-smoke s1" />
      <div className="rocket-smoke s2" />
      <div className="rocket-smoke s3" />
    </div>
  );
}

/* Usage:
<RocketTakeoff
  play
  loop={false}
  size={64}
  color="#2563EB"
  duration={1200}
  delay={100}
  distance={360}
  tiltStart={-10}
/>
*/
