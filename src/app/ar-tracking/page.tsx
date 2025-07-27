"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Slider, IconButton } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
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

  /* ---------- Global CSS so the video & canvas fill/cover ---------- */

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "arjs-video-cover";
    style.textContent = `
      html, body { margin:0; padding:0; height:100%; overflow:hidden; }
      /* Scene & canvas should cover the viewport */
      #ar-root, #ar-root a-scene { position: fixed; inset: 0; width: 100vw; height: 100dvh; }
      #ar-root canvas.a-canvas {
        position: absolute !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100dvh !important;
      }
      /* AR.js camera video must cover and stay centered */
      #arjs-video {
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        width: 100vw !important; height: 100dvh !important;
        object-fit: cover !important;
        object-position: center center !important;
        transform: none !important;
        z-index: 0 !important;
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
    if (!arContainerRef.current || sceneRef.current) return;

    const scene = document.createElement("a-scene") as unknown as AFrameEntity;
    scene.setAttribute("embedded", "");
    // Keep alpha true so the video is visible behind the canvas
    scene.setAttribute(
      "renderer",
      "antialias: true; alpha: true; vrModeEnabled: false"
    );
    scene.setAttribute("vr-mode-ui", "enabled: false");
    // displayWidth/Height hints are optional; AR.js will size based on video & canvas
    scene.setAttribute("arjs", "sourceType: webcam; debugUIEnabled: false;");
    scene.style.width = "100%";
    scene.style.height = "100%";

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
    const plane = document.createElement("a-plane") as unknown as AFrameEntity;
    plane.id = "imagePlane";
    plane.setAttribute("position", "0 0 0");
    plane.setAttribute("rotation", "-90 0 0"); // lie flat on marker
    plane.setAttribute(
      "material",
      "shader: flat; transparent: true; opacity: 1"
    );
    plane.setAttribute("width", "4");
    plane.setAttribute("height", "2.25");

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

    arContainerRef.current.appendChild(scene);

    sceneRef.current = scene;
    planeRef.current = plane;
  }, []);

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
      const baseW = 4 * scale; // meters
      const w = baseW;
      const h = baseW / aspect;
      planeRef.current.setAttribute("width", w.toString());
      planeRef.current.setAttribute("height", h.toString());
    } else {
      planeRef.current.setAttribute("width", (4 * scale).toString());
      planeRef.current.setAttribute("height", (2.25 * scale).toString());
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

  /* ===================== UI ===================== */

  return (
    <>
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
        }}
      />
      {/* Bottom Toolbar */}
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
    </>
  );
}
