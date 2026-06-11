/* Curated palettes derived from the reference moods.
   tone: 'dark' | 'light' decides which modes prefer them. */

var PALETTES = [
  { name: "Inferno Chrome", tone: "dark",
    bg: "#050507", colors: ["#e0220a", "#ff5a1f", "#1f8cff", "#bfe7ff"] },
  { name: "Neon Silk", tone: "dark",
    bg: "#040406", colors: ["#19e3e3", "#ff2d78", "#ff7a1a", "#7a2dff"] },
  { name: "Ultraviolet", tone: "dark",
    bg: "#06040c", colors: ["#2440ff", "#8a2bff", "#e22bd0", "#ff5470"] },
  { name: "Ember", tone: "dark",
    bg: "#070403", colors: ["#ff6a00", "#ffb347", "#a81c00", "#3d0c02"] },
  { name: "Deep Signal", tone: "dark",
    bg: "#030608", colors: ["#0e3a5c", "#2e7fb8", "#9fd4e8", "#16222e"] },
  { name: "Red Telemetry", tone: "dark",
    bg: "#0a0202", colors: ["#ff2414", "#c81204", "#ff7a5c", "#5c0a02"] },
  { name: "Ghost Mono", tone: "dark",
    bg: "#030304", colors: ["#f2f2f4", "#9a9aa6", "#3c3c46", "#c8c8d2"] },
  { name: "Acid Garden", tone: "dark",
    bg: "#04070a", colors: ["#b8ff2e", "#1fd9a4", "#0a7a5c", "#eaffd0"] },
  { name: "Blush", tone: "light",
    bg: "#fbf6f2", colors: ["#d4607a", "#f0b890", "#fde8d8", "#b8434f"] },
  { name: "Prism Pastel", tone: "light",
    bg: "#f4f1fa", colors: ["#ffb340", "#2b3bd4", "#ff4f9a", "#9a8cff"] },
  { name: "Sky Aura", tone: "light",
    bg: "#e8edfb", colors: ["#2451e8", "#6fa3f5", "#f0a8c8", "#fdfdff"] },
  { name: "Halo", tone: "light",
    bg: "#f4f6ff", colors: ["#4a30e0", "#7a8cff", "#e89ab8", "#c2d4ff"] },
  { name: "Solar Flare", tone: "light",
    bg: "#fefcf8", colors: ["#e8401c", "#ff8a2a", "#ffc04a", "#a82408"] },
  { name: "Glacier", tone: "light",
    bg: "#f8fafc", colors: ["#1a56d6", "#4a9af0", "#a8d4ff", "#0a2a6e"] },
  { name: "Tangerine Glass", tone: "dark",
    bg: "#1c1e22", colors: ["#ff7a14", "#e8e4dc", "#3a3e46", "#ffb066"] },
  { name: "Velvet Dusk", tone: "dark",
    bg: "#08050c", colors: ["#ff3d2e", "#ff8c5a", "#5a1eb8", "#1a0a3c"] }
];

/* Generates a harmonised random palette: pick base hue + scheme. */
function generateRandomPalette(rand, tone) {
  var h = rand() * 360;
  var schemes = [
    [0, 22, 48, 180],      // analogous + complement pop
    [0, 150, 180, 210],    // split complementary
    [0, 120, 240, 60],     // triad + bridge
    [0, 30, -30, 200],     // warm cluster + cold accent
    [0, 8, 16, 24]         // tight monochrome drift
  ];
  var sch = schemes[Math.floor(rand() * schemes.length)];
  var dark = tone === "dark";
  var colors = sch.map(function (off, i) {
    var hue = ((h + off) % 360 + 360) % 360;
    var s = dark ? 0.48 + rand() * 0.32 : 0.38 + rand() * 0.28;
    var l = dark
      ? (i === 0 ? 0.48 : 0.26 + rand() * 0.38)
      : (i === 0 ? 0.46 : 0.42 + rand() * 0.34);
    return hslToHex(hue, s, l);
  });
  var bg = dark
    ? hslToHex(h + (rand() - 0.5) * 60, 0.3 + rand() * 0.4, 0.015 + rand() * 0.035)
    : hslToHex(h + (rand() - 0.5) * 60, 0.25 + rand() * 0.35, 0.93 + rand() * 0.05);
  return { name: "Generated", tone: tone, bg: bg, colors: colors };
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  var c = (1 - Math.abs(2 * l - 1)) * s;
  var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  var m = l - c / 2;
  var r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return "#" + [r, g, b].map(function (v) {
    return Math.round((v + m) * 255).toString(16).padStart(2, "0");
  }).join("");
}

function hexToRgb01(hex) {
  var v = parseInt(hex.slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}
