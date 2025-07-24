"use client";

import { useState } from "react";

interface NPC {
  id: string;
  name: string;
  type: string;
  icon: string; // Now contains image path
  description: string;
}

const getFallbackIcon = (type: string): string => {
  switch (type) {
    case "sketch_canvas":
      return "✏️";
    case "photobooth":
      return "📷";
    case "ar_trace":
      return "🎨";
    case "video_booth":
      return "🎥";
    default:
      return "🛠️";
  }
};

const npcs: NPC[] = [
  {
    id: "sketch",
    name: "Sketch Canvas",
    type: "sketch_canvas",
    icon: "/NPC/Sketch_booth2.png",
    description: "Create digital sketches and drawings",
  },
  {
    id: "webcam",
    name: "Photo Booth",
    type: "photobooth",
    icon: "/NPC/photobooth.png",
    description: "Take photos and capture moments",
  },
  {
    id: "artrace",
    name: "AR Trace Tool",
    type: "ar_trace",
    icon: "/NPC/Camera.png",
    description: "Augmented reality drawing tool",
  },
  {
    id: "video",
    name: "Video Booth",
    type: "video_booth",
    icon: "/NPC/Video_booth.png",
    description: "Record videos and animations",
  },
];

interface ToolboxProps {
  onNPCClick: (npcType: string) => void;
}

export default function Toolbox({ onNPCClick }: ToolboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNPCClick = (npc: NPC) => {
    onNPCClick(npc.type);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-60 left-4 z-50 flex flex-col items-center">
      {/* Toolbox Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-transparent to-transparent hover:from-gray-50/10 hover:to-transparent text-white font-bold py-3 px-4 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
      >
        <span className="text-xl">🛠️</span>
        {/* <span className="hidden sm:inline ">Toolbox</span> */}
      </button>

      {/* Toolbox Panel */}

      <div
        className={`absolute top-1/2 left-full mr-2 bg-gray-50/10 backdrop-blur-sm rounded-2xl shadow-xl  z-40 transform -translate-y-1/2 overflow-hidden ${
          isOpen
            ? "p-3 mr-2 w-auto w-auto min-w-[220px] opacity-100"
            : "p-0 mr-0w-0 opacity-0"
        } transition-all duration-400 ease-out`}
      >
        {isOpen && (
          <div className="flex items-center gap-5">
            {npcs.map((npc, index) => (
              <button
                key={npc.id}
                onClick={() => handleNPCClick(npc)}
                className="transition-all duration-300 transform hover:scale-110 hover:shadow-md flex items-center justify-center w-8 h-8 animate-slideIn"
                title={npc.name}
                style={{
                  minWidth: "32px",
                  minHeight: "32px",
                  animationDelay: isOpen ? `${index * 100}ms` : "0ms",
                  animationFillMode: "both",
                }}
              >
                <img
                  src={npc.icon}
                  alt={npc.name}
                  className="w-8 h-8 object-cover"
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "block",
                    flexShrink: 0,
                    minWidth: "32px",
                    minHeight: "32px",
                  }}
                  onLoad={(e) => {
                    console.log(`Image loaded successfully: ${npc.icon}`);
                    console.log(
                      `Image dimensions:`,
                      e.currentTarget.naturalWidth,
                      "x",
                      e.currentTarget.naturalHeight
                    );
                    console.log(
                      `Image display dimensions:`,
                      e.currentTarget.offsetWidth,
                      "x",
                      e.currentTarget.offsetHeight
                    );
                  }}
                  onError={(e) => {
                    console.error(`Failed to load image: ${npc.icon}`);
                    // Fallback to emoji if image fails to load
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling?.remove();
                    const fallback = document.createElement("span");
                    fallback.className = "text-xl";
                    fallback.textContent = getFallbackIcon(npc.type);
                    e.currentTarget.parentNode?.appendChild(fallback);
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
