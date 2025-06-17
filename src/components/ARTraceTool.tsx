import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Slider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

interface ARTraceToolProps {
  onClose: () => void;
}

const ARTraceTool: React.FC<ARTraceToolProps> = ({ onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0.5);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isControlMode, setIsControlMode] = useState(false);
  const [controlStartPos, setControlStartPos] = useState({ x: 0, y: 0 });
  const [controlStartScale, setControlStartScale] = useState(1);
  const [controlStartRotation, setControlStartRotation] = useState(0);
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(
    null
  );
  const [lastPinchAngle, setLastPinchAngle] = useState<number | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    console.log("ARTraceTool mounted");
    // Prevent default touch behaviors
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventDefault, { passive: false });

    // Initialize camera with back camera by default
    initializeCamera(false);

    return () => {
      console.log("ARTraceTool unmounted");
      document.removeEventListener("touchmove", preventDefault);
      // Clean up camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    };
  }, []); // Empty dependency array since we only want this to run on mount/unmount

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Handling image upload");
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      // 5MB limit
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setIsFixed(false);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image under 5MB");
    }
  };

  // Update camera initialization to use the current camera mode
  const initializeCamera = async (useFrontCamera: boolean = false) => {
    try {
      console.log("Initializing camera...", useFrontCamera ? "front" : "back");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: useFrontCamera ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      console.log("Camera stream obtained:", stream);

      if (videoRef.current) {
        console.log("Setting video source...");
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setIsFrontCamera(useFrontCamera);
        console.log("Camera initialized successfully");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Could not access camera. Please ensure camera permissions are granted."
      );
    }
  };

  // Add camera toggle function
  const toggleCamera = async () => {
    if (streamRef.current) {
      // Stop current stream
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Initialize with opposite camera
    await initializeCamera(!isFrontCamera);
  };

  // Handle image manipulation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFixed && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left - position.x,
        y: e.clientY - rect.top - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isFixed && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left - dragOffset.x,
        y: e.clientY - rect.top - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFixed) return;
    if (e.touches.length === 1 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setIsDragging(true);
      const touch = e.touches[0];
      setDragOffset({
        x: touch.clientX - rect.left - position.x,
        y: touch.clientY - rect.top - position.y,
      });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      // Initialize pinch tracking
      const initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const initialAngle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      );

      setLastPinchDistance(initialDistance);
      setLastPinchAngle(initialAngle);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isFixed) return;
    e.preventDefault();
    if (e.touches.length === 1 && isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - rect.left - dragOffset.x,
        y: touch.clientY - rect.top - dragOffset.y,
      });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      // Calculate current distance between touches
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      // Calculate current angle between touches
      const currentAngle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      );

      // Update scale based on pinch distance
      if (lastPinchDistance !== null) {
        const scaleDelta = currentDistance / lastPinchDistance;
        const newScale = Math.max(0.1, Math.min(5, scale * scaleDelta));
        setScale(newScale);
      }
      setLastPinchDistance(currentDistance);

      // Update rotation based on angle change
      if (lastPinchAngle !== null) {
        const angleDelta = currentAngle - lastPinchAngle;
        const degreesDelta = angleDelta * (180 / Math.PI);
        setRotation(rotation + degreesDelta);
      }
      setLastPinchAngle(currentAngle);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastPinchDistance(null);
    setLastPinchAngle(null);
  };

  const handleControlStart = (e: React.MouseEvent) => {
    setIsControlMode(true);
    setControlStartPos({ x: e.clientX, y: e.clientY });
    setControlStartScale(scale);
    setControlStartRotation(rotation);
  };

  const handleControlMove = (e: React.MouseEvent) => {
    if (!isControlMode) return;

    const deltaX = e.clientX - controlStartPos.x;
    const deltaY = e.clientY - controlStartPos.y;

    // Scale based on vertical movement
    const scaleDelta = deltaY * 0.01;
    const newScale = Math.max(0.1, Math.min(5, controlStartScale - scaleDelta));
    setScale(newScale);

    // Rotate based on horizontal movement
    const rotationDelta = deltaX * 0.5;
    setRotation(controlStartRotation + rotationDelta);
  };

  const handleControlEnd = () => {
    setIsControlMode(false);
  };

  useEffect(() => {
    if (isControlMode) {
      window.addEventListener(
        "mousemove",
        handleControlMove as unknown as EventListener
      );
      window.addEventListener("mouseup", handleControlEnd);
    }
    return () => {
      window.removeEventListener(
        "mousemove",
        handleControlMove as unknown as EventListener
      );
      window.removeEventListener("mouseup", handleControlEnd);
    };
  }, [isControlMode, controlStartPos, controlStartScale, controlStartRotation]);

  // Update handleCameraToggle to use the new toggle function
  const handleCameraToggle = async () => {
    console.log("Toggling camera");
    if (!isCameraActive) {
      await initializeCamera(isFrontCamera);
    } else {
      await toggleCamera();
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          width: "96%",
          height: "96%",
          backgroundColor: "white",
          zIndex: 99999,
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 100000,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 99999,
            overflow: "hidden",
            backgroundColor: "black",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 10002,
              transform: isFrontCamera ? "scaleX(-1)" : "none", // Only mirror for back camera
            }}
          />
        </Box>

        {image && (
          <Box
            sx={{
              position: "absolute",
              top: position.y,
              left: position.x,
              cursor: isFixed ? "default" : "move",
              zIndex: 100003,
              border: isDragging ? "2px dashed #1976d2" : "none",
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={imageRef}
              src={image}
              alt="Trace"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                opacity: opacity,
                pointerEvents: isFixed ? "none" : "auto",
                userSelect: "none",
                touchAction: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
                zIndex: 100003,
              }}
            />
            {!isFixed && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: -20,
                  right: -20,
                  width: 40,
                  height: 40,
                  backgroundColor: "#1976d2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "move",
                  zIndex: 100004,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  "@media (hover: hover)": {
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                  },
                }}
                onMouseDown={handleControlStart}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M12 2L12 22M2 12L22 12" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Box>
            )}
          </Box>
        )}

        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            gap: 2,
            alignItems: "center",
            zIndex: 99999,
          }}
        >
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<PhotoCameraIcon />}
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Upload Image
            </Button>
          </label>

          {image && (
            <>
              <Box sx={{ width: 200, color: "white" }}>
                <Slider
                  value={opacity}
                  onChange={(_, value) => setOpacity(value as number)}
                  min={0}
                  max={1}
                  step={0.1}
                  sx={{
                    color: "#1976d2",
                    "& .MuiSlider-thumb": {
                      backgroundColor: "#fff",
                    },
                    "& .MuiSlider-track": {
                      backgroundColor: "#1976d2",
                    },
                  }}
                />
              </Box>

              <IconButton
                onClick={() => setIsFixed(!isFixed)}
                sx={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                {isFixed ? <LockIcon /> : <LockOpenIcon />}
              </IconButton>
            </>
          )}

          <IconButton
            onClick={handleCameraToggle}
            sx={{
              backgroundColor: isCameraActive ? "#d32f2f" : "#1976d2",
              color: "white",
              "&:hover": {
                backgroundColor: isCameraActive ? "#c62828" : "#1565c0",
              },
            }}
          >
            <CameraAltIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ARTraceTool;
