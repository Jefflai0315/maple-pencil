"use client";

import React, { useEffect, useState } from "react";

export interface RecordedVideo {
  url: string;
  file: File;
}

/* Shown after a recording stops. Saving needs a real tap: iPhone Safari only
   opens the share sheet (with "Save Video" → Photos) from a user gesture, so
   we never try to save automatically. */
export default function RecordingSheet({
  video,
  onClose,
}: {
  video: RecordedVideo;
  onClose: () => void;
}) {
  const [canShare, setCanShare] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCanShare(
        typeof navigator !== "undefined" &&
          typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [video.file] })
      );
    } catch {
      setCanShare(false);
    }
  }, [video.file]);

  const share = async () => {
    try {
      await navigator.share({ files: [video.file], title: "My drawing" });
      setMessage("Saved! Look in your Photos or the app you chose.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Sharing didn't work here. Try Download instead.");
    }
  };

  const btn: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 999,
    fontSize: 16,
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    fontFamily: "inherit",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your video is ready"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100040,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#161616",
          borderRadius: "24px 24px 0 0",
          padding: "18px 16px calc(18px + env(safe-area-inset-bottom))",
          color: "#fff",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>Your video is ready</h2>
        <video
          src={video.url}
          controls
          playsInline
          muted
          style={{ width: "100%", maxHeight: "40vh", borderRadius: 14, background: "#000", display: "block" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          {canShare && (
            <button type="button" onClick={share} style={{ ...btn, background: "#e0473c", color: "#fff" }}>
              Save to Photos / Share
            </button>
          )}
          <a
            href={video.url}
            download={video.file.name}
            style={{
              ...btn,
              background: canShare ? "transparent" : "#e0473c",
              color: "#fff",
              border: canShare ? "1.5px solid rgba(255,255,255,0.3)" : "none",
            }}
          >
            Download
          </a>
          <button
            type="button"
            onClick={onClose}
            style={{ ...btn, background: "transparent", color: "rgba(255,255,255,0.75)", minHeight: 44 }}
          >
            Close
          </button>
        </div>
        {message && (
          <p style={{ margin: "10px 0 0", fontSize: 14, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
