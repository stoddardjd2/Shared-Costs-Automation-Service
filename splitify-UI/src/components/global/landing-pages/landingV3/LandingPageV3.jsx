import Hero from "./sections/Hero";
import Hero2 from "./sections/Hero2";
import "./landingPageV3Styling.css";
import Navbar from "./builders/Navbar";
import Footer from "./builders/Footer";
import CtaBtn from "./builders/CtaBtn";
import HowItWorks from "./sections/HowItWorks";
import Features from "./sections/Features";
import ClosingCta from "./sections/ClosingCta";
import PricingTable from "./sections/PricingTable";
import Proof from "./sections/Proof";
import FAQSection from "./sections/FAQ";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function LandingPageV2() {
  const location = useLocation();

  const scrollToSection = (elementId) => {
    const element = document.getElementById(elementId);
    const root = document.getElementById("root");

    if (element && root) {
      const offset = 50; // Offset for fixed header

      // Get position relative to the root container
      const elementPosition = element.getBoundingClientRect().top;
      const rootPosition = root.getBoundingClientRect().top;
      const relativePosition = elementPosition - rootPosition;

      // Calculate the scroll position
      const scrollPosition = root.scrollTop + relativePosition - offset;

      root.scrollTo({
        top: scrollPosition,
        behavior: "instant",
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const support = params.get("support");

    if (support === "true") {
      // Scroll after page finishes mounting
      setTimeout(() => {
        scrollToSection('support');
      }, 150);
    }
  }, [location.search]);

  return (
    <div className="landing-page-v3">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Proof />
      <Features />
      {/*Problem Agitation (what it solves)  */}
      {/* Comparison to other apps */}
      <PricingTable />
      <ClosingCta />
      <FAQSection />

      <Footer />
    </div>
  );
}
