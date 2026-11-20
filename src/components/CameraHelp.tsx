"use client";

import React from "react";

export type CameraProblem =
  | "denied"
  | "insecure"
  | "notfound"
  | "busy"
  | "unsupported"
  | "unknown";

function platform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  if (/Android/i.test(ua)) return "android";
  return "other";
}

const COPY: Record<CameraProblem, { title: string; body: string }> = {
  denied: {
    title: "Camera is blocked",
    body: "To trace, this page needs your camera. Your camera feed stays on your phone; nothing is uploaded.",
  },
  insecure: {
    title: "Camera needs a secure link",
    body: "Open this page with https:// at the start of the address, then try again.",
  },
  notfound: {
    title: "No camera found",
    body: "We couldn't find a back camera on this device. Try on your phone.",
  },
  busy: {
    title: "Camera is busy",
    body: "Another app is using the camera. Close it (video calls, camera app), then try again.",
  },
  unsupported: {
    title: "This browser can't use the camera",
    body: "Open this page in Safari on iPhone, or Chrome on Android.",
  },
  unknown: {
    title: "Couldn't start the camera",
    body: "Something went wrong starting the camera. Try again, or reload the page.",
  },
};

const STEPS: Record<"ios" | "android" | "other", string[]> = {
  ios: [
    "Tap aA (or the icon) at the left of the address bar",
    "Tap Website Settings",
    "Set Camera to Allow",
  ],
  android: [
    "Tap the icon at the left of the address bar",
    "Tap Permissions (or Site settings)",
    "Turn Camera on",
  ],
  other: [
    "Click the camera or lock icon in the address bar",
    "Allow the camera for this site",
  ],
};

export default function CameraHelp({
  kind,
  bottomOffset = 0,
  onRetry,
}: {
  kind: CameraProblem | string;
  bottomOffset?: number;
  onRetry: () => void;
}) {
  const problem = (kind in COPY ? kind : "unknown") as CameraProblem;
  const { title, body } = COPY[problem];
  const steps = problem === "denied" ? STEPS[platform()] : null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        bottom: bottomOffset,
        // Above the camera (99998) and the trace picture (100010), below the
        // bottom toolbar (100013) so Upload stays usable.
        zIndex: 100012,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          width: "100%",
          maxWidth: 360,
          background: "rgba(20,20,20,0.92)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: "22px 20px",
          color: "#fff",
          textAlign: "left",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          fontFamily: "inherit",
        }}
      >
        <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 12 }} aria-hidden>
          📷
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>{title}</h2>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: "rgba(255,255,255,0.75)", margin: 0 }}>
          {body}
        </p>
        {steps && (
          <ol
            style={{
              margin: "14px 0 0",
              paddingLeft: 20,
              listStyle: "decimal",
              fontSize: 15,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: 18,
            width: "100%",
            minHeight: 48,
            borderRadius: 999,
            border: "none",
            background: "#fff",
            color: "#111",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
