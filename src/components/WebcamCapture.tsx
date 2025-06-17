import React, { useRef, useEffect, useState, useCallback } from "react";

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        onCapture(imageData);
      }
    }
  }, [streamRef, onCapture]);

  useEffect(() => {
    const initializeWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        // Show a user-friendly error message
        alert(
          "Please allow camera access to use this feature. If you've denied access, please update your browser settings."
        );
        onClose(); // Close the webcam capture if permission is denied
      }
    };

    initializeWebcam();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [onClose]);

  const startCountdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          captureImage();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    onClose();
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const file = files[0];
    if (file) {
      const reader = new FileReader();

      reader.readAsDataURL(file);
      //convert the image to a blob
      const blob = new Blob([file], { type: file.type });
      const url = URL.createObjectURL(blob);
      onCapture(url);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      style={{
        zIndex: 9999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg mx-4"
        style={{
          position: "relative",
          zIndex: 10000,
          pointerEvents: "auto",
        }}
      >
        <div className="relative w-full aspect-video bg-black rounded overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              transform: "scaleX(-1)", // Mirror the video
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <canvas ref={canvasRef} className="hidden" />
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
              <div className="text-8xl font-bold text-white drop-shadow-lg animate-pulse">
                {countdown}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          {/* <button
            onClick={startCountdown}
            disabled={countdown !== null}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              position: "relative",
              zIndex: 10001,
              pointerEvents: "auto",
            }}
          >
            {countdown === null ? "Start Countdown" : "Taking Photo..."}
          </button> */}
          <button
            onClick={handleCancel}
            className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg text-lg font-semibold hover:bg-gray-600"
            style={{
              position: "relative",
              zIndex: 10001,
              pointerEvents: "auto",
            }}
          >
            Cancel
          </button>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <label
              className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 cursor-pointer transition-colors duration-200 w-full text-center"
              style={{
                position: "relative",
                zIndex: 10001,
                pointerEvents: "auto",
              }}
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamCapture;
