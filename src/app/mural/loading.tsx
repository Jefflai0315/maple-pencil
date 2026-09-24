export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-700">
        <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
        <span className="text-sm">Loading mural…</span>
      </div>
    </div>
  );
}

