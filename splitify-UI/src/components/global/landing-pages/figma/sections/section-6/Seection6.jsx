import Layout from "../../builders/Layout";
import Steps from "./Steps";
import CtaBtn from "../../builders/CtaBtn";
export default function Section6() {
  return (
    <section className={`bg-[#ACC8D2]`}>
      <Layout>
        <div className="col-span-12">
          <div
            className={`
             sm:w-5/12
             mx-auto`}
          >
            <h2 className="mx-auto mb-[10px] text-center sm:ml-[20px] sm:text-center">How it works.</h2>
            <Steps />
          </div>
          <CtaBtn text="Try Now Free" className={"mx-auto"} />
        </div>
      </Layout>
    </section>
  );
}
