import React, { useState } from "react";
import SmartSplitLogo from "../../assets/SmartSplitLogo.svg?react";
import getAPIUrl from "../../../src/config.js";
import { useNavigate } from "react-router-dom";

export default function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();
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
    fetch(`${getAPIUrl()}/support/email`, {
      method: "POST",
      body: JSON.stringify({ email, message }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const currentDate = () => {
    const date = new Date();
    return date.getFullYear();
  };

  const scrollToSection = (elementId) => {
    const element = document.getElementById(elementId);
    const root = document.getElementById("root");

    if (element && root) {
      const offset = 70; // Offset for fixed header

      // Get position relative to the root container
      const elementPosition = element.getBoundingClientRect().top;
      const rootPosition = root.getBoundingClientRect().top;
      const relativePosition = elementPosition - rootPosition;

      // Calculate the scroll position
      const scrollPosition = root.scrollTop + relativePosition - offset;

      root.scrollTo({
        top: scrollPosition,
        behavior: "instant",
      });
    }
  };

  return (
    <>
      <style>{`
        /* Base styles - largest screens */
        :where(.footer-section) h2 { font-size: 1.5rem; }  /* 24px */
        :where(.footer-section) h4 { font-size: 1rem; }    /* 16px */
        :where(.footer-section) p { font-size: 0.875rem; } /* 14px */
        :where(.footer-section) .text-xs { font-size: 0.75rem; } /* 12px */
        :where(.footer-section) input,
        :where(.footer-section) textarea { font-size: 0.875rem; } /* 14px */
        :where(.footer-section) button { font-size: 0.875rem; } /* 14px */

        @media (max-width: 1500px) {
          :where(.footer-section) h2 { font-size: 1.5rem; }  /* 24px */
          :where(.footer-section) h4 { font-size: 1rem; }    /* 16px */
          :where(.footer-section) p { font-size: 0.875rem; } /* 14px */
          :where(.footer-section) .text-xs { font-size: 0.75rem; } /* 12px */
          :where(.footer-section) input,
          :where(.footer-section) textarea { font-size: 0.875rem; } /* 14px */
          :where(.footer-section) button { font-size: 0.875rem; } /* 14px */
        }

        @media (max-width: 1024px) {
          :where(.footer-section) h2 { font-size: 1.5rem; }  /* 24px */
          :where(.footer-section) h4 { font-size: 1rem; }    /* 16px */
          :where(.footer-section) p { font-size: 0.875rem; } /* 14px */
          :where(.footer-section) .text-xs { font-size: 0.75rem; } /* 12px */
          :where(.footer-section) input,
          :where(.footer-section) textarea { font-size: 0.875rem; } /* 14px */
          :where(.footer-section) button { font-size: 0.875rem; } /* 14px */
        }

        @media (max-width: 768px) {
          :where(.footer-section) h2 { font-size: 1.375rem; } /* 22px */
          :where(.footer-section) h4 { font-size: 0.9375rem; } /* 15px */
          :where(.footer-section) p { font-size: 0.875rem; } /* 14px stays same */
          :where(.footer-section) .text-xs { font-size: 0.6875rem; } /* 11px */
          :where(.footer-section) input,
          :where(.footer-section) textarea { font-size: 0.8125rem; } /* 13px */
          :where(.footer-section) button { font-size: 0.8125rem; } /* 13px */
        }

        @media (max-width: 480px) {
          :where(.footer-section) h2 { font-size: 1.25rem; } /* 20px */
          :where(.footer-section) h4 { font-size: 0.875rem; } /* 14px */
          :where(.footer-section) p { font-size: 0.875rem; } /* 14px locked */
          :where(.footer-section) .text-xs { font-size: 0.625rem; } /* 10px */
          :where(.footer-section) input,
          :where(.footer-section) textarea { font-size: 0.75rem; } /* 12px */
          :where(.footer-section) button { font-size: 0.75rem; } /* 12px */
        }
      `}</style>

      <footer className="footer-section w-full  pt-8 mt-8 text-white py-6 border-t border-gray-200 ">
        <div className=" w-full flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left: Brand + Links */}
          <div className="flex-1 flex flex-col md:flex-row gap-x-20 gap-y-8">
            <div>
              <div className="flex-shrink-0 flex items-center space-x-3 cursor-pointer mb-2">
                <SmartSplitLogo className="w-8 h-8 " />
                <h2 className="text-2xl font-bold text-blue-600">Splitify</h2>
              </div>
              <p className="text-gray-600 text-sm"></p>
            </div>

    
          </div>

          {/* Right: Minimal Contact Form, fully blended in */}
          <div id="support" className="w-full flex flex-col sm:flex-row md:w-[300px] mt-4 md:mt-0">
            <h4 className="font-semibold mb-2 text-black text-base mr-8">
              Questions? <br></br> Feedback? <br></br> Bugs?
            </h4>
            <div onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                className="text-[#3c3c3c] bg-transparent px-0 py-1 border-b border-gray-600 focus:border-blue-600 transition text-sm placeholder-[#3c3c3c] focus:outline-none"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <textarea
                className="text-[#3c3c3c] bg-transparent px-0 py-1 border-b border-gray-600 focus:border-blue-600 transition text-sm min-h-[38px] placeholder-[#3c3c3c] resize-none focus:outline-none"
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                required
              />
                            <div className="flex items-center justify-between mt-1">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded font-semibold text-sm transition"
                >
                  Send
                </button>
                {status && (
                  <div className="text-xs text-blue-400 ml-2">{status}</div>
                )}
              </div>
                
            </div>
          </div>
        </div>
        <div className="border-t border-gray-500/20 mt-6 pt-4 text-center text-gray-400 text-xs">
          <p>&copy; {currentDate()} Splitify. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
