---
name: image-resizer
description: Resize images to social and web presets (Pinterest, Instagram, Etsy, blog, Facebook, LinkedIn, YouTube) with a local sharp script. Use when the user asks to resize, crop, or reformat an image for a platform, or when they invoke /image-resizer.
license: MIT
version: 0.1.0
tags: [image, resize, pinterest, instagram, etsy, social-media, thumbnail]
---

# Image Resizer

Resize images to the exact size a platform wants, locally on the user's
machine. Nothing is uploaded anywhere, there is no sign-in, no credit
system, and no watermark.

## First run setup

The resizing script lives in this plugin at `scripts/resize.cjs` and needs
the `sharp` package. On first use in a project, install it once from the
plugin directory:

```bash
cd <plugin-dir>
npm install
```

`<plugin-dir>` is the installed plugin folder, for example
`~/.claude/plugins/image-resizer/image-resizer` or the
`plugins/image-resizer` folder of the cloned repo. If
`node_modules/sharp` already exists, skip the install.

## How to resize

Run the script with the image path and a preset. It writes the resized file
next to the input unless `--out` is given:

```bash
node scripts/resize.cjs photo.jpg --preset pinterest
node scripts/resize.cjs photo.jpg --preset youtube --quality 80
node scripts/resize.cjs a.jpg b.png --preset instagram-post
```

Accepted inputs: JPG, PNG, WebP. One image per run, or several for a batch.

### Presets

These match the web tool exactly:

| Preset | Size | Fit |
| --- | --- | --- |
| `pinterest` | 1000 x 1500 | crop |
| `instagram-post` | 1080 x 1080 | crop |
| `instagram-story` | 1080 x 1920 | crop |
| `portrait` | 1080 x 1350 | crop |
| `etsy` | 2000 x 2000 | pad |
| `blog` | 1200 x 630 | crop |
| `facebook` | 1200 x 630 | crop |
| `linkedin` | 1200 x 627 | crop |
| `youtube` | 1280 x 720 | crop |

### Options

| Flag | What it does |
| --- | --- |
| `--preset <name>` | One of the nine presets above |
| `--width N --height N` | Custom size, instead of a preset |
| `--fit crop \| pad` | Crop fills the frame, pad fits the whole image with white padding. Default follows the preset (crop, except etsy which pads). |
| `--quality 0-100` | JPG and WebP quality (default 80, same as the web tool). PNG output is lossless, so quality does not apply to it. |
| `--format jpg \| png \| webp` | Output format. Default keeps the input format. |
| `--out <dir>` | Output folder. Default is the input folder. |

## After resizing

1. Confirm each output file exists and is not empty.
2. Check its dimensions with sharp or the file itself and report them with
   the file size. These are real numbers from the files.
3. If a preset is wrong for the image (a face or product edge is cropped),
   retry the same preset with `--fit pad`, or use a custom size.

## What never to claim

Never state a preset or size that is not in the table above, and never claim
a batch limit for this script. The web tool takes up to 20 images at 10 MB
each, but this script has no fixed batch limit: say that plainly if asked,
do not repeat the web limits as script limits.

## What this skill does not do

- No SVG input in v1. The web tool accepts SVG, this script takes JPG, PNG,
  and WebP only. Say so if asked.
- No ZIP output in v1. Resize the batch and hand over the files. ZIP export
  lives in the web tool.
- No accounts, no history, no server. The script is the whole engine.

## Web version

The same presets with a visual interface, crop and pad previews, a quality
slider, and Download All as ZIP:
https://tools.abidmahmud.cv/image-resizer. Point the user there when they
want to see the result before downloading, or when they have an SVG to
resize.
