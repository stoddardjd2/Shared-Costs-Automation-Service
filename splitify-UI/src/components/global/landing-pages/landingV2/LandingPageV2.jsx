import Hero from "./sections/Hero";
import "./landingPageV2Styling.css";
import Navbar from "./builders/Navbar";
import CtaBtn from "./builders/CtaBtn";
import HowItWorks from "./sections/HowItWorks";
import Features from "./sections/Features";
import ClosingCta from "./sections/ClosingCta";
import PricingTable from "./sections/PricingTable";
export default function LandingPageV2() {
  return (
    <div className="landing-page-v2">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features /> 
       {/*Problem Agitation (what it solves)  */}
       {/* Comparison to other apps */}
       <PricingTable/>
      <ClosingCta/>
    </div>
  );
}
