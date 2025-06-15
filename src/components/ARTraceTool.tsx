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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    console.log("ARTraceTool mounted");
    return () => {
      console.log("ARTraceTool unmounted");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

  // Handle camera activation
  const handleCameraToggle = async () => {
    console.log("Toggling camera");
    if (!isCameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setIsCameraActive(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Could not access camera");
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    }
  };

  // Handle image manipulation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFixed) {
      setIsDragging(true);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isFixed) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          x: e.clientX - rect.left - dragOffset.x,
          y: e.clientY - rect.top - dragOffset.y,
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePinch = (e: React.TouchEvent) => {
    if (isFixed) return;

    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      // Update scale based on pinch distance
      setScale(distance / 100);

      // Calculate rotation
      const angle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      );
      setRotation(angle * (180 / Math.PI));
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
        zIndex: 1000,
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
          width: "80%",
          height: "80%",
          backgroundColor: "white",
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
            zIndex: 1002,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {image && (
          <Box
            sx={{
              position: "absolute",
              top: position.y,
              left: position.x,
              cursor: isFixed ? "default" : "move",
              zIndex: 1001,
              border: isDragging ? "2px dashed #1976d2" : "none",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handlePinch}
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
                transform: `scale(${scale}) rotate(${rotation}deg)`,
              }}
            />
          </Box>
        )}

        {isCameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
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
            zIndex: 1001,
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
