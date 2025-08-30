import { useState } from "react";
import { Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { handleDeleteRequest } from "../../queries/requests";
import { useData } from "../../contexts/DataContext";

const MIN_LOADER_MS = 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CancelRequestBtn = ({ requestId, onDeleteSuccess }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null); // 'success' | 'error' | null
  const { setCosts } = useData();

  const handleDeleteClick = () => {
    setShowConfirmation(true);
    setDeleteStatus(null);
  };

  const handleConfirmDelete = async () => {
    if (!requestId) {
      setDeleteStatus("error");
      return;
    }

    setIsDeleting(true);
    setDeleteStatus(null);

    const startedAt = Date.now();

    try {
      const res = await handleDeleteRequest(requestId);

      // enforce minimum spinner time
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADER_MS) await sleep(MIN_LOADER_MS - elapsed);

      if (res.success) {
        setDeleteStatus("success");
        setIsDeleting(false);

        // Close modal after showing success briefly
        setTimeout(() => {
          setShowConfirmation(false);
          setDeleteStatus(null);
          onDeleteSuccess?.(); // safe if not provided
          setCosts((prevCosts) => prevCosts.filter((r) => requestId !== r._id));
        }, 2000);
      } else {
        throw new Error(res.message || "Failed to delete request");
      }
    } catch (error) {
      // also honor minimum spinner time on fast errors
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADER_MS) await sleep(MIN_LOADER_MS - elapsed);

      console.error("Error deleting request:", error);
      setDeleteStatus("error");
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setShowConfirmation(false);
      setDeleteStatus(null);
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={isDeleting}
        // className="text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-3 bg-gray-400 hover:bg-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        className="w-[172px] mr-auto text-gray-600  hover:text-black py-1 rounded-lg transition-all flex items-center justify-start gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-5 h-5 flex-shrink-0" />
        Delete Request
      </button>

      {showConfirmation && (
        <div
          onClick={handleCancelDelete}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            onClick={handleModalClick}
            className="bg-white rounded-lg p-6 max-w-sm mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Request
            </h3>

            {deleteStatus === "success" ? (
              <div className="flex items-center gap-3 text-blue-600 mb-6">
                <CheckCircle className="w-5 h-5" />
                <p>Request deleted successfully!</p>
              </div>
            ) : deleteStatus === "error" ? (
              <div className="flex items-center gap-3 text-red-600 mb-6">
                <AlertCircle className="w-5 h-5" />
                <p>Failed to delete request. Please try again.</p>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this request? This action cannot
                be undone.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting || deleteStatus === "success"}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : deleteStatus === "success" ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Deleted
                  </>
                ) : (
                  "Delete Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CancelRequestBtn;
