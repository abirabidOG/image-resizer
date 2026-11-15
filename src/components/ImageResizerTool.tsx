"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  Download,
  RefreshCw,
  Sparkles,
  Shield,
  Crop,
  Maximize2,
  Lock,
  Unlock,
  Check,
  AlertCircle,
  X,
  FileArchive,
  ArrowRight,
  Plus,
} from "lucide-react";
import {
  PRESET_SIZES,
  type PresetSizeConfig,
  type FitMode,
} from "../data/presets";
import {
  type LoadedImage,
  type ExportFormat,
  type PaddingColor,
  type RenderResult,
  MAX_BATCH_IMAGES,
  MAX_FILE_SIZE_BYTES,
  validateFile,
  loadImageFile,
  renderImageToSize,
  downloadBlob,
  downloadAllAsZip,
  formatBytes,
} from "../lib/imageProcessor";
import { createSampleImageFile } from "../lib/sampleImage";
import { trackImageResized, trackDownloadAllResize } from "../lib/analytics";

export default function ImageResizerTool() {
  // Upload & Batch State
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "success" | "info" | "error";
  } | null>(null);

  // Settings & Presets
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>(
    PRESET_SIZES.map((p) => p.id)
  );
  // Fit modes per preset ID (allows custom override per preset)
  const [fitModes, setFitModes] = useState<Record<string, FitMode>>(() => {
    const initial: Record<string, FitMode> = {};
    PRESET_SIZES.forEach((p) => {
      initial[p.id] = p.defaultFitMode;
    });
    return initial;
  });

  // Custom Size State
  const [includeCustomSize, setIncludeCustomSize] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(800);
  const [isAspectLocked, setIsAspectLocked] = useState<boolean>(true);
  const [customFitMode, setCustomFitMode] = useState<FitMode>("crop");

  // Output Format & Quality
  const [exportFormat, setExportFormat] = useState<ExportFormat>("jpg");
  const [quality, setQuality] = useState<number>(80);
  const [paddingColor, setPaddingColor] = useState<PaddingColor>("white");

  // Processing States
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get active image
  const activeImage =
    images.find((img) => img.id === activeImageId) || images[0] || null;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.objectUrl) URL.revokeObjectURL(img.objectUrl);
      });
    };
  }, [images]);

  // Handle file uploads
  const handleProcessFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      setErrorMessage(null);
      setFeedbackMessage(null);
      setIsLoading(true);

      const availableSlots = MAX_BATCH_IMAGES - images.length;
      if (availableSlots <= 0) {
        setErrorMessage(`Maximum limit of ${MAX_BATCH_IMAGES} images reached.`);
        setIsLoading(false);
        return;
      }

      const filesToProcess = files.slice(0, availableSlots);
      if (files.length > availableSlots) {
        setFeedbackMessage({
          text: `Added ${availableSlots} images. Maximum limit is ${MAX_BATCH_IMAGES} images at once.`,
          type: "info",
        });
      }

      const newLoadedImages: LoadedImage[] = [];
      const errors: string[] = [];

      for (const file of filesToProcess) {
        const val = validateFile(file);
        if (!val.valid) {
          errors.push(val.error || `Invalid file ${file.name}`);
          continue;
        }

        try {
          const loaded = await loadImageFile(file);
          newLoadedImages.push(loaded);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to load image";
          errors.push(msg);
        }
      }

      if (errors.length > 0 && newLoadedImages.length === 0) {
        setErrorMessage(errors.join(" "));
        setIsLoading(false);
        return;
      }

      if (newLoadedImages.length > 0) {
        setImages((prev) => [...prev, ...newLoadedImages]);
        if (!activeImageId) {
          setActiveImageId(newLoadedImages[0].id);
        }
      }

      setIsLoading(false);
    },
    [images.length, activeImageId]
  );

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  // Sample Image Loader
  const handleLoadSample = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const sampleFile = await createSampleImageFile();
      const loaded = await loadImageFile(sampleFile);
      setImages([loaded]);
      setActiveImageId(loaded.id);
      setFeedbackMessage({
        text: "Sample high-resolution photo loaded (2400 × 1600 px). Ready to resize!",
        type: "success",
      });
    } catch {
      setErrorMessage("Could not generate sample image.");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove single image
  const handleRemoveImage = (idToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== idToRemove);
      if (activeImageId === idToRemove) {
        setActiveImageId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  // Clear all images
  const handleClearAll = () => {
    images.forEach((img) => {
      if (img.objectUrl) URL.revokeObjectURL(img.objectUrl);
    });
    setImages([]);
    setActiveImageId(null);
    setFeedbackMessage(null);
    setErrorMessage(null);
  };

  // Toggle Preset selection
  const handleTogglePreset = (presetId: string) => {
    setSelectedPresetIds((prev) =>
      prev.includes(presetId)
        ? prev.filter((id) => id !== presetId)
        : [...prev, presetId]
    );
  };

  // Select/Deselect All Presets
  const handleToggleAllPresets = () => {
    if (selectedPresetIds.length === PRESET_SIZES.length) {
      setSelectedPresetIds([]);
    } else {
      setSelectedPresetIds(PRESET_SIZES.map((p) => p.id));
    }
  };

  // Toggle Fit Mode for specific preset
  const handleTogglePresetFitMode = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFitModes((prev) => ({
      ...prev,
      [presetId]: prev[presetId] === "crop" ? "pad" : "crop",
    }));
  };

  // Custom Size Aspect Ratio Handlers
  const handleCustomWidthChange = (val: number) => {
    const w = Math.max(16, Math.min(6000, val || 16));
    setCustomWidth(w);
    if (isAspectLocked && activeImage) {
      const h = Math.round(w / activeImage.aspectRatio);
      setCustomHeight(Math.max(16, Math.min(6000, h)));
    }
  };

  const handleCustomHeightChange = (val: number) => {
    const h = Math.max(16, Math.min(6000, val || 16));
    setCustomHeight(h);
    if (isAspectLocked && activeImage) {
      const w = Math.round(h * activeImage.aspectRatio);
      setCustomWidth(Math.max(16, Math.min(6000, w)));
    }
  };

  // Download Single Preset for Active Image
  const handleDownloadSinglePreset = async (preset: PresetSizeConfig) => {
    if (!activeImage) return;
    setDownloadingId(preset.id);
    setErrorMessage(null);

    try {
      const fitMode = fitModes[preset.id] || preset.defaultFitMode;
      const result = await renderImageToSize(
        activeImage,
        preset.width,
        preset.height,
        fitMode,
        exportFormat,
        quality,
        paddingColor,
        preset
      );

      downloadBlob(result.blob, result.fileName);

      trackImageResized({
        preset_id: preset.id,
        preset_name: preset.name,
        width: preset.width,
        height: preset.height,
        format: exportFormat,
        fit_mode: fitMode,
      });

      setFeedbackMessage({
        text: `Downloaded ${result.fileName} (${formatBytes(result.sizeBytes)})!`,
        type: "success",
      });
    } catch {
      setErrorMessage(`Failed to export ${preset.name}. Please try again.`);
    } finally {
      setDownloadingId(null);
    }
  };

  // Download Custom Size for Active Image
  const handleDownloadCustomSize = async () => {
    if (!activeImage) return;
    setDownloadingId("custom");
    setErrorMessage(null);

    try {
      const result = await renderImageToSize(
        activeImage,
        customWidth,
        customHeight,
        customFitMode,
        exportFormat,
        quality,
        paddingColor,
        {
          id: "custom",
          name: `Custom ${customWidth}×${customHeight}`,
          fileBaseName: `image-custom-${customWidth}x${customHeight}`,
        }
      );

      downloadBlob(result.blob, result.fileName);

      trackImageResized({
        preset_id: "custom",
        preset_name: `Custom ${customWidth}×${customHeight}`,
        width: customWidth,
        height: customHeight,
        format: exportFormat,
        fit_mode: customFitMode,
      });

      setFeedbackMessage({
        text: `Downloaded ${result.fileName} (${formatBytes(result.sizeBytes)})!`,
        type: "success",
      });
    } catch {
      setErrorMessage("Failed to export custom size. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Download All Selected Presets as ZIP
  const handleDownloadZip = async () => {
    if (images.length === 0) return;

    const selectedConfigs = PRESET_SIZES.filter((p) =>
      selectedPresetIds.includes(p.id)
    );

    if (selectedConfigs.length === 0 && !includeCustomSize) {
      setErrorMessage("Please select at least one preset size or custom size to export.");
      return;
    }

    setIsDownloadingZip(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      const allResults: RenderResult[] = [];

      // For each image in batch, render each selected preset
      for (const img of images) {
        // Base prefix if batch has multiple images
        const namePrefix =
          images.length > 1
            ? img.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
            : "";

        for (const preset of selectedConfigs) {
          const fitMode = fitModes[preset.id] || preset.defaultFitMode;
          const fileBaseName = namePrefix
            ? `${namePrefix}-${preset.fileBaseName}`
            : preset.fileBaseName;

          const res = await renderImageToSize(
            img,
            preset.width,
            preset.height,
            fitMode,
            exportFormat,
            quality,
            paddingColor,
            { ...preset, fileBaseName }
          );
          allResults.push(res);
        }

        // If custom size is selected
        if (includeCustomSize) {
          const fileBaseName = namePrefix
            ? `${namePrefix}-image-custom-${customWidth}x${customHeight}`
            : `image-custom-${customWidth}x${customHeight}`;

          const customRes = await renderImageToSize(
            img,
            customWidth,
            customHeight,
            customFitMode,
            exportFormat,
            quality,
            paddingColor,
            {
              id: "custom",
              name: `Custom ${customWidth}×${customHeight}`,
              fileBaseName,
            }
          );
          allResults.push(customRes);
        }
      }

      const zipName =
        images.length === 1
          ? `${images[0].name.replace(/\.[^/.]+$/, "")}-resized-kit`
          : "image-resizer-kit";

      const zipInfo = await downloadAllAsZip(allResults, zipName);

      trackDownloadAllResize({
        count: zipInfo.count,
        total_bytes: zipInfo.totalBytes,
        export_format: exportFormat,
        images_count: images.length,
      });

      setFeedbackMessage({
        text: `Downloaded ${zipInfo.count} resized image${
          zipInfo.count > 1 ? "s" : ""
        } in ${zipName}.zip (${formatBytes(zipInfo.totalBytes)})!`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create ZIP archive";
      setErrorMessage(msg);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Total count of files in next ZIP export
  const totalZipCount =
    images.length * (selectedPresetIds.length + (includeCustomSize ? 1 : 0));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleProcessFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Hero Intro Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF7F5] px-3.5 py-1 text-xs font-bold text-[#1F8C7F] border border-[#B6E2DC]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>100% Client-Side • In-Browser Canvas API</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B0B0D]">
          Free Image Resizer for Pinterest, Instagram, Etsy and Blog
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#4F4E55] leading-relaxed">
          Get the right image size for Pinterest, Instagram, Etsy and your blog in
          seconds. Free, no upload, your images never leave your browser.
        </p>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {feedbackMessage && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs sm:text-sm ${
            feedbackMessage.type === "success"
              ? "border-[#B6E2DC] bg-[#EBF7F5] text-[#176E64]"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          <Check className="h-5 w-5 shrink-0 mt-0.5 text-[#1F8C7F]" />
          <div className="flex-1 font-medium">{feedbackMessage.text}</div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-[#1F8C7F] hover:text-[#176E64]"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* MAIN TOOL WORKSPACE */}
      <div className="rounded-3xl border border-[#E5E1D6] bg-white p-5 sm:p-7 md:p-8 shadow-sm space-y-8">
        {/* Upload Zone (Empty State OR Compact Bar when Images loaded) */}
        {images.length === 0 ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? "border-[#1F8C7F] bg-[#EBF7F5]/50 scale-[1.01]"
                : "border-[#E5E1D6] bg-[#F4F2EC]/50 hover:bg-[#F4F2EC] hover:border-[#1F8C7F]"
            }`}
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-white text-[#1F8C7F] shadow-sm border border-[#E5E1D6]">
                {isLoading ? (
                  <RefreshCw className="h-8 w-8 animate-spin" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-base sm:text-lg font-bold text-[#0B0B0D]">
                  Drag and drop your images here
                </p>
                <p className="text-xs sm:text-sm text-[#4F4E55]">
                  Accepts JPG, PNG, WebP, SVG up to 10 MB each • Up to 20 images at once
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B0B0D] hover:bg-[#1F8C7F] text-white px-5 py-3 text-sm font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Browse Images</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E1D6] bg-white hover:bg-[#EBF7F5] hover:border-[#1F8C7F] text-[#0B0B0D] hover:text-[#1F8C7F] px-4 py-3 text-sm font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <Sparkles className="h-4 w-4 text-[#1F8C7F]" />
                  <span>Try a sample image</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Images Loaded: Filmstrip + Active Preview */
          <div className="space-y-6">
            {/* Top Toolbar: Image Count & Add More */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E1D6] pb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-lg bg-[#EBF7F5] px-2.5 py-1 text-xs font-mono font-bold text-[#1F8C7F]">
                  {images.length} of {MAX_BATCH_IMAGES} images
                </span>
                <span className="text-xs text-[#4F4E55] hidden sm:inline">
                  Click an image thumbnail to preview
                </span>
              </div>

              <div className="flex items-center gap-2">
                {images.length < MAX_BATCH_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E1D6] bg-white hover:bg-[#F4F2EC] text-xs font-semibold px-3 py-1.5 text-[#0B0B0D] transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add more</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Filmstrip selector if > 1 image */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {images.map((img, idx) => {
                  const isActive = img.id === activeImageId;
                  return (
                    <div
                      key={img.id}
                      onClick={() => setActiveImageId(img.id)}
                      className={`group relative shrink-0 cursor-pointer rounded-xl border-2 p-1.5 transition-all flex items-center gap-2 ${
                        isActive
                          ? "border-[#1F8C7F] bg-[#EBF7F5]"
                          : "border-[#E5E1D6] bg-white hover:border-[#4F4E55]"
                      }`}
                    >
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-[#F4F2EC] flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.objectUrl}
                          alt={img.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 pr-6 text-left">
                        <p className="text-xs font-bold text-[#0B0B0D] truncate max-w-[120px]">
                          {img.name}
                        </p>
                        <p className="text-[10px] text-[#4F4E55] font-mono">
                          {img.width}×{img.height}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveImage(img.id, e)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white/80 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-[#4F4E55] shadow-xs"
                        aria-label={`Remove ${img.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active Image Hero Preview Card */}
            {activeImage && (
              <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC]/40 p-4 sm:p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Left: Visual Preview Canvas */}
                  <div className="w-full md:w-1/2 flex items-center justify-center rounded-xl bg-white border border-[#E5E1D6] p-4 min-h-[220px] max-h-[300px] overflow-hidden shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeImage.objectUrl}
                      alt={activeImage.name}
                      className="max-h-[260px] max-w-full object-contain rounded-md"
                    />
                  </div>

                  {/* Right: Metadata & Specs */}
                  <div className="w-full md:w-1/2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#1F8C7F] bg-[#EBF7F5] px-2.5 py-1 rounded-full border border-[#B6E2DC]">
                        Active Source Image
                      </span>
                      {images.length === 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(activeImage.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-[#0B0B0D] truncate" title={activeImage.name}>
                      {activeImage.name}
                    </h2>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-[#E5E1D6] bg-white p-3">
                        <span className="text-[#4F4E55] block">Dimensions</span>
                        <strong className="text-[#0B0B0D] font-mono text-sm">
                          {activeImage.width} &times; {activeImage.height} px
                        </strong>
                      </div>

                      <div className="rounded-xl border border-[#E5E1D6] bg-white p-3">
                        <span className="text-[#4F4E55] block">File Size</span>
                        <strong className="text-[#0B0B0D] font-mono text-sm">
                          {formatBytes(activeImage.size)}
                        </strong>
                      </div>
                    </div>

                    <p className="text-xs text-[#4F4E55] leading-relaxed">
                      Aspect ratio: <strong>{activeImage.aspectRatio.toFixed(2)}:1</strong>.
                      Select your target sizes below to crop or fit.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONTROLS: Format, Quality, Padding */}
        <div className="rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC]/60 p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Format Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0B0B0D] uppercase tracking-wider block">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["jpg", "png", "webp"] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    className={`rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                      exportFormat === fmt
                        ? "bg-[#0B0B0D] text-white shadow-xs"
                        : "bg-white text-[#0B0B0D] border border-[#E5E1D6] hover:border-[#1F8C7F]"
                    }`}
                  >
                    .{fmt.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#4F4E55]">
                {exportFormat === "jpg"
                  ? "Standard universal JPEG with solid white background."
                  : exportFormat === "png"
                  ? "Lossless PNG with crisp edges & transparency."
                  : "Modern lightweight WebP for ultra-fast web pages."}
              </p>
            </div>

            {/* 2. Quality Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="quality-slider" className="font-bold text-[#0B0B0D] uppercase tracking-wider">
                  Quality
                </label>
                <span className="font-mono font-bold text-[#1F8C7F]">
                  {exportFormat === "png" ? "Lossless (100%)" : `${quality}%`}
                </span>
              </div>
              <input
                id="quality-slider"
                type="range"
                min="10"
                max="100"
                step="5"
                value={quality}
                disabled={exportFormat === "png"}
                onChange={(e) => setQuality(Number(e.target.value))}
                className={`w-full h-2 rounded-lg bg-[#E5E1D6] appearance-none cursor-pointer ${
                  exportFormat === "png" ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="Export quality percentage"
              />
              <p className="text-[11px] text-[#4F4E55]">
                {exportFormat === "png"
                  ? "PNG format preserves 100% lossless fidelity."
                  : "80% gives optimal balance of visual crispness and file size."}
              </p>
            </div>

            {/* 3. Padding Color Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0B0B0D] uppercase tracking-wider block">
                Padding Color (Fit Mode)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaddingColor("white")}
                  className={`rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paddingColor === "white"
                      ? "bg-[#0B0B0D] text-white shadow-xs"
                      : "bg-white text-[#0B0B0D] border border-[#E5E1D6] hover:border-[#1F8C7F]"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full bg-white border border-[#E5E1D6]" />
                  <span>White</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaddingColor("transparent")}
                  disabled={exportFormat === "jpg"}
                  className={`rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paddingColor === "transparent"
                      ? "bg-[#0B0B0D] text-white shadow-xs"
                      : "bg-white text-[#0B0B0D] border border-[#E5E1D6] hover:border-[#1F8C7F]"
                  } ${exportFormat === "jpg" ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <span className="h-3 w-3 rounded-full bg-transparency-grid border border-[#E5E1D6]" />
                  <span>Transparent</span>
                </button>
              </div>
              <p className="text-[11px] text-[#4F4E55]">
                {exportFormat === "jpg"
                  ? "JPG format always outputs white padding."
                  : "Applied when 'Fit with padding' mode is active."}
              </p>
            </div>
          </div>
        </div>

        {/* PRESET SIZES GRID */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E1D6] pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#0B0B0D]">
                Platform Preset Sizes
              </h2>
              <p className="text-xs text-[#4F4E55]">
                Choose presets to resize. Each size supports individual Fit Mode (Crop vs Pad).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleAllPresets}
                className="text-xs font-bold text-[#1F8C7F] hover:underline cursor-pointer"
              >
                {selectedPresetIds.length === PRESET_SIZES.length
                  ? "Deselect All"
                  : `Select All (${PRESET_SIZES.length} presets)`}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {PRESET_SIZES.map((preset) => {
              const isSelected = selectedPresetIds.includes(preset.id);
              const currentFitMode = fitModes[preset.id] || preset.defaultFitMode;
              const isItemDownloading = downloadingId === preset.id;
              const fileName = `${preset.fileBaseName}.${exportFormat}`;

              return (
                <div
                  key={preset.id}
                  onClick={() => handleTogglePreset(preset.id)}
                  className={`rounded-2xl border p-4 sm:p-4.5 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "border-[#1F8C7F] bg-[#EBF7F5]/35 shadow-2xs"
                      : "border-[#E5E1D6] bg-white opacity-65 hover:opacity-100"
                  }`}
                >
                  {/* Top: Name, Category, Dimensions */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent div click
                      className="mt-1 h-4 w-4 rounded border-[#E5E1D6] text-[#1F8C7F] focus:ring-[#1F8C7F] cursor-pointer"
                      aria-label={`Select ${preset.name}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#0B0B0D]">
                          {preset.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#1F8C7F] bg-[#EBF7F5] px-2 py-0.5 rounded-full border border-[#B6E2DC]">
                          {preset.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-extrabold text-[#0B0B0D]">
                          {preset.width} &times; {preset.height} px
                        </span>
                        <span className="text-[11px] text-[#4F4E55] font-mono">
                          ({preset.aspectRatio})
                        </span>
                      </div>

                      <p className="font-mono text-[11px] text-[#4F4E55] mt-1 truncate">
                        {fileName}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Fit Mode toggle & Single Download Button */}
                  <div
                    className="flex items-center justify-between gap-2 border-t border-[#E5E1D6]/60 pt-2.5 mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Fit Mode Toggle Pill */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase text-[#4F4E55] mr-1">
                        Fit:
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleTogglePresetFitMode(preset.id, e)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                          currentFitMode === "crop"
                            ? "bg-[#0B0B0D] text-white"
                            : "bg-white text-[#0B0B0D] border border-[#E5E1D6] hover:border-[#1F8C7F]"
                        }`}
                        title="Crop to fill: Centre crop with no empty borders"
                      >
                        <Crop className="h-3 w-3" />
                        <span>Crop</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleTogglePresetFitMode(preset.id, e)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                          currentFitMode === "pad"
                            ? "bg-[#1F8C7F] text-white"
                            : "bg-white text-[#0B0B0D] border border-[#E5E1D6] hover:border-[#1F8C7F]"
                        }`}
                        title="Fit with padding: Keeps entire image uncropped"
                      >
                        <Maximize2 className="h-3 w-3" />
                        <span>Pad</span>
                      </button>
                    </div>

                    {/* Download single preset button */}
                    <button
                      type="button"
                      disabled={!activeImage || isItemDownloading}
                      onClick={() => handleDownloadSinglePreset(preset)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E1D6] bg-white hover:border-[#1F8C7F] hover:bg-[#EBF7F5] hover:text-[#1F8C7F] text-[#0B0B0D] px-3 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label={`Download ${preset.name}`}
                    >
                      {isItemDownloading ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CUSTOM SIZE OPTION */}
        <div className="rounded-2xl border border-[#E5E1D6] bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCustomSize}
                onChange={(e) => setIncludeCustomSize(e.target.checked)}
                className="h-4 w-4 rounded border-[#E5E1D6] text-[#1F8C7F] focus:ring-[#1F8C7F] cursor-pointer"
              />
              <span className="text-sm font-bold text-[#0B0B0D]">
                Custom Size Option
              </span>
            </label>

            {includeCustomSize && (
              <span className="text-xs font-mono font-bold text-[#1F8C7F] bg-[#EBF7F5] px-2.5 py-0.5 rounded-full border border-[#B6E2DC]">
                image-custom-{customWidth}x{customHeight}.{exportFormat}
              </span>
            )}
          </div>

          {includeCustomSize && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-[#E5E1D6]/70">
              {/* Width Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0B0B0D] block">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="16"
                  max="6000"
                  value={customWidth}
                  onChange={(e) => handleCustomWidthChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E5E1D6] px-3 py-2 text-sm font-mono font-bold text-[#0B0B0D] focus:border-[#1F8C7F] focus:outline-none"
                />
              </div>

              {/* Lock Aspect Ratio Toggle */}
              <div className="flex flex-col justify-end pb-1">
                <button
                  type="button"
                  onClick={() => setIsAspectLocked(!isAspectLocked)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isAspectLocked
                      ? "border-[#1F8C7F] bg-[#EBF7F5] text-[#1F8C7F]"
                      : "border-[#E5E1D6] bg-white text-[#4F4E55]"
                  }`}
                  title={
                    isAspectLocked
                      ? "Aspect ratio locked to source image"
                      : "Aspect ratio unlocked"
                  }
                >
                  {isAspectLocked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5" />
                  )}
                  <span>{isAspectLocked ? "Locked" : "Unlocked"}</span>
                </button>
              </div>

              {/* Height Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0B0B0D] block">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="16"
                  max="6000"
                  value={customHeight}
                  onChange={(e) => handleCustomHeightChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E5E1D6] px-3 py-2 text-sm font-mono font-bold text-[#0B0B0D] focus:border-[#1F8C7F] focus:outline-none"
                />
              </div>

              {/* Fit Mode for Custom & Download */}
              <div className="flex items-end gap-2">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-bold text-[#0B0B0D] block">
                    Fit Mode
                  </label>
                  <select
                    value={customFitMode}
                    onChange={(e) => setCustomFitMode(e.target.value as FitMode)}
                    className="w-full rounded-xl border border-[#E5E1D6] bg-white px-2.5 py-2 text-xs font-bold text-[#0B0B0D] focus:border-[#1F8C7F] focus:outline-none cursor-pointer"
                  >
                    <option value="crop">Crop to fill</option>
                    <option value="pad">Fit with padding</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={!activeImage || downloadingId === "custom"}
                  onClick={handleDownloadCustomSize}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E1D6] bg-white hover:border-[#1F8C7F] hover:bg-[#EBF7F5] hover:text-[#1F8C7F] text-[#0B0B0D] px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {downloadingId === "custom" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span>Export</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR: DOWNLOAD ALL AS ZIP */}
        <div className="border-t border-[#E5E1D6] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs font-medium text-[#4F4E55]">
              {images.length === 0 ? (
                "Upload images above to enable batch resizing."
              ) : (
                <>
                  Exporting <strong>{images.length} image{images.length > 1 ? "s" : ""}</strong> across{" "}
                  <strong>
                    {selectedPresetIds.length + (includeCustomSize ? 1 : 0)} size{selectedPresetIds.length !== 1 ? "s" : ""}
                  </strong>{" "}
                  (<strong>{totalZipCount} total file{totalZipCount !== 1 ? "s" : ""}</strong>) as{" "}
                  <span className="font-bold uppercase text-[#0B0B0D]">.{exportFormat}</span>
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={images.length === 0 || totalZipCount === 0 || isDownloadingZip}
            onClick={handleDownloadZip}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#0B0B0D] hover:bg-[#1F8C7F] text-white px-7 py-4 text-sm font-extrabold transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            {isDownloadingZip ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Generating ZIP Package...</span>
              </>
            ) : (
              <>
                <FileArchive className="h-4 w-4 text-teal-300" />
                <span>
                  Download All as ZIP {totalZipCount > 0 && `(${totalZipCount} files)`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* PRIVACY BADGE */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F2EC] px-4 py-1.5 text-xs font-semibold text-[#4F4E55] border border-[#E5E1D6]">
            <Shield className="h-4 w-4 text-[#1F8C7F]" />
            <span>
              100% private. Your images are processed in your browser and never uploaded.
            </span>
          </div>
        </div>
      </div>

      {/* CROSS-LINKS SECTION */}
      <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://tools.abidmahmud.cv/webptools"
          className="group rounded-2xl border border-[#E5E1D6] bg-white p-5 hover:border-[#1F8C7F] hover:bg-[#EBF7F5]/30 transition-all flex items-center justify-between shadow-2xs"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1F8C7F]">
              Next-Gen Compression
            </span>
            <p className="text-sm font-bold text-[#0B0B0D] group-hover:text-[#1F8C7F] transition-colors">
              Need lighter images too? Try WEBPTools
            </p>
            <p className="text-xs text-[#4F4E55]">
              Batch convert JPG, PNG & SVG to modern WebP with zero quality loss.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-[#4F4E55] group-hover:text-[#1F8C7F] group-hover:translate-x-1 transition-all shrink-0 ml-3" />
        </a>

        <a
          href="https://tools.abidmahmud.cv/logo-kit"
          className="group rounded-2xl border border-[#E5E1D6] bg-white p-5 hover:border-[#1F8C7F] hover:bg-[#EBF7F5]/30 transition-all flex items-center justify-between shadow-2xs"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1F8C7F]">
              Vector & Brand Assets
            </span>
            <p className="text-sm font-bold text-[#0B0B0D] group-hover:text-[#1F8C7F] transition-colors">
              Need the right logo files too? Try Logo File Kit
            </p>
            <p className="text-xs text-[#4F4E55]">
              Export favicon, header, social & 2000px print master logo kits.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-[#4F4E55] group-hover:text-[#1F8C7F] group-hover:translate-x-1 transition-all shrink-0 ml-3" />
        </a>
      </div>
    </div>
  );
}
