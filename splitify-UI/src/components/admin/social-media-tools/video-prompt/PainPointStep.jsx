import React from "react";
import StepCard from "./StepCard";
import CategoryBadge from "./CategoryBadge";

export default function PainPointStep({
  painPointLibrary,
  selectedPainPointIndex,
  handleSelectPainPointIndex,
  painPointCategory,
  setPainPointCategory,
  generatePainPoint,
  isGeneratingPainPoint,
  categorizePainPointLibrary,
  isCategorizingPainPoints,
  openPasteModal,
}) {
  return (
    <StepCard
      step="Step 2"
      eyebrow="Pain Points"
      title="Collect, Paste, or Generate"
      action={
        <div className="flex items-center gap-2 text-xs">
          <input
            type="text"
            value={painPointCategory}
            onChange={(e) => setPainPointCategory(e.target.value)}
            className="w-32 rounded-md border border-gray-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            placeholder="Category"
          />
          <button
            type="button"
            onClick={categorizePainPointLibrary}
            disabled={isCategorizingPainPoints}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600 disabled:opacity-60"
          >
            {isCategorizingPainPoints ? "Categorizing..." : "Categorize All"}
          </button>
          <button
            type="button"
            onClick={openPasteModal}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
          >
            Paste Pain Points
          </button>
          <button
            type="button"
            onClick={generatePainPoint}
            disabled={isGeneratingPainPoint}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {isGeneratingPainPoint ? "Generating..." : "Generate Pain Point"}
          </button>
        </div>
      }
    >
      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4 md:gap-6">
        <div className="border border-gray-100 rounded-lg max-h-64 overflow-y-auto">
          {painPointLibrary.map((pp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPainPointIndex(idx)}
              className={`w-full px-3 py-2 text-xs sm:text-sm border-b last:border-b-0 flex items-start gap-2 text-left ${
                idx === selectedPainPointIndex
                  ? "bg-blue-50 text-blue-800 border-blue-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="font-semibold">#{idx + 1}</span>
              <span className="flex-1 text-left">{pp.text}</span>
              <CategoryBadge label={pp.category} />
            </button>
          ))}
          {!painPointLibrary.length && (
            <div className="px-3 py-2 text-xs text-gray-500">
              No pain points yet. Generate or paste them below.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">
              Selected Pain Point
            </p>
            <p className="text-xs bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
              {painPointLibrary[selectedPainPointIndex]?.text || "None selected"}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <span>Category</span>
              <CategoryBadge
                label={painPointLibrary[selectedPainPointIndex]?.category}
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Selecting sets the pain point used for hook & script generation.
            </p>
          </div>
        </div>
      </div>
    </StepCard>
  );
}
