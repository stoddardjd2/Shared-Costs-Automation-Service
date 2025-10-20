import Star from "../assets/Star";
import CtaBtn from "../builders/CtaBtn";
import splittingPhoneImg from "../assets/splittingPhone.png";
import heroBg from "../assets/hero-bg.png"; // ✅ bundler-friendly

export default function ClosingCta() {
  return (
    <section
      className="relative mb-0"
      style={
        // {
        //   background: "rgba(179, 220, 250, 1.0)",
        //   background:
        //     "radial-gradient(at right bottom, rgba(179, 220, 250, 1.0), rgba(72, 156, 219, 1.0))",
        // }
        {
          // background: "#E3F2FD",
          // background:
          //   " linear-gradient(130deg,rgba(227, 242, 253, 1) 0%, rgba(225, 246, 251, 1) 76%, rgba(170, 203, 247) 100%)",
          background: `url(${heroBg})`,
          backgroundRepeat: "no-repeat" /* prevents tiling */,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
        //   {
        //   backgroundImage:
        //     "linear-gradient(130deg, rgba(255, 234, 235, 1) 0%, rgba(254, 218, 218, 1) 50%, rgba(255, 214, 158, 1) 100%)",
        // }
      }
    >
      <div className="constrained-width relative z-10 p-[clamp(1rem,5vw,2rem)]">
        <div className="flex-col-reverse md:flex-row flex justify-between gap-[clamp(1rem,5vw,5rem)] ">
          <div className="">
            <img
              src={splittingPhoneImg}
              className="mx-auto md:-translate-x-4  w-[clamp(20rem,30rem+20vw,60rem)]"
            />
          </div>

          <div className="my-auto">
            <h2 className="text-center md:text-start">
              Make your next split the easiest one yet.
            </h2>
            <p className="mt-4 w-9/12 mx-auto md:mx-0 text-center md:text-start">
              Splitify keeps things clear, quick and friendly. No follow-ups. No
              confusion. Works with any payment app.
            </p>
            <CtaBtn
              animate={true}
              variation={"Landing-v2-ClosingCTA-TEST-A"}
              whiteArrow={true}
              className={`sm:mt-[50px] mx-auto md:mx-0 w-fit font-semibold !mt-8 px-6 py-3 
                   shadow-lg cursor-pointer hover:bg-blue-700 transition-all`}
            />
          </div>
        </div>
      </div>

      {/* Fixed stars */}
      <Star className="absolute top-[-15rem] md:top-0 w-32 right-[-2rem] md:right-10 z-0" />
      <Star className="absolute top-[-150px] md:top-[-100px] w-24 left-10 z-0" />
    </section>
  );
}
