import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useGrowthBook } from "@growthbook/growthbook-react";
import {
  Box,
  Slider,
  IconButton,
  Drawer,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  TextField,
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
  IconWand,
  IconSend,
  IconCheck,
  IconAlertCircle,
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
  visible: boolean;
}

const isMobile =
  (typeof window !== "undefined" &&
    /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    )) ||
  (typeof window !== "undefined" && window.innerWidth < 768);

const ARTraceTool: React.FC<ARTraceToolProps> = ({ onClose }) => {
  const growthbook = useGrowthBook();
  const [image, setImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0.5);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(false);
  const [strobeActive, setStrobeActive] = useState(false);

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
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [aiPanelOpen, setAiPanelOpen] = useState<boolean>(false);
  const [aiPromptText, setAiPromptText] = useState<string>(
    "portrait sketch, high contrast line art, minimal background"
  );
  const [aiStatus, setAiStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [aiProgressText, setAiProgressText] = useState<string>("");
  const [aiErrorMessage, setAiErrorMessage] = useState<string>("");

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

  // Strobe effect: smooth pulsing animation when strobeActive
  useEffect(() => {
    if (strobeActive) {
      // Enable smooth pulsing - CSS animation will handle the fade in/out
    } else {
      // Disable pulsing, show normal opacity
    }
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

          // Use 80% of screen width, maintaining aspect ratio
          const width = Math.min(window.innerWidth * 0.8, 600); // Max 600px for very wide screens
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

  // Generate image from text prompt using GrowthBook feature flag to decide API
  const handleAIGenerateImage = async (promptText: string) => {
    try {
      const prompt = promptText?.trim();
      if (!prompt) return;

      setIsGeneratingImage(true);
      setAiStatus("generating");
      setAiErrorMessage("");

      // Check GrowthBook feature flag to decide which API to use
      const useGemini =
        growthbook?.feature("gemini-2.5-flash-image-preview")?.value === true;

      let res, data;

      if (useGemini) {
        // Use Gemini API
        setAiProgressText("Using Gemini API...");
        res = await fetch("/api/generate-image-gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        data = await res.json();

        // If Gemini fails, try Wavespeed as fallback
        if (!res.ok || !data?.imageUrl || data?.fallback) {
          console.log("Gemini failed, trying Wavespeed fallback...");
          setAiProgressText("Gemini failed, trying Wavespeed...");

          // Use Gemini's text response if available, otherwise use original prompt
          const enhancedPrompt = data?.textResponse || prompt;
          console.log("Using enhanced prompt for Wavespeed:", enhancedPrompt);

          res = await fetch("/api/generate-image-wavespeed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: enhancedPrompt }),
          });

          setAiProgressText("Waiting for Wavespeed result...");
          data = await res.json();
        }
      } else {
        // Use Wavespeed API directly
        setAiProgressText("Using Wavespeed API...");
        res = await fetch("/api/generate-image-wavespeed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        setAiProgressText("Waiting for Wavespeed result...");
        data = await res.json();
      }

      if (!res.ok || !data?.imageUrl) {
        const errMsg = data?.error || "Failed to generate image with both APIs";
        alert(errMsg);
        setIsGeneratingImage(false);
        setAiStatus("error");
        setAiErrorMessage(errMsg);
        return;
      }

      const generatedUrl: string = data.imageUrl;

      setSourceImage(generatedUrl);
      setImage(generatedUrl);
      setIsFixed(false);

      // Reset layers state on new image
      setLayers([]);
      setCurrentLayerIndex(0);
      setIsProcessingLayers(false);
      setSingleLayerMode(false);
      setShowLayers(false);

      // Center and size box based on generated image dimensions
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;
        const ratio = imageWidth / imageHeight;

        const width = Math.min(window.innerWidth * 0.8, 600);
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
      img.src = generatedUrl;
      setAiStatus("success");
      const finalSource = useGemini ? data?.source || "gemini" : "wavespeed";
      setAiProgressText(`Image generated successfully using ${finalSource}`);
    } catch (err) {
      console.error("AI image generation error:", err);
      alert("Could not generate image. Please try again.");
      setAiStatus("error");
      setAiErrorMessage(
        err instanceof Error ? err.message : "Unknown error occurred"
      );
    } finally {
      setIsGeneratingImage(false);
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
    let h = 0;
    let s = 0;
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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }, []);

  const getColorName = useCallback((h: number, s: number, l: number) => {
    if (s < 20) return l < 30 ? "Dark Gray" : l < 70 ? "Gray" : "Light Gray";
    if (l < 20) return "Dark";
    if (l > 80) return "Light";

    if (h < 30) return "Red";
    if (h < 90) return "Yellow";
    if (h < 150) return "Green";
    if (h < 210) return "Cyan";
    if (h < 270) return "Blue";
    if (h < 330) return "Magenta";
    return "Red";
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

      // Use deterministic initial centroids instead of random
      const centroids: { r: number; g: number; b: number }[] = [];
      for (let i = 0; i < numColors; i++) {
        // Spread centroids evenly across the pixel array for consistency
        const index = Math.floor((pixels.length / numColors) * i);
        centroids.push({ ...pixels[index] });
      }

      // K-means clustering with fixed number of iterations
      for (let iter = 0; iter < 15; iter++) {
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

        // Update centroids
        let converged = true;
        clusters.forEach((cluster, i) => {
          if (cluster.length > 0) {
            const avgR =
              cluster.reduce((sum, p) => sum + p.r, 0) / cluster.length;
            const avgG =
              cluster.reduce((sum, p) => sum + p.g, 0) / cluster.length;
            const avgB =
              cluster.reduce((sum, p) => sum + p.b, 0) / cluster.length;

            const newCentroid = {
              r: Math.round(avgR),
              g: Math.round(avgG),
              b: Math.round(avgB),
            };

            // Check for convergence
            if (colorDistance(centroids[i], newCentroid) > 1) {
              converged = false;
            }

            centroids[i] = newCentroid;
          }
        });

        // Early exit if converged
        if (converged) {
          console.log(`K-means converged after ${iter + 1} iterations`);
          break;
        }
      }

      // Sort centroids by luminance for consistent ordering
      centroids.sort((a, b) => {
        const luminanceA = 0.299 * a.r + 0.587 * a.g + 0.114 * a.b;
        const luminanceB = 0.299 * b.r + 0.587 * b.g + 0.114 * b.b;
        return luminanceA - luminanceB;
      });

      console.log(
        "Extracted colors:",
        centroids.map((c) => `(${c.r},${c.g},${c.b})`).join(", ")
      );
      return centroids;
    },
    [colorDistance]
  );

  const groupSimilarColors = useCallback(
    (
      colors: { r: number; g: number; b: number }[],
      mergeThreshold: number = 5 // higher more aggressive merging
    ) => {
      if (colors.length === 0) return [];

      const groups: { r: number; g: number; b: number }[][] = [];

      colors.forEach((color) => {
        let foundGroup = false;
        for (const group of groups) {
          if (colorDistance(color, group[0]) < mergeThreshold) {
            group.push(color);
            foundGroup = true;
            break;
          }
        }
        if (!foundGroup) {
          groups.push([color]);
        }
      });

      // For each group, use the most representative color (first color which is most common from k-means)
      // or compute the centroid if needed
      const groupedColors = groups.map((group) => {
        if (group.length === 1) {
          return group[0];
        }

        // Use the first color as it's typically the most dominant from k-means
        // But we could also compute average if needed
        const representative = group[0];

        console.log(
          `Merged ${group.length} similar colors into (${representative.r},${representative.g},${representative.b})`
        );
        return representative;
      });

      console.log(
        `Color grouping: ${colors.length} colors → ${groupedColors.length} groups`
      );
      return groupedColors;
    },
    [colorDistance]
  );

  const createColorLayers = useCallback(
    (
      imageData: ImageData,
      dominantColors: { r: number; g: number; b: number }[],
      minRegionSize: number
    ) => {
      const { width, height, data } = imageData;
      const layers: ColorLayer[] = [];

      dominantColors.forEach((targetColor, colorIndex) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        const layerImageData = ctx.createImageData(width, height);

        let pixelCount = 0;

        // Process each pixel and assign to nearest color
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a > 128) {
            const currentPixel = { r, g, b };

            // Find the closest dominant color to this pixel
            let closestColor = dominantColors[0];
            let minDistance = colorDistance(currentPixel, closestColor);

            dominantColors.forEach((color) => {
              const distance = colorDistance(currentPixel, color);
              if (distance < minDistance) {
                minDistance = distance;
                closestColor = color;
              }
            });

            // If this pixel belongs to the current target color layer
            if (closestColor === targetColor) {
              layerImageData.data[i] = r;
              layerImageData.data[i + 1] = g;
              layerImageData.data[i + 2] = b;
              layerImageData.data[i + 3] = a;
              pixelCount++;
            } else {
              // Make pixel transparent for this layer
              layerImageData.data[i + 3] = 0;
            }
          } else {
            // Transparent pixel
            layerImageData.data[i + 3] = 0;
          }
        }

        // Only include layers that meet the minimum size requirement
        if (pixelCount >= minRegionSize) {
          ctx.putImageData(layerImageData, 0, 0);
          const { h, s, l } = rgbToHsl(
            targetColor.r,
            targetColor.g,
            targetColor.b
          );

          layers.push({
            id: colorIndex,
            name: `${getColorName(h, s, l)} Layer`,
            canvas: canvas,
            dominantColor: targetColor,
            pixelCount,
            visible: true,
          });

          console.log(
            `Created layer "${getColorName(h, s, l)}" with ${pixelCount} pixels`
          );
        } else {
          console.log(
            `Skipped layer for color (${targetColor.r},${targetColor.g},${targetColor.b}) - only ${pixelCount} pixels (minimum: ${minRegionSize})`
          );
        }
      });

      console.log(
        `Created ${layers.length} color layers from ${dominantColors.length} colors`
      );
      return layers;
    },
    [colorDistance, rgbToHsl, getColorName]
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

        // Adaptive color count: start with fewer colors for simpler images
        const numColors = Math.min(
          12,
          Math.max(4, Math.floor(Math.sqrt(img.width * img.height) / 200))
        );

        const dominantColors = extractDominantColors(imageData, numColors);
        const mergedColors = groupSimilarColors(dominantColors);
        const newLayers = createColorLayers(imageData, mergedColors, 50); // Pass minRegionSize
        setLayers(newLayers);
        setCurrentLayerIndex(0);
        setIsProcessingLayers(false);
      };
      img.src = sourceImage;
    } catch (error) {
      console.error("Error processing layers:", error);
      setIsProcessingLayers(false);
    }
  }, [
    sourceImage,
    extractDominantColors,
    createColorLayers,
    groupSimilarColors,
  ]);

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
    if (isLayersMinimized) {
      // If minimized, just restore the drawer
      setIsLayersMinimized(false);
    } else if (!isLayersDrawerOpen) {
      // If closed, process layers if needed and open
      if (layers.length === 0 && sourceImage && !isProcessingLayers) {
        await processImageLayers();
      }
      setShowLayers(true);
      setIsLayersDrawerOpen(true);
    }
    // If already open and not minimized, do nothing (or could close if preferred)
  };

  const handleLayersDrawerClose = () => {
    setShowLayers(false);
    setIsLayersDrawerOpen(false);
    setIsLayersMinimized(false);
  };

  const handleMinimizeDrawer = () => {
    setIsLayersMinimized(true);
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
            style={
              {
                width: "100%",
                height: "100%",
                opacity: strobeActive ? opacity : opacity,
                userSelect: "none",
                touchAction: "none",
                pointerEvents: "none",
                animation: strobeActive
                  ? "pulse-fade 3s ease-in-out infinite"
                  : "none",
                transition: strobeActive ? "none" : "opacity 0.3s ease",
                "--max-opacity": opacity,
              } as React.CSSProperties & { "--max-opacity": number }
            }
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
            padding: { xs: "8px 14px 8px 14px", sm: "12px 18px 12px 18px" },
            gap: { xs: 2, sm: 3 },
          }}
        >
          {/* AI Compact Input Bar (toggle with AI button) */}
          {aiPanelOpen && (
            <Box
              sx={{
                position: "absolute",
                left: 12,
                right: 12,
                paddingX: 2,
                bottom: image ? 150 : 100,
                zIndex: 100022,
                backgroundColor: "rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 2,
                backdropFilter: "blur(6px)",
              }}
            >
              <TextField
                value={aiPromptText}
                onChange={(e) => setAiPromptText(e.target.value)}
                placeholder="Describe the image to generate"
                fullWidth
                size="small"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !isGeneratingImage &&
                    aiPromptText.trim()
                  ) {
                    handleAIGenerateImage(aiPromptText);
                  }
                }}
                sx={{
                  flex: 1,
                  "& .MuiInputBase-root": {
                    color: "white",
                    backgroundColor: "transparent",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {aiStatus === "generating" && (
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      border: "2px solid rgba(255,255,255,0.25)",
                      borderTop: "2px solid rgba(255,255,255,0.9)",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                    title={aiProgressText || "Generating..."}
                  />
                )}
                {aiStatus === "success" && (
                  <IconCheck size={16} color="#66bb6a" title="Success" />
                )}
                {aiStatus === "error" && (
                  <IconAlertCircle
                    size={16}
                    color="#ef5350"
                    title={aiErrorMessage || "Failed"}
                  />
                )}
                {aiStatus === "error" && (
                  <Button
                    size="small"
                    onClick={() => handleAIGenerateImage(aiPromptText)}
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      textTransform: "none",
                      minWidth: 0,
                      px: 8,
                    }}
                  >
                    Retry
                  </Button>
                )}
                <IconButton
                  onClick={() => handleAIGenerateImage(aiPromptText)}
                  disabled={isGeneratingImage || !aiPromptText.trim()}
                  sx={{
                    color: isGeneratingImage
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(255,255,255,0.95)",
                  }}
                  title={isGeneratingImage ? "Generating..." : "Generate"}
                >
                  <IconSend size={18} />
                </IconButton>
              </Box>
            </Box>
          )}

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

            {/* AI Generate Button */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <IconButton
                onClick={() => setAiPanelOpen((v) => !v)}
                disabled={isGeneratingImage}
                sx={{
                  backgroundColor: isGeneratingImage
                    ? "rgba(156,39,176,0.15)"
                    : "transparent",
                  border: `1px solid ${
                    isGeneratingImage
                      ? "rgba(156,39,176,0.35)"
                      : "rgba(255,255,255,0.2)"
                  }`,
                  color: isGeneratingImage
                    ? "#9c27b0"
                    : "rgba(255,255,255,0.9)",
                  "&:hover": {
                    backgroundColor: isGeneratingImage
                      ? "rgba(156,39,176,0.2)"
                      : "rgba(255,255,255,0.05)",
                    borderColor: isGeneratingImage
                      ? "rgba(156,39,176,0.45)"
                      : "rgba(255,255,255,0.3)",
                  },
                  width: 40,
                  height: 40,
                }}
              >
                <IconWand size={18} />
              </IconButton>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}
              >
                AI
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
              padding: "12px 10px 10px",
            }}
          >
            <Box
              sx={{
                maxWidth: 320,
                margin: "0 auto",
                display: "flex",
                flexDirection: "row",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" }}
              >
                Opacity
              </Typography>

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
              <Typography
                variant="caption"
                sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.9)" }}
              >
                {Math.round(opacity * 100)}%
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Layers Drawer - Compact Design */}
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
            maxHeight: "40vh",
          },
        }}
      >
        {/* Compact Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "8px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconPalette size={16} color="rgba(255,255,255,0.8)" />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.9rem",
              }}
            >
              Layers
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={handleMinimizeDrawer}
              sx={{
                color: "rgba(255,255,255,0.6)",
                width: 28,
                height: 28,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.8)",
                },
              }}
            >
              <IconMinus size={14} />
            </IconButton>
            <IconButton
              onClick={handleLayersDrawerClose}
              sx={{
                color: "rgba(255,255,255,0.6)",
                width: 28,
                height: 28,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.8)",
                },
              }}
            >
              <IconX size={14} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: "12px 16px 16px" }}>
          {/* Compact Processing indicator */}
          {isProcessingLayers && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                py: 2,
                backgroundColor: "rgba(255,255,255,0.03)",
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTop: "2px solid rgba(255,255,255,0.8)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}
              >
                Processing layers...
              </Typography>
            </Box>
          )}

          {/* Compact Layer controls */}
          {layers.length > 0 && (
            <>
              {/* Inline Layer navigation and info */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderRadius: 1,
                  p: "8px 12px",
                  mb: 1.5,
                }}
              >
                <IconButton
                  onClick={prevLayer}
                  disabled={currentLayerIndex === 0}
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    width: 24,
                    height: 24,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
                    "&:disabled": {
                      color: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  <IconPlayerSkipBack size={12} />
                </IconButton>

                <Box sx={{ textAlign: "center", flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {currentLayerIndex + 1} / {layers.length}
                  </Typography>
                  {layers[currentLayerIndex] && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: `rgb(${layers[currentLayerIndex].dominantColor.r}, ${layers[currentLayerIndex].dominantColor.g}, ${layers[currentLayerIndex].dominantColor.b})`,
                        fontSize: "0.65rem",
                        mt: 0.25,
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
                    width: 24,
                    height: 24,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
                    "&:disabled": {
                      color: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  <IconPlayerSkipForward size={12} />
                </IconButton>
              </Box>

              {/* Compact Progress visualization */}
              <Box sx={{ mb: 1.5 }}>
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
                        width: 24,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor:
                          index <= currentLayerIndex
                            ? `rgb(${layer.dominantColor.r}, ${layer.dominantColor.g}, ${layer.dominantColor.b})`
                            : "rgba(255,255,255,0.15)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border:
                          index === currentLayerIndex
                            ? "1px solid rgba(255,255,255,0.4)"
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

              {/* Compact Display mode toggle */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}
                >
                  Mode:
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={singleLayerMode}
                      onChange={(_, v) => setSingleLayerMode(v)}
                      size="small"
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
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "0.7rem",
                      }}
                    >
                      {singleLayerMode ? "Single" : "Cumulative"}
                    </Typography>
                  }
                  sx={{ margin: 0 }}
                />
              </Box>
            </>
          )}

          {/* Compact Empty state */}
          {layers.length === 0 && !isProcessingLayers && (
            <Box
              sx={{
                textAlign: "center",
                py: 2,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <Box sx={{ mb: 1, opacity: 0.3 }}>
                <IconPalette size={24} />
              </Box>
              <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                No layers yet. Processing starts automatically.
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* CSS for animations */}
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

        @keyframes pulse-fade {
          0% {
            opacity: var(--max-opacity);
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: var(--max-opacity);
          }
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
};

export default ARTraceTool;
