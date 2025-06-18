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
  const [videoReady, setVideoReady] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to stop the video stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });

      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureImage = useCallback(() => {
    // Stop the video stream immediately to prevent glitch

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Clear canvas first
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop the video stream immediately
        stopStream();

        // Convert canvas to blob and then to File
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.png`, {
              type: "image/png",
            });

            // Process the file just like an uploaded file
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              if (result) {
                onCapture(result);
              }
            };
            reader.readAsDataURL(file);
          }
        }, "image/png");
      } else {
        console.error("Video not ready or invalid dimensions:", {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          readyState: video.readyState,
        });
        // Fallback: try with default dimensions
        if (context) {
          canvas.width = 640;
          canvas.height = 480;
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Stop the video stream immediately
          stopStream();

          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `capture-${Date.now()}.png`, {
                type: "image/png",
              });

              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                if (result) {
                  onCapture(result);
                }
              };
              reader.readAsDataURL(file);
            }
          }, "image/png");
        }
      }
    }
  }, [streamRef, onCapture, stopStream]);

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

          // Set up video ready handler
          videoRef.current.onloadeddata = () => {
            setVideoReady(true);
          };
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
      stopStream();
    };
  }, [onClose, stopStream]);

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
    stopStream();
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
      // Stop the video stream immediately
      stopStream();

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onCapture(result);
        }
      };
      reader.readAsDataURL(file);
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
          <button
            onClick={startCountdown}
            disabled={countdown !== null || !videoReady}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              position: "relative",
              zIndex: 10001,
              pointerEvents: "auto",
            }}
          >
            {countdown === null
              ? videoReady
                ? "Start Countdown"
                : "Loading Camera..."
              : "Taking Photo..."}
          </button>
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
