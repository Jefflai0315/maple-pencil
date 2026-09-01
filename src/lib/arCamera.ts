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

export type PreviewLens = "0.5" | "1";

/**
 * Real zoom factors: 1 is the default 1× wide lens on iOS and Android.
 * Never pick 2 — that is the telephoto / 2× crop.
 */
export function targetNormalZoom(zoom: ZoomRange | null): number | null {
  return targetPreviewZoom(zoom, "1");
}

/** 0.5 is ultra-wide; 1 is the main wide lens. Never pick 2. */
export function targetPreviewZoom(
  zoom: ZoomRange | null,
  lens: PreviewLens
): number | null {
  if (!zoom) return lens === "0.5" ? 0.5 : 1;
  if (lens === "0.5") return zoom.min;
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
  return shouldKeepPreviewCamera(label, zoom, "1");
}

export function shouldKeepPreviewCamera(
  label: string,
  zoom: ZoomRange | null,
  lens: PreviewLens
): boolean {
  if (looksLikeTelephoto(label, zoom)) return false;
  if (lens === "0.5") {
    if (isUltraWideLabel(label)) return true;
    if (zoom && zoom.min < 0.99) return true;
    // Safari sometimes omits zoom capabilities on the logical back camera.
    return (
      zoom == null &&
      (/^(back|rear) camera$/i.test(label) || /dual\s*wide/i.test(label))
    );
  }
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

/** Prefer a labeled ultra-wide, then the iOS logical back camera (zoom 0.5). */
export function scoreUltraWideCamera(device: { label: string }): number {
  const label = device.label.toLowerCase();
  if (isTeleLabel(label)) return 10000;
  if (isUltraWideLabel(label)) return 0;
  if (/^(back|rear) camera$/.test(label)) return 1;
  const id = parseAndroidCameraId(device.label);
  if (id === 0) return 80;
  if (id != null) return 10 + id;
  return 30;
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
 * Ask for a 4:3 frame and cap resolution so iPhone 14+ Pro does not
 * switch to the 48MP 2× crop. Zoom 0.5 is the ultra-wide lens; zoom 1
 * is the main wide lens. Cover fills the screen.
 */
export const PHOTO_1X_ASPECT = 3 / 4;

/** Fill the phone screen. Contain leaves empty bars above and below. */
export const PHOTO_1X_OBJECT_FIT = "cover" as const;

export function rearCameraConstraints(
  extra: MediaTrackConstraints = {},
  viewport: { width: number; height: number } = getPreviewViewport(),
  zoom = 1
): MediaTrackConstraints {
  const portrait = viewport.height >= viewport.width;
  return {
    width: { ideal: portrait ? 720 : 960, max: 1280 },
    height: { ideal: portrait ? 960 : 720, max: 1280 },
    aspectRatio: { ideal: portrait ? PHOTO_1X_ASPECT : 4 / 3 },
    zoom,
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
  track: MediaStreamTrack,
  zoom = 1
): Promise<void> {
  const settings = track.getSettings();
  if (!isLandscapeFrame(settings.width, settings.height)) return;

  const attempts: MediaTrackConstraints[] = [
    {
      ...PORTRAIT_1X_FRAME,
      zoom,
    } as MediaTrackConstraints,
    {
      aspectRatio: { exact: PHOTO_1X_ASPECT },
      zoom,
    } as MediaTrackConstraints,
    {
      width: { ideal: 960, max: 1280 },
      height: { ideal: 1280, max: 1920 },
      zoom,
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

export function readAppliedZoom(
  track: MediaStreamTrack | null | undefined
): number | undefined {
  const zoom = track?.getSettings?.().zoom;
  return typeof zoom === "number" ? zoom : undefined;
}

export function appliedZoomMatchesLens(
  applied: number | undefined,
  lens: PreviewLens
): boolean {
  if (applied == null) return false;
  if (lens === "0.5") return applied < 0.8;
  return applied >= 0.9 && applied <= 1.2;
}

/**
 * DualWide at zoom 1 still "supports" 0.5, but the picture is 1× until
 * zoom actually moves. A dedicated ultra-wide camera is 0.5 even when
 * settings.zoom reports 1.
 */
export function streamSatisfiesLens(options: {
  label: string;
  zoom: ZoomRange | null;
  applied?: number;
  lens: PreviewLens;
}): boolean {
  if (looksLikeTelephoto(options.label, options.zoom)) return false;
  if (appliedZoomMatchesLens(options.applied, options.lens)) return true;
  if (options.lens === "0.5") {
    return isUltraWideLabel(options.label);
  }
  if (isUltraWideOnly(options.label, options.zoom)) return false;
  return canDo1x(options.zoom) || options.zoom == null;
}

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

export async function applyTrackZoom(
  track: MediaStreamTrack,
  zoom: number
): Promise<void> {
  const attempts: MediaTrackConstraints[] = [
    { zoom } as MediaTrackConstraints,
    { advanced: [{ zoom } as MediaTrackConstraintSet] },
    { zoom: { exact: zoom } } as MediaTrackConstraints,
    { zoom: { ideal: zoom } } as MediaTrackConstraints,
  ];
  for (const constraints of attempts) {
    try {
      await track.applyConstraints(constraints);
      const applied = readAppliedZoom(track);
      if (applied != null && Math.abs(applied - zoom) < 0.08) return;
    } catch {
      continue;
    }
  }
}
