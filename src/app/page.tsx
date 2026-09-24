import dynamic from "next/dynamic";

const AppSketch = dynamic(() => import("./App_Sketch"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-center gap-3 text-gray-700">
        <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
        <span className="text-sm">Loading interface…</span>
      </div>
    </div>
  ),
});

export default function Home() {
  return <AppSketch />;
}
