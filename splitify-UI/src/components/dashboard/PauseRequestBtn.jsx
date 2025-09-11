import { useState } from "react";
import {
  PauseCircle,
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { handleTogglePauseRequest } from "../../queries/requests";
import { useData } from "../../contexts/DataContext";

const MIN_LOADER_MS = 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PauseRequestBtn = ({ requestId, isPausedPassed, onToggleSuccess }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPaused, setIsPaused] = useState(isPausedPassed);
  const [isToggling, setIsToggling] = useState(false);
  const [toggleStatus, setToggleStatus] = useState(null); // 'success' | 'error' | null
  const { setCosts } = useData();

  const handlePauseClick = () => {
    setShowConfirmation(true);
    setToggleStatus(null);
  };

  const handleConfirmToggle = async () => {
    if (!requestId) {
      setToggleStatus("error");
      return;
    }

    setIsToggling(true);
    setToggleStatus(null);

    const startedAt = Date.now();

    try {
      const res = await handleTogglePauseRequest(requestId);

      // Ensure the loader is visible for at least 1 second
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADER_MS) await sleep(MIN_LOADER_MS - elapsed);

      if (res.success) {
        setToggleStatus("success");
        setIsToggling(false);

        // Close modal after showing success for a moment
        setTimeout(() => {
          setShowConfirmation(false);
          setToggleStatus(null);
          onToggleSuccess?.();
          setCosts((prevCosts) =>
            prevCosts.map((request) =>
              request._id === requestId
                ? { ...request, isPaused: !request.isPaused }
                : request
            )
          );
          setIsPaused(!isPaused);
        }, 1500);
      } else {
        throw new Error(
          res.message || `Failed to ${isPaused ? "unpause" : "pause"} request`
        );
      }
    } catch (error) {
      // Ensure minimum loader time even on fast errors
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADER_MS) await sleep(MIN_LOADER_MS - elapsed);

      console.error(
        `Error ${isPaused ? "unpausing" : "pausing"} request:`,
        error
      );
      setToggleStatus("error");
      setIsToggling(false);
    }
  };

  const handleCancelToggle = () => {
    if (!isToggling) {
      setShowConfirmation(false);
      setToggleStatus(null);
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const actionText = isPaused ? "Resume" : "Pause";
  const actionVerb = isPaused ? "resume" : "pause";

  return (
    <>
      <button
        onClick={handlePauseClick}
        disabled={isToggling}
        // className={`text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        //   isPaused ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"
        // }`}
        className="w-fit mr-auto text-gray-600 hover:text-black py-1 rounded-lg transition-all flex items-center justify-start gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPaused ? (
          <Play className="w-5 h-5 flex-shrink-0 " />
        ) : (
          <PauseCircle className="w-5 h-5 flex-shrink-0 " />
        )}
        {actionText} 
      </button>

      {showConfirmation && (
        <div
          onClick={handleCancelToggle}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            onClick={handleModalClick}
            className="bg-white rounded-lg p-6 max-w-sm mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {actionText} Request
            </h3>

            {toggleStatus === "success" ? (
              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    isPaused ? "bg-blue-100" : "bg-blue-100"
                  }`}
                >
                  <CheckCircle
                    className={`w-8 h-8 ${
                      isPaused ? "text-blue-600" : "text-blue-600"
                    }`}
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Request {isPaused ? "Resumed" : "Paused"}
                </h4>
                <p
                  className={`font-medium ${
                    isPaused ? "text-blue-600" : "text-blue-600"
                  }`}
                >
                  Your request has been successfully{" "}
                  {isPaused ? "resumed" : "paused"}
                </p>
              </div>
            ) : toggleStatus === "error" ? (
              <div className="flex items-center gap-3 text-red-600 mb-6">
                <AlertCircle className="w-5 h-5" />
                <p>Failed to {actionVerb} request. Please try again.</p>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                {!isPaused && " Future requests will not be sent while paused."}
                {isPaused && " The request will continue processing."}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelToggle}
                disabled={isToggling}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmToggle}
                disabled={isToggling || toggleStatus === "success"}
                className={`px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center ${
                  isPaused
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isToggling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isPaused ? "Resuming..." : "Pausing..."}
                  </>
                ) : toggleStatus === "success" ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {isPaused ? "Resumed" : "Paused"}
                  </>
                ) : (
                  `${actionText} Request`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PauseRequestBtn;
