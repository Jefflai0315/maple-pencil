"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Game as PhaserGame } from "phaser";
import { SketchCanvas } from "./SketchCanvas";
import { Navbar } from "./Navbar";

const GameComponent = () => {
  const gameRef = useRef<PhaserGame | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSketchOpen, setIsSketchOpen] = useState(false);

  useEffect(() => {
    const initGame = async () => {
      // Only initialize if we don't have a game instance and we're in the browser
      if (
        typeof window !== "undefined" &&
        !gameRef.current &&
        containerRef.current
      ) {
        try {
          const Phaser = (await import("phaser")).default;
          const { config } = await import("../game/config");
          console.log("Creating Phaser game instance...");
          gameRef.current = new Phaser.Game({
            ...config,
            parent: containerRef.current,
          });
          console.log("Game instance created successfully");
        } catch (error) {
          console.error("Error initializing game:", error);
        }
      }
    };

    initGame();

    // Add event listener for sketch canvas
    const handleSketchOpen = () => setIsSketchOpen(true);
    window.addEventListener("openSketchCanvas", handleSketchOpen);

    return () => {
      if (gameRef.current) {
        console.log("Destroying game instance...");
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      window.removeEventListener("openSketchCanvas", handleSketchOpen);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} id="game-container" />
      <Navbar />
      <SketchCanvas
        isOpen={isSketchOpen}
        onClose={() => setIsSketchOpen(false)}
      />
    </>
  );
};

// Disable SSR for this component
export default dynamic(() => Promise.resolve(GameComponent), {
  ssr: false,
});
