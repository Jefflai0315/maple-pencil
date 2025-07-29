"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Slider,
  IconButton,
  Typography,
  LinearProgress,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
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

  // New loading states
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.INITIAL
  );
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

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

  // New image -> set asset src and refresh texture once loaded
  useEffect(() => {
    if (!imgAssetRef.current || !image) return;

    imgAssetRef.current.onload = () => {
      const mesh = meshRef.current;
      if (!mesh) return;
      markTextureNeedsUpdate(mesh.material);
    };
    imgAssetRef.current.src = image;

    if (planeRef.current) {
      planeRef.current.setAttribute("material", "src", "#uploaded-image");
    }
  }, [image]);

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
            padding: 2,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            gap: 2,
            alignItems: "center",
            zIndex: 100013,
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
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              Upload Image
            </Button>
          </label>

          {image && (
            <>
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

              {!isLocked && (
                <>
                  <Box sx={{ width: 150, color: "white" }}>
                    <div
                      style={{ color: "white", fontSize: 12, marginBottom: 4 }}
                    >
                      Opacity
                    </div>
                    <Slider
                      value={opacity}
                      onChange={(_, v) => setOpacity(v as number)}
                      min={0}
                      max={1}
                      step={0.1}
                      sx={{
                        color: "#1976d2",
                        "& .MuiSlider-thumb": { backgroundColor: "#fff" },
                        "& .MuiSlider-track": { backgroundColor: "#1976d2" },
                      }}
                    />
                  </Box>

                  <Box sx={{ width: 150, color: "white" }}>
                    <div
                      style={{ color: "white", fontSize: 12, marginBottom: 4 }}
                    >
                      Scale
                    </div>
                    <Slider
                      value={scale}
                      onChange={(_, v) => setScale(v as number)}
                      min={0.1}
                      max={3}
                      step={0.1}
                      sx={{
                        color: "#1976d2",
                        "& .MuiSlider-thumb": { backgroundColor: "#fff" },
                        "& .MuiSlider-track": { backgroundColor: "#1976d2" },
                      }}
                    />
                  </Box>

                  <Box sx={{ width: 150, color: "white" }}>
                    <div
                      style={{ color: "white", fontSize: 12, marginBottom: 4 }}
                    >
                      Rotation
                    </div>
                    <Slider
                      value={rotation}
                      onChange={(_, v) => setRotation(v as number)}
                      min={0}
                      max={360}
                      step={1}
                      sx={{
                        color: "#1976d2",
                        "& .MuiSlider-thumb": { backgroundColor: "#fff" },
                        "& .MuiSlider-track": { backgroundColor: "#1976d2" },
                      }}
                    />
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      )}
    </>
  );
}
