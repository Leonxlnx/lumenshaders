/* GLSL sources. One uber fragment shader, mode switched by uniform.
   All motion is driven by a phase in [0,1) sampled on a circle in noise
   space, so every animation is a mathematically perfect loop. */

var VERT_SRC = "#version 300 es\n" +
"layout(location=0) in vec2 a_pos;\n" +
"void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }\n";

var FRAG_SRC = `#version 300 es
precision highp float;
precision highp int;

uniform vec2  u_res;
uniform float u_phase;     // 0..1 loop phase
uniform float u_seed;
uniform int   u_mode;

uniform vec3  u_c1, u_c2, u_c3, u_c4, u_bg;
uniform float u_hue, u_sat, u_exposure, u_contrast;

uniform float u_scale;     // zoom: higher = larger forms
uniform float u_complex;   // fbm octaves 1..8
uniform float u_warp;
uniform float u_flow;      // extra turbulence
uniform float u_stretch;   // -1..1 anisotropy

uniform float u_light, u_gloss, u_lightAngle, u_irid, u_glow;

uniform float u_grain, u_cell, u_lines, u_ca, u_vig, u_soft;
uniform float u_travel;

/* synth: procedural style combinator */
uniform int   u_synth;     // 0 = single mode, 1 = blend two modes
uniform int   u_modeB;
uniform int   u_mixOp;     // 0 noise mask, 1 screen, 2 multiply, 3 radial, 4 diagonal
uniform float u_blend;

out vec4 fragColor;

#define TAU 6.28318530718
#define PI  3.14159265359

/* ---------------- noise ---------------- */

/* fract-first hashes stay precise for large inputs (big seeds, far cells) */
float hash11(float n){
  n = fract(n * 0.1031);
  n *= n + 33.33;
  n *= n + n;
  return fract(n);
}
float hash21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p){
  float n = hash21(p);
  return vec2(n, hash21(p+n+17.13));
}

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  float a = hash21(i);
  float b = hash21(i+vec2(1,0));
  float c = hash21(i+vec2(0,1));
  float d = hash21(i+vec2(1,1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

float fbm(vec2 p){
  float v = 0.0, a = 0.5, tot = 0.0;
  mat2 R = rot(0.62);
  for (int i = 0; i < 8; i++){
    float w = clamp(u_complex - float(i), 0.0, 1.0);
    if (w <= 0.0) break;
    v += a*w*vnoise(p);
    tot += a*w;
    a *= 0.55;
    p = R*p*2.03 + 11.7;
  }
  return v/max(tot, 1e-4);
}

/* loop offset: orbit in noise space -> perfect loop */
vec2 LT(){ return vec2(cos(TAU*u_phase), sin(TAU*u_phase)) * u_travel; }
vec2 SO(){ return vec2(hash11(u_seed*0.137 + 0.731)*61.7, hash11(u_seed*0.213 + 7.0)*47.3); }

/* ---------------- color ---------------- */

vec3 palette(float t){
  t = clamp(t, 0.0, 1.0);
  float x = t*3.0;
  vec3 c = mix(u_c1, u_c2, smoothstep(0.0,1.0,x));
  c = mix(c, u_c3, smoothstep(1.0,2.0,x));
  c = mix(c, u_c4, smoothstep(2.0,3.0,x));
  return c;
}
vec3 paletteCyc(float t){
  t = fract(t);
  float x = t*4.0;
  vec3 c = mix(u_c1, u_c2, smoothstep(0.0,1.0,x));
  c = mix(c, u_c3, smoothstep(1.0,2.0,x));
  c = mix(c, u_c4, smoothstep(2.0,3.0,x));
  c = mix(c, u_c1, smoothstep(3.0,4.0,x));
  return c;
}

vec3 hueRotate(vec3 c, float deg){
  float a = deg*PI/180.0;
  float cs = cos(a), sn = sin(a);
  mat3 m = mat3(
    0.299+0.701*cs+0.168*sn, 0.587-0.587*cs+0.330*sn, 0.114-0.114*cs-0.497*sn,
    0.299-0.299*cs-0.328*sn, 0.587+0.413*cs+0.035*sn, 0.114-0.114*cs+0.292*sn,
    0.299-0.300*cs+1.250*sn, 0.587-0.588*cs-1.050*sn, 0.114+0.886*cs-0.203*sn);
  return c*m;
}

/* ---------------- shared coords ---------------- */

vec2 toP(vec2 uv){
  float asp = u_res.x/u_res.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0) * (3.0/max(u_scale, 0.15));
  p.x *= mix(1.0, 0.38, clamp(u_stretch, 0.0, 1.0));
  p.y *= mix(1.0, 0.38, clamp(-u_stretch, 0.0, 1.0));
  return p;
}

/* =========================================================
   MODE 0 — LIQUID CHROME
   ========================================================= */

float chromeH(vec2 p, vec2 w){
  vec2 so = SO(), lt = LT();
  return fbm((p + w)*0.85 + so*0.5 + u_flow*0.6*lt);
}

vec3 sceneChrome(vec2 uv){
  vec2 p = toP(uv);
  p.x *= 0.48;
  vec2 so = SO(), lt = LT();

  /* slow warp field, computed once and reused for all height taps */
  vec2 w = u_warp*0.9*vec2(
    fbm(p*0.5 + so + lt) - 0.5,
    fbm(p*0.5 + so + 7.31 - lt) - 0.5) * 2.4;

  float e = 0.06;
  float h  = chromeH(p, w);
  float hx = chromeH(p + vec2(e,0.0), w);
  float hy = chromeH(p + vec2(0.0,e), w);
  float relief = 3.4 + u_warp*1.6;
  vec3 n = normalize(vec3(-(hx-h)/e*relief, -(hy-h)/e*relief, 1.0));

  float la = u_lightAngle*PI/180.0;
  vec3 L = normalize(vec3(cos(la), sin(la), 0.55));
  float diff = max(dot(n, L), 0.0);
  vec3 Hv = normalize(L + vec3(0.0,0.0,1.0));
  float spec  = pow(max(dot(n, Hv), 0.0), u_gloss);
  float spec2 = pow(max(dot(n, normalize(vec3(-L.xy, 0.9))), 0.0), u_gloss*0.45);
  float fres  = pow(1.0 - max(n.z, 0.0), 2.4);

  vec3 alb  = palette(clamp(h*1.1 + u_irid*n.x*0.7, 0.0, 1.0));
  vec3 alb2 = palette(clamp(0.55 - n.x*0.7 + h*0.25, 0.0, 1.0));

  /* dark metal base; nearly all color arrives via the lights */
  vec3 col = u_bg*(0.55 + 0.45*diff);
  col += alb * pow(diff, 2.4) * 0.30;
  col += alb * spec * u_light * 3.0;
  col += alb2 * spec2 * u_light * 1.35;
  col += palette(clamp(fres*0.85 + u_irid*n.y*0.4, 0.0, 1.0)) * fres * u_light * 0.55;
  col += vec3(1.0) * pow(spec, 3.0) * u_light * 0.5;
  return col;
}

/* =========================================================
   MODE 1 — SILK RIBBONS
   ========================================================= */

vec3 sceneSilk(vec2 uv){
  vec2 p = toP(uv);
  vec2 so = SO(), lt = LT();
  p = rot(-0.30 + 0.6*(hash11(u_seed*0.31+3.0)-0.5)) * p;

  /* one smooth guide curve: low-frequency two-octave noise */
  vec2 wq = p*vec2(0.42, 0.50) + so + lt*0.55;
  float wave = vnoise(wq)*0.70 + vnoise(wq*2.13 + 5.0)*0.30;

  float freq = u_lines*0.16;
  float tt = p.y*freq + (wave-0.5)*(4.5 + u_warp*3.5) + p.x*0.30;

  float ft = fract(tt)-0.5;          /* signed position across strand */
  float band = abs(ft)*2.0;
  float prof = sqrt(max(1.0-band*band, 0.0));

  /* true cylinder normal across the strand */
  vec3 n = normalize(vec3(0.35*(wave-0.5), ft*2.0, max(prof, 0.05)));

  float la = u_lightAngle*PI/180.0;
  vec3 L = normalize(vec3(cos(la), sin(la), 0.62));
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, normalize(L+vec3(0,0,1))), 0.0), u_gloss);

  float id = hash11(floor(tt)*7.77 + hash11(u_seed*0.171)*43.0);
  vec3 alb = paletteCyc(id*0.97 + wave*0.22 + u_irid*0.25*n.y);

  vec3 col = alb*(0.05 + 0.95*pow(diff, 1.7));
  col += alb * spec * u_light * 1.9;
  col += vec3(1.0) * pow(spec, 2.5) * u_light * 0.6;
  col *= 0.45 + 0.55*prof;           /* crevice shadow between strands */

  float env = smoothstep(1.8, 0.55, abs(p.y*0.7 + (wave-0.5)*3.4));
  return mix(u_bg, col, env);
}

/* =========================================================
   MODE 2 — SOFT BLOOM
   ========================================================= */

vec3 blobField(vec2 p, float warpAmt){
  vec2 so = SO();
  p += warpAmt*0.55*vec2(fbm(p*0.8+so)-0.5, fbm(p*0.8-so)-0.5)*2.0;
  vec3 col = u_bg;
  for (int i = 0; i < 5; i++){
    float fi = float(i);
    vec2 hc = hash22(vec2(fi*3.17, u_seed*0.731 + fi));
    vec2 base = (hc - 0.5)*vec2(2.2, 1.6);
    float orbR = 0.18 + 0.4*hash11(u_seed*0.117 + fi*9.1);
    float ph = u_phase + hash11(fi + u_seed*0.291);
    float dir = hash11(fi*5.0 + u_seed*0.49) > 0.5 ? 1.0 : -1.0;
    vec2 pos = base + orbR*u_travel*vec2(cos(TAU*ph*dir), sin(TAU*ph*dir));
    float rad = (0.45 + 0.6*hash11(fi*2.3 + u_seed*0.371 + 4.0)) * u_soft;
    float d = length(p - pos);
    float g = exp(-(d*d)/(rad*rad));
    /* spread blob hues across the whole palette so c1..c4 all show up */
    vec3 bc = palette(fract(fi*0.249 + hash11(fi + u_seed*0.523)*0.18));
    col = mix(col, bc, g*0.92);
  }
  return col;
}

vec3 sceneBloom(vec2 uv){
  return blobField(toP(uv), u_warp);
}

/* =========================================================
   MODE 3 — AURA RINGS
   ========================================================= */

vec3 sceneAura(vec2 uv){
  vec2 p = toP(uv);
  vec2 so = SO();
  vec2 c = (hash22(vec2(u_seed*0.37, 8.8)) - 0.5)*vec2(0.5, 0.6);
  vec2 d2 = p - c;
  float ang = atan(d2.y, d2.x);
  float d = length(d2);
  d += (0.06 + 0.08*u_warp)*fbm(vec2(ang*1.2, d*1.4) + so + LT()*0.5)
       * smoothstep(0.0, 0.3, d) - 0.05;   /* fade wobble near center */
  d += 0.045*u_travel*sin(TAU*u_phase);

  float t = pow(max(d*0.66, 0.0), mix(1.55, 0.8, clamp(u_soft*0.65, 0.0, 1.0)));

  /* gentle radial ramp: palette through the middle, bg at both poles */
  vec3 col = palette(smoothstep(0.04, 0.96, t));
  col = mix(col, u_bg, smoothstep(0.68, 1.18, t));
  col = mix(col, mix(u_bg, vec3(1.0), 0.5), smoothstep(0.26, 0.0, t)*0.45);
  /* one soft luminous ring accent */
  float ring = exp(-pow((t - 0.46)*4.6, 2.0));
  col = mix(col, col*1.18 + 0.06, ring*0.5);
  return col;
}

/* =========================================================
   MODE 4 — LIGHT RAYS
   ========================================================= */

vec3 sceneRays(vec2 uv){
  vec2 p = toP(uv);
  vec2 so = SO();
  vec2 O = vec2((hash11(u_seed+1.7)-0.5)*0.8, 1.9);
  vec2 dir = p - O;
  float ang = atan(dir.x, -dir.y);
  float r = length(dir);

  float beams = fbm(vec2(ang*(2.0 + u_lines*0.12), 0.0) + so + LT()*0.5);
  beams = pow(clamp(beams*1.25, 0.0, 1.0), 2.0 + u_warp*2.0);

  float fall = smoothstep(3.4, 0.7, r);
  float glowB = beams*fall;

  vec3 col = u_bg;
  vec3 beamCol = palette(clamp(0.85 - glowB*0.9, 0.0, 1.0));
  col = mix(col, beamCol, clamp(glowB*1.7, 0.0, 1.0));
  col = mix(col, palette(0.92), smoothstep(1.2, 3.2, r)*0.85);
  return col;
}

/* =========================================================
   MODE 5 — HALFTONE
   ========================================================= */

vec3 sceneHalftone(vec2 uv){
  float asp = u_res.x/u_res.y;
  vec2 so = SO(), lt = LT();
  vec2 guv = uv*vec2(asp,1.0)*u_cell*0.55;
  vec2 gp = floor(guv);
  vec2 gf = fract(guv)-0.5;
  vec2 cuv = (gp+0.5)/(u_cell*0.55)/vec2(asp,1.0);
  vec2 cp = toP(cuv);

  vec2 q = cp + u_warp*0.9*vec2(fbm(cp*0.7+so+lt)-0.5, fbm(cp*0.7-so-lt)-0.5)*2.0;
  float f = fbm(q + so);
  f = smoothstep(0.30, 0.80, f);     /* large breathing-room voids */

  float radius = sqrt(f)*0.62;
  float dotm = smoothstep(radius, radius-0.12, length(gf));
  float hueF = fbm(q*0.55 + so + 31.7);
  vec3 ink = palette(clamp(hueF*1.5 - 0.22, 0.0, 1.0));
  return mix(u_bg, ink, dotm*(0.30 + 0.70*f));
}

/* =========================================================
   MODE 6 — DATA GLYPHS
   ========================================================= */

const int GLYPHS[8] = int[8](31599, 11415, 29330, 31727, 1488, 448, 128, 9362);

vec3 sceneGlyphs(vec2 uv){
  float asp = u_res.x/u_res.y;
  vec2 so = SO(), lt = LT();
  vec2 guv = uv*vec2(asp,1.0)*vec2(u_cell*0.5, u_cell*0.5/1.55);
  vec2 gp = floor(guv);
  vec2 gf = fract(guv);
  vec2 cuv = (gp+0.5)/vec2(u_cell*0.5, u_cell*0.5/1.55)/vec2(asp,1.0);
  vec2 cp = toP(cuv);

  float b = fbm(cp*0.8 + so + lt);
  b = pow(clamp(b*1.65 - 0.30, 0.0, 1.0), 2.3);   /* deep dark voids */
  /* columnar shimmer, quantized so it still loops */
  float step8 = floor(u_phase*8.0);
  b *= 0.55 + 0.9*hash21(vec2(gp.x*1.31, step8));
  b += 0.018; /* faint base field so the grid breathes */

  float swap = hash21(gp + vec2(floor(u_phase*8.0)*13.0, u_seed));
  int gi = int(floor(swap*7.999));
  int glyph = GLYPHS[gi];

  vec2 cell = gf;
  cell = (cell - 0.5)/0.74 + 0.5;  /* padding */
  vec3 col = u_bg;
  if (cell.x > 0.0 && cell.x < 1.0 && cell.y > 0.0 && cell.y < 1.0){
    int px = int(floor(cell.x*3.0));
    int py = int(floor((1.0-cell.y)*5.0));
    int bit = (glyph >> ((4-py)*3 + (2-px))) & 1;
    vec3 ink = palette(clamp(b*1.3, 0.0, 1.0));
    col += ink * float(bit) * b * 2.2;
  }
  return col;
}

/* =========================================================
   MODE 7 — REEDED GLASS
   ========================================================= */

/* bold smooth color regions for the glass to refract:
   a seeded diagonal palette sweep + noise, grounded by bg in the lows */
vec3 boldField(vec2 p){
  vec2 so = SO();
  float f1 = fbm(p*0.40 + so + LT()*0.7);
  float ang = TAU*hash11(u_seed*0.071 + 2.0);
  float diag = 0.5 + 0.30*(cos(ang)*p.x + sin(ang)*p.y);
  vec3 col = palette(clamp(diag + (f1-0.5)*1.5, 0.0, 1.0));
  col = mix(col, u_bg, smoothstep(0.60, 0.18, f1)*0.85);
  return col;
}

vec3 sceneReeded(vec2 uv){
  float nx = uv.x * u_lines*0.55;
  float ci = floor(nx);
  float lx = fract(nx)-0.5;

  float srcX = (ci + 0.5 + lx*0.20 + sin(lx*PI)*0.34*u_warp) / (u_lines*0.55);
  vec2 suv = vec2(srcX, uv.y);
  vec3 col = boldField(toP(suv)*0.8);

  float shade = 0.86 + 0.26*cos(lx*PI);
  float edge = smoothstep(0.5, 0.465, abs(lx));
  col *= mix(0.62, shade, edge);
  col += vec3(1.0)*pow(max(cos(lx*PI), 0.0), 30.0)*0.12*u_light;
  return col;
}

/* =========================================================
   MODE 8 — PIXEL BLOOM
   ========================================================= */

vec3 sceneMosaic(vec2 uv){
  float asp = u_res.x/u_res.y;
  float cells = max(u_cell*0.22, 3.0);
  vec2 g = vec2(cells*asp, cells);
  vec2 q = (floor(uv*g)+0.5)/g;
  vec3 col = blobField(toP(q), u_warp*0.5);
  float h = hash21(floor(uv*g)+u_seed);
  col *= 0.97 + 0.05*h;
  return col;
}

/* ---------------- dispatch + post ---------------- */

vec3 sceneFor(int m, vec2 uv){
  if (m == 0) return sceneChrome(uv);
  if (m == 1) return sceneSilk(uv);
  if (m == 2) return sceneBloom(uv);
  if (m == 3) return sceneAura(uv);
  if (m == 4) return sceneRays(uv);
  if (m == 5) return sceneHalftone(uv);
  if (m == 6) return sceneGlyphs(uv);
  if (m == 7) return sceneReeded(uv);
  return sceneMosaic(uv);
}

vec3 scene(vec2 uv){
  vec3 a = sceneFor(u_mode, uv);
  if (u_synth == 0) return a;

  vec3 b = sceneFor(u_modeB, uv);
  float asp = u_res.x/u_res.y;
  vec2 c = (uv - 0.5)*vec2(asp, 1.0);

  if (u_mixOp == 1) {                       /* screen: layered light */
    return mix(a, 1.0 - (1.0 - a)*(1.0 - b), u_blend);
  }
  if (u_mixOp == 2) {                       /* multiply with lift */
    return mix(a, a*b*1.6 + a*0.12, u_blend);
  }
  if (u_mixOp == 3) {                       /* radial: B grows from center */
    float m = smoothstep(0.15, 0.85, length(c)*1.15);
    return mix(b, a, mix(1.0, m, u_blend));
  }
  if (u_mixOp == 4) {                       /* soft diagonal split */
    float ang = TAU*hash11(u_seed*0.091 + 5.0);
    float m = smoothstep(-0.45, 0.45, cos(ang)*c.x + sin(ang)*c.y);
    return mix(a, b, m*u_blend);
  }
  /* default: organic noise mask */
  float m = fbm(c*1.6 + SO()*0.7 + LT()*0.5);
  m = smoothstep(0.32, 0.68, m);
  return mix(a, b, m*u_blend);
}

void main(){
  vec2 uv = gl_FragCoord.xy/u_res;
  vec3 col;

  /* CA re-renders the scene per channel; with synth blending that would
     inline the full mode dispatch 6 times and break the D3D linker, so
     aberration only applies to single-mode renders */
  if (u_ca > 0.004 && u_synth == 0){
    vec2 off = (uv-0.5)*u_ca*0.016;
    col = vec3(scene(uv-off).r, scene(uv).g, scene(uv+off).b);
  } else {
    col = scene(uv);
  }

  /* glow: soft luminance knee */
  float lum = dot(col, vec3(0.299,0.587,0.114));
  col += u_glow * col * lum * 0.85;

  /* grade */
  if (abs(u_hue) > 0.5) col = hueRotate(col, u_hue);
  float l2 = dot(col, vec3(0.299,0.587,0.114));
  col = mix(vec3(l2), col, u_sat);
  col *= u_exposure;
  col = (col - 0.5)*u_contrast + 0.5;

  /* vignette */
  float asp = u_res.x/u_res.y;
  vec2 vc = (uv-0.5)*vec2(asp,1.0);
  col *= 1.0 - u_vig*smoothstep(0.35, 1.05, length(vc));

  /* film grain — quantized steps keep the loop perfect */
  float gstep = floor(u_phase*24.0);
  float gr = hash21(gl_FragCoord.xy*0.71 + vec2(gstep*3.1, gstep*7.7));
  col += (gr-0.5)*u_grain*0.55;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
