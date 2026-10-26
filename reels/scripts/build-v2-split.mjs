// Variation 2: split screen. Photos fill the top half (each one at most 3 s, slow zoom in/out,
// a punch on every cut, a small label chip), the speaker fills the bottom half, the approved
// captions sit on the seam. Some shots take the whole screen for a moment.
// Usage: node build-v2-split.mjs <episode dir>   (reads <ep>/v2.json, writes <ep>/final_v2/)
//   v2.json: { "videoTop": -180, "shots": [ { "t": 0, "img": "mj_bulls", "label": "1984",
//              "full": false, "zoom": "in" | "out", "pos": "50% 30%" } | { "t": 8.4, "text": "a <i>mãe</i> dele" } ] }
//   "img" is a file in reels/assets/photos (no extension) or "perfil:<crop>" for the profile print.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, symlinkSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const EP = resolve(process.argv[2]);
const PHOTOS = join(HERE, "../assets/photos");
const cfg = JSON.parse(readFileSync(join(EP, "v2.json"), "utf8"));
const W = 1080, H = 1920, TOP_H = 960;
const words = readFileSync(join(EP, "words.tsv"), "utf8").trim().split("\n");
const DUR = +(+words[words.length - 1].split("\t")[1] / 1000 + 0.3).toFixed(3);
const total = +readFileSync(join(EP, "build-layers.mjs"), "utf8").match(/DUR = ([0-9.]+)/)[1];
const END = total;   // the cut length (build-layers DUR); words end before it

const out = join(EP, "final_v2");
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "photos"), { recursive: true });
mkdirSync(join(out, "compositions/fonts"), { recursive: true });
mkdirSync(join(out, "fonts"), { recursive: true });

const shots = cfg.shots.map((s, i) => ({ ...s, end: i + 1 < cfg.shots.length ? cfg.shots[i + 1].t : END }));
for (const s of shots) {
  if (s.end - s.t > 3.0 + 1e-6) throw new Error(`shot at ${s.t}s lasts ${(s.end - s.t).toFixed(2)}s (max 3 s)`);
}
const used = new Set(shots.filter((s) => s.img).map((s) => s.img));
for (const name of used) copyFileSync(join(PHOTOS, `${name}.jpg`), join(out, "photos", `${name}.jpg`));

const esc = (t) => t.replace(/&(?![a-z]+;)/g, "&amp;");
let body = "", anim = "";
shots.forEach((s, i) => {
  const d = (s.end - s.t).toFixed(3), id = `s${i}`;
  const box = s.full ? `top:0;height:${H}px` : `top:0;height:${TOP_H}px`;
  const inner = s.img
    ? `<img src="photos/${s.img}.jpg" style="object-position:${s.pos || "50% 40%"}" />`
    : `<div class="tcard"><div class="ttext">${esc(s.text)}</div></div>`;
  const chip = s.label ? `<div class="chip" style="bottom:${s.full ? 520 : 40}px">${esc(s.label)}</div>` : "";
  body += `      <div class="shot clip${s.full ? " full" : ""}" id="${id}" style="${box}" data-start="${s.t.toFixed(3)}" data-duration="${d}" data-track-index="${2 + (i % 2)}"><div class="kb" id="${id}k">${inner}</div>${chip}</div>\n`;
  const zin = (s.zoom || (i % 2 ? "out" : "in")) === "in";
  const [a, b] = zin ? [1.0, 1.14] : [1.16, 1.02];
  const dx = (i % 3 - 1) * 18;
  anim += `      tl.fromTo("#${id}k", { scale: ${a}, x: ${-dx} }, { scale: ${b}, x: ${dx}, duration: ${d}, ease: "none" }, ${s.t.toFixed(3)});\n`;
  anim += `      tl.fromTo("#${id}", { scale: 1.06 }, { scale: 1, duration: 0.18, ease: "power2.out" }, ${s.t.toFixed(3)});\n`;
  if (s.label) anim += `      tl.fromTo("#${id} .chip", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" }, ${(s.t + 0.12).toFixed(3)});\n`;
  if (s.text) anim += `      tl.fromTo("#${id} .ttext", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, ${(s.t + 0.05).toFixed(3)});\n`;
});

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="gsap.min.js"></script>
    <style>
      @font-face { font-family: "Instrument Serif"; font-style: italic; src: url("fonts/InstrumentSerif-Italic.woff2") format("woff2"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: Inter, sans-serif; }
      #cam { position: absolute; left: 0; top: ${TOP_H}px; width: ${W}px; height: ${H - TOP_H}px; overflow: hidden; }
      #cam video { position: absolute; left: 0; top: ${cfg.videoTop ?? -180}px; width: ${W}px; height: ${H}px; object-fit: cover; }
      .shot { position: absolute; left: 0; width: ${W}px; overflow: hidden; background: #111; }
      .shot.full { z-index: 5; }
      .kb { position: absolute; inset: 0; }
      .kb img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .tcard { position: absolute; inset: 0; background: #f4f4f2; display: flex; align-items: center; justify-content: center; padding: 0 90px; }
      .shot.full .tcard { align-items: flex-start; padding-top: 470px; }
      .ttext { font-weight: 800; font-size: 92px; line-height: 1.08; letter-spacing: -0.02em; color: #141414; text-align: center; }
      .ttext i { font-family: "Instrument Serif", serif; font-weight: 400; font-size: 1.3em; letter-spacing: 0; }
      .ttext b { color: #fff; background: #ff3b30; padding: 0 18px 6px; border-radius: 12px; }
      .chip { position: absolute; left: 40px; background: #141414; color: #fff; font-weight: 800; font-size: 38px; padding: 10px 22px; border-radius: 14px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.35); letter-spacing: -0.01em; }
      .seam { position: absolute; left: 0; right: 0; top: ${TOP_H - 3}px; height: 6px; background: #000; z-index: 4; }
      #l_captions { position: absolute; left: 0; top: ${TOP_H - 220}px; width: ${W}px; height: 440px; z-index: 10; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="v2" data-start="0" data-duration="${END}" data-width="${W}" data-height="${H}">
      <div id="cam"><video id="v2-video" class="clip" data-start="0" data-duration="${END}" data-track-index="0" src="source.mp4" muted playsinline></video></div>
      <div class="seam"></div>
${body}      <div id="l_captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-track-kind="captions" data-start="0" data-duration="${END}" data-track-index="9"></div>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${anim}      tl.set({}, {}, ${END});
      window.__timelines = window.__timelines || {};
      window.__timelines["v2"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
writeFileSync(join(out, "index.html"), html);
const gsap = join(HERE, "../graphics/intro/gsap.min.js");
copyFileSync(gsap, join(out, "gsap.min.js"));
copyFileSync(gsap, join(out, "compositions/gsap.min.js"));
// Captions sit on the seam over photos and the wall, so they turn white with a dark outline here.
writeFileSync(join(out, "compositions/captions.html"), readFileSync(join(EP, "captions/index.html"), "utf8")
  .replace("color: rgba(196, 228, 255, 0.92);", "color: #fff; -webkit-text-stroke: 3px #000; paint-order: stroke fill;")
  .replace("color: #ff3b30; font-weight: 900; font-size: 80px; margin: 0 4px;", "color: #ff3b30; font-weight: 900; font-size: 80px; margin: 0 4px; -webkit-text-stroke: 3px #fff; paint-order: stroke fill;"));
for (const d of ["fonts", "compositions/fonts"]) copyFileSync(join(EP, "fonts/InstrumentSerif-Italic.woff2"), join(out, d, "InstrumentSerif-Italic.woff2"));
if (!existsSync(join(out, "source.mp4"))) symlinkSync(join(EP, "source.mp4"), join(out, "source.mp4"));
console.log(`final_v2: ${shots.length} shots, ${END}s`);
