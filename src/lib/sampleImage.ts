/**
 * Generates an in-browser sample image file so first-time visitors can test
 * Image Resizer in one click without uploading their own photos.
 */
export async function createSampleImageFile(): Promise<File> {
  const width = 2400;
  const height = 1600;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

  // 1. Rich Modern Editorial Background Gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#1F8C7F");    // Brand teal
  gradient.addColorStop(0.35, "#275B61"); // Deep ocean
  gradient.addColorStop(0.7, "#E39B64");  // Warm terracotta
  gradient.addColorStop(1, "#F5D49B");    // Golden hour sand
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Artistic geometric backdrop curves & sun
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.arc(width * 0.75, height * 0.35, 320, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.arc(width * 0.75, height * 0.35, 480, 0, Math.PI * 2);
  ctx.fill();

  // Mountain / landscape silhouettes
  ctx.fillStyle = "rgba(11, 11, 13, 0.4)";
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.65);
  ctx.lineTo(width * 0.28, height * 0.45);
  ctx.lineTo(width * 0.55, height * 0.72);
  ctx.lineTo(width * 0.82, height * 0.42);
  ctx.lineTo(width, height * 0.6);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(11, 11, 13, 0.65)";
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.78);
  ctx.lineTo(width * 0.38, height * 0.58);
  ctx.lineTo(width * 0.72, height * 0.82);
  ctx.lineTo(width, height * 0.68);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 3. Editorial typography badge overlay
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 64px -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Nordic Coastal Horizon", 120, height - 220);

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "500 32px -apple-system, BlinkMacSystemFont, 'Inter', monospace";
  ctx.fillText("High-Resolution Sample Photo • 2400 × 1600 px • 3:2 Aspect Ratio", 120, height - 150);

  // Top pill badge
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.roundRect(120, 120, 360, 60, 30);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";
  ctx.fillText("✦ SAMPLE IMAGE ASSET", 155, 158);
  ctx.restore();

  // 4. Convert to JPEG File Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create sample image blob"));
          return;
        }
        const file = new File([blob], "sample-nordic-coastal-2400x1600.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        resolve(file);
      },
      "image/jpeg",
      0.92
    );
  });
}
