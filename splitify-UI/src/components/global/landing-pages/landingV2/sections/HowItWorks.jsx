import SectionIndicator from "../builders/SectionIndicator";
import CtaBtn from "../builders/CtaBtn";
import demo1Img from "../assets/demo-1-tall.png";
import demo2Img from "../assets/demo-2.png";
import demo3Img from "../assets/demo-3.png";
export default function HowItWorks() {
  const stepCards = [
    {
      title: "Choose your crew",
      description:
        "Choose friends to split with. Pick from recent contacts or add someone new.",
      imgSrc: demo3Img,
    },
    {
      title: "Set the split",
      description:
        "Decide how to split the bill. Evenly, by percentage, or custom amounts.",
      imgSrc: demo2Img,
    },
    {
      title: "Hit send",
      description:
        "Splitify sends payment requests and reminders via email and text, with tracking.",
      imgSrc: demo1Img,
    },
  ];

  return (
    <section id="howItWorks" className="p-[clamp(1rem,5vw,2.5rem)]">
      <div className="constrained-width">
        <SectionIndicator title="How it works" />
        <div className="flex gap-y-[1rem] gap-x-20 flex-wrap justify-between">
          <h2>
           <span className="whitespace-nowrap"> Split bills in</span> <br></br><span className="">3 simple steps</span>
          </h2>
          <div className="max-w-[330px] flex flex-col gap-[clamp(1rem,1vw,1.25rem)]">
            <p className="text-gray-600">
              No calculators. No group chats. No excel sheets. Just splits that
              actually get paid.
            </p>
            <CtaBtn
              variation={"Landing-v2-HowItWorks-TEST-A"}
              whiteArrow={true}
              className={` w-fit font-semibold mt-0 px-6 py-3 
                                 shadow-lg cursor-pointer hover:bg-blue-700 transition-all`}
            />
          </div>
        </div>

        {/* steps */}
        <div className="mt-12 grid gap-5 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 auto-rows-fr">
          {stepCards.map((step, index) => (
            <StepCard
              key={index}
              number={index + 1}
              title={step.title}
              description={step.description}
              imgSrc={step.imgSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ number, title, description, imgSrc }) {
  return (
    <div className="w-full flex flex-col h-[390px] bg-white border border-gray-200 rounded-2xl shadow-lg">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <span className="rounded-[60px] flex-shrink-0 text-white mr-4 w-8 h-8 flex items-center justify-center primary-color">
            {number}
          </span>
          <h3 className="">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="w-full h-full mt-6 rounded-tr-[20px] rounded-tl-[20px] opacity-60  bg-blue-50 relative overflow-hidden">
        <img
          className="absolute left-[24px] top-[24px] rounded-2xl"
          src={imgSrc}
        />
      </div>
    </div>
  );
}
