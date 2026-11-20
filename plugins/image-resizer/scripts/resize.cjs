#!/usr/bin/env node
/**
 * Image Resizer CLI: resize images to social and web presets, locally.
 *
 * Usage:
 *   node scripts/resize.cjs <image...> [--preset pinterest|instagram-post|instagram-story|portrait|etsy|blog|facebook|linkedin|youtube]
 *     [--width N --height N] [--fit crop|pad] [--quality 0-100] [--format jpg|png|webp] [--out dir]
 *
 * Presets and dimensions match the web tool at
 * https://tools.abidmahmud.cv/image-resizer and src/data/presets.ts:
 *   pinterest       1000x1500   instagram-post   1080x1080
 *   instagram-story 1080x1920   portrait         1080x1350
 *   etsy            2000x2000   blog             1200x630
 *   facebook        1200x630    linkedin         1200x627
 *   youtube         1280x720
 *
 * Default fit is crop, except etsy which pads, same as the web tool.
 * Default quality is 80, same as the web tool. Quality applies to JPG and
 * WebP; PNG output is lossless, same as the web tool.
 * Engine: sharp, runs fully offline. Nothing is uploaded.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PRESETS = {
  pinterest: { width: 1000, height: 1500, fit: "crop", label: "Pinterest Pin" },
  "instagram-post": { width: 1080, height: 1080, fit: "crop", label: "Instagram Post" },
  "instagram-story": { width: 1080, height: 1920, fit: "crop", label: "Instagram Story" },
  portrait: { width: 1080, height: 1350, fit: "crop", label: "Instagram Portrait" },
  etsy: { width: 2000, height: 2000, fit: "pad", label: "Etsy Listing" },
  blog: { width: 1200, height: 630, fit: "crop", label: "Blog Featured" },
  facebook: { width: 1200, height: 630, fit: "crop", label: "Facebook Post" },
  linkedin: { width: 1200, height: 627, fit: "crop", label: "LinkedIn Post" },
  youtube: { width: 1280, height: 720, fit: "crop", label: "YouTube Thumbnail" },
};

function parseArgs(argv) {
  const inputs = [];
  const opts = { quality: 80 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--preset") opts.preset = argv[++i];
    else if (a === "--width") opts.width = Number(argv[++i]);
    else if (a === "--height") opts.height = Number(argv[++i]);
    else if (a === "--fit") opts.fit = argv[++i];
    else if (a === "--quality") opts.quality = Number(argv[++i]);
    else if (a === "--format") opts.format = argv[++i];
    else if (a === "--out") opts.outDir = argv[++i];
    else if (a.startsWith("--")) {
      console.error(`Unknown option: ${a}`);
      process.exit(2);
    } else inputs.push(a);
  }
  return { inputs, opts };
}

async function resizeOne(input, opts) {
  const ext = path.extname(input).toLowerCase();
  const format = (opts.format || ext.replace(".", "") || "jpg").toLowerCase();
  if (!["jpg", "jpeg", "png", "webp"].includes(format)) {
    throw new Error(`Unsupported output format: ${format}. Use jpg, png, or webp.`);
  }
  const outFormat = format === "jpeg" ? "jpg" : format;
  const size = opts.width && opts.height ? `${opts.width}x${opts.height}` : opts.preset;
  const base = path.parse(input).name;
  const outName = `${base}-${size}.${outFormat}`;
  const outDir = opts.outDir || path.dirname(input);
  const outPath = path.join(outDir, outName);

  const fit = opts.fit === "pad" ? "contain" : "cover";
  let pipeline = sharp(input).resize(opts.width, opts.height, {
    fit,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  });
  if (outFormat === "jpg") pipeline = pipeline.jpeg({ quality: opts.quality });
  else if (outFormat === "webp") pipeline = pipeline.webp({ quality: opts.quality });
  else pipeline = pipeline.png();

  const info = await pipeline.toFile(outPath);
  return { outPath, width: info.width, height: info.height, bytes: info.size };
}

async function main() {
  const { inputs, opts } = parseArgs(process.argv.slice(2));
  if (inputs.length === 0) {
    console.error(
      "Usage: node scripts/resize.cjs <image...> [--preset pinterest|instagram-post|instagram-story|portrait|etsy|blog|facebook|linkedin|youtube] [--width N --height N] [--quality 0-100] [--out dir]"
    );
    process.exit(2);
  }
  if (opts.preset && !PRESETS[opts.preset]) {
    console.error(
      `Unknown preset: ${opts.preset}. Use ${Object.keys(PRESETS).join(", ")}.`
    );
    process.exit(2);
  }
  if (!opts.preset && !(opts.width && opts.height)) {
    console.error("Give a --preset or both --width and --height.");
    process.exit(2);
  }
  if (opts.preset && (opts.width || opts.height)) {
    console.error("Use --preset or --width/--height, not both.");
    process.exit(2);
  }
  if (opts.quality < 0 || opts.quality > 100 || Number.isNaN(opts.quality)) {
    console.error("--quality must be between 0 and 100.");
    process.exit(2);
  }
  if (opts.fit && !["crop", "pad"].includes(opts.fit)) {
    console.error('--fit must be "crop" or "pad".');
    process.exit(2);
  }

  const target = opts.preset
    ? PRESETS[opts.preset]
    : { width: opts.width, height: opts.height, fit: opts.fit || "crop" };
  const job = {
    width: target.width,
    height: target.height,
    fit: opts.fit || target.fit,
    quality: opts.quality,
    format: opts.format,
    outDir: opts.outDir,
    preset: opts.preset,
  };
  if (job.outDir) fs.mkdirSync(job.outDir, { recursive: true });

  for (const input of inputs) {
    if (!fs.existsSync(input)) {
      console.error(`Not found: ${input}`);
      process.exit(1);
    }
    try {
      const r = await resizeOne(input, job);
      console.log(
        `${path.basename(input)} -> ${r.outPath} (${r.width}x${r.height}, ${r.bytes} bytes)`
      );
    } catch (err) {
      console.error(`Failed to resize ${input}: ${err.message}`);
      process.exit(1);
    }
  }
}

main();
