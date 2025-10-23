import SectionIndicator from "../builders/SectionIndicator";
import feature1 from "../assets/features-images-new/feature-1.png?format=webp&quality=80";
import feature2 from "../assets/features-images-new/feature-2.png?format=webp&quality=80";
import feature3 from "../assets/features-images-new/feature-3.png?format=webp&quality=80";
import feature4 from "../assets/features-images-new/feature-4.png?format=webp&quality=80";
import feature5 from "../assets/features-images-new/feature-5.png?format=webp&quality=80";
import feature6 from "../assets/features-images-new/feature-6.png?format=webp&quality=80";
import Carousel from "../builders/Carousel";
import Repeat from "../assets/feature-icons/repeat.svg?react";
import Dynamic from "../assets/feature-icons/dynamic.svg?react";
import Message from "../assets/feature-icons/message.svg?react";
import Link from "../assets/feature-icons/link.svg?react";
import Payment from "../assets/feature-icons/payment.svg?react";
import Bank from "../assets/feature-icons/bank.svg?react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

const features = [
  {
    icon: <Dynamic className="w-5 h-5 [&>path]:stroke-[40px] " />,
    title: <div>Splits update automatically</div>,
    description:
      "If bills change, Splitify updates split amounts before sending again. Perfect for utilites.",
    btmElements: <img className="w-full h-auto" src={feature1} alt="" />,
  },
  {
    icon: <Message className="w-5 h-5 p-[.6px] [&>path]:stroke-[40px] " />,

    title: <div>Auto text reminders</div>,
    description: (
      <p className="text-gray-600">
        Missing payments? Splitify follows up with email{" "}
        <span className="italic font-medium">and</span> text messages until you
        get paid.
      </p>
    ),
    btmElements: <img className="w-full h-auto" src={feature3} alt="" />,
  },

  {
    icon: <Payment className="w-5 h-5 p-[2px] [&>path]:stroke-[25px] " />,

    title: <div>Detailed payment history</div>,
    description: (
      <div>
        Splitify keeps a clear record of who’s paid. No stress, no confusion,
        and no disputes.{" "}
      </div>
    ),
    btmElements: <img className="w-full h-auto" src={feature5} alt="" />,
  },
    {
    icon: <Link className="w-5 h-5 [&>path]:stroke-[16px] " />,

    title: <div className="">Pay with link</div>,
    description:
      "Splitify sends a link to your crew so they can pay any way they want. Venmo, cashapp, etc.",
    btmElements: <img className="w-full h-auto" src={feature4} alt="" />,
  },

  {
    icon: <Repeat className="w-5 h-5 [&>path]:stroke-[40px] " />,
    title: <div>Recurring splits</div>,
    description:
      "Automate splits for utilities, Wi-Fi, or subscriptions. Set it once, forget the rest.",
    btmElements: <img className="w-full h-auto" src={feature2} alt="" />,
  },
  {
    icon: (
      <Bank className="w-5 h-5 p-[1px] -translate-y-[1px] [&>path]:stroke-[40px] " />
    ),

    title: <div>Connect your bank</div>,
    description: (
      <div>
        Optionally, connect your bank account with Plaid to make bill splitting
        even easier.
      </div>
    ),
    btmElements: <img className="w-full h-auto" src={feature6} alt="" />,
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
          {/* <Carousel gap="20px" slidesPerView={3} loop autoPlay interval={4000}> */}
          {features.map((feature, index) => (
            <AnimatedInView
              key={index}
              delay={index * .14} // stagger: 0s, 140ms, 280ms, ...
              className="w-full"
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                btmElements={feature.btmElements}
                icon={feature.icon}
              />
            </AnimatedInView>
          ))}
          {/* </Carousel>   */}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ btmElements, title, description, icon }) {
  return (
    <div className="flex flex-col overflow-hidden w-full h-full bg-white border border-gray-200 rounded-2xl shadow-lg">
      <div className="p-4">
        <div className="flex items-center mb-2">
          {/* <div className="rounded-[60px] flex-shrink-0 text-white mr-4 w-8 h-8 flex items-center justify-center primary-color">
            {icon}
          </div> */}
          <h4>{title}</h4>
        </div>
        <div className="text-gray-600">{description}</div>
      </div>
      <div className="w-full rounded-tl-[10px]  shadow-lg bg-blue-50 opacity-60 transition-all hover:opacity-100 rounded-bl-[10px] mt-auto pt-4 pl-4 overflow-hidden h-fit flex items-end">
        <div className="rounded-tl-xl overflow-hidden w-full">
          {btmElements}
        </div>
      </div>
    </div>
  );
}
