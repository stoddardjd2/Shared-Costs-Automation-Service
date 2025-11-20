import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SectionIndicator from "../builders/SectionIndicator";
import FadeInWrapper from "../builders/FadeInWrapper";

const faqCardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: i * 0.08,
    },
  }),
};

const faqItems = [
  {
    question: "What is Splitify actually doing for me?",
    answer:
      "Splitify acts like a neutral “bill manager” for your household. You enter a bill once, choose who owes what, and Splitify handles the math, sends text reminders with payment links, and tracks who’s paid—so you’re not chasing anyone down or updating spreadsheets.",
  },
  {
    question: "Do my roommates or friends need a Splitify account?",
    answer:
      "Nope. Only the person creating the bill needs a Splitify account. Everyone else just gets a secure text message with their amount and a link to pay—no logins or app downloads required.",
  },
  {
    question: "How do the text reminders work?",
    answer:
      "When you create a request, Splitify sends an initial text with the amount owed and a link. If someone hasn’t paid yet, Splitify sends friendly automated reminders after the due date—without you having to send an awkward text yourself.",
  },
//   {
//     question: "Will Splitify spam my roommates?",
//     answer:
//       "No. You control when reminders go out and how often. Messages are short, clear, and focused on the specific bill. You can pause reminders, cancel a request, or mark someone as paid at any time.",
//   },
  {
    question: "What payment methods can people use?",
    answer:
      "You can include payment details or links for apps like Venmo, Cash App, PayPal, Zelle, or even bank transfers. Splitify doesn’t hold your money—it just makes sure everyone knows exactly what they owe and how to pay you back.",
  },
  {
    question: "Is Splitify free?",
    answer:
      "There’s a free plan that covers everything you need to automate shared bills and reminders. Paid plans unlock extras like higher usage limits, Plaid bank connections, advanced scheduling, and more power features for heavy users.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="p-[clamp(1rem,5vw,2.5rem)] bg-gray-50 scroll-mt-24"
    >
      <div className="sm:max-w-[70%] mx-auto">
        <FadeInWrapper>
          <div className="text-center mb-10">
            <SectionIndicator className="mx-auto" title="FAQ" />
            <h2 className="mb-3">Splitify FAQs</h2>
            <p className="text-gray-600  mx-auto">
              Here’s how Splitify keeps things fair, automatic, and way less
              awkward.
            </p>
          </div>
        </FadeInWrapper>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.question}
                custom={index}
                variants={faqCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <FAQItem
                  index={index}
                  isOpen={isOpen}
                  question={item.question}
                  answer={item.answer}
                  onToggle={handleToggle}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ index, isOpen, question, answer, onToggle }) {
  const itemId = `faq-item-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        id={itemId}
        onClick={() => onToggle(index)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div>
          <p className="font-semibold text-gray-900">{question}</p>
        </div>
        <div
          className={[
            "flex items-center justify-center flex-shrink-0",
            "w-8 h-8 rounded-full bg-gray-100 border border-gray-200",
            "transition-transform duration-200",
            isOpen ? "rotate-180 bg-blue-50 border-blue-100" : "",
          ].join(" ")}
        >
          <ChevronDown
            className={[
              "w-4 h-4 transition-colors",
              isOpen ? "text-blue-600" : "text-gray-500",
            ].join(" ")}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={itemId}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: "auto", opacity: 1 },
              collapsed: { height: 0, opacity: 0 },
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="px-5 pb-4 pt-0 text-gray-600 border-t border-gray-100">
              <p className="pt-2 text-sm sm:text-[15px] leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
