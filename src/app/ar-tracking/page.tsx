"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Slider,
  IconButton,
  Typography,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import PaletteIcon from "@mui/icons-material/Palette";
import ImageIcon from "@mui/icons-material/Image";
import LayersIcon from "@mui/icons-material/Layers";
import LayersClear from "@mui/icons-material/LayersClear";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import type {
  Mesh,
  Material,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  MeshToonMaterial,
  SpriteMaterial,
} from "three";

/* ========= Minimal types (A-Frame & THREE helpers) ========= */

type MappedMaterial =
  | MeshBasicMaterial
  | MeshLambertMaterial
  | MeshPhongMaterial
  | MeshStandardMaterial
  | MeshPhysicalMaterial
  | MeshToonMaterial
  | SpriteMaterial;

interface AFrameEntity extends HTMLElement {
  setAttribute(type: string, value: unknown): void;
  setAttribute(component: string, property: string, value: unknown): void;
  getObject3D(type: string): unknown;
}

declare global {
  interface HTMLElementEventMap {
    object3dset: CustomEvent<{ type: string }>;
    object3dremove: CustomEvent<{ type: string }>;
  }
}

interface ColorLayer {
  id: number;
  canvas: HTMLCanvasElement;
  dominantColor: { r: number; g: number; b: number };
  name: string;
  pixelCount: number;
}

/* ========= Loading States ========= */
enum LoadingState {
  INITIAL = "initial",
  CHECKING_FIRST_TIME = "checking_first_time",
  CAMERA_PERMISSION = "camera_permission",
  LOADING_AFRAME = "loading_aframe",
  INITIALIZING_AR = "initializing_ar",
  READY = "ready",
  ERROR = "error",
}

interface LoadingScreenProps {
  loadingState: LoadingState;
  isFirstTime: boolean;
  onRetry?: () => void;
  progress: number;
}

function LoadingScreen({
  loadingState,
  isFirstTime,
  onRetry,
  progress,
}: LoadingScreenProps) {
  const [dots, setDots] = useState("");

  // Animated dots for loading states
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getLoadingMessage = () => {
    switch (loadingState) {
      case LoadingState.CHECKING_FIRST_TIME:
        return "Preparing AR experience...";
      case LoadingState.CAMERA_PERMISSION:
        return "Requesting camera access...";
      case LoadingState.LOADING_AFRAME:
        return isFirstTime
          ? "Loading AR components (this may take a moment on first visit)..."
          : "Loading AR components...";
      case LoadingState.INITIALIZING_AR:
        return "Initializing augmented reality...";
      case LoadingState.ERROR:
        return "Failed to initialize AR. Please try again.";
      default:
        return "Loading...";
    }
  };

  const getSubMessage = () => {
    if (loadingState === LoadingState.ERROR) {
      return "Make sure you have granted camera permissions and are using a supported browser.";
    }
    if (isFirstTime && loadingState !== LoadingState.READY) {
      return "First time loading may take 10-30 seconds while we download AR components.";
    }
    return "";
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        color: "white",
        padding: 3,
      }}
    >
      {/* Main Icon */}
      <Box sx={{ mb: 3 }}>
        {loadingState === LoadingState.CAMERA_PERMISSION ? (
          <CameraAltIcon sx={{ fontSize: 60, color: "#1976d2" }} />
        ) : (
          <ViewInArIcon sx={{ fontSize: 60, color: "#1976d2" }} />
        )}
      </Box>

      {/* Main Loading Message */}
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        {getLoadingMessage()}
        {dots}
      </Typography>

      {/* Progress Bar */}
      {loadingState !== LoadingState.ERROR && (
        <Box sx={{ width: "80%", maxWidth: 400, mb: 2 }}>
          <LinearProgress
            variant={progress > 0 ? "determinate" : "indeterminate"}
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(255,255,255,0.2)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#1976d2",
              },
            }}
          />
        </Box>
      )}

      {/* Sub Message */}
      {getSubMessage() && (
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            textAlign: "center",
            color: "rgba(255,255,255,0.7)",
            maxWidth: 400,
          }}
        >
          {getSubMessage()}
        </Typography>
      )}

      {/* First Time Tips */}
      {isFirstTime && loadingState !== LoadingState.ERROR && (
        <Box
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            border: "1px solid rgba(25, 118, 210, 0.3)",
            borderRadius: 2,
            padding: 2,
            maxWidth: 400,
            mb: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ textAlign: "center", color: "#90CAF9" }}
          >
            💡 <strong>First time here?</strong>
            <br />
            We&apos;re downloading AR components in the background. This only
            happens once and makes future visits much faster!
          </Typography>
        </Box>
      )}

      {/* Retry Button for Error State */}
      {loadingState === LoadingState.ERROR && onRetry && (
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
            mt: 2,
          }}
        >
          Try Again
        </Button>
      )}

      {/* Loading Steps Indicator */}
      {loadingState !== LoadingState.ERROR && (
        <Box sx={{ mt: 3, display: "flex", gap: 1, alignItems: "center" }}>
          {[
            LoadingState.CAMERA_PERMISSION,
            LoadingState.LOADING_AFRAME,
            LoadingState.INITIALIZING_AR,
          ].map((state) => {
            const isComplete =
              Object.values(LoadingState).indexOf(loadingState) >
              Object.values(LoadingState).indexOf(state);
            const isCurrent = loadingState === state;

            return (
              <Box
                key={state}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: isComplete
                    ? "#4caf50"
                    : isCurrent
                    ? "#1976d2"
                    : "rgba(255,255,255,0.3)",
                  transition: "background-color 0.3s ease",
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/* ===================== Component ===================== */

export default function ARTrackingPage() {
  const arContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<AFrameEntity | null>(null);
  const planeRef = useRef<AFrameEntity | null>(null);
  const imgAssetRef = useRef<HTMLImageElement | null>(null);
  const meshRef = useRef<Mesh | null>(null);

  const [image, setImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(1.0);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // New layer functionality
  const [viewMode, setViewMode] = useState<"original" | "layers">("original");
  const [layers, setLayers] = useState<ColorLayer[]>([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(0);
  const [isProcessingLayers, setIsProcessingLayers] = useState<boolean>(false);
  const [showLayerControls, setShowLayerControls] = useState<boolean>(false);

  // New display mode toggles
  const [singleLayerMode, setSingleLayerMode] = useState<boolean>(false);

  // New loading states
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.INITIAL
  );
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  /* ---------- Color Processing Functions ---------- */

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
    let h, s, l;
    h = s = l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
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
      const pixels = [];
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

        pixels.forEach((pixel: { r: number; g: number; b: number }) => {
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

      // Sort by luminance (darkest to lightest) for proper artist workflow
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
    if (!image) return;

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
      img.src = image;
    } catch (error) {
      console.error("Error processing layers:", error);
      setIsProcessingLayers(false);
    }
  }, [image, extractDominantColors, createColorLayers]);

  const createCompositeImage = useCallback(
    (layerIndex: number) => {
      if (layers.length === 0) return null;

      const firstLayer = layers[0];
      const canvas = document.createElement("canvas");
      canvas.width = firstLayer.canvas.width;
      canvas.height = firstLayer.canvas.height;
      const ctx = canvas.getContext("2d")!;

      if (singleLayerMode) {
        // Draw only the current layer
        if (layers[layerIndex]) {
          ctx.drawImage(layers[layerIndex].canvas, 0, 0);
        }
      } else {
        // Draw layers up to current index (cumulative)
        for (let i = 0; i <= layerIndex; i++) {
          if (layers[i]) {
            ctx.drawImage(layers[i].canvas, 0, 0);
          }
        }
      }

      return canvas.toDataURL();
    },
    [layers, singleLayerMode, image]
  );

  /* ---------- Check if first time user ---------- */
  useEffect(() => {
    setLoadingState(LoadingState.CHECKING_FIRST_TIME);
    const hasVisited = localStorage.getItem("ar-visited");
    const isFirst = !hasVisited;
    setIsFirstTime(isFirst);

    // Mark as visited
    if (isFirst) {
      localStorage.setItem("ar-visited", "true");
    }

    // Simulate checking time
    setTimeout(() => {
      setLoadingState(LoadingState.CAMERA_PERMISSION);
      setLoadingProgress(10);
    }, 500);
  }, []);

  /* ---------- Global CSS so the video & canvas fill/cover ---------- */

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "arjs-video-cover";
    style.textContent = `
      html, body { 
        margin: 0 !important; 
        padding: 0 !important; 
        height: 100% !important; 
        width: 100% !important;
        overflow: hidden !important; 
      }
      #ar-root, #ar-root a-scene { 
        position: fixed !important; 
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important; 
        height: 100vh !important;
        height: 100dvh !important;
        margin: 0 !important;
        padding: 0 !important;
        z-index: 1000 !important;
      }
      /* Canvas styling */
      #ar-root canvas.a-canvas {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        object-fit: cover !important;
        z-index: 1001 !important;
      }
      
      /* Critical: Force AR.js video to fill screen */
      #arjs-video, 
      video[id*="arjs"], 
      .arjs-video,
      a-scene video {
        position: fixed !important;
        top: 0 !important; 
        left: 0 !important;
        width: 100vw !important; 
        height: 100vh !important;
        height: 100dvh !important;
        object-fit: cover !important;
        object-position: center center !important;
        transform: none !important;
        z-index: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
      }
      
      /* Target all possible AR.js video selectors */
      video {
        position: fixed !important;
        top: 0 !important; 
        left: 0 !important;
        width: 100vw !important; 
        height: 100vh !important;
        object-fit: cover !important;
        object-position: center center !important;
        z-index: 0 !important;
      }
      @viewport {
        width: device-width;
        zoom: 1.0;
        user-zoom: fixed;
      }

    `;
    document.head.appendChild(style);
    return () => document.getElementById("arjs-video-cover")?.remove();
  }, []);

  // Belt & suspenders: re-apply styles after AR.js creates the <video>, and on viewport changes.
  function styleArjsVideo() {
    const v = document.getElementById("arjs-video") as HTMLVideoElement | null;
    if (!v) return;
    v.style.position = "fixed";
    v.style.top = "0";
    v.style.left = "0";
    v.style.width = "100vw";
    v.style.height = "100dvh";
    v.style.objectFit = "cover";
    v.style.objectPosition = "center center";
    v.style.transform = "none";
    v.style.zIndex = "0";
  }
  useEffect(() => {
    styleArjsVideo();
    const id = window.setInterval(() => {
      if (document.getElementById("arjs-video")) {
        styleArjsVideo();
        clearInterval(id);
      }
    }, 100);

    const onResize = () => styleArjsVideo();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  /* ---------- Helpers for texture refresh ---------- */

  function isMappedMaterial(m: Material): m is MappedMaterial {
    return "map" in m;
  }

  function markTextureNeedsUpdate(material: Material | Material[]) {
    const mark = (m: Material) => {
      if (isMappedMaterial(m) && m.map) m.map.needsUpdate = true;
      m.needsUpdate = true;
    };
    if (Array.isArray(material)) {
      material.forEach(mark);
    } else {
      mark(material);
    }
  }

  /* ---------- Create scene once ---------- */

  useEffect(() => {
    if (
      !arContainerRef.current ||
      sceneRef.current ||
      loadingState !== LoadingState.CAMERA_PERMISSION
    )
      return;

    setLoadingState(LoadingState.LOADING_AFRAME);
    setLoadingProgress(30);

    const initializeAR = async () => {
      try {
        // Simulate A-Frame loading time for first-time users
        if (isFirstTime) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setLoadingProgress(60);

        const scene = document.createElement(
          "a-scene"
        ) as unknown as AFrameEntity;
        scene.setAttribute("embedded", "");
        // Keep alpha true so the video is visible behind the canvas
        scene.setAttribute(
          "renderer",
          "antialias: true; alpha: true; vrModeEnabled: false"
        );
        scene.setAttribute("vr-mode-ui", "enabled: false");
        // displayWidth/Height hints are optional; AR.js will size based on video & canvas
        scene.setAttribute(
          "arjs",
          "sourceType: webcam; debugUIEnabled: false;"
        );
        scene.style.width = "100%";
        scene.style.height = "100%";

        setLoadingState(LoadingState.INITIALIZING_AR);
        setLoadingProgress(80);

        // Assets
        const assets = document.createElement("a-assets");
        const img = document.createElement("img");
        img.id = "uploaded-image";
        img.crossOrigin = "anonymous";
        assets.appendChild(img);
        scene.appendChild(assets);
        imgAssetRef.current = img;

        // Marker
        const marker = document.createElement(
          "a-marker"
        ) as unknown as AFrameEntity;
        marker.setAttribute("type", "pattern");
        marker.setAttribute("url", "/AR/pattern-hiro.patt");

        // Plane (anchored content)
        const plane = document.createElement(
          "a-plane"
        ) as unknown as AFrameEntity;
        plane.id = "imagePlane";
        // i want to set a few cm lower than the tracked image
        plane.setAttribute("position", "0 0 ");
        plane.setAttribute("rotation", "-90 0 0"); // lie flat on marker
        plane.setAttribute(
          "material",
          "shader: flat; transparent: true; opacity: 1"
        );
        // StopGap: make the plane size dynamic based on screen ratio
        const screenRatio = 1024 / 768;
        const currentRatio = window.innerWidth / window.innerHeight;
        const scaleFactor = currentRatio / screenRatio;
        const w = 4 / scaleFactor;
        const h = 4;
        plane.setAttribute("width", w.toString());
        plane.setAttribute("height", h.toString());

        // Cache THREE mesh when ready
        plane.addEventListener(
          "object3dset",
          (e: CustomEvent<{ type: string }>) => {
            if (e.detail?.type === "mesh") {
              meshRef.current = plane.getObject3D("mesh") as Mesh | null;
            }
          }
        );

        marker.appendChild(plane);
        scene.appendChild(marker);

        // Camera
        const camera = document.createElement(
          "a-entity"
        ) as unknown as AFrameEntity;
        camera.setAttribute("camera", "");
        scene.appendChild(camera);

        if (arContainerRef.current) {
          arContainerRef.current.appendChild(scene);
        }

        sceneRef.current = scene;
        planeRef.current = plane;

        // Wait a moment for everything to initialize
        setTimeout(() => {
          setLoadingProgress(100);
          setTimeout(() => {
            setLoadingState(LoadingState.READY);
          }, 500);
        }, 1000);
      } catch (error) {
        console.error("AR initialization failed:", error);
        setLoadingState(LoadingState.ERROR);
      }
    };

    initializeAR();
  }, [loadingState, isFirstTime]);

  /* ---------- Reactive updates (no scene rebuild) ---------- */

  // Handle image display based on current mode and layer
  useEffect(() => {
    if (!imgAssetRef.current || !image) return;

    const updateImage = async () => {
      let displayImage = image;

      if (viewMode === "layers" && layers.length > 0) {
        const compositeImage = createCompositeImage(currentLayerIndex);
        if (compositeImage) {
          displayImage = compositeImage;
        }
      }

      imgAssetRef.current!.onload = () => {
        const mesh = meshRef.current;
        if (!mesh) return;
        markTextureNeedsUpdate(mesh.material);
      };
      imgAssetRef.current!.src = displayImage;

      if (planeRef.current) {
        planeRef.current.setAttribute("material", "src", "#uploaded-image");
      }
    };

    updateImage();
  }, [image, viewMode, currentLayerIndex, layers, createCompositeImage]);

  // Opacity updates immediately
  useEffect(() => {
    if (!planeRef.current) return;
    planeRef.current.setAttribute("material", "transparent", true);
    planeRef.current.setAttribute("material", "opacity", opacity);
    planeRef.current.setAttribute("material", "alphaTest", 0.01);
    planeRef.current.setAttribute("material", "side", "double");
    // Also reflect on underlying THREE material (nice to have)
    const mat = meshRef.current?.material;
    if (mat) {
      markTextureNeedsUpdate(mat);
    }
  }, [opacity]);

  // Size: recompute width/height from scale & image aspect
  useEffect(() => {
    if (!planeRef.current) return;

    if (imageDimensions) {
      const aspect = imageDimensions.width / imageDimensions.height;
      const screenRatio = 1024 / 768;
      const currentRatio = window.innerWidth / window.innerHeight;
      console.log("screenRatio", screenRatio);
      console.log("currentRatio", currentRatio);
      const scaleFactor = currentRatio / screenRatio;
      console.log("scaleFactor", scaleFactor);

      const baseW = 4 * scale; // meters
      const w = baseW / scaleFactor;
      const h = baseW / aspect;
      planeRef.current.setAttribute("width", w.toString());
      planeRef.current.setAttribute("height", h.toString());
      //Force texture update to ensure it stretches correctly
      const mesh = meshRef.current;
      if (mesh) {
        markTextureNeedsUpdate(mesh.material);
      }
    } else {
      planeRef.current.setAttribute("width", (4 * scale).toString());
      planeRef.current.setAttribute("height", (4 * scale).toString());
    }
  }, [scale, imageDimensions]);

  // Rotation around center
  useEffect(() => {
    if (!planeRef.current) return;
    planeRef.current.setAttribute("rotation", `-90 0 ${rotation}`);
  }, [rotation]);

  /* ---------- Upload handler ---------- */

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setImage(imageData);

        // Reset layers when new image is uploaded
        setLayers([]);
        setCurrentLayerIndex(0);
        setViewMode("original");
        setShowLayerControls(false);

        const img = new Image();
        img.onload = () => {
          setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };
        img.src = imageData;
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image under 5MB");
    }
  };

  const handleRetry = () => {
    setLoadingState(LoadingState.INITIAL);
    setLoadingProgress(0);
    // Clean up existing scene
    if (sceneRef.current && arContainerRef.current) {
      if (arContainerRef.current) {
        arContainerRef.current.removeChild(sceneRef.current);
      }
      sceneRef.current = null;
      planeRef.current = null;
      meshRef.current = null;
    }
  };

  const handleViewModeChange = async (newMode: "original" | "layers") => {
    if (newMode === "layers" && layers.length === 0 && image) {
      await processImageLayers();
    }
    setViewMode(newMode);
    setShowLayerControls(newMode === "layers");
  };

  const nextLayer = () => {
    if (currentLayerIndex < layers.length - 1) {
      setCurrentLayerIndex(currentLayerIndex + 1);
    }
  };

  const prevLayer = () => {
    if (currentLayerIndex > 0) {
      setCurrentLayerIndex(currentLayerIndex - 1);
    }
  };

  /* ===================== UI ===================== */

  return (
    <>
      {loadingState !== LoadingState.READY && (
        <LoadingScreen
          loadingState={loadingState}
          isFirstTime={isFirstTime}
          onRetry={handleRetry}
          progress={loadingProgress}
        />
      )}

      <div
        id="ar-root"
        ref={arContainerRef}
        style={{
          margin: 0,
          overflow: "hidden",
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          opacity: loadingState === LoadingState.READY ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      />
      {/* Bottom Toolbar */}
      {loadingState === LoadingState.READY && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: { xs: 1, sm: 2 },
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            zIndex: 100013,
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Main Controls Row */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 2 },
              alignItems: "center",
              mb: showLayerControls ? { xs: 1, sm: 2 } : 0,
              flexWrap: "wrap",
              justifyContent: "space-between",
              paddingX: 2,
            }}
          >
            {/* Upload Button */}
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
                  "&:hover": { backgroundColor: "#1565c0" },
                  minWidth: { xs: 80, sm: 120 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  padding: { xs: "6px 12px", sm: "8px 16px" },
                }}
              >
                Upload
              </Button>
            </label>

            {/* View Mode Toggle (only show when image is uploaded) */}
            {image && (
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                size="small"
                onChange={(_, newMode) =>
                  newMode && handleViewModeChange(newMode)
                }
                sx={{
                  "& .MuiToggleButton-root": {
                    color: "white",
                    borderColor: "rgba(255,255,255,0.3)",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    padding: { xs: "4px 8px", sm: "6px 12px" },
                    "&.Mui-selected": {
                      backgroundColor: "#1976d2",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#1565c0",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  },
                }}
              >
                <ToggleButton value="original" aria-label="original image">
                  <ImageIcon
                    sx={{
                      mr: { xs: 0.5, sm: 1 },
                      fontSize: { xs: 16, sm: 20 },
                    }}
                  />
                  <Box sx={{ display: { xs: "none", sm: "inline" } }}>
                    Original
                  </Box>
                </ToggleButton>
                <ToggleButton value="layers" aria-label="color layers">
                  <PaletteIcon
                    sx={{
                      mr: { xs: 0.5, sm: 1 },
                      fontSize: { xs: 16, sm: 20 },
                    }}
                  />
                  <Box sx={{ display: { xs: "none", sm: "inline" } }}>
                    {isProcessingLayers ? "Processing..." : "Layers"}
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* Outline Toggle (only show in original mode) */}
            {/* {image && viewMode === "original" && (
              <IconButton
                onClick={() => setShowOutline(!showOutline)}
                sx={{
                  backgroundColor: showOutline
                    ? "#1976d2"
                    : "rgba(255,255,255,0.1)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: showOutline
                      ? "#1565c0"
                      : "rgba(255,255,255,0.2)",
                  },
                }}
              >
                <BorderAllIcon />
              </IconButton>
            )} */}

            {/* Lock Button */}
            {image && (
              <IconButton
                onClick={() => setIsLocked(!isLocked)}
                sx={{
                  backgroundColor: isLocked ? "#d32f2f" : "#1976d2",
                  color: "white",
                  "&:hover": {
                    backgroundColor: isLocked ? "#c62828" : "#1565c0",
                  },
                }}
              >
                {isLocked ? <LockIcon /> : <LockOpenIcon />}
              </IconButton>
            )}

            {/* Basic Controls (when not locked) */}
            {image && !isLocked && (
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ width: { xs: 80, sm: 120 }, color: "white" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 0.2,
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Opacity
                  </Typography>
                  <Slider
                    value={opacity}
                    onChange={(_, v) => setOpacity(v as number)}
                    min={0}
                    max={1}
                    step={0.1}
                    size="small"
                    sx={{
                      color: "#1976d2",
                      height: { xs: 6, sm: 8 },
                      "& .MuiSlider-thumb": {
                        backgroundColor: "#fff",
                        width: { xs: 16, sm: 20 },
                        height: { xs: 16, sm: 20 },
                      },
                      "& .MuiSlider-track": { backgroundColor: "#1976d2" },
                    }}
                  />
                </Box>

                <Box sx={{ width: { xs: 80, sm: 120 }, color: "white" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 0.2,
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Scale
                  </Typography>
                  <Slider
                    value={scale}
                    onChange={(_, v) => setScale(v as number)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    size="small"
                    sx={{
                      color: "#1976d2",
                      height: { xs: 6, sm: 8 },
                      "& .MuiSlider-thumb": {
                        backgroundColor: "#fff",
                        width: { xs: 16, sm: 20 },
                        height: { xs: 16, sm: 20 },
                      },
                      "& .MuiSlider-track": { backgroundColor: "#1976d2" },
                    }}
                  />
                </Box>

                <Box sx={{ width: { xs: 80, sm: 120 }, color: "white" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 0.2,
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Rotation
                  </Typography>
                  <Slider
                    value={rotation}
                    onChange={(_, v) => setRotation(v as number)}
                    min={0}
                    max={360}
                    step={1}
                    size="small"
                    sx={{
                      color: "#1976d2",
                      height: { xs: 6, sm: 8 },
                      "& .MuiSlider-thumb": {
                        backgroundColor: "#fff",
                        width: { xs: 16, sm: 20 },
                        height: { xs: 16, sm: 20 },
                      },
                      "& .MuiSlider-track": { backgroundColor: "#1976d2" },
                    }}
                  />
                </Box>
              </div>
            )}
          </Box>

          {/* Layer Controls (only show in layers mode) */}
          {showLayerControls && layers.length > 0 && (
            <Box
              sx={{
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                border: "1px solid rgba(25, 118, 210, 0.3)",
                borderRadius: 2,
                padding: { xs: 1, sm: 2 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <IconButton
                  onClick={prevLayer}
                  disabled={currentLayerIndex === 0}
                  sx={{
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                    "&:disabled": { color: "rgba(255,255,255,0.3)" },
                  }}
                >
                  <SkipPreviousIcon />
                </IconButton>

                <Box
                  sx={{ textAlign: "center", minWidth: { xs: 120, sm: 200 } }}
                >
                  {/* Layer Info */}
                  {layers[currentLayerIndex] && (
                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <Typography
                        sx={{
                          color: "white",
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        }}
                      >
                        <LayersIcon
                          sx={{
                            mr: 0.5,
                            color: `rgb(${layers[currentLayerIndex].dominantColor.r}, ${layers[currentLayerIndex].dominantColor.g}, ${layers[currentLayerIndex].dominantColor.b})`,
                          }}
                        />
                        {layers[currentLayerIndex].name}
                      </Typography>
                    </Box>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Step {currentLayerIndex + 1} of {layers.length}
                  </Typography>
                </Box>

                <IconButton
                  onClick={nextLayer}
                  disabled={currentLayerIndex === layers.length - 1}
                  sx={{
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                    "&:disabled": { color: "rgba(255,255,255,0.3)" },
                  }}
                >
                  <SkipNextIcon />
                </IconButton>
              </Box>

              {/* Layer Progress Indicator */}
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
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
                          : "rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scaleY(1.5)",
                      },
                    }}
                  />
                ))}
                {/* Single Layer Mode Toggle */}

                <Typography
                  variant="caption"
                  onClick={() => setSingleLayerMode(!singleLayerMode)}
                  className="absolute right-5 bottom-5"
                  sx={{
                    color: "white",
                    alignSelf: "center",
                  }}
                >
                  {singleLayerMode ? (
                    <LayersClear sx={{ fontSize: 24 }} />
                  ) : (
                    <LayersIcon sx={{ fontSize: 24 }} />
                  )}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Processing Indicator */}
          {isProcessingLayers && (
            <Box
              sx={{
                position: "absolute",
                top: -60,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "white",
                padding: 2,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
              <Typography variant="body2">
                Processing color layers...
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </>
  );
}
