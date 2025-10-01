import Layout from "../../builders/Layout";
import CtaBtn from "../../builders/CtaBtn";
import phoneImg from "../../../../../../assets/landing-page/phone-tilt-overdue-mild.png?format=webp&quality=80&as=src";
import phoneImgFlat from "./overdue-text-flat.png?format=jpg&quality=80&as=src";
export default function Section3() {
  return (
    <section
      className={` flex items-center relative
                bg-landing-main`}
    >
      <Layout className="pt-0 lg:pt-10">
        <div
          className={`
        sm:col-start-1 
        order-2 sm:order-1
        mt-[35px] sm:mt-0
        col-span-12 sm:col-span-4
          flex items-center
          `}
        >
          <img
            src={phoneImg}
            alt="overdue messages via text example"
            className={`
             mx-auto sm:mx-0
              max-h-[80vh]
              hidden sm:flex
            `}
          />
          <img
            src={phoneImgFlat}
            alt="overdue messages via text example"
            className={`
             mx-auto sm:mx-0
              max-h-[80vh]
              flex sm:hidden
            `}
          />
        </div>
        <div
          className={`
           order-1 sm:order-2
          col-span-12 sm:col-span-7 
          sm:col-start-7 
          flex justify-center flex-col
          text-center sm:text-left
          `}
        >
          <h1 className="mb-[20px]">
            <span className="gradient-text"> Save </span>
            time, money & relationships.
            {/* <span className="gradient-text"> save </span> */}
            {/* <span className="gradient-text"> save </span> */}
          </h1>
          <p
            className={`
            
            w-full sm:w-5/6`}
          >
            Splitify handles follow-ups—texting and emailing until the bill is paid. That means more time back in your day, more money in your pocket, and less strain on your relationships.
          </p>
          <CtaBtn
            text="Send a Request"
            className={`
            mx-auto sm:mx-0`}
          />
        </div>
      </Layout>
    </section>
  );
}
