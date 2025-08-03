import React from 'react';
import { CheckCircle, Clock, ShieldCheck, TrendingUp, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="py-4 px-6 bg-white shadow">
        <h1 className="text-2xl font-bold" style={{ color: 'rgb(37 99 235)' }}>SmartSplit</h1>
      </nav>

      <header className="text-center py-16 bg-gradient-to-b from-blue-50 to-white">
        <h2 className="text-5xl font-bold mb-6" style={{ color: 'rgb(37 99 235)' }}>
          Automate Shared Expenses. <br />Simplify Your Life.
        </h2>
        <p className="text-gray-600 text-xl mb-8">
          Effortlessly track and manage shared bills. Reduce stress, save time, and enjoy seamless accountability.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition">
          Get Started Free
        </button>
      </header>

      <section className="py-20 px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 container mx-auto">
        <div className="text-center">
          <Clock className="mx-auto text-blue-600 mb-4" size={48} />
          <h3 className="text-xl font-semibold">Save Time</h3>
          <p className="text-gray-600 mt-2">
            Eliminate repetitive calculations and reminders. Let SmartSplit handle recurring bills automatically.
          </p>
        </div>
        <div className="text-center">
          <ShieldCheck className="mx-auto text-blue-600 mb-4" size={48} />
          <h3 className="text-xl font-semibold">Build Trust</h3>
          <p className="text-gray-600 mt-2">
            Transparent, fair, and clear expense tracking that eliminates misunderstandings.
          </p>
        </div>
        <div className="text-center">
          <Users className="mx-auto text-blue-600 mb-4" size={48} />
          <h3 className="text-xl font-semibold">Reduce Conflict</h3>
          <p className="text-gray-600 mt-2">
            Automated follow-ups and polite reminders mean no more awkward conversations about money.
          </p>
        </div>
      </section>

      <section className="py-16 px-8 bg-blue-50">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8">Why Users Love SmartSplit</h3>
          <ul className="space-y-4 max-w-xl mx-auto text-left">
            <li className="flex items-start">
              <CheckCircle className="text-blue-600 mr-3" />
              Never miss or forget payments with automatic reminders and PayPal integration.
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-blue-600 mr-3" />
              Clearly see every expense and change in shared costs with complete transparency.
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-blue-600 mr-3" />
              Comprehensive records and audit trails maintain accountability and peace of mind.
            </li>
          </ul>
        </div>
      </section>

      <section className="py-16 text-center">
        <h3 className="text-4xl font-bold mb-6" style={{ color: 'rgb(37 99 235)' }}>Ready to Simplify Shared Expenses?</h3>
        <p className="mb-8 text-gray-600 text-lg">Join thousands enjoying conflict-free, automated expense management.</p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition">
          Sign Up Now
        </button>
      </section>

      <footer className="py-4 bg-gray-100 text-center text-gray-600">
        &copy; {new Date().getFullYear()} SmartSplit. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
