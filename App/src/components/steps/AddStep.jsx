import { ArrowLeft, User, Phone } from "lucide-react";
import StepIndicator from "./StepIndicator";
import PhoneInput from "../common/PhoneInput";
import { useEffect } from "react";
// import '../styles/react-international-phone-input.css';
import { validatePhoneNumber } from "../../utils/stepUtils";
import "../../styles/index.css";
const AddStep = ({
  newPerson,
  newPeople,
  setNewPerson,
  onAddPerson,
  onBack,
}) => {
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
              onChange={(e) =>
                setNewPerson((prev) => ({ ...prev, name: e.target.value }))
              }
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
                setNewPerson((prev) => ({ ...prev, phone: e.target.value }));
                // Reset border color on change to remove possible red border(error state)
                const phoneInput =
                  document.getElementById("phone-number-input");

                phoneInput.style.borderColor =
                  "rgb(229 231 235 / var(--tw-border-opacity, 1))";
              }}
            />
          </div>

          <button
            onClick={() => {
              const isValidPhoneNumber = validatePhoneNumber(newPerson.phone);
              // if invalid number, show red border
              const phoneInput = document.getElementById("phone-number-input");

              if (isValidPhoneNumber) {
                onAddPerson();

                phoneInput.style.borderColor =
                  "rgb(229 231 235 / var(--tw-border-opacity, 1))";
              } else {
                phoneInput.style.borderColor = "red";
              }
            }}
            class="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
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
          {/* {(newPerson.name || newPerson.phone) && ( */}
          {!newPeople.length == 0 && (
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Added People:
              </p>

              {newPeople.map((person, index) => {
                return (
                  <div className="flex items-center gap-3 mb-3" key={index}>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm ${person.color}`}
                    >
                      {person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {person.name || "Name"}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {person.phone || "Phone number"}
                      </p>
                    </div>
                  </div>
                );
              })}
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
