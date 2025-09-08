import dashboardDemoPhoneImg from "./dashboard-demo-phone.png";


export default function View({ image, features, header, body }) {
  return (
    <>
      <img src={dashboardDemoPhoneImg} className="col-span-3"></img>
      <div className="col-span-3 flex-col justify-center gap-10 flex">
        {features.map((feature, index) => (
          <Feature svg={feature.svg} label={feature.label} key={index} />
        ))}
      </div>
      <div className="col-span-6 my-auto">
        <div className="flex flex-col gap-[16px] w-8/12 mx-auto">
          <h3 className="text-white">{header}</h3>
          <p className="text-[#EAEAEA] medium-body">{body}</p>
        </div>
      </div>
    </>
  );
}

function Feature({ svg, label }) {
  return (
    <div className="bg-[#848484]/[53%] min-h-[55px] flex gap-3 items-center p-2 rounded-xl">
      <div className="w-[34px] flex-shrink-0 flex items-center justify-center">
        {svg}
      </div>
      <span className="feature text-white">{label}</span>
    </div>
  );
}
