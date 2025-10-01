import Layout from "../../builders/Layout";
import CtaBtn from "../../builders/CtaBtn";
import RenderPicture from "../../builders/RenderPicture";

// Responsive, multi-format sources (keeps PNG for transparency fallback)
import phoneImg from "../../../../../../assets/landing-page/phone-tilt-overdue-mild.png?w=324;648;972;1296&format=avif;webp;png&quality=80&as=picture";
import phoneImgFlat from "./overdue-text-flat.png?w=324;648;972;1296&format=avif;webp;png&quality=80&as=picture";

export default function Section3() {
  return (
    <section className="flex items-center relative bg-landing-main">
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
          {/* Desktop / tablet image */}
          <RenderPicture
            picture={phoneImg}
            sizes="(min-width:640px) 33vw, 80vw"
            alt="Overdue messages via text example"
            className="hidden sm:flex mx-auto sm:mx-0"
            imgClassName="mx-auto sm:mx-0 max-h-[80vh]"
          />

          {/* Mobile image */}
          <RenderPicture
            picture={phoneImgFlat}
            sizes="100vw"
            alt="Overdue messages via text example"
            className="flex sm:hidden mx-auto sm:mx-0"
            imgClassName="mx-auto sm:mx-0 max-h-[80vh]"
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
          </h1>

          <p className="w-full sm:w-5/6">
            Splitify handles follow-ups—texting and emailing until the bill is
            paid. That means more time back in your day, more money in your
            pocket, and less strain on your relationships.
          </p>

          <CtaBtn text="Send a Request" className="mx-auto sm:mx-0" />
        </div>
      </Layout>
    </section>
  );
}
