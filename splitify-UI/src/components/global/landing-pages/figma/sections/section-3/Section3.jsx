import Layout from "../../builders/Layout";
import CtaBtn from "../../builders/CtaBtn";
import phoneImg from "../../../../../../assets/landing-page/phone-tilt-overdue.png";
export default function Section3() {
  return (
    <section
      className={` flex items-center
                bg-[#ACC8D2]`}
    >
      <Layout>
        <div
          className={`
        sm:col-start-1 
        order-2 sm:order-1
        mt-20 sm:mt-0
        col-span-12 sm:col-span-3 
          flex items-center`}
        >
          <img
            src={phoneImg}
            alt="overdue messages via text example"
            className={`
            w-11/12 sm:w-12/12
             mx-auto sm:mx-0
            `}
          />
        </div>
        <div
          className={`
          
          col-span-12 sm:col-span-8 
          sm:col-start-5 
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
    </section>
  );
}
