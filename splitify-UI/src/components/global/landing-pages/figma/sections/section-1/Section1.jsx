import Layout from "../../builders/Layout";
import BrandsBanner from "./BrandsBanner";
import Steps from "./Steps";
import CtaBtn from "../../builders/CtaBtn";
export default function Section1() {
  return (
    <section className={`bg-[#ACC8D2] relative`}>
      <div className="absolute left-0 rounded-banner top-[-130px] bg-[#ACC8D2] w-full">
        <BrandsBanner />
      </div>

      <Layout className={`
        
        pt-[4vw] sm:"!pt-0"
        
        `}>
        <div className="col-span-12">
          <div className={`"
            w-full sm:w-6/12
             mx-auto text-center"`}>
            <h2 className="mb-[20px]  text-center">
              Splitify <span className="gradient-text">saves you</span> time and
              stress.
            </h2>
            <p className="w-5/6 mx-auto text-center">
              <div>You shouldn't have to be the group bill manager.</div>{" "}
              <div>Let Splitify do the work for you.</div>
            </p>
          </div>

        </div>

        <div className="col-span-12 mt-4">
          <div className={`
             sm:w-5/12
             mx-auto`}>
            <Steps />
          </div>
          <CtaBtn text="Try Now Free" className={"mx-auto"} />

        </div>
      </Layout>
    </section>
  );
}
