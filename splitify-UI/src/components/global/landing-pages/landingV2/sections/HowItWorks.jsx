import SectionIndicator from "../builders/SectionIndicator";
import CtaBtn from "../builders/CtaBtn";
export default function HowItWorks() {
  const stepCards = [
    {
      title: "Choose your crew",
      description:
        "Choose friends to split with. Pick from recent contacts or add someone new.",
    },
    {
      title: "Set the split",
      description:
        "Decide how to split the bill. Evenly, by percentage, or custom amounts.",
    },
    {
      title: "Hit send",
      description:
        "Splitify sends payment requests and reminders via email and text, with tracking.",
    },
  ];

  return (
    <section>
      <div className="constrained-width">
        <SectionIndicator title="How it works" />
        <div className="flex gap-20">
          <h2>Split bills in <br></br> 3 simple steps</h2>
          <div className="ml-auto max-w-[330px]">
            <p>
              No calculators. No group chats. No excel sheets. Just splits that
              actually get paid.
            </p>
            <CtaBtn
              variation={"Landing-v2-HowItWorks-TEST-A"}
              whiteArrow={true}
              className={`sm:mt-[50px] w-fit font-semibold !mt-8 px-6 py-3 
                                 shadow-lg cursor-pointer hover:bg-blue-700 transition-all`}
            />
          </div>
        </div>

        {/* steps */}
        <div className="mt-12 grid gap-6 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 auto-rows-fr">
          {stepCards.map((step, index) => (
            <StepCard
              key={index}
              number={index + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ number, title, description, img }) {
  return (
    <div className="w-full flex flex-col h-[400px] border border-gray-200 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center mb-3">
        <span className="rounded-[60px] flex-shrink-0 text-white mr-4 w-8 h-8 flex items-center justify-center primary-color">
          {number}
        </span>
        <h3 className="whitespace-nowrap">{title}</h3>
      </div>
      <p className="">{description}</p>
      <div className="w-full h-full mt-6 rounded-[30px] bg-blue-50"></div>
    </div>
  );
}
