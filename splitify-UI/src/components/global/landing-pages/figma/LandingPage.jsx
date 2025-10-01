import Hero from "./sections/Hero";
import "./landingPageStyling.css";
import BrandsBanner from "./builders/BrandsBanner";
import Navbar from "./builders/Navbar";
import Section2 from "./sections/section-2/Section2";
import Section3 from "./sections/section-3/Section3";
import Section4 from "./sections/section-4/Section4";
// import Section1 from "./sections/section-1/Section1";
// import Section5 from "./sections/section-5/Section5";
import Section6 from "./sections/section-6/Section6"; // fixed typo
import Footer from "./builders/Footer";
import { useEffect, useRef } from "react";
import { pageview } from "../../../../googleAnalytics/googleAnalyticsHelpers";

const ORIGIN = window.location.origin;

function upsertTag(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function setCanonical(path = "/") {
  const url = new URL(path, ORIGIN);
  url.search = "";
  url.hash = "";

  const link = upsertTag('link[rel="canonical"]', () => {
    const l = document.createElement("link");
    l.setAttribute("rel", "canonical");
    return l;
  });
  link.setAttribute("href", url.toString());

  // Optional: align social URL
  // const setMeta = (attr, name, content) => {
  //   const sel = `meta[${attr}="${name}"]`;
  //   const meta = upsertTag(sel, () => {
  //     const m = document.createElement("meta");
  //     m.setAttribute(attr, name);
  //     return m;
  //   });
  //   meta.setAttribute("content", content);
  // };
  // setMeta("property", "og:url", url.toString());
  // setMeta("name", "twitter:url", url.toString());
}

function setTitle(t) {
  document.title = t;
}

function setMetaDescription(desc) {
  const meta = upsertTag('meta[name="description"]', () => {
    const m = document.createElement("meta");
    m.setAttribute("name", "description");
    return m;
  });
  meta.setAttribute("content", desc);
}

export default function LandingPage() {
  // guard to avoid double-fire in React 18 Strict Mode dev
  const fired = useRef(false);

  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      pageview(null, "Landing_Page");
    }

    setTitle(
      "Splitify — Split Bills Automatically, Send Reminders, Track Changing Costs"
    );
    setMetaDescription(
      "Splitify makes shared bills simple: split expenses automatically, send reminders by text or email, and keep amounts updated when costs change."
    );
    setCanonical("/"); // canonical for the root landing page
  }, []);

  return (
    <div className="landing-page relative">
      <Navbar
        onLoginClick={() => (window.location.href = "/login")}
        onCreateAccountClick={() => (window.location.href = "/signup")}
      />

      <Hero />

      <div className="relative">
        <div className="absolute z-0 left-0 bottom-0 rounded-banner top-[-130px] bg-landing-main w-full">
          <BrandsBanner />
        </div>
        <div className="relative z-10">
          <Section3 />
        </div>
      </div>

      <Section2 />

      <div className="relative">
        <Section6 />
        {/* rounded overlay on bottom */}
        <div className="absolute z-20 bottom-[-55px] h-[55px] rounded-b-[40px] shadow-[0_20px_20px_rgba(0,0,0,0.25)] bg-landing-main w-full" />
      </div>

      <Section4 />
      {/* <Section1 /> */}
      <Footer />
      {/* <Section5 /> */}
    </div>
  );
}
