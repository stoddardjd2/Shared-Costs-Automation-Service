import Star from "../assets/Star";
import CtaBtn from "../builders/CtaBtn";
import splittingPhoneImg from '../assets/splittingPhone.png';
export default function ClosingCta() {
  return (
    <section
      className="relative"
      style={
        // {
        //   background: "rgba(179, 220, 250, 1.0)",
        //   background:
        //     "radial-gradient(at right bottom, rgba(179, 220, 250, 1.0), rgba(72, 156, 219, 1.0))",
        // }
        {
          background: "#E3F2FD",
          background:
            " linear-gradient(130deg,rgba(227, 242, 253, 1) 0%, rgba(225, 246, 251, 1) 76%, rgba(170, 203, 247) 100%)",
        }
        //   {
        //   backgroundImage:
        //     "linear-gradient(130deg, rgba(255, 234, 235, 1) 0%, rgba(254, 218, 218, 1) 50%, rgba(255, 214, 158, 1) 100%)",
        // }
      }
    >
      <div className="constrained-width ">
        <div className="flex justify-between gap-20">
          <div className="w-5/12 p-16"><img src={splittingPhoneImg}/></div>

          <div className="w-7/12 my-auto">
            <h2 className="">Make your next split the easiest one yet.</h2>
            <p className="mt-4 w-9/12">
              Splitify keeps things clear, quick and friendly. No follow-ups. No
              confusion. Works with any payment app.
            </p>
            <CtaBtn
              variation={"Landing-v2-ClosingCTA-TEST-A"}
              whiteArrow={true}
              className={`sm:mt-[50px] w-fit font-semibold !mt-8 px-6 py-3 
                   shadow-lg cursor-pointer hover:bg-blue-700 transition-all`}
            />
          </div>
        </div>
      </div>

      {/* Fixed stars */}
      <Star className="absolute top-0 w-32 right-10 z-0" />
      <Star className="absolute top-[-100px] w-24 left-10 z-0" />
    </section>
  );
}
