import type { Metadata } from "next";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import HomeLanding from "@/components/site/HomeLanding";

export const metadata: Metadata = {
  title: "Playing with Pencil — Trace any picture with your phone",
  description:
    "A free trace tool: point your phone at paper, pick a photo and draw over it. Works on iPhone and Android, no app to install. Free 5-day face lessons for beginners.",
};

export default function Home() {
  return (
    <>
      <SiteNav />
      <HomeLanding />
      <SiteFooter />
    </>
  );
}
