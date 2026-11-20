import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Trace Tool — Playing with Pencil",
  description:
    "Point your phone at paper and trace any picture. Free, in your browser, no app to install.",
};

// Pinching resizes the picture in the trace tool, so page zoom is off here.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function CopyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
