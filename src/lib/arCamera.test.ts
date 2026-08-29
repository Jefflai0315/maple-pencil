import {
  isUltraWideOnly,
  looksLikeTelephoto,
  scoreRearCamera,
  shouldKeepRearCamera,
  targetNormalZoom,
} from "./arCamera";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

assertEqual(targetNormalZoom({ min: 0.5, max: 16 }), 1, "iOS logical camera uses zoom 1, not 2");
assertEqual(targetNormalZoom({ min: 1, max: 8 }), 1, "Android main camera stays at 1");
assertEqual(targetNormalZoom({ min: 1, max: 2 }), 1, "never pick zoom 2 when 1 is available");
assertEqual(targetNormalZoom({ min: 2, max: 10 }), 2, "telephoto-only camera keeps its native min");
assertEqual(targetNormalZoom(null), null, "no zoom capability means leave the default lens");

assert(
  shouldKeepRearCamera("Back Camera", { min: 0.5, max: 16 }),
  "keep iOS dual-wide / logical camera and apply 1x"
);
assert(
  shouldKeepRearCamera("camera2 0, facing back", { min: 1, max: 8 }),
  "keep Android main camera"
);
assert(
  shouldKeepRearCamera("camera2 0, facing back", { min: 0.7, max: 8 }),
  "keep main camera even when zoom starts below 1"
);
assert(
  !shouldKeepRearCamera("Back Ultra Wide Camera", { min: 0.5, max: 1 }),
  "drop labeled ultra-wide"
);
assert(
  !shouldKeepRearCamera("camera2 2, facing back", { min: 0.6, max: 1 }),
  "drop unlabeled ultra-wide-only lens"
);
assert(
  !shouldKeepRearCamera("camera2 3, facing back", { min: 2, max: 10 }),
  "drop telephoto whose zoom cannot reach 1"
);
assert(
  !shouldKeepRearCamera("Back Telephoto Camera", { min: 1, max: 5 }),
  "drop labeled telephoto even if zoom.min is 1"
);

assert(isUltraWideOnly("camera2 1, facing back", { min: 0.5, max: 1 }), "uw-only by zoom range");
assert(!isUltraWideOnly("Back Camera", { min: 0.5, max: 16 }), "logical camera is not uw-only");
assert(looksLikeTelephoto("camera2 3, facing back", { min: 2, max: 8 }), "zoom.min > 1 is tele");
assert(!looksLikeTelephoto("camera2 0, facing back", { min: 1, max: 8 }), "main is not tele");

assert(
  scoreRearCamera({ label: "camera2 0, facing back" }) <
    scoreRearCamera({ label: "camera2 1, facing back" }),
  "prefer camera 0 over camera 1"
);
assert(
  scoreRearCamera({ label: "Back Camera" }) <
    scoreRearCamera({ label: "Back Telephoto Camera" }),
  "prefer unlabeled back camera over telephoto"
);

console.log("arCamera tests passed");
