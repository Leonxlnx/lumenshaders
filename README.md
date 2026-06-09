# LUMEN — Generative Shader Studio

**[Try it live →](https://leonxlnx.github.io/lumenshaders/)**

A self-contained web tool that generates looping abstract shader art: liquid chrome, silk ribbons, soft gradient blooms, aura rings, light rays, halftone fields, data glyphs, reeded glass and pixel mosaics. Everything is rendered in real time with WebGL2 and every animation is a mathematically perfect loop.

![Liquid Chrome](docs/preview-chrome.png)

![Silk Ribbons](docs/preview-silk.png)

![Data Glyphs](docs/preview-glyphs.png)

## Run it

No build step, no dependencies.

- **Live demo:** [leonxlnx.github.io/lumenshaders](https://leonxlnx.github.io/lumenshaders/)
- **Local:** double-click `index.html`, or run `npx http-server . -p 8080`

Requires a browser with WebGL2 (Chrome, Edge, Firefox).

## Controls

- **Randomize** (or press `R`): new style, palette, form, lighting and seed, tuned per art style so results stay good.
- **Style**: 9 art modes, each with its own renderer. "Keep style" locks the mode while randomizing.
- **Color**: 16 curated palettes plus a harmonic palette generator, 4 editable colors + background, hue / saturation / exposure.
- **Form**: seed, zoom, fbm detail, domain warp, turbulence, anisotropic stretch.
- **Lighting**: intensity, gloss, light angle, iridescence, glow, contrast.
- **Texture**: film grain, halftone/glyph density, ridge count, chromatic aberration, vignette, softness.
- **Motion**: loop length and travel distance. Loops are seamless by construction (the noise field is sampled along a closed circle).
- `Space` pauses, `S` saves a PNG.

## Export

- **PNG** up to 3840×2160, rendered offscreen at full quality.
- **Video** (WebM VP9/VP8) encoded offline with **WebCodecs** (`VideoEncoder`) and muxed by a built-in dependency-free WebM writer — no `MediaRecorder`, no realtime capture, no tab crashes. Configurable fps (24/30/60), resolution (720p–1440p) and exact length (1–8 loops or 5–60 seconds).
- **GIF** rendered deterministically frame by frame, encoded in-page with a dependency-free GIF89a encoder (median-cut palette + ordered dithering). Loop forever or play once.

## Files

- `index.html` / `styles.css` — app shell and design system
- `js/shaders.js` — the uber fragment shader with all 9 modes
- `js/engine.js` — WebGL2 engine and render loop
- `js/gifenc.js` — GIF encoder (quantizer + LZW)
- `js/webmmux.js` — WebM/Matroska muxer for WebCodecs output
- `js/exporter.js` — PNG / video / GIF pipelines
- `js/palettes.js`, `js/ui.js`, `js/main.js` — palettes, control builders, state and randomizer
