import React from "react";
import StepCard from "./StepCard";

export default function CoreContextStep({
  productDescription,
  setProductDescription,
  character,
  setCharacter,
  sceneBaseDescription,
  setSceneBaseDescription,
}) {
  return (
    <StepCard
      step="Step 1"
      eyebrow="Core Context"
      title="Product, Character, Scene"
      hint="Feeds both pain points and hooks."
    >
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800">
            Product Description (used for HOOK, PAIN POINT, and SCRIPT)
          </label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">
              Character
            </label>
            <textarea
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
              placeholder="[CHARACTER]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">
              Base Scene Description
            </label>
            <textarea
              value={sceneBaseDescription}
              onChange={(e) => setSceneBaseDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
              placeholder="[SCENE DESCRIPTION]"
            />
          </div>
        </div>
      </div>
    </StepCard>
  );
}
