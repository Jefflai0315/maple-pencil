/* "Shapes" view: turn a photo into 2–4 flat tones, the way an artist squints
   to see big shapes of light and dark ("it's all just shapes"; step 3 of the
   eye reel, "Map 4 tones"). Pure functions on pixel arrays, so they run in
   tests; only toneShapesFromDataUrl touches the DOM. */

export type ToneCount = 2 | 3 | 4;
type RGB = [number, number, number];

/** The four tones from the reel's swatches, lightest first. */
const LIGHT: RGB = [244, 241, 234];
const MID: RGB = [201, 195, 184];
const DARK_MID: RGB = [141, 135, 125];
const SHADOW: RGB = [58, 54, 49];
/** Ink used for the outlines between shapes. */
const INK: RGB = [43, 38, 32];

/** `short` is what you'd write on the paper to label a shape (as in the reel). */
export const TONES: Record<ToneCount, { name: string; short: string; rgb: RGB }[]> = {
  2: [
    { name: "Light", short: "L", rgb: LIGHT },
    { name: "Shadow", short: "S", rgb: SHADOW },
  ],
  3: [
    { name: "Light", short: "L", rgb: LIGHT },
    { name: "Mid", short: "M", rgb: MID },
    { name: "Shadow", short: "S", rgb: SHADOW },
  ],
  4: [
    { name: "Light", short: "L", rgb: LIGHT },
    { name: "Mid", short: "M", rgb: MID },
    { name: "Dark-mid", short: "DM", rgb: DARK_MID },
    { name: "Shadow", short: "S", rgb: SHADOW },
  ],
};

export function rgbCss([r, g, b]: RGB) {
  return `rgb(${r}, ${g}, ${b})`;
}

/** Perceived brightness 0–255 for each pixel of an RGBA buffer. */
export function luminance(rgba: ArrayLike<number>, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height);
  for (let i = 0, p = 0; p < out.length; i += 4, p++) {
    out[p] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  }
  return out;
}

/** Separable box blur with a running sum: O(pixels), any radius. */
export function boxBlur(src: Float32Array, width: number, height: number, radius: number): Float32Array {
  const r = Math.max(0, Math.floor(radius));
  if (r === 0) return Float32Array.from(src);
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);

  for (let y = 0; y < height; y++) {
    const row = y * width;
    let sum = 0;
    let count = 0;
    for (let x = 0; x <= Math.min(r, width - 1); x++) {
      sum += src[row + x];
      count++;
    }
    for (let x = 0; x < width; x++) {
      tmp[row + x] = sum / count;
      const add = x + r + 1;
      const drop = x - r;
      if (add < width) {
        sum += src[row + add];
        count++;
      }
      if (drop >= 0) {
        sum -= src[row + drop];
        count--;
      }
    }
  }

  for (let x = 0; x < width; x++) {
    let sum = 0;
    let count = 0;
    for (let y = 0; y <= Math.min(r, height - 1); y++) {
      sum += tmp[y * width + x];
      count++;
    }
    for (let y = 0; y < height; y++) {
      out[y * width + x] = sum / count;
      const add = y + r + 1;
      const drop = y - r;
      if (add < height) {
        sum += tmp[add * width + x];
        count++;
      }
      if (drop >= 0) {
        sum -= tmp[drop * width + x];
        count--;
      }
    }
  }
  return out;
}

/**
 * Brightness cut-offs that split the picture into `count` natural groups
 * (1-D k-means on the histogram), returned brightest-to-darkest boundaries
 * in ascending order. Natural groups follow the real light and shadow better
 * than equal-sized slices.
 */
export function toneThresholds(gray: Float32Array, count: ToneCount): number[] {
  const hist = new Float64Array(256);
  for (let i = 0; i < gray.length; i++) {
    hist[Math.max(0, Math.min(255, Math.round(gray[i])))]++;
  }
  const total = gray.length || 1;

  // Start the centres at evenly spaced quantiles.
  const centres: number[] = [];
  let cumulative = 0;
  let next = 0;
  for (let v = 0; v < 256 && centres.length < count; v++) {
    cumulative += hist[v];
    while (centres.length < count && cumulative / total >= (next + 0.5) / count) {
      centres.push(v);
      next++;
    }
  }
  while (centres.length < count) centres.push(255);

  for (let iter = 0; iter < 30; iter++) {
    const sums = new Float64Array(count);
    const weights = new Float64Array(count);
    for (let v = 0; v < 256; v++) {
      if (!hist[v]) continue;
      let best = 0;
      for (let k = 1; k < count; k++) {
        if (Math.abs(v - centres[k]) < Math.abs(v - centres[best])) best = k;
      }
      sums[best] += v * hist[v];
      weights[best] += hist[v];
    }
    let moved = false;
    for (let k = 0; k < count; k++) {
      if (!weights[k]) continue;
      const c = sums[k] / weights[k];
      if (Math.abs(c - centres[k]) > 0.01) moved = true;
      centres[k] = c;
    }
    if (!moved) break;
  }

  centres.sort((a, b) => a - b);
  const cuts: number[] = [];
  for (let k = 0; k < count - 1; k++) cuts.push((centres[k] + centres[k + 1]) / 2);
  return cuts;
}

/** Tone index per pixel: 0 = lightest … count-1 = darkest. */
export function quantize(gray: Float32Array, cuts: number[]): Uint8Array {
  const out = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) {
    // Count the cut-offs the pixel is darker than: brighter than all = 0.
    let idx = 0;
    for (let k = 0; k < cuts.length; k++) if (gray[i] < cuts[k]) idx++;
    out[i] = idx;
  }
  return out;
}

/** 3×3 majority vote: removes lone specks so the shapes stay big and simple. */
export function majorityFilter(levels: Uint8Array, width: number, height: number, count: number): Uint8Array {
  const out = new Uint8Array(levels.length);
  const votes = new Uint8Array(count);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      votes.fill(0);
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          votes[levels[ny * width + nx]]++;
        }
      }
      const self = levels[y * width + x];
      let best = self;
      for (let k = 0; k < count; k++) if (votes[k] > votes[best]) best = k;
      out[y * width + x] = votes[best] >= 5 ? best : self;
    }
  }
  return out;
}

/** Pixels on the border between two different tones, thickened to `thickness`. */
export function shapeOutlines(levels: Uint8Array, width: number, height: number, thickness = 1): Uint8Array {
  let edge = new Uint8Array(levels.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const v = levels[i];
      if ((x + 1 < width && levels[i + 1] !== v) || (y + 1 < height && levels[i + width] !== v)) {
        edge[i] = 1;
      }
    }
  }
  for (let pass = 1; pass < thickness; pass++) {
    const grown = Uint8Array.from(edge);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (edge[i]) continue;
        if (
          (x > 0 && edge[i - 1]) ||
          (x + 1 < width && edge[i + 1]) ||
          (y > 0 && edge[i - width]) ||
          (y + 1 < height && edge[i + width])
        ) {
          grown[i] = 1;
        }
      }
    }
    edge = grown;
  }
  return edge;
}

export interface ShapesOptions {
  /** Blur radius as a fraction of the shorter side (bigger = simpler shapes). */
  simplify?: number;
  /** Draw ink lines along the borders between shapes. */
  outlines?: boolean;
}

/** Whole pipeline on an RGBA buffer; returns a new RGBA buffer of flat tones. */
export function shapesFromRGBA(
  rgba: ArrayLike<number>,
  width: number,
  height: number,
  count: ToneCount,
  options: ShapesOptions = {}
): Uint8ClampedArray<ArrayBuffer> {
  const { simplify = 0.012, outlines = true } = options;
  const gray = luminance(rgba, width, height);
  const radius = Math.max(1, Math.round(Math.min(width, height) * simplify));
  const soft = boxBlur(gray, width, height, radius);
  const cuts = toneThresholds(soft, count);
  let levels = quantize(soft, cuts);
  levels = majorityFilter(levels, width, height, count);
  levels = majorityFilter(levels, width, height, count);

  const palette = TONES[count].map((t) => t.rgb);
  const edge = outlines
    ? shapeOutlines(levels, width, height, Math.max(1, Math.round(Math.max(width, height) / 450)))
    : null;

  const out = new Uint8ClampedArray(width * height * 4);
  for (let p = 0, i = 0; p < levels.length; p++, i += 4) {
    const [r, g, b] = edge && edge[p] ? INK : palette[levels[p]];
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = 255;
  }
  return out;
}

const WORK_EDGE = 900;

/** Browser helper: photo (data URL or path) → flat-tone PNG data URL. */
export async function toneShapesFromDataUrl(
  src: string,
  count: ToneCount,
  options?: ShapesOptions
): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not load image"));
    el.src = src;
  });
  const scale = Math.min(1, WORK_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas");
  ctx.drawImage(img, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  // Let the spinner paint before the heavy loop on slow phones.
  await new Promise((resolve) => setTimeout(resolve, 0));
  const shaped = shapesFromRGBA(data, width, height, count, options);
  ctx.putImageData(new ImageData(shaped, width, height), 0, 0);
  return canvas.toDataURL("image/png");
}
