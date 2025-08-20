"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconRefresh,
  IconPlayerPlay,
  IconX,
  IconBrush,
} from "@tabler/icons-react";
import Link from "next/link";
import { muralPromptThemes } from "../utils/constants";

interface MuralItem {
  id: string;
  imageUrl: string;
  videoUrl: string;
  fallbackVideoUrl?: string;
  gridPosition: number;
  timestamp: string;
  userDetails: {
    name: string;
    description: string;
  };
}

interface AnimationState {
  isPlaying: boolean;
  currentItem: MuralItem | null;
  animationPhase:
    | "idle"
    | "enlarging"
    | "video-playing"
    | "image-showing"
    | "shrinking"
    | "placing";
  clickedPosition?: { x: number; y: number; width: number; height: number };
}

const PROMPT_SPAWN_INTERVAL = 7500; // ms (slower spawn)

const PROMPT_DIRECTIONS = ["lr", "rl"] as const;
type PromptDirection = (typeof PROMPT_DIRECTIONS)[number];

export default function MuralPage() {
  const [muralItems, setMuralItems] = useState<MuralItem[]>([]);
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    currentItem: null,
    animationPhase: "idle",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const animationContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  // Add refs for timeouts and preloaded videos
  const animationTimeoutsRef = useRef<number[]>([]);
  const preloadedVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  // Add ref for floating prompt container
  const promptContainerRef = useRef<HTMLDivElement>(null);
  // Add state to track video fallback
  const [videoErrorState, setVideoErrorState] = useState<
    "none" | "main-failed" | "fallback-failed"
  >("none");

  // Floating prompt words state
  const [floatingPrompts, setFloatingPrompts] = useState<
    {
      key: string;
      text: string;
      startTop: number;
      startLeft: number;
      endTop: number;
      endLeft: number;
      fontSize: number;
      rotate: number;
      duration: number;
      direction: PromptDirection;
      wobbleAmp: number;
      wobbleFreq: number;
      speed: number;
    }[]
  >([]);

  // Helper to get a random prompt config
  function getRandomPromptConfig() {
    const allPrompts = muralPromptThemes.flatMap((theme) => theme.prompts);
    const text = allPrompts[Math.floor(Math.random() * allPrompts.length)];
    const directionIdx = Math.floor(Math.random() * 2); // Only lr, rl
    const direction: PromptDirection = PROMPT_DIRECTIONS[directionIdx];
    // Restrict to top 8-25%
    const top = Math.random() * 15 + 5; // 10% to 20%
    const startTop = top,
      endTop = top;
    let startLeft, endLeft;
    if (direction === "lr") {
      startLeft = -20;
      endLeft = 110;
    } else {
      // rl
      startLeft = 110;
      endLeft = -20;
    }
    // --- NEW: Calculate duration based on container width and random speed ---
    const containerWidth =
      promptContainerRef.current?.offsetWidth || window.innerWidth;
    const travelDistance = containerWidth * 1.3; // from -20% to 110%
    const minSpeed = 60; // px/sec
    const maxSpeed = 100; // px/sec
    const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
    const duration = (travelDistance / speed) * 1000; // ms

    // Organic motion: random wobble amplitude (px/em) and frequency
    const wobbleAmp = Math.random() * 12 + 8; // 8-20px
    const wobbleFreq = Math.random() * 1.2 + 0.7; // 0.7-1.9 (cycles per anim)
    return {
      key: `${Date.now()}-${Math.random()}`,
      text,
      startTop,
      startLeft,
      endTop,
      endLeft,
      fontSize: Math.random() * 0.8 + 1.1,
      rotate: Math.random() * 16 - 8,
      duration, // use calculated duration
      speed, // store speed for possible future use
      direction,
      wobbleAmp,
      wobbleFreq,
    };
  }

  // Spawn new prompts at intervals
  useEffect(() => {
    const spawnPrompt = () => {
      const newPrompt = getRandomPromptConfig();
      console.log("Spawning new prompt:", newPrompt.text);
      setFloatingPrompts((prev) => [...prev, newPrompt].slice(-4)); // keep at most 4 prompts at a time
    };
    spawnPrompt();
    const interval = setInterval(spawnPrompt, PROMPT_SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Remove prompts after their animation ends
  useEffect(() => {
    if (floatingPrompts.length === 0) return;
    console.log("Current floating prompts:", floatingPrompts.length);
    const timers = floatingPrompts.map((prompt) =>
      setTimeout(() => {
        setFloatingPrompts((prev) => prev.filter((p) => p.key !== prompt.key));
      }, prompt.duration)
    );
    return () => timers.forEach(clearTimeout);
  }, [floatingPrompts]);

  // Responsive grid dimensions
  const WANTED_CELLS = 150;
  const MOBILE_GRID_ROWS = Math.floor(WANTED_CELLS / 6);
  const MOBILE_GRID_COLS = 6;
  const DESKTOP_GRID_ROWS = Math.floor(WANTED_CELLS / 16);
  const DESKTOP_GRID_COLS = 16;

  const GRID_ROWS = isMobile ? MOBILE_GRID_ROWS : DESKTOP_GRID_ROWS;
  const GRID_COLS = isMobile ? MOBILE_GRID_COLS : DESKTOP_GRID_COLS;
  const TOTAL_CELLS = GRID_ROWS * GRID_COLS;

  // listen to shortcut key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "e" && !isLoading) {
        event.preventDefault();
        handleRefresh();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading]);

  useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.playbackRate = 0.9; // Set to your desired speed (e.g., 0.5 for half speed)
    }
  }, [animationState.animationPhase]);

  useEffect(() => {
    // Load mural items from API
    console.log("Mural page mounted, fetching items...");
    fetchMuralItems();
  }, []);

  const fetchMuralItems = async () => {
    try {
      console.log("Fetching mural items from Cloudinary API...");
      const response = await fetch("/api/upload-mongodb");
      console.log("API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("API response data:", data);

        if (data.success && data.data && Array.isArray(data.data)) {
          console.log("Setting mural items:", data.data);
          setMuralItems(data.data);
        } else {
          console.warn("API returned invalid data format");
          setMuralItems([]); // Empty array instead of mock data
        }
      } else {
        console.error("Failed to fetch mural items, status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setMuralItems([]); // Empty array instead of mock data
      }
    } catch (error) {
      console.error("Error fetching mural items:", error);
      setMuralItems([]); // Empty array instead of mock data
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchMuralItems();
    } catch (error) {
      console.error("Failed to refresh mural:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAnimation = (item: MuralItem, event: React.MouseEvent) => {
    // Clear all previous animation timeouts
    animationTimeoutsRef.current.forEach((id) => clearTimeout(id));
    animationTimeoutsRef.current = [];

    // Get the clicked element's position and dimensions
    const clickedElement = event.currentTarget as HTMLElement;
    const rect = clickedElement.getBoundingClientRect();

    setAnimationState({
      isPlaying: true,
      currentItem: item,
      animationPhase: "enlarging",
      clickedPosition: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      },
    });

    // Enlarge animation (0.3s)
    const t1 = window.setTimeout(() => {
      setAnimationState((prev) => ({
        ...prev,
        animationPhase: "video-playing",
      }));

      // Simulate video playback (5s)
      const t2 = window.setTimeout(() => {
        setAnimationState((prev) => ({
          ...prev,
          animationPhase: "image-showing",
        }));

        // Show static image (0.3s)
        const t3 = window.setTimeout(() => {
          setAnimationState((prev) => ({
            ...prev,
            animationPhase: "shrinking",
          }));

          // Shrink back to grid (0.3s)
          const t4 = window.setTimeout(() => {
            setAnimationState({
              isPlaying: false,
              currentItem: null,
              animationPhase: "idle",
            });
          }, 300);
          animationTimeoutsRef.current.push(t4);
        }, 300);
        animationTimeoutsRef.current.push(t3);
      }, 5000);
      animationTimeoutsRef.current.push(t2);
    }, 300);
    animationTimeoutsRef.current.push(t1);
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      animationTimeoutsRef.current.forEach((id) => clearTimeout(id));
      animationTimeoutsRef.current = [];
    };
  }, []);

  // Preload video on hover
  const handleGridItemMouseEnter = (item: MuralItem) => {
    if (!item.videoUrl) return;
    if (preloadedVideosRef.current.has(item.videoUrl)) return;
    const video = document.createElement("video");
    video.src = item.videoUrl;
    video.preload = "auto";
    video.muted = true;
    video.style.display = "none";
    document.body.appendChild(video);
    preloadedVideosRef.current.set(item.videoUrl, video);
  };

  const handleGridItemMouseLeave = (item: MuralItem) => {
    if (!item.videoUrl) return;
    const video = preloadedVideosRef.current.get(item.videoUrl);
    if (video) {
      video.pause();
      video.remove();
      preloadedVideosRef.current.delete(item.videoUrl);
    }
  };

  const getAnimationStyles = () => {
    if (!animationState.clickedPosition) return {};

    const { x, y, width, height } = animationState.clickedPosition;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Mobile-responsive sizing
    const mobileMaxWidth = Math.min(window.innerWidth - 32, 350);
    const mobileMaxHeight = Math.min(window.innerHeight - 32, 350);
    const desktopMaxWidth = 700;
    const desktopMaxHeight = 700;

    switch (animationState.animationPhase) {
      case "enlarging":
        return {
          position: "fixed" as const,
          left: `${centerX}px`,
          top: `${centerY}px`,
          transform: "translate(-50%, -50%) scale(0.1)",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1000,
        };
      case "video-playing":
      case "image-showing":
        return {
          position: "fixed" as const,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(1)",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1000,
          maxWidth: isMobile ? `${mobileMaxWidth}px` : `${desktopMaxWidth}px`,
          maxHeight: isMobile
            ? `${mobileMaxHeight}px`
            : `${desktopMaxHeight}px`,
        };
      case "shrinking":
        return {
          position: "fixed" as const,
          left: `${centerX}px`,
          top: `${centerY}px`,
          transform: "translate(-50%, -50%) scale(0.1)",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1000,
        };
      default:
        return {};
    }
  };

  // Reset video error state when opening a new animation
  useEffect(() => {
    if (animationState.isPlaying) {
      setVideoErrorState("none");
    }
  }, [animationState.currentItem, animationState.isPlaying]);

  const PLANE_WIDTH = 220; // px, adjust to your plane image
  const FLAG_WIDTH = 350; // px, adjust to your flag image and desired text area
  const PLANE_HEIGHT = 120; // px, adjust to your images

  const pastelColors = [
    "#FFD6E0", // pink
    "#FFF5BA", // yellow
    "#B5EAD7", // mint
    "#C7CEEA", // lavender
    "#FFDAC1", // peach
    "#E2F0CB", // light green
    "#B5D8FA", // light blue
    "#FFB7B2", // coral
    "#D5C6E0", // purple
    "#F6DFEB", // blush
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes muralPromptFloat-lr {
          0% {
            opacity: 0;
            left: -20%;
            transform: translateY(0) scale(1) rotate(var(--rotate, 0deg));
          }
          10% {
            opacity: 1;
          }
          20% {
            transform: translateY(calc(var(--wobble-amp, 12px) * 1)) scale(1.04)
              rotate(var(--rotate, 0deg));
          }
          40% {
            transform: translateY(calc(var(--wobble-amp, 12px) * -1))
              scale(0.98) rotate(var(--rotate, 0deg));
          }
          60% {
            transform: translateY(calc(var(--wobble-amp, 12px) * 0.7))
              scale(1.02) rotate(var(--rotate, 0deg));
          }
          80% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(var(--rotate, 0deg));
          }
          100% {
            opacity: 0;
            left: 110%;
            transform: translateY(0) scale(1) rotate(var(--rotate, 0deg));
          }
        }
        @keyframes muralPromptFloat-rl {
          0% {
            opacity: 0;
            left: 110%;
            transform: translateY(0) scale(1) rotate(var(--rotate, 0deg));
          }
          10% {
            opacity: 1;
          }
          20% {
            transform: translateY(calc(var(--wobble-amp, 12px) * -1))
              scale(1.04) rotate(var(--rotate, 0deg));
          }
          40% {
            transform: translateY(calc(var(--wobble-amp, 12px) * 1)) scale(0.98)
              rotate(var(--rotate, 0deg));
          }
          60% {
            transform: translateY(calc(var(--wobble-amp, 12px) * -0.7))
              scale(1.02) rotate(var(--rotate, 0deg));
          }
          80% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(var(--rotate, 0deg));
          }
          100% {
            opacity: 0;
            left: -20%;
            transform: translateY(0) scale(1) rotate(var(--rotate, 0deg));
          }
        }

        @keyframes scroll-text {
          0% {
            transform: translateX(50%);
          }
          100% {
            transform: translateX(-260%);
          }
        }

        .animate-scroll-text {
          animation: scroll-text 25s linear infinite;
        }
      `}</style>
      <div
        className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-500 py-4 md:py-8 relative"
        style={{
          backgroundImage:
            animationState.animationPhase === "video-playing"
              ? undefined
              : "url('/images/mural-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        {/* Background video, always rendered and looping */}
        {animationState.animationPhase !== "video-playing" && (
          <video
            ref={bgVideoRef}
            autoPlay
            loop
            muted
            playsInline
            className="fixed inset-0 w-full h-full object-cover z-0 transition-opacity duration-700"
            style={{
              pointerEvents: "none",
              opacity: 1,
            }}
            src={
              isMobile
                ? "/videos/mural-bg-main-mobile.mp4"
                : "/videos/mural-bg-main-pc.mp4"
            }
            poster="/images/mural-background.png"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        {/* Floating animated prompts in the background */}
        <div
          ref={promptContainerRef}
          className="pointer-events-none select-none absolute inset-0 z-10"
        >
          {floatingPrompts.map((prompt) => {
            const style: React.CSSProperties & {
              [key: string]: string | number;
            } = {
              position: "absolute",
              top: `${prompt.startTop}%`,
              left: `${prompt.startLeft}%`,
              width: `${PLANE_WIDTH + FLAG_WIDTH}px`,
              height: `${PLANE_HEIGHT}px`,
              gap: "16px",
              zIndex: 0,
              animation: `muralPromptFloat-${prompt.direction} ${prompt.duration}ms linear forwards`,
              "--wobble-amp": `${prompt.wobbleAmp}px`,
              "--rotate": `${prompt.rotate}deg`,
              display: "flex",
              flexDirection: prompt.direction === "lr" ? "row-reverse" : "row",
              alignItems: "center",
              pointerEvents: "none",
              userSelect: "none",
            };
            return (
              <div key={prompt.key} style={style}>
                {/* Plane */}
                <img
                  src="/images/plane-only.png"
                  alt=""
                  style={{
                    width: `${PLANE_WIDTH}px`,
                    height: `${PLANE_HEIGHT}px`,
                    objectFit: "contain",
                    zIndex: 2,
                    transform:
                      prompt.direction === "rl" ? "none" : "scaleX(-1)",
                    pointerEvents: "none",
                    userSelect: "none",
                    filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.18))",
                  }}
                  draggable={false}
                />
                {/* Flag/banner */}
                <div
                  style={{
                    position: "relative",
                    width: `${FLAG_WIDTH}px`,
                    height: `${PLANE_HEIGHT * 0.7}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                    marginLeft: prompt.direction === "lr" ? 0 : "-16px",
                    marginRight: prompt.direction === "lr" ? "-16px" : 0,
                  }}
                >
                  <img
                    src="/images/flag.png"
                    alt=""
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 6,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      zIndex: 1,
                      pointerEvents: "none",
                      userSelect: "none",
                      rotate: prompt.direction === "rl" ? "-4deg" : "4deg",
                      transform:
                        prompt.direction === "rl" ? "none" : "scaleX(-1) ",
                    }}
                    draggable={false}
                  />
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      width: "90%",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#000",
                      textShadow: "0 2px 12px rgba(0,0,0,0.18)",
                      letterSpacing: "0.03em",
                      padding: "2px ",
                      whiteSpace: "normal",
                      lineHeight: "1.2",
                      pointerEvents: "none",
                      userSelect: "none",
                      fontFamily: "'quicksand', sans-serif",
                    }}
                  >
                    {prompt.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Background video, always rendered, fades in/out */}
        <video
          ref={bgVideoRef}
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-20 transition-opacity duration-700"
          style={{
            pointerEvents: "none",
            opacity: animationState.animationPhase === "video-playing" ? 1 : 0,
          }}
          src="/videos/mural-background.mp4"
        />

        {/* Scrolling Project Banner */}
        <div className="fixed top-0 left-0 right-0 z-30 bg-black/60 backdrop-blur-sm border-b border-white/20">
          <div className="overflow-hidden whitespace-nowrap py-2">
            <div className="animate-scroll-text text-white text-sm md:text-base font-medium tracking-wide">
              🎨 This is a project with Sebawang West, hosted at Woodlands
              Galaxy CC • Let kids draw their city and dreams and animate it
              into art
            </div>
          </div>
        </div>

        <div
          className="max-w-7xl mx-auto px-2 md:px-4"
          style={{ position: "relative" }}
        >
          {/* Header - Responsive text sizing */}
          <div
            className="text-center text-white p-2 md:p-4 m-2 md:m-8 lg:m-12"
            style={{ marginTop: "60px" }}
          >
            <h1
              className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold mb-2 tracking-wider md:tracking-widest"
              style={{
                fontFamily: "'Acallon', sans-serif",
                letterSpacing: isMobile ? "0.1em" : "0.2em",
                textShadow: "2px 2px 6px rgba(0, 0, 0, 0.4)",
              }}
            >
              CANVAS OF
            </h1>
            <div
              className="text-lg sm:text-xl md:text-2xl lg:text-4xl m-1 md:m-2"
              style={{
                fontFamily: "'LePetitCochon', cursive",
                fontWeight: 400,
                letterSpacing: "0.05em",
                textShadow: "2px 2px 6px rgba(0, 0, 0, 0.4)",
              }}
            >
              THE HiDDEN STARTS
            </div>
          </div>

          {/* Animation Container */}
          {animationState.currentItem && (
            <div
              ref={animationContainerRef}
              className={`fixed inset-0 z-50 transition-opacity duration-300 ${
                animationState.animationPhase === "idle"
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              }`}
              style={{ backgroundColor: "rgba(0, 0, 0, 0.36)" }}
            >
              <div
                className={
                  // Mobile-responsive animation container
                  ["video-playing", "image-showing"].includes(
                    animationState.animationPhase
                  )
                    ? `relative mx-auto my-auto z-50 ${
                        isMobile
                          ? "w-[90vw] h-[50vh] max-w-sm max-h-96"
                          : "w-[700px] h-[700px] max-w-3xl max-h-3xl"
                      }`
                    : "relative w-48 h-48 md:w-96 md:h-96 max-w-2xl max-h-2xl mx-auto my-auto z-50"
                }
                style={getAnimationStyles()}
              >
                {/* Video Player - Real or Simulated */}
                {animationState.animationPhase === "video-playing" && (
                  <div className="relative w-full h-full">
                    {/* Try main videoUrl first, then fallbackVideoUrl, then fallback image */}
                    {videoErrorState === "none" &&
                      animationState.currentItem.videoUrl && (
                        <video
                          src={animationState.currentItem.videoUrl}
                          controls
                          autoPlay
                          className="w-full h-full object-contain rounded-lg"
                          style={{ background: "rgba(0, 0, 0, 0.30)" }}
                          onError={() => setVideoErrorState("main-failed")}
                        />
                      )}
                    {videoErrorState === "main-failed" &&
                      animationState.currentItem.fallbackVideoUrl && (
                        <video
                          src={animationState.currentItem.fallbackVideoUrl}
                          controls
                          autoPlay
                          className="w-full h-full object-contain rounded-lg"
                          style={{ background: "rgba(0, 0, 0, 0.30)" }}
                          onError={() => setVideoErrorState("fallback-failed")}
                        />
                      )}
                    {(videoErrorState === "fallback-failed" ||
                      (!animationState.currentItem.videoUrl &&
                        !animationState.currentItem.fallbackVideoUrl)) && (
                      // Fallback: Simulated animation
                      <img
                        src={animationState.currentItem.imageUrl}
                        alt="Video Animation"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end rounded-lg">
                      <div className="p-2 md:p-4 text-white">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs md:text-sm">
                            Playing Video Animation...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Static Image */}
                {animationState.animationPhase === "image-showing" && (
                  <img
                    src={animationState.currentItem.imageUrl}
                    alt="Artwork"
                    className="w-full h-full object-contain rounded-lg"
                  />
                )}

                {/* Enlarging/Shrinking Animation */}
                {(animationState.animationPhase === "enlarging" ||
                  animationState.animationPhase === "shrinking") && (
                  <img
                    src={animationState.currentItem.imageUrl}
                    alt="Artwork"
                    className="w-full h-full object-contain rounded-lg"
                  />
                )}

                {/* Animation Controls */}
                <div className="absolute top-2 right-2 md:top-4 md:right-4 flex space-x-2">
                  <button
                    onClick={() =>
                      setAnimationState({
                        isPlaying: false,
                        currentItem: null,
                        animationPhase: "idle",
                      })
                    }
                    className="p-1 md:p-2 bg-white/20 rounded-full hover:bg-opacity-30 transition-colors"
                  >
                    <IconX className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mural Grid */}
          <div className="bg-white/50 rounded-lg md:rounded-2xl shadow-xl p-4 md:p-8 mb-6 md:mb-10">
            <div className="text-center text-gray-500 text-sm mb-4">
              <h1
                className="text-2xl md:text-4xl font-bold mb-2"
                style={{
                  fontFamily: "'LePetitCochon',sans-serif",
                  letterSpacing: isMobile ? "0.1em" : "0.2em",
                }}
              >
                OUR STORY, OUR MURAL
              </h1>
            </div>
            <div
              ref={gridRef}
              className="grid gap-0"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                minHeight: isMobile ? "300px" : "600px",
              }}
            >
              {Array.from({ length: TOTAL_CELLS }, (_, index) => {
                const item = muralItems.find(
                  (item) => item.gridPosition === index
                );
                // Pick a pastel color for empty cells
                const randomColor = pastelColors[index % pastelColors.length];
                return (
                  <div
                    key={index}
                    className={
                      `aspect-square border-2 transition-all duration-300 overflow-hidden ${
                        isMobile ? "mb-2" : "mb-4"
                      } ` +
                      (item
                        ? "border-gray-300 bg-white hover:border-blue-400 cursor-pointer"
                        : "border-dashed border-gray-200") +
                      (animationState.currentItem?.gridPosition === index &&
                      animationState.animationPhase === "placing"
                        ? " scale-110 border-blue-500"
                        : "")
                    }
                    style={{
                      minHeight: isMobile ? "40px" : "60px",
                      background: item ? undefined : randomColor,
                    }}
                    onClick={(e) => item && startAnimation(item, e)}
                    onMouseEnter={() => item && handleGridItemMouseEnter(item)}
                    onMouseLeave={() => item && handleGridItemMouseLeave(item)}
                  >
                    {item ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={item.imageUrl}
                          alt={`Artwork by ${item.userDetails.name}`}
                          className="w-full h-full object-cover"
                          style={{
                            backgroundColor: "transparent",
                            zIndex: 1,
                            display: "block",
                            position: "relative",
                          }}
                          onError={(e) => {
                            console.error(
                              "Failed to load image:",
                              item.imageUrl
                            );
                            e.currentTarget.style.display = "none";
                            const fallback =
                              e.currentTarget.parentElement?.querySelector(
                                ".image-fallback"
                              );
                            if (fallback) {
                              (fallback as HTMLElement).style.display = "flex";
                            }
                          }}
                          onLoad={(e) => {
                            console.log(
                              "Successfully loaded image:",
                              item.imageUrl
                            );
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.visibility = "visible";
                          }}
                        />
                        {/* Fallback when image fails to load */}
                        <div className="image-fallback hidden absolute inset-0 bg-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-xs mb-1">Image not found</div>
                            <div className="text-xs">
                              {item.userDetails.name}
                            </div>
                          </div>
                        </div>
                        {/* Hover overlay - only show on hover for desktop */}
                        <div className="hidden md:flex bg-white group-hover:bg-opacity-50 transition-all duration-300 items-center justify-center pointer-events-none">
                          <IconPlayerPlay className="h-6 w-6 lg:h-8 lg:w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* User name badge - responsive sizing */}
                        <div className="absolute bottom-0 z-1 left-0 bg-black/50 bg-opacity-75 text-white text-xs px-1 py-0.5 rounded truncate max-w-full font-quicksand">
                          {item.userDetails.name}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <IconBrush className="h-4 w-4 lg:h-6 lg:w-6 stroke-1 text-gray-400  group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats - Mobile responsive grid */}
          {/* <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/50 rounded-lg p-4 md:p-6 text-center">
              <div className="text-xl md:text-2xl font-bold text-blue-600 font-quicksand">
                {muralItems.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-quicksand">
                Sketches Shared
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-4 md:p-6 text-center">
              <div className="text-xl md:text-2xl font-bold text-green-600 font-quicksand">
                {TOTAL_CELLS - muralItems.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-quicksand">
                Room for More Magic
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-4 md:p-6 text-center">
              <div className="text-xl md:text-2xl font-bold text-purple-600 font-quicksand">
                {Math.round((muralItems.length / TOTAL_CELLS) * 100)}%
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-quicksand">
                Wall of Wonder
              </div>
            </div>
          </div> */}
          {/* Controls - Mobile responsive */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0 mt-8">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm md:text-base font-quicksand"
              >
                <IconRefresh
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>
                  {isLoading ? "Sprinkling Magic..." : "Sprinkle Some Magic"}
                </span>
              </button>
            </div>

            <Link
              href="/upload"
              className="px-4 md:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center text-sm md:text-base font-quicksand"
            >
              Add My Sketch!
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
