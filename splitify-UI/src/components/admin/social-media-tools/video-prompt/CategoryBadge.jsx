import React from "react";

export default function CategoryBadge({ label }) {
  if (!label) return null;
  return (
    <span className="ml-auto inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
      {label}
    </span>
  );
}
