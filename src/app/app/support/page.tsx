"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { buildPayNowPayload, PWP_PAYNOW } from "@/data/paynow";

const SUGGESTED = [
  { amount: 3, emoji: "✏️", label: "A pencil" },
  { amount: 5, emoji: "📓", label: "A sketchbook page" },
  { amount: 10, emoji: "🎨", label: "A free portrait for someone" },
];

function SupportQR() {
  const [selected, setSelected] = useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const payload = useMemo(
    () =>
      buildPayNowPayload({
        ...PWP_PAYNOW,
        amount: selected ?? undefined,
        reference: "Support",
      }),
    [selected]
  );

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
      color: { dark: "#0a0a0a", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch((err) => console.error("QR generation failed:", err));
    return () => {
      active = false;
    };
  }, [payload]);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-3xl p-4 shadow-2xl">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="PayNow QR for Playing with Pencil"
            className="w-64 h-64"
          />
        ) : (
          <div className="w-64 h-64 animate-pulse bg-black/5 rounded-xl" />
        )}
      </div>

      <p className="text-white/50 text-sm mt-4 text-center">
        Scan with any bank app · PayNow to UEN{" "}
        <span className="text-white/80 font-mono">{PWP_PAYNOW.proxyValue}</span>
      </p>

      <div className="flex flex-wrap gap-2 justify-center mt-6">
        <button
          onClick={() => setSelected(null)}
          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
            selected === null
              ? "bg-white text-black border-white"
              : "border-white/20 text-white/70 hover:border-white/40"
          }`}
        >
          Any amount
        </button>
        {SUGGESTED.map((s) => (
          <button
            key={s.amount}
            onClick={() => setSelected(s.amount)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              selected === s.amount
                ? "bg-white text-black border-white"
                : "border-white/20 text-white/70 hover:border-white/40"
            }`}
          >
            {s.emoji} ${s.amount}
          </button>
        ))}
      </div>

      {selected !== null && (
        <p className="text-white/40 text-xs mt-3">
          {SUGGESTED.find((s) => s.amount === selected)?.label}
        </p>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href="/app"
          className="text-white/40 hover:text-white/70 text-sm mb-8 inline-block transition-colors"
        >
          ← Back
        </Link>

        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-white/50 text-sm tracking-widest uppercase mb-3">
            Playing with Pencil
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Become a supporter
          </h1>
          <p className="text-white/60 leading-relaxed max-w-md mx-auto">
            The trace tool is free, and always will be. If it helped you — or you
            just believe in the mission — you can chip in. Every bit keeps me
            sketching people for free.
          </p>
        </div>

        {/* PayNow QR */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 mb-10">
          <SupportQR />
        </div>

        {/* Why */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Why I&apos;m doing this</h2>
          <p className="text-white/60 leading-relaxed mb-3">
            I&apos;m Jeff — I draw people. At events, on the street, wherever there&apos;s
            a face and a story. Playing with Pencil started as a way to bring art
            and people together.
          </p>
          <p className="text-white/60 leading-relaxed">
            Your support doesn&apos;t buy features. It funds my time and materials so
            I can keep showing up and sketching people for free — including folks
            who could use a little kindness. When you support, you&apos;re part of
            that.
          </p>
        </section>

        {/* Kindness log */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Kindness log</h2>
            <span className="text-white/30 text-xs">Updated as I go</span>
          </div>
          <div className="rounded-2xl border border-dashed border-white/12 p-8 text-center">
            <p className="text-white/45 text-sm leading-relaxed">
              This is where I&apos;ll post the free sketches your support makes
              possible — photos, places, and short notes. First entries coming
              soon.
            </p>
          </div>
        </section>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/copy"
            className="flex-1 text-center px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Open the trace tool
          </Link>
          <Link
            href="/app/course"
            className="flex-1 text-center px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/5 transition-colors"
          >
            Try the 5-day course
          </Link>
        </div>

        <p className="text-white/25 text-xs text-center mt-8">
          Payments go to Playing with Pencil (UEN {PWP_PAYNOW.proxyValue}) via
          PayNow. Thank you for your kindness.
        </p>
      </div>
    </div>
  );
}
