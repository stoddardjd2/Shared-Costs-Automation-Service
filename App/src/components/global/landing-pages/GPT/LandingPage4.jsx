import React from "react";

const primaryBlue = "rgb(37 99 235)"; // #2563EB

const testimonials = [
  {
    quote:
      "SmartSplit finally got my roommate to pay his share—without awkward reminders. So much less stress!",
    name: "Maya K.",
    photo: "/testimonials/maya.jpg",
  },
  {
    quote:
      "The automated follow-ups mean I never have to chase friends for money. I get paid back faster—no drama.",
    name: "Liam R.",
    photo: "/testimonials/liam.jpg",
  },
];

export default function SmartSplitLanding() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F7FAFF", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-5 bg-white/80 shadow-sm fixed w-full z-20 top-0 left-0 backdrop-blur">
        <div className="flex items-center gap-2">
          <div
            className="rounded-full w-9 h-9 flex items-center justify-center"
            style={{ background: primaryBlue }}
          >
            {/* Simple logo icon */}
            <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="14" fill="#fff" />
              <path
                d="M7 14a7 7 0 1 1 14 0"
                stroke={primaryBlue}
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeDasharray="2 4"
              />
            </svg>
          </div>
          <span className="font-bold text-lg" style={{ color: primaryBlue }}>
            SmartSplit
          </span>
        </div>
        <a
          href="#signup"
          className="rounded-full px-5 py-2 font-medium text-white shadow-md"
          style={{
            background: primaryBlue,
            transition: "background 0.2s",
          }}
        >
          Start Free
        </a>
      </nav>

      {/* HERO */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8 pt-28 pb-10 px-4 md:px-16 bg-white">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: primaryBlue }}>
            Effortless Shared Expenses,<br />Zero Stress.
          </h1>
          <p className="text-lg md:text-xl mb-6 text-gray-800">
            SmartSplit automates payment requests and bill tracking so you never chase friends or family for money again. <span className="font-semibold">No more awkward reminders, mental math, or missed payments.</span> Enjoy peace of mind with intelligent automation for roommates, families, groups, and more.
          </p>
          <ul className="mb-8 space-y-2">
            <li className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full" />
              <span>Automatic payment requests & reminders (SMS & email)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full" />
              <span>Dynamic recurring bill tracking & instant adjustments</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full" />
              <span>Full payment history & analytics—see who paid, when</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full" />
              <span>Bank-level security & privacy protection</span>
            </li>
          </ul>
          <a
            href="#signup"
            className="inline-block bg-[rgb(37,99,235)] hover:bg-blue-700 transition text-white text-lg font-semibold rounded-full px-8 py-3 shadow-lg"
            style={{ boxShadow: "0 8px 24px 0 rgba(37,99,235,0.12)" }}
          >
            Start Getting Paid Back
          </a>
        </div>
        {/* Hero visual/illustration */}
        <div className="hidden md:flex flex-1 justify-end">
          {/* Replace with actual app screenshot for max trust */}
          <img
            src="/landing/hero-demo.png"
            alt="SmartSplit App Demo"
            className="rounded-2xl border border-gray-200 shadow-xl w-[350px] h-[420px] object-cover"
            loading="lazy"
          />
        </div>
      </section>

      {/* SOCIAL PROOF & TRUST */}
      <section className="px-4 md:px-16 py-10 flex flex-col gap-8 bg-white border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
          <div className="flex items-center gap-8">
            <img src="/security/pci-dss.svg" alt="PCI DSS" className="h-7" />
            <img src="/security/ssl.svg" alt="SSL Secured" className="h-7" />
            <img src="/security/soc2.svg" alt="SOC 2" className="h-7" />
          </div>
          <div className="text-gray-600 font-medium">
            Trusted by <span className="font-semibold text-gray-900">50,000+ users</span> to manage <span className="font-semibold text-gray-900">$2M+</span> in shared expenses.
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 md:px-16 py-12 bg-[rgb(245,249,255)]">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: primaryBlue }}>
          How SmartSplit Works
        </h2>
        <div className="flex flex-col md:flex-row md:justify-center gap-8 md:gap-16 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl shadow-md px-6 py-8 flex-1 flex flex-col items-center text-center">
            <span className="text-3xl mb-3" style={{ color: primaryBlue }}>1️⃣</span>
            <h3 className="font-bold text-lg mb-2">Add Shared Bills</h3>
            <p className="text-gray-700 text-base">
              Enter rent, utilities, groceries, or any recurring/group expense. Add your housemates, friends, or teammates.
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-white rounded-2xl shadow-md px-6 py-8 flex-1 flex flex-col items-center text-center">
            <span className="text-3xl mb-3" style={{ color: primaryBlue }}>2️⃣</span>
            <h3 className="font-bold text-lg mb-2">Let Automation Do the Work</h3>
            <p className="text-gray-700 text-base">
              SmartSplit sends payment requests & polite reminders—no more nagging! Bill changes? Shares are instantly adjusted for you.
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-white rounded-2xl shadow-md px-6 py-8 flex-1 flex flex-col items-center text-center">
            <span className="text-3xl mb-3" style={{ color: primaryBlue }}>3️⃣</span>
            <h3 className="font-bold text-lg mb-2">Track & Get Paid Back</h3>
            <p className="text-gray-700 text-base">
              View complete payment history, get insights, and receive your share quickly—no missed payments, no awkward follow-ups.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 md:px-16 py-12 bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: primaryBlue }}>
          What Users Say
        </h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center max-w-4xl mx-auto">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-2xl p-7 shadow-md flex flex-col items-center text-center flex-1"
            >
              <div className="w-14 h-14 rounded-full bg-gray-200 mb-3 overflow-hidden">
                <img src={t.photo} alt={t.name} className="object-cover w-full h-full" />
              </div>
              <p className="text-lg mb-3 text-gray-800">“{t.quote}”</p>
              <span className="text-sm text-gray-500 font-semibold">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ / TRUST-BUILDING */}
      <section className="px-4 md:px-16 py-12 bg-[rgb(245,249,255)]">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: primaryBlue }}>
          Common Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-7">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              How does SmartSplit keep my data secure?
            </h3>
            <p className="text-gray-700">
              Your financial info is protected with end-to-end encryption, bank-level security, and industry-standard compliance (PCI DSS, SOC 2). We never share your data.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Who is SmartSplit for?
            </h3>
            <p className="text-gray-700">
              Anyone splitting bills—roommates, families, partners, teams, or groups. Set up once, automate everything, and never have to chase payments again!
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Is it free to start?
            </h3>
            <p className="text-gray-700">
              Yes! Try SmartSplit for free—no credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* SIGN UP CTA */}
      <section id="signup" className="flex flex-col items-center py-16 bg-white">
        <h2 className="text-3xl font-bold mb-4" style={{ color: primaryBlue }}>
          Ready to Split Expenses the Smart Way?
        </h2>
        <p className="text-lg text-gray-700 mb-7 text-center max-w-xl">
          Sign up and take the stress and guesswork out of managing shared bills. <span className="font-semibold">No more spreadsheets, no more awkward texts—just effortless, automated shared finances.</span>
        </p>
        {/* Signup form placeholder */}
        <form className="flex flex-col md:flex-row gap-3 w-full max-w-lg">
          <input
            type="email"
            className="flex-1 rounded-full px-5 py-3 border border-gray-300 focus:outline-none focus:border-blue-500 text-lg"
            placeholder="Enter your email"
            required
          />
          <button
            type="submit"
            className="bg-[rgb(37,99,235)] hover:bg-blue-700 text-white font-bold text-lg rounded-full px-7 py-3 transition shadow-lg"
          >
            Get Started Free
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Bank-level security. No spam. Cancel anytime.
        </p>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm bg-white border-t border-gray-200">
        &copy; {new Date().getFullYear()} SmartSplit. All rights reserved.
      </footer>
    </div>
  );
}
