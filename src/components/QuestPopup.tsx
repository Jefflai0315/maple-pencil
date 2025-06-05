import React, { useState, useRef, useEffect } from "react";
import { ContactForm } from "./ContactForm";

import {
  comImages,
  woodImages,
  detailedImages,
  bigImages,
  sectionContent,
} from "../app/utils/constants";

import { ArtEventContent, ArtEventService } from "../app/utils/interface";

// Gallery Card Component
const GalleryCard = ({
  title,
  description,
  images,
  categoryIndex,
  onImageClick,
}: {
  title: string;
  description: string;
  images: string[];
  categoryIndex: number;
  onImageClick: (index: number, category: number) => void;
}) => {
  const rand = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const getCategoryPath = (title: string) => {
    switch (title.toLowerCase()) {
      case "quick sketches":
        return "quick";
      case "wood sketches":
        return "wood";
      case "detailed portraits":
        return "detailed";
      case "big sketches":
        return "big";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col bg-white/5 backdrop-blur-sm rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
      <h3 className="text-lg font-bold mb-2 text-yellow-400">{title}</h3>
      <p className="text-sm mb-4 text-gray-300">{description}</p>
      <div className="relative flex items-center justify-center h-40 overflow-hidden group">
        <div className="relative w-full h-full group-hover:scale-105 transition-all duration-300">
          {images.map((img, index) => {
            const rotation = (rand(index) - 0.5) * 12;
            const xOffset = (rand(index + 10) - 0.5) * 16;
            const yOffset = (rand(index + 20) - 0.5) * 8;

            return (
              <img
                key={img}
                src={`/gallery/${getCategoryPath(title)}/${img}`}
                alt={img.replace(/_/g, " ").replace(".jpg", "")}
                className="absolute cursor-pointer rounded-lg shadow-lg transition-all duration-300 bg-white hover:z-50"
                style={{
                  left: `calc(50% + ${xOffset}px)`,
                  top: `calc(50% + ${yOffset}px)`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  zIndex: index,
                  width: "100px",
                  height: "130px",
                  objectFit: "cover",
                  boxShadow:
                    "0 4px 16px 0 rgba(0,0,0,0.13), 0 1.5px 0 0 #fff inset",
                  filter: "brightness(1.2) contrast(1.1)",
                }}
                onClick={() => onImageClick(index, categoryIndex)}
              />
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// Image Modal Component
const ImageModal = ({
  isOpen,
  onClose,
  images,
  category,
  initialIndex,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  category: string;
  initialIndex: number;
}) => {
  const [modalIndex, setModalIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    null | "next" | "prev"
  >(null);

  const handleModalNav = (dir: "next" | "prev") => {
    setTransitionDirection(dir);
    setZoomed(false);
    setTimeout(() => {
      if (dir === "next") {
        setModalIndex((prev) => (prev + 1) % images.length);
      } else {
        setModalIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      setTransitionDirection(null);
      setTimeout(() => setZoomed(true), 10);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={() => {
        setZoomed(false);
        setTimeout(onClose, 200);
      }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          width: "80vw",
          maxWidth: 700,
          height: "80vh",
          maxHeight: 500,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Image */}
        {images.length > 1 && (
          <img
            src={`/gallery/${category}/${
              images[(modalIndex - 1 + images.length) % images.length]
            }`}
            alt="prev"
            className="absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg border border-white/20 shadow-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            style={{
              width: "50%",
              opacity: 0.7,
              zIndex: 1,
              transform: "translateX(-40%) scale(0.85) rotate(-20deg)",
              filter: "blur(2px)",
            }}
            onClick={() => handleModalNav("prev")}
          />
        )}

        {/* Main Image */}
        <img
          src={`/gallery/${category}/${images[modalIndex]}`}
          alt={images[modalIndex].replace(/_/g, " ").replace(".jpg", "")}
          className={`rounded-lg shadow-2xl bg-white/10 backdrop-blur-sm transition-all duration-300
            ${transitionDirection === "next" ? "modal-slide-next" : ""}
            ${transitionDirection === "prev" ? "modal-slide-prev" : ""}
          `}
          style={{
            maxHeight: "80vh",
            maxWidth: "90vw",
            zIndex: 2,
            transform: zoomed ? "scale(1)" : "scale(0.7)",
            opacity: zoomed ? 1 : 0.5,
            filter: "brightness(1.2) contrast(1.1)",
          }}
          onLoad={() => setTimeout(() => setZoomed(true), 10)}
        />

        {/* Next Image */}
        {images.length > 1 && (
          <img
            src={`/gallery/${category}/${
              images[(modalIndex + 1) % images.length]
            }`}
            alt="next"
            className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg border border-white/20 shadow-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            style={{
              width: "50%",
              opacity: 0.7,
              zIndex: 1,
              transform: "translateX(40%) scale(0.85) rotate(20deg)",
              filter: "blur(2px)",
            }}
            onClick={() => handleModalNav("next")}
          />
        )}

        {/* Navigation arrows */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold z-10 transition-all duration-300"
          onClick={() => handleModalNav("prev")}
          style={{ pointerEvents: "auto" }}
        >
          &#8592;
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold z-10 transition-all duration-300"
          onClick={() => handleModalNav("next")}
          style={{ pointerEvents: "auto" }}
        >
          &#8594;
        </button>

        {/* Close Button */}
        <button
          className="absolute bottom-[-70px] bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-6 py-2 text-lg font-bold z-20 transition-all duration-300"
          onClick={() => {
            setZoomed(false);
            setTimeout(onClose, 100);
          }}
          style={{ pointerEvents: "auto" }}
          aria-label="Close"
        >
          Close Gallery
        </button>
      </div>
    </div>
  );
};

// Style Guide Component
const StyleGuide = () => (
  <div className="mt-8 px-4">
    <div className="bg-white/5 backdrop-blur-sm rounded-lg">
      <h3 className="text-lg font-bold mb-4 text-yellow-400">Style Guide</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <h4 className="font-bold text-yellow-400 mb-2">Quick Sketches</h4>
          <p className="text-gray-300">Perfect for events and live sketching</p>
        </div>
        <div>
          <h4 className="font-bold text-yellow-400 mb-2">Wood Sketches</h4>
          <p className="text-gray-300">Unique texture and natural feel</p>
        </div>
        <div>
          <h4 className="font-bold text-yellow-400 mb-2">Detailed Portraits</h4>
          <p className="text-gray-300">
            High attention to detail and precision
          </p>
        </div>
        <div>
          <h4 className="font-bold text-yellow-400 mb-2">Big Sketches</h4>
          <p className="text-gray-300">Bold statements and grand displays</p>
        </div>
      </div>
    </div>
  </div>
);

// Type guards
const isArtEventContent = (c: unknown): c is ArtEventContent => {
  return (
    typeof c === "object" &&
    c !== null &&
    "services" in c &&
    Array.isArray((c as ArtEventContent).services)
  );
};

// Type guard for content with description
const hasDescription = (
  content: unknown
): content is { description: string } => {
  return (
    typeof content === "object" &&
    content !== null &&
    "description" in content &&
    typeof (content as { description: unknown }).description === "string"
  );
};

// Main QuestPopup Component
const QuestPopup = ({
  onClose,
  section,
}: {
  onClose: () => void;
  section: string;
}) => {
  const content = sectionContent[section as keyof typeof sectionContent];
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // Center the popup on mount
  useEffect(() => {
    if (popupRef.current) {
      const popupWidth = popupRef.current.offsetWidth;
      const popupHeight = popupRef.current.offsetHeight;
      const x = (window.innerWidth - popupWidth) / 2;
      const y = (window.innerHeight - popupHeight) / 2;
      setPosition({ x, y });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && popupRef.current) {
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      setPosition({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleImageClick = (index: number, category: number) => {
    setModalIndex(index);
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const getCategoryImages = (category: number) => {
    switch (category) {
      case 0:
        return comImages;
      case 1:
        return woodImages;
      case 2:
        return detailedImages;
      case 3:
        return bigImages;
      default:
        return [];
    }
  };

  const getCategoryName = (category: number) => {
    switch (category) {
      case 0:
        return "quick";
      case 1:
        return "wood";
      case 2:
        return "detailed";
      case 3:
        return "big";
      default:
        return "";
    }
  };

  return (
    <div className="quest-popup-overlay">
      <div
        ref={popupRef}
        className="quest-popup"
        style={{
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        <div
          className="quest-header cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <span>{section.toUpperCase()}</span>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="quest-body flex flex-col h-full">
          <div className="quest-details pixel-font flex flex-col h-full">
            <div className="quest-details-header">
              <div className="flex flex-col items-start justify-start">
                <span className="text-xl font-bold">{content.title}</span>
                <span className="text-sm">{content.level}</span>
              </div>
              <img src={content.npc} className="quest-details-npc" alt="NPC" />
            </div>
            {section === "Art & Event" && isArtEventContent(content) ? (
              <>
                {/* Service Tabs */}
                <div className="tabs mb-2">
                  {content.services.map(
                    (service: ArtEventService, idx: number) => (
                      <button
                        key={service.name}
                        className={`tab${
                          selectedServiceIdx === idx ? " active" : ""
                        }`}
                        onClick={() => setSelectedServiceIdx(idx)}
                      >
                        {service.name}
                      </button>
                    )
                  )}
                </div>
                {/* Service Gallery */}
                <div className="quest-level">
                  <div className="quest-desc">
                    <div className="flex flex-col gap-8">
                      {/* Grid layout for categories */}
                      <div className="grid grid-cols-2 gap-8 px-4">
                        <GalleryCard
                          title="Quick Sketches"
                          description="Fast and expressive sketches perfect for capturing moments on the go."
                          images={comImages}
                          categoryIndex={0}
                          onImageClick={handleImageClick}
                        />
                        <GalleryCard
                          title="Wood Sketches"
                          description="Unique sketches on wood surfaces, creating rustic and natural artwork."
                          images={woodImages}
                          categoryIndex={1}
                          onImageClick={handleImageClick}
                        />
                        <GalleryCard
                          title="Detailed Portraits"
                          description="Intricate and detailed portraits with careful attention to every feature."
                          images={detailedImages}
                          categoryIndex={2}
                          onImageClick={handleImageClick}
                        />
                        <GalleryCard
                          title="Big Sketches"
                          description="Large-scale sketches that make a bold statement and capture grand moments."
                          images={bigImages}
                          categoryIndex={3}
                          onImageClick={handleImageClick}
                        />
                      </div>
                      <StyleGuide />
                    </div>
                  </div>
                </div>
              </>
            ) : section === "Contact" ? (
              <div className="quest-level">
                <div className="quest-desc">
                  <ContactForm />
                </div>
              </div>
            ) : (
              <div className="quest-level">
                <div className="quest-desc">
                  {hasDescription(content) ? content.description : ""}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={getCategoryImages(selectedCategory)}
        category={getCategoryName(selectedCategory)}
        initialIndex={modalIndex}
      />
    </div>
  );
};

export default QuestPopup;
