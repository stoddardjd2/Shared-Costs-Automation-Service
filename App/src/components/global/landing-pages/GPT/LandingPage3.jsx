import React from 'react';

const SmartSplitLanding = () => {
  return (
    <div className="bg-white min-h-screen text-gray-900">
      {/* Hero Section */}
      <section className="bg-[rgb(37,99,235)] text-white py-20 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">Simplify Shared Expenses with SmartSplit</h1>
        <p className="text-lg md:text-2xl max-w-2xl mx-auto mb-6">
          SmartSplit automates payment requests, tracks bill changes, and follows up intelligently—so you don’t have to.
        </p>
        <button className="bg-white text-[rgb(37,99,235)] font-semibold px-6 py-3 text-lg rounded-xl shadow-md hover:bg-gray-100">
          Start Free in 60 Seconds
        </button>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-6">Managing Shared Expenses Shouldn’t Be This Difficult</h2>
        <div className="max-w-3xl mx-auto space-y-4 text-lg text-gray-700">
          <p>Manually chasing payments leads to unnecessary stress and uncomfortable conversations.</p>
          <p>Recurring costs change frequently, requiring constant recalculations and communication.</p>
          <p>Without accurate tracking, misunderstandings and delays are inevitable.</p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-8">SmartSplit Solves It All—Automatically</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white shadow p-6 rounded-2xl">
            <h3 className="font-bold text-xl mb-2">Automated Follow-Ups</h3>
            <p>SmartSplit sends polite, scheduled reminders via SMS and email based on payment history—ensuring accountability without awkwardness.</p>
          </div>
          <div className="bg-white shadow p-6 rounded-2xl">
            <h3 className="font-bold text-xl mb-2">Real-Time Cost Tracking</h3>
            <p>Automatically detects and adjusts for bill changes. Everyone pays their fair share—no manual math, no surprises.</p>
          </div>
          <div className="bg-white shadow p-6 rounded-2xl">
            <h3 className="font-bold text-xl mb-2">Intelligent Payment Insights</h3>
            <p>Access detailed payment history and predictive analytics. Make smarter decisions and plan expenses with confidence.</p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-8">Built for Real-World Shared Finances</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
          <div>
            <h4 className="font-semibold text-xl mb-2">Roommates</h4>
            <ul className="list-disc list-inside text-gray-700">
              <li>Split rent, utilities, and subscriptions seamlessly</li>
              <li>Never forget or delay payments again</li>
              <li>Track contributions fairly and transparently</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xl mb-2">Families</h4>
            <ul className="list-disc list-inside text-gray-700">
              <li>Share recurring household expenses effortlessly</li>
              <li>Eliminate manual oversight with automation</li>
              <li>Plan family budgets with clarity</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xl mb-2">Groups & Events</h4>
            <ul className="list-disc list-inside text-gray-700">
              <li>Coordinate group trips, gifts, or event costs</li>
              <li>Streamline collection and tracking</li>
              <li>Focus on the experience, not the finances</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Competitive Advantage Section */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Why Choose SmartSplit Over Other Apps?</h2>
        <p className="max-w-3xl mx-auto text-lg mb-6 text-gray-700">
          Tools like Splitwise and Venmo help you track what’s owed—but they leave the follow-up and adjustments up to you. SmartSplit is proactive: it automates tracking, reminders, and adjustments—making shared expense management effortless.
        </p>
        <button className="bg-[rgb(37,99,235)] text-white font-semibold px-6 py-3 text-lg rounded-xl shadow-md hover:bg-blue-800">
          Create Your Free Account
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6">
        © {new Date().getFullYear()} SmartSplit. All rights reserved.
      </footer>
    </div>
  );
};

export default SmartSplitLanding;
