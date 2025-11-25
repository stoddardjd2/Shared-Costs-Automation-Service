import { useEffect, useState } from "react";
import CtaBtn from "../builders/CtaBtn";
import dashboardImg from "../assets/dashboard-high-res-patched.png?format=webp&quality=80";
import dashboardPhoneImg from "../assets/dashboard-phone.png?format=webp&quality=80";
import Star from "../assets/Star";
import overdueTextPhoneImg from "../assets/overdueTextPhone.png?format=webp&quality=80";
import heroBg from "../assets/hero-bg.png?format=webp";
// import heroBg2 from "../assets/hero-bg-2.png?format=webp"; // optional alt

import {
  VenmoLogo,
  CashAppLogo,
  GooglePayLogo,
  PayPalLogo,
  AppleLogo,
  ZelleLogo,
} from "../assets/brandLogos";
import { Backpack } from "lucide-react";

const Logos = [
  VenmoLogo,
  CashAppLogo,
  GooglePayLogo,
  PayPalLogo,
  AppleLogo,
  ZelleLogo,
];

// --- small preload helper ---
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve();
    const img = new Image();
    img.fetchPriority = "high"; // hint
    img.decoding = "async";
    img.src = src;
    // Prefer decode() when supported
    if (img.decode) {
      img
        .decode()
        .then(resolve)
        .catch(() => {
          img.onload = () => resolve();
          img.onerror = (e) => reject(e);
        });
    } else {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    }
  });
}

export default function Hero() {
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Load primary (and optional alt) before showing anything
    Promise.all([
      preloadImage(heroBg),
      preloadImage(dashboardImg),
      preloadImage(dashboardPhoneImg),
    ])
      .then(() => {
        if (!cancelled) setBgReady(true);
      })
      .catch(() => {
        // even if it fails, unblock to avoid perma-blank
        if (!cancelled) setBgReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Do not show page/hero until background is ready
  if (!bgReady) {
    // If you absolutely want *nothing* rendered, return null
    // return null;
    // Or keep layout stable with a blank full-viewport placeholder:
    return <div className="min-h-[100svh] bg-white" />;
  }

  return (
    <section
      className="pt-16 relative"
      style={{
        background: `url(${heroBg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "50% 0%",
      }}
    >
      <div className="relative z-10">
        <div className="!pb-0">
          {/* copy */}
          <div className=" animate-smooth-up pb-0 sm:pb-[clamp(1rem,5vw,2.5rem)] p-[clamp(2rem,5vw,2.5rem)] pt-0 sticky top-[90px]  mb-12 sm:top-[clamp(120px,7vw,190px)]  ">
            <h1 className="text-center mb-2 sm:mb-4 md:mb-6 max-w-[1000px] mx-auto">
              Tired of chasing <br className="inline sm:hidden" /> roommates for
              money?
              <br className="inline sm:hidden" /> Splitify gets them to pay you
              on time.
            </h1>
            <p className="text-center text-gray-700 mb-2 max-w-[800px] mx-auto">
              {/* Splitify uses proven techniques to get you paid back more often and faster. */}
              {/* Experience less stress, fewer arguments, and more confidence that you won’t be stuck covering other people's bills. */}
              {/* Splitify is your AI bill manager that splits bills, sends
              reminders, and tracks everything—so you never miss a payment. */}
              Splitify is your AI bill manager that auto-splits bills, sends
              smart text reminders, and delivers pay-by-link texts so your roommates
              actually pay.
            </p>
            <p className="text-center font-semibold text-gray-700">
              No chasing. No awkward follows-ups.{" "}
              <br className="inline sm:hidden" /> No arguments.
            </p>

            <CtaBtn
              animate={true}
              variation={"Landing-v2-HERO-TEST-A"}
              whiteArrow={true}
              text="Start Now - It's Free"
              className="relative z-0 sm:mt-[50px] w-fit mx-auto font-semibold !mt-8 px-6 py-3 shadow-lg cursor-pointer hover:bg-blue-700 transition-all"
            />
          </div>

          {/* dashboard image w/ border */}
          <div className="animate-smooth-up2 mt-10 constrained-width sm:p-[clamp(1rem,5vw,2.5rem)]">
            <div className="hidden sm:inline relative">
              <div className="shadow-[0_0_20px_4px_rgb(255,255,255,.5)] p-[clamp(0rem,1vw,1rem)] bg-gray-200/50 rounded-[clamp(0rem,2vw,1.5rem)] border border-gray-300">
                <img
                  src={dashboardImg}
                  alt="Dashboard demo"
                  loading="eager"
                  className="w-full mx-auto rounded-[clamp(0rem,2vw,1.5rem)] border border-gray-300"
                />
              </div>
              <img
                src={overdueTextPhoneImg}
                alt="overdue text demo"
                className="w-[clamp(100px,40vw,300px)] absolute bottom-[-40px] right-[-40px]"
              />
            </div>

            {/* MOBILE */}
            {/* h-[clamp(590px,200px+7vw,590px)] */}

            <div
              className="relative overflow-hidden flex flex-wrap justify-between sm:hidden
             "
            >
              <img
                src={dashboardPhoneImg}
                alt="Dashboard demo"
                className="w-full mx-auto rounded-[clamp(0rem,2vw,1.5rem)]"
              />
            </div>
          </div>
        </div>

        {/* banner */}
        <div className="z-40 sm:sticky bottom-0 w-full bg-white pt-2 sm:py-6 shadow-sm border border-gray-200 sm:mt-10">
          <div className="constrained-width sm:px-10">
            <PaymentLogos />
          </div>
        </div>
      </div>

      {/* Fixed stars */}
      <Star className="absolute top-[-100px] sm:top-[0px] w-32 right-1 md:right-10 z-0" />
      <Star className="absolute top-[-340px] sm:top-[-200px] w-24 left-10 z-0" />
      <Star className="absolute top-[600px] w-20 left-[100px] z-0 hidden sm:flex" />
    </section>
  );
}

export function PaymentLogos({ speed = 40, pauseOnHover = true }) {
  return (
    <>
      {/* MOBILE: marquee banner */}
      <div
        className="sm:hidden relative overflow-hidden bg-white"
        style={{ "--marquee-speed": `${speed}s` }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
        <p className="text-gray-600 text-center py-2">Get paid your way</p>

        <div
          className={`group ${
            pauseOnHover ? "hover:[&_.track]:[animation-play-state:paused]" : ""
          }`}
        >
          <div className="track flex items-center gap-8 py-2 will-change-transform">
            {[0, 1].map((pass) => (
              <div className="flex items-center gap-8" key={pass}>
                {Logos.map((Logo, i) => (
                  <div
                    key={`${pass}-${i}`}
                    className="h-[2.3rem] flex items-center shrink-0"
                  >
                    <Logo className="h-full w-auto px-2" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP: original layout */}
      <div className="hidden sm:flex sm:flex-wrap items-center justify-between gap-6">
        <p className="text-gray-600 text-center w-full lg:text-start lg:w-fit">
          Get paid your way
        </p>
        <div className="flex flex-wrap items-center justify-around lg:justify-between gap-x-6 gap-y-3 w-full lg:w-[80%]">
          {Logos.map((Logo, i) => (
            <div
              key={i}
              className="h-[clamp(2.1rem,5vw,2.5rem)] flex items-center"
            >
              <Logo className="h-full px-2 w-auto" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes payment-logos-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .track {
          width: max-content;
          animation: payment-logos-marquee var(--marquee-speed, 20s) linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .track {
            animation: none !important;
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
