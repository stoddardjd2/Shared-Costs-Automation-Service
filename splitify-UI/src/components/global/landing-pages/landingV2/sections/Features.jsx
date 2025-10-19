import SectionIndicator from "../builders/SectionIndicator";
import feature1 from "../assets/feature-1-blue.png";
import feature2 from "../assets/feature-2-blue.png";
import feature3 from "../assets/feature-3.png";
import feature4 from "../assets/feature-4.png";
const features = [
  {
    title: "Splits update automatically",
    description:
      "If bills changed, Splitify updates split amounts before sending again.",
    btmElements: (
      <div>
        {/* <p className="text-gray-500 italic mb-2">
          Perfect for utilities or other shared bills that change.
        </p> */}
        <img className="h-fit rounded-xl shadow-md" src={feature1} />
      </div>
    ),
  },
  {
    title: (
      <div>
        Simple <br className="hidden [@media(min-width:580px)]:inline"></br>{" "}
        payments
      </div>
    ),
    description:
      "Splitify sends a link to your crew so they can pay anyway they want.",
    btmElements: (
      <div className="">
        {/* <p className="text-gray-500 italic mb-2">
         No app needed. 100% free.
        </p> */}
        <img className="h-fit -translate-x-2" src={feature4} />
      </div>
    ),
  },
  {
    title: (
      <div>
        Recurring <br className="hidden [@media(min-width:580px)]:inline"></br>{" "}
        splits
      </div>
    ),
    description:
      "Automate splits for utilites, Wi-Fi, or subscriptions. Set it once, forget the rest.",
    btmElements: <img className="h-fit rounded-xl shadow-md" src={feature2} />,
  },
  {
    title: (
      <div>
        Smart <br className="hidden [@media(min-width:580px)]:inline"></br>
        Reminders
      </div>
    ),
    description: (
      <div>
        Splitify sends email <span className="italic font-medium">and</span> text messages, so your requests
        actually get paid.
      </div>
    ),
    btmElements: <img className="h-fit -translate-x-2" src={feature3} />,
  },
];

export default function Features() {
  return (
    <section id="features">
      <div className="constrained-width  p-[clamp(1rem,5vw,2.5rem)]">
        <SectionIndicator className={"mx-auto"} title={"Features"} />
        <h2 className="text-center">It's more than just a split button</h2>
        <p className="text-center mt-4 lg:w-3/5 mx-auto text-gray-600">
          Splitify does the work for you, so you dont don't have to worry or
          waste time. <br></br>
          <div className="mt-2 italic text-gray-600">
            Fast, friendly, reliable.
          </div>
        </p>

        {/* features grid */}
        <div className="mt-14 grid gap-6 auto-rows-fr grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
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
    <div className="flex flex-col bg-white  border border-gray-200 rounded-2xl shadow-lg">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <h3 className="">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="w-full  mt-auto p-4 overflow-hidden h-fit max-w-[300px]mt-auto flex items-end rounded-[30px]">
        {btmElements}
      </div>
    </div>
  );
}
