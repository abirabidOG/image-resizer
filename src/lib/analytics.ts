// Google Analytics 4 Integration & Event Tracker for Image Resizer

export const GA_MEASUREMENT_ID =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GA_ID) ||
  'G-ZF1FSM8N07';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Track an individual image resize event
 */
export function trackImageResized(params: {
  preset_id: string;
  preset_name?: string;
  width: number;
  height: number;
  format: string;
  fit_mode: string;
}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  try {
    window.gtag("event", "image_resized", {
      preset_id: params.preset_id,
      preset_name: params.preset_name,
      target_width: params.width,
      target_height: params.height,
      export_format: params.format,
      fit_mode: params.fit_mode,
      tool: "image-resizer",
    });
  } catch (err) {
    console.debug("[Analytics] Failed to track image_resized", err);
  }
}

/**
 * Track a batch download as ZIP event.
 * Easily configured as a key conversion event in Google Analytics 4.
 */
export function trackDownloadAllResize(params: {
  count: number;
  total_bytes?: number;
  export_format: string;
  images_count?: number;
}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  try {
    window.gtag("event", "download_all_resize", {
      files_count: params.count,
      images_count: params.images_count || 1,
      total_bytes: params.total_bytes,
      export_format: params.export_format,
      tool: "image-resizer",
      value: 1, // Useful for conversion value tracking in GA4
    });
  } catch (err) {
    console.debug("[Analytics] Failed to track download_all_resize", err);
  }
}
