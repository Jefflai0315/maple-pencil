export function toGrayscale(imageData: ImageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = y;
  }
  return imageData;
}

export function invert(imageData: ImageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]; // Invert red
    data[i + 1] = 255 - data[i + 1]; // Invert green
    data[i + 2] = 255 - data[i + 2]; // Invert blue
  }
  return imageData;
}

export function blur(
  imageData: ImageData,
  width: number,
  height: number,
  radius = 5
) {
  const temp = new Uint8ClampedArray(imageData.data);
  const data = imageData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const nx = x + kx,
            ny = y + ky;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            r += temp[idx];
            g += temp[idx + 1];
            b += temp[idx + 2];
            count++;
          }
        }
      }
      const idx = (y * width + x) * 4;
      data[idx] = r / count;
      data[idx + 1] = g / count;
      data[idx + 2] = b / count;
    }
  }
  return imageData;
}

// Color dodge blending function
export function dodge(frontData: ImageData, backData: ImageData) {
  const f = frontData.data,
    b = backData.data;
  const result = new Uint8ClampedArray(f.length);
  for (let i = 0; i < f.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      result[i + j] =
        b[i + j] === 255
          ? 255
          : Math.min(255, (f[i + j] * 255) / (255 - b[i + j]));
    }
    result[i + 3] = f[i + 3]; // Keep alpha channel
  }
  return new ImageData(result, frontData.width, frontData.height);
}

// Main function to convert image to sketch
export async function pencilSketchFromDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Ensure CORS compatibility
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.drawImage(img, 0, 0); // Draw the raw image onto the canvas
      let gray = ctx.getImageData(0, 0, canvas.width, canvas.height);
      gray = toGrayscale(gray); // Step 1: Convert to grayscale
      ctx.putImageData(gray, 0, 0); // Display grayscale image

      // Step 2: Invert the grayscale image
      let inverted = new ImageData(
        new Uint8ClampedArray(gray.data),
        gray.width,
        gray.height
      );
      inverted = invert(inverted);
      ctx.putImageData(inverted, 0, 0); // Show inverted image (debugging purpose)

      // Step 3: Apply blur to the inverted image
      let blurred = new ImageData(
        new Uint8ClampedArray(inverted.data),
        inverted.width,
        inverted.height
      );
      blurred = blur(blurred, canvas.width, canvas.height, 10); // Apply Gaussian blur
      ctx.putImageData(blurred, 0, 0); // Show blurred image (debugging purpose)

      // Step 4: Combine using color dodge blending
      const final = dodge(blurred, gray); // Apply the dodge blending
      ctx.putImageData(final, 0, 0); // Show final image

      // Return the final sketch as a data URL
      resolve(canvas.toDataURL());
    };

    img.onerror = (err) => {
      reject(err);
    };
    img.src = src; // Trigger image load
  });
}
