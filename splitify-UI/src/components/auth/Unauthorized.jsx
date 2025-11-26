import { Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100 text-center animate-fade-in">
        
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-blue-50">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-2xl font-semibold text-gray-900">
          Access Denied
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-gray-600 text-sm leading-relaxed">
          You don't have permission to view this page.  
          If you believe this is a mistake, please contact support.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
