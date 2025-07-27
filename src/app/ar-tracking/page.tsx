"use client";

import React, { useEffect, useRef } from "react";

export default function ARTrackingPage() {
  const arContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Following the GitHub discussion solution
    // Use setTimeout to delay React mounting and avoid conflicts
    const timer = setTimeout(() => {
      if (arContainerRef.current) {
        // Clear any existing content
        arContainerRef.current.innerHTML = "";

        // Create the AR scene directly in the DOM
        // This approach avoids React's virtual DOM interference
        const arScene = document.createElement("a-scene");
        arScene.setAttribute("embedded", "");
        arScene.setAttribute(
          "arjs",
          "sourceType: webcam; debugUIEnabled: false;"
        );

        // Create marker
        const marker = document.createElement("a-marker");
        marker.setAttribute("type", "pattern");
        marker.setAttribute("url", "/AR/pattern-hiro.patt");

        // Create plane
        const plane = document.createElement("a-plane");
        plane.setAttribute("id", "imagePlane");
        plane.setAttribute("position", "0 0 0");
        plane.setAttribute("rotation", "-90 0 0");
        plane.setAttribute("width", "4");
        plane.setAttribute("height", "2.25");
        plane.setAttribute("material", "shader: flat; scale: 2 2 2");

        // Create camera
        const camera = document.createElement("a-entity");
        camera.setAttribute("camera", "");

        // Assemble the scene
        marker.appendChild(plane);
        arScene.appendChild(marker);
        arScene.appendChild(camera);

        // Add to container
        arContainerRef.current.appendChild(arScene);
      }
    }, 1000); // 1 second delay as suggested in the GitHub discussion

    return () => {
      clearTimeout(timer);
      if (arContainerRef.current) {
        arContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
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
  );
}
