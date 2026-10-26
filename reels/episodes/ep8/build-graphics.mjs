// Builds the kinetic titles, minimalist icon tiles and data cards of the reel (style: reels/EDITING-STYLE.md,
// "Typography and minimalist graphics") as two transparent 1080x1920 HyperFrames compositions:
//   graphics/ -> behind the person cut-out (titles behind the hair, tiles beside the head)
//   front/    -> above the cut-out (cards over the chest, the CTA), still below the captions
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PERFIL = "data:image/jpeg;base64," + readFileSync(join(HERE, "../../assets/photos/perfil_header.jpg")).toString("base64");
const W = 1080, H = 1920, DUR = 36.5;

// ---- minimalist line icons (viewBox 0 0 100 100) ----
const S = `fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;
const ICON = {
  dumbbell: `<path ${S} d="M28 50H72"/><rect ${S} x="14" y="32" width="14" height="36" rx="4"/><rect ${S} x="72" y="32" width="14" height="36" rx="4"/><path ${S} d="M8 42v16M92 42v16"/>`,
  medal: `<path ${S} d="M34 10l16 30 16-30"/><circle ${S} cx="50" cy="64" r="24"/><path ${S} d="M44 58l6-5v23"/>`,
  trophy: `<path ${S} d="M30 14h40v24a20 20 0 0 1-40 0Z"/><path ${S} d="M30 22H16c0 14 6 20 14 20M70 22h14c0 14-6 20-14 20"/><path ${S} d="M50 58v16M34 88h32M40 74h20v14H40Z"/>`,
  briefcase: `<rect ${S} x="12" y="32" width="76" height="52" rx="9"/><path ${S} d="M37 32v-9h26v9M12 54h76"/>`,
  chart: `<path ${S} d="M12 84h78"/><path ${S} d="M16 70 38 48l16 12 32-34"/><path ${S} d="M70 26h16v16"/>`,
  key: `<circle ${S} cx="32" cy="50" r="18"/><path ${S} d="M50 50h40M78 50v14M66 50v10"/>`,
  target: `<circle ${S} cx="46" cy="54" r="34"/><circle ${S} cx="46" cy="54" r="19"/><circle cx="46" cy="54" r="6" fill="currentColor"/><path ${S} d="M46 54 84 16M72 16h12v12"/>`,
  clock: `<circle ${S} cx="50" cy="52" r="36"/><path ${S} d="M50 30v24l16 10"/>`,
  people: `<circle ${S} cx="36" cy="34" r="12"/><path ${S} d="M14 82c0-16 10-26 22-26s22 10 22 26"/><circle ${S} cx="68" cy="38" r="10"/><path ${S} d="M60 58c3-1 5-2 8-2 11 0 19 9 19 23"/>`,
  down: `<path ${S} d="M50 14v68M24 56l26 26 26-26"/>`,
  up: `<path ${S} d="M50 86V18M24 44l26-26 26 26"/>`,
  user: `<circle ${S} cx="50" cy="32" r="16"/><path ${S} d="M18 88c0-20 14-32 32-32s32 12 32 32"/>`,
  pen: `<path ${S} d="M64 14l22 22-48 48H16V62Z"/><path ${S} d="M56 22l22 22"/>`,
  globe: `<circle ${S} cx="50" cy="50" r="37"/><ellipse ${S} cx="50" cy="50" rx="15" ry="37"/><path ${S} d="M13 50h74M20 31h60M20 69h60"/>`,
  heart: `<path ${S} d="M50 84S14 62 14 38a18 18 0 0 1 36-6 18 18 0 0 1 36 6c0 24-36 46-36 46Z"/>`,
  ok: `<path ${S} d="M20 52l20 20 40-42"/>`,
  shoe: `<path ${S} d="M10 70V52l14-4 10 10c8 6 22 8 34 8h14c4 0 8 4 8 8v4H10Z"/><path ${S} d="M10 78h80M38 56l6-6M46 62l6-6"/>`,
  cap: `<path ${S} d="M8 40 50 22 92 40 50 58Z"/><path ${S} d="M27 49v16c14 10 32 10 46 0V49"/><path ${S} d="M92 40v20"/>`,
  shirt: `<path ${S} d="M36 14 14 26l8 18 10-5v47h36V39l10 5 8-18-22-12c-2 8-8 12-14 12s-12-4-14-12Z"/>`,
  wave: `<path ${S} d="M8 44c10-8 18-8 28 0s18 8 28 0 18-8 28 0M8 66c10-8 18-8 28 0s18 8 28 0 18-8 28 0"/>`,
  check: `<path fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" d="M28 52l15 15 30-32"/>`,
  cross: `<path fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" d="M33 33l34 34M67 33 33 67"/>`,
};
const svg = (name, size, color = "#141414") =>
  `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="color:${color}">${ICON[name]}</svg>`;

// ---- groups: [id, start, dur, html, gsap entrance (relative to start), front?] ----
// Close-up all the way: hair top ~15%, chin ~42%, face between x 380-700, shoulders from ~45%.
// Top labels go in front too: the hair rises over them when he leans in.
// The busy ceiling makes dark text unreadable, so every phrase sits on a white box: short labels at the top
// (12.4-16%, mostly above the hair), tiles and side words beside the head (x 20-320 / 760-1060, y 380-760),
// titles, cards and the CTA over the chest (y 985-1200), above the cut-out and clear of the captions (~1250+).
const FB = 1010;   // front title boxes: between the chin and the captions
const tile = (id, icon, num, label, x, y, size = 120, color) => `
  <div class="tile" id="${id}" style="left:${x}px;top:${y}px">
    <div class="tbox" style="width:${size + 56}px;height:${size + 56}px">${svg(icon, size, color)}</div>
    <div class="tlab"><span class="num">${num}</span>${label}</div>
  </div>`;
const fbox = (id, inner, top = FB) => `<div class="fbox" style="top:${top}px"><div class="in" id="${id}">${inner}</div></div>`;
const kicker = (id, text, top = 238) => `<div class="kpill" id="${id}" style="top:${top}px"><span>${text}</span></div>`;
const pop = (sel, t) => `tl.fromTo("${sel}", { opacity: 0, scale: 0.4, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "back.out(2.2)" }, ${t});`;
const rise = (sel, t, d = 0.35) => `tl.fromTo("${sel}", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: ${d}, ease: "power3.out" }, ${t});`;
const slam = (sel, t, rot = 0) => `tl.fromTo("${sel}", { opacity: 0, scale: 1.6, rotate: ${rot - 6} }, { opacity: 1, scale: 1, rotate: ${rot}, duration: 0.42, ease: "back.out(2)" }, ${t});`;
const strike = (sel, t) => `tl.fromTo("${sel}", { "--s": 0 }, { "--s": 1, duration: 0.35, ease: "power2.out" }, ${t});`;

const G = [
  ["hook_k", 0.1, 5.7, kicker("hk", "TAVA PENSANDO AQUI"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 3.5, 2.3, fbox("h0", `<span>esperar se sentir</span> <span class="serif big">pronto</span>`), [rise("#h0", 0.0, 0.3)], true],
  ["dia", 7.3, 1.6, fbox("d0", `<span>esse dia</span> <span class="markbig small">quase nunca</span> <span>chega</span>`), [rise("#d0", 0.0, 0.3)], true],
  // B/Fore at 16.
  ["bfore", 8.9, 4.3, `
    <div class="side" id="b1" style="left:20px;top:400px"><div class="sans">abri a</div><div class="serif huge">B/Fore</div></div>
    <div class="side" id="b2" style="left:760px;top:400px"><div class="sans">com</div><div class="serif huge red">16 anos</div></div>`,
    [rise("#b1", 1.5, 0.35), rise("#b2", 2.2, 0.35)]],
  ["nada", 13.25, 1.9, fbox("n0", `<span>não sabia</span> <span class="serif big">quase nada</span>`), [rise("#n0", 0.0, 0.3)], true],
  ["pratica", 15.2, 4.45, `
    ${tile("p_ok", "ok", "", "não esperei", 40, 420, 120, "#16a34a")}`,
    [pop("#p_ok", 0.8)]],
  ["pratica_t", 17.95, 1.7, fbox("p0", `<span>aprendi na</span> <span class="markbig small">prática</span>`), [rise("#p0", 0.0, 0.3)], true],
  // You don't learn to swim reading about swimming.
  ["nadar", 19.7, 5.7, `
    <div class="side" id="s1" style="left:20px;top:400px"><div class="sans">lendo</div><div class="serif huge strike" id="s1s">natação</div></div>
    ${tile("s_wv", "wave", "", "nadando", 790, 400, 120, "#2563eb")}`,
    [rise("#s1", 1.8, 0.35), strike("#s1s", 2.4), pop("#s_wv", 1.4)]],
  ["empre_k", 23.1, 2.3, kicker("ek", "NO EMPREENDEDORISMO"), [rise("#ek", 0.0, 0.3)], true],
  ["caminho", 26.7, 1.65, fbox("c0", `<span>o pronto vem no</span> <span class="serif big">caminho</span>`), [rise("#c0", 0.0, 0.3)], true],
  ["sinal_k", 28.4, 3.3, kicker("sk", "SE VOCÊ TÁ ESPERANDO"), [rise("#sk", 0.0, 0.3)], true],
  ["sinal", 31.7, 2.05, fbox("s0", `<span>esse é o seu</span> <span class="markbig small">sinal</span>`), [rise("#s0", 0.0, 0.3)], true],
  ["cta", 33.75, 2.75, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
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


const CSS_EP3 = `
.kpill { position: absolute; left: 0; right: 0; text-align: center; }
.kpill span { display: inline-block; background: #141414; color: #fff; font-weight: 900; font-size: 28px; letter-spacing: 0.22em; padding: 8px 18px 8px 24px; border-radius: 10px;
  box-shadow: 0 8px 22px rgba(0,0,0,0.25); }
.title .strike, .side .strike { color: #141414; }
.side .huge.red { color: #ff3b30; border-bottom-color: #ff3b30; }
.side .huge.green { color: #16a34a; border-bottom-color: #16a34a; }
.side .huge.strike { color: #8a8a8a; border-bottom: none; }
.side .tag2 { margin-top: 8px; font-weight: 900; font-size: 24px; letter-spacing: 0.16em; text-transform: uppercase; color: #ff3b30; }
.xdot { display: inline-flex; width: 70px; height: 70px; border-radius: 50%; background: #ff3b30; align-items: center; justify-content: center; vertical-align: middle; }
.side .xdot.sm, .side .okdot.sm { width: 58px; height: 58px; margin-top: 10px; }
.stack { position: absolute; display: flex; flex-direction: column; gap: 18px; align-items: flex-start; }
.spill { background: #fff; border-radius: 999px; padding: 12px 26px 12px 14px; font-weight: 800; font-size: 40px; display: flex; gap: 14px; align-items: center;
  box-shadow: 0 10px 28px rgba(0,0,0,0.22); }
.spill .num { font-size: 22px; }
.bignum { min-width: 230px; font-size: 130px; }
.cmp { padding: 26px 34px 22px; }
.crow { display: flex; align-items: center; gap: 22px; margin: 8px 0; }
.clab { width: 250px; font-weight: 800; font-size: 34px; line-height: 1.05; }
.clab small { display: block; font-weight: 600; font-size: 22px; color: #6b6b6b; margin-top: 4px; }
.cbar { flex: 1; height: 34px; background: #eee; border-radius: 10px; overflow: hidden; }
.cbar i { display: block; height: 100%; width: 0%; background: #141414; border-radius: 10px; }
.cbar i.red { background: #ff3b30; }
.cval { width: 250px; text-align: right; font-weight: 900; font-size: 42px; white-space: nowrap; letter-spacing: -0.03em; }
.cval.red { color: #ff3b30; }
.pcard { position: absolute; left: 270px; top: 1090px; width: 540px; background: #fff; border-radius: 28px; padding: 10px 10px 14px; text-align: center;
  box-shadow: 0 18px 50px rgba(0,0,0,0.3); }
.pcard img { width: 100%; display: block; border-radius: 20px; }
.pcard .ctasub { margin-top: 8px; font-weight: 800; font-size: 30px; color: #141414; }

.fbox { position: absolute; left: 0; right: 0; text-align: center; }
.fbox .in { display: inline-block; background: #fff; border-radius: 30px; padding: 6px 34px 14px; font-weight: 800; font-size: 62px; letter-spacing: -0.02em; line-height: 1.15;
  box-shadow: 0 16px 44px rgba(0,0,0,0.28); }
.fbox .in > span { display: inline-block; vertical-align: middle; }
.fbox .serif.big { font-size: 96px; letter-spacing: 0; }
.fbox .red { color: #ff3b30; font-weight: 900; }
.fbox .strike { color: #8a8a8a; }
.side { width: 300px; background: #fff; border-radius: 30px; padding: 14px 10px 18px; box-shadow: 0 14px 36px rgba(0,0,0,0.22); }
.side .sans { font-size: 46px; text-shadow: none; }
.side .huge { font-size: 96px; text-shadow: none; }
.side .huge.strike { font-size: 84px; }
.title .markbig { font-size: 76px; }
.stxt { font-size: 38px; }
`;

function page(id, groups) {
  let body = "", anim = "";
  groups.forEach(([gid, at, dur, html, an], i) => {
    body += `      <div class="grp clip" id="g_${gid}" data-start="${at}" data-duration="${dur}" data-track-index="${i}">${html}\n      </div>\n`;
    // Entrance animations are written relative to the group start; shift them to absolute time.
    const shifted = an.map((s) => s.replace(/, ([0-9.]+)\);$/, (_, t) => `, ${(at + +t).toFixed(3)});`)).join("\n      ");
    anim += `      ${shifted}\n      tl.to("#g_${gid}", { opacity: 0, duration: 0.22, ease: "power2.in" }, ${(at + dur - 0.22).toFixed(3)});\n`;
  });
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="gsap.min.js"></script>
    <style>${CSS}${CSS_EP3}</style>
  </head>
  <body>
    <div id="root" data-composition-id="${id}" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
${body}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${anim}      window.__timelines = window.__timelines || {};
      window.__timelines["${id}"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
}

for (const [id, groups] of [["graphics", G.filter((g) => !g[5])], ["front", G.filter((g) => g[5])]]) {
  const dir = join(HERE, id);
  mkdirSync(join(dir, "fonts"), { recursive: true });
  writeFileSync(join(dir, "index.html"), page(id, groups));
  copyFileSync(join(HERE, "../../graphics/intro/gsap.min.js"), join(dir, "gsap.min.js"));
  copyFileSync(join(HERE, "fonts/InstrumentSerif-Italic.woff2"), join(dir, "fonts/InstrumentSerif-Italic.woff2"));
}
console.log(G.map(([id, at, dur, , , front]) => `${id} @${at}s ${dur}s${front ? " (front)" : ""}`).join("\n"));
