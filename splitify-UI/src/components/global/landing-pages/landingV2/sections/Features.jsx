import SectionIndicator from "../builders/SectionIndicator";
import feature1 from "../assets/feature-1-blue.png";
import feature2 from "../assets/feature-2-blue.png";
import feature3 from "../assets/feature-3.png";
import feature4 from "../assets/feature-4.png";
const features = [
  {
    title: "Splits update automatically",
    description:
      "Never check a utility site again. Splitify automatically updates split amounts as bills change.",
    btmElements: <img className="h-fit rounded-xl shadow-md" src={feature1} />,
  },
  {
    title: "Easy to pay",
    description:
      "Splitify sends a link to your crew so they can pay anyway they want. No app needed.",
    btmElements: <img className="h-fit" src={feature4} />,
  },
  {
    title: "Recurring splits",
    description:
      "Automate splits for utilites, Wi-Fi, or subscriptions. Set it once, forget the rest.",
    btmElements: <img className="h-fit rounded-xl shadow-md" src={feature2} />,
  },
  {
    title: "Smart Reminders",
    description:
      "Splitify sends customizable text and email reminders, so you actually get paid.",
    btmElements: <img className="h-fit" src={feature3} />,
  },
];

export default function Features() {
  return (
    <section id="features">
      <div className="constrained-width">
        <SectionIndicator className={"mx-auto"} title={"Features"} />
        <h2 className="text-center">It's more than just a split button</h2>
        <p className="text-center mt-4 w-3/5 mx-auto">
          Splitify automates shared payments so you don't have to worry or waste
          time. <br></br>Fast, friendly, reliable.
        </p>

        {/* features grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 auto-rows-fr">
          {features.map((feature, index) => (
            <FeatureCard
              title={feature.title}
              description={feature.description}
              btmElements={feature.btmElements}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ btmElements, title, description }) {
  return (
    <div className="w-full flex flex-col bg-white h-[300px] border border-gray-200 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center mb-3">
        <h3 className="">{title}</h3>
      </div>
      <p className="">{description}</p>
      <div className="w-full overflow-hidden h-fit mt-auto p-2 flex items-end rounded-[30px]">
        {btmElements}
      </div>
    </div>
  );
}
