import Layout from "../../builders/Layout";
import Steps from "./Steps";
import CtaBtn from "../../builders/CtaBtn";
export default function Section6() {
  return (
    <section className={`bg-[#ACC8D2]`}>
      <Layout className="!pb-0 sm:!pb-6">
        <div className="col-span-12">
          <div
            className={`
                sm:max-w-[500px]
             mx-auto`}
          >
            <h1 className="mx-auto mb-[10px] text-center sm:mx-auto sm:text-center">How it works.</h1>
            <Steps />
          </div>
          <CtaBtn text="Try Now Free" className={"mx-auto"} />
        </div>
      </Layout>
    </section>
  );
}
