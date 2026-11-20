"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  IconBolt,
  IconBrush,
  IconDots,
  IconLock,
  IconLockOpen,
  IconPhoto,
  IconPlayerStopFilled,
  IconStack2,
  IconVideo,
  IconWand,
  IconX,
} from "@tabler/icons-react";

/* Big, labelled, thumb-friendly buttons for the trace tool. Only the basics
   are on the bar; the extras live under "More" with a one-line explanation,
   so first-time users aren't faced with six cryptic icons. */

type Tone = "default" | "active" | "locked" | "danger";

const TONES: Record<Tone, { bg: string; border: string; color: string }> = {
  default: { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.22)", color: "#fff" },
  active: { bg: "rgba(255,255,255,0.92)", border: "#fff", color: "#111" },
  locked: { bg: "rgba(255,111,30,0.18)", border: "#ff6f1e", color: "#ffb385" },
  danger: { bg: "rgba(244,67,54,0.2)", border: "#f44336", color: "#ff8a80" },
};

export function ToolButton({
  icon,
  label,
  onClick,
  tone = "default",
  disabled,
  badge,
  ariaPressed,
  htmlFor,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  tone?: Tone;
  disabled?: boolean;
  badge?: boolean;
  ariaPressed?: boolean;
  /** Render as a <label> for a file input instead of a button. */
  htmlFor?: string;
}) {
  const t = TONES[tone];
  const circle = (
    <span
      style={{
        position: "relative",
        width: 48,
        height: 48,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: t.bg,
        border: `1.5px solid ${t.border}`,
        color: t.color,
        transition: "background 0.15s ease, transform 0.1s ease",
      }}
    >
      {icon}
      {badge && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#ff6f1e",
            border: "2px solid #111",
          }}
        />
      )}
    </span>
  );
  const text = (
    <span
      style={{
        fontSize: 12,
        lineHeight: 1.2,
        color: disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
  const common: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    minWidth: 52,
    padding: 0,
    background: "none",
    border: "none",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    color: "inherit",
    font: "inherit",
  };

  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} style={common} aria-label={label}>
        {circle}
        {text}
      </label>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      style={common}
    >
      {circle}
      {text}
    </button>
  );
}

function MoreRow({
  icon,
  title,
  hint,
  on,
  onClick,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  on?: boolean;
  onClick: () => void;
  tone?: "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        minHeight: 60,
        padding: "10px 14px",
        background: on ? "rgba(255,255,255,0.1)" : "transparent",
        border: "none",
        borderRadius: 14,
        color: "#fff",
        textAlign: "left",
        cursor: "pointer",
        font: "inherit",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: tone === "danger" ? "rgba(244,67,54,0.2)" : "rgba(255,255,255,0.08)",
          color: tone === "danger" ? "#ff8a80" : "#fff",
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: 600 }}>{title}</span>
        <span style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
          {hint}
        </span>
      </span>
      {on !== undefined && (
        <span
          aria-hidden
          style={{
            width: 40,
            height: 24,
            borderRadius: 999,
            background: on ? "#ff6f1e" : "rgba(255,255,255,0.2)",
            position: "relative",
            flexShrink: 0,
            transition: "background 0.15s ease",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: on ? 19 : 3,
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#fff",
              transition: "left 0.15s ease",
            }}
          />
        </span>
      )}
    </button>
  );
}

export interface TraceToolbarProps {
  fileInputId: string;
  hasImage: boolean;
  hasSourcePhoto: boolean;
  isSketchMode: boolean;
  isConvertingToSketch: boolean;
  onToggleSketch: () => void;
  isFixed: boolean;
  onToggleFixed: () => void;
  strobeActive: boolean;
  onToggleStrobe: () => void;
  onOpenLayers: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  showAi?: boolean;
  aiBusy?: boolean;
  onToggleAi?: () => void;
  onClose?: () => void;
  /** Rear camera lens shown in the preview; omit to hide the switch (e.g. front camera). */
  lens?: "0.5" | "1";
  onToggleLens?: () => void;
}

export default function TraceToolbar(p: TraceToolbarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close the "More" sheet when tapping anywhere else.
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: PointerEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [moreOpen]);

  const pick = (fn: () => void) => () => {
    fn();
    setMoreOpen(false);
  };

  return (
    <div ref={sheetRef} style={{ position: "relative" }}>
      {moreOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 8,
            left: 8,
            maxWidth: 420,
            marginLeft: "auto",
            background: "rgba(24,24,24,0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 20,
            padding: 6,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}
        >
          {p.hasImage && (
            <MoreRow
              icon={<IconBolt size={20} />}
              title="Blink"
              hint="Flash the picture on and off to check your lines"
              on={p.strobeActive}
              onClick={p.onToggleStrobe}
            />
          )}
          {p.hasImage && (
            <MoreRow
              icon={<IconStack2 size={20} />}
              title="Colour layers"
              hint="Trace one colour at a time"
              onClick={pick(p.onOpenLayers)}
            />
          )}
          <MoreRow
            icon={p.isRecording ? <IconPlayerStopFilled size={18} /> : <IconVideo size={20} />}
            title={p.isRecording ? "Stop recording" : "Record a video"}
            hint={p.isRecording ? "Save the video of your drawing" : "Film your drawing as you go"}
            tone={p.isRecording ? "danger" : undefined}
            onClick={pick(p.onToggleRecording)}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-around",
          gap: 4,
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        <ToolButton
          icon={<IconPhoto size={22} />}
          label={p.hasImage ? "New photo" : "Photo"}
          htmlFor={p.fileInputId}
        />
        {p.hasSourcePhoto && (
          <ToolButton
            icon={<IconBrush size={22} />}
            label={p.isConvertingToSketch ? "Working…" : p.isSketchMode ? "Original" : "Sketch"}
            onClick={p.onToggleSketch}
            disabled={p.isConvertingToSketch}
            tone={p.isSketchMode ? "active" : "default"}
            ariaPressed={p.isSketchMode}
          />
        )}
        {p.hasImage && (
          <ToolButton
            icon={p.isFixed ? <IconLock size={22} /> : <IconLockOpen size={22} />}
            label={p.isFixed ? "Locked" : "Lock"}
            onClick={p.onToggleFixed}
            tone={p.isFixed ? "locked" : "default"}
            ariaPressed={p.isFixed}
          />
        )}
        {p.lens && (
          <ToolButton
            icon={
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>
                {p.lens === "1" ? "1×" : "0.5"}
              </span>
            }
            label="Lens"
            onClick={p.onToggleLens}
          />
        )}
        {p.showAi && (
          <ToolButton
            icon={<IconWand size={22} />}
            label="AI"
            onClick={p.onToggleAi}
            disabled={p.aiBusy}
          />
        )}
        {p.isRecording && (
          <ToolButton
            icon={<IconPlayerStopFilled size={20} />}
            label="Stop"
            onClick={p.onToggleRecording}
            tone="danger"
          />
        )}
        <ToolButton
          icon={<IconDots size={22} />}
          label="More"
          onClick={() => setMoreOpen((v) => !v)}
          tone={moreOpen ? "active" : "default"}
          badge={p.strobeActive}
          ariaPressed={moreOpen}
        />
        {p.onClose && (
          <ToolButton icon={<IconX size={20} />} label="Close" onClick={p.onClose} />
        )}
      </div>
    </div>
  );
}
