// Builds graphics/index.html: one transparent 1080x1920 HyperFrames composition with every
// kinetic title, minimalist icon tile and data card of the reel (style: reels/EDITING-STYLE.md,
// "Typography and minimalist graphics"). The person cut-out is layered on top of this later.
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1920, DUR = 55.966;

// ---- minimalist line icons (viewBox 0 0 100 100) ----
const S = `fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;
const ICON = {
  dumbbell: `<path ${S} d="M28 50H72"/><rect ${S} x="14" y="32" width="14" height="36" rx="4"/><rect ${S} x="72" y="32" width="14" height="36" rx="4"/><path ${S} d="M8 42v16M92 42v16"/>`,
  cap: `<path ${S} d="M8 40 50 22 92 40 50 58Z"/><path ${S} d="M27 49v16c14 10 32 10 46 0V49"/><path ${S} d="M92 40v20"/>`,
  bulb: `<path ${S} d="M50 12a26 26 0 0 1 16 46c-3 3-4 6-4 10H38c0-4-1-7-4-10a26 26 0 0 1 16-46Z"/><path ${S} d="M39 80h22M43 90h14"/>`,
  target: `<circle ${S} cx="46" cy="54" r="34"/><circle ${S} cx="46" cy="54" r="19"/><circle cx="46" cy="54" r="6" fill="currentColor"/><path ${S} d="M46 54 84 16M72 16h12v12"/>`,
  globe: `<circle ${S} cx="50" cy="50" r="37"/><ellipse ${S} cx="50" cy="50" rx="15" ry="37"/><path ${S} d="M13 50h74M20 31h60M20 69h60"/>`,
  briefcase: `<rect ${S} x="12" y="32" width="76" height="52" rx="9"/><path ${S} d="M37 32v-9h26v9M12 54h76"/>`,
  chart: `<path ${S} d="M12 84h78"/><path ${S} d="M16 70 38 48l16 12 32-34"/><path ${S} d="M70 26h16v16"/>`,
  people: `<circle ${S} cx="36" cy="34" r="12"/><path ${S} d="M14 82c0-16 10-26 22-26s22 10 22 26"/><circle ${S} cx="68" cy="38" r="10"/><path ${S} d="M60 58c3-1 5-2 8-2 11 0 19 9 19 23"/>`,
  check: `<path fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" d="M28 52l15 15 30-32"/>`,
  cross: `<path fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" d="M33 33l34 34M67 33 33 67"/>`,
};
const svg = (name, size, color = "#141414") =>
  `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="color:${color}">${ICON[name]}</svg>`;
const person = (cls = "") =>
  `<svg class="pp ${cls}" viewBox="0 0 60 90" width="84" height="126"><circle cx="30" cy="20" r="14" fill="currentColor"/><path d="M6 86c0-26 10-40 24-40s24 14 24 40Z" fill="currentColor"/></svg>`;
const glass = `<svg class="gl" viewBox="0 0 40 50" width="34" height="42"><path d="M6 6h28l-4 38H10Z" fill="#f5b100" stroke="#141414" stroke-width="3.5" stroke-linejoin="round"/><path d="M6 6h28v7H6Z" fill="#fff" stroke="#141414" stroke-width="3.5" stroke-linejoin="round"/></svg>`;

// ---- groups: [id, start, dur, html, gsap entrance (relative to start)] ----
// Positions follow the head in each shot: wide shots (head top ~28-35%) take titles at 13-26%;
// close-ups (20.5-25.7, 38.2-end, head top ~15-18%) put tiles beside the head.
const tile = (id, icon, num, label, x, y, size = 150) => `
  <div class="tile" id="${id}" style="left:${x}px;top:${y}px">
    <div class="tbox" style="width:${size + 56}px;height:${size + 56}px">${svg(icon, size)}</div>
    <div class="tlab"><span class="num">${num}</span>${label}</div>
  </div>`;
const pop = (sel, t) => `tl.fromTo("${sel}", { opacity: 0, scale: 0.4, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "back.out(2.2)" }, ${t});`;
const rise = (sel, t, d = 0.35) => `tl.fromTo("${sel}", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: ${d}, ease: "power3.out" }, ${t});`;

const G = [
  // Hook: "você é a média" (sans + italic serif), then five people pop in on "cinco pessoas".
  ["hook", 0.0, 2.6, `
    <div class="row small" id="ppl" style="top:236px">${[0, 1, 2, 3, 4].map((i) => `<div id="hp${i}">${person()}</div>`).join("")}</div>
    <div class="title" style="top:340px"><span id="h1">você</span> <span id="h2">é a</span> <span class="serif big" id="h3">média</span></div>`,
    [rise("#h1", 0.03, 0.25), rise("#h2", 0.27, 0.25),
     `tl.fromTo("#h3", { opacity: 0, scale: 1.6, rotate: -6 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.45, ease: "back.out(2)" }, 0.5);`,
     ...[0, 1, 2, 3, 4].map((i) => pop(`#hp${i}`, (0.97 + i * 0.12).toFixed(2))),
     `tl.to("#ppl", { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, 2.2);`]],

  // Context: gym -> university -> 2 months (icon row that builds up).
  ["ctx", 2.9, 4.4, `
    ${tile("t_gym", "dumbbell", "01", "academia", 200, 250)}
    ${tile("t_uni", "cap", "02", "faculdade", 640, 250)}
    <div class="pill" id="months" style="left:420px;top:560px">há <span class="serif">2 meses</span></div>`,
    [pop("#t_gym", 0.2), pop("#t_uni", 2.3), pop("#months", 3.45)]],

  // The quote.
  ["quote", 7.4, 2.95, `
    <div class="card" id="qcard" style="left:90px;top:240px;width:900px">
      <div class="kicker">A FRASE</div>
      <div class="qt">“Você é a <span class="serif">média</span> das <span class="mark">5 pessoas</span> com quem mais convive.”</div>
      <div class="by">— Jim Rohn</div>
    </div>`,
    [rise("#qcard", 0, 0.4)]],

  // "simplesmente impossível" with a red marker.
  ["impossivel", 10.45, 3.95, `
    <div class="title" style="top:260px"><span id="i1">simplesmente</span></div>
    <div class="title" style="top:360px"><span class="markbig" id="i2">impossível</span></div>`,
    [rise("#i1", 0.0, 0.3),
     `tl.fromTo("#i2", { opacity: 0, scale: 0.5, rotate: -8 }, { opacity: 1, scale: 1, rotate: -3, duration: 0.4, ease: "back.out(2.4)" }, 0.5);`]],

  // "eu concordo" + check.
  ["concordo", 14.6, 1.6, `
    <div class="title" style="top:270px"><span id="c1">eu</span> <span class="serif big" id="c2">concordo</span> <span class="okdot" id="c3">${svg("check", 64)}</span></div>`,
    [rise("#c1", 0.0, 0.25), rise("#c2", 0.12, 0.3), pop("#c3", 0.6)]],

  // Real data card.
  ["stat57", 16.95, 3.5, `
    <div class="card" id="scard" style="left:90px;top:235px;width:900px">
      <div class="srow"><div class="bignum" id="n57">0%</div>
      <div class="stxt">mais chance de <span class="serif">engordar</span> se um amigo próximo engordar</div></div>
      <div class="src">Christakis &amp; Fowler · New England Journal of Medicine, 2007</div>
    </div>`,
    [rise("#scard", 0, 0.4),
     `const n57 = { v: 0 }; tl.to(n57, { v: 57, duration: 1.1, ease: "power2.out", onUpdate: () => { document.getElementById("n57").textContent = Math.round(n57.v) + "%"; } }, 0.2);`]],

  // Close-up: what shapes you (tiles beside the head).
  ["molda", 20.9, 4.8, `
    <div class="kicker solo" id="mk" style="top:236px">O QUE TE MOLDA</div>
    ${tile("t_pens", "bulb", "01", "como pensam", 130, 290, 110)}
    ${tile("t_obj", "target", "02", "objetivos", 438, 290, 110)}
    ${tile("t_mun", "globe", "03", "o mundo", 746, 290, 110)}`,
    [rise("#mk", 0.0, 0.3), pop("#t_pens", 0.15), pop("#t_obj", 0.75), pop("#t_mun", 3.85)]],

  // Five alcoholics -> you are the sixth.
  ["sixth", 26.35, 2.75, `
    <div class="title t2" style="top:228px"><span id="s1">5</span> <span class="serif big" id="s2">alcoólatras</span></div>
    <div class="row small" id="srow" style="top:352px">
      ${[0, 1, 2, 3, 4].map((i) => `<div class="pw" id="sp${i}">${person()}${glass}</div>`).join("")}
      <div class="pw you" id="spy">${person("red")}<div class="youtag">VOCÊ</div></div>
    </div>`,
    [rise("#s1", 0.45, 0.25), rise("#s2", 0.8, 0.3),
     ...[0, 1, 2, 3, 4].map((i) => pop(`#sp${i}`, (0.8 + i * 0.1).toFixed(2))),
     pop("#spy", 2.3)]],

  // Negative vs positive (strikethrough on the negative side).
  ["negpos", 32.85, 5.25, `
    <div class="line" id="l1" style="top:230px"><span class="dot neg">${svg("cross", 54)}</span><span class="what"><span class="strike" id="st">bar e bebida</span></span><span class="tag">negativa</span></div>
    <div class="line" id="l2" style="top:330px"><span class="dot pos">${svg("check", 54)}</span><span class="what">negócios e <span class="serif">crescer</span></span><span class="tag">positiva</span></div>`,
    [rise("#l1", 2.1, 0.35), `tl.fromTo("#st", { "--s": 0 }, { "--s": 1, duration: 0.35, ease: "power2.out" }, 2.6);`, rise("#l2", 3.9, 0.35)]],

  // Close-up: business + growth tiles beside the head.
  ["negocios", 40.2, 2.4, `
    ${tile("t_neg", "briefcase", "01", "negócios", 20, 470, 120)}
    ${tile("t_cre", "chart", "02", "crescer", 820, 470, 120)}`,
    [pop("#t_neg", 0.1), pop("#t_cre", 1.1)]],

  // Close-up: "cresça junto" + friends icon.
  ["junto", 45.55, 3.5, `
    ${tile("t_ami", "people", "", "amigos", 20, 470, 120)}
    <div class="side" id="jt" style="left:790px;top:470px"><div class="sans">cresça</div><div class="serif huge">junto</div></div>`,
    [rise("#jt", 0.05, 0.35), pop("#t_ami", 1.95)]],

  // CTA between chin and captions.
  ["cta", 50.1, 5.866, `
    <div class="ctabox" id="cta" style="top:935px">
      <div class="ctaq">quem são as <span class="serif">suas</span> <span class="markbig small">5</span>?</div>
      <div class="ctasub">comenta aqui 👇</div>
    </div>`,
    [rise("#cta", 0.05, 0.4)]],
];

const CSS = `
@font-face { font-family: "Instrument Serif"; font-style: italic; src: url("fonts/InstrumentSerif-Italic.woff2") format("woff2"); }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: transparent; }
#root { position: relative; width: 100%; height: 100%; font-family: Inter, sans-serif; color: #141414; }
.grp { position: absolute; inset: 0; }
.title { position: absolute; left: 0; right: 0; text-align: center; font-weight: 800; font-size: 74px; letter-spacing: -0.02em; line-height: 1.1;
  text-shadow: 0 1px 0 rgba(255,255,255,0.35), 0 6px 22px rgba(255,255,255,0.35); }
.title > span { display: inline-block; }
.serif { font-family: "Instrument Serif", serif; font-style: italic; font-weight: 400; letter-spacing: 0; }
.title .serif.big { font-size: 122px; }
.mark { background: #ff3b30; color: #fff; padding: 0 10px; border-radius: 6px; }
.markbig { display: inline-block; background: #ff3b30; color: #fff; padding: 2px 26px 8px; border-radius: 10px; font-weight: 900; font-size: 92px; letter-spacing: -0.02em;
  box-shadow: 0 10px 30px rgba(255,59,48,0.35); }
.markbig.small { font-size: 64px; padding: 0 16px 4px; vertical-align: 4px; }
.row { position: absolute; left: 0; right: 0; display: flex; justify-content: center; gap: 22px; }
.pp { color: #141414; display: block; }
.row.small .pp { width: 62px; height: 93px; }
.pp.red { color: #ff3b30; filter: drop-shadow(0 0 18px rgba(255,59,48,0.55)); }
.pw { position: relative; }
.pw .gl { position: absolute; right: -14px; top: 40px; width: 26px; height: 32px; }
.title.t2 { font-size: 64px; } .title.t2 .serif.big { font-size: 100px; }
.youtag { position: absolute; left: 110%; top: 30px; font-weight: 900; font-size: 26px; letter-spacing: 0.12em; color: #ff3b30; }
.tile { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.tbox { background: #fff; border-radius: 34px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 14px 36px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12); }
.tlab { background: #fff; border-radius: 999px; padding: 8px 18px; font-weight: 800; font-size: 32px; display: flex; gap: 10px; align-items: center;
  box-shadow: 0 6px 18px rgba(0,0,0,0.18); white-space: nowrap; }
.num { font-size: 20px; font-weight: 900; color: #fff; background: #141414; border-radius: 8px; padding: 3px 7px; }
.num:empty { display: none; }
.pill { position: absolute; background: #fff; border-radius: 999px; padding: 12px 34px; font-weight: 800; font-size: 46px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.pill .serif { font-size: 60px; color: #ff3b30; }
.card { position: absolute; background: #fff; border-radius: 34px; padding: 34px 44px 30px; box-shadow: 0 18px 50px rgba(0,0,0,0.25); }
.kicker { font-weight: 800; font-size: 24px; letter-spacing: 0.22em; color: #6b6b6b; margin-bottom: 12px; }
.kicker.solo { position: absolute; left: 0; right: 0; text-align: center; color: #141414; font-size: 30px; }
.qt { font-weight: 800; font-size: 50px; line-height: 1.16; letter-spacing: -0.015em; }
.qt .serif { font-size: 64px; }
.by { margin-top: 14px; font-weight: 600; font-size: 28px; color: #6b6b6b; }
.srow { display: flex; align-items: center; gap: 30px; }
.bignum { font-weight: 900; font-size: 140px; letter-spacing: -0.05em; color: #ff3b30; line-height: 1; min-width: 270px; }
.stxt { font-weight: 700; font-size: 42px; line-height: 1.18; }
.stxt .serif { font-size: 56px; }
.src { margin-top: 14px; font-size: 22px; font-weight: 500; color: #8a8a8a; }
.line { position: absolute; left: 110px; right: 110px; height: 88px; background: #fff; border-radius: 28px; display: flex; align-items: center; gap: 24px; padding: 0 30px 0 22px;
  box-shadow: 0 12px 34px rgba(0,0,0,0.2); }
.dot { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dot.neg { background: #ff3b30; } .dot.pos { background: #22c55e; }
.okdot { display: inline-flex; width: 84px; height: 84px; border-radius: 50%; background: #22c55e; align-items: center; justify-content: center; vertical-align: middle; }
.what { flex: 1; font-weight: 800; font-size: 40px; }
.what .serif { font-size: 52px; }
.strike { position: relative; color: #8a8a8a; --s: 0; }
.strike::after { content: ""; position: absolute; left: -4px; right: -4px; top: 52%; height: 6px; background: #ff3b30; border-radius: 3px; transform-origin: left; transform: scaleX(var(--s)); }
.tag { font-weight: 900; font-size: 22px; letter-spacing: 0.16em; text-transform: uppercase; color: #6b6b6b; }
.side { position: absolute; text-align: center; width: 260px; }
.side .sans { font-weight: 800; font-size: 54px; letter-spacing: -0.02em; text-shadow: 0 6px 22px rgba(255,255,255,0.4); }
.side .huge { font-size: 132px; line-height: 0.9; color: #141414; text-shadow: 0 6px 22px rgba(255,255,255,0.45); border-bottom: 8px solid #ff3b30; display: inline-block; padding: 0 8px; }
.ctabox { position: absolute; left: 110px; right: 110px; background: #fff; border-radius: 34px; padding: 22px 30px 20px; text-align: center; box-shadow: 0 18px 50px rgba(0,0,0,0.28); }
.ctaq { font-weight: 800; font-size: 54px; letter-spacing: -0.02em; }
.ctaq .serif { font-size: 70px; }
.ctasub { margin-top: 4px; font-weight: 700; font-size: 30px; color: #6b6b6b; }
`;

let body = "", anim = "";
G.forEach(([id, at, dur, html, an], i) => {
  body += `      <div class="grp clip" id="g_${id}" data-start="${at}" data-duration="${dur}" data-track-index="${i}">${html}\n      </div>\n`;
  // Entrance animations are written relative to the group start; shift them to absolute time.
  const shifted = an.map((s) => s.replace(/, ([0-9.]+)\);$/, (_, t) => `, ${(at + +t).toFixed(3)});`)).join("\n      ");
  anim += `      ${shifted}\n      tl.to("#g_${id}", { opacity: 0, duration: 0.22, ease: "power2.in" }, ${(at + dur - 0.22).toFixed(3)});\n`;
});

const out = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="gsap.min.js"></script>
    <style>${CSS}</style>
  </head>
  <body>
    <div id="root" data-composition-id="graphics" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
${body}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${anim}      window.__timelines = window.__timelines || {};
      window.__timelines["graphics"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
const dir = join(HERE, "graphics");
mkdirSync(join(dir, "fonts"), { recursive: true });
writeFileSync(join(dir, "index.html"), out);
copyFileSync(join(HERE, "../../graphics/intro/gsap.min.js"), join(dir, "gsap.min.js"));
copyFileSync(join(HERE, "fonts/InstrumentSerif-Italic.woff2"), join(dir, "fonts/InstrumentSerif-Italic.woff2"));
console.log(G.map(([id, at, dur]) => `${id} @${at}s ${dur}s`).join("\n"));
