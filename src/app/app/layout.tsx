import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pencil Trace — Learn to Draw with Your Phone",
  description:
    "Turn any photo into a traceable sketch. Free tracing app by Playing with Pencil: draw a real eye in 4 steps.",
  openGraph: {
    title: "Pencil Trace — Learn to Draw with Your Phone",
    description:
      "Turn any photo into a traceable sketch. Free AR tracing with guided lessons.",
    url: "https://app.playingwithpencil.art",
    siteName: "Playing with Pencil",
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
