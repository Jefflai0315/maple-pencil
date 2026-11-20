import { redirect } from "next/navigation";

// The app landing is now the homepage.
export default function AppLandingPage() {
  redirect("/");
}
