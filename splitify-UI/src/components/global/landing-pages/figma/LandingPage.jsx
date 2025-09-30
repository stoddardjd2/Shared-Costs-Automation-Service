import Hero from "./sections/Hero";
import "./landingPageStyling.css";
import BrandsBanner from "./builders/BrandsBanner";
import Steps from "./sections/section-6/Steps";
import CtaBtn from "./builders/CtaBtn";
import Section1 from "./sections/section-1/Section1";
import Section2 from "./sections/section-2/Section2";
import Section3 from "./sections/section-3/Section3";
import Section4 from "./sections/section-4/Section4";
import Section5 from "./sections/section-5/Section5";
import Navbar from "./builders/Navbar";
import Section6 from "./sections/section-6/Seection6";
import Footer from "./builders/Footer";
import { useEffect } from "react";
import { pageview } from "../../../../googleAnalytics/googleAnalyticsHelpers";
export default function LandingPage() {
  useEffect(() => {
    pageview(null, "Landing_Page");
  });

  return (
    <div className={`landing-page relative`}>
      {/* for startup fame verification */}
      <a
        className="hidden"
        href="https://startupfa.me/s/splitify?utm_source=splitify.io"
        target="_blank"
      >
        <img
          src="https://startupfa.me/badges/featured-badge.webp"
          alt="Featured on Startup Fame"
          width="171"
          height="54"
        />
      </a>
      <title>
        Splitify — Split Bills Automatically, Send Reminders, Track Changing
        Costs
      </title>
      <meta
        name="description"
        content="Splitify makes shared bills simple: split expenses automatically, send reminders by text or email, and keep amounts updated when costs change."
      />
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
        <div class="absolute z-20 bottom-[-55px] h-[55px] rounded-b-[40px] shadow-[0_20px_20px_rgba(0,0,0,0.25)] bg-landing-main w-full"></div>
      </div>

      <Section4 />
      {/* <Section1 /> */}
      <Footer />

      {/* <Section5 /> */}
    </div>
  );
}
