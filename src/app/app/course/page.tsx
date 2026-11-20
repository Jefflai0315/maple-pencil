import { redirect } from "next/navigation";

// The old 5-day face course was retired; its lessons now live on the homepage
// and in the trace tool ("Draw the eye with me").
export default function CoursePage() {
  redirect("/#steps");
}
