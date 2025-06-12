import React, { useState, useEffect } from "react";
import WebcamCapture from "./WebcamCapture";
import P5SketchPopup from "./P5SketchPopup";

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
    <div className="fixed inset-0 z-50 bg-black/10 flex items-center justify-center">
      {isOpen && !capturedImage && (
        <WebcamCapture onCapture={handleCapture} onClose={handleClose} />
      )}
      {capturedImage && (
        <div className="bg-white rounded-lg shadow-xl p-4 relative">
          <P5SketchPopup
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
