import type { Metadata } from "next";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import HomePlayful from "@/components/site/HomePlayful";

export const metadata: Metadata = {
  title: "About Jeff — Playing with Pencil",
  description:
    "Jeff Lai draws people: live sketching at events, portrait commissions and art + tech experiences in Singapore.",
};

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <HomePlayful />
      <SiteFooter />
    </>
  );
}
