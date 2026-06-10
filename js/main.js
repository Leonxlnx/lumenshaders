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

/* startup: curated reeded-glass ember design (code LMN1.WzEsNyw5MDE1...) */
var P = {
  mode: 7, seed: 9015,
  c1: "#ff6a00", c2: "#ffb347", c3: "#a81c00", c4: "#3d0c02", bg: "#070403",
  hue: 23, sat: 0.55, exposure: 1.016, contrast: 0.957,
  scale: 0.803, complex: 5.603, warp: 1.073, flow: 0.233, stretch: -0.089,
  light: 1.175, gloss: 44, lightAngle: 235, irid: 0.012, glow: 0.471,
  grain: 0.024, cell: 113, lines: 67, ca: 0.018, vig: 0.079, soft: 1.14,
  travel: 0.72, loop: 7.5,
  synthOn: false, modeB: 2, mixOp: 0, blend: 0.6,
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

var activePreset = 3;   /* Ember — matches the startup design */
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

/* pairs that blend into something coherent instead of mud */
var SYNTH_PAIRS = [
  [0, 2], [0, 3], [0, 5], [1, 2], [1, 4], [2, 5], [2, 6], [3, 4],
  [3, 5], [4, 5], [4, 6], [2, 7], [3, 8], [0, 8], [1, 5], [4, 8]
];

function generateSynthStyle() {
  var pair = SYNTH_PAIRS[Math.floor(rnd() * SYNTH_PAIRS.length)];
  var flip = rnd() < 0.5;
  P.mode = flip ? pair[1] : pair[0];
  P.modeB = flip ? pair[0] : pair[1];
  P.mixOp = Math.floor(rnd() * 5);
  P.blend = 0.4 + rnd() * 0.55;
  P.synthOn = true;
}

function synthName() {
  return "SYN " + MODES[P.mode].name.slice(0, 3).toUpperCase() + "+" +
    MODES[P.modeB].name.slice(0, 3).toUpperCase();
}

function randomizeAll() {
  if (!P.lockStyle) {
    if (rnd() < 0.38) {
      generateSynthStyle();
    } else {
      P.synthOn = false;
      P.mode = Math.floor(rnd() * MODES.length);
    }
  }
  randomizePalette();
  randomizeKeys(FORM_KEYS.concat(LIGHT_KEYS, TEXTURE_KEYS, MOTION_KEYS));
  newSeed();
  refreshAll();
}

/* ---------------- saved styles (localStorage) ---------------- */

var STYLES_KEY = "lumen-styles-v1";

function loadSavedStyles() {
  try { return JSON.parse(localStorage.getItem(STYLES_KEY)) || []; }
  catch (e) { return []; }
}
function persistSavedStyles(list) {
  try { localStorage.setItem(STYLES_KEY, JSON.stringify(list)); } catch (e) {}
}
function saveCurrentStyle() {
  var list = loadSavedStyles();
  var base = P.synthOn ? synthName() : MODES[P.mode].name;
  var name = base + " " + String(Math.round(P.seed)).padStart(4, "0");
  list.unshift({ name: name, code: encodeDesign(), ts: Date.now() });
  if (list.length > 24) list.length = 24;
  persistSavedStyles(list);
  renderSavedStyles();
  UI.toast("Style saved: " + name);
}
var renderSavedStyles = function () {};

/* ---------------- design codes (share) ---------------- */

var SHARE_NUMS = [
  "hue", "sat", "exposure", "contrast",
  "scale", "complex", "warp", "flow", "stretch",
  "light", "gloss", "lightAngle", "irid", "glow",
  "grain", "cell", "lines", "ca", "vig", "soft",
  "travel", "loop"
];

function encodeDesign() {
  var arr = [2, P.mode, Math.round(P.seed),
    P.c1.slice(1), P.c2.slice(1), P.c3.slice(1), P.c4.slice(1), P.bg.slice(1),
    P.aspect];
  SHARE_NUMS.forEach(function (k) { arr.push(Math.round(P[k] * 1000) / 1000); });
  arr.push(P.synthOn ? 1 : 0, P.modeB | 0, P.mixOp | 0, Math.round(P.blend * 1000) / 1000);
  var b64 = btoa(JSON.stringify(arr))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return "LMN1." + b64;
}

function decodeDesign(code) {
  try {
    code = String(code).trim().replace(/^#/, "");
    if (code.indexOf("LMN1.") !== 0) return false;
    var b64 = code.slice(5).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    var arr = JSON.parse(atob(b64));
    var baseLen = 9 + SHARE_NUMS.length;
    var isV1 = Array.isArray(arr) && arr[0] === 1 && arr.length === baseLen;
    var isV2 = Array.isArray(arr) && arr[0] === 2 && arr.length === baseLen + 4;
    if (!isV1 && !isV2) return false;

    var hexOk = function (h) { return /^[0-9a-fA-F]{6}$/.test(h); };
    if (![arr[3], arr[4], arr[5], arr[6], arr[7]].every(hexOk)) return false;

    P.mode = Math.min(Math.max(Math.round(arr[1]) || 0, 0), MODES.length - 1);
    P.seed = Math.min(Math.max(Math.round(arr[2]) || 0, 0), 9999);
    P.c1 = "#" + arr[3]; P.c2 = "#" + arr[4]; P.c3 = "#" + arr[5];
    P.c4 = "#" + arr[6]; P.bg = "#" + arr[7];
    if (ASPECTS[arr[8]]) P.aspect = arr[8];
    SHARE_NUMS.forEach(function (k, i) {
      var v = Number(arr[9 + i]);
      if (isFinite(v)) P[k] = v;
    });
    if (isV2) {
      P.synthOn = !!arr[baseLen];
      P.modeB = Math.min(Math.max(Math.round(arr[baseLen + 1]) || 0, 0), MODES.length - 1);
      P.mixOp = Math.min(Math.max(Math.round(arr[baseLen + 2]) || 0, 0), 4);
      var bl = Number(arr[baseLen + 3]);
      P.blend = isFinite(bl) ? Math.min(Math.max(bl, 0), 1) : 0.6;
    } else {
      P.synthOn = false;
    }
    activePreset = -1;
    setPresetActive(-1);
    refreshAll();
    if (typeof fitCanvas === "function") fitCanvas();
    return true;
  } catch (e) {
    return false;
  }
}

function copyText(text, okMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      function () { UI.toast(okMsg); },
      function () { UI.toast("Could not access clipboard"); });
  } else {
    UI.toast("Clipboard not available in this browser");
  }
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
    P.synthOn = false;
    P.mode = Math.floor(rnd() * MODES.length);
    refreshAll();
  });
  reg(UI.modeGrid(sStyle, MODES, function () { return P.synthOn ? -1 : P.mode; },
    function (v) { P.mode = v; P.synthOn = false; refreshAll(); }));

  /* synth: generated styles */
  var synthRow = UI.el("div", "share-row synth-row", sStyle);
  var btnSynth = UI.el("button", "mini-btn", synthRow);
  btnSynth.innerHTML = '<svg viewBox="0 0 16 16"><path d="M2 8 C4 3 7 13 9 8 C11 3 13 11 14 8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="2.5" r="1.2" fill="currentColor"/></svg>New synth style';
  btnSynth.addEventListener("click", function () {
    generateSynthStyle();
    newSeed();
    refreshAll();
    UI.toast("Generated " + synthName());
  });
  var btnSave = UI.el("button", "mini-btn", synthRow);
  btnSave.innerHTML = '<svg viewBox="0 0 16 16"><path d="M3 2 H11 L14 5 V14 H3 Z" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="5.5" y="9" width="5" height="4" fill="currentColor"/></svg>Save style';
  btnSave.addEventListener("click", saveCurrentStyle);

  var synthCtl = UI.el("div", "synth-ctl", sStyle);
  reg(UI.slider(synthCtl, { label: "Synth blend", min: 0, max: 1, step: 0.01, fmt: fmt2,
    get: get("blend"), set: function (v) { P.blend = v; updateMeta(); } }));
  reg(function () { synthCtl.style.display = P.synthOn ? "" : "none"; });

  var savedWrap = UI.el("div", "saved-styles", sStyle);
  renderSavedStyles = function () {
    savedWrap.innerHTML = "";
    var list = loadSavedStyles();
    list.forEach(function (st, i) {
      var chip = UI.el("button", "saved-chip", savedWrap);
      var label = UI.el("span", null, chip);
      label.textContent = st.name;
      var del = UI.el("span", "saved-del", chip);
      del.innerHTML = "&times;";
      del.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var l = loadSavedStyles();
        l.splice(i, 1);
        persistSavedStyles(l);
        renderSavedStyles();
      });
      chip.addEventListener("click", function () {
        if (decodeDesign(st.code)) UI.toast("Loaded " + st.name);
      });
    });
  };
  renderSavedStyles();

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

  /* SHARE */
  var sShare = UI.section(rail, "Share", null);
  var shareRow = UI.el("div", "share-row", sShare);
  var btnCopyCode = UI.el("button", "mini-btn", shareRow);
  btnCopyCode.textContent = "Copy design code";
  btnCopyCode.addEventListener("click", function () {
    copyText(encodeDesign(), "Design code copied, paste it anywhere");
  });
  var btnCopyLink = UI.el("button", "mini-btn", shareRow);
  btnCopyLink.textContent = "Copy link";
  btnCopyLink.addEventListener("click", function () {
    var url = location.origin + location.pathname + "#" + encodeDesign();
    copyText(url, "Share link copied");
  });
  var pasteInput = UI.el("input", "num-input mono share-input", sShare);
  pasteInput.type = "text";
  pasteInput.placeholder = "Paste a design code\u2026";
  pasteInput.spellcheck = false;
  function tryApplyPaste() {
    var v = pasteInput.value.trim();
    if (!v) return;
    if (decodeDesign(v)) {
      UI.toast("Design loaded");
      pasteInput.value = "";
      pasteInput.blur();
    } else {
      UI.toast("Invalid design code");
    }
  }
  pasteInput.addEventListener("paste", function () { setTimeout(tryApplyPaste, 0); });
  pasteInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") tryApplyPaste();
    e.stopPropagation();
  });

  /* EXPORT: buttons open a dialog with preview and settings */
  var sExp = UI.section(rail, "Export", null);
  var grid = UI.el("div", "export-grid", sExp);
  UI.exportButton(grid, "Image", "PNG",
    '<svg viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5.5" cy="5.5" r="1.5" fill="currentColor"/><path d="M2 12 L6 8 L9 11 L11.5 8.5 L14 11" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    function () { Modals.openExport("png"); });
  UI.exportButton(grid, "Video", "WEBM",
    '<svg viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="9" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 7 L14.5 4.5 V11.5 L10.5 9" fill="currentColor"/></svg>',
    function () { Modals.openExport("video"); });
  UI.exportButton(grid, "Looping GIF", "GIF",
    '<svg viewBox="0 0 16 16"><path d="M13.5 8 a5.5 5.5 0 1 1 -1.6 -3.9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M13.8 1.6 V4.4 H11" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    function () { Modals.openExport("gif"); });
  UI.exportButton(grid, "Gradient set", "ZIP",
    '<svg viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    function () { Modals.openSetGenerator(); });
}

/* ---------------- stage / meta ---------------- */

function updateMeta() {
  document.getElementById("meta-mode").textContent =
    P.synthOn ? synthName() : MODES[P.mode].full;
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

  /* load a shared design from the URL hash, e.g. .../#LMN1.xxxx */
  var hash = decodeURIComponent(location.hash.slice(1) || "");
  if (hash.indexOf("LMN1.") === 0 && decodeDesign(hash)) {
    UI.toast("Shared design loaded");
  }

  fitCanvas();
  new ResizeObserver(fitCanvas).observe(document.getElementById("canvas-frame"));

  /* load a shared design from the URL hash, e.g. site/#LMN1.xxxx */
  if (location.hash.length > 6) {
    if (decodeDesign(decodeURIComponent(location.hash.slice(1)))) {
      UI.toast("Shared design loaded");
    }
  }

  /* intro: elements pop in big and settle into place, one after another */
  (function intro() {
    var items = [];
    document.querySelectorAll(".topbar > *").forEach(function (n) { items.push(n); });
    items.push(document.querySelector(".canvas-frame"));
    items.push(document.querySelector(".stage-meta"));
    document.querySelectorAll(".rail-section").forEach(function (n) { items.push(n); });
    items.forEach(function (n, i) {
      if (n) n.style.setProperty("--intro-d", (i * 65) + "ms");
    });
    document.body.classList.add("intro");
    setTimeout(function () { document.body.classList.remove("intro"); }, items.length * 65 + 1100);
  })();

  Engine.onFps(function (fps) {
    document.getElementById("meta-fps").textContent = fps + " fps";
  });

  document.getElementById("btn-random").addEventListener("click", randomizeAll);
  document.getElementById("btn-play").addEventListener("click", function () {
    setPlayingUI(!Engine.isPlaying());
  });
  document.getElementById("btn-export-png").addEventListener("click", function () { Modals.openExport("png"); });
  document.getElementById("btn-export-video").addEventListener("click", function () { Modals.openExport("video"); });
  document.getElementById("btn-export-gif").addEventListener("click", function () { Modals.openExport("gif"); });
  document.getElementById("btn-set").addEventListener("click", function () { Modals.openSetGenerator(); });

  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea") return;
    if (e.code === "Space") { e.preventDefault(); setPlayingUI(!Engine.isPlaying()); }
    else if (e.key === "r" || e.key === "R") { randomizeAll(); }
    else if (e.key === "s" || e.key === "S") { Exporter.exportPNG(P, ASPECTS[P.aspect]); }
  });

  updateMeta();
});
