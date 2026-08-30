import {
  isLandscapeFrame,
  isUltraWideOnly,
  looksLikeTelephoto,
  PHOTO_1X_ASPECT,
  rearCameraConstraints,
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

assert(isLandscapeFrame(1920, 1080), "16:9 buffer is landscape");
assert(!isLandscapeFrame(720, 1280), "9:16 buffer is portrait");

const portrait = rearCameraConstraints({}, { width: 390, height: 844 });
const portraitWidth = (portrait.width as ConstrainULongRange).ideal;
const portraitHeight = (portrait.height as ConstrainULongRange).ideal;
const portraitRatio = portrait.aspectRatio as ConstrainDoubleRange;
assertEqual(portraitWidth, 720, "portrait phone asks for 720 width");
assertEqual(portraitHeight, 960, "portrait phone asks for 4:3 1x height, not 9:16");
assert(
  Math.abs((portraitRatio.ideal ?? 0) - PHOTO_1X_ASPECT) < 0.001,
  "portrait phone asks for 4:3 like the Camera app at 1x"
);
assertEqual((portrait as { zoom?: number }).zoom, 1, "always request zoom 1");

const landscape = rearCameraConstraints({}, { width: 1280, height: 720 });
assertEqual(
  (landscape.width as ConstrainULongRange).ideal,
  960,
  "landscape viewport asks for 4:3 width"
);

console.log("arCamera tests passed");
