import React, { useState } from "react";
import SmartSplitLogo from "../../../../../assets/SmartSplitLogo.svg?react";
import getAPIUrl from "../../../../../config";
export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !message) {
      setStatus("Please fill out both fields.");
      return;
    }
    setStatus("Thank you! Your message has been sent.");
    setEmail("");
    setMessage("");
    // setTimeout(() => setStatus(null), 3000);

    console.log("Sending support email:", JSON.stringify({ email, message }));
    fetch(`${getAPIUrl}/api/support/email`, {
      method: "POST",
      body: JSON.stringify({ email, message }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
  return (
    <footer className="bg-[#f5f5f5] text-white py-6 border-t border-gray-200 rounded-banner">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Left: Brand + Links */}
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          <div>
            <div className="flex-shrink-0 flex items-center space-x-3 cursor-pointer mb-2">
              <SmartSplitLogo className="w-8 h-8 fill-black" />
              <h2 className="text-2xl font-bold ">Splitify</h2>
            </div>
            <p className="text-gray-700 text-sm">
              Shared cost management with intelligent automation.
            </p>
          </div>
        </div>

        {/* Right: Minimal Contact Form, fully blended in */}
        <div className="w-full md:w-[300px] mt-4 md:mt-0">
          <h4 className="font-semibold mb-2 text-black text-base">
            Contact Us
          </h4>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              className=" text-[#3c3c3c] bg-transparent px-0 py-1 border-b border-gray-700 focus:border-blue-600 transition text-sm placeholder-[#3c3c3c] focus:outline-none"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <textarea
              className="text-[#3c3c3c] bg-transparent px-0 py-1 border-b border-gray-700 focus:border-blue-600 transition text-sm min-h-[38px] placeholder-[#3c3c3c] resize-none focus:outline-none"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              required
            />
            <div className="flex items-center justify-between mt-1">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded font-semibold text-sm transition"
              >
                Send
              </button>
              {status && (
                <div className="text-xs text-blue-400 ml-2">{status}</div>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="border-t border-gray-500/20 mt-6 pt-4 text-center text-gray-400 text-xs">
        <p>&copy; 2025 Spltifiy. All rights reserved.</p>
      </div>
    </footer>
  );
}
