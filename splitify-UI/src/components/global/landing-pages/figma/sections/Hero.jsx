// import heroDashboardPcImg from "../../../../../assets/landing-page/hero-dashboard-pc.png";
import heroDashboardTabletImg from "../../../../../assets/landing-page/hero-dashboard-tablet-zoom.png";
import heroPhoneImg from "../../../../../assets/landing-page/hero-phone.png";
import heroPhoneImg2 from "../../../../../assets/landing-page/hero-phone-2.png";
import Body from "../builders/Body";
import CtaBtn from "../builders/CtaBtn";
export default function Hero() {
  return (
    <section
      className={` h-[1100px] justify-center flex overflow-hidden relative
        [background:radial-gradient(62.5%_175.13%_at_97.01%_48.68%,_#fff_0%,_#075C7B_31.33%,_#022B3A_71.02%,_#0C0C0C_100%),_radial-gradient(58.45%_56.88%_at_46.87%_72.42%,_#fff_0%,_#4167BC_29.12%,_#1F386F_50.48%,_#0C0C0C_100%)]
         bg-no-repeat"
    `}
    style={{backgroundAttachment:"fixed"}}
    >
      <div
        className="max-w-[1440px] grid grid-cols-12 gap-5 items-center justify-center
       
      "
      >
        <div className="col-span-6 flex flex-col pl-[20px] h-[608px]">
          <p className="text-white smaller font-thin mb-5">
            *UPDATE* New users can now use Splitify free of charge with
            unlimited requests and texts.
          </p>
          <h1 className="flex flex-col text-white mb-[18px]">
            <span>Bills split.</span>
            <span>Texts & emails sent.</span>
            <span>Follow-ups handled.</span>
          </h1>
          <p className="text-white">
            Stop stressing about bills. Splitify handles requests, follow-ups,
            and tracking - so you don’t have to. Oh, and it can automatically
            detect and adjust when costs change.
          </p>
          <CtaBtn className={"mt-[50px]"} />
        </div>

        <div className="relative col-span-6 ml-10">
          <img className="" src={heroDashboardTabletImg} />
          <img
            className="absolute bottom-[-40px] right-[10px] w-[223px] z-2"
            src={heroPhoneImg}
          />
        </div>
      </div>
    </section>
  );
}
