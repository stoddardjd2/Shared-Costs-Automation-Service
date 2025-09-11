import React, { useState, useRef, useEffect } from "react";
import { Check, X, Edit3 } from "lucide-react";

const ContactCard = ({
  person,
  setNewPeople,
  isSelected,
  onToggle,
  index,
  addMode = false,
  deleteEnabled = false,
  onDeletePerson,
  handleUpdatePersonName,
  onUpdatePerson, // Add this prop for handling name updates
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(person.name);

  const divRef = useRef(null);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.focus();

      // Place cursor at the end of content
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(divRef.current);
      range.collapse(false); // false = collapse to end
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [isEditingName]);

  function formatPhoneNumber(phone) {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, "");

    // Ensure it has at least 11 digits (e.g., country code + number)
    if (digits.length !== 11) {
      return "Invalid phone number";
    }

    const country = digits[0];
    const area = digits.slice(1, 4);
    const middle = digits.slice(4, 7);
    const last = digits.slice(7);

    return `+${country} (${area})-${middle}-${last}`;
  }

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent triggering the card click

    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      // Auto-hide confirm after 3 seconds if not clicked
      // setTimeout(() => setShowDeleteConfirm(false), 3000);
    } else {
      // Confirmed delete
      onDeletePerson(person._id);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleEditName = (e) => {
    e.stopPropagation();
    setIsEditingName(true);
  };

  const handleSaveName = async (e) => {
    e.stopPropagation();
    if (editedName.trim() && editedName !== person.name) {
      handleUpdatePersonName(person._id, editedName);
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditedName(person.name);
    setIsEditingName(false);
  };

  const handleNameChange = (e) => {
    setEditedName(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveName(e);
    } else if (e.key === "Escape") {
      handleCancelEdit(e);
    }
  };

  return (
    <div
      onClick={() => {
        !addMode && !isEditingName && onToggle(person);
      }}
      className={`p-5 rounded-xl border-2 relative ${
        !addMode && !isEditingName && "cursor-pointer"
      } transition-all hover:shadow-md ${
        isSelected
          ? "shadow-md border-blue-600 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div
        className={`flex items-center gap-4 ${
          showDeleteConfirm && "opacity-40"
        }`}
      >
        <div
          className={`flex-shrink-0 w-[50px] h-[50px] rounded-xl ${person.color} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}
        >
          {person.avatar}
        </div>
        <div className="flex-1 w-[100px]">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              {/* <input
                type="text"
                value={editedName}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                className="font-semibold text-lg text-gray-900 bg-transparent border border-gray-300 rounded px-2  focus:outline-none focus:border-blue-500"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              /> */}
              <h3
                type="text"
                ref={divRef}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="font-semibold text-lg text-gray-900 bg-transparent rounded px-2  focus:outline-none border border-blue-500"
              >
                {editedName}
              </h3>
              <button
                onClick={handleSaveName}
                className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 transition-all"
                title="Save name"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 transition-all"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="font-semibold text-gray-900 border border-transparent text-lg">
                {editedName}
              </h3>
              {!deleteEnabled &&  addMode && (
                <button
                  onClick={handleEditName}
                  className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                  title="Edit name"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          {person.phone && (
            <p className="text-gray-600">{formatPhoneNumber(person.phone)}</p>
          )}
          {person.email && <p className="text-gray-600 w-full truncate">{person.email}</p>}
        </div>
      </div>
      <div
        // className="flex items-center gap-2 absolute top-1/2 right-[-10px] transform  -translate-y-1/2"
        className="flex items-center gap-2  absolute  right-0 top-1/2 sm:right-2 transform  -translate-y-1/2"
      >
        {deleteEnabled && !isEditingName && (
          <div className="flex items-center gap-1">
            {showDeleteConfirm ? (
              <>
                <button
                  onClick={handleDelete}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all"
                  title="Confirm delete"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 transition-all"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleDelete}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Delete contact"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
