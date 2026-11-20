"use client";

import { useState } from "react";
import Link from "next/link";
import { FACE_COURSE } from "@/data/faceCourse";

function WaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading" || status === "success"}
        className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 text-sm"
      />
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {status === "loading" ? "Joining…" : status === "success" ? "Joined!" : "Join waitlist"}
      </button>
      {(status === "success" || status === "error") && (
        <p className={`text-sm w-full sm:absolute sm:mt-14 ${status === "error" ? "text-red-400" : "text-green-400"}`}>
          {message}
        </p>
      )}
    </form>
  );
}

export default function AppLandingPage() {
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="relative px-6 pt-16 pb-20 max-w-3xl mx-auto text-center">
        <p className="text-white/50 text-sm tracking-widest uppercase mb-4">
          Playing with Pencil
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
          Learn to draw
          <br />
          <span className="text-white/70">with your phone</span>
        </h1>
        <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          Point your camera at paper. Trace any image overlaid in real time.
          Turn photos into sketches in one tap.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/copy"
            className="px-8 py-4 rounded-full bg-white text-black font-semibold text-base hover:bg-white/90 transition-colors"
          >
            Start tracing — free
          </Link>
          <Link
            href="/app/course"
            className="px-8 py-4 rounded-full border border-white/25 text-white font-semibold text-base hover:bg-white/5 transition-colors"
          >
            5-day face course
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 border-t border-white/8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload or pick a lesson",
                body: "Use your own photo or start the free 5-day portrait course.",
              },
              {
                step: "2",
                title: "Photo → sketch",
                body: "One tap converts any photo into clean line art ready to trace.",
              },
              {
                step: "3",
                title: "Trace on paper",
                body: "Hold your phone over your sketchbook. Adjust opacity, lock, and draw.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold mb-4 mx-auto sm:mx-0">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Killer hook */}
      <section className="px-6 py-16 border-t border-white/8 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs text-white/60 mb-6 tracking-wide uppercase">
            Magic moment
          </div>
          <h2 className="text-3xl font-bold mb-4">Any photo → sketch</h2>
          <p className="text-white/55 mb-8 max-w-md mx-auto leading-relaxed">
            Selfie, pet, reference photo — convert it to traceable line art
            instantly. No AI credits needed.
          </p>
          <Link
            href="/copy"
            className="inline-block px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            Try it now
          </Link>
        </div>
      </section>

      {/* Course preview */}
      <section className="px-6 py-16 border-t border-white/8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center">5-day face course</h2>
          <p className="text-white/50 text-center mb-10 text-sm">
            Free guided lessons — one feature at a time
          </p>
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {FACE_COURSE.map((lesson) => (
              <Link
                key={lesson.day}
                href={`/copy?course=face&day=${lesson.day}`}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors bg-[#faf8f5]">
                  <img
                    src={lesson.imagePath}
                    alt={lesson.title}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">
                  Day {lesson.day}
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/app/course"
              className="text-sm text-white/60 hover:text-white underline underline-offset-4 transition-colors"
            >
              View full course →
            </Link>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="px-6 py-16 border-t border-white/8 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Support the mission</h2>
          <p className="text-white/55 mb-2 max-w-md mx-auto leading-relaxed">
            The tool is free, and always will be. If it helped you, you can chip
            in with PayNow — $3, $5, or any amount.
          </p>
          <p className="text-white/35 text-sm mb-8">
            Your support keeps me sketching people for free, including folks who
            could use a little kindness.
          </p>
          <Link
            href="/app/support"
            className="inline-block px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            Become a supporter
          </Link>
          <div className="mt-10 pt-8 border-t border-white/8">
            <p className="text-white/35 text-sm mb-4">
              Want early access to Pro (weekly challenges, lesson packs)? Leave
              your email.
            </p>
            <div className="relative flex justify-center">
              <WaitlistForm source="app-landing" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/8 text-center text-white/30 text-xs">
        <a
          href="https://www.playingwithpencil.art"
          className="hover:text-white/60 transition-colors"
        >
          playingwithpencil.art
        </a>
        {" · "}
        <Link href="/copy" className="hover:text-white/60 transition-colors">
          Open trace tool
        </Link>
        {" · "}
        <Link href="/app/support" className="hover:text-white/60 transition-colors">
          Support
        </Link>
      </footer>
    </div>
  );
}
