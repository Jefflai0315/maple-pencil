import React, { useState, useEffect } from "react";
import WebcamCapture from "./WebcamCapture";
import { pencilSketchFromDataUrl } from "./pencilSketch";

const WebcamContainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const handleOpenWebcam = () => setIsOpen(true);
    window.addEventListener("openWebcamCapture", handleOpenWebcam);
    return () =>
      window.removeEventListener("openWebcamCapture", handleOpenWebcam);
  }, []);

  const handleCapture = async (imageData: string) => {
    setProcessing(true);
    try {
      const sketchDataUrl = await pencilSketchFromDataUrl(imageData, false);
      setCapturedImage(sketchDataUrl);
    } catch {
      setCapturedImage(imageData); // fallback to original if error
    }
    setProcessing(false);
    setIsOpen(false);
  };

  const handleClose = () => {
    setCapturedImage(null);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent("webcamClosed"));
  };

  const handleDownload = () => {
    if (!capturedImage) return;
    const link = document.createElement("a");
    link.href = capturedImage;
    link.download = `pencil-sketch-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen && !capturedImage && !processing) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      {isOpen && !capturedImage && !processing && (
        <WebcamCapture onCapture={handleCapture} onClose={handleClose} />
      )}
      {processing && (
        <div className="bg-white rounded-lg shadow-xl p-8 text-center text-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Processing pencil sketch...
        </div>
      )}
      {capturedImage && !processing && (
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Pencil Sketch Result
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="flex justify-center mb-4">
            <img
              src={capturedImage}
              alt="Pencil sketch"
              className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
            />
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Download Sketch
            </button>
            <button
              onClick={handleClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamContainer;
