"use client";

import dynamic from "next/dynamic";
import ErrorBoundary from "../../components/ErrorBoundary";

const Game = dynamic(() => import("../../components/Game"), {
  ssr: false,
});

export default function WorldPage() {
  return (
    <ErrorBoundary>
      <main className="w-screen h-screen game-page">
        <Game />
      </main>
    </ErrorBoundary>
  );
}
