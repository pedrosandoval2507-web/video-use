// Variation 3, inspired by @tarik_lopes: full-frame speaker with hard punch-in zooms, dark news-style
// cards up top (photo + kicker + headline), numbers that count up, bar charts that grow, a lower
// third, and short full-screen moments. Every element pops in (the "plim" SFX is added in Tella).
// Usage: node build-v3-tarik.mjs <episode dir>   (reads <ep>/v3.json, writes <ep>/final_v3/)
//   v3.json: { "punch": [[t, scale], ...],
//              "items": [ { "t": 0, "d": 3, "type": "news", "img": "mj_bulls", "kicker": "1984", "title": "..." },
//                         { "type": "stat", "value": 126, "prefix": "US$ ", "suffix": " mi", "label": "..." },
//                         { "type": "bars", "bars": [["meta", 3, "US$ 3 mi"], ["real", 126, "US$ 126 mi"]], "title": "..." },
//                         { "type": "full", "img": "aj1_nike", "big": "US$ 126 mi", "small": "no 1º ano" },
//                         { "type": "lower", "title": "Michael Jordan", "sub": "21 anos" },
//                         { "type": "profile" } ] }
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const EP = resolve(process.argv[2]);
const PHOTOS = join(HERE, "../assets/photos");
const cfg = JSON.parse(readFileSync(join(EP, "v3.json"), "utf8"));
const W = 1080, H = 1920;
const END = +readFileSync(join(EP, "build-layers.mjs"), "utf8").match(/DUR = ([0-9.]+)/)[1];

const out = join(EP, "final_v3");
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "photos"), { recursive: true });
mkdirSync(join(out, "compositions"), { recursive: true });
for (const it of cfg.items) if (it.img) copyFileSync(join(PHOTOS, `${it.img}.jpg`), join(out, "photos", `${it.img}.jpg`));
if (cfg.items.some((i) => i.type === "profile")) copyFileSync(join(PHOTOS, "perfil_header.jpg"), join(out, "photos", "perfil_header.jpg"));

const esc = (t = "") => t.replace(/&(?![a-z]+;)/g, "&amp;");
let body = "", anim = "";
const pop = (sel, t) => `tl.fromTo("${sel}", { opacity: 0, scale: 0.6, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: "back.out(2.2)" }, ${t.toFixed(3)});`;
const out_ = (sel, t) => `tl.to("${sel}", { opacity: 0, scale: 0.92, duration: 0.18, ease: "power2.in" }, ${t.toFixed(3)});`;
const counter = (id, v, t, prefix = "", suffix = "", dur = 1.0) =>
  `{ const o = { v: 0 }; tl.to(o, { v: ${v}, duration: ${dur}, ease: "power2.out", onUpdate: () => { document.getElementById("${id}").textContent = "${prefix}" + Math.round(o.v).toLocaleString("pt-BR") + "${suffix}"; } }, ${t.toFixed(3)}); }`;

cfg.items.forEach((it, i) => {
  const id = `i${i}`, t = it.t, d = it.d, end = t + d;
  let html = "";
  if (it.type === "news") {
    html = `<div class="news" id="${id}">${it.img ? `<div class="nimg"><img src="photos/${it.img}.jpg" style="object-position:${it.pos || "50% 35%"}" /></div>` : ""}
      <div class="ntxt"><div class="nk">${esc(it.kicker)}</div><div class="nt">${esc(it.title)}</div></div></div>`;
    anim += pop(`#${id}`, t) + "\n";
    if (it.img) anim += `      tl.fromTo("#${id} img", { scale: 1.25 }, { scale: 1.0, duration: ${d}, ease: "none" }, ${t.toFixed(3)});\n`;
  } else if (it.type === "stat") {
    html = `<div class="stat" id="${id}"><div class="sv" id="${id}v">${esc(it.prefix || "")}0${esc(it.suffix || "")}</div><div class="sl">${esc(it.label)}</div>${it.src ? `<div class="ss">${esc(it.src)}</div>` : ""}</div>`;
    anim += pop(`#${id}`, t) + "\n      " + counter(`${id}v`, it.value, t + 0.15, it.prefix || "", it.suffix || "", it.count || 1.0) + "\n";
  } else if (it.type === "bars") {
    const max = Math.max(...it.bars.map((b) => b[1]));
    html = `<div class="bars" id="${id}"><div class="bt">${esc(it.title)}</div><div class="bw">${it.bars.map((b, k) => `
      <div class="bc"><div class="bl">${esc(b[0])}</div><div class="bb"><i id="${id}b${k}" class="${k === it.bars.length - 1 ? "hot" : ""}"></i></div><div class="bv" id="${id}v${k}">${esc(b[2])}</div></div>`).join("")}</div>${it.src ? `<div class="ss">${esc(it.src)}</div>` : ""}</div>`;
    anim += pop(`#${id}`, t) + "\n";
    it.bars.forEach((b, k) => {
      const at = t + 0.3 + (it.stagger ?? 0.9) * k;
      anim += `      tl.fromTo("#${id}b${k}", { width: "0%" }, { width: "${Math.max(2, (b[1] / max) * 100).toFixed(1)}%", duration: 0.8, ease: "power3.out" }, ${at.toFixed(3)});\n`;
      anim += `      tl.fromTo("#${id}v${k}", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25 }, ${(at + 0.5).toFixed(3)});\n`;
    });
  } else if (it.type === "full") {
    html = `<div class="full" id="${id}">${it.img ? `<img class="fbg" src="photos/${it.img}.jpg" style="object-position:${it.pos || "50% 40%"}" />` : ""}<div class="fdim"></div>
      <div class="fbig" id="${id}b">${esc(it.big)}</div><div class="fsm">${esc(it.small)}</div></div>`;
    anim += `      tl.fromTo("#${id}", { opacity: 0 }, { opacity: 1, duration: 0.12 }, ${t.toFixed(3)});\n`;
    if (it.img) anim += `      tl.fromTo("#${id} .fbg", { scale: 1.2 }, { scale: 1.02, duration: ${d}, ease: "none" }, ${t.toFixed(3)});\n`;
    anim += `      tl.fromTo("#${id}b", { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.8)" }, ${(t + 0.08).toFixed(3)});\n`;
  } else if (it.type === "lower") {
    html = `<div class="lower" id="${id}"><div class="lt">${esc(it.title)}</div><div class="ls">${esc(it.sub)}</div></div>`;
    anim += `      tl.fromTo("#${id}", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, ${t.toFixed(3)});\n`;
  } else if (it.type === "profile") {
    html = `<div class="prof" id="${id}"><img src="photos/perfil_header.jpg" /><div class="pf">me segue 👆</div></div>`;
    anim += pop(`#${id}`, t) + "\n";
  }
  if (it.type !== "full") anim += "      " + out_(`#${id}`, end - 0.18) + "\n";
  body += `      <div class="clip layer-i" data-start="${t.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="${2 + (i % 3)}">${html}</div>\n`;
});

// Hard punch-ins: each [t, scale] holds until the next one.
const punches = (cfg.punch || []).map((p) => `tl.set("#cam", { scale: ${p[1]} }, ${(+p[0]).toFixed(3)});`).join("\n      ");

const capsHtml = readFileSync(join(EP, "captions/index.html"), "utf8")
  .replace("color: rgba(196, 228, 255, 0.92);", "color: #fff; -webkit-text-stroke: 3px #000; paint-order: stroke fill;")
  .replace("color: #ff3b30; font-weight: 900; font-size: 80px; margin: 0 4px;", "color: #ff3b30; font-weight: 900; font-size: 80px; margin: 0 4px; -webkit-text-stroke: 3px #fff; paint-order: stroke fill;");
writeFileSync(join(out, "compositions/captions.html"), capsHtml);

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: Inter, sans-serif; color: #fff; }
      #cam { position: absolute; inset: 0; transform-origin: 50% 35%; }
      #cam video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .layer-i { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
      .news { position: absolute; left: 60px; right: 60px; top: 250px; background: rgba(14,14,16,0.94); border-radius: 26px; display: flex; gap: 22px;
        padding: 18px; align-items: center; box-shadow: 0 20px 50px rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.08); }
      .nimg { width: 210px; height: 210px; border-radius: 18px; overflow: hidden; flex-shrink: 0; background: #222; }
      .nimg img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .ntxt { flex: 1; padding-right: 10px; }
      .nk { font-weight: 900; font-size: 24px; letter-spacing: 0.18em; color: #ff3b30; text-transform: uppercase; margin-bottom: 8px; }
      .nt { font-weight: 800; font-size: 46px; line-height: 1.1; letter-spacing: -0.02em; }
      .stat { position: absolute; left: 0; right: 0; top: 250px; text-align: center; }
      .sv { display: inline-block; font-weight: 900; font-size: 150px; letter-spacing: -0.05em; line-height: 1; padding: 14px 36px 22px; background: rgba(14,14,16,0.94);
        border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.45); }
      .sl { display: inline-block; margin-top: 14px; font-weight: 800; font-size: 40px; background: #ff3b30; padding: 6px 20px 10px; border-radius: 12px; }
      .ss, .bars .ss { margin-top: 10px; font-size: 22px; font-weight: 600; color: rgba(255,255,255,0.75); }
      .stat .ss { color: #141414; text-shadow: 0 1px 0 rgba(255,255,255,0.6); }
      .bars { position: absolute; left: 60px; right: 60px; top: 240px; background: rgba(14,14,16,0.94); border-radius: 28px; padding: 26px 34px 22px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.45); }
      .bt { font-weight: 900; font-size: 30px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.8); margin-bottom: 14px; }
      .bw { display: flex; flex-direction: column; gap: 16px; }
      .bc { display: flex; align-items: center; gap: 18px; }
      .bv { width: 250px; text-align: right; font-weight: 900; font-size: 44px; white-space: nowrap; letter-spacing: -0.02em; }
      .bb { flex: 1; height: 44px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
      .bb i { display: block; height: 100%; width: 0%; background: #fff; border-radius: 10px; }
      .bb i.hot { background: #ff3b30; }
      .bl { width: 210px; font-weight: 800; font-size: 30px; line-height: 1.05; color: rgba(255,255,255,0.85); }
      .full { position: absolute; inset: 0; background: #0b0b0c; z-index: 6; overflow: hidden; text-align: center; }
      .fbg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .fdim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.8) 100%); }
      .fbig { position: absolute; left: 40px; right: 40px; bottom: 1015px; font-weight: 900; font-size: 140px; letter-spacing: -0.05em; line-height: 1; }
      .fsm { position: absolute; left: 40px; right: 40px; top: 930px; font-weight: 800; font-size: 46px; color: #ff3b30; text-shadow: 0 2px 14px rgba(0,0,0,0.9); }
      .lower { position: absolute; left: 60px; top: 1400px; background: #fff; color: #141414; border-radius: 16px; padding: 12px 24px 14px; border-left: 10px solid #ff3b30;
        box-shadow: 0 12px 30px rgba(0,0,0,0.3); }
      .lt { font-weight: 900; font-size: 40px; letter-spacing: -0.02em; }
      .ls { font-weight: 700; font-size: 26px; color: #6b6b6b; }
      .prof { position: absolute; left: 240px; top: 1080px; width: 600px; background: #fff; border-radius: 28px; padding: 10px 10px 14px; text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
      .prof img { width: 100%; display: block; border-radius: 20px; }
      .pf { margin-top: 8px; font-weight: 900; font-size: 34px; color: #141414; }
      #l_captions { position: absolute; left: 0; top: 1075px; width: ${W}px; height: 440px; z-index: 8; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="v3" data-start="0" data-duration="${END}" data-width="${W}" data-height="${H}">
      <div id="cam"><video id="v3-video" class="clip" data-start="0" data-duration="${END}" data-track-index="0" src="source.mp4" muted playsinline></video></div>
${body}      <div id="l_captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-track-kind="captions" data-start="0" data-duration="${cfg.capEnd ?? END}" data-track-index="9"></div>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.set("#cam", { scale: 1 }, 0);
      ${punches}
${anim}      tl.set({}, {}, ${END});
      window.__timelines = window.__timelines || {};
      window.__timelines["v3"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
writeFileSync(join(out, "index.html"), html);
const gsap = join(HERE, "../graphics/intro/gsap.min.js");
copyFileSync(gsap, join(out, "gsap.min.js"));
copyFileSync(gsap, join(out, "compositions/gsap.min.js"));
symlinkSync(join(EP, "source.mp4"), join(out, "source.mp4"));
console.log(`final_v3: ${cfg.items.length} items, ${(cfg.punch || []).length} punches, ${END}s`);
