"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Game as PhaserGame } from "phaser";
import { SketchCanvas } from "./SketchCanvas";
import { Navbar } from "./Navbar";
import WebcamContainer from "./WebcamContainer";
import ARTraceToolContainer from "./ARTraceToolContainer";

const GameComponent = () => {
  const gameRef = useRef<PhaserGame | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSketchOpen, setIsSketchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");

  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>;
    let dotsInterval: ReturnType<typeof setInterval>;

    const simulateProgress = () => {
      let progress = 0;
      progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress > 90) {
          progress = 90; // Stop at 90% until game actually loads
        }
        setLoadingProgress(progress);
      }, 200);
    };

    const animateLoadingText = () => {
      let dotCount = 0;
      dotsInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        const dots = ".".repeat(dotCount);
        setLoadingText(`Loading Game${dots}`);
      }, 500);
    };

    const initGame = async () => {
      // Start loading animations
      simulateProgress();
      animateLoadingText();

      // Small delay to ensure loading screen is visible
      await new Promise(resolve => setTimeout(resolve, 1000));

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
          
          // Complete loading
          setLoadingProgress(100);
          setLoadingText("Game Ready!");
          
          // Small delay to show completion
          setTimeout(() => {
            setIsLoading(false);
            clearInterval(progressInterval);
            clearInterval(dotsInterval);
          }, 500);
        } catch (error) {
          console.error("Error initializing game:", error);
          setLoadingText("Error loading game");
          clearInterval(progressInterval);
          clearInterval(dotsInterval);
        }
      }
    };

    initGame();

    // Add event listener for sketch canvas
    const handleSketchOpen = () => setIsSketchOpen(true);
    window.addEventListener("openSketchCanvas", handleSketchOpen);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
      if (gameRef.current) {
        console.log("Destroying game instance...");
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      window.removeEventListener("openSketchCanvas", handleSketchOpen);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 text-center">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-2 drop-shadow-lg">
              Playing with Pencil
            </h1>
            <p className="text-xl text-white/90 drop-shadow-md">
              Entering the Creative World
            </p>
          </div>

          {/* Character Animation */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-white rounded-full animate-bounce shadow-2xl flex items-center justify-center">
                <div className="text-4xl">✏️</div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-ping animation-delay-1000"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="mb-6">
            <p className="text-2xl text-white font-semibold drop-shadow-md">
              {loadingText}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-80 max-w-md mx-auto">
            <div className="bg-white/30 rounded-full h-3 mb-4 overflow-hidden backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-pink-400 h-full rounded-full transition-all duration-300 ease-out shadow-lg"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-white/80 text-sm">
              {Math.round(loadingProgress)}%
            </p>
          </div>

          {/* Tips */}
          <div className="mt-8 text-white/70 text-sm max-w-md mx-auto">
            <p>🎨 Get ready to explore and create amazing sketches!</p>
          </div>
        </div>

        {/* Hidden game container */}
        <div ref={containerRef} className="absolute inset-0 pointer-events-none opacity-0" />
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} id="game-container" />
      <Navbar />
      <SketchCanvas
        isOpen={isSketchOpen}
        onClose={() => setIsSketchOpen(false)}
      />
      <ARTraceToolContainer />
      <WebcamContainer />
    </>
  );
};

// Disable SSR for this component
export default dynamic(() => Promise.resolve(GameComponent), {
  ssr: false,
});
