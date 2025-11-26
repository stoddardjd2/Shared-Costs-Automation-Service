import React, { useState, useRef, useEffect } from "react";
import { uploadToTikTok } from "../../../queries/tiktok";
const apiBase = import.meta.env.VITE_API_URL;
import { useData } from "../../../contexts/DataContext";
import { useRouteLoaderData } from "react-router-dom";

export default function TikTokUploader() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState("PUBLIC_TO_EVERYONE");
  const [mode, setMode] = useState("publish"); // "publish" | "upload"
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const inputRef = useRef(null);
  const { userData } = useData();

  // helper: is TikTok access token still valid?
  const hasValidTikTokToken = (() => {
    const expiresAt = userData?.tiktok?.expiresAt;
    if (!expiresAt) return false;
    const expMs = new Date(expiresAt).getTime();
    return !Number.isNaN(expMs) && expMs > Date.now();
  })();

  // Initialize connection state from token validity
  useEffect(() => {
    if (hasValidTikTokToken) {
      setIsConnected(true);
    }
  }, [hasValidTikTokToken]);

  // Detect OAuth success via ?connected=true (overrides)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      setIsConnected(true);
    }
  }, []);

  const handleFileSelect = (f) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setStatus("Please upload a video file.");
      return;
    }
    setFile(f);
    setStatus("");
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    handleFileSelect(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    handleFileSelect(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!isConnected) {
      setStatus("❌ Please connect your TikTok account first.");
      return;
    }

    if (!file) {
      setStatus("Please select a video first.");
      return;
    }
    if (mode === "publish" && !caption.trim()) {
      setStatus("Please enter a caption for publishing.");
      return;
    }

    setIsUploading(true);
    setStatus(
      mode === "publish"
        ? "Publishing to TikTok…"
        : "Uploading to TikTok inbox (draft)…"
    );

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("caption", caption);
      formData.append("privacy_level", privacy);
      formData.append("mode", mode);

      // NOTE: assuming uploadToTikTok handles the fetch with formData internally
      const res = await uploadToTikTok(formData);
      console.log("res", res);

      setStatus(
        mode === "publish"
          ? "✅ Successfully published to TikTok feed."
          : "✅ Successfully uploaded to TikTok inbox/drafts."
      );

      setFile(null);
      setCaption("");
    } catch (err) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              TikTok Upload (Internal)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Drag & drop a video, choose upload mode, and send it to your
              connected TikTok account via the Content Posting API.
            </p>
          </div>
        </header>

        {/* CONNECT STEP */}
        {!isConnected && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Connect your TikTok account
            </h2>
            <p className="text-sm text-slate-500 mb-3">
              You must authorize TikTok before uploading or publishing videos.
            </p>

            {/* 
              Only show the "update button view" (different text) 
              if userData.tiktok.expiresAt is NOT expired.
            */}
            <TikTokConnectButton
              userData={userData}
              hasValidTikTokToken={hasValidTikTokToken}
            />

            <p className="mt-3 text-xs text-slate-500">
              After connecting, you will be redirected back here with{" "}
              <code>?connected=true</code>.
            </p>
          </div>
        )}

        {/* SHOW UPLOADER ONLY WHEN CONNECTED (and token not expired / just connected) */}
        {isConnected && (
          <>
            {/* Drag & drop area */}
            <div
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 mb-6 cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-600 bg-blue-50/40"
                  : "border-slate-200 bg-slate-50"
              }`}
              onClick={() => inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={onFileChange}
              />
              <div className="flex flex-col items-center justify-center text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 16V4m0 0 4 4m-4-4L8 8"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Drag &amp; drop your TikTok video here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    MP4 or MOV, vertical preferred (9:16). Click to browse.
                  </p>
                </div>
                {file && (
                  <div className="mt-2 text-xs text-slate-600">
                    <span className="font-semibold text-blue-600">
                      Selected file:
                    </span>{" "}
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                  </div>
                )}
              </div>
            </div>

            {/* SETTINGS */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.3fr,1.2fr] gap-4 mb-6">
              {/* Mode selector */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-2">
                  Mode
                </label>
                <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode("publish")}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                      mode === "publish"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("upload")}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                      mode === "upload"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    Upload only
                  </button>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                  Privacy
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/40"
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                >
                  <option value="PUBLIC_TO_EVERYONE">Public</option>
                  <option value="FRIENDS">Friends only</option>
                  <option value="SELF_ONLY">Private</option>
                </select>
              </div>
            </div>

            {/* Caption */}
            <div className="mb-6">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                Caption (used when publishing)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/40"
                placeholder="Write your caption here..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            {/* Upload Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading
                  ? mode === "publish"
                    ? "Publishing…"
                    : "Uploading…"
                  : mode === "publish"
                  ? "Publish to TikTok"
                  : "Upload to TikTok inbox"}
              </button>

              <div className="text-xs text-slate-500 min-h-[1.5rem]">
                {status && <span>{status}</span>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TikTokConnectButton({ userData, hasValidTikTokToken }) {
  console.log("userdasta", userData);

  const handleClick = () => {
    // This endpoint redirects to TikTok OAuth
    window.location.href = `${apiBase}/tiktok/login/${userData._id}`;
  };

  const label = hasValidTikTokToken
    ? "Update TikTok connection"
    : "Continue with TikTok";

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-900"
      type="button"
    >
      <span>{label}</span>
    </button>
  );
}
