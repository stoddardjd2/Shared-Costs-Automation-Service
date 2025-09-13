import React, { useState, useEffect } from "react";
import { Check, ArrowRight, DollarSign, Send, Plane } from "lucide-react";

const RequestSentScreen = ({ request, onFinish }) => {
  console.log("on finish request", request);
  const [animationStage, setAnimationStage] = useState(0);
  const [showTrail, setShowTrail] = useState(false);

  const recipients = [
    { name: "Sarah Chen", avatar: "SC", color: "bg-pink-500" },
    { name: "Mike Rodri31412412guez", avatar: "MR", color: "bg-emerald-500" },
    { name: "Alex Johnson", avatar: "AJ", color: "bg-purple-500" },
  ];

  const amount = "$150.00";

  useEffect(() => {
    const timeline = [
      { stage: 1, delay: 200 }, // Send icon appears
      { stage: 2, delay: 800 }, // Icon takes off with trail
      { stage: 3, delay: 1400 }, // Icon reaches destination
      { stage: 4, delay: 1800 }, // Success confirmation
      { stage: 5, delay: 2200 }, // Content appears
      { stage: 6, delay: 2800 }, // Recipients animate in
      { stage: 7, delay: 3400 }, // Buttons appear
    ];

    timeline.forEach(({ stage, delay }) => {
      setTimeout(() => setAnimationStage(stage), delay);
    });

    // Show trail effect
    setTimeout(() => setShowTrail(true), 900);
    setTimeout(() => setShowTrail(false), 1600);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden z-50 fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 flex items-center justify-center">
      {/* Background elements */}
      <div className=" relative">
        <div className="absolute inset-0">
          {/* Clouds */}
          <div
            className={`absolute  top-20 left-20 w-32 h-16 bg-white bg-opacity-10 rounded-full transform transition-all duration-3000 ${
              animationStage >= 2 ? "translate-x-12" : "translate-x-0"
            }`}
          ></div>
          <div
            className={`absolute top-40 right-32 w-24 h-12 bg-white bg-opacity-10 rounded-full transform transition-all duration-4000 ${
              animationStage >= 2 ? "-translate-x-8" : "translate-x-0"
            }`}
          ></div>
          <div
            className={`absolute bottom-32 left-1/4 w-28 h-14 bg-white bg-opacity-10 rounded-full transform transition-all duration-3500 ${
              animationStage >= 2 ? "translate-x-16" : "translate-x-0"
            }`}
          ></div>
        </div>

        {/* Flying send icon with trail */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute transform transition-all duration-1200 ${
              animationStage >= 3
                ? "left-3/4 top-1/4 scale-75 opacity-0"
                : animationStage >= 2
                ? "left-1/2 top-1/2 scale-100"
                : "left-1/4 bottom-1/4 scale-100"
            }`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <div
              className={`w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 ${
                animationStage >= 1 ? "scale-100 rotate-0" : "scale-0 rotate-45"
              }`}
            >
              <Send
                className={`w-8 h-8 text-white transform transition-all duration-500 ${
                  animationStage >= 2 ? "rotate-45" : "rotate-0"
                }`}
              />
            </div>

            {/* Rocket trail */}
            {showTrail && (
              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-ping"
                    style={{
                      right: `${i * 12}px`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: "0.8s",
                    }}
                  ></div>
                ))}
              </div>
            )}

            {/* Speed lines */}
            {animationStage >= 2 && animationStage < 3 && (
              <div className="absolute -right-20 top-1/2 transform -translate-y-1/2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute h-0.5 bg-white bg-opacity-60"
                    style={{
                      width: `${20 + i * 10}px`,
                      right: `${i * 8}px`,
                      top: `${(i - 2) * 4}px`,
                      animation: "speedLine 0.3s ease-out infinite",
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {/* Impact effect at destination */}
          {animationStage >= 3 && (
            <div className="absolute left-3/4 top-1/4 transform -translate-x-1/2 -translate-y-1/2">
              {[1, 2, 3].map((ring) => (
                <div
                  key={ring}
                  className={`absolute w-32 h-32 border-4 border-blue-400 rounded-full transform transition-all duration-1000 ${
                    animationStage >= 3
                      ? `scale-${150 + ring * 50} opacity-0`
                      : "scale-0 opacity-60"
                  }`}
                  style={{ transitionDelay: `${ring * 150}ms` }}
                ></div>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 text-center h-[100vh] p-10 overflow-scroll">
          {/* Success icon (appears after send animation) */}
          <div
            className={`relative mb-8 transform transition-all duration-1000 ${
              animationStage >= 4
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0"
            }`}
          >
            <div className="w-32 h-32 mx-auto bg-blue-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-200">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <Check className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            {/* Success ripples */}
            {[1, 2, 3].map((ripple) => (
              <div
                key={ripple}
                className={`absolute inset-0 w-32 h-32 mx-auto border-4 border-blue-400 rounded-full transform transition-all duration-2000 ${
                  animationStage >= 4
                    ? `scale-${120 + ripple * 20} opacity-0`
                    : "scale-100 opacity-40"
                }`}
                style={{ transitionDelay: `${ripple * 200}ms` }}
              ></div>
            ))}
          </div>

          {/* Title with bounce effect */}
          <div
            className={`mb-6 transform transition-all duration-800 ${
              animationStage >= 5
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <h1 className="font-bold text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              Payment Request Sent!
            </h1>
            <div
              className={`mt-4 flex items-center justify-center space-x-2 transform transition-all duration-600 delay-200 ${
                animationStage >= 5
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              {/* <Send className="w-6 h-6 text-blue-300 " />
              <span className="text-blue-200 text-base sm:text-lg">
                Delivered successfully
              </span> */}
            </div>
          </div>

          {/* Amount with zoom effect */}
          <div
            className={`relative mb-8 transform transition-all duration-700 ${
              animationStage >= 5
                ? "scale-100 opacity-100"
                : "scale-75 opacity-0"
            }`}
          >
            <div className="bg-blue-600 bg-opacity-20 rounded-3xl px-8 py-4 backdrop-blur-lg border border-blue-400 border-opacity-30 shadow-2xl">
              <div className="flex items-center justify-center space-x-4">
                {/* <DollarSign className="w-10 h-10 text-blue-300" /> */}
                <span className="font-bold text-white text-2xl sm:text-3xl md:text-4xl">
                  {amount}
                </span>
              </div>
            </div>
          </div>

          <p
            className={`text-white text-opacity-90 mb-8 max-w-md mx-auto transform transition-all duration-600 delay-300 ${
              animationStage >= 5
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            } text-base sm:text-lg md:text-xl`}
          >
            Your payment request has been successfully sent to your friends
          </p>

          {/* Recipients with delivery animation */}
          <div
            className={`mb-8 transform transition-all duration-800 ${
              animationStage >= 6
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <p className="text-white text-opacity-80 mb-6 font-medium text-base sm:text-lg">
              Delivered to:
            </p>

            <div className="flex justify-center gap-6 flex-wrap items-center mb-8">
              {recipients.map((recipient, index) => (
                <div
                  key={recipient.name}
                  className="relative w-[100px] sm:w-[150px] flex flex-col items-center justify-center"
                >
                  {/* Delivery icon animation */}
                  <div
                    className={`absolute -top-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${
                      animationStage >= 6
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${400 + index * 200}ms` }}
                  >
                    {/* <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div> */}
                  </div>

                  {/* Avatar with bounce */}
                  <div
                    className={`relative w-14 h-14 sm:w-20 sm:h-20 ${
                      recipient.color
                    } rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl border-[3px] sm:border-4 border-white transform transition-all duration-800 hover:scale-110 ${
                      animationStage >= 6
                        ? "translate-y-0 scale-100"
                        : "translate-y-8 scale-90"
                    }`}
                    style={{
                      transitionDelay: `${600 + index * 200}ms`,
                      transitionTimingFunction:
                        "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                    }}
                  >
                    {recipient.avatar}

                    {/* Delivery pulse */}
                    <div
                      className={`absolute inset-0 w-20 h-20 bg-green-400 bg-opacity-30 rounded-full transform transition-all duration-1000 ${
                        animationStage >= 6
                          ? "scale-150 opacity-0"
                          : "scale-100 opacity-30"
                      }`}
                      style={{ transitionDelay: `${800 + index * 200}ms` }}
                    ></div>
                  </div>

                  <p
                    className={`text-white w-full truncate mt-3 font-medium transform transition-all duration-500 ${
                      animationStage >= 6
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0"
                    } text-xs sm:text-sm md:text-base`}
                    style={{ transitionDelay: `${700 + index * 200}ms` }}
                  >
                    {recipient.name}
                  </p>
                </div>
              ))}
            </div>

            {/* Flight path visualization */}
            {/* <div className="flex justify-center items-center space-x-4 mb-8">
              {recipients.map(
                (_, index) =>
                  index < recipients.length - 1 && (
                    <div key={index} className="relative">
                      <div
                        className={`w-12 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 transform transition-all duration-1000 ${
                          animationStage >= 6
                            ? "scale-x-100 opacity-60"
                            : "scale-x-0 opacity-0"
                        }`}
                        style={{ transitionDelay: `${1000 + index * 300}ms` }}
                      ></div>
                      <ArrowRight
                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 transition-all duration-500 ${
                          animationStage >= 6 ? "opacity-60" : "opacity-0"
                        }`}
                        style={{ transitionDelay: `${1100 + index * 300}ms` }}
                      />
                    </div>
                  )
              )}
            </div> */}
          </div>

          {/* Action buttons with slide in */}
          <div
            className={`space-y-4 transform transition-all duration-800 ${
              animationStage >= 7
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {/* <button className="w-full bg-transparent border-2 border-white border-opacity-40 text-white py-4 px-8 rounded-2xl font-semibold text-base sm:text-lg backdrop-blur-sm transform hover:scale-105 hover:bg-white hover:bg-opacity-10 transition-all duration-300">
              Send Another Request
            </button> */}
          </div>
        </div>

        <style jsx>{`
          @keyframes speedLine {
            0% {
              opacity: 0;
              transform: scaleX(0);
            }
            50% {
              opacity: 1;
              transform: scaleX(1);
            }
            100% {
              opacity: 0;
              transform: scaleX(1.2);
            }
          }
        `}</style>
      </div>{" "}
    </div>
  );
};

export default RequestSentScreen;
