import { useEffect, useRef, useState } from "react";

interface SavedSketch {
  id: string;
  name: string;
  dataURL: string;
  dateSaved: number;
}

interface SketchCanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SketchCanvas = ({ isOpen, onClose }: SketchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [savedSketches, setSavedSketches] = useState<SavedSketch[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedSketch, setSelectedSketch] = useState<SavedSketch | null>(
    null
  );
  const [sketchName, setSketchName] = useState("");
  const [canvasScale, setCanvasScale] = useState(1);

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Load saved sketches from localStorage on mount
  useEffect(() => {
    const sketches = JSON.parse(localStorage.getItem("sketches") || "[]");
    setSavedSketches(sketches);
  }, []);

  // Initialize canvas size and style
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Original dimensions
    const originalWidth = 485;
    const originalHeight = 380;

    // Calculate new dimensions maintaining aspect ratio
    const newWidth = Math.min(originalWidth, window.innerWidth * 0.7); // 70% of screen width
    const newHeight = (newWidth * originalHeight) / originalWidth;

    // Calculate scale factor
    const scale = newWidth / originalWidth;
    setCanvasScale(scale);

    // Set canvas dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    // If a sketch is selected, load it
    if (selectedSketch) {
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = selectedSketch.dataURL;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [selectedSketch]);

  // Drawing helpers
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setLastX(x);
    setLastY(y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    setLastX(x);
    setLastY(y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Clear canvas helper
  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSelectedSketch(null);
    setSketchName("");
  };

  // Save sketch to localStorage
  const saveSketch = () => {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL();
    const name = sketchName.trim() || `Sketch ${new Date().toLocaleString()}`;

    const newSketch: SavedSketch = {
      id: Date.now().toString(),
      name,
      dataURL,
      dateSaved: Date.now(),
    };

    const updatedSketches = [newSketch, ...savedSketches];
    localStorage.setItem("sketches", JSON.stringify(updatedSketches));
    setSavedSketches(updatedSketches);
    setSelectedSketch(newSketch);
    alert(`Saved "${name}"!`);
  };

  // Load sketch from gallery
  const loadSketch = (sketch: SavedSketch) => {
    setSelectedSketch(sketch);
    setIsGalleryOpen(false);
  };

  // Delete sketch from gallery
  const deleteSketch = (id: string) => {
    if (!confirm("Are you sure you want to delete this sketch?")) return;
    const updatedSketches = savedSketches.filter((s) => s.id !== id);
    localStorage.setItem("sketches", JSON.stringify(updatedSketches));
    setSavedSketches(updatedSketches);
    if (selectedSketch?.id === id) {
      clearCanvas();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-transparent max-w-[90vw] max-h-[90dvh] p-4 flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-15 right-10 pixel-button w-10 py-1 rounded z-10"
          style={{
            top: `calc(35% -  ${5 * canvasScale}vh)`,
            transform: "translateY(-50%)",
          }}
        >
          X
        </button>

        {/* Easel frame */}
        <div className="relative w-[90vw] max-w-[700px] h-[90dvh] max-h-[800px]">
          <img
            src="/NPC/easel.png"
            alt="Easel"
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* Canvas positioned within the easel frame */}
          <div
            className="absolute left-[15%] w-[70%] overflow-hidden"
            style={{
              top: `calc(50% -  ${5 * canvasScale}dvh)`,
              height: `calc(47% - 17dvh)`,
              transform: "translateY(-50%)",
            }}
          >
            <canvas
              ref={canvasRef}
              className="border-4 border-black pixel-border rounded-md cursor-pencil touch-none w-full h-full bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Controls positioned below the easel */}
          <div className="absolute w-full bottom-[10%] px-[5%] flex flex-col sm:flex-row gap-3 items-center justify-between">
            <input
              type="text"
              placeholder="Name your sketch"
              value={sketchName}
              onChange={(e) => setSketchName(e.target.value)}
              className="pixel-font border-2 border-black rounded-md px-2 py-1 w-full sm:max-w-xs bg-white"
            />
            <div className="flex gap-2">
              <button
                onClick={clearCanvas}
                className="pixel-button bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Clear
              </button>
              <button
                onClick={saveSketch}
                className="pixel-button bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="pixel-button bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Gallery
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Modal */}
        {isGalleryOpen && (
          <div
            className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 flex flex-col items-center justify-start p-4 overflow-auto pixel-font text-white z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsGalleryOpen(false);
            }}
          >
            <h3 className="text-xl mb-4 select-none">Your Sketch Gallery</h3>
            {savedSketches.length === 0 && (
              <p className="select-none">No sketches saved yet.</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl w-full">
              {savedSketches.map((sketch) => (
                <div
                  key={sketch.id}
                  className="border-2 border-white rounded-md p-1 bg-[#222]"
                  title={sketch.name}
                >
                  <img
                    src={sketch.dataURL}
                    alt={sketch.name}
                    className="w-full h-auto cursor-pointer pixelated-image"
                    onClick={() => loadSketch(sketch)}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="truncate">{sketch.name}</span>
                    <button
                      className="text-red-500 font-bold hover:text-red-700"
                      onClick={() => deleteSketch(sketch.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="mt-6 pixel-button bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Close Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
