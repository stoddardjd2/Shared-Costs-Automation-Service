import Layout from "../../builders/Layout";
import CtaBtn from "../../builders/CtaBtn";
export default function Section5() {
  return (
    <section
      //   className={`bg-cta-gradient`}
      className="bg-section-gradient"
    >
      <Layout className={""}>
        <div className="col-span-12 mx-auto text-center">
          <h2 className="flex flex-col mb-[23px]">
            <span>Less Stress.</span>
            <span>More Time.</span>
            <span>Start For Free.</span>
          </h2>
          <p className="">Say goodbye to being the group bill manager.</p>
          <CtaBtn text={"Sign Up Free"} className={"mx-auto"} />
        </div>
      </Layout>
    </section>
  );
}

/* Frame 5 */
