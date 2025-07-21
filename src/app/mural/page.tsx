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
    | "video-playing"
    | "image-showing"
    | "moving-to-grid"
    | "placing";
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

  // Grid dimensions
  const GRID_ROWS = 10;
  const GRID_COLS = 12;
  const TOTAL_CELLS = GRID_ROWS * GRID_COLS;

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

  const startAnimation = (item: MuralItem) => {
    setAnimationState({
      isPlaying: true,
      currentItem: item,
      animationPhase: "video-playing",
    });

    // Simulate video playback with animation
    // In production, this would play the actual generated video
    setTimeout(() => {
      setAnimationState((prev) => ({
        ...prev,
        animationPhase: "image-showing",
      }));

      // Show static image for 2 seconds
      setTimeout(() => {
        setAnimationState((prev) => ({
          ...prev,
          animationPhase: "moving-to-grid",
        }));

        // Animate to grid position
        setTimeout(() => {
          setAnimationState((prev) => ({
            ...prev,
            animationPhase: "placing",
          }));

          // Complete animation
          setTimeout(() => {
            setAnimationState({
              isPlaying: false,
              currentItem: null,
              animationPhase: "idle",
            });
          }, 1000);
        }, 2000);
      }, 2000);
    }, 3000); // Simulate 3-second video
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Mural Wall
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A collaborative digital art space where every upload becomes part of
            our shared story.
          </p>
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

        {/* Animation Container */}
        {animationState.currentItem && (
          <div
            ref={animationContainerRef}
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${
              animationState.animationPhase === "idle"
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }} // Semi-transparent background
          >
            <div className="relative max-w-2xl max-h-2xl">
              {/* Video Player - Simulated */}
              {animationState.animationPhase === "video-playing" && (
                <div className="relative">
                  <img
                    src={animationState.currentItem.imageUrl}
                    alt="Video Animation"
                    className="w-full h-full object-contain animate-pulse"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">
                          Playing Video Animation...
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    DEMO
                  </div>
                </div>
              )}

              {/* Static Image */}
              {animationState.animationPhase === "image-showing" && (
                <img
                  src={animationState.currentItem.imageUrl}
                  alt="Artwork"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Moving Animation */}
              {animationState.animationPhase === "moving-to-grid" && (
                <div className="absolute inset-0">
                  <img
                    src={animationState.currentItem.imageUrl}
                    alt="Artwork"
                    className="w-full h-full object-contain animate-pulse"
                    style={{
                      transform: "scale(0.8)",
                      transition: "all 2s ease-in-out",
                    }}
                  />
                </div>
              )}

              {/* Animation Controls */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() =>
                    setAnimationState((prev) => ({ ...prev, isPlaying: false }))
                  }
                  className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                >
                  <IconX className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mural Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div
            className="grid gap-2"
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
                    aspect-square rounded-lg border-2 transition-all duration-300 overflow-hidden
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
                  onClick={() => item && startAnimation(item)}
                >
                  {item ? (
                    <div className="relative w-full h-full group">
                      <div className="absolute top-0 left-0 text-xs bg-white bg-opacity-75 p-1 z-20">
                        {index}
                      </div>
                      {/* Test image to see if images work at all */}
                      <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 rounded z-30 flex items-center justify-center text-white text-xs">
                        T
                      </div>

                      <img
                        src={item.imageUrl}
                        alt={`Artwork by ${item.userDetails.name}`}
                        className="w-full h-full object-cover rounded-lg"
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
                      <div className="image-fallback hidden absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-xs mb-1">Image not found</div>
                          <div className="text-xs">{item.userDetails.name}</div>
                        </div>
                      </div>
                      {/* Hover overlay - only show on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center pointer-events-none">
                        <IconPlayerPlay className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {/* User name badge */}
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded z-10">
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
