const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const { protect, authorize } = require("../middleware/auth");

const sendTextMessage = require("../send-request-helpers/sendTextMessage");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const {
  startReminderScheduler,
  startSchedulerWithFrequentChecks,
  stopScheduler,
  runSchedulerNow,
  getSchedulerStatus,
} = require("../reminder-scheduler/reminderScheduler");

const {
  startRecurringRequestsCron,
  getRequestSchedulerStatus,
  runRecurringRequestsNow,
} = require("../payment-request-scheduler/paymentRequestScheduler");
// FOR REMINDER SCHEDULER

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // set in your server env
if (!OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY is not set in environment variables.");
}

router.use(protect); // All routes after this require user to logged in
router.use(authorize("admin"));

// Admin endpoint to check scheduler status
router.get("/scheduler-status", async (req, res) => {
  try {
    const status = await getSchedulerStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Manual trigger endpoint
router.post("/trigger-reminders", async (req, res) => {
  try {
    console.log("🔧 Manual reminder trigger requested");
    await runSchedulerNow();

    const status = await getSchedulerStatus();
    res.json({
      success: true,
      message: "Reminders processed successfully",
      timestamp: new Date().toISOString(),
      status,
    });
  } catch (error) {
    console.error("❌ Manual reminder trigger failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process reminders",
      error: error.message,
    });
  }
});

// Manual trigger endpoint
router.get("/request-scheduler-status", async (req, res) => {
  try {
    const status = getRequestSchedulerStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/trigger-request-scheduler", async (req, res) => {
  try {
    console.log("🔧 Manual requests scheduler trigger requested");
    const status = await runRecurringRequestsNow();
    res.json({
      success: true,
      message: "requests scheduler processed successfully",
      timestamp: new Date().toISOString(),
      status,
    });
  } catch (error) {
    console.error("❌ Manual request scheduler trigger failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process requests",
      error: error.message,
    });
  }
});

router.post("/trigger-email", async (req, res) => {
  try {
    console.log("🔧 Manually sending email");
    await sendEmailRequest(
      "Jared",
      "Kevin",
      "13",
      "URL",
      "stoddardjd3@gmail.com"
    );
    res.json({
      success: true,
      message: "email sent successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ email trigger failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
});

// OVERRIDES FIRST FOUND REQUEST DOCUMENT AND SETS START TIMING/LASTSENT TO 2 years ago
router.post("/override-and-test-scheduler/:id", async (req, res) => {
  const id = req.params.id;
  const doc = await Request.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        startTiming: {
          $dateToString: {
            date: {
              $dateSubtract: { startDate: "$$NOW", unit: "year", amount: 2 },
            },
            format: "%Y-%m-%d",
            timezone: "UTC", // change to "America/Los_Angeles" if you want local
          },
        },
        lastSent: new Date(
          new Date().setFullYear(new Date().getFullYear() - 2)
        ),
      },
    },
    { sort: { _id: 1 }, new: true }
  );
  console.log("updated doc for testing scheduler:", doc._id);

  try {
    console.log("🔧 Manual requests scheduler trigger requested");
    const status = await runRecurringRequestsNow();
    res.json({
      success: true,
      message: "requests scheduler processed successfully",
      timestamp: new Date().toISOString(),
      status,
    });
  } catch (error) {
    console.error("❌ Manual request scheduler trigger failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process requests",
      error: error.message,
    });
  }
});

router.post("/send-text", async (req, res) => {
  const { to } = req.body;
  console.log("sending to", to);
  //   const message = `Hi Julian,
  // Cole sent you a payment request.

  // AMOUNT REQUESTED: $9.99
  // FOR: Netflix

  // To complete your payment, visit: https://splitify.io/payment?id=21421

  // Sent via Splitify
  // `;

  const message = `Hi John,
you have an overdue bill for Julian.

AMOUNT DUE: $9.99
FOR: Electricity Bill

To complete your payment, visit: https://splitify.io/payment?id=24221

Sent via Splitify
`;

  try {
    console.log("🔧 Manually sending text");
    await sendTextMessage(to, "+18333702013", message);

    res.json({
      success: true,
      message: "text sent successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("raw:", JSON.stringify(error.raw, null, 2));
    console.error("errors:", JSON.stringify(error.raw?.errors, null, 2));
    // Optional: log request-id so support can trace
    console.error("x-request-id:", error.requestId);
    console.error("❌ text trigger failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send text",
      error: error.message,
    });
  }
});

// Helper to enforce safety + shaping
const SYSTEM_PROMPT_HOOK = `
You are helping a SaaS founder create TikTok hooks.
Inputs:
- productDescription: description of product benefits, target audience, and features.
- hookTemplate: a generic hook template with placeholders like [desire], [pain point], etc. (used only when generationMode is "template").
- generationMode: either "template" (fill the provided pattern) or "pain-point-fit" (craft a hook without using the template, just make sure it fits the chosen pain point).
- additionalHookRules: optional extra constraints or style notes for the hook.
- painPoint: the specific pain point to use (do NOT invent a new one).

Task:
1. Understand the core value props and audience of Splitify.
2. Use the provided painPoint as the anchor (do not change or invent a new one).
3. If generationMode is "template": use the painPoint to fill in hookTemplate as a pattern, filling in placeholders naturally for TikTok language.
4. If generationMode is "pain-point-fit": ignore hookTemplate and craft a concise, fresh hook that squarely fits the provided pain point and Splitify's value prop (no template reuse).
5. Respect any additionalHookRules when shaping tone or content.
6. Return a short, punchy hook line, echo back the same pain point, and add a concise category label for the hook.

Return JSON with:
{
  "hook": "final hook line",
  "painPoint": "clear pain point to focus on",
  "category": "short category label for this hook"
}
`;

const SYSTEM_PROMPT_SCRIPT = `
You are writing short TikTok-style scenes for an AI-generated video.
Follow these rules:

- Natural TikTok language, casual and conversational.
- No text overlays, graphics, or extra people. One main character.
- Respect the durationSeconds, write only as much dialogue as can be spoken in that time.
- Each scene should focus on the chosen HOOK and PAIN POINT applied to Splitify.
- The character is talking directly to camera (POV selfie).
- Keep it realistic and emotionally resonant (especially around awkwardness about money).
- No sentences than end with !? or ?!
Return JSON:
{
  "scenes": [
    {
      "index": number,
      "durationSeconds": number,
      "sceneDescription": string,
      "framing": string,
      "script": string
    }
  ],
  "clothes": string
}
`;

const SYSTEM_PROMPT_CLOTHES = `
You create concise, highly detailed clothing descriptions for a TikTok character.
- Keep the format consistent every time.
- Use labeled segments: "Top:", "Bottom:", "Shoes:", "Accessories:".
- Stay under 60 words total.
- Avoid brand names; focus on style, color, fit, and texture.
Return JSON: { "clothes": "Top: ... Bottom: ... Shoes: ... Accessories: ..." }
`;

// POST /api/video-prompts/hook
// POST /api/video-prompts/hook
router.post("/video-prompts/hook", async (req, res) => {
  try {
    const {
      productDescription,
      hookTemplate,
      generationMode = "template",
      additionalHookRules = "",
      painPoint = "",
    } = req.body || {};

    if (!productDescription || !painPoint) {
      return res.status(400).json({
        message: "Missing productDescription or painPoint.",
      });
    }

    if (generationMode !== "pain-point-fit" && !hookTemplate) {
      return res.status(400).json({
        message: "Missing hookTemplate.",
      });
    }

    const userPrompt = {
      productDescription,
      hookTemplate,
      generationMode,
      additionalHookRules,
      painPoint,
    };

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT_HOOK,
        },
        {
          role: "user",
      content: JSON.stringify(userPrompt),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "hook_result",        // 🔴 REQUIRED
          strict: true,
          schema: {
            type: "object",
            properties: {
              hook: { type: "string" },
              painPoint: { type: "string" },
              category: { type: "string" },
            },
            required: ["hook", "painPoint", "category"],
            additionalProperties: false,
          },
        },
      },
    });

    const content =
      completion.output[0]?.content?.[0]?.text ??
      completion.output[0]?.content?.[0]?.json;

    let data;
    try {
      data = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      data = { hook: "", painPoint: "" };
    }

    return res.json({
      hook: data.hook,
      painPoint: data.painPoint,
      category: data.category,
    });
  } catch (err) {
    console.error("Error generating hook:", err);
    return res.status(500).json({
      message: "Error generating hook.",
    });
  }
});

// POST /api/video-prompts/pain-point
router.post("/video-prompts/pain-point", async (req, res) => {
  try {
    const {
      productDescription,
      category = "uncategorized",
      existingPainPoints = [],
    } = req.body || {};

    if (!productDescription) {
      return res
        .status(400)
        .json({ message: "Missing productDescription for pain point." });
    }

    const userPrompt = {
      productDescription,
      category,
      existingPainPoints,
    };

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT_PAIN_POINT },
        { role: "user", content: JSON.stringify(userPrompt) },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "pain_point_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              painPoint: { type: "string" },
              category: { type: "string" },
            },
            required: ["painPoint", "category"],
            additionalProperties: false,
          },
        },
      },
    });

    const content =
      completion.output[0]?.content?.[0]?.text ??
      completion.output[0]?.content?.[0]?.json;

    let data;
    try {
      data = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      data = { painPoint: "", category };
    }

    return res.json({
      painPoint: data.painPoint,
      category: data.category || category || "uncategorized",
    });
  } catch (err) {
    console.error("Error generating pain point:", err);
    return res.status(500).json({
      message: "Error generating pain point.",
    });
  }
});

// POST /api/video-prompts/clothes
router.post("/video-prompts/clothes", async (req, res) => {
  try {
    const { clothingIdea = "", character = "" } = req.body || {};

    if (!clothingIdea && !character) {
      return res
        .status(400)
        .json({ message: "Provide clothingIdea or character context." });
    }

    const userPrompt = { clothingIdea, character };

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT_CLOTHES },
        { role: "user", content: JSON.stringify(userPrompt) },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "clothes_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              clothes: { type: "string" },
            },
            required: ["clothes"],
            additionalProperties: false,
          },
        },
      },
    });

    const content =
      completion.output[0]?.content?.[0]?.text ??
      completion.output[0]?.content?.[0]?.json;

    let data;
    try {
      data = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      data = { clothes: "" };
    }

    return res.json({
      clothes: data.clothes || "",
    });
  } catch (err) {
    console.error("Error generating clothes:", err);
    return res.status(500).json({
      message: "Error generating clothes description.",
    });
  }
});

// POST /api/video-prompts/categorize/hooks
router.post("/video-prompts/categorize/hooks", async (req, res) => {
  try {
    const { hooks = [], productDescription = "" } = req.body || {};
    if (!Array.isArray(hooks) || !hooks.length) {
      return res
        .status(400)
        .json({ message: "No hooks provided for categorization." });
    }
    const userPrompt = {
      items: hooks,
      productDescription,
    };

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT_CATEGORIZE },
        { role: "user", content: JSON.stringify(userPrompt) },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "categorize_hooks",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    category: { type: "string" },
                  },
                  required: ["text", "category"],
                  additionalProperties: false,
                },
              },
            },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
    });

    const content =
      completion.output[0]?.content?.[0]?.text ??
      completion.output[0]?.content?.[0]?.json;

    let data;
    try {
      data = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      data = { items: [] };
    }

    return res.json({ items: data.items || [] });
  } catch (err) {
    console.error("Error categorizing hooks:", err);
    return res.status(500).json({ message: "Error categorizing hooks." });
  }
});

// POST /api/video-prompts/categorize/pain-points
router.post("/video-prompts/categorize/pain-points", async (req, res) => {
  try {
    const { painPoints = [], productDescription = "" } = req.body || {};
    if (!Array.isArray(painPoints) || !painPoints.length) {
      return res
        .status(400)
        .json({ message: "No pain points provided for categorization." });
    }
    const userPrompt = {
      items: painPoints,
      productDescription,
    };

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT_CATEGORIZE },
        { role: "user", content: JSON.stringify(userPrompt) },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "categorize_pain_points",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    category: { type: "string" },
                  },
                  required: ["text", "category"],
                  additionalProperties: false,
                },
              },
            },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
    });

    const content =
      completion.output[0]?.content?.[0]?.text ??
      completion.output[0]?.content?.[0]?.json;

    let data;
    try {
      data = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      data = { items: [] };
    }

    return res.json({ items: data.items || [] });
  } catch (err) {
    console.error("Error categorizing pain points:", err);
    return res.status(500).json({ message: "Error categorizing pain points." });
  }
});

// POST /api/video-prompts/script
router.post("/video-prompts/script", async (req, res) => {
  try {
    const {
      productDescription,
      character,
      baseSceneDescription,
      rules,
      framing,
      hook,
      painPoint,
      clothes = "",
      numScenes,
      scenes,
      totalTimeLimit,
    } = req.body || {};

    if (!hook || !painPoint || !productDescription || !character) {
      return res.status(400).json({
        message:
          "Missing required fields: hook, painPoint, productDescription, or character.",
      });
    }

    if (!Array.isArray(scenes) || !scenes.length) {
      return res.status(400).json({
        message: "Missing scene configuration.",
      });
    }

    const totalPlannedTime = scenes.reduce(
      (sum, s) => sum + Number(s.durationSeconds || 0),
      0
    );
    if (totalTimeLimit && totalPlannedTime > totalTimeLimit) {
      return res.status(400).json({
        message: "Total planned time exceeds limit. Adjust durations.",
      });
    }

    const userPrompt = {
      productDescription,
      character,
      baseSceneDescription,
      rules,
      framing,
      hook,
      painPoint,
      clothes,
      numScenes,
      scenes,
    };

    const completion = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT_SCRIPT,
        },
        {
          role: "user",
          content: JSON.stringify(userPrompt),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "script_result",      
          strict: true,
          schema: {
            type: "object",
            properties: {
              clothes: { type: "string" },
              scenes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    index: { type: "number" },
                    durationSeconds: { type: "number" },
                    sceneDescription: { type: "string" },
                    framing: { type: "string" },
                    script: { type: "string" },
                  },
                  required: [
                    "index",
                    "durationSeconds",
                    "script",
                    "sceneDescription",
                    "framing",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["clothes", "scenes"],
            additionalProperties: false,
          },
        },
      },
    });

    const content =
      completion.output[0]?.content?.[0]?.text ??
      completion.output[0]?.content?.[0]?.json;

    let data;
    try {
      data = typeof content === "string" ? JSON.parse(content) : content;
    } catch (e) {
      console.error("Failed to parse script JSON:", e);
      return res
        .status(500)
        .json({ message: "Failed to parse script response." });
    }

    return res.json({
      clothes: data.clothes || clothes || "",
      scenes: data.scenes || [],
    });
  } catch (err) {
    console.error("Error generating script:", err);
    return res.status(500).json({
      message: "Error generating script scenes.",
    });
  }
});


module.exports = router;
const SYSTEM_PROMPT_PAIN_POINT = `
You are helping categorize and generate human pain points for Splitify (shared bill management).
Inputs:
- productDescription: description of product benefits, target audience, and features.
- category: optional category label for the pain point.
- existingPainPoints: list of pain points already in the library.

Task:
1. Propose ONE concise, human pain point that Splitify solves.
2. Avoid generating anything that is the same as or too similar to existingPainPoints.
3. Keep it natural, specific, and TikTok-friendly (plain language).

Return JSON:
{
  "painPoint": "text",
  "category": "category label"
}
`;

const SYSTEM_PROMPT_CATEGORIZE = `
You help organize short marketing lines into concise categories.
Inputs:
- items: an array of strings to categorize.
- productDescription: description of the product to keep categories relevant.

Task:
1. For each item, assign a short category label (2-4 words).
2. Keep categories consistent across items when they share themes.

Return JSON:
{
  "items": [
    { "text": "original item", "category": "label" }
  ]
}
`;
