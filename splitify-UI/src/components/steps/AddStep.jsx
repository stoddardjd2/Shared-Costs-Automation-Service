import {
  ArrowLeft,
  User,
  Phone,
  AlertCircle,
  Mail,
  Users,
  ArrowRight,
} from "lucide-react";
import StepIndicator from "./StepIndicator";
import PhoneInput from "../common/PhoneInput";
import { useEffect, useState } from "react";
import { validatePhoneNumber } from "../../utils/stepUtils";
import "../../styles/index.css";
import ContactCard from "../costs/ContactCard";
import ConfirmButtonTray from "./ConfirmButtonTray";

const AddStep = ({
  newPerson,
  newPeople,
  setNewPeople,
  setNewPerson,
  onAddPerson,
  onContinue,
  onBack,
  onDeletePerson,
  /* setIsPhoneInUse,
  isPhoneInUse, */
  setEmailError,
  emailError,
  phoneError,
  setPhoneError,
  handleUpdatePersonName,
  selectedPeople,
}) => {
  /* function formatPhoneNumber(phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 11) return "Invalid phone number";
    const country = digits[0];
    const area = digits.slice(1, 4);
    const middle = digits.slice(4, 7);
    const last = digits.slice(7);
    return `+${country} (${area})-${middle}-${last}`;
  } */

  // const [emailError, setEmailError] = useState("");
  const [isPhoneInUse, setIsPhoneInUse] = useState(false);
  const validateEmail = (email) => {
    // simple, practical email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  console.log("phphoneError", phoneError);
  return (
    <div className="min-h-screen bg-gray-50  mt-10">
      <div className="max-w-lg mx-auto px-6 pb-20">
        {/* <StepIndicator current="add" /> */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Person</h1>
            <p className="text-gray-600">Add someone to split a bill with</p>
          </div>
        </div>

        <div className="space-y-6 mb-32">
          {/* Full Name */}
          <div>
            <label className="ml-2 block text-sm font-semibold text-gray-700 mb-3">
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

          {/* EMAIL (replaces phone UI, same styling pattern) */}
          {/* <div>
              <label className="ml-2 block text-sm font-semibold text-gray-700 mb-3">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>

              <input
                id="email-input"
                type="email"
                value={newPerson.email || ""}
                onChange={(e) => {
                  setEmailError("");
                  setNewPerson((prev) => ({ ...prev, email: e.target.value }));
                  const input = document.getElementById("email-input");
                  if (input) {
                    input.style.borderColor =
                      "rgb(229 231 235 / var(--tw-border-opacity, 1))";
                  }
                }}
                placeholder="name@example.com"
                className="w-full p-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />

              {emailError && (
                <div className="mt-2 flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{emailError.message}</span>
                </div>
              )}
            </div> */}

          {/* --- PHONE UI & LOGIC COMMENTED OUT --- */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>

            <PhoneInput
              value={newPerson.phone}
              onChange={(e) => {
                setIsPhoneInUse(false);
                setNewPerson((prev) => ({ ...prev, phone: e.target.value }));
                const phoneInput =
                  document.getElementById("phone-number-input");
                phoneInput.style.borderColor =
                  "rgb(229 231 235 / var(--tw-border-opacity, 1))";
                setPhoneError("");
              }}
            />
            {phoneError && (
              <div className="mt-2 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{emailError.message}</span>
              </div>
            )}
              {/* <div className="mt-2 flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-orange-600" />
                <span className="text-sm">Only add people you know, misuse will result in a permanent ban</span>
              </div> */}
          </div>

          {/* Submit */}
          <button
            // onClick={() => {
            //   const input = document.getElementById("email-input");
            //   const ok = validateEmail(newPerson.email || "");
            //   if (!ok) {
            //     if (input) input.style.borderColor = "red";
            //     console.log("invalid email");
            //     setEmailError({
            //       message: "Please enter a valid email address",
            //     });
            //     return;
            //   }
            //   input.style.borderColor =
            //     "rgb(229 231 235 / var(--tw-border-opacity, 1))";
            //   onAddPerson();
            // }}
            onClick={() => {
              onAddPerson();
            }}
            className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
            style={{
              backgroundColor:
                !newPerson.name?.trim() ||
                !((newPerson.phone || "").length == 17)
                  ? "#d1d5db"
                  : "#2563eb",
            }}
            disabled={
              !newPerson.name?.trim() || !((newPerson.phone || "").length == 17)
            }
          >
            Add Person
          </button>

          {/* Added people preview */}
          {!!newPeople.length && (
            <div
            // className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <p className="text-sm font-semibold text-gray-700 mb-2">
                <label className="ml-2 block text-sm font-semibold text-gray-700 mb-3">
                  <Users className="w-4 h-4 inline mr-2" />
                  Added People:
                </label>
              </p>
              <div className="flex-col gap-3 flex">
                {newPeople.map((person, index) => (
                  <ContactCard
                    addMode={true}
                    key={person._id}
                    person={person}
                    index={index}
                    setNewPeople={setNewPeople}
                    onDeletePerson={onDeletePerson}
                    handleUpdatePersonName={handleUpdatePersonName}
                    deleteEnabled={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-2xl">
          <div className="max-w-lg mx-auto">
            <button
              onClick={onBack}
              className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
              style={{ backgroundColor: "#2563eb" }}
            >
              Return
            </button>
          </div>
        </div> */}
      </div>
      <ConfirmButtonTray
        buttonContent={
          <>
            Continue
            <ArrowRight className="w-5 h-5" />
          </>
        }
        selectedPeople={selectedPeople}
        onConfirm={onContinue}
        hideBillingInfo={true}
      />
    </div>
  );
};

export default AddStep;
