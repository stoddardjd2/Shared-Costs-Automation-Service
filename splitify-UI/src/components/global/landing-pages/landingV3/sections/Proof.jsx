import { useState, useRef, useEffect } from "react";
import SectionIndicator from "../builders/SectionIndicator";
import FadeInWrapper from "../builders/FadeInWrapper";

function StatCard({ stat, highlight, description, source, delaySec = 0.1 }) {
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
      <div className="w-full flex flex-col h-full bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
        <h3 className="mb-3 w-fit bg-blue-600 text-white rounded-3xl px-4">
          {stat}
        </h3>
        <h3 className="mb-2 text-2xl">{highlight}</h3>
        <p className="text-[16px] text-gray-600 flex-grow">{description}</p>
        {source && (
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
            {source}
          </p>
        )}
      </div>
    </div>
  );
}

function FeaturePoint({ icon, text, delaySec = 0.1 }) {
  const [isVisible, setIsVisible] = useState(false);
  const pointRef = useRef(null);

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

    if (pointRef.current) {
      observer.observe(pointRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={pointRef}
      className={`flex items-start gap-3 transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{
        transitionDelay: isVisible ? `${delaySec}s` : "0s",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <span className="rounded-full mt-1 flex-shrink-0 text-white w-6 h-6 flex items-center justify-center primary-color text-sm">
        {icon}
      </span>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}

export default function Proof() {
  const stats = [
    {
      stat: "46%",
      highlight: "Avoid the awkward ask",
      description:
        "Nearly half of Americans say they avoid reminding friends to pay them back. Splitify sends the reminders so you don't have to.",
      source: "Survey data",
    },
    {
      stat: "90% ",
      highlight: "Texts get seen instantly",
      description:
        "Text messages are read within 3 minutes. Your roommate actually sees the reminder—unlike emails buried in spam.",
      source: "Emarsys",
    },
    {
      stat: "50%",
      highlight: "More payments collected",
      description:
        "Automated text reminders with payment links increase collection rates by up to 50% compared to manual follow-ups.",
      source: "Industry research",
    },
    {
      stat: "21%",
      highlight: "Friendships lost over money",
      description:
        "One in five people have lost a friendship over money. Splitify keeps things fair so resentment never builds.",
      source: "Survey data",
    },
  ];

  const features = [
    {
      icon: "✓",
      text: "80% of people prefer bill reminders by text—Splitify meets them where they are.",
    },
    {
      icon: "✓",
      text: "95% of late payers said a text reminder would have helped them pay on time.",
    },
    {
      icon: "✓",
      text: "Bank integration via Plaid automatically recalculates when bills change—no manual updates.",
    },
    {
      icon: "✓",
      text: "Payment links sent by text—no signup needed—so your roommates have no excuse not to pay.",
    },
  ];

  return (
    <section id="proof" className="p-[clamp(1rem,5vw,2.5rem)] bg-gray-50">
      <div className="constrained-width">
        <FadeInWrapper>
          <SectionIndicator title="Why it works" />
        </FadeInWrapper>

        <div className="flex gap-y-[1rem] gap-x-20 flex-wrap justify-between mb-12">
          <FadeInWrapper>
            <h2 className="m-0">
              <span className="whitespace-nowrap">Proven to work,</span>
              <br />
              <span>built to get you paid</span>
            </h2>
          </FadeInWrapper>

          {/* <FadeInWrapper delaySec={0.3}>
            <div className="max-w-[380px]">
              <p className="text-gray-600">
                <span className="font-medium">
                  Forgetfulness isn't malice—it's human nature.
                </span>{" "}
                Splitify uses proven behavioral nudges to get people to actually pay.
              </p>
            </div>
          </FadeInWrapper> */}
        </div>

        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {stats.map((item, index) => (
            <StatCard
              key={item.stat}
              stat={item.stat}
              highlight={item.highlight}
              description={item.description}
              source={item.source}
              delaySec={index * 0.1}
            />
          ))}
        </div>

        <FadeInWrapper delaySec={0.2}>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
            <h3 className="mb-6">The result? Less stress, fewer arguments and more payments collected.</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <FeaturePoint
                  key={index}
                  icon={feature.icon}
                  text={feature.text}
                  delaySec={index * 0.1}
                />
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-6 pt-6 border-t border-gray-100">
              Splitify acts as the "accountant" for your household. That means
              you can stop being the one who chases people down for money.
            </p>
          </div>
        </FadeInWrapper>
      </div>
    </section>
  );
}
