import Hero from "./sections/Hero";
import "./landingPageStyling.css";
import BrandsBanner from "./sections/section-1/BrandsBanner";
import Steps from "./sections/section-1/Steps";
import CtaBtn from "./builders/CtaBtn";
import Section1 from "./sections/section-1/Section1";
import Section2 from "./sections/section-2/Section2";
import Section3 from "./sections/section-3/Section3";
import Section4 from "./sections/section-4/Section4";
import Section5 from "./sections/section-5/Section5";
export default function LandingPage() {
  return (
    <div className={`landing-page`}>
      <Hero />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      {/* <Section5 /> */}
    </div>
  );
}
