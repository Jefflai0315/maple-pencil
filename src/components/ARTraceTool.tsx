import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Slider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import FlashOffIcon from "@mui/icons-material/FlashOff";
import Moveable from "react-moveable";

interface ARTraceToolProps {
  onClose: () => void;
}

const isMobile =
  (typeof window !== "undefined" &&
    /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    )) ||
  (typeof window !== "undefined" && window.innerWidth < 768);

const ARTraceTool: React.FC<ARTraceToolProps> = ({ onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0.5);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [strobeVisible, setStrobeVisible] = useState(true);

  // Add new state for resizing/rotating
  const moveableBoxRef = useRef<HTMLDivElement>(null);
  // Remove old frame state and logic
  // Add new box state for Moveable
  const [boxState, setBoxState] = useState({
    top: "100px",
    left: "100px",
    width: "400px",
    height: "400px",
    rotation: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [moveableReady, setMoveableReady] = useState(false);

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

  useEffect(() => {
    if (image && moveableBoxRef.current) {
      setMoveableReady(false); // reset first to force re-render
      setTimeout(() => setMoveableReady(true), 0);
    } else {
      setMoveableReady(false);
    }
  }, [image]);

  // Strobe effect: toggles overlay visibility at interval when strobeActive
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (strobeActive) {
      interval = setInterval(() => {
        setStrobeVisible((v) => !v);
      }, 350); // Flicker every 350ms
    } else {
      setStrobeVisible(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [strobeActive]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      // 5MB limit
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setImage(imageData);
        setIsFixed(false);

        // Create a new image to get dimensions
        const img = new Image();
        img.onload = () => {
          const imageWidth = img.naturalWidth;
          const imageHeight = img.naturalHeight;
          const ratio = imageWidth / imageHeight;

          // Calculate dimensions maintaining aspect ratio with width = 400px
          const width = 400;
          const height = width / ratio;

          // Calculate center position
          const centerX = (window.innerWidth - width) / 2;
          const centerY = (window.innerHeight - height) / 2;

          //reset the box state to the center of the screen
          setBoxState({
            top: `${centerY}px`,
            left: `${centerX}px`,
            width: `${width}px`,
            height: `${height}px`,
            rotation: 0,
          });
        };
        img.src = imageData;
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

  // Remove custom desktop handles and manipulation logic

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        zIndex: 99999,
        overflow: "hidden",
        m: 0,
        p: 0,
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 100013,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          },
          width: isMobile ? 48 : 40,
          height: isMobile ? 48 : 40,
        }}
      >
        <CloseIcon sx={{ fontSize: isMobile ? 24 : 20 }} />
      </IconButton>

      {/* Camera/Video Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 99998,
          overflow: "hidden",
          backgroundColor: "black",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            zIndex: 10002,
            transform: isFrontCamera ? "scaleX(-1)" : "none",
          }}
        />
      </Box>

      {/* Trace Image Target (the element Moveable controls) */}
      {image && (
        <Box
          ref={moveableBoxRef}
          sx={{
            position: "absolute",
            top: boxState.top,
            left: boxState.left,
            width: boxState.width,
            height: boxState.height,
            transform: `rotate(${boxState.rotation}deg)`, // rotation only
            transformOrigin: "50% 50%", // important for correct rotate/resize
            border: !isFixed ? "2px dashed #1976d2" : "none",
            zIndex: 100010,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: isFixed ? "none" : "auto",
          }}
          draggable={false}
          onDragStart={(e: React.DragEvent) => e.preventDefault()}
        >
          <img
            src={image}
            alt="Trace"
            style={{
              width: "100%",
              height: "100%",
              opacity: strobeActive ? (strobeVisible ? opacity : 0) : opacity,
              userSelect: "none",
              touchAction: "none",
              pointerEvents: "none",
            }}
            draggable={false}
          />
        </Box>
      )}

      {/* Moveable (render as a sibling, not a child of the target) */}
      {image && moveableReady && moveableBoxRef.current && !isFixed && (
        <Moveable
          target={moveableBoxRef.current}
          container={containerRef.current} // ensures overlay is correct in full-screen overlays
          draggable
          resizable
          rotatable
          scalable
          origin={false} // keep origin off; we’re using top-left
          renderDirections={["nw", "ne", "sw", "se"]}
          snappable
          keepRatio={true}
          throttleResize={isMobile ? 16 : 0} // 60fps throttle for mobile
          throttleDrag={isMobile ? 16 : 0}
          throttleRotate={isMobile ? 16 : 0}
          throttleScale={isMobile ? 16 : 0}
          onResize={({ target, width, height, delta }) => {
            if (delta[0]) target!.style.width = `${width}px`;
            if (delta[1]) target!.style.height = `${height}px`;
          }}
          onDrag={({ target, transform }) => {
            target!.style.transform = transform;
          }}
          onRotate={({ target, transform }) => {
            target!.style.transform = transform;
          }}
          onScale={({ target, transform, scale }) => {
            target!.style.transform = transform;
            console.log("Scaling", scale);
          }}
          pinchable={["rotatable", "scalable", "resizable"]} // Enable pinch for rotate, scale, and resize
          pinchThreshold={isMobile ? 0.05 : 0.1} // Very sensitive on mobile
          pinchOutside={true} // Allow pinching outside the target
          sx={{
            zIndex: 1000,
          }}
        />
      )}

      {/* Bottom Toolbar - Mobile Optimized */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: isMobile ? 1 : 2,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 1 : 2,
          alignItems: "center",
          zIndex: 100013,
        }}
      >
        {/* Top row for mobile */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: isMobile ? 1 : 2,
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
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
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
                minWidth: isMobile ? 80 : undefined,
                padding: isMobile ? "8px 12px" : undefined,
                fontSize: isMobile ? 12 : undefined,
                height: isMobile ? 40 : undefined,
              }}
            >
              {isMobile ? "Upload" : "Upload Image"}
            </Button>
          </label>

          {image && (
            <>
              <IconButton
                onClick={() => setIsFixed(!isFixed)}
                sx={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                  width: isMobile ? 40 : 40,
                  height: isMobile ? 40 : 40,
                }}
              >
                {isFixed ? <LockIcon /> : <LockOpenIcon />}
              </IconButton>

              <IconButton
                onClick={() => setStrobeActive((v) => !v)}
                sx={{
                  backgroundColor: strobeActive ? "#ffd600" : "#1976d2",
                  color: strobeActive ? "#333" : "white",
                  "&:hover": {
                    backgroundColor: strobeActive ? "#ffea00" : "#1565c0",
                  },
                  width: isMobile ? 40 : 40,
                  height: isMobile ? 40 : 40,
                }}
                title={strobeActive ? "Disable Strobe" : "Enable Strobe"}
              >
                {strobeActive ? <FlashOnIcon /> : <FlashOffIcon />}
              </IconButton>
            </>
          )}

          {/* <IconButton
            onClick={toggleCamera}
            sx={{
              backgroundColor: isCameraActive ? "#d32f2f" : "#1976d2",
              color: "white",
              "&:hover": {
                backgroundColor: isCameraActive ? "#c62828" : "#1565c0",
              },
              width: isMobile ? 40 : 40,
              height: isMobile ? 40 : 40,
            }}
          >
            <CameraAltIcon />
          </IconButton> */}
        </Box>

        {/* Bottom row for opacity slider on mobile */}
        {image && isMobile && (
          <Box sx={{ width: "100%", color: "white", px: 1 }}>
            <div
              style={{
                color: "white",
                fontSize: "12px",
                marginBottom: "4px",
                textAlign: "center",
              }}
            >
              Opacity
            </div>
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
                  width: 20,
                  height: 20,
                },
                "& .MuiSlider-track": {
                  backgroundColor: "#1976d2",
                  height: 4,
                },
                "& .MuiSlider-rail": {
                  height: 4,
                },
              }}
            />
          </Box>
        )}

        {/* Desktop opacity slider */}
        {image && !isMobile && (
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
        )}
      </Box>
    </Box>
  );
};

export default ARTraceTool;
