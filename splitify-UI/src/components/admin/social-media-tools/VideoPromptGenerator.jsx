import React, { useEffect, useMemo, useState } from "react";
import {
  handleVideoPromptHook,
  handleVideoPromptScript,
  handleVideoPromptPainPoint,
  handleCategorizeHookLibrary,
  handleCategorizePainPointLibrary,
  handleVideoPromptClothes,
} from "../../../queries/admin";

// ---- LocalStorage keys ----
const LS_KEYS = {
  SETTINGS: "vp_settings",
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
  const initialSettings = loadFromLocalStorage(LS_KEYS.SETTINGS, null) || {};
  const getSetting = (key, fallback) =>
    initialSettings[key] !== undefined ? initialSettings[key] : fallback;

  // ---- Core variables (all persisted) ----
  const [productDescription, setProductDescription] = useState(() =>
    getSetting(
      "productDescription",
      "Splitify is a modern web app that automatically splits shared bills, sends automated text-message reminders, and provides pay-by-link SMS payments — only the bill creator needs an account."
    )
  );
  const [character, setCharacter] = useState(() =>
    getSetting(
      "character",
      "25-year-old overwhelmed renter sharing an apartment with 3 roommates."
    )
  );
  const [sceneBaseDescription, setSceneBaseDescription] = useState(() =>
    getSetting(
      "sceneBaseDescription",
      "Casual TikTok selfie-style in their apartment, talking directly to camera about bill splitting and payment anxiety."
    )
  );
  const [rules, setRules] = useState(() =>
    getSetting(
      "rules",
      "Do not add text overlays, graphics, props, or additional people. Natural TikTok style. Keep language casual and conversational. No brand claims that can’t be backed up. Keep each scene realistically speakable in the allotted time."
    )
  );
  const [framing, setFraming] = useState(() =>
    getSetting(
      "framing",
      "Handheld phone, medium close-up (chest up), eye-level, natural indoor lighting."
    )
  );
  const [clothes, setClothes] = useState(() => getSetting("clothes", ""));
  const [productLibrary, setProductLibrary] = useState(() =>
    getSetting("productLibrary", [])
  );
  const [characterLibrary, setCharacterLibrary] = useState(() =>
    getSetting("characterLibrary", [])
  );
  const [sceneBaseLibrary, setSceneBaseLibrary] = useState(() =>
    getSetting("sceneBaseLibrary", [])
  );
  const [rulesLibrary, setRulesLibrary] = useState(() =>
    getSetting("rulesLibrary", [])
  );
  const [framingLibrary, setFramingLibrary] = useState(() =>
    getSetting("framingLibrary", [])
  );
  const [clothesLibrary, setClothesLibrary] = useState(() =>
    getSetting("clothesLibrary", [])
  );
  const [cameo, setCameo] = useState(() => getSetting("cameo", ""));
  const [cameoLibrary, setCameoLibrary] = useState(() =>
    getSetting("cameoLibrary", [])
  );

  // ---- Hooks + selection ----
  const initialHookTemplates = (() => {
    const saved = getSetting("hookTemplates", null);
    if (Array.isArray(saved) && saved.length) return normalizeHookList(saved);
    return normalizeHookList(DEFAULT_HOOK_TEMPLATES);
  })();
  const [hookTemplates, setHookTemplates] = useState(initialHookTemplates);
  const [selectedHookIndex, setSelectedHookIndex] = useState(() =>
    getSetting("selectedHookIndex", 0)
  );
  const initialPainPointLibrary = (() => {
    const saved = getSetting("painPointLibrary", null);
    if (Array.isArray(saved) && saved.length) {
      return saved.map((p) =>
        typeof p === "string" ? { text: p, category: "uncategorized" } : p
      );
    }
    return [];
  })();
  const initialPainPointIndex = (() => {
    const idx = getSetting("selectedPainPointIndex", 0);
    if (!initialPainPointLibrary.length) return 0;
    return Math.min(Math.max(0, idx), initialPainPointLibrary.length - 1);
  })();
  const [concreteHook, setConcreteHook] = useState(() =>
    getSetting("concreteHook", "")
  ); // generated hook line
  const [painPoint, setPainPoint] = useState(() => {
    const saved = getSetting("painPoint", "");
    if (saved) return saved;
    return initialPainPointLibrary[initialPainPointIndex]?.text || "";
  }); // selected/generated pain point
  const [useHookTemplate, setUseHookTemplate] = useState(() =>
    typeof getSetting("useHookTemplate", undefined) === "boolean"
      ? getSetting("useHookTemplate", true)
      : true
  );
  const [additionalHookRules, setAdditionalHookRules] = useState(() =>
    getSetting("additionalHookRules", "")
  );
  const [painPointLibrary, setPainPointLibrary] = useState(
    initialPainPointLibrary
  );
  const [selectedPainPointIndex, setSelectedPainPointIndex] = useState(
    initialPainPointIndex
  );
  const [hookPasteText, setHookPasteText] = useState("");
  const [painPointPasteText, setPainPointPasteText] = useState("");
  const [painPointCategory, setPainPointCategory] = useState(() =>
    getSetting("painPointCategory", "uncategorized")
  );
  const [showHookPasteModal, setShowHookPasteModal] = useState(false);
  const [showPainPointPasteModal, setShowPainPointPasteModal] = useState(false);

  // ---- Script / scenes ----
  const [numScenes, setNumScenes] = useState(() => getSetting("numScenes", 3));
  const [defaultSceneSeconds, setDefaultSceneSeconds] = useState(() =>
    getSetting("defaultSceneSeconds", 15)
  );
  const [totalTimeLimit, setTotalTimeLimit] = useState(() =>
    getSetting("totalTimeLimit", 45)
  );
  const [sceneDurations, setSceneDurations] = useState(() =>
    getSetting("sceneDurations", {})
  ); // {sceneIndex: seconds}
  const [scenes, setScenes] = useState([]); // [{index, durationSeconds, script, sceneDescription}]

  // ---- UI / status ----
  const [isGeneratingHook, setIsGeneratingHook] = useState(false);
  const [isGeneratingPainPoint, setIsGeneratingPainPoint] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingClothes, setIsGeneratingClothes] = useState(false);
  const [isCategorizingHooks, setIsCategorizingHooks] = useState(false);
  const [isCategorizingPainPoints, setIsCategorizingPainPoints] =
    useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [hookUploadError, setHookUploadError] = useState("");
  const [isEditingProducts, setIsEditingProducts] = useState(false);
  const [isEditingCharacters, setIsEditingCharacters] = useState(false);
  const [isEditingScenes, setIsEditingScenes] = useState(false);
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [isEditingFraming, setIsEditingFraming] = useState(false);
  const [isEditingClothes, setIsEditingClothes] = useState(false);
  const [isEditingHooks, setIsEditingHooks] = useState(false);
  const [isEditingPainPoints, setIsEditingPainPoints] = useState(false);
  const [isEditingCameo, setIsEditingCameo] = useState(false);

  // ---- Persist to LocalStorage whenever relevant state changes ----
  useEffect(() => {
    const settingsToSave = {
      productDescription,
      character,
      sceneBaseDescription,
      rules,
      framing,
      clothes,
      clothesLibrary,
      cameo,
      cameoLibrary,
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
      painPointCategory,
      productLibrary,
      characterLibrary,
      sceneBaseLibrary,
      rulesLibrary,
      framingLibrary,
    };
    console.log("save", settingsToSave);

    saveToLocalStorage(LS_KEYS.SETTINGS, settingsToSave);
  }, [
    productDescription,
    character,
    sceneBaseDescription,
    rules,
    framing,
    clothes,
    clothesLibrary,
    cameo,
    cameoLibrary,
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
    painPointCategory,
    productLibrary,
    characterLibrary,
    sceneBaseLibrary,
    rulesLibrary,
    framingLibrary,
  ]);

  // all data is persisted via SETTINGS; no per-key saves required

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

  const handleSceneScriptChange = (index, value) => {
    setScenes((prev) =>
      prev.map((scene, i) =>
        i === index ? { ...scene, script: value } : scene
      )
    );
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
        const existingSet = new Set(
          normalizedPrev.map((h) => normalize(h.text))
        );
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

  const addTextToLibrary = (value, library, setter, label) => {
    const text = (value || "").trim();
    if (!text) {
      setStatusMessage(`Add a ${label} before saving to library.`);
      return;
    }
    const exists = library.some((item) => normalize(item) === normalize(text));
    if (exists) {
      setStatusMessage(`${label} already in library.`);
      return;
    }
    setter([...library, text]);
    setStatusMessage(`${label} saved to library.`);
  };

  const persistHookLibrary = (nextHooks) => {
    setHookTemplates((prev) => {
      const resolved =
        typeof nextHooks === "function" ? nextHooks(prev) : nextHooks;
      return resolved;
    });
  };

  const persistPainPointLibrary = (nextPainPoints) => {
    setPainPointLibrary((prev) => {
      const resolved =
        typeof nextPainPoints === "function"
          ? nextPainPoints(prev)
          : nextPainPoints;
      return resolved;
    });
  };

  const deleteLibraryItem = (library, setter, index, label, onApply) => {
    const updated = library.filter((_, i) => i !== index);
    setter(updated);
    if (onApply) onApply(updated, index);
    setStatusMessage(`${label} removed.`);
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
        throw new Error(
          res.error?.message || "Failed to categorize pain points"
        );
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
      setPainPoint(newPainPoint);
      setPainPointCategory(category);
      setStatusMessage("Pain point generated (not saved to library).");
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
      setConcreteHook(newHook);
      setStatusMessage("Hook generated (not saved to library).");
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Error generating hook.");
    } finally {
      setIsGeneratingHook(false);
    }
  };

  const generateClothes = async () => {
    if (!clothes.trim() && !character.trim()) {
      setStatusMessage("Add a clothing idea or character first.");
      return;
    }
    setIsGeneratingClothes(true);
    setStatusMessage("Generating clothes...");
    try {
      const res = await handleVideoPromptClothes(clothes, character);
      if (!res.success) {
        throw new Error(res.error?.message || "Failed to generate clothes");
      }
      const newClothes = res.data?.clothes || "";
      if (newClothes.trim()) {
        setClothes(newClothes);
        setStatusMessage("Clothes generated (not saved to library).");
      } else {
        setStatusMessage("No clothes description returned.");
      }
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Error generating clothes.");
    } finally {
      setIsGeneratingClothes(false);
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
        clothes,
        hook: concreteHook,
        painPoint,
        numScenes,
        scenes: sceneConfig,
        totalTimeLimit,
      });

      const data = res.data;
      if (data?.clothes) {
        setClothes(data.clothes);
      }
      setScenes(data.scenes || []);
      if (concreteHook?.trim()) {
        persistHookLibrary((prev) => {
          const normalizedPrev = normalizeHookList(prev);
          const exists = normalizedPrev.some(
            (h) => normalize(h.text) === normalize(concreteHook)
          );
          if (exists) return prev;
          return [
            ...normalizedPrev,
            { text: concreteHook, category: "uncategorized" },
          ];
        });
      }
      if (painPoint?.trim()) {
        persistPainPointLibrary((prev) => {
          const exists = prev.some(
            (p) => normalize(p.text) === normalize(painPoint)
          );
          if (exists) return prev;
          return [
            ...prev,
            { text: painPoint, category: painPointCategory || "uncategorized" },
          ];
        });
      }
      if (clothes?.trim()) {
        addTextToLibrary(clothes, clothesLibrary, setClothesLibrary, "clothes");
      }
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

  const handleSaveStepOne = () => {
    const settingsToSave = {
      productDescription,
      character,
      sceneBaseDescription,
      rules,
      framing,
      clothes,
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
      painPointCategory,
      productLibrary,
      characterLibrary,
      sceneBaseLibrary,
      rulesLibrary,
      framingLibrary,
      clothesLibrary,
      cameo,
      cameoLibrary,
    };

    saveToLocalStorage(LS_KEYS.SETTINGS, settingsToSave);
    setStatusMessage("Step 1 saved.");
  };

  const addCurrentHookToLibrary = () => {
    const text = (concreteHook || "").trim();
    if (!text) {
      setStatusMessage("No hook to add.");
      return;
    }
    persistHookLibrary((prev) => {
      const normalizedPrev = normalizeHookList(prev);
      const exists = normalizedPrev.some(
        (h) => normalize(h.text) === normalize(text)
      );
      if (exists) {
        setStatusMessage("Hook already in library.");
        return prev;
      }
      setStatusMessage("Hook added to library.");
      return [...normalizedPrev, { text, category: "uncategorized" }];
    });
  };

  const addCurrentPainPointToLibrary = () => {
    const text = (painPoint || "").trim();
    if (!text) {
      setStatusMessage("No pain point to add.");
      return;
    }
    persistPainPointLibrary((prev) => {
      const exists = prev.some((p) => normalize(p.text) === normalize(text));
      if (exists) {
        setStatusMessage("Pain point already in library.");
        return prev;
      }
      setStatusMessage("Pain point added to library.");
      return [
        ...prev,
        { text, category: painPointCategory || "uncategorized" },
      ];
    });
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
  const buildScenePromptPayload = (scene) => ({
    clothes: clothes || "",
    character: character || "",
    sceneDescription: scene.sceneDescription || sceneBaseDescription || "",
    rules: rules || "",
    framing: scene.framing || framing || "",
    script: scene.script || "",
  });

  const buildScenePromptDisplay = (scene) => {
    return [
      cameo ? `CAMEO: ${cameo}` : null,
      clothes ? `• CLOTHES: ${clothes}` : null,
      `• CHARACTER: ${character || "[CHARACTER]"}`,
      `• SCENE: ${
        scene.sceneDescription || sceneBaseDescription || "[SCENE DESCRIPTION]"
      }`,
      `• HARD RULES: ${rules || "[RULES]"}`,
      `• FRAMING: ${scene.framing || framing || "[FRAMING]"}`,
      `• SCENE DESCRIPTION: ${
        scene.sceneDescription || sceneBaseDescription || "[SCENE DESCRIPTION]"
      }`,
      `• SCRIPT FOR SCENE: ${scene.script || "[SCRIPT FOR SCENE]"}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const buildScenePromptCopy = (scene) => {
    const json = JSON.stringify(buildScenePromptPayload(scene), null, 2);
    return cameo ? `CAMEO: ${cameo}\n${json}` : json;
  };

  const fullPromptAllScenesDisplay = useMemo(() => {
    if (!scenes.length) return "";
    return scenes
      .map(
        (scene, idx) => `SCENE ${idx + 1}:\n${buildScenePromptDisplay(scene)}`
      )
      .join("\n\n");
  }, [scenes, cameo, clothes, rules, framing, character, sceneBaseDescription]);

  const fullPromptAllScenesCopy = useMemo(() => {
    if (!scenes.length) return "";
    const payload = scenes.map((scene) => buildScenePromptPayload(scene));
    const json = JSON.stringify(payload, null, 2);
    return cameo ? `CAMEO: ${cameo}\n${json}` : json;
  }, [scenes, cameo, clothes, rules, framing, character, sceneBaseDescription]);

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
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500">
              Feeds both pain points and hooks.
            </p>
            <button
              type="button"
              onClick={handleSaveStepOne}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
            >
              Save Step 1
            </button>
          </div>
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
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Saved Product Descriptions ({productLibrary.length})</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    addTextToLibrary(
                      productDescription,
                      productLibrary,
                      setProductLibrary,
                      "product description"
                    )
                  }
                  className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProducts((v) => !v)}
                  className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                >
                  {isEditingProducts ? "Done" : "Edit"}
                </button>
              </div>
            </div>
            <div className="border border-gray-100 rounded-lg max-h-32 overflow-y-auto">
              {productLibrary.map((item, idx) => (
                <div
                  key={idx}
                  className="w-full px-3 py-2 text-xs border-b last:border-b-0 flex items-start gap-2 text-left hover:bg-gray-50"
                >
                  <span className="font-semibold text-gray-700 pt-0.5">
                    #{idx + 1}
                  </span>
                  {isEditingProducts ? (
                    <textarea
                      value={item}
                      rows={2}
                      onChange={(e) => {
                        const updated = [...productLibrary];
                        updated[idx] = e.target.value;
                        setProductLibrary(updated);
                        if (productDescription === item) {
                          setProductDescription(e.target.value);
                        }
                      }}
                      className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setProductDescription(item);
                        setStatusMessage(
                          `Loaded product description #${idx + 1}`
                        );
                      }}
                      className="flex-1 text-left text-gray-800"
                    >
                      {item}
                    </button>
                  )}
                  {isEditingProducts && (
                    <button
                      type="button"
                      onClick={() =>
                        deleteLibraryItem(
                          productLibrary,
                          setProductLibrary,
                          idx,
                          "product description"
                        )
                      }
                      className="px-2 py-0.5 rounded border border-gray-200 hover:border-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
              {!productLibrary.length && (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No saved product descriptions yet.
                </div>
              )}
            </div>
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
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Saved Characters ({characterLibrary.length})</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addTextToLibrary(
                        character,
                        characterLibrary,
                        setCharacterLibrary,
                        "character"
                      )
                    }
                    className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCharacters((v) => !v)}
                    className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    {isEditingCharacters ? "Done" : "Edit"}
                  </button>
                </div>
              </div>
              <div className="border border-gray-100 rounded-lg max-h-28 overflow-y-auto">
                {characterLibrary.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full px-3 py-2 text-xs border-b last:border-b-0 flex items-start gap-2 text-left hover:bg-gray-50"
                  >
                    <span className="font-semibold text-gray-700 pt-0.5">
                      #{idx + 1}
                    </span>
                    {isEditingCharacters ? (
                      <textarea
                        value={item}
                        rows={2}
                        onChange={(e) => {
                          const updated = [...characterLibrary];
                          updated[idx] = e.target.value;
                          setCharacterLibrary(updated);
                          if (character === item) {
                            setCharacter(e.target.value);
                          }
                        }}
                        className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setCharacter(item);
                          setStatusMessage(`Loaded character #${idx + 1}`);
                        }}
                        className="flex-1 text-left text-gray-800"
                      >
                        {item}
                      </button>
                    )}
                    {isEditingCharacters && (
                      <button
                        type="button"
                        onClick={() =>
                          deleteLibraryItem(
                            characterLibrary,
                            setCharacterLibrary,
                            idx,
                            "character"
                          )
                        }
                        className="px-2 py-0.5 rounded border border-gray-200 hover:border-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {!characterLibrary.length && (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    No saved characters yet.
                  </div>
                )}
              </div>
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
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  Saved Scene Descriptions ({sceneBaseLibrary.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addTextToLibrary(
                        sceneBaseDescription,
                        sceneBaseLibrary,
                        setSceneBaseLibrary,
                        "scene description"
                      )
                    }
                    className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingScenes((v) => !v)}
                    className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    {isEditingScenes ? "Done" : "Edit"}
                  </button>
                </div>
              </div>
              <div className="border border-gray-100 rounded-lg max-h-28 overflow-y-auto">
                {sceneBaseLibrary.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full px-3 py-2 text-xs border-b last:border-b-0 flex items-start gap-2 text-left hover:bg-gray-50"
                  >
                    <span className="font-semibold text-gray-700 pt-0.5">
                      #{idx + 1}
                    </span>
                    {isEditingScenes ? (
                      <textarea
                        value={item}
                        rows={2}
                        onChange={(e) => {
                          const updated = [...sceneBaseLibrary];
                          updated[idx] = e.target.value;
                          setSceneBaseLibrary(updated);
                          if (sceneBaseDescription === item) {
                            setSceneBaseDescription(e.target.value);
                          }
                        }}
                        className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSceneBaseDescription(item);
                          setStatusMessage(
                            `Loaded scene description #${idx + 1}`
                          );
                        }}
                        className="flex-1 text-left text-gray-800"
                      >
                        {item}
                      </button>
                    )}
                    {isEditingScenes && (
                      <button
                        type="button"
                        onClick={() =>
                          deleteLibraryItem(
                            sceneBaseLibrary,
                            setSceneBaseLibrary,
                            idx,
                            "scene description"
                          )
                        }
                        className="px-2 py-0.5 rounded border border-gray-200 hover:border-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {!sceneBaseLibrary.length && (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    No saved scene descriptions yet.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Cameo (optional)
              </label>
              <input
                value={cameo}
                onChange={(e) => setCameo(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
                placeholder="e.g. Quick 3s appearance by the landlord holding a bill"
              />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Saved Cameos ({cameoLibrary.length})</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addTextToLibrary(
                        cameo,
                        cameoLibrary,
                        setCameoLibrary,
                        "cameo"
                      )
                    }
                    className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCameo((v) => !v)}
                    className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    {isEditingCameo ? "Done" : "Edit"}
                  </button>
                </div>
              </div>
              <div className="border border-gray-100 rounded-lg max-h-28 overflow-y-auto">
                {cameoLibrary.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full px-3 py-2 text-xs border-b last:border-b-0 flex items-start gap-2 text-left hover:bg-gray-50"
                  >
                    <span className="font-semibold text-gray-700 pt-0.5">
                      #{idx + 1}
                    </span>
                    {isEditingCameo ? (
                      <textarea
                        value={item}
                        rows={2}
                        onChange={(e) => {
                          const updated = [...cameoLibrary];
                          updated[idx] = e.target.value;
                          setCameoLibrary(updated);
                          if (cameo === item) {
                            setCameo(e.target.value);
                          }
                        }}
                        className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setCameo(item);
                          setStatusMessage(`Loaded cameo #${idx + 1}`);
                        }}
                        className="flex-1 text-left text-gray-800"
                      >
                        {item}
                      </button>
                    )}
                    {isEditingCameo && (
                      <button
                        type="button"
                        onClick={() =>
                          deleteLibraryItem(
                            cameoLibrary,
                            setCameoLibrary,
                            idx,
                            "cameo"
                          )
                        }
                        className="px-2 py-0.5 rounded border border-gray-200 hover:border-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {!cameoLibrary.length && (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    No saved cameos yet.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-800">
                  Clothes (optional)
                </label>
                <button
                  type="button"
                  onClick={generateClothes}
                  disabled={isGeneratingClothes}
                  className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600 disabled:opacity-60"
                >
                  {isGeneratingClothes ? "Generating..." : "Generate Clothes"}
                </button>
              </div>
              <textarea
                value={clothes}
                onChange={(e) => setClothes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
                placeholder="e.g. Top: fitted black tee; Bottom: dark jeans..."
              />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Saved Clothes ({clothesLibrary.length})</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addTextToLibrary(
                        clothes,
                        clothesLibrary,
                        setClothesLibrary,
                        "clothes"
                      )
                    }
                    className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingClothes((v) => !v)}
                    className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    {isEditingClothes ? "Done" : "Edit"}
                  </button>
                </div>
              </div>
              <div className="border border-gray-100 rounded-lg max-h-28 overflow-y-auto">
                {clothesLibrary.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full px-3 py-2 text-xs border-b last:border-b-0 flex items-start gap-2 text-left hover:bg-gray-50"
                  >
                    <span className="font-semibold text-gray-700 pt-0.5">
                      #{idx + 1}
                    </span>
                    {isEditingClothes ? (
                      <textarea
                        value={item}
                        rows={2}
                        onChange={(e) => {
                          const updated = [...clothesLibrary];
                          updated[idx] = e.target.value;
                          setClothesLibrary(updated);
                          if (clothes === item) {
                            setClothes(e.target.value);
                          }
                        }}
                        className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setClothes(item);
                          setStatusMessage(`Loaded clothes #${idx + 1}`);
                        }}
                        className="flex-1 text-left text-gray-800"
                      >
                        {item}
                      </button>
                    )}
                    {isEditingClothes && (
                      <button
                        type="button"
                        onClick={() =>
                          deleteLibraryItem(
                            clothesLibrary,
                            setClothesLibrary,
                            idx,
                            "clothes"
                          )
                        }
                        className="px-2 py-0.5 rounded border border-gray-200 hover:border-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {!clothesLibrary.length && (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    No saved clothes yet.
                  </div>
                )}
              </div>
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
            <button
              type="button"
              onClick={addCurrentPainPointToLibrary}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
            >
              Add Pain Point
            </button>
            <button
              type="button"
              onClick={() => setIsEditingPainPoints((v) => !v)}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
            >
              {isEditingPainPoints ? "Done Editing" : "Edit Library"}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4 md:gap-6">
          {/* Pain point list */}
          <div className="border border-gray-100 rounded-lg max-h-64 overflow-y-auto">
            {painPointLibrary.map((pp, idx) => (
              <div
                key={idx}
                className={`w-full px-3 py-2 text-xs sm:text-sm border-b last:border-b-0 flex items-start gap-2 text-left ${
                  idx === selectedPainPointIndex && !isEditingPainPoints
                    ? "bg-blue-50 text-blue-800 border-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="font-semibold pt-0.5">#{idx + 1}</span>
                {isEditingPainPoints ? (
                  <input
                    value={pp.text}
                    onChange={(e) => {
                      const updated = [...painPointLibrary];
                      updated[idx] = { ...pp, text: e.target.value };
                      setPainPointLibrary(updated);
                      if (selectedPainPointIndex === idx) {
                        setPainPoint(e.target.value);
                      }
                    }}
                    className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectPainPointIndex(idx)}
                    className="flex-1 text-left"
                  >
                    {pp.text}
                  </button>
                )}
                <CategoryBadge label={pp.category} />
                {isEditingPainPoints && (
                  <button
                    type="button"
                    onClick={() =>
                      deleteLibraryItem(
                        painPointLibrary,
                        setPainPointLibrary,
                        idx,
                        "pain point",
                        (updated, removedIdx) => {
                          if (!updated.length) {
                            setPainPoint("");
                            setSelectedPainPointIndex(0);
                            return;
                          }
                          if (selectedPainPointIndex >= updated.length) {
                            setSelectedPainPointIndex(updated.length - 1);
                            setPainPoint(updated[updated.length - 1].text);
                          } else if (removedIdx === selectedPainPointIndex) {
                            setPainPoint(updated[selectedPainPointIndex].text);
                          }
                        }
                      )
                    }
                    className="px-2 py-0.5 rounded border border-gray-200 hover:border-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
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
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">
                Manual Pain Point (overrides selection)
              </p>
              <textarea
                value={painPoint}
                onChange={(e) => setPainPoint(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600"
                placeholder="Type a custom pain point to use immediately."
              />
              <p className="text-[11px] text-gray-500">
                This value is used for hook/script generation even if not saved
                to the library.
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
            <button
              type="button"
              onClick={() => setIsEditingHooks((v) => !v)}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
            >
              {isEditingHooks ? "Done Editing" : "Edit Library"}
            </button>
          </div>
        </div>

        {hookUploadError && (
          <p className="text-xs text-red-600">{hookUploadError}</p>
        )}

        <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4 md:gap-6">
          {/* Hook list */}
          <div className="border border-gray-100 rounded-lg max-h-64 overflow-y-auto">
            {hookTemplates.map((hook, idx) => (
              <div
                key={idx}
                className={`w-full px-3 py-2 text-xs sm:text-sm border-b last:border-b-0 flex items-start gap-2 text-left ${
                  idx === selectedHookIndex && !isEditingHooks
                    ? "bg-blue-50 text-blue-800 border-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="font-semibold pt-0.5">#{idx + 1}</span>
                {isEditingHooks ? (
                  <input
                    value={hook.text}
                    onChange={(e) => {
                      const updated = [...hookTemplates];
                      updated[idx] = { ...hook, text: e.target.value };
                      setHookTemplates(updated);
                    }}
                    className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectHookIndex(idx)}
                    className="flex-1 text-left"
                  >
                    {hook.text}
                  </button>
                )}
                <CategoryBadge label={hook.category} />
                {isEditingHooks && (
                  <button
                    type="button"
                    onClick={() =>
                      deleteLibraryItem(
                        hookTemplates,
                        setHookTemplates,
                        idx,
                        "hook template",
                        (updated, removedIdx) => {
                          if (!updated.length) {
                            setSelectedHookIndex(0);
                            return;
                          }
                          if (selectedHookIndex >= updated.length) {
                            setSelectedHookIndex(updated.length - 1);
                          } else if (removedIdx === selectedHookIndex) {
                            setSelectedHookIndex(
                              Math.max(0, selectedHookIndex - 1)
                            );
                          }
                        }
                      )
                    }
                    className="px-2 py-0.5 rounded border border-gray-200 hover:border-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
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
                <button
                  type="button"
                  onClick={addCurrentHookToLibrary}
                  className="mt-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                >
                  Add Hook to Library
                </button>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Pain Point (from Step 2)
                </label>
                <textarea
                  readOnly
                  value={painPoint}
                  rows={2}
                  className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 text-xs bg-gray-50"
                  placeholder="Select or generate a pain point in Step 2."
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
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Saved Rules ({rulesLibrary.length})</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    addTextToLibrary(
                      rules,
                      rulesLibrary,
                      setRulesLibrary,
                      "rules"
                    )
                  }
                  className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingRules((v) => !v)}
                  className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                >
                  {isEditingRules ? "Done" : "Edit"}
                </button>
              </div>
            </div>
            <div className="border border-gray-100 rounded-lg max-h-28 overflow-y-auto">
              {rulesLibrary.map((item, idx) => (
                <div
                  key={idx}
                  className="w-full px-3 py-2 text-xs border-b last:border-b-0 flex items-start gap-2 text-left hover:bg-gray-50"
                >
                  <span className="font-semibold text-gray-700 pt-0.5">
                    #{idx + 1}
                  </span>
                  {isEditingRules ? (
                    <textarea
                      value={item}
                      rows={2}
                      onChange={(e) => {
                        const updated = [...rulesLibrary];
                        updated[idx] = e.target.value;
                        setRulesLibrary(updated);
                        if (rules === item) {
                          setRules(e.target.value);
                        }
                      }}
                      className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setRules(item);
                        setStatusMessage(`Loaded rules #${idx + 1}`);
                      }}
                      className="flex-1 text-left text-gray-800"
                    >
                      {item}
                    </button>
                  )}
                  {isEditingRules && (
                    <button
                      type="button"
                      onClick={() =>
                        deleteLibraryItem(
                          rulesLibrary,
                          setRulesLibrary,
                          idx,
                          "rules"
                        )
                      }
                      className="px-2 py-0.5 rounded border border-gray-200 hover:border-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
              {!rulesLibrary.length && (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No saved rules yet.
                </div>
              )}
            </div>
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
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Saved Framing ({framingLibrary.length})</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    addTextToLibrary(
                      framing,
                      framingLibrary,
                      setFramingLibrary,
                      "framing"
                    )
                  }
                  className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingFraming((v) => !v)}
                  className="px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                >
                  {isEditingFraming ? "Done" : "Edit"}
                </button>
              </div>
            </div>
            <div className="border border-gray-100 rounded-lg max-h-28 overflow-y-auto">
              {framingLibrary.map((item, idx) => (
                <div
                  key={idx}
                  className="w-full px-3 py-2 text-xs border-b last:border-b-0 flex items-start gap-2 text-left hover:bg-gray-50"
                >
                  <span className="font-semibold text-gray-700 pt-0.5">
                    #{idx + 1}
                  </span>
                  {isEditingFraming ? (
                    <textarea
                      value={item}
                      rows={2}
                      onChange={(e) => {
                        const updated = [...framingLibrary];
                        updated[idx] = e.target.value;
                        setFramingLibrary(updated);
                        if (framing === item) {
                          setFraming(e.target.value);
                        }
                      }}
                      className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setFraming(item);
                        setStatusMessage(`Loaded framing #${idx + 1}`);
                      }}
                      className="flex-1 text-left text-gray-800"
                    >
                      {item}
                    </button>
                  )}
                  {isEditingFraming && (
                    <button
                      type="button"
                      onClick={() =>
                        deleteLibraryItem(
                          framingLibrary,
                          setFramingLibrary,
                          idx,
                          "framing"
                        )
                      }
                      className="px-2 py-0.5 rounded border border-gray-200 hover:border-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
              {!framingLibrary.length && (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No saved framing entries yet.
                </div>
              )}
            </div>
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
                    onClick={() =>
                      copyToClipboard(
                        [cameo || null, clothes || null, scene.script || ""]
                          .filter(Boolean)
                          .join("\n")
                      )
                    }
                    className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    Copy Dialogue
                  </button>
                </div>

                <textarea
                  value={scene.script || ""}
                  onChange={(e) => handleSceneScriptChange(idx, e.target.value)}
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
              const displayText = buildScenePromptDisplay(scene);
              const copyText = buildScenePromptCopy(scene);
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
                      onClick={() => copyToClipboard(copyText)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                    >
                      Copy Prompt
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={displayText}
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
              onClick={() => copyToClipboard(fullPromptAllScenesCopy)}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
            >
              Copy All Scenes
            </button>
          </div>
          <textarea
            readOnly
            value={fullPromptAllScenesDisplay}
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
              added
                ? `Added ${added} hook(s) from paste.`
                : "No new hooks added."
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
