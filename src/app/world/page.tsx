"use client";

import dynamic from "next/dynamic";

const Game = dynamic(() => import("../../components/Game"), {
  ssr: false,
});

export default function WorldPage() {
  return (
    <main className="w-screen h-screen game-page">
      <Game />
    </main>
  );
}
