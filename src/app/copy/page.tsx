"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { LESSONS } from "@/data/lessons";

// The trace tool needs the camera and the screen size, so it only renders in
// the browser (server-rendering it caused mismatches on phones).
const ARTraceTool = dynamic(() => import("@/components/ARTraceTool"), {
  ssr: false,
  loading: () => <div style={{ position: "fixed", inset: 0, background: "#000" }} />,
});

function CopyPageContent() {
  const searchParams = useSearchParams();
  const course = searchParams.get("course");
  const lesson = (course && LESSONS[course]) || null;

  return <ARTraceTool courseLesson={lesson} />;
}

export default function CopyPage() {
  return (
    <Suspense fallback={null}>
      <CopyPageContent />
    </Suspense>
  );
}
