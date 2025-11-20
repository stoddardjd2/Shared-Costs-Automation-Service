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
export default function LandingPageV2() {
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
