import Link from "next/link";
import { FACE_COURSE } from "@/data/faceCourse";

export default function CoursePage() {
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href="/app"
          className="text-white/40 hover:text-white/70 text-sm mb-8 inline-block transition-colors"
        >
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">Draw a Face in 5 Days</h1>
        <p className="text-white/55 mb-10 leading-relaxed">
          Each day focuses on one part of the face. Open a lesson, trace on paper
          with your phone camera, and build up to a full portrait.
        </p>

        <div className="flex flex-col gap-4">
          {FACE_COURSE.map((lesson) => (
            <Link
              key={lesson.day}
              href={`/copy?course=face&day=${lesson.day}`}
              className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 hover:border-white/25 hover:bg-white/[0.03] transition-all group"
            >
              <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#faf8f5] shrink-0 border border-white/10">
                <img
                  src={lesson.imagePath}
                  alt={lesson.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
                    Day {lesson.day}
                  </span>
                </div>
                <h2 className="font-semibold text-lg group-hover:text-white transition-colors">
                  {lesson.title}
                </h2>
                <p className="text-white/50 text-sm">{lesson.subtitle}</p>
                <p className="text-white/35 text-xs mt-2 leading-relaxed">
                  {lesson.tip}
                </p>
              </div>
              <span className="text-white/30 group-hover:text-white/60 text-xl transition-colors shrink-0">
                →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
          <p className="text-white/55 text-sm mb-4">
            Done the course? Upload your own photos and trace anything.
          </p>
          <Link
            href="/copy"
            className="inline-block px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Open trace tool
          </Link>
        </div>
      </div>
    </div>
  );
}
