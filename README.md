# Image Resizer

**Resize images for Pinterest, Instagram, Etsy and your blog, free in your browser, no sign-up.**

Live tool: https://tools.abidmahmud.cv/image-resizer

Image Resizer takes your photos and makes them the exact size each platform
wants, so your posts look sharp instead of cropped or blurry. Your files never
leave your device: everything is resized in the browser.

## What it does

- Resize up to 20 images at once, up to 10 MB each
- 9 ready presets for the platforms people actually post on
- Crop or fit with padding, so nothing important gets cut off
- Export as JPG, PNG or WebP, with a quality slider (default 80)
- Download All as ZIP for a whole batch
- A built-in sample image, so you can try it in one click without uploading
- Free, unlimited, no account, no watermark

## Presets

| Preset | Size | Best for |
| --- | --- | --- |
| Pinterest Pin | 1000 x 1500 | Standard vertical pins |
| Instagram Post | 1080 x 1080 | Square feed posts |
| Instagram Story | 1080 x 1920 | Stories and Reels |
| Instagram Portrait | 1080 x 1350 | Vertical feed posts |
| Etsy Listing | 2000 x 2000 | Product photos, fits with padding so the whole product stays visible |
| Blog Featured | 1200 x 630 | Blog heroes and link previews |
| Facebook Post | 1200 x 630 | Timeline posts and shared links |
| LinkedIn Post | 1200 x 627 | Company updates and articles |
| YouTube Thumbnail | 1280 x 720 | HD video thumbnails |

## Use it on the web

Open https://tools.abidmahmud.cv/image-resizer, drop in your images, pick a
preset, choose crop or padding, set the quality, and download. JPG, PNG, WebP
and SVG files are accepted.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Build for production with `npm run build`
and start it with `npm start`.

## Tech

Next.js 16, React 19, TypeScript, Tailwind CSS 4, JSZip. All image work runs
client-side in the browser.

## Claude Code plugin

Image Resizer also ships as a Claude Code plugin in `plugins/image-resizer/`.
Install it with:

```text
/plugin marketplace add abirabidOG/image-resizer
/plugin install image-resizer@image-resizer
```

Then resize from the terminal with `/image-resizer photo.jpg --preset pinterest`.
See `plugins/image-resizer/README.md` for the full usage.

## Author

By Abid Mahmud, Brand Identity Designer: https://www.abidmahmud.cv

## Licence

MIT. See `LICENSE`.
