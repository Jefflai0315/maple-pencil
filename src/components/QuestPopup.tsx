import React, { useState, useRef, useEffect } from "react";
import { ContactForm } from "./ContactForm";
import Image from "next/image";

import {
  comImages,
  woodImages,
  detailedImages,
  bigImages,
  sectionContent,
} from "../app/utils/constants";

import { ArtEventContent } from "../app/utils/interface";

// Typing Text Component
const TypingText = ({
  text,
  speed = 50,
  className = "",
}: {
  text: string;
  speed?: number;
  className?: string;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Split text into words
  const words = text.split(" ");

  useEffect(() => {
    if (!isTyping || isComplete) return;

    const typeNextWord = () => {
      if (currentIndex < words.length) {
        setDisplayedText(
          (prev) => prev + (prev ? " " : "") + words[currentIndex]
        );
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsComplete(true);
        setIsTyping(false);
      }
    };

    // Add a small delay before starting to type
    const delay = currentIndex === 0 ? 500 : speed;
    timeoutRef.current = setTimeout(typeNextWord, delay);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isTyping, isComplete, words, speed]);

  const handleTap = () => {
    const now = Date.now();
    const timeDiff = now - lastTapTime;

    if (timeDiff < 200) {
      // Reduced from 300ms to 200ms for quicker double tap
      // Double tap detected
      setTapCount((prev) => prev + 1);
      if (tapCount >= 1) {
        // Show all text immediately
        setDisplayedText(text);
        setIsComplete(true);
        setIsTyping(false);
        setCurrentIndex(words.length);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setTapCount(0);
      }
    } else {
      // Single tap
      setTapCount(1);
      if (isTyping) {
        // Finish current paragraph (type all remaining words quickly)
        const remainingWords = words.slice(currentIndex);
        setDisplayedText(
          (prev) => prev + (prev ? " " : "") + remainingWords.join(" ")
        );
        setCurrentIndex(words.length);
        setIsComplete(true);
        setIsTyping(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    }

    setLastTapTime(now);
  };

  // Reset tap count after a delay
  useEffect(() => {
    if (tapCount > 0) {
      const resetTimer = setTimeout(() => {
        setTapCount(0);
      }, 200); // Reduced from 300ms to 200ms
      return () => clearTimeout(resetTimer);
    }
  }, [tapCount]);

  return (
    <div
      className={`cursor-pointer select-none transition-all duration-200 ${className} ${
        isTyping ? "bg-blue-50/30 rounded px-1" : ""
      }`}
      onClick={handleTap}
      style={{
        minHeight: "1.5em",
        touchAction: "auto",
        userSelect: "none",
        pointerEvents: "auto",
      }}
    >
      {displayedText}
      {isTyping && !isComplete && (
        <span className="animate-pulse text-blue-500 font-bold">|</span>
      )}
    </div>
  );
};

// Gallery Card Component
const GalleryCard = ({
  title,
  description,
  images,
  categoryIndex,
  price,
  onImageClick,
}: {
  title: string;
  description: string;
  images: string[];
  categoryIndex: number;
  price: number;
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
    <div
      className="flex flex-col bg-white/5 backdrop-blur-sm rounded-lg pr-2 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:bg-white/10 hover:scale-102"
      onClick={() => onImageClick(0, categoryIndex)}
    >
      <div className="flex flex-row gap-2">
        <div
          className="relative w-20 h-20 bg-gray-100 rounded-lg border border-gray-100 flex items-center justify-center"
          style={{
            boxShadow:
              "inset 0 4px 8px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(0,0,0,0.05)",
          }}
        >
          {images.map((img, index) => {
            const rotation = (rand(index) - 0.5) * 12;
            return (
              <Image
                width={100}
                height={130}
                key={img}
                src={`/gallery/${getCategoryPath(title)}/${img}`}
                alt={img.replace(/_/g, " ").replace(".jpg", "")}
                className="absolute rounded-lg shadow-lg transition-all duration-300 bg-white hover:z-50"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  zIndex: index,
                  width: "50px",
                  height: "60px",
                  objectFit: "cover",
                }}
                loading="lazy"
                decoding="async"
              />
            );
          })}
        </div>
        <div className="flex flex-col bg-gray-200 w-full p-2 rounded-sm">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-gray-600">{description}</p>
          <div className="flex flex-row gap-1 md:gap-2 overflow-y-auto">
            <Image
              width={20}
              height={8}
              src={`/money.png`}
              alt="$"
              className=""
            />
            <p className="text-gray-600">{price}</p>
          </div>
        </div>
      </div>

      {/* Add magnifying glass icon */}
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
  const [loadedImages, setLoadedImages] = useState<Set<number>>(
    new Set([initialIndex])
  );

  // Ensure modalIndex is within bounds
  useEffect(() => {
    if (modalIndex >= images.length) {
      setModalIndex(0);
    }
  }, [modalIndex, images.length]);

  // Preload adjacent images
  useEffect(() => {
    if (isOpen && images.length > 0) {
      const nextIndex = (modalIndex + 1) % images.length;
      const prevIndex = (modalIndex - 1 + images.length) % images.length;

      const preloadImage = (index: number) => {
        if (!loadedImages.has(index) && images[index]) {
          const img = new window.Image();
          img.src = `/gallery/${category}/${images[index]}`;
          img.onload = () => {
            setLoadedImages((prev) => new Set([...prev, index]));
          };
        }
      };

      preloadImage(nextIndex);
      preloadImage(prevIndex);
    }
  }, [modalIndex, isOpen, images, category, loadedImages]);

  // Safety check for empty images array
  if (!images || images.length === 0) {
    return null;
  }

  const handleModalNav = (dir: "next" | "prev") => {
    if (images.length <= 1) return;

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

  const currentImage = images[modalIndex];
  if (!currentImage) return null;

  const getImageAlt = (imageName: string) => {
    return imageName ? imageName.replace(/_/g, " ").replace(".jpg", "") : "";
  };

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
          height: "80dvh",
          maxHeight: 500,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Image */}
        {images.length > 1 && (
          <Image
            width={350}
            height={500}
            src={`/gallery/${category}/${
              images[(modalIndex - 1 + images.length) % images.length]
            }`}
            alt={getImageAlt(
              images[(modalIndex - 1 + images.length) % images.length]
            )}
            className="absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg border border-white/20 shadow-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            style={{
              width: "50%",
              opacity: loadedImages.has(
                (modalIndex - 1 + images.length) % images.length
              )
                ? 0.7
                : 0,
              zIndex: 1,
              transform: "translateX(-40%) scale(0.85) rotate(-20deg)",
              filter: "blur(2px)",
            }}
            loading="lazy"
            decoding="async"
            onClick={() => handleModalNav("prev")}
          />
        )}

        {/* Main Image */}
        <Image
          width={700}
          height={500}
          src={`/gallery/${category}/${currentImage}`}
          alt={getImageAlt(currentImage)}
          className={`rounded-lg shadow-2xl bg-white/10 backdrop-blur-sm transition-all duration-300
            ${transitionDirection === "next" ? "modal-slide-next" : ""}
            ${transitionDirection === "prev" ? "modal-slide-prev" : ""}
          `}
          style={{
            maxHeight: "80dvh",
            maxWidth: "90vw",
            zIndex: 2,
            transform: zoomed ? "scale(1)" : "scale(0.7)",
            opacity: zoomed ? 1 : 0.5,
            filter: "brightness(1.2) contrast(1.1)",
          }}
          loading="eager"
          decoding="async"
          onLoad={() => setTimeout(() => setZoomed(true), 10)}
        />

        {/* Next Image */}
        {images.length > 1 && (
          <Image
            width={350}
            height={500}
            src={`/gallery/${category}/${
              images[(modalIndex + 1) % images.length]
            }`}
            alt={getImageAlt(images[(modalIndex + 1) % images.length])}
            className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg border border-white/20 shadow-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            style={{
              width: "50%",
              opacity: loadedImages.has((modalIndex + 1) % images.length)
                ? 0.7
                : 0,
              zIndex: 1,
              transform: "translateX(40%) scale(0.85) rotate(20deg)",
              filter: "blur(2px)",
            }}
            loading="lazy"
            decoding="async"
            onClick={() => handleModalNav("next")}
          />
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
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
          </>
        )}

        {/* Close Button */}
        <button
          className="absolute bottom-[-70px] bg-white/50 hover:bg-white/30 backdrop-blur-sm rounded-full px-6 py-2 text-lg font-bold z-20 transition-all duration-300"
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Reset when section changes
  useEffect(() => {
    console.log("Section changed to:", section);
  }, [section]);

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
      popupRef.current.style.transform = `translate(${x}px, ${y}px)`;
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
    <div className="quest-popup-overlay ">
      <div
        ref={popupRef}
        className="quest-popup"
        style={{
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
            <div className="quest-details-header ">
              <div className="flex flex-col items-start justify-start">
                <span className="text-xl font-bold">{content.title}</span>
                <span className="text-sm">{content.level}</span>
              </div>
              <img src={content.npc} className="quest-details-npc" alt="NPC" />
            </div>
            {section === "Art & Event" && isArtEventContent(content) ? (
              <>
                {/* Service Tabs */}
                {/* <div className="tabs mb-2">
                  {content.services.map(
                    (service: ArtEventService, idx: number) => (
                      <button
                        key={service.name}
                        className={`tab ${
                          selectedServiceIdx === idx ? " active" : ""
                        }`}
                        onClick={() => setSelectedServiceIdx(idx)}
                      >
                        {service.name}
                      </button>
                    )
                  )}
                </div> */}
                {/* Service Gallery */}
                <div className="quest-level flex-1">
                  <div
                    className="h-full"
                    style={{
                      overflowY: "auto",
                      WebkitOverflowScrolling: "touch",
                      touchAction: "pan-y",
                    }}
                  >
                    <div className="flex flex-col gap-4 md:gap-2">
                      {/* Service Description */}

                      {/* Grid layout for categories */}
                      <div className="grid grid-cols-1 gap-1 md:gap-2 ">
                        <GalleryCard
                          key={`quick-${section}`}
                          title="Quick Sketches"
                          description="Fast and expressive sketch perfect for capturing moments on the go, A5 size. (30mins)"
                          images={comImages}
                          categoryIndex={0}
                          price={28}
                          onImageClick={handleImageClick}
                        />
                        <GalleryCard
                          key={`wood-${section}`}
                          title="Wood Sketches"
                          description="Unique sketches on wood surfaces, creating rustic and natural artwork, A5 size. (45mins+)"
                          images={woodImages}
                          categoryIndex={1}
                          price={48}
                          onImageClick={handleImageClick}
                        />
                        <GalleryCard
                          key={`detailed-${section}`}
                          title="Detailed Portraits"
                          description="Intricate and detailed portraits with careful attention to every feature, A4 size. (4hrs+)"
                          images={detailedImages}
                          categoryIndex={2}
                          price={88}
                          onImageClick={handleImageClick}
                        />
                        <GalleryCard
                          key={`big-${section}`}
                          title="Big Sketches"
                          description="Large-scale sketches with high detail, A3 size. (8hrs+)"
                          images={bigImages}
                          categoryIndex={3}
                          price={158}
                          onImageClick={handleImageClick}
                        />
                      </div>
                      {/* Pricing and Time Information Section */}
                      <div className="my-4 px-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">
                          Pricing & Time Information
                        </h3>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-700">
                              Estimated Time:
                            </span>
                            <span className="text-gray-600">
                              3-7 working days
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-700">
                              Additional Person:
                            </span>
                            <span className="text-gray-600">
                              +50% per person
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-700">
                              Rush Order (24hrs):
                            </span>
                            <span className="text-gray-600">
                              +50% surcharge
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2">
                            <span className="font-medium text-gray-700">
                              Location:
                            </span>
                            <span className="text-gray-600">
                              Singapore only
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> All prices are in SGD. Time
                            estimates may vary based on complexity and detail
                            level. Contact us for custom quotes on large groups
                            or special requests.
                          </p>
                        </div>
                      </div>

                      <div className="my-4 px-4">
                        <ContactForm />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : section === "Contact" ? (
              <div className="quest-level">
                <div className="quest-desc"></div>
              </div>
            ) : section === "About" ? (
              <div className="quest-level">
                <div
                  className="quest-desc"
                  style={{
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-y",
                  }}
                >
                  {hasDescription(content) ? (
                    <TypingText
                      key={`about-${section}`}
                      text={content.description}
                      speed={60}
                      className="text-gray-700 leading-relaxed"
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ) : section === "Shop" ? (
              <div className="quest-level">
                <div
                  className="quest-desc"
                  style={{
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-y",
                  }}
                >
                  {hasDescription(content) ? (
                    <TypingText
                      key={`shop-${section}`}
                      text={content.description}
                      speed={60}
                      className="text-gray-700 leading-relaxed"
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ) : (
              <div className="quest-level">
                <div
                  className="quest-desc"
                  style={{
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-y",
                  }}
                >
                  {hasDescription(content) ? (
                    <TypingText
                      text={content.description}
                      speed={60}
                      className="text-gray-700 leading-relaxed"
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 py-3 px-4 flex justify-between items-center">
          <button className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-yellow-500 transition-colors">
            <a
              href="https://www.instagram.com/direct/t/115317676524782/"
              target="_blank"
            >
              Book Now
            </a>
          </button>
          <div className="flex gap-4">
            <a
              href="mailto:playingwithpencil@gmail.com"
              className="text-gray-600 hover:text-gray-900"
            >
              Email
            </a>
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
