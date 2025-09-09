import Layout from "../../builders/Layout";
import BrandsBanner from "../../builders/BrandsBanner";
import Steps from "../section-6/Steps";
import CtaBtn from "../../builders/CtaBtn";
export default function Section1() {
  return (
    <section className={`bg-[#ACC8D2] relative`}>
   
      <Layout
        className={`
        
         sm:!pt-10 z-10 relative bg-[#ACC8D2]
        
        `}
      >
        <div className="col-span-12  flex flex-col justify-center items-center">
          <div
            className={`"
            w-full sm:w-6/12
            text-center
             `}
          >
            <h2 className="mb-[20px]  text-center">
              Splitify <span className="gradient-text">saves you</span> time and
              stress.
            </h2>
            <p className="w-5/6 mx-auto flex-col flex gap-4 text-center">
              <div>Share bills with roomates or friends?</div>
              <div>Share bills that keep changing?</div>
              <div>Tired of chasing payments?</div>

              <div className="mt-[15px]">
                Splitify is the solution for you.
              </div>
              <CtaBtn text="Try For Free" className={"mx-auto"} />

              {/* 
              <div>You shouldn't have to be the group bill manager.</div>{" "}
              <div>Let Splitify do the work for you.</div> */}
            </p>
          </div>
          
        </div>
      </Layout>
    </section>
  );
}
