/* Run with: npx tsx src/lib/shapes.test.ts (same style as arCamera.test.ts) */
import {
  boxBlur,
  luminance,
  majorityFilter,
  quantize,
  shapeOutlines,
  shapesFromRGBA,
  toneThresholds,
  TONES,
  type ToneCount,
} from "./shapes";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}
function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) throw new Error(`FAIL: ${message} (got ${actual}, expected ${expected})`);
}

/** RGBA buffer filled by a brightness function. */
function makeImage(width: number, height: number, value: (x: number, y: number) => number) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = value(x, y);
      const i = (y * width + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return data;
}

// luminance
{
  const px = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 200, 200, 200, 255]);
  const l = luminance(px, 4, 1);
  assert(Math.abs(l[0] - 76.245) < 0.01, "red luminance");
  assert(l[1] > l[0] && l[0] > l[2], "green brighter than red brighter than blue");
  assert(Math.abs(l[3] - 200) < 0.01, "grey keeps its value");
}

// boxBlur keeps flat areas flat and smooths a step
{
  const flat = new Float32Array(50).fill(120);
  assert(boxBlur(flat, 10, 5, 3).every((v) => Math.abs(v - 120) < 1e-3), "blur keeps a flat image flat");
  const step = new Float32Array(20);
  for (let x = 10; x < 20; x++) step[x] = 200;
  const b = boxBlur(step, 20, 1, 2);
  assert(b[0] === 0 && b[19] === 200, "blur leaves far pixels alone");
  assert(b[9] > 0 && b[9] < 200 && b[10] > b[9], "blur smooths the step");
  assertEqual(boxBlur(step, 20, 1, 0)[10], 200, "radius 0 copies");
}

// thresholds find the real groups and quantize maps light → 0
{
  // Three clear brightness groups: 30, 130, 230.
  const gray = new Float32Array(300);
  for (let i = 0; i < 300; i++) gray[i] = i < 100 ? 30 : i < 200 ? 130 : 230;
  const cuts = toneThresholds(gray, 3);
  assertEqual(cuts.length, 2, "3 tones → 2 cut-offs");
  assert(cuts[0] > 30 && cuts[0] < 130 && cuts[1] > 130 && cuts[1] < 230, `cut-offs sit between groups (${cuts})`);
  const levels = quantize(gray, cuts);
  assertEqual(levels[250], 0, "brightest group is tone 0 (light)");
  assertEqual(levels[150], 1, "middle group is tone 1");
  assertEqual(levels[50], 2, "darkest group is the last tone (shadow)");
}

// every tone count produces exactly that many tones on a smooth gradient
for (const count of [2, 3, 4] as ToneCount[]) {
  const gray = new Float32Array(256).map((_, i) => i);
  const levels = quantize(gray, toneThresholds(gray, count));
  assertEqual(new Set(levels).size, count, `${count} tones on a gradient`);
  assertEqual(levels[255], 0, `${count}: white is light`);
  assertEqual(levels[0], count - 1, `${count}: black is shadow`);
}

// majority filter removes a lone speck but keeps a big shape
{
  const w = 7;
  const levels = new Uint8Array(w * w);
  levels[3 * w + 3] = 1; // speck in the middle
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) levels[y * w + x] = 2; // 3×3 block
  const out = majorityFilter(levels, w, w, 3);
  assertEqual(out[3 * w + 3], 0, "speck removed");
  assertEqual(out[1 * w + 1], 2, "block centre kept");
}

// outlines sit on the border between tones only
{
  const w = 6;
  const levels = new Uint8Array(w * 2);
  for (let y = 0; y < 2; y++) for (let x = 3; x < w; x++) levels[y * w + x] = 1;
  const edge = shapeOutlines(levels, w, 2, 1);
  assertEqual(edge[2], 1, "border pixel marked");
  assertEqual(edge[0], 0, "inside light shape not marked");
  assertEqual(edge[5], 0, "inside dark shape not marked");
  const thick = shapeOutlines(levels, w, 2, 2);
  assert(thick[1] === 1 && thick[3] === 1, "thickness grows the line");
}

// full pipeline: flat tones from the palette (plus ink), correct size
{
  const w = 60;
  const h = 40;
  const img = makeImage(w, h, (x) => (x < 20 ? 25 : x < 40 ? 128 : 235));
  for (const count of [2, 3, 4] as ToneCount[]) {
    const out = shapesFromRGBA(img, w, h, count, { outlines: false });
    assertEqual(out.length, w * h * 4, `${count}: output size`);
    const palette = new Set(TONES[count].map((t) => t.rgb.join(",")));
    const seen = new Set<string>();
    for (let i = 0; i < out.length; i += 4) seen.add(`${out[i]},${out[i + 1]},${out[i + 2]}`);
    assert([...seen].every((c) => palette.has(c)), `${count}: only palette colours (${[...seen]})`);
    assert(seen.size <= count, `${count}: at most ${count} tones`);
  }
  const three = shapesFromRGBA(img, w, h, 3, { outlines: false });
  const at = (x: number) => three.slice((20 * w + x) * 4, (20 * w + x) * 4 + 3).join(",");
  assertEqual(at(5), TONES[3][2].rgb.join(","), "dark band → shadow");
  assertEqual(at(30), TONES[3][1].rgb.join(","), "mid band → mid");
  assertEqual(at(55), TONES[3][0].rgb.join(","), "light band → light");
  const lined = shapesFromRGBA(img, w, h, 3);
  const ink = [43, 38, 32].join(",");
  let inkCount = 0;
  for (let i = 0; i < lined.length; i += 4) if (`${lined[i]},${lined[i + 1]},${lined[i + 2]}` === ink) inkCount++;
  assert(inkCount > 0 && inkCount < w * h * 0.2, `outlines drawn but thin (${inkCount} px)`);
}

console.log("shapes tests passed");
