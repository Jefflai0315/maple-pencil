"use client";

import React from "react";
import Link from "next/link";
import { IconPhoto, IconEye } from "@tabler/icons-react";
import { EYE_LESSON } from "@/data/lessons";

/* First screen of the trace tool, shown until a picture is loaded: one big
   obvious action ("Choose a photo"), the eye from Jeff's reel as the other
   path, and the one set-up tip people need (prop the phone above the paper). */

export default function TraceWelcome({
  fileInputId,
  bottomOffset = 0,
}: {
  fileInputId: string;
  bottomOffset?: number;
}) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        bottom: bottomOffset,
        // Above the camera (99998), below the toolbar (100013).
        zIndex: 100011,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "calc(16px + env(safe-area-inset-top)) 16px 16px",
        pointerEvents: "none",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          width: "100%",
          maxWidth: 380,
          maxHeight: "100%",
          overflowY: "auto",
          background: "rgba(18,18,18,0.88)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: "22px 18px 18px",
          color: "#fff",
          boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, margin: "0 0 6px" }}>
          What would you like to draw?
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: "rgba(255,255,255,0.7)", margin: "0 0 18px" }}>
          Pick a picture. It appears over your camera so you can trace it onto paper.
        </p>

        <label
          htmlFor={fileInputId}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            minHeight: 56,
            borderRadius: 999,
            background: "#e0473c",
            color: "#fff",
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <IconPhoto size={22} />
          Choose a photo
        </label>

        <Link
          href={`/copy?course=${EYE_LESSON.id}`}
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            minHeight: 64,
            padding: "8px 14px 8px 8px",
            borderRadius: 18,
            border: "1.5px solid rgba(255,255,255,0.25)",
            color: "#fff",
            textDecoration: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={EYE_LESSON.imagePath}
            alt=""
            width={64}
            height={46}
            style={{ borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
          />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 600 }}>
              <IconEye size={18} /> Draw the eye with me
            </span>
            <span style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              From the 4-step reel: box, lines, tones, blend
            </span>
          </span>
        </Link>

        <div
          style={{
            marginTop: 18,
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            fontSize: 14,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          <strong style={{ color: "#fff" }}>Tip:</strong> rest your phone about 30 cm above the paper, on a
          glass or a stack of books, so both hands are free.
        </div>
      </div>
    </div>
  );
}
