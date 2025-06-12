"use client";

import dynamic from "next/dynamic";
import p5 from "p5";
import { useRef, useEffect, useState } from "react";

// Dynamically import react-p5 (client-only, disables SSR)
const Sketch = dynamic(() => import("react-p5"), { ssr: false });

interface PageProps {
  capturedImage: string;
  onClose: () => void;
}

interface ImageDimensions {
  width: number;
  height: number;
}

function Page({ capturedImage, onClose }: PageProps) {
  const [imgDims, setImgDims] = useState<ImageDimensions | null>(null);
  const imgs = useRef<p5.Image[]>([]);
  const imgIndex = useRef(-1);
  const img = useRef<p5.Image | null>(null);
  const paint = useRef<Paint | null>(null);
  const subStep = 800;
  const z = useRef(0);
  const isStop = useRef(false);
  const count = useRef(0);
  const p5Instance = useRef(null); // Add ref for p5 instance

  useEffect(() => {
    if (!capturedImage) return;
    const image = new window.Image();
    image.onload = () => {
      // Scale down if needed
      const maxW = 320;
      const maxH = 320;
      const scale = Math.min(
        maxW / image.naturalWidth,
        maxH / image.naturalHeight,
        1
      );
      setImgDims({
        width: Math.round(image.naturalWidth * scale),
        height: Math.round(image.naturalHeight * scale),
      });
    };
    image.src = capturedImage;
    // Clean up
    return () => setImgDims(null);
  }, [capturedImage]);

  // Cleanup function when component unmounts
  useEffect(() => {
    return () => {
      imgs.current = [];
      imgIndex.current = -1;
      img.current = null;
      paint.current = null;
      z.current = 0;
      isStop.current = false;
      count.current = 0;
      p5Instance.current = null;
    };
  }, []);

  const preload = (p5: p5) => {
    if (capturedImage) {
      imgs.current[0] = p5.loadImage(capturedImage);
    } else {
      imgs.current[0] = p5.loadImage("/test1.png");
      imgs.current[1] = p5.loadImage("/test2.png");
      imgs.current[2] = p5.loadImage("/test3.png");
    }
  };

  const setup = (p5: p5, canvasParentRef: Element) => {
    if (!imgDims) return;
    p5.createCanvas(imgDims.width, imgDims.height).parent(canvasParentRef); // Only call ONCE!
    img.current = p5.createImage(p5.width, p5.height);
    nextImage(p5);
    paint.current = new Paint(p5.createVector(p5.width / 2, p5.height / 2), p5);
    p5.background(255);
    p5.colorMode(p5.RGB, 255, 255, 255, 255);
  };

  const draw = (p5: p5) => {
    if (!img.current || !paint.current) return;
    img.current.loadPixels();

    if (!isStop.current) {
      for (let i = 0; i < subStep; i++) {
        paint.current.update();
        paint.current.show();
        z.current += 0.01;
      }
    }

    img.current.updatePixels();
    count.current++;
    if (count.current > p5.width) {
      isStop.current = true;
    }
  };

  // Switch to the next image in your array
  function nextImage(p5: p5) {
    if (!img.current || !p5) return;
    imgIndex.current = (imgIndex.current + 1) % imgs.current.length;
    const targetImg = imgs.current[imgIndex.current];
    if (!targetImg) return;

    img.current.copy(
      targetImg,
      0,
      0,
      targetImg.width,
      targetImg.height,
      0,
      0,
      img.current.width,
      img.current.height
    );
    img.current.loadPixels();
    p5.clear(0, 0, 0, 0);
  }

  const mousePressed = (p5: p5) => {
    if (!p5) return;
    nextImage(p5);
    isStop.current = false;
    count.current = 0;
  };

  const touchStarted = (p5: p5) => {
    if (!p5) return;
    nextImage(p5);
    isStop.current = false;
    count.current = 0;
  };

  const keyPressed = (p5: p5) => {
    if (!p5) return;
    if (p5.key === "s" || p5.key === "S") {
      isStop.current = !isStop.current;
    }
  };

  // Helper for pixel access (adapts your fget/fset logic)
  function fget(i: number, j: number, p5: p5) {
    if (!img.current) return p5.color(0, 0, 0, 0);
    const idx = (j * img.current.width + i) * 4;
    return p5.color(
      img.current.pixels[idx],
      img.current.pixels[idx + 1],
      img.current.pixels[idx + 2],
      img.current.pixels[idx + 3]
    );
  }

  // Paint class (p5 version)
  class Paint {
    p5: p5;
    ppos: p5.Vector;
    pos: p5.Vector;
    vel: p5.Vector;
    force: p5.Vector;
    maxSpeed: number;
    perception: number;
    bound: number;
    boundForceFactor: number;
    noiseScale: number;
    noiseInfluence: number;
    dropRate: number;
    dropAlpha: number;
    drawAlpha: number;
    drawWeight: number;
    count: number;
    maxCount: number;
    z: number;

    constructor(p: p5.Vector, p5: p5) {
      this.p5 = p5;
      this.ppos = p.copy();
      this.pos = p.copy();
      this.vel = p5.createVector(0, 0);
      this.force = p5.createVector(0, 0);

      // Params
      this.maxSpeed = 3.0;
      this.perception = 5;
      this.bound = 20;
      this.boundForceFactor = 0.16;
      this.noiseScale = 150.0;
      this.noiseInfluence = 1 / 100.0;
      this.dropRate = 0.004;
      this.dropAlpha = 10;
      this.drawAlpha = 40;
      this.drawWeight = 0.7;
      this.count = 0;
      this.maxCount = 120;
      this.z = 0;
      this.reset();
    }

    fadeLineFromImg(x1: number, y1: number, x2: number, y2: number) {
      const imgObj = img.current;
      if (!imgObj) return;

      const xOffset = Math.floor(Math.abs(x1 - x2));
      const yOffset = Math.floor(Math.abs(y1 - y2));
      const step = Math.max(xOffset, yOffset, 1); // avoid division by 0!
      for (let i = 0; i < step; i++) {
        const x = Math.floor(x1 + ((x2 - x1) * i) / step);
        const y = Math.floor(y1 + ((y2 - y1) * i) / step);
        const idx = (y * imgObj.width + x) * 4;
        imgObj.pixels[idx] = Math.min(255, imgObj.pixels[idx] + 30);
        imgObj.pixels[idx + 1] = Math.min(255, imgObj.pixels[idx + 1] + 30);
        imgObj.pixels[idx + 2] = Math.min(255, imgObj.pixels[idx + 2] + 30);
        // Alpha stays the same
      }
    }

    update() {
      this.ppos = this.pos.copy();
      this.force.mult(0);

      // Pixel force
      const target = this.p5.createVector(0, 0);
      let ncount = 0;
      for (
        let i = -Math.floor(this.perception / 2);
        i < this.perception / 2;
        i++
      ) {
        for (
          let j = -Math.floor(this.perception / 2);
          j < this.perception / 2;
          j++
        ) {
          if (i === 0 && j === 0) continue;
          const x = Math.floor(this.pos.x + i);
          const y = Math.floor(this.pos.y + j);
          if (
            x >= 0 &&
            x < (img.current?.width ?? 0) &&
            y >= 0 &&
            y < (img.current?.height ?? 0)
          ) {
            const c = fget(x, y, this.p5);
            const b = 1 - this.p5.brightness(c) / 100.0; // p5's brightness is [0, 100]
            const p = this.p5
              .createVector(i, j)
              .normalize()
              .mult(b)
              .div(this.p5.createVector(i, j).mag());
            target.add(p);
            ncount++;
          }
        }
      }

      if (ncount !== 0) {
        target.div(ncount);
        this.force.add(target);
      }

      // Noise force
      const n = this.p5.noise(
        this.pos.x / this.noiseScale,
        this.pos.y / this.noiseScale,
        this.z
      );
      const angle = this.p5.map(n, 0, 1, 0, 5 * this.p5.TWO_PI);
      const p = this.p5.createVector(Math.cos(angle), Math.sin(angle));
      if (this.force.mag() < 0.01)
        this.force.add(p.mult(this.noiseInfluence * 5));
      else this.force.add(p.mult(this.noiseInfluence));

      // Bound force
      const boundForce = this.p5.createVector(0, 0);
      if (this.pos.x < this.bound)
        boundForce.x = (this.bound - this.pos.x) / this.bound;
      if (this.pos.x > this.p5.width - this.bound)
        boundForce.x = (this.pos.x - this.p5.width) / this.bound;
      if (this.pos.y < this.bound)
        boundForce.y = (this.bound - this.pos.y) / this.bound;
      if (this.pos.y > this.p5.height - this.bound)
        boundForce.y = (this.pos.y - this.p5.height) / this.bound;
      boundForce.mult(this.boundForceFactor);
      this.force.add(boundForce);

      this.vel.add(this.force);
      this.vel.mult(0.9999);
      if (this.vel.mag() > this.maxSpeed)
        this.vel.mult(this.maxSpeed / this.vel.mag());
      this.pos.add(this.vel);

      if (
        this.pos.x > this.p5.width ||
        this.pos.x < 0 ||
        this.pos.y > this.p5.height ||
        this.pos.y < 0
      ) {
        this.reset();
      }
    }

    reset() {
      this.count = 0;
      let hasFound = false;
      let tries = 0;
      while (!hasFound && tries < 100) {
        this.pos.x = this.p5.random(1) * this.p5.width;
        this.pos.y = this.p5.random(1) * this.p5.height;
        const c = fget(Math.floor(this.pos.x), Math.floor(this.pos.y), this.p5);
        const b = this.p5.brightness(c);
        if (b < 35) hasFound = true;
        tries++;
      }
      this.ppos = this.pos.copy();
      this.vel.mult(0);
    }

    show() {
      this.count++;
      if (this.count > this.maxCount) {
        this.reset();
      }
      this.p5.stroke(0, 0, 0, this.drawAlpha);
      this.p5.strokeWeight(this.drawWeight);
      if (this.force.mag() > 0.1 && this.p5.random(1) < this.dropRate) {
        this.p5.strokeWeight(this.drawWeight + this.p5.random(5));
        this.p5.stroke(0, 0, 0, this.dropAlpha);
      }
      this.p5.line(this.ppos.x, this.ppos.y, this.pos.x, this.pos.y);
      this.fadeLineFromImg(this.ppos.x, this.ppos.y, this.pos.x, this.pos.y);
    }
  }

  // Don't show the modal until imgDims is known
  console.log(
    "Sketch rendered!",
    imgDims,
    capturedImage,
    window.location.pathname
  );
  if (!imgDims) return null;

  // ----------- RENDER ------------- //

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 6px 32px rgba(0,0,0,0.15)",
          padding: 32,
          minWidth: imgDims.width + 32,
          minHeight: imgDims.height + 32,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {onClose && (
          <button
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              border: "none",
              background: "#eee",
              borderRadius: "50%",
              width: 32,
              height: 32,
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: 20,
              zIndex: 1000,
            }}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        )}
        <div
          style={{
            width: imgDims.width,
            height: imgDims.height,
            maxWidth: "90vw",
            maxHeight: "80dvh",
          }}
        >
          {imgDims.width && imgDims.height && (
            <Sketch
              preload={preload}
              setup={setup}
              draw={draw}
              mousePressed={mousePressed}
              keyPressed={keyPressed}
              touchStarted={touchStarted}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
