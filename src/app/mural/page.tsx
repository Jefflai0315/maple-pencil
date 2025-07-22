"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconRefresh,
  IconPlayerPlay,
  IconVolume,
  IconVolumeOff,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";

interface MuralItem {
  id: string;
  imageUrl: string;
  videoUrl: string;
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

export default function MuralPage() {
  const [muralItems, setMuralItems] = useState<MuralItem[]>([]);
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    currentItem: null,
    animationPhase: "idle",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  // Grid dimensions
  const GRID_ROWS = 10;
  const GRID_COLS = 15;
  const TOTAL_CELLS = GRID_ROWS * GRID_COLS;

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
    setTimeout(() => {
      setAnimationState((prev) => ({
        ...prev,
        animationPhase: "video-playing",
      }));

      // Simulate video playback (3s)
      setTimeout(() => {
        setAnimationState((prev) => ({
          ...prev,
          animationPhase: "image-showing",
        }));

        // Show static image (0.3s)
        setTimeout(() => {
          setAnimationState((prev) => ({
            ...prev,
            animationPhase: "shrinking",
          }));

          // Shrink back to grid (0.3s)
          setTimeout(() => {
            setAnimationState({
              isPlaying: false,
              currentItem: null,
              animationPhase: "idle",
            });
          }, 300);
        }, 300);
      }, 5000);
    }, 300);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const getAnimationStyles = () => {
    if (!animationState.clickedPosition) return {};

    const { x, y, width, height } = animationState.clickedPosition;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

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

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-500 py-8 relative"
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
      <div className="max-w-7xl mx-auto px-4" style={{ position: "relative" }}>
        {/* Header */}
        <div className="text-center text-white p-4 m-4">
          <h1
            className="text-8xl font-bold mb-2 tracking-widest "
            style={{
              fontFamily: "'Acallon', sans-serif",
              letterSpacing: "0.2em",
              textShadow: "2px 2px 6px rgba(0, 0, 0, 0.4)",
            }}
          >
            CANVAS OF
          </h1>
          <div
            className="text-4xl m-2"
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
                // Make the animation video/image much larger during video-playing and image-showing
                ["video-playing", "image-showing"].includes(
                  animationState.animationPhase
                )
                  ? "relative w-[700px] h-[700px] max-w-3xl max-h-3xl mx-auto my-auto z-50"
                  : "relative w-96 h-96 max-w-2xl max-h-2xl mx-auto my-auto z-50"
              }
              style={getAnimationStyles()}
            >
              {/* Video Player - Real or Simulated */}
              {animationState.animationPhase === "video-playing" && (
                <div className="relative w-full h-full">
                  {animationState.currentItem.videoUrl &&
                  (animationState.currentItem.videoUrl.startsWith(
                    "https://res.cloudinary.com"
                  ) ||
                    animationState.currentItem.videoUrl.startsWith(
                      "https://d1q70pf5vjeyhc.cloudfront.net"
                    )) ? (
                    <video
                      src={animationState.currentItem.videoUrl}
                      controls
                      autoPlay
                      muted={isMuted}
                      className="w-full h-full object-contain rounded-lg"
                      style={{ background: "rgba(0, 0, 0, 0.30)" }}
                    />
                  ) : (
                    // Fallback: Simulated animation
                    <img
                      src={animationState.currentItem.imageUrl}
                      alt="Video Animation"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end rounded-lg">
                    <div className="p-4 text-white">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">
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
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() =>
                    setAnimationState({
                      isPlaying: false,
                      currentItem: null,
                      animationPhase: "idle",
                    })
                  }
                  className="p-2 bg-white/20 rounded-full hover:bg-opacity-30 transition-colors"
                >
                  <IconX className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mural Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
          <div className="text-center text-gray-500 text-sm mb-4">
            <h1 className="text-4xl font-bold mb-2">Our Story, Our Mural</h1>
          </div>
          <div
            ref={gridRef}
            className="grid gap-0"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            }}
          >
            {Array.from({ length: TOTAL_CELLS }, (_, index) => {
              const item = muralItems.find(
                (item) => item.gridPosition === index
              );

              return (
                <div
                  key={index}
                  className={`
                    aspect-square  border-2 transition-all duration-300 overflow-hidden
                    ${
                      item
                        ? "border-gray-300 bg-white hover:border-blue-400 cursor-pointer"
                        : "border-dashed border-gray-200 bg-gray-50"
                    }
                    ${
                      animationState.currentItem?.gridPosition === index &&
                      animationState.animationPhase === "placing"
                        ? "scale-110 border-blue-500"
                        : ""
                    }
                  `}
                  onClick={(e) => item && startAnimation(item, e)}
                >
                  {item ? (
                    <div className="relative w-full h-full group">
                      {/* <div className="absolute top-0 left-0 text-xs bg-white/50 p-1 z-20">
                        {index}
                      </div> */}

                      <img
                        src={item.imageUrl}
                        alt={`Artwork by ${item.userDetails.name}`}
                        className="w-full h-full object-cover"
                        style={{
                          backgroundColor: "transparent",
                          zIndex: 1,
                          display: "block", // Force display
                          position: "relative", // Ensure positioning
                        }}
                        onError={(e) => {
                          console.error("Failed to load image:", item.imageUrl);
                          e.currentTarget.style.display = "none";
                          // Show fallback content
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
                          console.log(
                            "Image dimensions:",
                            e.currentTarget.naturalWidth,
                            "x",
                            e.currentTarget.naturalHeight
                          );
                          console.log("Image element:", e.currentTarget);
                          // Force the image to be visible
                          e.currentTarget.style.opacity = "1";
                          e.currentTarget.style.visibility = "visible";
                        }}
                      />
                      {/* Fallback when image fails to load */}
                      <div className="image-fallback hidden absolute inset-0 bg-gray-200  flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-xs mb-1">Image not found</div>
                          <div className="text-xs">{item.userDetails.name}</div>
                        </div>
                      </div>
                      {/* Hover overlay - only show on hover */}
                      <div className=" bg-white group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center pointer-events-none">
                        <IconPlayerPlay className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {/* User name badge */}
                      <div className="absolute bottom-0 bg-black/50 bg-opacity-75 text-white text-xs px-1 py-0.5 rounded z-10">
                        {item.userDetails.name}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xs">Empty</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <IconRefresh
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
            </button>

            <button
              onClick={toggleMute}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isMuted ? (
                <IconVolumeOff className="h-4 w-4" />
              ) : (
                <IconVolume className="h-4 w-4" />
              )}
              <span>{isMuted ? "Unmute" : "Mute"}</span>
            </button>
          </div>

          <Link
            href="/upload"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Upload Your Art
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {muralItems.length}
            </div>
            <div className="text-sm text-gray-600">Artworks Uploaded</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {TOTAL_CELLS - muralItems.length}
            </div>
            <div className="text-sm text-gray-600">Spaces Available</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((muralItems.length / TOTAL_CELLS) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Wall Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
}
