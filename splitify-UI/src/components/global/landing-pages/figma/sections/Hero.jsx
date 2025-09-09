// import heroDashboardPcImg from "../../../../../assets/landing-page/hero-dashboard-pc.png";
import heroDashboardTabletImg from "../../../../../assets/landing-page/hero-dashboard-tablet-zoom.png";
import heroDashboardTabletBorderImg from "../../../../../assets/landing-page/hero-dashboard-tablet-border.png";
import heroPhoneImg from "../../../../../assets/landing-page/hero-phone.png";
import heroPhoneImg2 from "../../../../../assets/landing-page/hero-phone-2.png";
import Body from "../builders/Body";
import CtaBtn from "../builders/CtaBtn";
export default function Hero() {
  return (
    <section
      className={` 
        justify-center flex overflow-hidden relative bg-no-repeat
        
        sm:h-[1100px] 
        [background:radial-gradient(52.87%_92.69%_at_53.89%_92.69%,_#075C7B_31.33%,_#022B3A_71.02%,_#0C0C0C_100%)]
        sm:[background:radial-gradient(62.5%_175.13%_at_97.01%_48.68%,_#fff_0%,_#075C7B_31.33%,_#022B3A_71.02%,_#0C0C0C_100%),_radial-gradient(58.45%_56.88%_at_46.87%_72.42%,_#fff_0%,_#4167BC_29.12%,_#1F386F_50.48%,_#0C0C0C_100%)]
        
    `}
      style={{ backgroundAttachment: "fixed" }}
    >
      <div
        className={`max-w-[1440px] grid grid-cols-12 gap-5
          px-4 sm:px-10
          [box-sizing:border-box] 
          items-start sm:items-center
          mt-20 sm:mt-0 
          justify-center`}
      >
        <div
          className={`
          flex flex-col 
          px-[10px] sm:pl-[20px] 
          col-span-12 sm:col-span-6 
          justify-center sm:justify-start 
          sm:h-[608px]
          text-center sm:text-left
          `}
        >
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
          <CtaBtn
            className={`mt-[30px]
            mx-auto sm:mx-0
            `}
          />

          {/* FOR SMALL VIEW */}
          <div className={`sm:hidden w-10/12 mx-auto relative h-[400px]`}>
            <img
              className={`
                mt-[60px]
                absolute
                  top-[30px]
            `}
              src={heroDashboardTabletBorderImg}
            />
            <img
              className={`absolute 
                top-[50px]
              right-[-10px]  
              w-[163px] z-2`}
              src={heroPhoneImg2}
            />
          </div>
        </div>

        {/* large view */}
        <div
          className={`relative  
           hidden sm:inline
          col-span-6 
          sm:ml-10
          mx-auto sm:mx-0
          `}
        >
          <img
            className={`
          static
          bottom-[-300px] sm:top-auto
          right-[20px]
          translate-x-[-20px]

            `}
            src={heroDashboardTabletBorderImg}
          />
          <img
            className={`absolute 
              bottom-[-250px] sm:bottom-[-40px] 
              right-[0px]  
              w-[20vw] z-2`}
            src={heroPhoneImg2}
          />
        </div>
      </div>
    </section>
  );
}
