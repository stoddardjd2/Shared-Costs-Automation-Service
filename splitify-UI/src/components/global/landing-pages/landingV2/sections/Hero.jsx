import CtaBtn from "../builders/CtaBtn";
import dashboardImg from "../assets/dashboard-high-res.png";
import Star from "../assets/Star";
import overdueTextPhoneImg from "../assets/overdueTextPhone.png";
import {
  VenmoLogo,
  CashAppLogo,
  GooglePayLogo,
  PayPalLogo,
  AppleLogo,
  ZelleLogo,
} from "../assets/brandLogos";
import { Backpack } from "lucide-react";

const Logos = [
  VenmoLogo,
  CashAppLogo,
  GooglePayLogo,
  PayPalLogo,
  AppleLogo,
  ZelleLogo,
];

export default function Hero() {
  return (
    <section
      className="min-h-[100vh] pt-16 relative "
      style={
        // {
        //   background: "rgba(179, 220, 250, 1.0)",
        //   background:
        //     "radial-gradient(at right bottom, rgba(179, 220, 250, 1.0), rgba(72, 156, 219, 1.0))",
        // }
        {
          background: "#E3F2FD",
          background:
            " linear-gradient(130deg,rgba(227, 242, 253, 1) 0%, rgba(225, 246, 251, 1) 66%, rgba(130, 184, 255, 1) 100%)",
        }
        //   {
        //   backgroundImage:
        //     "linear-gradient(130deg, rgba(255, 234, 235, 1) 0%, rgba(254, 218, 218, 1) 50%, rgba(255, 214, 158, 1) 100%)",
        // }
      }
    >
      <div className="relative z-10">
        {/* copy */}
        <div className="mt-28">
          <p className="text-center mx-auto px-4 py-2 mb-4 rounded-[60px] bg-white/90 text-gray-700 font-normal w-fit">
            *LIMITED TIME* New users can now use Splitify free of charge with
            unlimited requests and texts.
          </p>
          <h1 className="text-center mb-2">Split bills, not friendships.</h1>
          <p className="text-center">Splitify sends text messages for you until you get paid.</p>
          <p className="text-center font-semibold">
            No chasing. No awkward follow-ups.
          </p>

          <CtaBtn
            variation={"Landing-v2-HERO-TEST-A"}
            whiteArrow={true}
            className={`sm:mt-[50px] w-fit mx-auto font-semibold !mt-8 px-6 py-3 
                   shadow-lg cursor-pointer hover:bg-blue-700 transition-all`}
          />

          {/* <CtaBtn
          variation={"Landing-v2-HERO-TEST-A"}
          className={`sm:mt-[50px] w-fit mx-auto font-semibold !mt-8 px-6 py-3 
                   rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-all bg-white !text-[#222222]`}
        /> */}
        </div>


        {/* dashboard image w/ border */}
        <div className="mt-10 constrained-width">
          <div className=" p-4 bg-gray-200/50 rounded-3xl border border-gray-300">
            <img
              src={dashboardImg}
              alt="Dashboard demo"
              className="w-full mx-auto rounded-3xl border border-gray-300"
            />
          </div>
        </div>

        <img
          src={overdueTextPhoneImg}
          alt="overdue text demo"
          className="w-[300px] absolute bottom-[100px] right-[300px]"
        />

        {/*  banner */}
        <div className="sticky bottom-0 bg-white py-6 shadow-sm border border-gray-200 mt-10">
          <div className="constrained-width">
            <PaymentLogos />
          </div>
        </div>
      </div>

      {/* Fixed stars */}
      <Star className="absolute top-0 w-32 right-10 z-0" />
      <Star className="absolute top-[-100px] w-24 left-10 z-0" />
    </section>
  );
}

export function PaymentLogos() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <span className="text-gray-600">Get paid your way</span>
      {Logos.map((Logo, i) => (
        <div key={i} className="h-10 flex items-center">
          <Logo className="h-full px-2 w-auto" />
        </div>
      ))}
    </div>
  );
}
