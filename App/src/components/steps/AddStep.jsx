import { ArrowLeft, User, Phone, AlertCircle } from "lucide-react";
import StepIndicator from "./StepIndicator";
import PhoneInput from "../common/PhoneInput";
import { useEffect, useState } from "react";
// import '../styles/react-international-phone-input.css';
import { validatePhoneNumber } from "../../utils/stepUtils";
import "../../styles/index.css";
import ContactCard from "../costs/ContactCard";
const AddStep = ({
  newPerson,
  newPeople,
  setNewPerson,
  onAddPerson,
  onBack,
  setIsPhoneInUse,
  isPhoneInUse,
}) => {
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

  const [phoneError, setPhoneError] = useState("");
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-8">
        <StepIndicator current="add" />
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add People</h1>
            <p className="text-gray-600">Enter the person's details</p>
          </div>
        </div>

        <div className="space-y-6 mb-32">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={newPerson.name}
              onChange={(e) => {
                setNewPerson((prev) => ({ ...prev, name: e.target.value }));
              }}
              placeholder="Enter full name"
              className="w-full p-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>

            <PhoneInput
              value={newPerson.phone}
              onChange={(e) => {
                setIsPhoneInUse(false); // Reset phone in use error when user types
                setNewPerson((prev) => ({ ...prev, phone: e.target.value }));
                // Reset border color and error message on change
                const phoneInput =
                  document.getElementById("phone-number-input");

                phoneInput.style.borderColor =
                  "rgb(229 231 235 / var(--tw-border-opacity, 1))";
                setPhoneError(""); // Clear any existing error
              }}
            />

            {/* Error message display */}
            {/* Error message display */}
            {(phoneError || isPhoneInUse) && (
              <div className="mt-2 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {isPhoneInUse
                    ? "This phone number is already in use"
                    : phoneError}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              const isValidPhoneNumber = validatePhoneNumber(newPerson.phone);
              const phoneInput = document.getElementById("phone-number-input");

              if (!isValidPhoneNumber) {
                // Invalid phone number format
                phoneInput.style.borderColor = "red";
                setPhoneError("Please enter a valid phone number");
                return;
              }

              if (isPhoneInUse) {
                // Phone number is already in use
                phoneInput.style.borderColor = "red";
                setPhoneError("This phone number is already in use");
                return;
              }

              // Phone number is valid and not in use
              phoneInput.style.borderColor =
                "rgb(229 231 235 / var(--tw-border-opacity, 1))";
              onAddPerson();
            }}
            className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
            style={{
              backgroundColor:
                !newPerson.name.trim() || !newPerson.phone.trim()
                  ? "#d1d5db"
                  : "#2563eb",
            }}
            disabled={!newPerson.name.trim() || !newPerson.phone.trim()}
          >
            Add Person
          </button>

          {/* Added people preview */}
          {!newPeople.length == 0 && (
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Added People:
              </p>
              <div className="flex-col gap-3 flex">
                {newPeople.map((person, index) => {
                  return (
                    <ContactCard
                      addMode={true}
                      key={person._id}
                      person={person}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-2xl">
          <div className="max-w-lg mx-auto">
            <button
              onClick={onBack}
              className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
              style={{ backgroundColor: "#2563eb" }}
            >
              Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStep;
