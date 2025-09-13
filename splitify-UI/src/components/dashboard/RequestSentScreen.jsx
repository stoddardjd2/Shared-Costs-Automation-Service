import React, { useState, useEffect } from "react";
import { Check, ArrowRight, DollarSign, Send, Plane } from "lucide-react";
import RocketTakeoff from "./Animation/RocketTakeoff";
import { useData } from "../../contexts/DataContext";
const RequestSentScreen = ({ request, onClose, onAgain, setHide }) => {
  const { participants } = useData();

  const [animationStage, setAnimationStage] = useState(0);
  const [showTrail, setShowTrail] = useState(false);

  const recipients = request.participants.map((participant) => {
    const user = participants.find((u) => u._id === participant._id);
    return {
      ...user, // keep user fields (name, avatar, color, etc.)
      amount: participant.amount, // attach the amount from request.participants
    };
  });
  // const recipients = [
  //   { name: "Sarah Chen", avatar: "SC", color: "bg-pink-500" },
  //   { name: "Mike Rodri31412412guez", avatar: "MR", color: "bg-emerald-500" },
  //   { name: "Alex Johnson", avatar: "AJ", color: "bg-purple-500" },
  // ];

  useEffect(() => {
    const timeline = [
      { stage: 1, delay: 50 }, // Send icon appears
      { stage: 2, delay: 500 }, // Icon takes off with trail
      { stage: 3, delay: 1400 }, // Icon reaches destination
      { stage: 4, delay: 1400 }, // Success confirmation
      { stage: 5, delay: 1600 }, // Content appears
      { stage: 6, delay: 1800 }, // Recipients animate in
      { stage: 7, delay: 2000 }, // Buttons appear
    ];

    timeline.forEach(({ stage, delay }) => {
      setTimeout(() => setAnimationStage(stage), delay);
    });

    // Show trail effect
    setTimeout(() => setShowTrail(true), 900);
    setTimeout(() => setShowTrail(false), 1600);
  }, []);

  return (
    <div
      onClick={() => {
        setHide(false);
        setTimeout(() => setHide(true), 100);
      }}
      className="min-h-screen overflow-hidden z-50 fixed flex-col inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 flex items-center justify-center"
    >
      {/* Background elements */}
      <div className=" relative h-[85vh]  overflow-auto scroll-h  [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="absolute inset-0 ">
          {/* Clouds */}
          <div
            style={{ animation: "cloudDrift 20s ease-in-out infinite" }}
            className={`absolute  top-20 left-20 w-32 h-16 bg-white bg-opacity-10 rounded-full transform transition-all duration-3000 ${
              animationStage >= 2 ? "translate-x-12" : "translate-x-0"
            }`}
          ></div>
          <div
            style={{ animation: "cloudDrift 18s ease-in-out infinite" }}
            className={`absolute top-40 right-32 w-24 h-12 bg-white bg-opacity-10 rounded-full transform transition-all duration-4000 ${
              animationStage >= 2 ? "-translate-x-8" : "translate-x-0"
            }`}
          ></div>
          <div
            style={{ animation: "cloudDrift 25s ease-in-out infinite" }}
            className={`absolute bottom-32 left-1/4 w-28 h-14 bg-white bg-opacity-10 rounded-full transform transition-all duration-3500 ${
              animationStage >= 2 ? "translate-x-16" : "translate-x-0"
            }`}
          ></div>
        </div>

        {/* Flying send icon with trail (UPDATED) */}
        <div
          className="absolute inset-0 pointer-events-none"
          // style={{ animation: "rocket-takeoff-up 2s ease-out infinite" }}
        >
          {/* Anchor near lower-middle, then smoothly animate upward */}
          <div
            className={`absolute left-1/2 top-2/3 -translate-x-1/2  ${
              animationStage >= 2
                ? "animate-[rocketUp_1200ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
                : ""
            }`}
          >
            <div
              className={`w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 ${
                animationStage >= 1 ? "scale-100 rotate-0" : "scale-0 rotate-45"
              }`}
            >
              {/* Point the paper plane UP */}
              <Send
                className={`w-8 h-8 text-white transform transition-all duration-500 ${
                  animationStage >= 1 ? "-rotate-45" : "-rotate-45"
                }`}
              />
            </div>

            {/* Rocket trail: below the icon so it looks like exhaust */}
            {/* {showTrail && (
              <div className="absolute left-1/2 top-full -translate-x-1/2 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-ping"
                    style={{
                      top: `${i * 12}px`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: "0.8s",
                    }}
                  ></div>
                ))}
              </div>
            )} */}

            {/* Vertical speed lines (behind the rocket) during takeoff */}
            {animationStage >= 2 && animationStage < 3 && (
              <div className="absolute left-1/2 top-full -translate-x-1/2 mt-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute w-px bg-white bg-opacity-60"
                    style={{
                      height: `${20 + i * 10}px`,
                      left: `${(i - 2) * 6}px`,
                      animation: "speedLineY 0.3s ease-out infinite",
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {/* Impact effect at destination (aligned with new end position) */}
          {animationStage >= 3 && (
            <div className="absolute left-1/2 top-1/4 transform -translate-x-1/2 -translate-y-1/2">
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

        <div className="relative z-10 text-center h-full p-10 w-screen ">
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
              Payment Request{request.participants.length == 1 ? "" : "s"} Sent!
            </h1>
            <div
              className={`mt-4 flex items-center justify-center space-x-2 transform transition-all duration-600 delay-200 ${
                animationStage >= 5
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            ></div>
          </div>

          {/* Amount with zoom effect */}
          <div
            className={`relative mb-8 transform transition-all duration-700 ${
              animationStage >= 5
                ? "scale-100 opacity-100"
                : "scale-75 opacity-0"
            }`}
          >
            <div className="bg-blue-600 max-w-[500px] mx-auto bg-opacity-20 rounded-3xl px-8 py-4 backdrop-blur-lg border border-blue-400 border-opacity-30 shadow-2xl">
              <div className="flex items-center justify-center space-x-4">
                <span className="font-bold text-white text-2xl sm:text-3xl md:text-4xl">
                  ${request.totalAmountOwed.toFixed(2)} Total
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
            Your payment request has been successfully sent.
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
                  <div
                    className={`absolute -top-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${
                      animationStage >= 6
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${400 + index * 200}ms` }}
                  ></div>

                  <div
                    className={`relative w-14 h-14 ${
                      recipient.color
                    } sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl border-[3px] sm:border-4 border-white transform transition-all duration-800 hover:scale-110 ${
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
                  <p
                    className={`text-white/70 w-full truncate mt-1 font-medium transform transition-all duration-500 ${
                      animationStage >= 6
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0"
                    } text-xs sm:text-sm md:text-base`}
                    style={{ transitionDelay: `${700 + index * 200}ms` }}
                  >
                    ${recipient.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons with slide in */}
          {/* <div
            className={`space-y-4 transform transition-all duration-800 ${
              animationStage >= 7
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          ></div> */}
          {/* Action buttons with slide in */}
          <div
            className={`transform w-screen fixed p-8 rounded-lg  transition-all duration-800 ${
              animationStage >= 7
                ? "translate-y-12 opacity-100"
                : "translate-y-8 opacity-0 "
            }`}
          ></div>
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

          /* NEW: smoother vertical rocket path (upward) */
          @keyframes rocketUp {
            0% {
              top: 66%;
              opacity: 1;
            }
            // 50% {
            // top:40%;
            //   opacity: 1;
            //   scale:1.2;
            // }
            100% {
              top: 10%;
              transform: translateX(-50%) translateY(0) scale(1.7);

              opacity: 0; /* fade out if you want */
            }
          }

          .rocket {
            animation: rocketUp 2s ease-in-out forwards;
          }

          /* NEW: vertical speed-line flicker */
          @keyframes speedLineY {
            0% {
              opacity: 0;
              transform: scaleY(0);
            }
            50% {
              opacity: 1;
              transform: scaleY(1);
            }
            100% {
              opacity: 0;
              transform: scaleY(1.2);
            }
          }

          /* Use --tilt-start if your icon needs an initial angle (e.g., -90deg). */
          @keyframes rocket-takeoff-up {
            0% {
              transform: translate3d(0, 0, 0) rotate(var(--tilt-start, 0deg))
                scale(1);
            }
            12% {
              transform: translate3d(0, -6px, 0)
                rotate(calc(var(--tilt-start, 0deg) * 0.6)) scale(0.995);
            }
            22% {
              transform: translate3d(0, -16px, 0)
                rotate(calc(var(--tilt-start, 0deg) * 0.3)) scale(1.005);
            }
            40% {
              transform: translate3d(0, -70px, 0) rotate(0deg);
            }
            70% {
              transform: translate3d(0, -200px, 0) rotate(2deg);
            }
            85% {
              transform: translate3d(0, -260px, 0) rotate(0deg);
            }
            100% {
              transform: translate3d(0, -320px, 0) rotate(0deg) scale(1.02);
            }
          }

          @keyframes cloudDrift {
            0% {
              transform: translateX(-20px);
            }
            50% {
              transform: translateX(20px);
            }
            100% {
              transform: translateX(-20px);
            }
          }
        `}</style>
      </div>
      <div
        className={`flex backdrop-blur-lg pt-4 gap-y-4 sm:mb-8 sticky flex-wrap sm:flex-nowrap items-end justify-center gap-x-4 pb-[30px] sm:pb-[0px] ${
          animationStage >= 7
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0 "
        }`}
      >
        <button
          onClick={onClose}
          className="min-w-[300px] border-2 h-fit border-white border-opacity-40 bg-white text-black py-4 px-8 rounded-2xl font-semibold text-base sm:text-lg backdrop-blur-sm transform hover:scale-105 hover:bg-white/90  transition-all duration-300"
        >
          Close
        </button>
        <button
          onClick={onAgain}
          className="whitespace-nowrap min-w-[300px] bg-transparent border-2 h-fit border-white border-opacity-40 text-white py-4 px-8 rounded-2xl font-semibold text-base sm:text-lg backdrop-blur-sm transform hover:scale-105 hover:bg-white hover:bg-opacity-10 transition-all duration-300"
        >
          Send Another Request
        </button>
      </div>
    </div>
  );
};

export default RequestSentScreen;
