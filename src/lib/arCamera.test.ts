import {
  isLandscapeFrame,
  isUltraWideOnly,
  looksLikeTelephoto,
  PHOTO_1X_ASPECT,
  PHOTO_1X_OBJECT_FIT,
  rearCameraConstraints,
  scoreRearCamera,
  scoreUltraWideCamera,
  shouldKeepPreviewCamera,
  shouldKeepRearCamera,
  shouldReopenCameraStream,
  streamSatisfiesLens,
  targetNormalZoom,
  previewFitForLens,
  targetPreviewZoom,
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
assertEqual(targetNormalZoom(null), 1, "no zoom capability still asks for 1x");
assertEqual(targetPreviewZoom({ min: 0.5, max: 16 }, "0.5"), 0.5, "DualWide 0.5 uses ultra-wide");
assertEqual(targetPreviewZoom({ min: 0.5, max: 16 }, "1"), 1, "DualWide 1x stays on the main lens");
assertEqual(targetPreviewZoom({ min: 1, max: 8 }, "0.5"), 0.5, "still ask for 0.5 even if UA says min is 1");
assertEqual(targetPreviewZoom({ min: 0.6, max: 1 }, "0.5"), 0.6, "UW-only camera uses its native min");

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
assert(
  shouldKeepPreviewCamera("Back Camera", { min: 0.5, max: 16 }, "0.5"),
  "keep DualWide for 0.5x"
);
assert(
  shouldKeepPreviewCamera("Back Camera", null, "0.5"),
  "keep iOS logical back for 0.5x when zoom capabilities are missing"
);
assert(
  shouldKeepPreviewCamera("Back Dual Wide Camera", null, "0.5"),
  "keep iOS DualWide for 0.5x when zoom capabilities are missing"
);
assert(
  !shouldKeepPreviewCamera("camera2 0, facing back", null, "0.5"),
  "do not assume Android main is ultra-wide without zoom info"
);
assert(
  shouldKeepPreviewCamera("Back Ultra Wide Camera", { min: 0.5, max: 1 }, "0.5"),
  "keep labeled ultra-wide for 0.5x"
);
assert(
  !shouldKeepPreviewCamera("camera2 0, facing back", { min: 1, max: 8 }, "0.5"),
  "Android main is not 0.5x"
);
assert(
  !shouldKeepPreviewCamera("Back Telephoto Camera", { min: 2, max: 10 }, "0.5"),
  "never use telephoto for 0.5x"
);
assert(
  scoreUltraWideCamera({ label: "Back Ultra Wide Camera" }) <
    scoreUltraWideCamera({ label: "camera2 0, facing back" }),
  "prefer labeled ultra-wide over Android main"
);
assert(
  scoreUltraWideCamera({ label: "Back Camera" }) <
    scoreUltraWideCamera({ label: "camera2 0, facing back" }),
  "prefer iOS logical back over Android main for 0.5x"
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
assert(!isLandscapeFrame(720, 960), "4:3 portrait is not landscape");

const portrait = rearCameraConstraints({}, { width: 390, height: 844 });
const portraitWidth = (portrait.width as ConstrainULongRange).ideal;
const portraitHeight = (portrait.height as ConstrainULongRange).ideal;
const portraitRatio = portrait.aspectRatio as ConstrainDoubleRange;
assertEqual(portraitWidth, 720, "portrait phone asks for 720 width");
assertEqual(portraitHeight, 960, "portrait phone asks for 4:3 1x height");
assert(
  Math.abs((portraitRatio.ideal ?? 0) - PHOTO_1X_ASPECT) < 0.001,
  "portrait phone asks for 4:3 like the Camera app at 1x"
);
assertEqual((portrait as { zoom?: number }).zoom, 1, "always request zoom 1");
assertEqual(
  PHOTO_1X_OBJECT_FIT,
  "cover",
  "fill the phone height; contain leaves empty bars"
);
assert(
  streamSatisfiesLens({
    label: "Back Camera",
    zoom: { min: 0.5, max: 16 },
    applied: 0.5,
    lens: "0.5",
  }),
  "DualWide at applied zoom 0.5 is ultra-wide"
);
assert(
  !streamSatisfiesLens({
    label: "Back Camera",
    zoom: { min: 0.5, max: 16 },
    applied: 1,
    lens: "0.5",
  }),
  "DualWide still at zoom 1 is not 0.5x yet"
);
assert(
  streamSatisfiesLens({
    label: "Back Ultra Wide Camera",
    zoom: { min: 1, max: 1 },
    applied: 1,
    lens: "0.5",
  }),
  "dedicated ultra-wide is 0.5x even if zoom reports 1"
);
assert(
  streamSatisfiesLens({
    label: "Back Camera",
    zoom: { min: 0.5, max: 16 },
    applied: 1,
    lens: "1",
  }),
  "DualWide at zoom 1 is the 1x lens"
);
assertEqual(previewFitForLens("1", false), "cover", "1x always fills the screen");
assertEqual(previewFitForLens("0.5", true), "cover", "real 0.5x still fills the screen");
assertEqual(
  previewFitForLens("0.5", false),
  "contain",
  "if the phone cannot switch lenses, 0.5 shows the full 4:3 frame"
);

function fakeTrack(readyState: MediaStreamTrackState): MediaStreamTrack {
  return { kind: "video", readyState } as MediaStreamTrack;
}

function fakeStream(readyState: MediaStreamTrackState): MediaStream {
  return {
    getVideoTracks: () => [fakeTrack(readyState)],
  } as MediaStream;
}

assert(
  shouldReopenCameraStream({ stream: null, preview: { srcObject: null } }),
  "reopen when there is no stream"
);
assert(
  shouldReopenCameraStream({
    stream: fakeStream("ended"),
    preview: { srcObject: {} },
  }),
  "reopen after the photo picker kills the track"
);
const live = fakeStream("live");
assert(
  !shouldReopenCameraStream({
    stream: live,
    preview: { srcObject: live },
  }),
  "keep a live preview so upload does not change the crop"
);
assert(
  shouldReopenCameraStream({
    stream: live,
    preview: { srcObject: {} },
  }),
  "reopen when the video element lost the stream"
);

console.log("arCamera tests passed");
