import CtaBtn from "../builders/CtaBtn";
import RenderPicture from "../builders/RenderPicture";
// Tablet frame
import heroDashboardTabletBorderImg from "../../../../../assets/landing-page/hero-dashboard-tablet-border.png?w=600;730;900;1200&format=avif;webp;png&quality=80&as=picture";

// Phone overlay
import heroPhoneImg2 from "../../../../../assets/landing-page/hero-phone-2.png?w=180;240;320;400;520&format=avif;webp;png&quality=80&as=picture";

// --- Hero component ---
export default function Hero() {
  return (
    <section
      className={` 
        justify-center flex overflow-hidden relative bg-no-repeat
        lg:h-[1100px] 
        [background:radial-gradient(52.87%_92.69%_at_53.89%_92.69%,_#075C7B_31.33%,_#022B3A_71.02%,_#0C0C0C_100%)]
        lg:bg-[radial-gradient(62.5%_175.13%_at_97.01%_48.68%,_#075C7B_31.33%,_#022B3A_71.02%,_#0C0C0C_100%),radial-gradient(58.45%_56.88%_at_46.87%_72.42%,_#FFFFFF_0%,_#4167BC_29.12%,_#1F386F_50.48%,_#0C0C0C_100%)]
    `}
    >
      <div
        className={`grid grid-cols-12 gap-5
          px-4 lg:px-20
          [box-sizing:border-box] 
          items-start lg:items-center
          mt-20 lg:mt-0 
          justify-center`}
      >
        <div
          className={`
            flex flex-col 
            px-[10px] lg:pl-[20px] 
            col-span-12 lg:col-span-6 
            justify-center lg:justify-start
            lg:h-[608px]
            text-center lg:text-left
          `}
        >
          <p className="text-white smaller font-thin mb-5">
            *LIMITED TIME* New users can now use Splitify free of charge with
            unlimited requests and texts.
          </p>

          <h1 className="text-white mb-[18px] hero-header">
            Splitify handles your shared bills, so you can{" "}
            <span className="gradient-text w-fit brightness-150">relax.</span>
          </h1>

          <p className="text-white">
            Bills split, texts & emails sent, follow-ups handled, changing costs
            automatically kept updated.
          </p>

          <CtaBtn
            variation={"Landing-1.0-HERO-TEST-A"}
            className={`sm:mt-[50px] mx-auto lg:mx-0 text-white font-semibold px-6 py-3 
             rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-all`}
          />

          {/* SMALL VIEW */}
          <div className="lg:hidden w-10/12 mx-auto relative h-[400px]">
            <RenderPicture
              picture={heroDashboardTabletBorderImg}
              sizes="83vw"
              alt="Hero dashboard demo"
              imgClassName="mt-[60px] absolute top-[30px]"
              eager
            />
            <RenderPicture
              picture={heroPhoneImg2}
              sizes="40vw"
              alt="Hero Phone text message demo for overdue payment"
              imgClassName="absolute top-[40px] right-[-10px] w-[203px] z-2"
              eager
            />
          </div>
        </div>

        {/* LARGE VIEW */}
        <div
          className={`relative hidden lg:inline
            col-span-6 
            lg:ml-10
            mx-auto lg:mx-0
            lg:mb-24
            max-w-[730px]
            !ml-auto`}
        >
          <RenderPicture
            picture={heroDashboardTabletBorderImg}
            sizes="(min-width:1024px) 730px, 100vw"
            alt="Hero dashboard demo"
            imgClassName="static right-[20px] translate-x-[-20px]"
            eager
          />
          <RenderPicture
            picture={heroPhoneImg2}
            sizes="(min-width:1024px) 15vw, 40vw"
            alt=""
            imgClassName="absolute bottom-[-250px] lg:bottom-[-40px] right-[0px] w-[15vw] z-2"
            eager
          />
        </div>
      </div>
    </section>
  );
}
