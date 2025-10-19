import SectionIndicator from "../builders/SectionIndicator";
import feature1 from "../assets/feature-1-blue.png";
import feature2 from "../assets/feature-2-blue.png";
import feature3 from "../assets/feature-3.png";
import feature4 from "../assets/feature-4.png";

import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

const features = [
  {
    title: "Splits update automatically",
    description:
      "If bills change, Splitify updates split amounts before sending again. Perfect for utilites.",
    btmElements: (
      <img className="h-fit rounded-xl shadow-md" src={feature1} alt="" />
    ),
  },
  {
    title: (
      <div>
        Simple <br className="hidden [@media(min-width:580px)]:inline" />{" "}
        payments
      </div>
    ),
    description:
      "Splitify sends a link to your crew so they can pay any way they want.",
    btmElements: <img className="h-fit -translate-x-2" src={feature4} alt="" />,
  },
  {
    title: (
      <div>
        Recurring <br className="hidden [@media(min-width:580px)]:inline" />{" "}
        splits
      </div>
    ),
    description:
      "Automate splits for utilities, Wi-Fi, or subscriptions. Set it once, forget the rest.",
    btmElements: (
      <img className="h-fit rounded-xl shadow-md" src={feature2} alt="" />
    ),
  },
  {
    title: (
      <div>
        Auto
        <br className="hidden [@media(min-width:580px)]:inline" /> reminders
      </div>
    ),
    description: (
      <div>
        Missing payments? Splitify follows up with email{" "}
        <span className="italic font-medium">and</span> text messages until you
        get paid.
      </div>
    ),
    btmElements: <img className="h-fit -translate-x-2" src={feature3} alt="" />,
  },
  {
    title: (
      <div>
        Detailed <br className="hidden [@media(min-width:580px)]:inline" />{" "}
        payment history
      </div>
    ),
    description: (
      <div>
        Splitify keeps a clear record of who’s paid. No stress, no confusion,
        and no disputes.{" "}
      </div>
    ),
    btmElements: <img className="h-fit -translate-x-2" src={feature3} alt="" />,
  },
  {
    title: (
      <div>
        Connect <br className="hidden [@media(min-width:580px)]:inline" />{" "}
        your bank
      </div>
    ),
    description: (
      <div>
        Optionally, connect your bank account with Plaid to make bill splitting even easier.
      </div>
    ),
    btmElements: <img className="h-fit -translate-x-2" src={feature3} alt="" />,
  },
];

/* ---------- Animation helpers ---------- */
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function AnimatedInView({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      style={{ willChange: "opacity, transform" }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.2, margin: "0px 0px -10% 0px", once: true }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
/* ---------- Component ---------- */
export default function Features() {
  return (
    <section id="features" className="p-[clamp(1rem,5vw,2.5rem)]">
      <div className="constrained-width w-full">
        <SectionIndicator className={"mx-auto"} title={"Features"} />
        <h2 className="text-center">It's more than just a split button</h2>
        <p className="text-center mt-4 lg:w-3/5 mx-auto text-gray-600">
          Splitify does the work for you, so you don’t have to worry or waste
          time.
          <div className="mt-2 italic text-gray-600">
            Fast, friendly, reliable.
          </div>
        </p>

        {/* features grid */}
        <div className="mt-14 grid gap-4 auto-rows-fr grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          {features.map((feature, index) => (
            <AnimatedInView
              key={index}
              delay={index * 0.14} // stagger: 0s, 140ms, 280ms, ...
              className="w-full"
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                btmElements={feature.btmElements}
              />
            </AnimatedInView>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ btmElements, title, description }) {
  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-2xl shadow-lg">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <h3>{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="w-full mt-auto p-4 overflow-hidden h-fit max-w-[400px] mt-auto flex items-end rounded-[30px]">
        {btmElements}
      </div>
    </div>
  );
}
