"use client";
import { useState } from "react";

interface CarouselItem {
  id: number;
  image: string;
  alt: string;
}

interface ImageCarouselProps {
  items: CarouselItem[];
  title: string;
  description: string;
  features?: string[];
}

export default function ImageCarousel({
  items,
  title,
  description,
  features = [],
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  //   const nextSlide = () => {
  //     setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  //   };

  //   const prevSlide = () => {
  //     setCurrentIndex(
  //       (prevIndex) => (prevIndex - 1 + items.length) % items.length
  //     );
  //   };

  return (
    <div className="carousel-container">
      {/* Image Section */}
      <div className="image-section">
        <div className="image-wrapper">
          <img
            src={items[currentIndex].image}
            alt={items[currentIndex].alt}
            className="carousel-image"
          />
        </div>

        {/* Navigation Buttons */}
        {/* <button
          className="nav-button prev-button"
          onClick={prevSlide}
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="nav-button next-button"
          onClick={nextSlide}
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button> */}

        {/* Dots Indicator */}
        <div className="dots-container">
          {items.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Text Section */}
      <div className="text-section">
        <h2 className="carousel-title">{title}</h2>
        <p className="carousel-description">{description}</p>

        {features.length > 0 && (
          <div className="features-list">
            {features.map((feature, index) => (
              <div key={index} className="flex row gap-2">
                <div className="feature-bullet"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .carousel-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .image-section {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          max-width: 500px;
          aspect-ratio: 2/3;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .image-wrapper:hover .carousel-image {
          transform: scale(1.05);
        }

        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid #1f1f1f;
          z-index: 10;
        }

        .nav-button:hover {
          background: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .prev-button {
          left: -24px;
        }

        .next-button {
          right: -24px;
        }

        .dots-container {
          display: flex;
          gap: 8px;
          margin-top: 1rem;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background: #ddd;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot.active {
          background: #1f1f1f;
          transform: scale(1.2);
        }

        .dot:hover {
          background: #bbb;
        }

        .text-section {
          padding: 2rem;
        }

        .carousel-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1f1f1f;
          font-family: "Caveat", cursive;
        }

        .carousel-description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #666;
          margin-bottom: 2rem;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1rem;
          color: #444;
        }

        .feature-bullet {
          width: 8px;
          height: 8px;
          background: #1f1f1f;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .carousel-container {
            flex-direction: column;
            gap: 0.5rem;
            align-items: center;
            max-width: 600px;
          }

          .image-section {
            order: 1;
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .image-wrapper {
            aspect-ratio: 3/2;
            max-width: 300px;
            align-items: center;
            justify-content: center;
          }

          .carousel-image {
            width: 100%;
            max-width: 100%;
            max-height: none;
            aspect-ratio: 1/1;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .text-section {
            order: 2;
            text-align: center;
            padding: 0.5rem;
            width: 100%;
          }

          .carousel-title {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
          }

          .carousel-description {
            font-size: 0.8rem;
            margin-bottom: 0.5rem;
          }

          .features-list {
            gap: 0.3rem;
          }

          .dots-container {
            gap: 8px !important;
            margin-top: 0.3rem !important;
          }

          .dot {
            width: 12px !important;
            height: 12px !important;
            border-radius: 50% !important;
          }

          .dot.active {
            transform: scale(1.1) !important;
          }

          .nav-button {
            width: 40px;
            height: 40px;
          }

          .prev-button {
            left: 10px;
          }

          .next-button {
            right: 10px;
          }
        }
        @media (max-width: 555px) {
          .carousel-container {
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
}
