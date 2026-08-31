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

export function getPreviewViewport(): { width: number; height: number } {
  if (typeof window === "undefined") return { width: 720, height: 1280 };
  const vv = window.visualViewport;
  return {
    width: Math.round(vv?.width ?? window.innerWidth),
    height: Math.round(vv?.height ?? window.innerHeight),
  };
}

/**
 * Native Camera photo 1× is 4:3 of the wide lens.
 * Browser getUserMedia is a video pipeline (often 16:9 + EIS crop), so it
 * already looks a bit tighter than photo 1×. object-fit: cover then crops
 * that 4:3 frame to fill a tall phone (~1.2× extra). Use contain to match
 * photo 1× (small bars, like Camera photo 4:3). Cap resolution so iPhone
 * 14+ Pro does not switch to the 48MP 2× crop.
 */
export const PHOTO_1X_ASPECT = 3 / 4;

/** Show the full 4:3 photo frame. Cover would crop it to fill the screen. */
export const PHOTO_1X_OBJECT_FIT = "contain" as const;

export function rearCameraConstraints(
  extra: MediaTrackConstraints = {},
  viewport: { width: number; height: number } = getPreviewViewport()
): MediaTrackConstraints {
  const portrait = viewport.height >= viewport.width;
  return {
    width: { ideal: portrait ? 720 : 960, max: 1280 },
    height: { ideal: portrait ? 960 : 720, max: 1280 },
    aspectRatio: { ideal: portrait ? PHOTO_1X_ASPECT : 4 / 3 },
    zoom: 1,
    ...extra,
  } as MediaTrackConstraints;
}

export function isLandscapeFrame(width?: number, height?: number): boolean {
  return (width ?? 0) > (height ?? 0);
}

export const PORTRAIT_1X_FRAME: MediaTrackConstraints = {
  width: { ideal: 720, max: 1280 },
  height: { ideal: 960, max: 1280 },
  aspectRatio: { ideal: PHOTO_1X_ASPECT },
};

/**
 * Phone Camera photo 1× is a portrait 4:3 preview (letterboxed on a
 * tall screen). Chrome often opens landscape 16:9; ask the track to
 * switch without CSS-rotating the picture.
 */
export async function ensurePortraitFrame(
  track: MediaStreamTrack
): Promise<void> {
  const settings = track.getSettings();
  if (!isLandscapeFrame(settings.width, settings.height)) return;

  const attempts: MediaTrackConstraints[] = [
    {
      ...PORTRAIT_1X_FRAME,
      zoom: 1,
    } as MediaTrackConstraints,
    {
      aspectRatio: { exact: PHOTO_1X_ASPECT },
      zoom: 1,
    } as MediaTrackConstraints,
    {
      width: { ideal: 960, max: 1280 },
      height: { ideal: 1280, max: 1920 },
      zoom: 1,
    } as MediaTrackConstraints,
  ];

  for (const constraints of attempts) {
    try {
      await track.applyConstraints(constraints);
      const next = track.getSettings();
      if (!isLandscapeFrame(next.width, next.height)) return;
    } catch {
      try {
        await track.applyConstraints({
          advanced: [constraints as MediaTrackConstraintSet],
        });
        const next = track.getSettings();
        if (!isLandscapeFrame(next.width, next.height)) return;
      } catch {
        continue;
      }
    }
  }
}

/**
 * Chrome's default video pipeline may crop-and-scale (EIS / 16:9).
 * Prefer the uncropped photo-sized buffer when the browser allows it.
 */
export async function preferUncroppedPhotoBuffer(
  track: MediaStreamTrack
): Promise<void> {
  try {
    await track.applyConstraints({
      resizeMode: "none",
    } as MediaTrackConstraints);
  } catch {
    try {
      await track.applyConstraints({
        advanced: [{ resizeMode: "none" } as MediaTrackConstraintSet],
      });
    } catch {
      /* Safari and many phones ignore this; zoom 1 + contain still apply. */
    }
  }
}
