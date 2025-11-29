import React from "react";
import StepCard from "./StepCard";
import CategoryBadge from "../CategoryBadge";

export default function HookStep({
  hookTemplates,
  selectedHookIndex,
  handleSelectHookIndex,
  useHookTemplate,
  setUseHookTemplate,
  categorizeHookLibrary,
  isCategorizingHooks,
  openPasteModal,
  handleHookUpload,
  generateHookOnly,
  isGeneratingHook,
  additionalHookRules,
  setAdditionalHookRules,
  concreteHook,
  setConcreteHook,
  painPoint,
  setPainPoint,
  hookUploadError,
}) {
  return (
    <StepCard
      step="Step 3"
      eyebrow="Hook Templates"
      title="Select, Paste, or Ignore"
      action={
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700">
            <input
              type="checkbox"
              checked={!useHookTemplate}
              onChange={(e) => setUseHookTemplate(!e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Generate hook without template</span>
          </label>
          <button
            type="button"
            onClick={categorizeHookLibrary}
            disabled={isCategorizingHooks}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600 disabled:opacity-60"
          >
            {isCategorizingHooks ? "Categorizing..." : "Categorize Hooks"}
          </button>
          <button
            type="button"
            onClick={openPasteModal}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
          >
            Paste Hooks
          </button>
          <label className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white cursor-pointer hover:border-blue-600 hover:text-blue-600">
            <span>Upload Hooks</span>
            <input
              type="file"
              accept=".md,.txt,.csv"
              onChange={handleHookUpload}
              className="hidden"
            />
          </label>
        </div>
      }
    >
      {hookUploadError && (
        <p className="text-xs text-red-600">{hookUploadError}</p>
      )}

      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4 md:gap-6">
        <div className="border border-gray-100 rounded-lg max-h-64 overflow-y-auto">
          {hookTemplates.map((hook, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectHookIndex(idx)}
              className={`w-full px-3 py-2 text-xs sm:text-sm border-b last:border-b-0 flex items-start gap-2 text-left ${
                idx === selectedHookIndex
                  ? "bg-blue-50 text-blue-800 border-blue-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="font-semibold">#{idx + 1}</span>
              <span className="flex-1 text-left">{hook.text}</span>
              <CategoryBadge label={hook.category} />
            </button>
          ))}
          {!hookTemplates.length && (
            <div className="px-3 py-2 text-xs text-gray-500">
              No hooks yet. Upload a file with a <code>| Hook |</code> column.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">
              Selected Hook Template
            </p>
            <p className="text-xs bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
              {useHookTemplate
                ? hookTemplates[selectedHookIndex]?.text || "None selected"
                : "Ignored - generating hook to fit the selected pain point."}
            </p>
            {useHookTemplate && (
              <div className="flex items-center gap-2 text-[11px] text-gray-600">
                <span>Category</span>
                <CategoryBadge
                  label={hookTemplates[selectedHookIndex]?.category}
                />
              </div>
            )}
            <p className="text-[11px] text-gray-500">
              {useHookTemplate
                ? "Template index is stored in localStorage and reused on reload."
                : "When toggled, hook library is ignored; we craft a hook that fits the generated pain point."}
            </p>
          </div>

          <button
            type="button"
            onClick={generateHookOnly}
            disabled={isGeneratingHook}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {isGeneratingHook ? "Generating..." : "Generate Hook"}
          </button>

          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-gray-700">
                Additional Hook Rules (optional)
              </label>
              <textarea
                value={additionalHookRules}
                onChange={(e) => setAdditionalHookRules(e.target.value)}
                rows={2}
                className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
                placeholder="Any extra constraints or style notes for the hook (optional)."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">
                Generated Hook
              </label>
              <textarea
                value={concreteHook}
                onChange={(e) => setConcreteHook(e.target.value)}
                rows={2}
                className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
                placeholder="Generated hook will appear here (editable)."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">
                Generated Pain Point
              </label>
              <textarea
                value={painPoint}
                onChange={(e) => setPainPoint(e.target.value)}
                rows={2}
                className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
                placeholder="Selected pain point"
              />
            </div>
          </div>
        </div>
      </div>
    </StepCard>
  );
}
