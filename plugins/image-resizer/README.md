# Image Resizer plugin for Claude Code

Resize images to social and web presets without leaving the terminal. Free,
local, no sign-up, nothing uploaded.

## Install

In Claude Code:

```text
/plugin marketplace add abirabidOG/image-resizer
/plugin install image-resizer@image-resizer
```

First run only: the skill installs its resizing engine once, from the plugin
folder:

```bash
cd <plugin-dir>
npm install
```

## Use

```text
/image-resizer photo.jpg --preset pinterest
/image-resizer photo.jpg --preset youtube --quality 80
/image-resizer a.jpg b.png --preset instagram-post
```

Or ask Claude in plain words: "resize this photo for Pinterest". Presets:
`pinterest`, `instagram-post`, `instagram-story`, `portrait`, `etsy`,
`blog`, `facebook`, `linkedin`, `youtube`. Batch resizing takes several
images at once. Custom sizes work with `--width` and `--height`, and
`--fit pad` keeps the whole image with padding instead of cropping.

## How it works

The plugin ships a skill (`skills/image-resizer/SKILL.md`), a slash command
(`/image-resizer`), and a small Node script (`scripts/resize.cjs`) built on
sharp. Resizing runs entirely on your machine. The script prints real
numbers only: output dimensions and file sizes.

## What it does not do (v1)

- No SVG input and no ZIP output. Both live in the web tool.
- No accounts, no history, no server.

## Web version

The same presets with a visual interface, crop and pad previews, a quality
slider, and Download All as ZIP:
https://tools.abidmahmud.cv/image-resizer

## Licence

MIT. By Abid Mahmud, https://www.abidmahmud.cv
