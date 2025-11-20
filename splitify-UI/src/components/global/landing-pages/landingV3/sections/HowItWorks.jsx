import { useMemo, memo } from "react";
import SectionIndicator from "../builders/SectionIndicator";
import CtaBtn from "../builders/CtaBtn";
import demo1Img from "../assets/demo-1-tall.png?format=webp&quality=80";
import demo2Img from "../assets/demo-2.png?format=webp&quality=80";
import demo3Img from "../assets/demo-3.png?format=webp&quality=80";
import { motion } from "framer-motion";
import FadeInWrapper from "../builders/FadeInWrapper";
import { useState, useRef, useEffect } from "react";
function StepCard({ number, title, description, imgSrc, delaySec = 0.1 }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{
        transitionDelay: isVisible ? `${delaySec}s` : "0s",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="overflow-hidden w-full flex flex-col h-[390px] bg-white border border-gray-200 rounded-2xl shadow-lg">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <span className="rounded-[60px] font-semibold flex-shrink-0 text-white mr-4 w-8 h-8 flex items-center justify-center primary-color">
              {number}
            </span>
            <h3>{title}</h3>
          </div>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="w-full h-full mt-6 rounded-tl-[20px] transition-opacity hover:opacity-100 opacity-60 bg-blue-50 relative overflow-hidden">
          <img
            className="absolute left-[24px] top-[24px] rounded-2xl"
            src={imgSrc}
            alt={`${title} demonstration`}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const stepCards = [
    {
      title: "Choose roommates",
      description:
        "Choose who to split with. Pick from recent contacts or add someone new.",
      imgSrc: demo3Img,
    },
    {
      title: "Split a bill",
      description:
        "Decide how to split a bill. Evenly, by percentage, or custom amounts.",
      imgSrc: demo2Img,
    },
    {
      title: "Get paid fast",
      description:
        "Splitify sends texts until you get paid, provides a link to pay and tracks everything.",
      imgSrc: demo1Img,
    },
  ];

  return (
    <section id="howItWorks" className="p-[clamp(1rem,5vw,2.5rem)]">
      <div className="constrained-width">
        <FadeInWrapper>
          <SectionIndicator title="How it works" />
        </FadeInWrapper>

        <div className="flex gap-y-[1rem] gap-x-20 flex-wrap justify-between">
          <FadeInWrapper>
            <h2 className="m-0">
              <span className="whitespace-nowrap">Get paid back in</span>
              <br />
              <span>3 simple steps</span>
            </h2>
          </FadeInWrapper>

          <FadeInWrapper delaySec={0.3}>
            <div className="max-w-[330px] flex flex-col gap-[clamp(1rem,1vw,1.25rem)]">
              <p className="text-gray-600">
                <span className="font-medium">
                  No calculators. No group chats. No excel sheets.
                </span>{" "}
                Just requests that actually get paid.
              </p>
              <CtaBtn
                variation="Landing-v2-HowItWorks-TEST-A"
                whiteArrow={true}
                className="w-fit font-semibold mt-0 px-6 py-3 shadow-lg cursor-pointer hover:bg-blue-700 transition-all"
              />
            </div>
          </FadeInWrapper>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 auto-rows-fr">
          {stepCards.map((step, index) => (
            <StepCard
              key={step.title}
              number={index + 1}
              title={step.title}
              description={step.description}
              imgSrc={step.imgSrc}
              delaySec={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
