"use client";
import ImageCarousel from "./ImageCarousel";

const sampleCarouselData = {
  items: [
    {
      id: 1,
      image: "/gallery/quick/Com_1.jpg",
      alt: "Quick sketch - Street portrait",
    },
    {
      id: 2,
      image: "/gallery/quick/Com_2.jpg",
      alt: "Quick sketch - Coffee shop customer",
    },
    {
      id: 3,
      image: "/gallery/quick/Com_3.jpg",
      alt: "Quick sketch - Busker",
    },
    {
      id: 4,
      image: "/gallery/quick/Com_4.jpg",
      alt: "Quick sketch - Wedding guest",
    },
    {
      id: 5,
      image: "/gallery/quick/Com_5.jpg",
      alt: "Quick sketch - Street musician",
    },
    {
      id: 6,
      image: "/gallery/quick/Com_6.jpg",
      alt: "Quick sketch - Market vendor",
    },
    {
      id: 7,
      image: "/gallery/quick/Com_7.jpg",
      alt: "Quick sketch - Tourist",
    },
    {
      id: 8,
      image: "/gallery/quick/Com_8.jpg",
      alt: "Quick sketch - Father's Day celebration",
    },
  ],
  title: "Quick Sketch Collection",
  description:
    "Capturing moments in 5-15 minutes. Each quick sketch tells a story of human connection, from street musicians to coffee shop regulars. These spontaneous portraits capture the essence of people in their natural moments.",
  features: [
    "5-15 minute sketches",
    "Street portraits",
    "Event sketching",
    "Spontaneous moments",
  ],
};

export default function CarouselSection() {
  return (
    <section className="carousel-section">
      <ImageCarousel {...sampleCarouselData} />
    </section>
  );
}
