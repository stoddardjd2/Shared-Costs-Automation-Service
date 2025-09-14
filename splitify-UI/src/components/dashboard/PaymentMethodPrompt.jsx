import React, { useState, useCallback } from "react";
import { addPaymentMethod } from "../../queries/user";
import { useData } from "../../contexts/DataContext";
/**
 * Minimal + DRY payment method prompt
 * - Keeps raw input value (no formatting thrash)
 * - Prefix is visual only (@ or $)
 * - One Modal component reused for both types
 */
export default function PaymentMethodPrompt({
  setShowPaymentMethodPrompt,
  isEditingFromSettings,
}) {
  // setShowPaymentMethodPrompt for editing from settings

  const [bannerVisible, setBannerVisible] = useState(true);
  const [modalType, setModalType] = useState(null); // 'venmo' | 'cashapp' | null
  const [submitting, setSubmitting] = useState(false);
  const [modalDetails, setModalDetails] = useState({});
  const { setPaymentMethods, paymentMethods } = useData();
  // Raw values only (no symbols)
  const [values, setValues] = useState({
    venmo: paymentMethods?.venmo,
    cashapp: paymentMethods?.cashapp,
    paypal: paymentMethods?.paypal,
  });

  const openModal = useCallback((type) => {
    setModalType(type);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);

    document.body.style.overflow = "auto";
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    // for editing from settings
    if (isEditingFromSettings && setShowPaymentMethodPrompt) {
      setShowPaymentMethodPrompt(false);
    }
  }, []);

  const setValue = useCallback((type, v) => {
    // strip a single leading symbol if user types it, but keep everything else
    const clean = v.replace(/^[@$]/, "");
    setValues((prev) => ({ ...prev, [type]: clean }));
  }, []);

  const handleSubmit = useCallback(
    async (type) => {
      const raw = values[type]?.trim();
      if (!raw) return;

      setSubmitting(true);
      try {
        // Send raw value (no symbol)

        const res = await addPaymentMethod(type, raw);
        console.log("res", res);
        if (!res?.success) throw new Error("Failed to save");
        // success: close and hide banner
        setPaymentMethods(values);
        closeModal();
        // dismissBanner();
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
    },
    [values, closeModal, dismissBanner]
  );

  if (!bannerVisible) return null;

  if (isEditingFromSettings) {
    return (
      <div className="bg-slate-50 rounded-2xl">
        <div className="relative bg-white rounded-2xl p-5 text-white overflow-hidden shadow-[0_10px_25px_rgba(37,99,235,0.2)] mx-auto">
          <button
            onClick={dismissBanner}
            className={`absolute top-4 right-4 border-none ${
              isEditingFromSettings
                ? "flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                : "text-white hover:bg-white/30 bg-white/20 rounded-lg"
            } w-8 h-8  cursor-pointer text-base transition-all duration-200 z-[3]`}
            title="Dismiss"
          >
            ×
          </button>

          <div className="relative z-[2]">
            <div className="flex sm:items-center flex-col items-center mb-4 ">
              <div
                className={`w-14 h-14 mt-2 ${
                  !isEditingFromSettings && "hidden"
                } sm:flex sm:mt-0 flex-shrink-0 mb-4 bg-blue-600 rounded-xl flex items-center justify-center backdrop-blur-md`}
              >
                <CreditCardIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900 mb-2 text-center">
                  Set up payments
                </div>
                <div className="text-slate-600 text-sm text-center">
                  Add your payment methods to make it easier for others to send
                  you money.
                </div>
              </div>
            </div>

            <div
              className={`flex gap-3 flex-wrap ${
                isEditingFromSettings && "justify-center"
              }`}
            >
              {(!paymentMethods?.venmo || isEditingFromSettings) && (
                <PaymentButton
                  onClick={() => {
                    openModal("venmo");
                    setModalDetails({
                      label: "Venmo Username",
                      placeholder: "yourUsername",
                      icon: <VenmoIcon />,
                      prefix: "@",
                      name: "Venmo",
                    });
                  }}
                  icon={<VenmoIcon />}
                  label="Add Venmo"
                  isEditingFromSettings={isEditingFromSettings}
                />
              )}
              {(!paymentMethods?.cashapp || isEditingFromSettings) && (
                <PaymentButton
                  onClick={() => {
                    setModalDetails({
                      label: "Cash App Tag",
                      placeholder: "yourCashtag",
                      icon: <CashappIcon />,
                      prefix: "$",
                      name: "Cash App",
                    });
                    openModal("cashapp");
                  }}
                  icon={<CashappIcon />}
                  label="Add Cash App"
                  isEditingFromSettings={isEditingFromSettings}
                />
              )}
              {(!paymentMethods?.paypal || isEditingFromSettings) && (
                <PaymentButton
                  onClick={() => {
                    setModalDetails({
                      label: "PayPal",
                      placeholder: "yourPayPal",
                      icon: <PaypalIcon />,
                      prefix: "@",
                      name: "PayPal",
                    });
                    openModal("paypal");
                  }}
                  icon={<PaypalIcon />}
                  label="Add PayPal"
                  isEditingFromSettings={isEditingFromSettings}
                />
              )}
            </div>
          </div>
        </div>

        {modalType && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <PaymentModal
              type={modalType}
              value={values[modalType]}
              onChange={(v) => setValue(modalType, v)}
              onCancel={closeModal}
              onSave={() => handleSubmit(modalType)}
              submitting={submitting}
              label={modalDetails.label}
              placeholder={modalDetails.placeholder}
              icon={modalDetails.icon}
              prefix={modalDetails.prefix}
              name={modalDetails.name}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-2xl">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white overflow-hidden shadow-[0_10px_25px_rgba(37,99,235,0.2)] mx-auto">
        <button
          onClick={dismissBanner}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-none text-white w-8 h-8 rounded-lg cursor-pointer text-base transition-all duration-200 z-[3]"
          title="Dismiss"
        >
          ×
        </button>

        <div className="relative z-[2]">
          <div className="flex sm:items-center items-start gap-4 mb-4 ">
            <div className="w-12 h-12 mt-2 hidden sm:flex sm:mt-0 flex-shrink-0 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <CreditCardIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold ">Set up payments</div>
              <div className="text-base opacity-90 leading-relaxed ">
                Add your payment methods to make it easier for others to send
                you money.
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {(!paymentMethods?.venmo || isEditingFromSettings) && (
              <PaymentButton
                onClick={() => {
                  openModal("venmo");
                  setModalDetails({
                    label: "Venmo Username",
                    placeholder: "yourUsername",
                    icon: <VenmoIcon />,
                    prefix: "@",
                    name: "Venmo",
                  });
                }}
                icon={<VenmoIcon />}
                label="Add Venmo"
              />
            )}
            {(!paymentMethods?.cashapp || isEditingFromSettings) && (
              <PaymentButton
                onClick={() => {
                  setModalDetails({
                    label: "Cash App Tag",
                    placeholder: "yourCashtag",
                    icon: <CashappIcon />,
                    prefix: "$",
                    name: "Cash App",
                  });
                  openModal("cashapp");
                }}
                icon={<CashappIcon />}
                label="Add Cash App"
              />
            )}
            {(!paymentMethods?.paypal || isEditingFromSettings) && (
              <PaymentButton
                onClick={() => {
                  setModalDetails({
                    label: "PayPal",
                    placeholder: "yourPayPal",
                    icon: <PaypalIcon />,
                    prefix: "@",
                    name: "PayPal",
                  });
                  openModal("paypal");
                }}
                icon={<PaypalIcon />}
                label="Add PayPal"
              />
            )}
          </div>
        </div>
      </div>

      {modalType && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <PaymentModal
            type={modalType}
            value={values[modalType]}
            onChange={(v) => setValue(modalType, v)}
            onCancel={closeModal}
            onSave={() => handleSubmit(modalType)}
            submitting={submitting}
            label={modalDetails.label}
            placeholder={modalDetails.placeholder}
            icon={modalDetails.icon}
            prefix={modalDetails.prefix}
            name={modalDetails.name}
          />
        </div>
      )}
    </div>
  );
}

/* ---------- Reusable UI pieces ---------- */

function PaymentButton({ onClick, icon, label, isEditingFromSettings }) {
  return (
    <button
      onClick={onClick}
      className={`${
        isEditingFromSettings
          ? "bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white"
          : "bg-white/15 hover:bg-white/25 border border-white/30 text-white"
      } px-2 py-2 sm:px-6 sm:py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-md translate-y-0 hover:-translate-y-0.5 shadow-none hover:shadow-lg hover:shadow-black/10`}
    >
      {icon}
      {label}
    </button>
  );
}

function PaymentModal({
  type,
  value,
  onChange,
  onCancel,
  onSave,
  submitting,
  name,
  label,
  prefix,
  icon,
  placeholder,
}) {
  const disabled = submitting || !value?.trim();
  console.log("icon", icon);
  return (
    <div className="bg-white  rounded-2xl p-8 w-full max-w-md mx-5 shadow-2xl transform transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">Add {name}</h3>
      </div>

      <div className="mb-5">
        <label
          htmlFor={`${type}-input`}
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {label}
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 select-none">
            {prefix}
          </span>
          <input
            id={`${type}-input`}
            type="text"
            value={value}
            onChange={(e) => {
              // keep raw; strip only a single leading symbol if typed
              const v = e.target.value.replace(/^[@$]/, "");
              onChange(v);
            }}
            className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
            placeholder={placeholder}
            autoComplete="off"
            inputMode="text"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`px-6 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-gray-100 text-gray-700 hover:bg-gray-200 `}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={disabled}
          className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border-none text-white ${
            disabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {submitting ? "Saving..." : `Save ${name}`}
        </button>
      </div>
    </div>
  );
}

/* ---------- Icons (unchanged) ---------- */

function CreditCardIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21 8.5C21 7.11929 19.8807 6 18.5 6H5.5C4.11929 6 3 7.11929 3 8.5V15.5C3 16.8807 4.11929 18 5.5 18H18.5C19.8807 18 21 16.8807 21 15.5V8.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M7 12H7.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 12H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M3 9L21 9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CashappIcon({ isEditingFromSettings }) {
  return (
    <svg
      fill="#ffffff"
      viewBox="0 0 24 24"
      role="img"
      stroke="#ffffff"
      className="w-7 h-7"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M23.59 3.47A5.1 5.1 0 0 0 20.54.42C19.23 0 18.04 0 15.62 0H8.36c-2.4 0-3.61 0-4.9.4A5.1 5.1 0 0 0 .41 3.46C0 4.76 0 5.96 0 8.36v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 0 0 3.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 0 0 3.06-3.06c.41-1.3.41-2.5.41-4.9V8.38c0-2.41 0-3.61-.41-4.91zM17.42 8.1l-.93.93a.5.5 0 0 1-.67.01 5 5 0 0 0-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 0 1-.48.39H9.63l-.09-.01a.5.5 0 0 1-.38-.59l.28-1.27a6.54 6.54 0 0 1-2.88-1.57v-.01a.48.48 0 0 1 0-.68l1-.97a.49.49 0 0 1 .67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 0 1 .48-.38h1.78c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z"></path>
    </svg>
  );
}

function VenmoIcon({ isEditingFromSettings }) {
  return (
    <svg
      fill="#ffffff"
      viewBox="0 0 512 512"
      stroke="#ffffff"
      className={`w-7 h-7 ${isEditingFromSettings && ""}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M444.17,32H70.28C49.85,32,32,46.7,32,66.89V441.6C32,461.91,49.85,480,70.28,480H444.06C464.6,480,480,461.8,480,441.61V66.89C480.12,46.7,464.6,32,444.17,32ZM278,387H174.32L132.75,138.44l90.75-8.62,22,176.87c20.53-33.45,45.88-86,45.88-121.87,0-19.62-3.36-33-8.61-44L365.4,124.1c9.56,15.78,13.86,32,13.86,52.57C379.25,242.17,323.34,327.26,278,387Z"></path>
    </svg>
  );
}

function PaypalIcon({}) {
  return (
    <svg
      className={`w-7 h-7`}
      fill="#ffffff"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.982.382-1.064.9l-1.106 7.006zm2.146-10.814a.641.641 0 0 0 .633-.74L8.930 2.717a.641.641 0 0 1 .633-.74h4.008c1.295 0 2.233.259 2.845.833.612.574.918 1.407.918 2.833 0 .259-.018.5-.053.740-.018.259-.053.518-.118.777-.018.037-.018.074-.035.111-.353 1.704-1.353 2.833-3.08 3.481-.595.222-1.295.333-2.104.333H9.222z"></path>
    </svg>
  );
}
