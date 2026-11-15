import JSZip from "jszip";
import type { FitMode, PresetSizeConfig } from "../data/presets";

export type ExportFormat = "jpg" | "png" | "webp";
export type PaddingColor = "white" | "transparent";

export interface LoadedImage {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  aspectRatio: number;
  imageElement: HTMLImageElement;
  objectUrl: string;
  isSvg: boolean;
}

export interface RenderResult {
  id: string;
  presetId: string;
  presetName: string;
  format: ExportFormat;
  fileName: string;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  fitMode: FitMode;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per file limit
export const MAX_BATCH_IMAGES = 20; // Up to 20 images at once

export const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

export const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg"];

/**
 * Format bytes into human readable KB or MB
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validate an individual uploaded file
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  const hasValidExt = SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  const hasValidMime = SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase());

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `"${file.name}" is unsupported. Please upload JPG, PNG, WebP, or SVG.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" exceeds the 10 MB limit (${formatBytes(file.size)}).`,
    };
  }

  return { valid: true };
}

/**
 * Loads a File into an HTMLImageElement with dimensions & aspect ratio
 */
export async function loadImageFile(file: File): Promise<LoadedImage> {
  const isSvg =
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

  return new Promise((resolve, reject) => {
    let objectUrl: string;

    if (isSvg) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const blob = new Blob([text], { type: "image/svg+xml;charset=utf-8" });
        objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth || 1200;
          const h = img.naturalHeight || 800;
          resolve({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type || "image/svg+xml",
            width: w,
            height: h,
            aspectRatio: w / h,
            imageElement: img,
            objectUrl,
            isSvg: true,
          });
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Failed to load SVG "${file.name}". Ensure valid SVG syntax.`));
        };
        img.src = objectUrl;
      };
      reader.onerror = () => reject(new Error(`Could not read SVG file "${file.name}".`));
      reader.readAsText(file);
    } else {
      objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        resolve({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type || "image/jpeg",
          width: w,
          height: h,
          aspectRatio: w / h,
          imageElement: img,
          objectUrl,
          isSvg: false,
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to load image "${file.name}". Ensure valid image format.`));
      };
      img.src = objectUrl;
    }
  });
}

/**
 * Calculates draw coordinates for Crop to fill vs Fit with padding
 */
export function calculateFitCoordinates(
  targetWidth: number,
  targetHeight: number,
  sourceWidth: number,
  sourceHeight: number,
  fitMode: FitMode
): { x: number; y: number; width: number; height: number } {
  if (fitMode === "crop") {
    // Crop to fill: fills entire canvas with no empty space, centered
    const targetAspect = targetWidth / targetHeight;
    const sourceAspect = sourceWidth / sourceHeight;

    if (sourceAspect > targetAspect) {
      // Source is wider than target: fit height, crop horizontal edges
      const scale = targetHeight / sourceHeight;
      const drawWidth = sourceWidth * scale;
      const drawHeight = targetHeight;
      const drawX = (targetWidth - drawWidth) / 2;
      return { x: drawX, y: 0, width: drawWidth, height: drawHeight };
    } else {
      // Source is taller than target: fit width, crop vertical edges
      const scale = targetWidth / sourceWidth;
      const drawWidth = targetWidth;
      const drawHeight = sourceHeight * scale;
      const drawY = (targetHeight - drawHeight) / 2;
      return { x: 0, y: drawY, width: drawWidth, height: drawHeight };
    }
  } else {
    // Fit with padding: preserves whole image without cropping
    const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const drawX = (targetWidth - drawWidth) / 2;
    const drawY = (targetHeight - drawHeight) / 2;
    return { x: drawX, y: drawY, width: drawWidth, height: drawHeight };
  }
}

/**
 * Renders an image to a given target size, fit mode, and format
 */
export async function renderImageToSize(
  image: LoadedImage,
  targetWidth: number,
  targetHeight: number,
  fitMode: FitMode,
  format: ExportFormat,
  quality: number = 80,
  paddingColor: PaddingColor = "white",
  presetConfig?: PresetSizeConfig | { id: string; name: string; fileBaseName: string }
): Promise<RenderResult> {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create canvas 2D context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Handle Background Fill
  if (format === "jpg") {
    // JPG does not support alpha channel: always fill with white to avoid black background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    // PNG or WebP: transparent or solid white
    if (paddingColor === "white" && fitMode === "pad") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else {
      ctx.clearRect(0, 0, targetWidth, targetHeight);
    }
  }

  // Calculate placement
  const coords = calculateFitCoordinates(
    targetWidth,
    targetHeight,
    image.width,
    image.height,
    fitMode
  );

  ctx.drawImage(
    image.imageElement,
    coords.x,
    coords.y,
    coords.width,
    coords.height
  );

  // Determine export MIME type and quality
  let mimeType = "image/jpeg";
  let extension = "jpg";
  if (format === "png") {
    mimeType = "image/png";
    extension = "png";
  } else if (format === "webp") {
    mimeType = "image/webp";
    extension = "webp";
  }

  const qualityFactor = Math.max(0.1, Math.min(1.0, quality / 100));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export to blob failed"));
          return;
        }

        const dataUrl = URL.createObjectURL(blob);
        const baseName =
          presetConfig?.fileBaseName ||
          `image-custom-${targetWidth}x${targetHeight}`;
        const fileName = `${baseName}.${extension}`;

        resolve({
          id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          presetId: presetConfig?.id || "custom",
          presetName: presetConfig?.name || `Custom ${targetWidth}×${targetHeight}`,
          format,
          fileName,
          blob,
          dataUrl,
          width: targetWidth,
          height: targetHeight,
          sizeBytes: blob.size,
          fitMode,
        });
      },
      mimeType,
      format === "png" ? undefined : qualityFactor
    );
  });
}

/**
 * Triggers a browser download of a single blob
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Creates and downloads a ZIP archive containing all rendered images
 */
export async function downloadAllAsZip(
  results: RenderResult[],
  zipBaseName = "image-resizer-kit"
): Promise<{ count: number; totalBytes: number }> {
  if (results.length === 0) {
    throw new Error("No resized images to download");
  }

  const zip = new JSZip();
  let totalBytes = 0;

  results.forEach((res) => {
    zip.file(res.fileName, res.blob);
    totalBytes += res.sizeBytes;
  });

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  downloadBlob(zipBlob, `${zipBaseName}.zip`);

  return {
    count: results.length,
    totalBytes: zipBlob.size,
  };
}
