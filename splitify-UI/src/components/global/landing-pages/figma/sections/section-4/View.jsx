import CtaBtn from "../../builders/CtaBtn";
import RenderPicture from "../../builders/RenderPicture";

export default function View({ image, features, header, body, text, imgAlt }) {
  return (
    <>
      <div className="col-span-12 hidden xl:grid grid-cols-12 gap-y-[270px]">
        <div className="col-span-4 size-[555px] relative rounded-3xl">
          <RenderPicture
            picture={image}
            alt={imgAlt}
            sizes="(min-width:1280px) 320px, 90vw"
            className="w-[320px] absolute bottom-[-30px] left-[-30px]"
            imgClassName="w-[320px]"
          />
          {/* <div className="absolute top-20 left-[320px] flex-col justify-center gap-10 flex">
            {features.map((feature, index) => (
              <Feature svg={feature.svg} label={feature.label} key={index} />
            ))}
          </div> */}
        </div>
        <div className="col-span-8 my-auto">
          <div className="flex flex-col gap-[16px] ml-20">
            <h3 className="text-white">{header}</h3>
            <p className="text-[#EAEAEA] mt-3 w-9/12 medium-body">{body}</p>
            <CtaBtn className="" text={text} />
          </div>
        </div>
      </div>

      {/* small screen */}
      <div className="xl:hidden max-w-[500px] mx-auto col-span-12 grid grid-cols-12 gap-y-[20px] sm:gap-y-[50px]">
        <div className="col-span-12 my-auto">
          <div className="flex flex-col gap-[16px] w-12/12 mx-auto text-center">
            <h3 className="text-white">{header}</h3>
            <p className="text-[#EAEAEA] mt-1 w-9/12 mx-auto medium-body">
              {body}
            </p>
          </div>
        </div>

        {/* <div className="flex-wrap col-span-12 justify-center items-center gap-4 flex">
          {features.map((feature, index) => (
            <Feature svg={feature.svg} label={feature.label} key={index} />
          ))}
        </div> */}

        <RenderPicture
          picture={image}
          alt={imgAlt}
          sizes="100vw"
          className="mx-auto col-span-12"
          imgClassName="w-[320px] mx-auto"
        />
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
