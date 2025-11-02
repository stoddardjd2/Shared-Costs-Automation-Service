import { useEffect, useRef, useState, useMemo, memo } from "react";
import SectionIndicator from "../builders/SectionIndicator";
import CtaBtn from "../builders/CtaBtn";
import demo1Img from "../assets/demo-1-tall.png?format=webp&quality=80";
import demo2Img from "../assets/demo-2.png?format=webp&quality=80";
import demo3Img from "../assets/demo-3.png?format=webp&quality=80";

// Extract hook to separate file if used elsewhere
function useInView(options = { threshold: 0.1, rootMargin: "0px" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect(); // Stop observing after first intersection
      }
    }, options);

    obs.observe(node);
    return () => obs.disconnect();
  }, [options.threshold, options.rootMargin]); // Proper dependencies

  return { ref, visible };
}

// Memoized StepCard component
const StepCard = memo(function StepCard({ number, title, description, imgSrc, delayMs = 0 }) {
  const { ref, visible } = useInView({ threshold: 0, rootMargin: "0px 0px 50% 0px" });

  // Pre-compute className to avoid re-creating on every render
  const cardClassName = useMemo(() => {
    const baseClasses = [
      "w-full flex flex-col h-[390px] bg-white border border-gray-200 rounded-2xl shadow-lg",
      "transition-all duration-1000 ease-out will-change-transform will-change-opacity",
      "motion-reduce:transition-none",
    ];
    
    const visibilityClasses = visible 
      ? "opacity-100 translate-y-0" 
      : "opacity-0 translate-y-12";
    
    return [...baseClasses, visibilityClasses].join(" ");
  }, [visible]);

  return (
    <div
      ref={ref}
      className={cardClassName}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <div className="p-4">
        <div className="flex items-center mb-3">
          <span className="rounded-[60px] flex-shrink-0 text-white mr-4 w-8 h-8 flex items-center justify-center primary-color">
            {number}
          </span>
          <h3>{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="w-full h-full mt-6 rounded-tl-[20px] transition-all hover:opacity-100 opacity-60 bg-blue-50 relative overflow-hidden">
        <img
          className="absolute left-[24px] top-[24px] rounded-2xl"
          src={imgSrc}
          alt={`${title} demonstration`}
          loading="eager"
          height="auto"
        />
      </div>
    </div>
  );
});

export default function HowItWorks() {
  // Memoize static data to prevent recreating on every render
  const stepCards = useMemo(() => [
    {
      title: "Choose your crew",
      description: "Choose friends to split with. Pick from recent contacts or add someone new.",
      imgSrc: demo3Img,
    },
    {
      title: "Set the split",
      description: "Decide how to split the bill. Evenly, by percentage, or custom amounts.",
      imgSrc: demo2Img,
    },
    {
      title: "Text & emails sent",
      description: "Splitify sends requests and reminders for you with a link for others to pay.",
      imgSrc: demo1Img,
    },
  ], []);

  return (
    <section id="howItWorks" className="p-[clamp(1rem,5vw,2.5rem)]">
      <div className="constrained-width">
        <SectionIndicator title="How it works" />
        
        <div className="flex gap-y-[1rem] gap-x-20 flex-wrap justify-between">
          <h2>
            <span className="whitespace-nowrap">Split bills in</span>
            <br />
            <span>3 simple steps</span>
          </h2>
          
          <div className="max-w-[330px] flex flex-col gap-[clamp(1rem,1vw,1.25rem)]">
            <p className="text-gray-600">
              <span className="font-medium">
                No calculators. No group chats. No excel sheets.
              </span>{" "}
              Just splits that actually get paid.
            </p>
            <CtaBtn
              variation="Landing-v2-HowItWorks-TEST-A"
              whiteArrow={true}
              className="w-fit font-semibold mt-0 px-6 py-3 shadow-lg cursor-pointer hover:bg-blue-700 transition-all"
            />
          </div>
        </div>

        {/* Steps grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 auto-rows-fr">
          {stepCards.map((step, index) => (
            <StepCard
              key={step.title} // Use stable key instead of index
              number={index + 1}
              title={step.title}
              description={step.description}
              imgSrc={step.imgSrc}
              delayMs={index * 140}
            />
          ))}
        </div>
      </div>
    </section>
  );
}