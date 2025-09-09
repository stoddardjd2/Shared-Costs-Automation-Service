export default function View({ image, features, header, body }) {
  return (
    <>
      <div className="col-span-12 hidden sm:grid grid-cols-12 gap-y-[270px]">
        <div className="col-span-6 size-[555px] relative bg-feature-gradient rounded-3xl shadow-2xl">
          <img
            src={image}
            className="w-[320px] absolute bottom-[-30px] left-[-30px]"
          ></img>
          <div className="absolute top-20 left-[320px] flex-col justify-center gap-10 flex">
            {features.map((feature, index) => (
              <Feature svg={feature.svg} label={feature.label} key={index} />
            ))}
          </div>
        </div>
        <div className="col-span-6 my-auto">
          <div className="flex flex-col gap-[16px] w-8/12 mx-auto">
            <h3 className="text-white">{header}</h3>
            <p className="text-[#EAEAEA] medium-body">{body}</p>
          </div>
        </div>
      </div>

      {/* small screen*/}
      <div className="sm:hidden col-span-12 grid grid-cols-12 gap-y-[50px]">
        <div className="col-span-12 my-auto">
          <div className="flex flex-col gap-[16px] w-12/12 mx-auto text-center">
            <h3 className="text-white">{header}</h3>
            <p className="text-[#EAEAEA] medium-body">{body}</p>
          </div>
        </div>

        <div className="flex-wrap col-span-12 justify-center items-center gap-4 flex">
            {features.map((feature, index) => (
              <Feature svg={feature.svg} label={feature.label} key={index} />
            ))}
        </div>

        <img src={image} className="w-[320px] mx-auto col-span-12"></img>
      </div>
    </>
  );
}

function Feature({ svg, label }) {
  return (
    <div className="bg-[#848484]/[53%] min-h-[55px] flex gap-3 items-center p-2 rounded-xl w-fit px-4">
      <div className="w-[34px] flex-shrink-0 flex items-center justify-center">
        {svg}
      </div>
      <span className="feature text-white whitespace-nowrap">{label}</span>
    </div>
  );
}
