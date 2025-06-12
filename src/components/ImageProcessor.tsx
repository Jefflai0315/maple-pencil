import React, { useEffect, useRef, useState } from "react";

const MAX_CANVAS_SIZE = 600; // Max canvas size for big screens

function fitImage(
  imgWidth: number,
  imgHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  // Calculate scale to fit within max dimensions while maintaining aspect ratio
  const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
  const width = Math.round(imgWidth * scale);
  const height = Math.round(imgHeight * scale);

  // Calculate padding to center the image
  const paddingX = (maxWidth - width) / 2;
  const paddingY = (maxHeight - height) / 2;

  return {
    width,
    height,
    scale,
    paddingX,
    paddingY,
    maxWidth,
    maxHeight,
  };
}

// Minimal Vector2D for movement
class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  copy() {
    return new Vector2D(this.x, this.y);
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  mult(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }
  div(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }
  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalize() {
    const m = this.mag();
    if (m !== 0) {
      this.mult(1 / m);
    }
    return this;
  }
  static fromAngle(angle) {
    return new Vector2D(Math.cos(angle), Math.sin(angle));
  }
}

// Black & White Paint (like your p5.js version, always black)
class Paint {
  constructor(ctx, width, height, imageData) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.pos = new Vector2D(width / 2, height / 2);
    this.ppos = this.pos.copy();
    this.vel = new Vector2D(0, 0);
    this.force = new Vector2D(0, 0);
    this.imageData = imageData;

    // Params
    this.maxSpeed = 1.0;
    this.perception = 5;
    this.bound = 60;
    this.boundForceFactor = 0.8;
    this.noiseScale = 100.0;
    this.noiseInfluence = 1 / 10.0;
    this.dropRate = 0.01;
    this.dropAlpha = 150;
    this.drawAlpha = 50;
    this.drawWeight = 1;
    this.count = 0;
    this.maxCount = 100;
    this.z = 0;
    this.reset();
  }

  noise(x, y, z) {
    // Simple deterministic noise for this demo
    return Math.abs(Math.sin(x * 0.1 + y * 0.1 + z * 0.1) * 0.5 + 0.5);
  }

  getBrightness(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 255; // Treat out of bounds as white
    const idx = (Math.floor(y) * this.width + Math.floor(x)) * 4;
    const r = this.imageData.data[idx];
    const g = this.imageData.data[idx + 1];
    const b = this.imageData.data[idx + 2];
    return (r + g + b) / 3;
  }

  update() {
    this.ppos = this.pos.copy();
    this.force.mult(0);

    let target = new Vector2D(0, 0);
    let count = 0;
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
        const x = this.pos.x + i;
        const y = this.pos.y + j;
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          const brightness = this.getBrightness(x, y);
          // Darker = stronger attraction (invert as needed)
          const b = 1 - brightness / 255;
          const p = new Vector2D(i, j).normalize().mult(b);
          target.add(p);
          count++;
        }
      }
    }
    if (count !== 0) {
      target.div(count);
      this.force.add(target);
    }

    // Noise force
    const n = this.noise(
      this.pos.x / this.noiseScale,
      this.pos.y / this.noiseScale,
      this.z
    );
    const angle = n * Math.PI * 2;
    const p = Vector2D.fromAngle(angle);
    if (this.force.mag() < 0.01) {
      p.mult(this.noiseInfluence * 5);
    } else {
      p.mult(this.noiseInfluence);
    }
    this.force.add(p);

    // Bound force
    const boundForce = new Vector2D(0, 0);
    if (this.pos.x < this.bound) {
      boundForce.x = (this.bound - this.pos.x) / this.bound;
    }
    if (this.pos.x > this.width - this.bound) {
      boundForce.x = (this.pos.x - this.width) / this.bound;
    }
    if (this.pos.y < this.bound) {
      boundForce.y = (this.bound - this.pos.y) / this.bound;
    }
    if (this.pos.y > this.height - this.bound) {
      boundForce.y = (this.pos.y - this.height) / this.bound;
    }
    boundForce.mult(this.boundForceFactor);
    this.force.add(boundForce);

    this.vel.add(this.force);
    this.vel.mult(0.9999);
    if (this.vel.mag() > this.maxSpeed) {
      this.vel.mult(this.maxSpeed / this.vel.mag());
    }
    this.pos.add(this.vel);

    if (
      this.pos.x > this.width ||
      this.pos.x < 0 ||
      this.pos.y > this.height ||
      this.pos.y < 0
    ) {
      this.reset();
    }
  }

  reset() {
    this.count = 0;
    let attempts = 0;
    do {
      this.pos.x = this.width / 2 + Math.random() * this.width;
      this.pos.y = this.height / 2 + Math.random() * this.height;
      const brightness = this.getBrightness(this.pos.x, this.pos.y);
      if (brightness < 220) break; // Only start in darker spots
      attempts++;
    } while (attempts < 100);
    this.ppos = this.pos.copy();
    this.vel.mult(0);
  }

  show() {
    this.count++;
    if (this.count > this.maxCount) {
      this.reset();
    }
    // Always black line
    this.ctx.strokeStyle = `rgba(0, 0, 0, ${this.drawAlpha / 255})`;
    this.ctx.lineWidth = this.drawWeight;
    this.ctx.globalAlpha = this.drawAlpha / 255;

    // Drop effect
    if (this.force.mag() > 0.1 && Math.random() < this.dropRate) {
      this.ctx.lineWidth = this.drawWeight + Math.random() * 5;
      this.ctx.globalAlpha = this.dropAlpha / 255;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(this.ppos.x, this.ppos.y);
    this.ctx.lineTo(this.pos.x, this.pos.y);
    this.ctx.stroke();
    this.ctx.globalAlpha = 1; // reset
  }
}

const ImageProcessor = ({ imageData, onClose }) => {
  const canvasRef = useRef(null);
  const [isStopped, setIsStopped] = useState(false);
  const paintRef = useRef(null);
  const animationRef = useRef();
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [currentImage, setCurrentImage] = useState(imageData);

  useEffect(() => {
    if (!imageData) return;

    const img = new window.Image();
    img.onload = () => {
      // Get actual image dimensions from the loaded image
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      console.log("Original image dimensions:", imgWidth, imgHeight);

      // Set fixed dimensions for the canvas
      const maxWidth = 300;
      const maxHeight = 300;

      // Calculate scale to maintain aspect ratio
      const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      const scaledWidth = Math.round(imgWidth * scale);
      const scaledHeight = Math.round(imgHeight * scale);

      // Calculate padding to center the image
      const paddingX = (maxWidth - scaledWidth) / 2;
      const paddingY = (maxHeight - scaledHeight) / 2;

      setCanvasSize({ width: scaledWidth, height: scaledHeight });

      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, scaledWidth, scaledHeight);
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight); // No padding!
        const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
        console.log("scaledWidth", scaledWidth);
        console.log("scaledHeight", scaledHeight);
        console.log("canvas", canvas);
        paintRef.current = new Paint(ctx, scaledWidth, scaledHeight, imageData);
        startPainting(ctx, canvas);
      }, 0);
    };
    img.src = imageData;
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [imageData]);

  const startPainting = (ctx, canvas) => {
    const process = () => {
      if (!isStopped && paintRef.current) {
        for (let i = 0; i < 800; i++) {
          paintRef.current.update();
          paintRef.current.show();
        }
      }
      animationRef.current = requestAnimationFrame(process);
    };
    process();
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="relative w-[90vw] max-w-[700px] h-[90dvh] max-h-[800px]">
        <div
          className="absolute left-[15%] w-[50%] bg-white p-4 rounded-lg shadow-lg relative flex flex-col items-center"
          style={{
            top: `calc(50% )`,
            height: `calc(47% - 17dvh)`,
            transform: "translateY(-50%)",
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border border-gray-300 bg-white"
            // Add responsive style if you want
            style={{
              display: "block",
              maxWidth: "90vw",
              maxHeight: "80dvh",
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
            }}
          />
          <div className="mt-4 flex flex-col items-center space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setIsStopped((prev) => !prev)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {isStopped ? "Resume" : "Stop"}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageProcessor;
