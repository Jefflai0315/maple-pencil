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
        url: "/eyes/previews/page-1.jpg",
        width: 1241,
        height: 1754,
        alt: "Free Eyes Practice PDF — Step 1: Block the Structure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/eyes/previews/page-1.jpg"],
  },
};

export default function EyesPage() {
  return <EyesResourcePage />;
}
