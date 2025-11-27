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
import FadeInWrapper from "../builders/FadeInWrapper";
import { Clock, MailCheck } from "lucide-react";

const features = [
  {
    icon: <Message className="w-5 h-5 p-[.6px] [&>path]:stroke-[40px] " />,

    title: <div>Automatic text reminders</div>,
    description:
      "Missing payments? Splitify follows up with friendly text messages until you get paid.",
    btmElements: <img className="w-full h-auto" src={feature3} alt="" />,
  },
  {
    icon: <Dynamic className="w-5 h-5 [&>path]:stroke-[40px] " />,
    title: <div>Automatic request updates</div>,
    description:
      "If a bill changes, Splitify updates everyone’s amount automatically—perfect for utilities.",
    btmElements: <img className="w-full h-auto" src={feature1} alt="" />,
  },

  {
    icon: <Payment className="w-5 h-5 p-[2px] [&>path]:stroke-[25px] " />,

    title: <div>Detailed payment history</div>,
    description:
      "Splitify keeps a clear record of who’s paid. That means no confusion and no disputes.",
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
    description: `Optionally, connect your bank account with Plaid to make bill splitting
        even easier.`,
    btmElements: <img className="w-full h-auto" src={feature6} alt="" />,
  },
  {
    icon: <Clock className="w-5 h-5 p-[.6px] [&>path]:stroke-[40px]" />,
    title: <div>Custom Reminder Schedule</div>,
    description:
      "Choose exactly when reminders send—set your preferred days, times, and follow-up frequency.",
    btmElements: (
      <div className="w-full h-[100px] p-4 grid grid-cols-4 gap-2 content-center">
        <div className="h-3 rounded-md bg-blue-300/30 col-span-2"></div>
        <div className="h-3 rounded-md bg-blue-300/20 col-span-1"></div>
        <div className="h-3 rounded-md bg-blue-300/10 col-span-1"></div>

        <div className="h-3 rounded-md bg-blue-300/20 col-span-1"></div>
        <div className="h-3 rounded-md bg-blue-300/10 col-span-1"></div>
        <div className="h-3 rounded-md bg-blue-300/20 col-span-2"></div>

        <div className="w-20 h-6 rounded-lg bg-blue-600/20 col-span-4 mt-2"></div>
      </div>
    ),
    badge: { label: "New!" },
  },
  {
    icon: <Message className="w-5 h-5 p-[.6px] [&>path]:stroke-[40px]" />,
    title: <div>Customizable Text Messages</div>,
    description:
      "Make Splitify feel personal. Create your own message style for reminders and requests.",
    btmElements: (
      <div className="w-full h-[100px] p-4 flex flex-col justify-center gap-2">
        <div className="w-10/12 h-3 rounded-md bg-blue-300/30"></div>
        <div className="w-8/12 h-3 rounded-md bg-blue-300/20"></div>
        <div className="w-6/12 h-3 rounded-md bg-blue-300/10"></div>
        <div className="w-24 h-6 rounded-lg bg-blue-600/20 mt-2"></div>
      </div>
    ),
    badge: { label: "Coming Soon" },
  },

  {
    icon: <MailCheck className="w-5 h-5 p-[.6px] [&>path]:stroke-[40px]" />,
    title: <div>Automatic Payment Detection</div>,
    description:
      "Splitify scans your connected email for payment confirmations and marks requests as paid.",
    btmElements: (
      <div className="w-full h-[100px] p-4 flex items-center gap-3">
        <div className="h-9 w-12 rounded-md bg-blue-300/20"></div>
        <div className="flex-1 space-y-2">
          <div className="w-9/12 h-3 rounded-md bg-blue-300/30"></div>
          <div className="w-7/12 h-3 rounded-md bg-blue-300/20"></div>
          <div className="w-6/12 h-3 rounded-md bg-blue-300/10"></div>
        </div>
        <div className="h-7 w-7 rounded-full bg-blue-500/25"></div>
      </div>
    ),
    badge: { label: "Coming Soon" },
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
        <FadeInWrapper>
          <SectionIndicator className={"mx-auto"} title={"Features"} />
          <h2 className="text-center">
            Features that save time and relationships
          </h2>
          <p className="text-center mt-4 lg:w-3/5 mx-auto text-gray-600">
            Splitify does the work for you, so you can set it up once and
            forget.
            {/* <div className="mt-2 italic text-gray-600">
              Fast, friendly, reliable.
            </div> */}
          </p>
        </FadeInWrapper>

        {/* features grid */}
        <div className="mt-14 grid gap-4 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start">
          {features.map((feature, index) => (
            <AnimatedInView key={index} delay={index * 0.14} className="w-full h-full">
              <FeatureCard
                title={feature.title}
                description={feature.description}
                btmElements={feature.btmElements}
                icon={feature.icon}
                badge={feature.badge}
              />
            </AnimatedInView>
          ))}
        </div>
      </div>
    </section>
  );
}
function FeatureCard({
  btmElements,
  title,
  description,
  icon,
  badge = null, // <-- now an object like { label: "Beta" }
}) {
  return (
    <div className="h-full relative">
      {/* ⭐ Badge */}
      {badge?.label && (
        <div className="absolute -top-2 -right-3 z-10">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full 
            text-xs font-medium bg-blue-100 text-blue-700 
            border border-blue-200 shadow-sm"
          >
            {badge.label}
          </span>
        </div>
      )}

      <div
        className="relative flex flex-col overflow-hidden w-full h-full 
        bg-white border border-gray-200 rounded-2xl shadow-lg"
      >
        <div className="p-4">
          <div className="flex items-center mb-2">
            <h4 className="">{title}</h4>
          </div>
          <div className="text-gray-600 text-[16px]">{description}</div>
        </div>

        <div
          className="w-full rounded-tl-[10px] shadow-lg bg-blue-50 
          opacity-60 transition-all rounded-bl-[10px] 
          mt-auto pt-4 pl-4 overflow-hidden h-fit flex items-end"
        >
          <div className="rounded-tl-xl overflow-hidden w-full">
            {btmElements}
          </div>
        </div>
      </div>
    </div>
  );
}
