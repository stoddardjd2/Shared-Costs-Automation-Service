import Layout from "../../builders/Layout";
import CtaBtn from "../../builders/CtaBtn";
import phoneImg from "../../../../../../assets/landing-page/phone-tilt-overdue-mild.png";
import phoneImgFlat from './overdue-text-flat.png'
export default function Section3() {
  return (
    <section
      className={` flex items-center relative
                bg-[#ACC8D2]`}
    >
      <Layout>
        <div
          className={`
        sm:col-start-1 
        order-2 sm:order-1
        mt-20 sm:mt-0
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
          <h2 className="mb-[20px]">
            Splitify handles the talking, so you can{" "}
            <span className="gradient-text">Relax.</span>
          </h2>
          <p
            className={`
            
            w-full sm:w-5/6`}
          >
            Splitify sends text and email messages for you, so you don't have to
            do a thing. Just add a bill and hit send.
          </p>
          <CtaBtn
            text="Send a Request"
            className={`
            mx-auto sm:mx-0`}
          />
        </div>
      </Layout>

      {/* rounded overlay on bottom */}
      <div class="absolute z-20 bottom-[-55px] h-[55px] rounded-b-[40px] shadow-[0_20px_20px_rgba(0,0,0,0.25)] bg-[#ACC8D2] w-full"></div>
    </section>
  );
}
