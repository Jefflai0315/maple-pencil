import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trace Tool — Playing with Pencil",
  description:
    "Point your phone at paper and trace any picture. Free, in your browser, no app to install.",
};

export default function CopyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
