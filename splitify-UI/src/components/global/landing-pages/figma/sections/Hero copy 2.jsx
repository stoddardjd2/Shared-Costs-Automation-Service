import Body from "../builders/Body";
import CtaBtn from "../builders/CtaBtn";

// Tablet frame (the large dashboard/tablet image)
import heroDashboardTabletBorderImg from "../../../../../assets/landing-page/hero-dashboard-tablet-border.png?w=600;730;900;1200&format=avif;webp;jpg&quality=80&as=picture";

// Phone image (used in both small and large views)
import heroPhoneImg2 from "../../../../../assets/landing-page/hero-phone-2.png?w=180;240;320;400;520&format=avif;webp;jpg&quality=80&as=picture";

export default function Hero() {
  const test = { test: "value", valie2: "value2" };
  console.log("test");
  console.log(
    "test map",
    test.map((item, index) => {
      console.log("item", item);
    })
  );
  console.log(
    "debug",
    heroDashboardTabletBorderImg.map((item, index) => {
      console.log("item", item);
    })
  );

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
            className={`mt-[30px] mx-auto lg:mx-0 text-white font-semibold px-6 py-3 
             rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-all`}
          />

          {/* SMALL VIEW (lg:hidden) */}
          <div className={`lg:hidden w-10/12 mx-auto relative h-[400px]`}>
            {/* Tablet frame */}
            <picture
              className="block"
              style={{ position: "absolute", top: "30px", insetInlineStart: 0 }}
            >
              {heroDashboardTabletBorderImg.sources.map((s) => (
                <source
                  key={s.type}
                  type={s.type}
                  srcSet={s.srcset}
                  sizes="83vw"
                />
              ))}
              <img
                src={heroDashboardTabletBorderImg.img.src}
                width={heroDashboardTabletBorderImg.img.width}
                height={heroDashboardTabletBorderImg.img.height}
                alt="Hero dashboard demo"
                className="mt-[60px]"
                loading="lazy"
                decoding="async"
              />
            </picture>

            {/* Phone overlay */}
            <picture className="block">
              {heroPhoneImg2.sources.map((s) => (
                <source
                  key={s.type}
                  type={s.type}
                  srcSet={s.srcset}
                  sizes="40vw"
                />
              ))}
              <img
                src={heroPhoneImg2.img.src}
                width={heroPhoneImg2.img.width}
                height={heroPhoneImg2.img.height}
                alt="Hero Phone text message demo for overdue payment"
                className="absolute top-[40px] right-[-10px] w-[203px] z-2"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>

        {/* LARGE VIEW (lg:block) */}
        <div
          className={`
            relative hidden lg:inline
            col-span-6 
            lg:ml-10
            mx-auto lg:mx-0
            lg:mb-24
            max-w-[730px]
            !ml-auto
          `}
        >
          {/* Tablet frame */}
          <picture className="block">
            {heroDashboardTabletBorderImg.sources.map((s) => (
              <source
                key={s.type}
                type={s.type}
                srcSet={s.srcset}
                sizes="(min-width:1024px) 730px, 100vw"
              />
            ))}
            <img
              src={heroDashboardTabletBorderImg.img.src}
              width={heroDashboardTabletBorderImg.img.width}
              height={heroDashboardTabletBorderImg.img.height}
              alt="Hero dashboard demo"
              className="static right-[20px] translate-x-[-20px]"
              loading="eager" // likely LCP
              fetchPriority="high" // hint for LCP
              decoding="async"
            />
          </picture>

          {/* Phone overlay */}
          <picture className="block">
            {heroPhoneImg2.sources.map((s) => (
              <source
                key={s.type}
                type={s.type}
                srcSet={s.srcset}
                sizes="(min-width:1024px) 15vw, 40vw"
              />
            ))}
            <img
              src={heroPhoneImg2.img.src}
              width={heroPhoneImg2.img.width}
              height={heroPhoneImg2.img.height}
              alt=""
              className="absolute bottom-[-250px] lg:bottom-[-40px] right-[0px] w-[15vw] z-2"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
