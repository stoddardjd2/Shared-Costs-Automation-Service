import React, { useState } from "react";
import SmartSplitLogo from "../../../../../assets/SmartSplitLogo.svg?react";
import getAPIUrl from "../../../../../config";
import { useNavigate } from "react-router-dom";

export default function Footer() {
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
    fetch(`${getAPIUrl}/api/support/email`, {
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
      const offset = 50; // Offset for fixed header

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

      <footer className="footer-section bg-[#f7f7f7] pt-8 text-white py-6 border-t border-gray-200 rounded-banner">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left: Brand + Links */}
          <div className="flex-1 flex flex-col md:flex-row gap-x-20 gap-y-8">
            <div>
              <div className="flex-shrink-0 flex items-center space-x-3 cursor-pointer mb-2">
                <SmartSplitLogo className="w-8 h-8 " />
                <h2 className="text-2xl font-bold text-blue-600">Splitify</h2>
              </div>
              <p className="text-gray-700 text-sm"></p>
            </div>

            {/* Navigation Column */}
            <div className="mt-4 md:mt-0">
              <h4 className="font-semibold mb-3 text-black text-base">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    onClick={() => {
                      navigate("/signup");
                    }}
                    className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors text-sm"
                  >
                    Sign Up
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => {
                      navigate("/login");
                    }}
                    className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors text-sm"
                  >
                    Log In
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("about");
                    }}
                    className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("features");
                    }}
                    className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div className="mt-4 md:mt-0">
              <h4 className="font-semibold mb-3 text-black text-base">
                Connect
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://github.com/stoddardjd2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-600 transition-colors text-sm flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/jared-stoddard/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-600 transition-colors text-sm flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Minimal Contact Form, fully blended in */}
          <div id="support" className="w-full md:w-[300px] mt-4 md:mt-0">
            <h4 className="font-semibold mb-2 text-black text-base">
              Questions? Feedback?
            </h4>
            <div onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                className="text-[#3c3c3c] bg-transparent px-0 py-1 border-b border-gray-700 focus:border-blue-600 transition text-sm placeholder-[#3c3c3c] focus:outline-none"
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
