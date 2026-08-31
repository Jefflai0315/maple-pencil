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
 * Native 1× is a 4:3 wide-lens frame at zoom 1. Cap resolution so iPhone
 * 14+ Pro does not switch to the 48MP 2× crop.
 *
 * Contain letterboxes that 4:3 on a tall phone (not full height). Cover
 * fills the screen and only crops left/right of 4:3, so vertical FOV
 * stays 1×. Keep the video element full-viewport so the live view does
 * not reflow when the toolbar grows after an upload.
 */
export const PHOTO_1X_ASPECT = 3 / 4;

/** Fill the phone screen. Contain leaves empty bars above and below. */
export const PHOTO_1X_OBJECT_FIT = "cover" as const;

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
 * Chrome often opens landscape 16:9. Ask for portrait 4:3 so cover
 * fills height instead of zooming a landscape buffer.
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

export function isLiveVideoTrack(
  track: MediaStreamTrack | null | undefined
): boolean {
  return Boolean(track && track.readyState === "live");
}

/**
 * Reopen getUserMedia only when the preview stream actually died
 * (iOS photo picker). A live stream should keep the same crop.
 */
export function shouldReopenCameraStream(options: {
  stream?: MediaStream | null;
  preview?: { srcObject: unknown } | null;
}): boolean {
  const track = options.stream?.getVideoTracks()[0];
  if (!isLiveVideoTrack(track)) return true;
  if (!options.preview || options.preview.srcObject !== options.stream) {
    return true;
  }
  return false;
}
