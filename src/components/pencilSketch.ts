const MAX_TRACE_EDGE = 1280;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/** Shrink huge camera-roll photos so tracing/sketch work stays fast on phones. */
export async function prepareTraceImage(
  src: string,
  maxEdge = MAX_TRACE_EDGE
): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.min(
    1,
    maxEdge / Math.max(img.naturalWidth, img.naturalHeight)
  );
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

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
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return imageData;
}

/** Separable box blur — O(n × radius) instead of O(n × radius²). */
export function blur(
  imageData: ImageData,
  width: number,
  height: number,
  radius = 5
) {
  const src = imageData.data;
  const tmp = new Uint8ClampedArray(src.length);
  const r = Math.max(1, Math.floor(radius));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rs = 0,
        gs = 0,
        bs = 0,
        count = 0;
      for (let kx = -r; kx <= r; kx++) {
        const nx = x + kx;
        if (nx < 0 || nx >= width) continue;
        const idx = (y * width + nx) * 4;
        rs += src[idx];
        gs += src[idx + 1];
        bs += src[idx + 2];
        count++;
      }
      const idx = (y * width + x) * 4;
      tmp[idx] = rs / count;
      tmp[idx + 1] = gs / count;
      tmp[idx + 2] = bs / count;
      tmp[idx + 3] = src[idx + 3];
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rs = 0,
        gs = 0,
        bs = 0,
        count = 0;
      for (let ky = -r; ky <= r; ky++) {
        const ny = y + ky;
        if (ny < 0 || ny >= height) continue;
        const idx = (ny * width + x) * 4;
        rs += tmp[idx];
        gs += tmp[idx + 1];
        bs += tmp[idx + 2];
        count++;
      }
      const idx = (y * width + x) * 4;
      src[idx] = rs / count;
      src[idx + 1] = gs / count;
      src[idx + 2] = bs / count;
    }
  }

  return imageData;
}

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
    result[i + 3] = f[i + 3];
  }
  return new ImageData(result, frontData.width, frontData.height);
}

export async function pencilSketchFromDataUrl(src: string): Promise<string> {
  const prepared = await prepareTraceImage(src);
  const img = await loadImage(prepared);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas");

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  let gray = ctx.getImageData(0, 0, canvas.width, canvas.height);
  gray = toGrayscale(gray);

  let inverted = new ImageData(
    new Uint8ClampedArray(gray.data),
    gray.width,
    gray.height
  );
  inverted = invert(inverted);

  let blurred = new ImageData(
    new Uint8ClampedArray(inverted.data),
    inverted.width,
    inverted.height
  );
  blurred = blur(blurred, canvas.width, canvas.height, 6);

  const final = dodge(blurred, gray);
  ctx.putImageData(final, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.88);
}
