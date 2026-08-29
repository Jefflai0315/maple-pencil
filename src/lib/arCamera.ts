export type ZoomRange = { min: number; max: number; step?: number };

export function parseAndroidCameraId(label: string): number | null {
  const match =
    label.match(/camera2?\s+(\d+)/i) ||
    label.match(/^(?:camera\s*)?(\d+)\s*,\s*facing/i);
  return match ? Number(match[1]) : null;
}

export function isFrontCameraLabel(label: string) {
  const l = label.toLowerCase();
  return (
    l.includes("front") ||
    l.includes("user") ||
    l.includes("facing front") ||
    l.includes("selfie")
  );
}

export function isRearCameraLabel(label: string) {
  const l = label.toLowerCase();
  return (
    l.includes("back") ||
    l.includes("rear") ||
    l.includes("environment") ||
    l.includes("facing back")
  );
}

export function isUltraWideLabel(label: string) {
  const l = label.toLowerCase();
  return (
    l.includes("ultra") ||
    l.includes("0.5") ||
    /\buw\b/.test(l) ||
    l.includes("wide-angle") ||
    l.includes("wide angle") ||
    l.includes("wideangle") ||
    l.includes("fisheye")
  );
}

export function isTeleLabel(label: string) {
  const l = label.toLowerCase();
  return (
    l.includes("tele") ||
    l.includes("telephoto") ||
    l.includes("periscope") ||
    /\b2x\b/.test(l) ||
    /\b3x\b/.test(l) ||
    /\b5x\b/.test(l)
  );
}

export function getTrackZoomRange(track: MediaStreamTrack): ZoomRange | null {
  const capabilities = track.getCapabilities?.() as
    | { zoom?: ZoomRange }
    | undefined;
  if (
    capabilities?.zoom &&
    typeof capabilities.zoom.min === "number" &&
    typeof capabilities.zoom.max === "number"
  ) {
    return capabilities.zoom;
  }
  return null;
}

/**
 * Real zoom factors: 1 is the default 1× wide lens on iOS and Android.
 * Never pick 2 — that is the telephoto / 2× crop.
 */
export function targetNormalZoom(zoom: ZoomRange | null): number | null {
  if (!zoom) return null;
  if (zoom.min <= 1 && zoom.max >= 1) return 1;
  return zoom.min;
}

export function looksLikeTelephoto(
  label: string,
  zoom: ZoomRange | null
): boolean {
  if (isTeleLabel(label)) return true;
  return Boolean(zoom && zoom.min > 1.01);
}

export function canDo1x(zoom: ZoomRange | null): boolean {
  if (!zoom) return true;
  return zoom.min <= 1 && zoom.max >= 1;
}

/** Physical 0.5× lens: labeled ultra-wide, or zoom never goes past 1. */
export function isUltraWideOnly(
  label: string,
  zoom: ZoomRange | null
): boolean {
  if (isUltraWideLabel(label)) return true;
  return Boolean(zoom && zoom.min < 0.99 && zoom.max <= 1.05);
}

/**
 * Keep the current rear camera when it can do real 1×.
 * A main/logical camera often has zoom.min < 1 — that is not ultra-wide.
 * Drop telephoto and ultra-wide-only lenses.
 */
export function shouldKeepRearCamera(
  label: string,
  zoom: ZoomRange | null
): boolean {
  if (looksLikeTelephoto(label, zoom)) return false;
  if (isUltraWideOnly(label, zoom)) return false;
  return canDo1x(zoom) || zoom == null;
}

export function scoreRearCamera(device: { label: string }): number {
  const label = device.label.toLowerCase();
  if (isUltraWideLabel(label) || isTeleLabel(label)) return 1000;
  const id = parseAndroidCameraId(device.label);
  if (/\bwide\b/.test(label) && !isUltraWideLabel(label)) return -1;
  if (id === 0) return 0;
  if (id != null) return id;
  if (/^(back|rear) camera$/.test(label)) return 0.5;
  return 10 + label.length;
}

/**
 * Keep the request modest. High 1200×1600 / 1080p frames make iPhone 14+
 * Pro sensors switch to the 48MP 2× crop even when zoom says 1.
 */
export const DEFAULT_REAR_CAMERA_SIZE: MediaTrackConstraints = {
  width: { ideal: 720, max: 1280 },
  height: { ideal: 960, max: 1280 },
};

export function rearCameraConstraints(
  extra: MediaTrackConstraints = {}
): MediaTrackConstraints {
  return {
    ...DEFAULT_REAR_CAMERA_SIZE,
    zoom: 1,
    ...extra,
  } as MediaTrackConstraints;
}

/**
 * object-fit:cover on a tall phone with a 4:3 or 16:9 camera buffer crops
 * the frame so it looks like 1.6×–4×. Use contain whenever that crop
 * would exceed a small fill.
 */
export function cameraPreviewObjectFit(
  videoWidth: number,
  videoHeight: number,
  boxWidth: number,
  boxHeight: number
): "contain" | "cover" {
  if (videoWidth <= 0 || videoHeight <= 0 || boxWidth <= 0 || boxHeight <= 0) {
    return "contain";
  }
  const coverScale = Math.max(boxWidth / videoWidth, boxHeight / videoHeight);
  const containScale = Math.min(boxWidth / videoWidth, boxHeight / videoHeight);
  if (containScale <= 0) return "contain";
  return coverScale / containScale > 1.12 ? "contain" : "cover";
}
