import Layout from "../../builders/Layout";
import CtaBtn from "../../builders/CtaBtn";
import phoneImg from "../../../../../../assets/landing-page/phone-tilt-overdue.png";
export default function Section3() {
  return (
    <section
      className={` flex items-center
                bg-section-gradient-reverse`}
    >
      <Layout>
        <div className="col-start-1 col-span-3 flex items-center">
          <img src={phoneImg} alt="overdue messages via text example" />
        </div>
        <div className="col-span-8 col-start-5 flex justify-center flex-col">
          <h2 className="mb-[20px]">
            Splitify handles the talking,
             so you can{" "}
            <span className="gradient-text">Relax.</span>
          </h2>
          <p className="w-5/6">
            Splitify saves you time and stress with its intelligent features
            that you can’t find anywhere else. Say goodbye to awkward conversations.
          </p>
          <CtaBtn text="Try Now Free" />
        </div>
      </Layout>
    </section>
  );
}
