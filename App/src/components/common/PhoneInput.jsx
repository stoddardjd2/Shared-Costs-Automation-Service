import React from "react";

const PREFIX = "+1 ";

function formatUSPhoneNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  const [, a, b, c] = match || [];

  if (c) return `${PREFIX}(${a})-${b}-${c}`;
  if (b) return `${PREFIX}(${a})-${b}`;
  if (a) return `${PREFIX}(${a}`;
  return PREFIX;
}

export default function PhoneInput({ value, onChange }) {
  const enforceCursor = (e) => {
    if (e.target.selectionStart < PREFIX.length) {
      e.target.setSelectionRange(PREFIX.length, PREFIX.length);
    }
  };

  const handleChange = (e) => {
    const raw = e.target.value;

    // Prevent changing/removing the prefix
    if (!raw.startsWith(PREFIX)) return;

    const input = raw.slice(PREFIX.length);
    const formatted = formatUSPhoneNumber(input);

    onChange({
      target: {
        value: formatted,
      },
    });
  };

  return (
    <input
      id="phone-number-input"
      type="tel"
      value={value || PREFIX}
      onChange={handleChange}
      onClick={enforceCursor}
      onFocus={enforceCursor}
      placeholder="+1 (555)-123-4567"
      className="w-full p-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
    />
  );
}
