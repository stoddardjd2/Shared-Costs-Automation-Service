import { trackCreateAccount } from "../../../../../googleAnalytics/googleAnalyticsHelpers";
import { useNavigate } from "react-router-dom";
export default function CtaBtn({
  className,
  analyticsId,
  text = "Sign Up Free",
}) {
  const navigate = useNavigate();

  return (
    <button
      className={`group flex-shrink-0 mt-[35px] w-fit px-4 h-[55px] [drop-shadow(0px_4px_31.8px_#000000)] 
        bg-blue-600 text-white rounded-[10px] text-body flex items-center justify-center gap-4
        ${className}`}
      onClick={() => {
        navigate("/signup");
        trackCreateAccount("CTA-BTN-1.0");
      }}
    >
      <p className="text-white">{text}</p>
      <Arrow className="transform translate-y-[2px] transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}

/* Group 2 */
function Arrow({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="16"
      viewBox="0 0 22 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.7071 8.70711C22.0976 8.31658 22.0976 7.68342 21.7071 7.29289L15.3431 0.928932C14.9526 0.538408 14.3195 0.538408 13.9289 0.928932C13.5384 1.31946 13.5384 1.95262 13.9289 2.34315L19.5858 8L13.9289 13.6569C13.5384 14.0474 13.5384 14.6805 13.9289 15.0711C14.3195 15.4616 14.9526 15.4616 15.3431 15.0711L21.7071 8.70711ZM0 8V9H21V8V7H0V8Z"
        fill="white"
      />
    </svg>
  );
}
