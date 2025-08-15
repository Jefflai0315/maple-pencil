import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Button,
  Slider,
  IconButton,
  Drawer,
  Typography,
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import FlashOffIcon from "@mui/icons-material/FlashOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import StopIcon from "@mui/icons-material/Stop";
import Moveable from "react-moveable";
import PaletteIcon from "@mui/icons-material/Palette";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";

interface ARTraceToolProps {
  onClose?: () => void | null;
}

// Define ColorLayer for layers UI
interface ColorLayer {
  id: number;
  canvas: HTMLCanvasElement;
  dominantColor: { r: number; g: number; b: number };
  name: string;
  pixelCount: number;
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
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [strobeVisible, setStrobeVisible] = useState(true);

  // New: keep original upload separate from display image
  const [sourceImage, setSourceImage] = useState<string | null>(null);

  // Layers state
  const [viewMode, setViewMode] = useState<"original" | "layers">("original");
  const [layers, setLayers] = useState<ColorLayer[]>([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(0);
  const [isProcessingLayers, setIsProcessingLayers] = useState<boolean>(false);
  const [singleLayerMode, setSingleLayerMode] = useState<boolean>(false);
  const [isLayersDrawerOpen, setIsLayersDrawerOpen] = useState<boolean>(false);

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Custom pinch-to-zoom state
  const [isPinching, setIsPinching] = useState(false);
  const initialDistanceRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(1);
  const [currentScale, setCurrentScale] = useState<number>(1);

  // Helper function to calculate distance between two touches
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Custom touch handlers for pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && !isFixed) {
      setIsPinching(true);
      initialDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
      initialScaleRef.current = currentScale;
      e.preventDefault();
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPinching && e.touches.length === 2 && !isFixed) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scaleRatio = currentDistance / initialDistanceRef.current;
      const newScale = Math.max(
        0.5,
        Math.min(3, initialScaleRef.current * scaleRatio)
      );

      setCurrentScale(newScale);

      if (moveableBoxRef.current) {
        const currentWidth = parseFloat(boxState.width);
        const currentHeight = parseFloat(boxState.height);

        const newWidth = (currentWidth / currentScale) * newScale;
        const newHeight = (currentHeight / currentScale) * newScale;

        setBoxState((prev) => ({
          ...prev,
          width: `${newWidth}px`,
          height: `${newHeight}px`,
        }));

        moveableBoxRef.current.style.width = `${newWidth}px`;
        moveableBoxRef.current.style.height = `${newHeight}px`;
      }

      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPinching) {
      setIsPinching(false);
      e.preventDefault();
    }
  };

  // Video recording functions
  const startRecording = async () => {
    if (!streamRef.current) {
      alert(
        "Camera not available. Please ensure camera permissions are granted."
      );
      return;
    }

    try {
      // Create a new MediaRecorder with the current stream - prioritize MP4
      const mimeType = MediaRecorder.isTypeSupported("video/mp4")
        ? "video/mp4"
        : MediaRecorder.isTypeSupported("video/mp4;codecs=h264")
        ? "video/mp4;codecs=h264"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        ? "video/webm;codecs=vp8"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType,
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        const fileExtension = mimeType.includes("mp4") ? "mp4" : "webm";

        // Create download link for mobile devices
        const url = URL.createObjectURL(blob);

        if (isMobile) {
          // For mobile devices, try to save to gallery
          try {
            // Create a temporary link element
            const link = document.createElement("a");
            link.href = url;
            link.download = `ar-trace-${Date.now()}.${fileExtension}`;

            // For iOS Safari, we need to trigger download differently
            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
              // iOS Safari doesn't support direct download, so we'll open in new tab
              window.open(url, "_blank");
            } else {
              // For Android and other mobile browsers
              link.click();
            }

            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 1000);

            alert("Video saved! Check your downloads or gallery.");
          } catch (error) {
            console.error("Error saving video:", error);
            alert(
              "Video recorded but couldn't save automatically. Check your browser downloads."
            );
          }
        } else {
          // For desktop, trigger download
          const link = document.createElement("a");
          link.href = url;
          link.download = `ar-trace-${Date.now()}.${fileExtension}`;
          link.click();

          // Clean up
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      setRecordingTime(0);
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }

      // Clean up camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      // setIsCameraActive(false);
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setSourceImage(imageData);
        setImage(imageData);
        setIsFixed(false);

        // Reset layers state on new upload
        setLayers([]);
        setCurrentLayerIndex(0);
        setViewMode("original");
        setIsProcessingLayers(false);
        setSingleLayerMode(false);

        // Create a new image to get dimensions and center box
        const img = new Image();
        img.onload = () => {
          const imageWidth = img.naturalWidth;
          const imageHeight = img.naturalHeight;
          const ratio = imageWidth / imageHeight;

          const width = 400;
          const height = width / ratio;

          const centerX = (window.innerWidth - width) / 2;
          const centerY = (window.innerHeight - height) / 2;

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

  // ---------- Color Processing (ported from ar-tracking) ----------
  const colorDistance = useCallback(
    (
      color1: { r: number; g: number; b: number },
      color2: { r: number; g: number; b: number }
    ) => {
      const dr = color1.r - color2.r;
      const dg = color1.g - color2.g;
      const db = color1.b - color2.b;
      return Math.sqrt(dr * dr + dg * dg + db * db);
    },
    []
  );

  const rgbToHsl = useCallback((r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }, []);

  const extractDominantColors = useCallback(
    (imageData: ImageData, numColors: number) => {
      const pixels: { r: number; g: number; b: number }[] = [];
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a > 128) {
          pixels.push({ r, g, b });
        }
      }

      const centroids: { r: number; g: number; b: number }[] = [];
      for (let i = 0; i < numColors; i++) {
        const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
        centroids.push({ ...randomPixel });
      }

      for (let iter = 0; iter < 10; iter++) {
        const clusters: { r: number; g: number; b: number }[][] = Array(
          numColors
        )
          .fill(null)
          .map(() => []);

        pixels.forEach((pixel) => {
          let minDist = Infinity;
          let clusterIndex = 0;
          centroids.forEach((centroid, i) => {
            const dist = colorDistance(pixel, centroid);
            if (dist < minDist) {
              minDist = dist;
              clusterIndex = i;
            }
          });
          clusters[clusterIndex].push(pixel);
        });

        clusters.forEach((cluster, i) => {
          if (cluster.length > 0) {
            const avgR =
              cluster.reduce((sum, p) => sum + p.r, 0) / cluster.length;
            const avgG =
              cluster.reduce((sum, p) => sum + p.g, 0) / cluster.length;
            const avgB =
              cluster.reduce((sum, p) => sum + p.b, 0) / cluster.length;
            centroids[i] = {
              r: Math.round(avgR),
              g: Math.round(avgG),
              b: Math.round(avgB),
            };
          }
        });
      }

      return centroids;
    },
    [colorDistance]
  );

  const createColorLayers = useCallback(
    async (
      imageData: ImageData,
      dominantColors: { r: number; g: number; b: number }[]
    ) => {
      const width = imageData.width;
      const height = imageData.height;
      const data = imageData.data;
      const newLayers: ColorLayer[] = [];
      const colorThreshold = 35;
      const minRegionSize = 100;

      for (
        let colorIndex = 0;
        colorIndex < dominantColors.length;
        colorIndex++
      ) {
        const dominantColor = dominantColors[colorIndex];
        const layerCanvas = document.createElement("canvas");
        layerCanvas.width = width;
        layerCanvas.height = height;
        const layerCtx = layerCanvas.getContext("2d")!;
        const layerImageData = layerCtx.createImageData(width, height);
        const layerData = layerImageData.data;

        let pixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          const pixelColor = { r, g, b };
          const distance = colorDistance(pixelColor, dominantColor);

          if (distance <= colorThreshold && a > 128) {
            layerData[i] = r;
            layerData[i + 1] = g;
            layerData[i + 2] = b;
            layerData[i + 3] = a;
            pixelCount++;
          } else {
            layerData[i] = 0;
            layerData[i + 1] = 0;
            layerData[i + 2] = 0;
            layerData[i + 3] = 0;
          }
        }

        if (pixelCount > minRegionSize) {
          layerCtx.putImageData(layerImageData, 0, 0);

          const hsl = rgbToHsl(
            dominantColor.r,
            dominantColor.g,
            dominantColor.b
          );

          newLayers.push({
            id: colorIndex,
            canvas: layerCanvas,
            dominantColor,
            pixelCount,
            name: `${hsl.l < 50 ? "Dark" : "Light"} ${
              hsl.s < 20
                ? "Gray"
                : hsl.h < 30
                ? "Red"
                : hsl.h < 90
                ? "Yellow"
                : hsl.h < 150
                ? "Green"
                : hsl.h < 210
                ? "Cyan"
                : hsl.h < 270
                ? "Blue"
                : hsl.h < 330
                ? "Magenta"
                : "Red"
            }`,
          });
        }
      }

      newLayers.sort((a, b) => {
        const hslA = rgbToHsl(
          a.dominantColor.r,
          a.dominantColor.g,
          a.dominantColor.b
        );
        const hslB = rgbToHsl(
          b.dominantColor.r,
          b.dominantColor.g,
          b.dominantColor.b
        );
        return hslA.l - hslB.l;
      });

      return newLayers;
    },
    [colorDistance, rgbToHsl]
  );

  const processImageLayers = useCallback(async () => {
    if (!sourceImage) return;
    setIsProcessingLayers(true);
    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const dominantColors = extractDominantColors(imageData, 6);
        const newLayers = await createColorLayers(imageData, dominantColors);
        setLayers(newLayers);
        setCurrentLayerIndex(0);
        setIsProcessingLayers(false);
      };
      img.src = sourceImage;
    } catch (error) {
      console.error("Error processing layers:", error);
      setIsProcessingLayers(false);
    }
  }, [sourceImage, extractDominantColors, createColorLayers]);

  const createCompositeImage = useCallback(
    (layerIndex: number) => {
      if (layers.length === 0) return null;
      const first = layers[0];
      const canvas = document.createElement("canvas");
      canvas.width = first.canvas.width;
      canvas.height = first.canvas.height;
      const ctx = canvas.getContext("2d")!;

      if (singleLayerMode) {
        if (layers[layerIndex]) {
          ctx.drawImage(layers[layerIndex].canvas, 0, 0);
        }
      } else {
        for (let i = 0; i <= layerIndex; i++) {
          if (layers[i]) ctx.drawImage(layers[i].canvas, 0, 0);
        }
      }
      return canvas.toDataURL();
    },
    [layers, singleLayerMode]
  );

  const displayImage = useMemo(() => {
    if (viewMode === "layers" && layers.length > 0) {
      return createCompositeImage(currentLayerIndex) || image;
    }
    return image;
  }, [viewMode, layers, currentLayerIndex, createCompositeImage, image]);

  const handleViewModeChange = async (newMode: "original" | "layers") => {
    if (newMode === "layers" && layers.length === 0 && sourceImage) {
      await processImageLayers();
    }
    setViewMode(newMode);
  };

  const nextLayer = () => {
    if (currentLayerIndex < layers.length - 1) {
      setCurrentLayerIndex((i) => i + 1);
    }
  };
  const prevLayer = () => {
    if (currentLayerIndex > 0) {
      setCurrentLayerIndex((i) => i - 1);
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
        // setIsCameraActive(true);
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

  // // Add camera toggle function
  // const toggleCamera = async () => {
  //   if (streamRef.current) {
  //     // Stop current stream
  //     streamRef.current.getTracks().forEach((track) => track.stop());
  //     streamRef.current = null;
  //   }
  //   // Initialize with opposite camera
  //   await initializeCamera(!isFrontCamera);
  // };

  // Remove custom desktop handles and manipulation logic

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100dvw",
        height: "100dvh",
        backgroundColor: "black",
        zIndex: 99999,
        overflow: "hidden",
        m: 0,
        p: 0,
      }}
    >
      {/* Recording indicator */}
      {isRecording && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 100014,
            backgroundColor: "rgba(255, 0, 0, 0.8)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: isMobile ? 14 : 16,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              backgroundColor: "red",
              borderRadius: "50%",
              animation: "pulse 1s infinite",
            }}
          />
          REC {formatRecordingTime(recordingTime)}
        </Box>
      )}

      {/* Close Button */}
      {onClose && (
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
      )}

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
          // Custom touch handlers for pinch-to-zoom
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={displayImage || image || ""}
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
      {image &&
        moveableReady &&
        moveableBoxRef.current &&
        !isFixed &&
        !isPinching && (
          <Moveable
            target={moveableBoxRef.current}
            container={containerRef.current} // ensures overlay is correct in full-screen overlays
            draggable
            resizable
            rotatable
            scalable={false}
            origin={false} // keep origin off; we're using top-left
            renderDirections={["nw", "ne", "sw", "se"]}
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
            // Disable pinchable - using custom implementation
            pinchable={false}
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

          {/* Recording Button */}
          <IconButton
            onClick={isRecording ? stopRecording : startRecording}
            sx={{
              backgroundColor: isRecording ? "#d32f2f" : "#1976d2",
              color: "white",
              "&:hover": {
                backgroundColor: isRecording ? "#c62828" : "#1565c0",
              },
              width: isMobile ? 40 : 40,
              height: isMobile ? 40 : 40,
            }}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? <StopIcon /> : <VideocamIcon />}
          </IconButton>

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

              {/* Layers Drawer Toggle */}
              <IconButton
                onClick={() => setIsLayersDrawerOpen(true)}
                sx={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  "&:hover": { backgroundColor: "#1565c0" },
                  width: isMobile ? 40 : 40,
                  height: isMobile ? 40 : 40,
                }}
                title="Layers"
              >
                <PaletteIcon />
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

      {/* Layers Drawer */}
      <Drawer
        anchor="bottom"
        open={isLayersDrawerOpen}
        onClose={() => setIsLayersDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ zIndex: 100020 }}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0,0,0,0.95)",
            backdropFilter: "blur(10px)",
            color: "white",
            p: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1">Layers</Typography>
          <IconButton
            onClick={() => setIsLayersDrawerOpen(false)}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* View mode toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          size="small"
          onChange={(_, newMode) => newMode && handleViewModeChange(newMode)}
          sx={{
            mb: 2,
            "& .MuiToggleButton-root": {
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
            },
          }}
        >
          <ToggleButton value="original">Original</ToggleButton>
          <ToggleButton value="layers">
            {isProcessingLayers ? "Processing..." : "Color layers"}
          </ToggleButton>
        </ToggleButtonGroup>

        {viewMode === "layers" && (
          <>
            {isProcessingLayers && (
              <Typography variant="body2" sx={{ color: "#90CAF9", mb: 1 }}>
                Processing color layers...
              </Typography>
            )}

            {!isProcessingLayers && layers.length > 0 && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <IconButton
                    onClick={prevLayer}
                    disabled={currentLayerIndex === 0}
                    sx={{ color: "white" }}
                  >
                    <SkipPreviousIcon />
                  </IconButton>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    Step {currentLayerIndex + 1} of {layers.length}
                  </Typography>
                  <IconButton
                    onClick={nextLayer}
                    disabled={currentLayerIndex === layers.length - 1}
                    sx={{ color: "white" }}
                  >
                    <SkipNextIcon />
                  </IconButton>
                </Box>

                {/* Progress bars */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "center",
                    flexWrap: "wrap",
                    mb: 1,
                  }}
                >
                  {layers.map((layer, index) => (
                    <Box
                      key={layer.id}
                      onClick={() => setCurrentLayerIndex(index)}
                      sx={{
                        width: 28,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          index <= currentLayerIndex
                            ? `rgb(${layer.dominantColor.r}, ${layer.dominantColor.g}, ${layer.dominantColor.b})`
                            : "rgba(255,255,255,0.2)",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Box>

                {/* Single layer toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={singleLayerMode}
                      onChange={(_, v) => setSingleLayerMode(v)}
                    />
                  }
                  label={singleLayerMode ? "Single layer" : "Cumulative"}
                />

                {/* Current layer info */}
                {layers[currentLayerIndex] && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "rgba(255,255,255,0.7)",
                      mt: 1,
                    }}
                  >
                    {layers[currentLayerIndex].name}
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </Drawer>

      {/* CSS for recording indicator animation */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};

export default ARTraceTool;
