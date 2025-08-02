import React, { useState } from "react";
import { HOST } from "../../configure";
export default function GlobalFooter() {
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
    setTimeout(() => setStatus(null), 3000);

    console.log("Sending support email:", JSON.stringify({ email, message }));
    fetch(`${HOST}/api/support/email`, {
      method: "POST",
      body: JSON.stringify({ email, message }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Left: Brand + Links */}
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          <div>
            <h3 className="text-lg font-bold mb-2">SmartSplit</h3>
            <p className="text-gray-400 text-sm">
              Professional expense management with intelligent automation.
            </p>
          </div>
          {/* 
          <div>
            <h4 className="font-semibold mb-2">Product</h4>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  API
                </a>
              </li>
            </ul>
          </div>
          */}
          {/* <div>
            <h4 className="font-semibold mb-2">Support</h4>
            <ul className="space-y-1 text-gray-400 text-sm">
              
              <li>
                <a href="#" className="hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
             
              <li>
                <a href="#" className="hover:text-white">
                  Contact us
                </a>
              </li>
              
              <li>
                <a href="#" className="hover:text-white">
                  Status
                </a>
              </li>
             
            </ul>
          </div> */}
          {/* 
          <div>
            <h4 className="font-semibold mb-2">Legal</h4>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Compliance
                </a>
              </li>
            </ul>
          </div>
          */}
        </div>

        {/* Right: Minimal Contact Form, fully blended in */}
        <div className="w-full md:w-[300px] mt-4 md:mt-0">
          <h4 className="font-semibold mb-2 text-base">Contact Us</h4>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              className="bg-gray-900 text-white px-0 py-1 border-b border-gray-700 focus:border-blue-600 transition text-sm placeholder-gray-400 focus:outline-none"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <textarea
              className="bg-gray-900 text-white px-0 py-1 border-b border-gray-700 focus:border-blue-600 transition text-sm min-h-[38px] placeholder-gray-400 resize-none focus:outline-none"
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
      <div className="border-t border-gray-800 mt-6 pt-4 text-center text-gray-400 text-xs">
        <p>&copy; 2025 SmartSplit. All rights reserved.</p>
      </div>
    </footer>
  );
}
