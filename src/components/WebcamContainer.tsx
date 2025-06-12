import React, { useState, useEffect, useCallback, useRef } from "react";
import WebcamCapture from "./WebcamCapture";
import dynamic from "next/dynamic";

// Dynamically import p5sketch
const P5Sketch = dynamic(() => import("../app/p5sketch/page"), { ssr: false });

const WebcamContainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenWebcam = () => setIsOpen(true);
    window.addEventListener("openWebcamCapture", handleOpenWebcam);
    return () =>
      window.removeEventListener("openWebcamCapture", handleOpenWebcam);
  }, []);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setIsOpen(false);
  };

  const handleClose = () => {
    setCapturedImage(null);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent("webcamClosed"));
  };

  if (!isOpen && !capturedImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      {isOpen && !capturedImage && (
        <div className="bg-white rounded-lg shadow-xl p-4 max-w-2xl w-full mx-4">
          <WebcamCapture onCapture={handleCapture} onClose={handleClose} />
        </div>
      )}
      {capturedImage && (
        <div className="bg-white rounded-lg shadow-xl p-4 relative">
          <P5Sketch
            key={capturedImage}
            capturedImage={capturedImage}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  );
};

export default WebcamContainer;
