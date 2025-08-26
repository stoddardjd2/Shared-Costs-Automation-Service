import { useState } from "react";

const CancelRequestBtn = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    // Add your delete logic here
    console.log("Request deleted");
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <button
        onClick={handleDeleteClick}
        className="text-white text-sm px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-3 bg-gray-400 hover:bg-red-700 cursor-pointer"
      >
        Delete Request
      </button>

      {showConfirmation && (
        <div
          onClick={handleCancelDelete}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Request
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this request? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
              >
                Delete Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CancelRequestBtn;
