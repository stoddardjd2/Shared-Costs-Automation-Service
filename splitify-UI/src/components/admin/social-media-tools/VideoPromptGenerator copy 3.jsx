import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  handleVideoPromptHook,
  handleVideoPromptScript,
  handleVideoPromptPainPoint,
  handleCategorizeHookLibrary,
  handleCategorizePainPointLibrary,
} from "../../../queries/admin";

// ---- LocalStorage keys ----
const LS_KEYS = {
  SETTINGS: "vp_settings",
  HOOKS: "vp_hook_library",
  LAST_HOOK_INDEX: "vp_last_hook_index",
  USE_TEMPLATE: "vp_use_hook_template",
  PAIN_POINTS: "vp_pain_point_library",
  LAST_PAIN_POINT_INDEX: "vp_last_pain_point_index",
};

// ---- Default hook templates (from your table) ----
const DEFAULT_HOOK_TEMPLATES = [
  "This is how I [desire] without [common pain point or objection].",
  "Let me show you my favorite way to [achieve desire or result].",
  "If I had just [limited number] minutes everyday to work towards [achieving desire] here’s exactly what I’d do.",
  "Simple advice for someone that wants [desire or result] but doesn’t know how to get it.",
  "Here is a beginner-friendly way to [achieve desire or result].",
  "There’s no need to [bad habit your audience does].",
  "I’m going to give you the simplest way to achieve [result].",
  "If I wanted to achieve [desired result] in 1 month, here’s what I would do.",
  "When I realized that [key realization], I was finally able to [achieve desire]…",
  "I promise if you start doing this, you will be the [desired result].",
  "This one’s for the [audience identity] who REFUSE TO live in [pain point].",
  "If you haven’t [achieved goal] in [unnecessarily long period of time], watch this video.",
  "If you’ve been struggling with [pain point], here’s what to do from someone who’s been there.",
  "Picture this, [describe audience’s dream].",
  "Here are the real things that helped me to [achieve result].",
  "They’ll tell you that [common belief you disagree with] matters. When in reality, it’s all about [your belief].",
  "There is nothing more irritating (or other word) than...",
  "Here’s what no one else is going to tell you about [niche].",
  "Your future [niche descriptor] will thank you if you start doing this today…",
  "Hate to break it to you but...",
  "Things I’ve learned now that I’m a [desired status or identity].",
  "I’ve been reflecting on my [niche] journey and I have [number] things I want to share for anyone else on a similar road.",
  "Here are 3 things I would never, ever do again as someone trying to [result or desire].",
  "With [number] years of experience in [niche], here’s what I’ve learned.",
  "If I knew this before starting [niche journey], I would’ve been [achievement] way faster.",
  "Welcome to [topic] 101. So I hear you want [desire]…",
  "For all the lazy, busy, or unbothered people, I have some [niche] wisdom to share.",
  "Here’s how I cheated my way to [achieved dream] in just [short timeframe].",
  "If you want to learn to [desire or result], first you must [change to be made].",
  "Something that’s been on my mind lately is...",
  "Give me 1 minute and I’ll show you how to...",
  "POV: you’re a [describe your life or dream scenario].",
  "Here’s a [niche] tip that completely changed my life. And I hope it does the same for you.",
  "If you’ve ever wondered what it’s like to [describe yourself or result], come along with me!",
  "Do you feel like [niche or desire] shouldn’t be this hard?",
  "Are you really ok with staying [undesirable current reality] for another year?",
  "Do you want [desire] but can’t seem to shake [bad habit, obstacle, or pain point]?",
  "Am I the only one who [relatable habit, practice, or belief]?",
  "What if I told you that [surprising fact]?",
  "A lot of people are asking how I’m able to do [aspirational thing].",
  "So [number] years ago I went from [previous reality] to [current dream reality].",
  "This is what you should and shouldn’t do if you’re trying to [result].",
  "Here are some realistic ways for you to [move from current situation to desired situation].",
  "Do NOT do this if you want [result].",
  "As someone who’s into [niche keyword] I cannot live without [resource]…",
  "Okay, I’m gonna tell you how I managed to get [desired result].",
  "Here is an in-depth tutorial for…",
  "Here is a [practice] that every [audience identity] should be doing!!",
  "So you’re ready to take [niche journey] seriously. Here’s what you’re going to do.",
];

const normalizeHookEntry = (entry) =>
  typeof entry === "string"
    ? { text: entry, category: "uncategorized" }
    : entry;

const normalizeHookList = (list = []) => list.map(normalizeHookEntry);

const CategoryBadge = ({ label }) =>
  !label ? null : (
    <span className="ml-auto inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
      {label}
    </span>
  );

const loadFromLocalStorage = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const saveToLocalStorage = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
};

const parseHookFile = async (file) => {
  const text = await file.text();
  const lines = text.split("\n").map((l) => l.trim());
  const hooks = [];

  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").map((c) => c.trim());
    // Expect: | Hook |
    if (cells.length < 3) continue;
    const value = cells[1];
    if (!value || value.toLowerCase() === "hook") continue;
    hooks.push(value);
  }
  return hooks;
};

export default function VideoPromptGenerator() {
  // ---- Core variables (all persisted) ----
  const [productDescription, setProductDescription] = useState(
    "Splitify is a modern web app that automatically splits shared bills, sends automated text-message reminders, and provides pay-by-link SMS payments — only the bill creator needs an account."
  );
  const [character, setCharacter] = useState(
    "25-year-old overwhelmed renter sharing an apartment with 3 roommates."
  );
  const [sceneBaseDescription, setSceneBaseDescription] = useState(
    "Casual TikTok selfie-style in their apartment, talking directly to camera about bill splitting and payment anxiety."
  );
  const [rules, setRules] = useState(
    "Do not add text overlays, graphics, props, or additional people. Natural TikTok style. Keep language casual and conversational. No brand claims that can’t be backed up. Keep each scene realistically speakable in the allotted time."
  );
  const [framing, setFraming] = useState(
    "Handheld phone, medium close-up (chest up), eye-level, natural indoor lighting."
  );

  // ---- Hooks + selection ----
  const [hookTemplates, setHookTemplates] = useState(
    normalizeHookList(DEFAULT_HOOK_TEMPLATES)
  );
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);
  const [concreteHook, setConcreteHook] = useState(""); // generated hook line
  const [painPoint, setPainPoint] = useState(""); // selected/generated pain point
  const [useHookTemplate, setUseHookTemplate] = useState(true);
  const [additionalHookRules, setAdditionalHookRules] = useState("");
  const [painPointLibrary, setPainPointLibrary] = useState([]);
  const [selectedPainPointIndex, setSelectedPainPointIndex] = useState(0);
  const [hookPasteText, setHookPasteText] = useState("");
  const [painPointPasteText, setPainPointPasteText] = useState("");
  const [painPointCategory, setPainPointCategory] = useState("uncategorized");
  const [showHookPasteModal, setShowHookPasteModal] = useState(false);
  const [showPainPointPasteModal, setShowPainPointPasteModal] = useState(false);
  const hasLoadedRef = useRef(false);

  // ---- Script / scenes ----
  const [numScenes, setNumScenes] = useState(3);
  const [defaultSceneSeconds, setDefaultSceneSeconds] = useState(15);
  const [totalTimeLimit, setTotalTimeLimit] = useState(45);
  const [sceneDurations, setSceneDurations] = useState({}); // {sceneIndex: seconds}
  const [scenes, setScenes] = useState([]); // [{index, durationSeconds, script, sceneDescription}]

  // ---- UI / status ----
  const [isGeneratingHook, setIsGeneratingHook] = useState(false);
  const [isGeneratingPainPoint, setIsGeneratingPainPoint] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isCategorizingHooks, setIsCategorizingHooks] = useState(false);
  const [isCategorizingPainPoints, setIsCategorizingPainPoints] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [hookUploadError, setHookUploadError] = useState("");

  // ---- Load from LocalStorage on mount ----
  useEffect(() => {
    const savedSettings = loadFromLocalStorage(LS_KEYS.SETTINGS, null);
    const savedHooks = loadFromLocalStorage(LS_KEYS.HOOKS, null);
    const lastHookIndex = loadFromLocalStorage(LS_KEYS.LAST_HOOK_INDEX, null);
    const savedPainPoints = loadFromLocalStorage(LS_KEYS.PAIN_POINTS, null);
    const lastPainPointIndex = loadFromLocalStorage(
      LS_KEYS.LAST_PAIN_POINT_INDEX,
      null
    );

    if (savedSettings) {
      setProductDescription(
        savedSettings.productDescription ?? productDescription
      );
      setCharacter(savedSettings.character ?? character);
      setSceneBaseDescription(
        savedSettings.sceneBaseDescription ?? sceneBaseDescription
      );
      setRules(savedSettings.rules ?? rules);
      setFraming(savedSettings.framing ?? framing);
      setNumScenes(savedSettings.numScenes ?? numScenes);
      setDefaultSceneSeconds(
        savedSettings.defaultSceneSeconds ?? defaultSceneSeconds
      );
      setTotalTimeLimit(savedSettings.totalTimeLimit ?? totalTimeLimit);
      setSceneDurations(savedSettings.sceneDurations ?? {});
      setConcreteHook(savedSettings.concreteHook ?? "");
      setPainPoint(savedSettings.painPoint ?? "");
      setUseHookTemplate(
        typeof savedSettings.useHookTemplate === "boolean"
          ? savedSettings.useHookTemplate
          : true
      );
      setAdditionalHookRules(savedSettings.additionalHookRules ?? "");
      if (
        Array.isArray(savedSettings.hookTemplates) &&
        savedSettings.hookTemplates.length
      ) {
        setHookTemplates(normalizeHookList(savedSettings.hookTemplates));
      }
      // apply settings pain points as a fallback (overridden by explicit savedPainPoints below)
      const normalizedPp =
        savedSettings.painPointLibrary?.map((p) =>
          typeof p === "string" ? { text: p, category: "uncategorized" } : p
        ) ?? [];
      if (normalizedPp.length) {
        setPainPointLibrary(normalizedPp);
        saveToLocalStorage(LS_KEYS.PAIN_POINTS, normalizedPp);
        if (typeof savedSettings.selectedPainPointIndex === "number") {
          setSelectedPainPointIndex(savedSettings.selectedPainPointIndex);
        }
      }
    }

    if (savedHooks && Array.isArray(savedHooks) && savedHooks.length > 0) {
      setHookTemplates(normalizeHookList(savedHooks));
    }

    if (
      savedPainPoints &&
      Array.isArray(savedPainPoints) &&
      savedPainPoints.length > 0
    ) {
      const normalizedPp = savedPainPoints.map((p) =>
        typeof p === "string" ? { text: p, category: "uncategorized" } : p
      );
      setPainPointLibrary(normalizedPp);
      saveToLocalStorage(LS_KEYS.PAIN_POINTS, normalizedPp);
      if (typeof lastPainPointIndex === "number") {
        const safeIdx = Math.min(
          Math.max(0, lastPainPointIndex),
          normalizedPp.length - 1
        );
        setSelectedPainPointIndex(safeIdx);
        const chosen = normalizedPp[safeIdx];
        if (chosen?.text) {
          setPainPoint(chosen.text);
        }
      }
    } else if (typeof lastPainPointIndex === "number") {
      // fallback if saved pain points array is absent but index exists
      const fallbackChosen = painPointLibrary[lastPainPointIndex];
      if (fallbackChosen?.text) {
        setPainPoint(fallbackChosen.text);
        setSelectedPainPointIndex(lastPainPointIndex);
      }
    }

    if (typeof lastHookIndex === "number") {
      setSelectedHookIndex(lastHookIndex);
    }

    hasLoadedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Persist to LocalStorage whenever relevant state changes ----
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const settingsToSave = {
      productDescription,
      character,
      sceneBaseDescription,
      rules,
      framing,
      numScenes,
      defaultSceneSeconds,
      totalTimeLimit,
      sceneDurations,
      concreteHook,
      painPoint,
      useHookTemplate,
      additionalHookRules,
      hookTemplates,
      selectedHookIndex,
      painPointLibrary,
      selectedPainPointIndex,
    };
    saveToLocalStorage(LS_KEYS.SETTINGS, settingsToSave);
  }, [
    productDescription,
    character,
    sceneBaseDescription,
    rules,
    framing,
    numScenes,
    defaultSceneSeconds,
    totalTimeLimit,
    sceneDurations,
    concreteHook,
    painPoint,
    useHookTemplate,
    additionalHookRules,
    painPointLibrary,
    selectedPainPointIndex,
  ]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveToLocalStorage(LS_KEYS.HOOKS, hookTemplates);
  }, [hookTemplates]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveToLocalStorage(LS_KEYS.LAST_HOOK_INDEX, selectedHookIndex);
  }, [selectedHookIndex]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveToLocalStorage(LS_KEYS.PAIN_POINTS, painPointLibrary);
  }, [painPointLibrary]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveToLocalStorage(LS_KEYS.LAST_PAIN_POINT_INDEX, selectedPainPointIndex);
  }, [selectedPainPointIndex]);

  useEffect(() => {
    if (!painPoint && painPointLibrary.length) {
      const chosen =
        painPointLibrary[selectedPainPointIndex] || painPointLibrary[0];
      if (chosen?.text) setPainPoint(chosen.text);
    }
  }, [painPointLibrary, selectedPainPointIndex, painPoint]);

  // ---- Helpers ----
  const getSceneDuration = (index) => {
    return (
      Number(sceneDurations[index] ?? defaultSceneSeconds) ||
      defaultSceneSeconds
    );
  };

  const totalPlannedTime = useMemo(() => {
    let total = 0;
    for (let i = 0; i < numScenes; i++) {
      total += getSceneDuration(i);
    }
    return total;
  }, [numScenes, sceneDurations, defaultSceneSeconds]);

  const handleSceneDurationChange = (index, value) => {
    const seconds = Number(value) || 0;
    setSceneDurations((prev) => ({
      ...prev,
      [index]: seconds,
    }));
  };

  const handleHookUpload = async (e) => {
    setHookUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const hooks = await parseHookFile(file);
      if (!hooks.length) {
        setHookUploadError(
          "No hooks found in file. Make sure it has a 'Hook' column."
        );
        return;
      }
      persistHookLibrary((prev) => {
        const normalizedPrev = normalizeHookList(prev);
        const existingSet = new Set(normalizedPrev.map((h) => normalize(h.text)));
        const merged = [...normalizedPrev];
        for (const h of hooks) {
          if (existingSet.has(normalize(h))) continue;
          merged.push({ text: h, category: "uncategorized" });
          existingSet.add(normalize(h));
        }
        return merged;
      });
      setStatusMessage(`Imported ${hooks.length} hooks from file.`);
    } catch (err) {
      console.error(err);
      setHookUploadError(
        "Failed to parse file. Ensure it's a markdown table or CSV-like format."
      );
    }
  };

  const handleSelectHookIndex = (idx) => {
    setSelectedHookIndex(idx);
    setStatusMessage(`Selected hook template #${idx + 1}`);
  };

  const handleSelectPainPointIndex = (idx) => {
    setSelectedPainPointIndex(idx);
    const chosen = painPointLibrary[idx];
    if (chosen) {
      setPainPoint(chosen.text);
      setStatusMessage(`Selected pain point #${idx + 1}`);
    }
  };

  const normalize = (text) => text.trim().toLowerCase();

  const addHooksFromPaste = (rawText) => {
    const parts = rawText
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) return 0;
    let added = 0;
    persistHookLibrary((prev) => {
      const normalizedPrev = normalizeHookList(prev);
      const existingSet = new Set(normalizedPrev.map((h) => normalize(h.text)));
      const merged = [...normalizedPrev];
      for (const h of parts) {
        if (existingSet.has(normalize(h))) continue;
        merged.push({ text: h, category: "uncategorized" });
        existingSet.add(normalize(h));
        added += 1;
      }
      return merged;
    });
    return added;
  };

  const addPainPointsFromPaste = (rawText, category = "") => {
    const parts = rawText
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) return 0;
    let added = 0;
    let firstNew = null;
    persistPainPointLibrary((prev) => {
      const existingSet = new Set(prev.map((p) => normalize(p.text)));
      const merged = [...prev];
      for (const p of parts) {
        if (existingSet.has(normalize(p))) continue;
        merged.push({ text: p, category: category || "uncategorized" });
        existingSet.add(normalize(p));
        added += 1;
        if (!firstNew) firstNew = p;
      }
      return merged;
    });
    return { added, firstNew };
  };

  const persistHookLibrary = (nextHooks) => {
    setHookTemplates((prev) => {
      const resolved = typeof nextHooks === "function" ? nextHooks(prev) : nextHooks;
      saveToLocalStorage(LS_KEYS.HOOKS, resolved);
      return resolved;
    });
  };

  const persistPainPointLibrary = (nextPainPoints) => {
    setPainPointLibrary((prev) => {
      const resolved =
        typeof nextPainPoints === "function" ? nextPainPoints(prev) : nextPainPoints;
      saveToLocalStorage(LS_KEYS.PAIN_POINTS, resolved);
      return resolved;
    });
  };

  const categorizeHookLibrary = async () => {
    if (!hookTemplates.length) {
      setStatusMessage("No hooks to categorize.");
      return;
    }
    setIsCategorizingHooks(true);
    setStatusMessage("Categorizing hooks...");
    try {
      const res = await handleCategorizeHookLibrary(
        hookTemplates.map((h) => h.text),
        productDescription
      );
      if (!res.success) {
        throw new Error(res.error?.message || "Failed to categorize hooks");
      }
      const data = res.data;
      const categorized = data.items || [];
      if (!categorized.length) {
        setStatusMessage("No categories returned for hooks.");
        return;
      }
      const catMap = new Map(
        categorized
          .filter((c) => c?.text)
          .map((c) => [normalize(c.text), c.category || "uncategorized"])
      );
      const updatedHooks = normalizeHookList(hookTemplates).map((h) => {
        const key = normalize(h.text);
        const category = catMap.get(key) ?? h.category ?? "uncategorized";
        return { text: h.text, category };
      });
      persistHookLibrary(updatedHooks); // includes localStorage save
      setStatusMessage("Hook library categorized.");
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Error categorizing hooks.");
    } finally {
      setIsCategorizingHooks(false);
    }
  };

  const categorizePainPointLibrary = async () => {
    if (!painPointLibrary.length) {
      setStatusMessage("No pain points to categorize.");
      return;
    }
    setIsCategorizingPainPoints(true);
    setStatusMessage("Categorizing pain points...");
    try {
      const res = await handleCategorizePainPointLibrary(
        painPointLibrary.map((p) => p.text),
        productDescription
      );
      if (!res.success) {
        throw new Error(res.error?.message || "Failed to categorize pain points");
      }
      const data = res.data;
      const categorized = data.items || [];
      if (!categorized.length) {
        setStatusMessage("No categories returned for pain points.");
        return;
      }
      persistPainPointLibrary((prev) => {
        return prev.map((p) => {
          const match = categorized.find(
            (c) => normalize(c.text) === normalize(p.text)
          );
          return match ? { text: p.text, category: match.category } : p;
        });
      });
      setStatusMessage("Pain point library categorized.");
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Error categorizing pain points.");
    } finally {
      setIsCategorizingPainPoints(false);
    }
  };

  // ---- API Calls ----
  const generatePainPoint = async () => {
    if (!productDescription.trim()) {
      setStatusMessage("Add a product description first.");
      return;
    }
    setIsGeneratingPainPoint(true);
    setStatusMessage("Generating pain point...");
    try {
      const res = await handleVideoPromptPainPoint(
        productDescription,
        painPointCategory,
        painPointLibrary.map((p) => p.text)
      );
      if (!res.success) {
        throw new Error(res.error?.message || "Failed to generate pain point");
      }
      const data = res.data;
      const newPainPoint = data.painPoint || "";
      const category = data.category || painPointCategory || "uncategorized";
      if (!newPainPoint.trim()) {
        setStatusMessage("No pain point returned.");
        return;
      }
      const alreadyExists = painPointLibrary.some(
        (p) => normalize(p.text) === normalize(newPainPoint)
      );
      if (alreadyExists) {
        setStatusMessage("Pain point already exists in library. Pick it below.");
        return;
      }
      persistPainPointLibrary((prev) => [...prev, { text: newPainPoint, category }]);
      setSelectedPainPointIndex(painPointLibrary.length);
      setPainPoint(newPainPoint);
      setStatusMessage("Pain point generated and added to library.");
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Error generating pain point.");
    } finally {
      setIsGeneratingPainPoint(false);
    }
  };

  const generateHookOnly = async () => {
    if (!productDescription.trim()) {
      setStatusMessage("Add a product description first.");
      return;
    }
    if (!painPoint.trim()) {
      setStatusMessage("Select or enter a pain point first.");
      return;
    }
    if (useHookTemplate && !hookTemplates.length) {
      setStatusMessage("No hook templates found. Upload or add some first.");
      return;
    }

    const generationMode = useHookTemplate ? "template" : "pain-point-fit";
    const template = useHookTemplate
      ? hookTemplates[selectedHookIndex]?.text || hookTemplates[0]?.text
      : null;

    setIsGeneratingHook(true);
    setStatusMessage(
      useHookTemplate
        ? "Generating hook from template..."
        : "Generating hook without template..."
    );
    try {
      const res = await handleVideoPromptHook(
        productDescription,
        template,
        generationMode,
        additionalHookRules,
        painPoint
      );
      if (!res.success) {
        throw new Error(res.error?.message || "Failed to generate hook");
      }
      const data = res.data;
      const newHook = data.hook || "";
      const newCategory = data.category || "uncategorized";
      setConcreteHook(newHook);
      // auto-append to library with category if new
      if (newHook.trim()) {
        persistHookLibrary((prev) => {
          const normalizedPrev = normalizeHookList(prev);
          const existingSet = new Set(
            normalizedPrev.map((h) => normalize(h.text))
          );
          if (existingSet.has(normalize(newHook))) return normalizedPrev;
          return [
            ...normalizedPrev,
            { text: newHook, category: newCategory || "uncategorized" },
          ];
        });
      }
      setStatusMessage("Hook generated.");
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Error generating hook.");
    } finally {
      setIsGeneratingHook(false);
    }
  };

  const generateScript = async () => {
    if (!concreteHook.trim() || !painPoint.trim()) {
      setStatusMessage("Generate a hook and pain point first.");
      return;
    }

    if (totalPlannedTime > totalTimeLimit) {
      setStatusMessage(
        `Total planned time (${totalPlannedTime}s) exceeds limit (${totalTimeLimit}s). Adjust durations or limit.`
      );
      return;
    }

    setIsGeneratingScript(true);
    setStatusMessage("Generating script scenes...");
    setScenes([]);

    try {
      const sceneConfig = [];
      for (let i = 0; i < numScenes; i++) {
        sceneConfig.push({
          index: i,
          durationSeconds: getSceneDuration(i),
        });
      }

      const res = await handleVideoPromptScript({
        productDescription,
        character,
        baseSceneDescription: sceneBaseDescription,
        rules,
        framing,
        hook: concreteHook,
        painPoint,
        numScenes,
        scenes: sceneConfig,
        totalTimeLimit,
      });

      const data = res.data;
      console.log("DATa", data);
      setScenes(data.scenes || []);
      setStatusMessage("Script scenes generated.");
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Error generating script.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatusMessage("Copied to clipboard.");
    } catch {
      setStatusMessage("Could not copy to clipboard.");
    }
  };

  const renderPasteModal = ({
    title,
    textareaValue,
    onChange,
    placeholder,
    onSubmit,
    onClose,
    categoryInput,
  }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 m-0">
      <div className="w-full max-w-lg mx-4 rounded-xl bg-white shadow-xl border border-gray-200 p-4 sm:p-5 space-y-3 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Bulk Add
            </p>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ✕
          </button>
        </div>
        {categoryInput}
        <textarea
          value={textareaValue}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
          placeholder={placeholder}
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  // ---- Compose final video prompt text per scene ----
  const buildScenePromptText = (scene) => {
    const hookLine = concreteHook || "[HOOK]";
    const pp = painPoint || "[PAIN POINT]";
    const desc = productDescription || "[DESCRIPTION]";

    return [
      `• Primary [HOOK]: "${hookLine}" given Splitify [DESCRIPTION]: ${desc} for given [PAIN POINT]: ${pp}.`,
      `• CHARACTER: ${character || "[CHARACTER]"}`,
      `• SCENE: ${
        scene.sceneDescription || sceneBaseDescription || "[SCENE DESCRIPTION]"
      }`,
      `• HARD RULES: ${rules || "[RULES]"}`,
      `• FRAMING: ${scene.framing || framing || "[FRAMING]"}`,
      `• SCRIPT FOR SCENE: ${scene.script || "[SCRIPT FOR SCENE]"}`,
    ].join("\n");
  };

  const fullPromptAllScenes = useMemo(() => {
    if (!scenes.length) return "";
    return scenes
      .map((scene, idx) => `SCENE ${idx + 1}:\n${buildScenePromptText(scene)}`)
      .join("\n\n");
  }, [
    scenes,
    concreteHook,
    painPoint,
    rules,
    framing,
    character,
    productDescription,
    sceneBaseDescription,
  ]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Video Prompt Generator
      </h1>
      <p className="text-sm text-gray-600">
        Generates TikTok-ready scripts & AI video prompts for Splitify using a
        hook library, product description, and configurable scene rules.
      </p>

      {/* Status banner */}
      {statusMessage && (
        <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Product Description + Character */}
      <section className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              Step 1
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Core Context
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                Product, Character, Scene
              </h2>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Feeds both pain points and hooks.
          </p>
        </div>

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
      </section>

      {/* Pain Point Library + Generation */}
      <section className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              Step 2
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Pain Points
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                Collect, Paste, or Generate
              </h2>
            </div>
          </div>
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
              onClick={() => setShowPainPointPasteModal(true)}
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
        </div>

        <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4 md:gap-6">
          {/* Pain point list */}
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

          {/* Selected pain point */}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">
                Selected Pain Point
              </p>
              <p className="text-xs bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
                {painPointLibrary[selectedPainPointIndex]?.text ||
                  painPoint ||
                  "None selected"}
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
      </section>

      {/* Hook Library + Hook Generation */}
      <section className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              Step 3
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Hook Templates
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                Select, Paste, or Ignore
              </h2>
            </div>
          </div>
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
              onClick={() => setShowHookPasteModal(true)}
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
        </div>

        {hookUploadError && (
          <p className="text-xs text-red-600">{hookUploadError}</p>
        )}

        <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4 md:gap-6">
          {/* Hook list */}
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

          {/* Selected hook + generate */}
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
              {isGeneratingHook
                ? "Generating..."
                : "Generate Hook"}
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
                  placeholder="Generated pain point will appear here (editable)."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules & Framing */}
      <section className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              Step 4
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Scene Guardrails
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                Rules & Framing
              </h2>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Applied to every generated scene.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">
              Hard Rules
            </label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
              placeholder="[RULES]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Framing</label>
            <textarea
              value={framing}
              onChange={(e) => setFraming(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
              placeholder="[FRAMING]"
            />
          </div>
        </div>
      </section>

      {/* Scene Config */}
      <section className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              Step 5
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Timing
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                Scene Counts & Durations
              </h2>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Total planned time:{" "}
            <span
              className={
                totalPlannedTime > totalTimeLimit
                  ? "font-semibold text-red-600"
                  : "font-semibold text-blue-600"
              }
            >
              {totalPlannedTime}s
            </span>{" "}
            / {totalTimeLimit}s limit
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Number of Scenes
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={numScenes}
              onChange={(e) =>
                setNumScenes(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Default Time per Scene (seconds)
            </label>
            <input
              type="number"
              min={5}
              max={60}
              value={defaultSceneSeconds}
              onChange={(e) =>
                setDefaultSceneSeconds(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Total Time Limit (seconds)
            </label>
            <input
              type="number"
              min={15}
              max={180}
              value={totalTimeLimit}
              onChange={(e) =>
                setTotalTimeLimit(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Per-scene overrides */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: numScenes }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-lg px-3 py-2 space-y-1 bg-gray-50"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-gray-700">Scene {i + 1}</span>
                <span className="text-gray-500">{getSceneDuration(i)}s</span>
              </div>
              <input
                type="number"
                min={5}
                max={60}
                value={getSceneDuration(i)}
                onChange={(e) => handleSceneDurationChange(i, e.target.value)}
                className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={generateScript}
          disabled={isGeneratingScript}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          {isGeneratingScript
            ? "Generating Script..."
            : "Generate Script Scenes"}
        </button>
      </section>

      {/* Scenes / Script Output */}
      {scenes.length > 0 && (
        <section className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Scene Scripts (Copyable)
          </h2>

          <div className="space-y-3">
            {scenes.map((scene, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-xl p-3 sm:p-4 space-y-2 bg-gray-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      Scene {idx + 1} —{" "}
                      {scene.durationSeconds ?? getSceneDuration(idx)}s
                    </span>
                    {scene.sceneDescription && (
                      <span className="text-xs text-gray-500">
                        {scene.sceneDescription}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(scene.script || "")}
                    className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    Copy Dialogue
                  </button>
                </div>

                <textarea
                  readOnly
                  value={scene.script || ""}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Per-Scene Prompt Blocks */}
      {scenes.length > 0 && (
        <section className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Assembled Video Prompts (Per Scene)
          </h2>
          <div className="space-y-3">
            {scenes.map((scene, idx) => {
              const text = buildScenePromptText(scene);
              return (
                <div
                  key={idx}
                  className="border border-gray-100 rounded-xl p-3 sm:p-4 bg-gray-50 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Scene {idx + 1} Prompt
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(text)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                    >
                      Copy Prompt
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={text}
                    rows={6}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* All-scenes combined prompt */}
      {scenes.length > 0 && (
        <section className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Full Combined Prompt (All Scenes)
            </h2>
            <button
              type="button"
              onClick={() => copyToClipboard(fullPromptAllScenes)}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
            >
              Copy All Scenes
            </button>
          </div>
          <textarea
            readOnly
            value={fullPromptAllScenes}
            rows={Math.min(20, scenes.length * 6 + 2)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-gray-50"
          />
        </section>
      )}

      {showHookPasteModal &&
        renderPasteModal({
          title: "Paste Hooks (one per line)",
          textareaValue: hookPasteText,
          onChange: setHookPasteText,
          placeholder:
            "e.g. Give me 30 seconds to show you how I stopped fighting over bills",
          onSubmit: () => {
            const added = addHooksFromPaste(hookPasteText);
            setHookPasteText("");
            setShowHookPasteModal(false);
            setStatusMessage(
              added ? `Added ${added} hook(s) from paste.` : "No new hooks added."
            );
          },
          onClose: () => setShowHookPasteModal(false),
          categoryInput: null,
        })}

      {showPainPointPasteModal &&
        renderPasteModal({
          title: "Paste Pain Points (one per line)",
          textareaValue: painPointPasteText,
          onChange: setPainPointPasteText,
          placeholder: "e.g. Awkwardly nagging roommates about money",
          onSubmit: () => {
            const { added, firstNew } = addPainPointsFromPaste(
              painPointPasteText,
              painPointCategory
            );
            setPainPointPasteText("");
            setShowPainPointPasteModal(false);
            if (added) {
              setSelectedPainPointIndex(
                painPointLibrary.length > 0 ? painPointLibrary.length : 0
              );
              if (firstNew) setPainPoint(firstNew);
            }
            setStatusMessage(
              added
                ? `Added ${added} pain point(s) from paste.`
                : "No new pain points added."
            );
          },
          onClose: () => setShowPainPointPasteModal(false),
          categoryInput: (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={painPointCategory}
                onChange={(e) => setPainPointCategory(e.target.value)}
                className="w-40 rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                placeholder="Category"
              />
            </div>
          ),
        })}
    </div>
  );
}
