"use client";

import React from "react";
import { TONES, rgbCss, type ToneCount } from "@/lib/shapes";

export type TraceView = "photo" | "lines" | "shapes";

/* How the picture is shown over the paper: the photo, pencil lines, or flat
   tone shapes (2–4 tones, like squinting at it). Big tap targets, one row,
   plus a tone row only while Shapes is on. */

const VIEWS: { id: TraceView; label: string }[] = [
  { id: "photo", label: "Photo" },
  { id: "lines", label: "Lines" },
  { id: "shapes", label: "Shapes" },
];

export default function TraceViewPicker({
  view,
  tones,
  busy,
  onPick,
  onTones,
}: {
  view: TraceView;
  tones: ToneCount;
  /** The view being prepared, if any (shows "…" on it). */
  busy: TraceView | null;
  onPick: (view: TraceView) => void;
  onTones: (tones: ToneCount) => void;
}) {
  return (
    <div style={{ padding: "10px 12px 2px", maxWidth: 480, margin: "0 auto" }}>
      <div
        role="radiogroup"
        aria-label="Show the picture as"
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.08)",
          borderRadius: 999,
          padding: 3,
        }}
      >
        {VIEWS.map((v) => {
          const selected = view === v.id;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onPick(v.id)}
              disabled={busy !== null}
              style={{
                flex: 1,
                minHeight: 40,
                border: "none",
                borderRadius: 999,
                background: selected ? "#fff" : "transparent",
                color: selected ? "#111" : "rgba(255,255,255,0.85)",
                fontSize: 15,
                fontWeight: 600,
                cursor: busy ? "wait" : "pointer",
                fontFamily: "inherit",
                WebkitTapHighlightColor: "transparent",
                transition: "background 0.15s ease",
              }}
            >
              {busy === v.id ? "…" : v.label}
            </button>
          );
        })}
      </div>

      {view === "shapes" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          <div role="radiogroup" aria-label="Number of tones" style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {([2, 3, 4] as ToneCount[]).map((n) => {
              const selected = tones === n;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${n} tones`}
                  onClick={() => onTones(n)}
                  disabled={busy !== null}
                  style={{
                    minWidth: 40,
                    minHeight: 36,
                    borderRadius: 999,
                    border: `1.5px solid ${selected ? "#ffcf41" : "rgba(255,255,255,0.25)"}`,
                    background: selected ? "#ffcf41" : "transparent",
                    color: selected ? "#2c2416" : "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div
            style={{ display: "flex", gap: 8, flexShrink: 0 }}
            aria-label={`Tones: ${TONES[tones].map((t) => t.name).join(", ")}`}
          >
            {TONES[tones].map((t) => (
              <span
                key={t.name}
                title={t.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  whiteSpace: "nowrap",
                }}
              >
                <i
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: rgbCss(t.rgb),
                    border: "1px solid rgba(255,255,255,0.3)",
                    display: "block",
                  }}
                />
                {tones === 4 ? t.short : t.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
