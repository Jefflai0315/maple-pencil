import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Slider,
  IconButton,
  Drawer,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  IconX,
  IconLock,
  IconLockOpen,
  IconBolt,
  IconBoltOff,
  IconVideo,
  IconPlayerStop,
  IconPalette,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconUpload,
  IconMinus,
  IconMaximize,
} from "@tabler/icons-react";
import Moveable from "react-moveable";

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
  const [layers, setLayers] = useState<ColorLayer[]>([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(0);
  const [isProcessingLayers, setIsProcessingLayers] = useState<boolean>(false);
  const [singleLayerMode, setSingleLayerMode] = useState<boolean>(false);
  const [isLayersDrawerOpen, setIsLayersDrawerOpen] = useState<boolean>(false);
  const [showLayers, setShowLayers] = useState<boolean>(false);
  const [isLayersMinimized, setIsLayersMinimized] = useState<boolean>(false);

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
          try {
            // Method 1: Try direct download first
            const link = document.createElement("a");
            link.href = url;
            link.download = `ar-trace-${Date.now()}.${fileExtension}`;
            link.style.display = "none";
            document.body.appendChild(link);

            // For iOS Safari, try different approaches
            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
              // iOS Safari - try to trigger download, fallback to new tab
              try {
                link.click();
                setTimeout(() => {
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }, 1000);

                // Show user instructions for iOS
                setTimeout(() => {
                  alert(
                    "Video recorded! If download didn't start automatically:\n1. Tap the video in the new tab\n2. Tap the share button\n3. Select 'Save to Photos'"
                  );
                }, 2000);
              } catch (iosError) {
                console.warn(
                  "iOS direct download failed, opening in new tab:",
                  iosError
                );
                window.open(url, "_blank");
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 5000);

                alert(
                  "Video opened in new tab. Tap and hold the video, then select 'Save to Photos' or 'Download'."
                );
              }
            } else {
              // Android and other mobile browsers
              try {
                link.click();
                setTimeout(() => {
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }, 1000);

                alert(
                  "Video saved! Check your Downloads folder or Gallery app."
                );
              } catch (androidError) {
                console.warn("Android direct download failed:", androidError);

                // Fallback: Try opening in new tab
                window.open(url, "_blank");
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 5000);

                alert(
                  "Download blocked by browser. Video opened in new tab - please save manually using browser's download option."
                );
              }
            }
          } catch (error) {
            console.error("Mobile download error:", error);

            // Final fallback: Show blob URL to user
            const fallbackMsg = `Recording saved but download was blocked by your browser or ad blocker.\n\nTo save the video:\n1. Copy this URL: ${url}\n2. Paste it in a new browser tab\n3. Right-click the video and select 'Save video as'`;

            if (
              confirm(fallbackMsg + "\n\nWould you like to copy the URL now?")
            ) {
              try {
                await navigator.clipboard.writeText(url);
                alert(
                  "URL copied to clipboard! Paste it in a new tab to access your video."
                );
              } catch (clipboardError) {
                console.warn("Clipboard access denied:", clipboardError);
                prompt("Copy this URL to access your video:", url);
              }
            }

            // Keep URL alive longer for manual access
            setTimeout(() => URL.revokeObjectURL(url), 30000);
          }
        } else {
          // Desktop - standard download
          try {
            const link = document.createElement("a");
            link.href = url;
            link.download = `ar-trace-${Date.now()}.${fileExtension}`;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }, 1000);

            alert("Video saved to your Downloads folder!");
          } catch (desktopError) {
            console.error("Desktop download error:", desktopError);
            alert(
              "Download failed. Please check your browser's download settings and try again."
            );
          }
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
      alert(
        "Could not start recording. Please check camera permissions and try again."
      );
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
        setIsProcessingLayers(false);
        setSingleLayerMode(false);
        setShowLayers(false);

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
    if (showLayers && layers.length > 0) {
      return createCompositeImage(currentLayerIndex) || image;
    }
    return image;
  }, [showLayers, layers, currentLayerIndex, createCompositeImage, image]);

  const handleLayersButtonClick = async () => {
    if (layers.length === 0 && sourceImage && !isProcessingLayers) {
      await processImageLayers();
    }
    setShowLayers(true);
    setIsLayersDrawerOpen(true);
  };

  const handleLayersDrawerClose = () => {
    setShowLayers(false);
    setIsLayersDrawerOpen(false);
    setIsLayersMinimized(false);
  };

  const handleMinimizeDrawer = () => {
    setIsLayersMinimized(true);
  };

  const handleMaximizeDrawer = () => {
    setIsLayersMinimized(false);
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
          <IconX size={isMobile ? 24 : 20} />
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

      {/* Bottom Toolbar - Minimalist Design */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          zIndex: 100013,
        }}
      >
        {/* Main Controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: { xs: "16px", sm: "20px" },
            gap: { xs: 2, sm: 3 },
          }}
        >
          {/* Left Group - Upload & Recording */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 2, sm: 3 },
            }}
          >
            {/* Upload Button */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
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
                <IconButton
                  component="span"
                  sx={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.9)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    width: 40,
                    height: 40,
                  }}
                >
                  <IconUpload size={18} />
                </IconButton>
              </label>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}
              >
                Upload
              </Typography>
            </Box>

            {/* Recording Button */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <IconButton
                onClick={isRecording ? stopRecording : startRecording}
                sx={{
                  backgroundColor: isRecording
                    ? "rgba(244,67,54,0.15)"
                    : "transparent",
                  border: `1px solid ${
                    isRecording
                      ? "rgba(244,67,54,0.3)"
                      : "rgba(255,255,255,0.2)"
                  }`,
                  color: isRecording ? "#f44336" : "rgba(255,255,255,0.9)",
                  "&:hover": {
                    backgroundColor: isRecording
                      ? "rgba(244,67,54,0.2)"
                      : "rgba(255,255,255,0.05)",
                    borderColor: isRecording
                      ? "rgba(244,67,54,0.4)"
                      : "rgba(255,255,255,0.3)",
                  },
                  width: 40,
                  height: 40,
                }}
              >
                {isRecording ? (
                  <IconPlayerStop size={18} />
                ) : (
                  <IconVideo size={18} />
                )}
              </IconButton>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}
              >
                {isRecording ? "Stop" : "Record"}
              </Typography>
            </Box>
          </Box>

          {/* Center Group - Image Controls */}
          {image && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 2, sm: 3 },
              }}
            >
              {/* Lock/Unlock */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <IconButton
                  onClick={() => setIsFixed(!isFixed)}
                  sx={{
                    backgroundColor: isFixed
                      ? "rgba(244,67,54,0.15)"
                      : "rgba(76,175,80,0.15)",
                    border: `1px solid ${
                      isFixed ? "rgba(244,67,54,0.3)" : "rgba(76,175,80,0.3)"
                    }`,
                    color: isFixed ? "#f44336" : "#4caf50",
                    "&:hover": {
                      backgroundColor: isFixed
                        ? "rgba(244,67,54,0.2)"
                        : "rgba(76,175,80,0.2)",
                      borderColor: isFixed
                        ? "rgba(244,67,54,0.4)"
                        : "rgba(76,175,80,0.4)",
                    },
                    width: 36,
                    height: 36,
                  }}
                >
                  {isFixed ? (
                    <IconLock size={16} />
                  ) : (
                    <IconLockOpen size={16} />
                  )}
                </IconButton>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.65rem" }}
                >
                  {isFixed ? "Locked" : "Move"}
                </Typography>
              </Box>

              {/* Strobe */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <IconButton
                  onClick={() => setStrobeActive((v) => !v)}
                  sx={{
                    backgroundColor: strobeActive
                      ? "rgba(255,193,7,0.2)"
                      : "transparent",
                    border: `1px solid ${
                      strobeActive
                        ? "rgba(255,193,7,0.4)"
                        : "rgba(255,255,255,0.2)"
                    }`,
                    color: strobeActive ? "#ffc107" : "rgba(255,255,255,0.9)",
                    "&:hover": {
                      backgroundColor: strobeActive
                        ? "rgba(255,193,7,0.25)"
                        : "rgba(255,255,255,0.05)",
                      borderColor: strobeActive
                        ? "rgba(255,193,7,0.5)"
                        : "rgba(255,255,255,0.3)",
                    },
                    width: 36,
                    height: 36,
                  }}
                >
                  {strobeActive ? (
                    <IconBolt size={16} />
                  ) : (
                    <IconBoltOff size={16} />
                  )}
                </IconButton>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.65rem" }}
                >
                  Strobe
                </Typography>
              </Box>

              {/* Layers */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <IconButton
                  onClick={handleLayersButtonClick}
                  sx={{
                    backgroundColor: showLayers
                      ? "rgba(156,39,176,0.2)"
                      : "transparent",
                    border: `1px solid ${
                      showLayers
                        ? "rgba(156,39,176,0.4)"
                        : "rgba(255,255,255,0.2)"
                    }`,
                    color: showLayers ? "#9c27b0" : "rgba(255,255,255,0.9)",
                    "&:hover": {
                      backgroundColor: showLayers
                        ? "rgba(156,39,176,0.25)"
                        : "rgba(255,255,255,0.05)",
                      borderColor: showLayers
                        ? "rgba(156,39,176,0.5)"
                        : "rgba(255,255,255,0.3)",
                    },
                    width: 36,
                    height: 36,
                  }}
                >
                  <IconPalette size={16} />
                </IconButton>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.65rem" }}
                >
                  Layers
                </Typography>
              </Box>
            </Box>
          )}

          {/* Right Group - Close */}
          {onClose && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <IconButton
                onClick={onClose}
                sx={{
                  backgroundColor: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.25)",
                    color: "rgba(255,255,255,0.9)",
                  },
                  width: 36,
                  height: 36,
                }}
              >
                <IconX size={16} />
              </IconButton>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem" }}
              >
                Close
              </Typography>
            </Box>
          )}
        </Box>

        {/* Opacity Slider */}
        {image && !isFixed && (
          <Box
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              padding: { xs: "12px 16px 16px", sm: "16px 20px 20px" },
            }}
          >
            <Box sx={{ maxWidth: 280, margin: "0 auto" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" }}
                >
                  Opacity
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.9)" }}
                >
                  {Math.round(opacity * 100)}%
                </Typography>
              </Box>
              <Slider
                value={opacity}
                onChange={(_, value) => setOpacity(value as number)}
                min={0}
                max={1}
                step={0.05}
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  height: 4,
                  "& .MuiSlider-thumb": {
                    backgroundColor: "#fff",
                    width: 12,
                    height: 12,
                    border: "1px solid rgba(0,0,0,0.1)",
                    "&:hover": {
                      boxShadow: "0 0 0 6px rgba(255,255,255,0.1)",
                    },
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    height: 4,
                    border: "none",
                  },
                  "& .MuiSlider-rail": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    height: 4,
                  },
                }}
              />
            </Box>
          </Box>
        )}

        {/* Minimal Help Text */}
        {image && !isFixed && (
          <Box sx={{ textAlign: "center", pb: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.65rem",
              }}
            >
              Drag to reposition • Pinch to resize
            </Typography>
          </Box>
        )}
      </Box>

      {/* Floating Maximize Button - appears when drawer is minimized */}
      {isLayersMinimized && showLayers && (
        <Box
          sx={{
            position: "absolute",
            bottom: "80px",
            right: "20px",
            zIndex: 100015,
          }}
        >
          <IconButton
            onClick={handleMaximizeDrawer}
            sx={{
              backgroundColor: "rgba(156,39,176,0.9)",
              color: "white",
              width: 48,
              height: 48,
              "&:hover": {
                backgroundColor: "rgba(156,39,176,1)",
                transform: "scale(1.05)",
              },
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              transition: "all 0.2s ease",
            }}
          >
            <IconMaximize size={20} />
          </IconButton>
        </Box>
      )}

      {/* Layers Drawer - Minimalist Design */}
      <Drawer
        anchor="bottom"
        open={isLayersDrawerOpen && !isLayersMinimized}
        onClose={handleLayersDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{ zIndex: 100020 }}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(12px)",
            color: "white",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "none",
            maxHeight: "60vh",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconPalette size={20} color="rgba(255,255,255,0.8)" />
            <Typography
              variant="h6"
              sx={{ fontWeight: 500, color: "rgba(255,255,255,0.9)" }}
            >
              Layers
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleMinimizeDrawer}
              sx={{
                color: "rgba(255,255,255,0.6)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.8)",
                },
              }}
            >
              <IconMinus size={18} />
            </IconButton>
            <IconButton
              onClick={handleLayersDrawerClose}
              sx={{
                color: "rgba(255,255,255,0.6)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.8)",
                },
              }}
            >
              <IconX size={18} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Processing indicator */}
          {isProcessingLayers && (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                borderRadius: 1,
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTop: "2px solid rgba(255,255,255,0.8)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 12px",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                Processing layers...
              </Typography>
            </Box>
          )}

          {/* Layer controls */}
          {layers.length > 0 && (
            <>
              {/* Layer navigation */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 500,
                  }}
                >
                  Step Through
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <IconButton
                    onClick={prevLayer}
                    disabled={currentLayerIndex === 0}
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      width: 32,
                      height: 32,
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.05)",
                      },
                      "&:disabled": {
                        color: "rgba(255,255,255,0.3)",
                        borderColor: "rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    <IconPlayerSkipBack size={16} />
                  </IconButton>

                  <Box sx={{ textAlign: "center", minWidth: 100 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "white", mb: 0.5 }}
                    >
                      {currentLayerIndex + 1} / {layers.length}
                    </Typography>
                    {layers[currentLayerIndex] && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: `rgb(${layers[currentLayerIndex].dominantColor.r}, ${layers[currentLayerIndex].dominantColor.g}, ${layers[currentLayerIndex].dominantColor.b})`,
                        }}
                      >
                        {layers[currentLayerIndex].name}
                      </Typography>
                    )}
                  </Box>

                  <IconButton
                    onClick={nextLayer}
                    disabled={currentLayerIndex === layers.length - 1}
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      width: 32,
                      height: 32,
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.05)",
                      },
                      "&:disabled": {
                        color: "rgba(255,255,255,0.3)",
                        borderColor: "rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    <IconPlayerSkipForward size={16} />
                  </IconButton>
                </Box>
              </Box>

              {/* Progress visualization */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 500,
                  }}
                >
                  Progress
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {layers.map((layer, index) => (
                    <Box
                      key={layer.id}
                      onClick={() => setCurrentLayerIndex(index)}
                      sx={{
                        width: 32,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          index <= currentLayerIndex
                            ? `rgb(${layer.dominantColor.r}, ${layer.dominantColor.g}, ${layer.dominantColor.b})`
                            : "rgba(255,255,255,0.15)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border:
                          index === currentLayerIndex
                            ? "1px solid rgba(255,255,255,0.3)"
                            : "1px solid transparent",
                        "&:hover": {
                          transform: "scaleY(1.5)",
                          opacity: 0.8,
                        },
                      }}
                      title={layer.name}
                    />
                  ))}
                </Box>
              </Box>

              {/* Display mode toggle */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 500,
                  }}
                >
                  Display
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={singleLayerMode}
                      onChange={(_, v) => setSingleLayerMode(v)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "rgba(255,255,255,0.9)",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "rgba(255,255,255,0.3)",
                          },
                        "& .MuiSwitch-track": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      {singleLayerMode
                        ? "Single layer only"
                        : "Cumulative layers"}
                    </Typography>
                  }
                />
              </Box>
            </>
          )}

          {/* Empty state */}
          {layers.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <Box sx={{ mb: 2, opacity: 0.3 }}>
                <IconPalette size={40} />
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                No layers yet
              </Typography>
              <Typography variant="caption">
                Switch to Color Layers to process
              </Typography>
            </Box>
          )}
        </Box>
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
