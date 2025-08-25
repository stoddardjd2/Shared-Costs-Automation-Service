import { Building2, Landmark, Link } from "lucide-react";

export default function PlaidConnectFAB({
  onClick,
  className = "",
  position = "top-right",
  ...props
}) {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-20 right-6",
    "top-left": "top-6 left-6",
  };

  return (
    <button
      onClick={onClick}
      className={`fixed ${positionClasses[position]} z-60 flex items-center justify-center w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-600 ${className}`}
      {...props}
    >
      <Building2 size={24} />
    </button>
  );
}
