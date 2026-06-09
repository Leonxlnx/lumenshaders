/* App state, parameter schema, randomizer recipes, and wiring. */

/* ---------------- modes ---------------- */

var MODES = [
  { id: 0, key: "chrome",   name: "Chrome",   full: "Liquid Chrome",
    icon: '<svg viewBox="0 0 26 18"><path d="M1 12 C5 4 9 15 13 9 C17 3 21 13 25 7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1 15 C5 9 10 17 14 12 C18 8 22 15 25 11" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.45"/></svg>' },
  { id: 1, key: "silk",     name: "Silk",     full: "Silk Ribbons",
    icon: '<svg viewBox="0 0 26 18"><path d="M1 13 C8 11 12 3 25 4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1 15.5 C8 13.5 12 5.5 25 6.5" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.65"/><path d="M1 18 C8 16 12 8 25 9" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.35"/></svg>' },
  { id: 2, key: "bloom",    name: "Bloom",    full: "Soft Bloom",
    icon: '<svg viewBox="0 0 26 18"><circle cx="9" cy="8" r="5.5" fill="currentColor" opacity="0.35"/><circle cx="17" cy="11" r="4" fill="currentColor" opacity="0.6"/></svg>' },
  { id: 3, key: "aura",     name: "Aura",     full: "Aura Rings",
    icon: '<svg viewBox="0 0 26 18"><circle cx="13" cy="9" r="7" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.35"/><circle cx="13" cy="9" r="4.2" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.7"/><circle cx="13" cy="9" r="1.6" fill="currentColor"/></svg>' },
  { id: 4, key: "rays",     name: "Rays",     full: "Light Rays",
    icon: '<svg viewBox="0 0 26 18"><path d="M13 1 L7 17 M13 1 L13 17 M13 1 L19 17 M13 1 L2 13 M13 1 L24 13" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.8"/></svg>' },
  { id: 5, key: "halftone", name: "Halftone", full: "Halftone",
    icon: '<svg viewBox="0 0 26 18"><circle cx="4" cy="5" r="2.4" fill="currentColor"/><circle cx="11" cy="5" r="1.8" fill="currentColor"/><circle cx="18" cy="5" r="1.2" fill="currentColor"/><circle cx="24" cy="5" r="0.7" fill="currentColor"/><circle cx="4" cy="12" r="1.6" fill="currentColor"/><circle cx="11" cy="12" r="2.2" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/><circle cx="24" cy="12" r="0.9" fill="currentColor"/></svg>' },
  { id: 6, key: "glyphs",   name: "Glyphs",   full: "Data Glyphs",
    icon: '<svg viewBox="0 0 26 18"><g fill="currentColor"><rect x="2" y="2" width="2" height="3"/><rect x="7" y="2" width="2" height="3" opacity="0.5"/><rect x="12" y="2" width="2" height="3"/><rect x="17" y="2" width="2" height="3" opacity="0.3"/><rect x="22" y="2" width="2" height="3" opacity="0.7"/><rect x="2" y="8" width="2" height="3" opacity="0.4"/><rect x="7" y="8" width="2" height="3"/><rect x="12" y="8" width="2" height="3" opacity="0.6"/><rect x="17" y="8" width="2" height="3"/><rect x="22" y="8" width="2" height="3" opacity="0.4"/><rect x="2" y="14" width="2" height="3" opacity="0.7"/><rect x="7" y="14" width="2" height="3" opacity="0.3"/><rect x="12" y="14" width="2" height="3" opacity="0.8"/><rect x="17" y="14" width="2" height="3" opacity="0.5"/><rect x="22" y="14" width="2" height="3"/></g></svg>' },
  { id: 7, key: "reeded",   name: "Reeded",   full: "Reeded Glass",
    icon: '<svg viewBox="0 0 26 18"><g stroke="currentColor" stroke-width="1.8" fill="none"><path d="M3 1 V17" opacity="0.9"/><path d="M8 1 V17" opacity="0.5"/><path d="M13 1 V17" opacity="0.9"/><path d="M18 1 V17" opacity="0.5"/><path d="M23 1 V17" opacity="0.9"/></g></svg>' },
  { id: 8, key: "mosaic",   name: "Mosaic",   full: "Pixel Bloom",
    icon: '<svg viewBox="0 0 26 18"><g fill="currentColor"><rect x="2" y="2" width="6" height="6" opacity="0.9"/><rect x="9" y="2" width="6" height="6" opacity="0.4"/><rect x="16" y="2" width="6" height="6" opacity="0.7"/><rect x="2" y="9" width="6" height="6" opacity="0.3"/><rect x="9" y="9" width="6" height="6" opacity="0.8"/><rect x="16" y="9" width="6" height="6" opacity="0.5"/></g></svg>' }
];

var ASPECTS = { "16:9": 16 / 9, "3:2": 1.5, "1:1": 1, "4:5": 0.8, "21:9": 21 / 9 };

/* ---------------- state ---------------- */

var P = {
  mode: 0, seed: Math.floor(Math.random() * 10000),
  c1: "#e0220a", c2: "#ff5a1f", c3: "#1f8cff", c4: "#bfe7ff", bg: "#050507",
  hue: 0, sat: 1.2, exposure: 1.0, contrast: 1.15,
  scale: 1.7, complex: 3.8, warp: 1.1, flow: 0.5, stretch: 0.45,
  light: 1.6, gloss: 64, lightAngle: 130, irid: 0.55, glow: 0.35,
  grain: 0.05, cell: 90, lines: 56, ca: 0.25, vig: 0.35, soft: 0.95,
  travel: 0.7, loop: 5,
  lockStyle: false,
  imgRes: "2160", vidRes: "1080", vidFps: "30", vidLen: "l2",
  gifW: "640", gifFps: 25, gifDither: true, gifLoop: true,
  aspect: "16:9"
};

/* randomizer ranges; missing keys fall back to DEF_RANGE */
var DEF_RANGE = {
  scale: [0.8, 1.8], complex: [3, 6], warp: [0.3, 1.5], flow: [0, 1], stretch: [-0.3, 0.5],
  light: [0.6, 1.6], gloss: [16, 80], lightAngle: [0, 360], irid: [0, 0.8], glow: [0, 0.5],
  contrast: [0.95, 1.2], grain: [0, 0.12], cell: [40, 140], lines: [20, 100], ca: [0, 0.4],
  vig: [0, 0.4], soft: [0.6, 1.4], sat: [0.95, 1.35], exposure: [0.95, 1.1], hue: [0, 0],
  travel: [0.3, 1.0], loop: [4, 8]
};

var RECIPES = {
  chrome: { tone: ["dark"], scale: [1.2, 2.4], complex: [2.8, 5], warp: [0.7, 1.9], flow: [0.2, 1.0],
    stretch: [0.25, 0.7], light: [1.2, 2.0], gloss: [36, 100], irid: [0.2, 0.85], glow: [0.15, 0.55],
    contrast: [1.0, 1.3], grain: [0.02, 0.1], ca: [0, 0.45], vig: [0.15, 0.5], sat: [1.0, 1.4],
    travel: [0.4, 1.0], loop: [4, 8] },
  silk: { tone: ["dark"], scale: [1.2, 2.2], warp: [0.3, 1.0], lines: [40, 90], gloss: [24, 80],
    light: [1.0, 1.9], stretch: [0, 0.4], irid: [0.2, 0.7], glow: [0.2, 0.6], grain: [0.02, 0.08],
    vig: [0.1, 0.4], sat: [1.0, 1.45], contrast: [1.0, 1.25], travel: [0.3, 0.8], loop: [4, 9] },
  bloom: { tone: ["light", "light", "dark"], scale: [0.8, 1.6], warp: [0.3, 1.4], soft: [0.8, 1.5],
    light: [0, 0.6], glow: [0, 0.3], grain: [0, 0.07], ca: [0, 0.25], vig: [0, 0.25],
    contrast: [0.9, 1.05], sat: [0.9, 1.3], travel: [0.5, 1.2], loop: [5, 10] },
  aura: { tone: ["light", "light", "dark"], scale: [0.9, 1.6], warp: [0.2, 1.0], soft: [0.9, 1.6],
    grain: [0, 0.06], contrast: [0.9, 1.05], sat: [0.85, 1.15], vig: [0, 0.2], glow: [0, 0.35],
    ca: [0, 0.08], travel: [0.3, 0.9], loop: [5, 10] },
  rays: { tone: ["light", "light", "dark"], warp: [0.3, 1.2], lines: [20, 90], grain: [0, 0.1],
    glow: [0.1, 0.5], contrast: [0.95, 1.2], sat: [1.0, 1.4], vig: [0, 0.3], travel: [0.2, 0.7],
    loop: [5, 10], scale: [0.9, 1.5] },
  halftone: { tone: ["light", "light", "dark"], cell: [60, 150], scale: [0.9, 1.8], warp: [0.4, 1.4],
    grain: [0, 0.05], contrast: [0.95, 1.15], sat: [0.95, 1.3], ca: [0, 0.2], vig: [0, 0.2],
    travel: [0.4, 1.0], loop: [4, 9] },
  glyphs: { tone: ["dark"], cell: [70, 150], scale: [0.8, 1.6], warp: [0.5, 1.5], grain: [0.02, 0.12],
    glow: [0.3, 0.8], contrast: [1.0, 1.3], sat: [1.0, 1.5], ca: [0, 0.5], vig: [0.2, 0.6],
    travel: [0.4, 1.0], loop: [3, 7] },
  reeded: { tone: ["light", "dark"], lines: [36, 90], warp: [0.6, 1.6], scale: [0.8, 1.5],
    grain: [0, 0.07], light: [0.4, 1.2], contrast: [0.95, 1.2], sat: [1.0, 1.35], vig: [0, 0.18],
    travel: [0.5, 1.1], loop: [5, 10] },
  mosaic: { tone: ["light", "dark"], cell: [40, 120], warp: [0.3, 1.2], scale: [0.8, 1.5],
    grain: [0, 0.04], contrast: [0.95, 1.15], sat: [0.95, 1.3], vig: [0, 0.15],
    travel: [0.5, 1.2], loop: [5, 10], soft: [0.8, 1.4] }
};

var FORM_KEYS = ["scale", "complex", "warp", "flow", "stretch"];
var LIGHT_KEYS = ["light", "gloss", "lightAngle", "irid", "glow", "contrast"];
var TEXTURE_KEYS = ["grain", "cell", "lines", "ca", "vig", "soft"];
var MOTION_KEYS = ["loop", "travel"];
var GRADE_KEYS = ["sat", "exposure"];

/* ---------------- randomizer ---------------- */

function rnd() { return Math.random(); }
function randIn(range) { return range[0] + rnd() * (range[1] - range[0]); }
function rangeFor(key) {
  var rec = RECIPES[MODES[P.mode].key] || {};
  return rec[key] || DEF_RANGE[key];
}

var activePreset = 0;
var setPresetActive = function () {};

function applyPalette(pal, presetIdx) {
  P.c1 = pal.colors[0]; P.c2 = pal.colors[1];
  P.c3 = pal.colors[2]; P.c4 = pal.colors[3];
  P.bg = pal.bg;
  activePreset = presetIdx;
  setPresetActive(presetIdx);
}

function randomizePalette() {
  var rec = RECIPES[MODES[P.mode].key] || { tone: ["dark", "light"] };
  var tone = rec.tone[Math.floor(rnd() * rec.tone.length)];
  if (rnd() < 0.25) {
    applyPalette(generateRandomPalette(rnd, tone), -1);
  } else {
    var pool = [];
    PALETTES.forEach(function (p, i) { if (p.tone === tone) pool.push(i); });
    var idx = pool[Math.floor(rnd() * pool.length)];
    applyPalette(PALETTES[idx], idx);
  }
  P.hue = 0;
  GRADE_KEYS.forEach(function (k) { P[k] = randIn(rangeFor(k)); });
}

function randomizeKeys(keys) {
  keys.forEach(function (k) {
    var v = randIn(rangeFor(k));
    if (k === "gloss" || k === "cell" || k === "lines" || k === "lightAngle") v = Math.round(v);
    if (k === "loop") v = Math.round(v * 2) / 2;
    P[k] = v;
  });
}

function newSeed() { P.seed = Math.floor(rnd() * 10000); }

function randomizeAll() {
  if (!P.lockStyle) P.mode = Math.floor(rnd() * MODES.length);
  randomizePalette();
  randomizeKeys(FORM_KEYS.concat(LIGHT_KEYS, TEXTURE_KEYS, MOTION_KEYS));
  newSeed();
  refreshAll();
}

/* ---------------- UI wiring ---------------- */

var refreshers = [];
function reg(fn) { refreshers.push(fn); return fn; }
function refreshAll() {
  refreshers.forEach(function (f) { f(); });
  updateMeta();
}

function get(k) { return function () { return P[k]; }; }
function set(k) { return function (v) { P[k] = v; updateMeta(); }; }

function fmt2(v) { return (+v).toFixed(2); }
function fmt1(v) { return (+v).toFixed(1); }
function fmtInt(v) { return String(Math.round(v)); }
function fmtDeg(v) { return Math.round(v) + "\u00b0"; }
function fmtSec(v) { return (+v).toFixed(1) + "s"; }

function buildRail() {
  var rail = document.getElementById("rail");

  /* STYLE */
  var sStyle = UI.section(rail, "Style", function () {
    P.mode = Math.floor(rnd() * MODES.length);
    refreshAll();
  });
  reg(UI.modeGrid(sStyle, MODES, get("mode"), function (v) { P.mode = v; updateMeta(); }));
  reg(UI.lockRow(sStyle, { label: "Keep style when randomizing", get: get("lockStyle"), set: set("lockStyle") }));

  /* COLOR */
  var sColor = UI.section(rail, "Color", function () { randomizePalette(); refreshAll(); });
  setPresetActive = UI.presetChips(sColor, PALETTES, function (i) {
    applyPalette(PALETTES[i], i);
    refreshAll();
  });
  setPresetActive(activePreset);
  reg(UI.colorSwatches(sColor,
    [{ key: "c1", label: "A" }, { key: "c2", label: "B" }, { key: "c3", label: "C" }, { key: "c4", label: "D" },
     { gap: true }, { key: "bg", label: "BG" }],
    function (k) { return P[k]; },
    function (k, v) { P[k] = v; activePreset = -1; setPresetActive(-1); }));
  reg(UI.slider(sColor, { label: "Hue shift", min: -180, max: 180, step: 1, fmt: fmtDeg, get: get("hue"), set: set("hue") }));
  reg(UI.slider(sColor, { label: "Saturation", min: 0, max: 2, step: 0.01, fmt: fmt2, get: get("sat"), set: set("sat") }));
  reg(UI.slider(sColor, { label: "Exposure", min: 0.5, max: 1.6, step: 0.01, fmt: fmt2, get: get("exposure"), set: set("exposure") }));

  /* FORM */
  var sForm = UI.section(rail, "Form", function () { randomizeKeys(FORM_KEYS); newSeed(); refreshAll(); });
  reg(UI.seedRow(sForm, { get: get("seed"), set: function (v) { P.seed = v; updateMeta(); refreshAll(); }, onDice: function () { newSeed(); refreshAll(); } }));
  reg(UI.slider(sForm, { label: "Zoom", min: 0.5, max: 3, step: 0.01, fmt: fmt2, get: get("scale"), set: set("scale") }));
  reg(UI.slider(sForm, { label: "Detail", min: 1, max: 8, step: 0.1, fmt: fmt1, get: get("complex"), set: set("complex") }));
  reg(UI.slider(sForm, { label: "Warp", min: 0, max: 2.5, step: 0.01, fmt: fmt2, get: get("warp"), set: set("warp") }));
  reg(UI.slider(sForm, { label: "Turbulence", min: 0, max: 2, step: 0.01, fmt: fmt2, get: get("flow"), set: set("flow") }));
  reg(UI.slider(sForm, { label: "Stretch", min: -1, max: 1, step: 0.01, fmt: fmt2, get: get("stretch"), set: set("stretch") }));

  /* LIGHTING */
  var sLight = UI.section(rail, "Lighting", function () { randomizeKeys(LIGHT_KEYS); refreshAll(); });
  reg(UI.slider(sLight, { label: "Intensity", min: 0, max: 2.2, step: 0.01, fmt: fmt2, get: get("light"), set: set("light") }));
  reg(UI.slider(sLight, { label: "Gloss", min: 4, max: 120, step: 1, fmt: fmtInt, get: get("gloss"), set: set("gloss") }));
  reg(UI.slider(sLight, { label: "Angle", min: 0, max: 360, step: 1, fmt: fmtDeg, get: get("lightAngle"), set: set("lightAngle") }));
  reg(UI.slider(sLight, { label: "Iridescence", min: 0, max: 1, step: 0.01, fmt: fmt2, get: get("irid"), set: set("irid") }));
  reg(UI.slider(sLight, { label: "Glow", min: 0, max: 1, step: 0.01, fmt: fmt2, get: get("glow"), set: set("glow") }));
  reg(UI.slider(sLight, { label: "Contrast", min: 0.6, max: 1.6, step: 0.01, fmt: fmt2, get: get("contrast"), set: set("contrast") }));

  /* TEXTURE */
  var sTex = UI.section(rail, "Texture", function () { randomizeKeys(TEXTURE_KEYS); refreshAll(); });
  reg(UI.slider(sTex, { label: "Grain", min: 0, max: 0.4, step: 0.005, fmt: fmt2, get: get("grain"), set: set("grain") }));
  reg(UI.slider(sTex, { label: "Density", min: 14, max: 180, step: 1, fmt: fmtInt, get: get("cell"), set: set("cell") }));
  reg(UI.slider(sTex, { label: "Ridges", min: 8, max: 160, step: 1, fmt: fmtInt, get: get("lines"), set: set("lines") }));
  reg(UI.slider(sTex, { label: "Aberration", min: 0, max: 1, step: 0.01, fmt: fmt2, get: get("ca"), set: set("ca") }));
  reg(UI.slider(sTex, { label: "Vignette", min: 0, max: 1, step: 0.01, fmt: fmt2, get: get("vig"), set: set("vig") }));
  reg(UI.slider(sTex, { label: "Softness", min: 0.3, max: 1.6, step: 0.01, fmt: fmt2, get: get("soft"), set: set("soft") }));

  /* MOTION */
  var sMotion = UI.section(rail, "Motion", function () { randomizeKeys(MOTION_KEYS); refreshAll(); });
  reg(UI.slider(sMotion, { label: "Loop length", min: 2, max: 12, step: 0.5, fmt: fmtSec, get: get("loop"), set: set("loop") }));
  reg(UI.slider(sMotion, { label: "Travel", min: 0, max: 1.5, step: 0.01, fmt: fmt2, get: get("travel"), set: set("travel") }));

  /* EXPORT */
  var sExp = UI.section(rail, "Export", null);
  reg(UI.selectRow(sExp, { label: "Image size", options: [["1080", "1920 \u00d7 1080"], ["1440", "2560 \u00d7 1440"], ["2160", "3840 \u00d7 2160"]], get: get("imgRes"), set: set("imgRes") }));
  reg(UI.selectRow(sExp, { label: "Video size", options: [["720", "720p"], ["1080", "1080p"], ["1440", "1440p"]], get: get("vidRes"), set: set("vidRes") }));
  reg(UI.selectRow(sExp, { label: "Video fps", options: [["24", "24 fps"], ["30", "30 fps"], ["60", "60 fps"]], get: get("vidFps"), set: set("vidFps") }));
  reg(UI.selectRow(sExp, { label: "Video length", options: [
    ["l1", "1 loop"], ["l2", "2 loops"], ["l3", "3 loops"], ["l4", "4 loops"], ["l6", "6 loops"], ["l8", "8 loops"],
    ["s5", "5 seconds"], ["s10", "10 seconds"], ["s15", "15 seconds"], ["s30", "30 seconds"], ["s60", "60 seconds"]
  ], get: get("vidLen"), set: set("vidLen") }));
  reg(UI.selectRow(sExp, { label: "GIF width", options: [["360", "360 px"], ["480", "480 px"], ["640", "640 px"], ["800", "800 px"]], get: get("gifW"), set: set("gifW") }));
  reg(UI.selectRow(sExp, { label: "GIF fps", options: [["15", "15 fps"], ["20", "20 fps"], ["25", "25 fps"], ["30", "30 fps"]], get: function () { return String(P.gifFps); }, set: function (v) { P.gifFps = parseInt(v, 10); } }));
  reg(UI.toggleRow(sExp, { label: "GIF dithering", get: get("gifDither"), set: set("gifDither") }));
  reg(UI.toggleRow(sExp, { label: "GIF loop forever", get: get("gifLoop"), set: set("gifLoop") }));

  var grid = UI.el("div", "export-grid", sExp);
  UI.exportButton(grid, "Save image", "PNG",
    '<svg viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5.5" cy="5.5" r="1.5" fill="currentColor"/><path d="M2 12 L6 8 L9 11 L11.5 8.5 L14 11" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    function () { Exporter.exportPNG(P, ASPECTS[P.aspect]); });
  UI.exportButton(grid, "Record video", "WEBM",
    '<svg viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="9" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 7 L14.5 4.5 V11.5 L10.5 9" fill="currentColor"/></svg>',
    function () { Exporter.exportVideo(P, ASPECTS[P.aspect]); });
  UI.exportButton(grid, "Render loop GIF", "GIF",
    '<svg viewBox="0 0 16 16"><path d="M13.5 8 a5.5 5.5 0 1 1 -1.6 -3.9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M13.8 1.6 V4.4 H11" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    function () { Exporter.exportGIF(P, ASPECTS[P.aspect]); });
}

/* ---------------- stage / meta ---------------- */

function updateMeta() {
  document.getElementById("meta-mode").textContent = MODES[P.mode].full;
  document.getElementById("meta-seed").textContent = "seed " + String(Math.round(P.seed)).padStart(4, "0");
  document.getElementById("meta-loop").textContent = P.loop.toFixed(1) + "s loop";
  var s = Engine.size();
  document.getElementById("meta-res").textContent = s[0] + "\u00d7" + s[1];
}

function fitCanvas() {
  var frame = document.getElementById("canvas-frame");
  var availW = frame.clientWidth - 80;
  var availH = frame.clientHeight - 52;
  if (availW <= 0 || availH <= 0) return;
  var ar = ASPECTS[P.aspect];
  var w = availW, h = w / ar;
  if (h > availH) { h = availH; w = h * ar; }
  var canvas = Engine.canvas();
  canvas.style.width = Math.round(w) + "px";
  canvas.style.height = Math.round(h) + "px";
  var dpr = Math.min(window.devicePixelRatio || 1, 1.35);
  Engine.setSize(2 * Math.round(w * dpr / 2), 2 * Math.round(h * dpr / 2));
  updateMeta();
}

function setPlayingUI(v) {
  Engine.setPlaying(v);
  document.getElementById("icon-pause").style.display = v ? "" : "none";
  document.getElementById("icon-play").style.display = v ? "none" : "";
}

/* ---------------- boot ---------------- */

document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.getElementById("view");
  try {
    Engine.init(canvas, function () { return P; });
  } catch (e) {
    document.querySelector(".canvas-frame").innerHTML =
      '<div style="color:#9b9ba4;font-size:13px;max-width:380px;text-align:center;line-height:1.6">' +
      "WebGL2 is required. Please use a recent Chrome, Edge or Firefox.<br><span style=\"color:#5e5e68;font-size:11px\">" +
      String(e.message).split("\n")[0] + "</span></div>";
    return;
  }

  buildRail();

  /* aspect segmented control */
  var segRefresh = UI.segmented(
    document.getElementById("aspect-seg"),
    Object.keys(ASPECTS).map(function (k) { return [k, k]; }),
    get("aspect"),
    function (v) { P.aspect = v; fitCanvas(); }
  );
  reg(segRefresh);

  fitCanvas();
  new ResizeObserver(fitCanvas).observe(document.getElementById("canvas-frame"));

  Engine.onFps(function (fps) {
    document.getElementById("meta-fps").textContent = fps + " fps";
  });

  document.getElementById("btn-random").addEventListener("click", randomizeAll);
  document.getElementById("btn-play").addEventListener("click", function () {
    setPlayingUI(!Engine.isPlaying());
  });
  document.getElementById("btn-export-png").addEventListener("click", function () { Exporter.exportPNG(P, ASPECTS[P.aspect]); });
  document.getElementById("btn-export-video").addEventListener("click", function () { Exporter.exportVideo(P, ASPECTS[P.aspect]); });
  document.getElementById("btn-export-gif").addEventListener("click", function () { Exporter.exportGIF(P, ASPECTS[P.aspect]); });

  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea") return;
    if (e.code === "Space") { e.preventDefault(); setPlayingUI(!Engine.isPlaying()); }
    else if (e.key === "r" || e.key === "R") { randomizeAll(); }
    else if (e.key === "s" || e.key === "S") { Exporter.exportPNG(P, ASPECTS[P.aspect]); }
  });

  updateMeta();
});
