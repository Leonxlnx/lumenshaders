# LUMEN, the generative shader studio

**[Try it live →](https://lumenshaders.vercel.app/)**

A self-contained web tool that generates looping abstract shader art: liquid chrome, silk ribbons, soft gradient blooms, aura rings, light rays, halftone fields, data glyphs, reeded glass and pixel mosaics. Everything is rendered in real time with WebGL2 and every animation is a mathematically perfect loop.

![Liquid Chrome](docs/preview-chrome.png)

![Silk Ribbons](docs/preview-silk.png)

![Data Glyphs](docs/preview-glyphs.png)

## Run it

No build step, no dependencies.

- **Live demo:** [lumenshaders.vercel.app](https://lumenshaders.vercel.app/)
- **Local:** double-click `index.html`, or run `npx http-server . -p 8080`

Requires a browser with WebGL2 (Chrome, Edge, Firefox).

## Controls

- **Randomize** (or press `R`): new style, palette, form, lighting and seed, tuned per art style so results stay good. Sometimes it invents a brand-new synth style.
- **Style**: 9 art modes, each with its own renderer. "Keep style" locks the mode while randomizing.
- **Generated styles**: "New style" runs a 12-gene style synthesizer (6 field types x 5 domain geometries x 4 color mappings x 4 shading models x 4 overlays) that produces standalone styles which do not exist in the base set, like FLUX, RIDGE, WAVE, RING, CELL and FLOW archetypes. "Save style" keeps favorites in your browser as one-click chips.
- **Gradient sets**: the Set button renders 4 to 12 variations of the current design (same style and palette, different seeds) and downloads them as a ZIP of PNGs, ideal for using consistent art across one website.
- **Color**: 16 curated palettes plus a harmonic palette generator, 4 editable colors + background, hue / saturation / exposure.
- **Form**: seed, zoom, fbm detail, domain warp, turbulence, anisotropic stretch.
- **Lighting**: intensity, gloss, light angle, iridescence, glow, contrast.
- **Texture**: film grain, halftone/glyph density, ridge count, chromatic aberration, vignette, softness.
- **Motion**: loop length and travel distance. Loops are seamless by construction (the noise field is sampled along a closed circle).
- **Share**: every design serializes to a compact code (`LMN1.…`). Copy it, send it to anyone, and pasting it into the Share box recreates the exact design: style, colors, seed, all parameters. "Copy link" produces a URL that loads the design directly.
- `Space` pauses, `S` saves a PNG.

Full guide: [docs page](https://lumenshaders.vercel.app/docs.html).

## Export

Every export button opens a dialog with a live preview and its settings before downloading.

- **PNG** up to 3840×2160, rendered offscreen at full quality.
- **Video** (WebM VP9/VP8) encoded offline with **WebCodecs** (`VideoEncoder`) and muxed by a built-in dependency-free WebM writer: no `MediaRecorder`, no realtime capture, no tab crashes. Configurable fps (24/30/60), resolution (720p–1440p) and exact length (1–8 loops or 5–60 seconds).
- **GIF** rendered deterministically frame by frame, encoded in-page with a dependency-free GIF89a encoder (median-cut palette + ordered dithering). Loop forever or play once.

## Files

- `index.html` / `styles.css`: app shell and design system
- `js/shaders.js`: the uber fragment shader with all 9 modes
- `js/engine.js`: WebGL2 engine and render loop
- `js/gifenc.js`: GIF encoder (quantizer + LZW)
- `js/webmmux.js`: WebM/Matroska muxer for WebCodecs output
- `js/exporter.js`: PNG / video / GIF pipelines
- `js/palettes.js`, `js/ui.js`, `js/main.js`: palettes, control builders, state and randomizer
