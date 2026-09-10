import type { Metadata } from "next";
import EyesResourcePage from "@/components/eyes/EyesResourcePage";

const TITLE = "Learn to Draw Eyes — Free Practice PDF | PlayingWithPencil";
const DESCRIPTION =
  "A free eyes practice worksheet from Jeff at PlayingWithPencil. Learn to draw eyes by seeing shapes, angles and proportions first — then download the PDF and practice.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "https://www.playingwithpencil.art/eyes",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.playingwithpencil.art/eyes",
    siteName: "Playing with pencil",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/eyes/crops/eye-smile-pair.jpg",
        width: 1200,
        height: 630,
        alt: "Pencil-drawn eyes from a PlayingWithPencil portrait",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/eyes/crops/eye-smile-pair.jpg"],
  },
};

export default function EyesPage() {
  return <EyesResourcePage />;
}
