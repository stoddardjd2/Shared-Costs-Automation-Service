const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs").promises;
const crypto = require("crypto");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const TIKTOK_AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;

const upload = multer({ storage: multer.memoryStorage() });

// TikTok Content Posting API endpoints
const INBOX_INIT_URL =
  "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/";
const PUBLISH_INIT_URL =
  "https://open.tiktokapis.com/v2/post/publish/video/init/";
const PUBLISH_COMPLETE_URL =
  "https://open.tiktokapis.com/v2/post/publish/video/complete/";
// Helper: generate random state

// Generate random verifier (43–128 chars, allowed PKCE charset)
function generateCodeVerifier() {
  // 32 bytes in hex = 64 chars → valid length
  return crypto.randomBytes(32).toString("hex");
}

// TikTok docs: hex-encoded SHA256 of code_verifier as code_challenge :contentReference[oaicite:1]{index=1}
function generateCodeChallenge(codeVerifier) {
  return crypto.createHash("sha256").update(codeVerifier).digest("hex");
}

// You already had something like this for state:
function generateState() {
  return crypto.randomBytes(16).toString("hex");
}

const stateStore = new Map();

router.get("/login/:userId", (req, res) => {
  // however you identify your logged-in Splitify user:
  const splitifyUserId = req.params.userId;

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  stateStore.set(state, {
    userId: splitifyUserId,
    codeVerifier,
    createdAt: Date.now(),
  });

  const scope = [
    "user.info.basic", // basic profile
    "video.upload", // upload drafts
    "video.publish", // direct post (if you use Direct Post)
  ].join(",");


  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `${TIKTOK_AUTH_BASE}?${params.toString()}`;

  return res.redirect(authUrl);
});

// 2) TikTok redirects here with ?code=&state=
router.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send("Missing code or state");
  }

  const stored = stateStore.get(state);
  if (!stored) {
    return res.status(400).send("Invalid state");
  }
  stateStore.delete(state);

  const { userId: splitifyUserId, codeVerifier } = stored;

  try {
    // Exchange authorization code for user access_token
    const body = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: process.env.TIKTOK_REDIRECT_URI,
      code: code.toString(),
      code_verifier: codeVerifier, // 🔥 critical for PKCE
    });

    const tokenRes = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("TikTok token error:", tokenJson);
      return res
        .status(500)
        .send("Failed to exchange code for TikTok access token");
    }

    const { access_token, refresh_token, expires_in, open_id, scope } =
      tokenJson;

    //  store in your DB associated with splitifyUserId
    await User.updateOne(
      { _id: splitifyUserId },
      {
        tiktok: {
          accessToken: access_token,
          refreshToken: refresh_token,
          openId: open_id,
          scope,
          expiresAt: new Date(Date.now() + expires_in * 1000),
        },
      }
    );

    const FRONTEND_URL = process.env.CLIENT_URL;

    return res.redirect(`${FRONTEND_URL}/admin/tiktok?connected=1`);
  } catch (err) {
    console.error("Error exchanging TikTok code for token:", err);

    const FRONTEND_URL = process.env.FRONTEND_URL;

    return res.redirect(
      `${FRONTEND_URL}/admin/tiktok?error=tiktok_oauth_failed`
    );
  }
});

router.use(protect); // All routes after this require user to logged in
router.use(authorize("admin"));

// POST /api/tiktok/post
router.post("/post", upload.single("video"), async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findOne(
      { _id: userId },
      { "tiktok.accessToken": 1 }
    ).lean();

    const accessToken = user?.tiktok?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        error: "no_tiktok_token",
        message: "Connect your TikTok account first.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "missing_video" });
    }

    // 🔹 read file from disk
    const videoBuffer = req.file.buffer;
    const videoSize = req.file.size || videoBuffer.length;

    const { caption, privacy_level, mode } = req.body;
    const isPublish = mode === "publish";

    // Choose init URL based on mode
    const initUrl = isPublish ? PUBLISH_INIT_URL : INBOX_INIT_URL;

    // 1) Initialize upload (single chunk)
    const initRes = await fetch(initUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoSize,
          chunk_size: videoSize,
          total_chunk_count: 1,
        },
      }),
    });

    if (!initRes.ok) {
      const text = await initRes.text().catch(() => "");
      console.error("TikTok init error:", text);
      return res
        .status(500)
        .json({ error: "tiktok_init_failed", details: text });
    }

    const initJson = await initRes.json();
    const { upload_url, publish_id } = initJson.data || {};

    if (!upload_url) {
      console.error("TikTok init missing upload_url:", initJson);
      return res.status(500).json({ error: "tiktok_init_missing_upload_url" });
    }

    // 2) Upload the video binary to upload_url
    const uploadRes = await fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": videoSize.toString(),
        "Content-Range": `bytes 0-${videoSize - 1}/${videoSize}`,
      },
      body: videoBuffer,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      console.error("TikTok upload error:", text);
      return res
        .status(500)
        .json({ error: "tiktok_upload_failed", details: text });
    }

    // If mode is "upload" → just inbox draft, no final publish
    if (!isPublish) {
      return res.json({
        success: true,
        mode: "upload",
        publish_id,
        message:
          "Video uploaded to TikTok inbox. Check your TikTok app to finish posting.",
      });
    }

    // 3) For "publish" mode, finalize with caption + privacy_level
    const completeRes = await fetch(PUBLISH_COMPLETE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        publish_id,
        post_info: {
          caption: caption || "",
          // fallback to PUBLIC if frontend didn't pass privacy_level
          privacy_level: privacy_level || "PUBLIC",
        },
      }),
    });

    if (!completeRes.ok) {
      const text = await completeRes.text().catch(() => "");
      console.error("TikTok publish error:", text);
      return res
        .status(500)
        .json({ error: "tiktok_publish_failed", details: text });
    }

    const completeJson = await completeRes.json();

    return res.json({
      success: true,
      mode: "publish",
      publish_id,
      data: completeJson,
      message: "Video published to TikTok.",
    });
  } catch (err) {
    console.error("TikTok post error:", err);
    return res.status(500).json({ error: "tiktok_post_failed" });
  }
});

module.exports = router;
