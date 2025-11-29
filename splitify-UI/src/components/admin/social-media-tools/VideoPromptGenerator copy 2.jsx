import React, { useState, useEffect, useRef } from "react";
import { handleVideoPromptStream } from "../../../queries/admin";

export default function VideoPromptGenerator() {
  const fields = [
    "HOOK",
    "DESCRIPTION",
    "PAIN_POINT",
    "CHARACTER",
    "SCENE_DESCRIPTION",
    "RULES",
    "SCRIPT",
    "FRAMING",
  ];

  const [values, setValues] = useState(() => {
    const obj = {};
    fields.forEach((f) => {
      obj[f] = localStorage.getItem(`vprompt_${f}`) || "";
    });
    return obj;
  });

  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState("");
  const abortRef = useRef(null);

  useEffect(() => {
    Object.keys(values).forEach((k) =>
      localStorage.setItem(`vprompt_${k}`, values[k])
    );
  }, [values]);

  const updateField = (field, val) => {
    setValues((prev) => ({ ...prev, [field]: val }));
  };

  const generatePrompt = async () => {
    setLoading(true);
    setResponseText("");

    const userMessage = `
Primary [HOOK]: [${values.HOOK}] given splitify [${values.DESCRIPTION}] for given [${values.PAIN_POINT}].

Create script for given [${values.HOOK}] and [${values.PAIN_POINT}] using [${values.DESCRIPTION}] for tik tok video using the document that would go viral/engage our target users. Do not add text, graphics, props, or additional people. Make scenes in increments of 15 seconds and maximum of 45 seconds total. Make sure appropriate amount of script for time allotted.

CHARACTER: [${values.CHARACTER}]
SCENE: [${values.SCENE_DESCRIPTION}]
HARD RULES: [${values.RULES}]
    `.trim();

    // AbortController only used on frontend. Backend stream continues until done.
    abortRef.current = new AbortController();

    try {
      const res = await handleVideoPromptStream();
      console.log("res!", res)

      
      if (!res.ok || !res.body) {
        const text = await res.text();
        console.error("Backend error:", res.status, text);
        setResponseText("Error generating prompt.");
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk
          .split("\n")
          .filter((l) => l.trim().startsWith("data:"));

        for (let line of lines) {
          const json = line.replace("data:", "").trim();
          if (json === "[DONE]") break;

          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              setResponseText((prev) => prev + delta);
            }
          } catch (e) {
            console.log("stream parse err", e);
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Fetch error:", err);
        setResponseText("Network error while generating prompt.");
      }
    }

    setLoading(false);
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-600">
        Video Prompt Generator
      </h1>

      <div className="grid grid-cols-1 gap-4">
        {fields.map((field) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="font-medium text-sm">
              {field.replaceAll("_", " ")}
            </label>
            <textarea
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-600 focus:border-blue-600"
              rows={field === "DESCRIPTION" ? 4 : 2}
              value={values[field]}
              onChange={(e) => updateField(field, e.target.value)}
              placeholder={`Enter ${field.toLowerCase()}...`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {!loading ? (
          <button
            onClick={generatePrompt}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Create Prompt
          </button>
        ) : (
          <button
            onClick={stopGeneration}
            className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Stop
          </button>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Generated Prompt</h2>
        <div className="border border-gray-300 rounded-lg p-4 whitespace-pre-wrap text-sm bg-gray-50 min-h-[150px]">
          {responseText || (loading ? "Loading…" : "No prompt yet.")}
        </div>
      </div>
    </div>
  );
}
