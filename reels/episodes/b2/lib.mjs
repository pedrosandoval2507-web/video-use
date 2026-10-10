// Graphic building blocks for batch 2 (ep2 look: Inter 800-900 + Instrument Serif Italic, white tiles,
// line icons, red #ff3b30 accents, green ✓). Every block returns a group {id, t0, t1, h, html, an, sfx};
// html is laid out from y = 0 inside the group, build.mjs decides where the group sits (face-safe).
// Times passed to blocks are absolute (seconds on the cut); `an` strings end in a time relative to t0.

const S = `fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;
export const ICON = {
  person: `<circle ${S} cx="50" cy="32" r="16"/><path ${S} d="M18 90c0-20 14-34 32-34s32 14 32 34"/>`,
  users: `<circle ${S} cx="36" cy="36" r="13"/><path ${S} d="M10 84c0-16 11-27 26-27s26 11 26 27"/><circle ${S} cx="68" cy="30" r="11"/><path ${S} d="M70 52c12 2 20 12 20 26"/>`,
  doc: `<path ${S} d="M24 10h36l18 18v62H24Z"/><path ${S} d="M60 10v18h18M36 50h28M36 64h28M36 78h18"/>`,
  calendar: `<rect ${S} x="14" y="20" width="72" height="66" rx="10"/><path ${S} d="M14 40h72M34 12v16M66 12v16"/>`,
  scale: `<path ${S} d="M50 14v72M24 86h52M18 30h64"/><path ${S} d="M18 30 8 56h20ZM82 30 72 56h20Z"/>`,
  smile: `<circle ${S} cx="50" cy="50" r="38"/><path ${S} d="M34 58c8 10 24 10 32 0"/><path ${S} d="M37 40v2M63 40v2"/>`,
  repeat: `<path ${S} d="M20 42a30 30 0 0 1 52-16l8 8M80 58a30 30 0 0 1-52 16l-8-8"/><path ${S} d="M80 18v16H64M20 82V66h16"/>`,
  target: `<circle ${S} cx="50" cy="50" r="36"/><circle ${S} cx="50" cy="50" r="20"/><circle cx="50" cy="50" r="6" fill="currentColor"/>`,
  network: `<circle ${S} cx="50" cy="50" r="12"/><circle ${S} cx="18" cy="22" r="8"/><circle ${S} cx="82" cy="22" r="8"/><circle ${S} cx="18" cy="80" r="8"/><circle ${S} cx="82" cy="80" r="8"/><path ${S} d="M26 28l14 14M74 28 60 42M26 74l14-14M74 74 60 60"/>`,
  arrow: `<path ${S} d="M12 50h70M64 30l20 20-20 20"/>`,
  money: `<rect ${S} x="8" y="26" width="84" height="48" rx="8"/><circle ${S} cx="50" cy="50" r="12"/><path ${S} d="M22 40v20M78 40v20"/>`,
  chart: `<path ${S} d="M12 86h78"/><path ${S} d="M22 86V58M42 86V30M62 86V46M82 86V18"/>`,
  waves: `<path ${S} d="M10 86h80"/><path ${S} d="M18 86V40M34 86V64M50 86V28M66 86V70M82 86V48"/>`,
  box: `<path ${S} d="M50 10 88 30v40L50 90 12 70V30Z"/><path ${S} d="M12 30l38 20 38-20M50 50v40"/>`,
  megaphone: `<path ${S} d="M14 42v18h14l34 18V24L28 42Z"/><path ${S} d="M74 38c6 6 6 20 0 26M28 60l6 24"/>`,
  camera: `<rect ${S} x="10" y="30" width="58" height="44" rx="9"/><path ${S} d="M68 46 90 34v36L68 58"/>`,
  leaf: `<path ${S} d="M20 80C20 40 44 18 84 16c0 40-22 64-62 64Z"/><path ${S} d="M20 80 56 44"/>`,
  lock: `<rect ${S} x="20" y="44" width="60" height="44" rx="9"/><path ${S} d="M32 44V32a18 18 0 0 1 36 0v12"/><path ${S} d="M50 62v10"/>`,
  eye: `<path ${S} d="M8 50c12-20 26-30 42-30s30 10 42 30c-12 20-26 30-42 30S20 70 8 50Z"/><circle ${S} cx="50" cy="50" r="12"/>`,
  star: `<path ${S} d="M50 12l11 24 26 3-19 18 5 26-23-13-23 13 5-26-19-18 26-3Z"/>`,
  mic: `<rect ${S} x="36" y="10" width="28" height="48" rx="14"/><path ${S} d="M22 46a28 28 0 0 0 56 0M50 74v14M36 88h28"/>`,
  store: `<path ${S} d="M14 40 20 16h60l6 24"/><path ${S} d="M14 40c0 8 8 12 14 12s12-4 12-12c0 8 6 12 10 12s10-4 10-12c0 8 6 12 12 12s14-4 14-12"/><path ${S} d="M20 52v34h60V52M40 86V66h20v20"/>`,
  globe: `<circle ${S} cx="50" cy="50" r="38"/><path ${S} d="M12 50h76M50 12c-14 18-14 58 0 76M50 12c14 18 14 58 0 76"/>`,
  ai: `<rect ${S} x="22" y="22" width="56" height="56" rx="10"/><path ${S} d="M36 10v12M64 10v12M36 78v12M64 78v12M10 36h12M10 64h12M78 36h12M78 64h12"/><path ${S} d="M38 62l8-24h4l8 24M42 54h12"/>`,
  phone: `<rect ${S} x="28" y="8" width="44" height="84" rx="10"/><path ${S} d="M44 78h12"/>`,
  shield: `<path ${S} d="M50 10 84 22v26c0 22-14 36-34 44-20-8-34-22-34-44V22Z"/><path ${S} d="M36 50l10 10 18-20"/>`,
  piggy: `<path ${S} d="M20 52c0-18 16-30 36-30 16 0 30 8 34 22h6v14h-8c-2 6-6 10-10 12v10H64v-6H40v6H26v-12c-4-4-6-10-6-16Z"/><path ${S} d="M44 22v-6h14"/><circle cx="68" cy="44" r="3.5" fill="currentColor"/>`,
  rocket: `<path ${S} d="M50 10c16 12 22 30 18 52H32c-4-22 2-40 18-52Z"/><circle ${S} cx="50" cy="38" r="8"/><path ${S} d="M32 62 20 76l14 2M68 62l12 14-14 2M42 74l8 16 8-16"/>`,
  warning: `<path ${S} d="M50 12 92 86H8Z"/><path ${S} d="M50 40v22M50 74v2"/>`,
  bookmark: `<path ${S} d="M26 10h48v80L50 72 26 90Z"/>`,
  clock: `<circle ${S} cx="50" cy="50" r="38"/><path ${S} d="M50 26v26l16 10"/>`,
  truck: `<path ${S} d="M8 24h52v44H8ZM60 40h18l14 16v12H60"/><circle ${S} cx="26" cy="74" r="9"/><circle ${S} cx="74" cy="74" r="9"/>`,
  handshake: `<path ${S} d="M8 40l18-14 16 6 12-6 18 6 20 10M8 40l26 26c4 4 10 4 14 0M92 42 66 68c-4 4-10 4-14 0l-8-8"/><path ${S} d="M48 34 36 46c-3 3 0 8 4 8l12-6"/>`,
  party: `<path ${S} d="M14 88 34 30l36 36Z"/><path ${S} d="M56 18c4 6 2 12-2 16M74 26l8-6M80 44h10M66 10v8"/>`,
  tag: `<path ${S} d="M12 50V14h36l40 40-36 36Z"/><circle ${S} cx="30" cy="32" r="6"/>`,
  zero: `<circle ${S} cx="50" cy="50" r="38"/><path ${S} d="M28 72 72 28"/>`,
  check: `<path fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" d="M28 52l15 15 30-32"/>`,
  cross: `<path fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" d="M33 33l34 34M67 33 33 67"/>`,
};
export const svg = (name, size, color = "#141414") => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="color:${color}">${ICON[name]}</svg>`;

// ---------- GSAP snippets (time relative to the group's start) ----------
const r2 = (t) => Math.max(0, t).toFixed(2);
export const pop = (sel, t) => `tl.fromTo("${sel}", { opacity: 0, scale: 0.4, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "back.out(2.2)" }, ${r2(t)});`;
export const rise = (sel, t, d = 0.35) => `tl.fromTo("${sel}", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: ${d}, ease: "power3.out" }, ${r2(t)});`;
export const grow = (sel, t) => `tl.fromTo("${sel}", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ${r2(t)});`;
export const strikeA = (sel, t) => `tl.fromTo("${sel}", { "--s": 0 }, { "--s": 1, duration: 0.35, ease: "power2.out" }, ${r2(t)});`;
export const fade = (sel, t, o = 0.45) => `tl.to("${sel}", { opacity: ${o}, duration: 0.3 }, ${r2(t)});`;
export const fillA = (sel, t, to) => `tl.fromTo("${sel}", { width: "0%" }, { width: "${to}%", duration: 0.8, ease: "power2.out" }, ${r2(t)});`;
export const count = (sel, t, from, to) => `tl.fromTo("${sel}", { innerText: ${from} }, { innerText: ${to}, duration: 0.9, ease: "power2.out", snap: { innerText: 1 } }, ${r2(t)});`;

let uid = 0;
const nid = (p) => `${p}${++uid}`;

// ---------- blocks ----------
// A row of words mixing sans / serif / marker / strike / red. parts: [text, at, kind?]
//   kind: "" (sans) | "serif" | "mark" | "strike" | "red" | "small"
function rowHtml(parts, t0, top, size = 66) {
  const an = [], sfx = [];
  const spans = parts.map(([txt, at, kind = ""]) => {
    const id = nid("x");
    if (kind === "serif") an.push(grow(`#${id}`, at - t0));
    else if (kind === "mark") { an.push(pop(`#${id}`, at - t0)); sfx.push(["press", at - t0, 0.55]); }
    else an.push(rise(`#${id}`, at - t0));
    if (kind === "strike") { an.push(strikeA(`#${id}`, at - t0 + 0.45), fade(`#${id}`, at - t0 + 0.6, 0.6)); sfx.push(["error", at - t0 + 0.45, 0.4]); }
    const cls = { serif: "serif big", mark: "markbig", strike: "strike", red: "redw", small: "smallw" }[kind] || "";
    return `<span id="${id}" class="${cls}">${txt}</span>`;
  });
  // estimated width (Inter 800 ~0.58em/char, serif x1.75 ~0.45em/char, marker x1.2 + padding): shrink to fit 980 px
  const est = parts.reduce((n, [txt, , kind = ""]) => {
    const t = txt.replace(/<[^>]+>/g, "").length;
    return n + 18 + (kind === "serif" ? t * 0.45 * 1.75 : kind === "mark" ? t * 0.62 * 1.2 + 0.7 : kind === "small" ? t * 0.42 : t * 0.58) * size + (kind === "mark" ? 44 : 0);
  }, 0);
  if (est > 980) size = Math.floor(size * 980 / est);
  const hasSerif = parts.some((x) => x[2] === "serif" || x[2] === "mark");
  const h = hasSerif ? 128 : size >= 66 ? 86 : 70;
  return { html: `<div class="title" style="top:${top}px;font-size:${size}px;height:${h}px">${spans.join(" ")}</div>`, an, sfx, h };
}
export function mix(id, t0, t1, rows, o = {}) {
  if (!Array.isArray(rows[0][0])) rows = [rows];
  let y = 0, html = "", an = [], sfx = [["deep-woosh", 0, 0.32]];
  if (o.kicker) { html += `<div class="kick" style="top:0">${o.kicker}</div>`; an.push(rise(`#${id}_k`, 0)); html = html.replace('class="kick"', `class="kick" id="${id}_k"`); y = 48; }
  for (const r of rows) {
    const q = rowHtml(r, t0, y, o.size || 66);
    html += q.html; an.push(...q.an); sfx.push(...q.sfx); y += q.h + 4;
  }
  return { id, t0, t1, h: y, html, an, sfx, L: o.L };
}
// Icon tiles that build up: items [{icon, label, num, at, color, x: "✓"|"✕"}]
export function tiles(id, t0, t1, items, o = {}) {
  const size = o.size || (items.length >= 4 ? 84 : 100), box = size + 46;
  let y = 0, html = "", an = [], sfx = [];
  if (o.kicker) { html += `<div class="kick" id="${id}_k" style="top:0">${o.kicker}</div>`; an.push(rise(`#${id}_k`, 0)); y = 50; }
  html += `<div class="row" style="top:${y}px">` + items.map((it, k) => {
    const tid = `${id}_t${k}`;
    an.push(pop(`#${tid}`, it.at - t0)); sfx.push(["press", it.at - t0, 0.6]);
    let badge = "";
    if (it.x) {
      const bid = `${tid}_b`, ok = it.x === "✓";
      badge = `<div class="badge ${ok ? "ok" : "no"}" id="${bid}">${svg(ok ? "check" : "cross", 34)}</div>`;
      an.push(pop(`#${bid}`, (it.xat ?? it.at + 0.5) - t0)); sfx.push([ok ? "success" : "error", (it.xat ?? it.at + 0.5) - t0, 0.35]);
    }
    return `<div class="tile" id="${tid}"><div class="tbox" style="width:${box}px;height:${box}px">${svg(it.icon, size, it.color)}${badge}</div>${it.label ? `<div class="tlab">${it.num ? `<span class="num">${it.num}</span>` : ""}${it.label}</div>` : ""}</div>`;
  }).join("") + `</div>`;
  return { id, t0, t1, h: y + box + 62, html, an, sfx, L: o.L };
}
// White card: kicker, big line (html allowed), sub line, source
export function card(id, t0, t1, c, o = {}) {
  const an = [rise(`#${id}_c`, (c.at ?? t0) - t0, 0.4)], sfx = [["ui-reveal", (c.at ?? t0) - t0, 0.45]];
  let inner = "";
  if (c.icon) inner += `<div class="cicon">${svg(c.icon, 74, c.iconColor)}</div>`;
  if (c.kicker) inner += `<div class="kicker">${c.kicker}</div>`;
  if (c.big) inner += `<div class="bigline" id="${id}_b">${c.big}</div>`;
  if (c.sub) inner += `<div class="csub" id="${id}_s">${c.sub}</div>`;
  if (c.src) inner += `<div class="src">${c.src}</div>`;
  if (c.bigAt) an.push(grow(`#${id}_b`, c.bigAt - t0));
  if (c.subAt) { an.push(rise(`#${id}_s`, c.subAt - t0)); }
  const h = (c.icon ? 84 : 0) + (c.kicker ? 40 : 0) + (c.big ? (c.bigH || 104) : 0) + (c.sub ? 56 : 0) + (c.src ? 38 : 0) + 64;
  return { id, t0, t1, h, html: `<div class="card center" id="${id}_c" style="top:0;height:${h}px">${inner}</div>`, an, sfx, L: o.L, overlap: o.overlap };
}
// Big red number + label, optional count-up
export function stat(id, t0, t1, s, o = {}) {
  const an = [rise(`#${id}_n`, (s.at ?? t0) - t0, 0.3)], sfx = [["ui-reveal", (s.at ?? t0) - t0, 0.45]];
  if (s.countTo != null) an.push(count(`#${id}_v`, (s.at ?? t0) - t0, 0, s.countTo));
  if (s.label) an.push(rise(`#${id}_l`, (s.labelAt ?? (s.at ?? t0) + 0.3) - t0));
  const h = 150 + (s.label ? 70 : 0) + (s.src ? 40 : 0);
  return { id, t0, t1, h, L: o.L, an, sfx, html: `
    <div class="statn" id="${id}_n" style="top:0">${s.pre || ""}<span id="${id}_v">${s.value}</span>${s.post || ""}</div>
    ${s.label ? `<div class="statl" id="${id}_l" style="top:148px">${s.label}</div>` : ""}
    ${s.src ? `<div class="src abs" style="top:${s.label ? 214 : 150}px">${s.src}</div>` : ""}` };
}
// Progress bar to pct with a label above
export function bar(id, t0, t1, b, o = {}) {
  const an = [rise(`#${id}_l`, 0), rise(`#${id}_bar`, (b.at ?? t0) - t0, 0.25), fillA(`#${id}_f`, (b.at ?? t0) - t0 + 0.1, b.pct), rise(`#${id}_p`, (b.at ?? t0) - t0 + 0.7, 0.25)];
  return { id, t0, t1, h: 150, L: o.L, an, sfx: [["ui-reveal", (b.at ?? t0) - t0, 0.4]], html: `
    <div class="title" id="${id}_l" style="top:0;font-size:52px;height:70px">${b.label}</div>
    <div class="bar" id="${id}_bar" style="top:92px"><div class="barfill" id="${id}_f"></div></div>
    <div class="barpct" id="${id}_p" style="top:76px">${b.text || b.pct + "%"}</div>` };
}
// Closing CTA box
export function cta(id, t0, t1, q, sub) {
  return { id, t0, t1, h: 190, an: [rise(`#${id}_c`, 0, 0.4)], sfx: [["notification-chime", 0, 0.5]], html: `
    <div class="ctabox" id="${id}_c" style="top:0"><div class="ctaq">${q}</div>${sub ? `<div class="ctasub">${sub}</div>` : ""}</div>` };
}

// ---------- page + CSS ----------
export function page(id, dur, head, body, script, ownTl = true) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="gsap.min.js"></script>
    <style>* { margin: 0; padding: 0; box-sizing: border-box; } html, body { width: 1080px; height: 1920px; overflow: hidden; background: transparent; }
      #root { position: relative; width: 100%; height: 100%; }</style>
    ${head}
  </head>
  <body>
    <div id="root" data-composition-id="${id}" data-start="0" data-duration="${dur}" data-width="1080" data-height="1920">
${body}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${script}      window.__timelines = window.__timelines || {};
      window.__timelines["${id}"] = tl;
      ${ownTl ? "tl.seek(0);" : ""}
    </script>
  </body>
</html>
`;
}
export const CSS = `
@font-face { font-family: "Instrument Serif"; font-style: italic; src: url("fonts/InstrumentSerif-Italic.woff2") format("woff2"); }
#root { font-family: Inter, sans-serif; color: #141414; }
.grp { position: absolute; left: 0; right: 0; transform-origin: 50% 0; }
.title { position: absolute; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 0 18px; flex-wrap: nowrap; white-space: nowrap;
  font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.45), 0 6px 26px rgba(0,0,0,0.4); }
.title > span { display: inline-block; }
.serif { font-family: "Instrument Serif", serif; font-style: italic; font-weight: 400; letter-spacing: 0; }
.title .serif.big { font-size: 1.75em; text-shadow: 0 2px 6px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.5); }
.redw { color: #ff3b30; }
.smallw { font-size: 0.7em; font-weight: 700; }
.markbig { background: #ff3b30; color: #fff; padding: 0 22px 6px; border-radius: 12px; font-weight: 900; font-size: 1.2em; text-shadow: none; box-shadow: 0 10px 30px rgba(255,59,48,0.35); }
.strike { position: relative; --s: 0; }
.strike::after { content: ""; position: absolute; left: -6px; right: -6px; top: 52%; height: 9px; background: #ff3b30; border-radius: 4px; transform-origin: left; transform: scaleX(var(--s)); }
.kick { position: absolute; left: 0; right: 0; text-align: center; font-weight: 800; font-size: 26px; letter-spacing: 0.22em; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
.row { position: absolute; left: 0; right: 0; display: flex; justify-content: center; gap: 30px; }
.tile { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.tbox { position: relative; background: #fff; border-radius: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 14px 36px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12); }
.badge { position: absolute; right: -14px; top: -14px; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.25); }
.badge.ok { background: #22c55e; } .badge.no { background: #ff3b30; }
.tlab { background: #fff; border-radius: 999px; padding: 7px 18px; font-weight: 800; font-size: 28px; display: flex; gap: 8px; align-items: center; box-shadow: 0 6px 18px rgba(0,0,0,0.18); white-space: nowrap; }
.num { font-size: 18px; font-weight: 900; color: #fff; background: #141414; border-radius: 8px; padding: 3px 7px; }
.card { position: absolute; background: #fff; border-radius: 34px; padding: 26px 40px 24px; box-shadow: 0 18px 50px rgba(0,0,0,0.28); display: flex; flex-direction: column; align-items: center; justify-content: center; }
.card.center { left: 130px; right: 130px; text-align: center; }
.cicon { margin-bottom: 8px; }
.kicker { font-weight: 800; font-size: 24px; letter-spacing: 0.22em; color: #6b6b6b; margin-bottom: 6px; }
.bigline { font-weight: 900; font-size: 74px; letter-spacing: -0.03em; line-height: 1.05; }
.bigline .serif { font-size: 1.3em; color: #ff3b30; font-weight: 400; }
.bigline .red { color: #ff3b30; }
.csub { font-weight: 700; font-size: 32px; color: #3a3a3a; margin-top: 6px; }
.csub .serif { font-size: 1.35em; color: #ff3b30; }
.src { margin-top: 10px; font-size: 21px; font-weight: 500; color: #8a8a8a; }
.src.abs { position: absolute; left: 0; right: 0; text-align: center; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.6); margin: 0; }
.statn { position: absolute; left: 0; right: 0; text-align: center; font-weight: 900; font-size: 150px; line-height: 1; letter-spacing: -0.05em; color: #ff3b30; text-shadow: 0 8px 30px rgba(0,0,0,0.35); }
.statn .u { font-size: 0.45em; letter-spacing: -0.02em; color: #fff; margin-left: 10px; }
.statl { position: absolute; left: 0; right: 0; text-align: center; font-weight: 800; font-size: 46px; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.45), 0 6px 22px rgba(0,0,0,0.4); }
.statl .serif { font-size: 1.4em; }
.bar { position: absolute; left: 200px; right: 230px; height: 36px; background: rgba(255,255,255,0.92); border-radius: 999px; box-shadow: 0 10px 26px rgba(0,0,0,0.25); }
.barfill { position: absolute; left: 4px; top: 4px; bottom: 4px; width: 0; background: #ff3b30; border-radius: 999px; }
.barpct { position: absolute; right: 70px; width: 150px; text-align: left; font-weight: 900; font-size: 54px; color: #fff; text-shadow: 0 4px 16px rgba(0,0,0,0.45); }
.ctabox { position: absolute; left: 100px; right: 100px; background: #fff; border-radius: 34px; padding: 24px 30px 22px; text-align: center; box-shadow: 0 18px 50px rgba(0,0,0,0.28); }
.ctaq { font-weight: 800; font-size: 54px; letter-spacing: -0.02em; }
.ctaq .serif { font-size: 1.45em; color: #ff3b30; }
.ctasub { margin-top: 4px; font-weight: 700; font-size: 30px; color: #6b6b6b; }
`;
export const CAPCSS = `
      .phrase { position: absolute; left: 0; right: 0; padding: 0 60px; display: flex; flex-wrap: nowrap; white-space: nowrap; align-items: center; justify-content: center; gap: 0 16px;
        font-family: Inter, sans-serif; font-weight: 800; line-height: 1.1; letter-spacing: -0.01em; text-align: center; }
      .w { display: inline-block; opacity: 0; transform-origin: 50% 70%; color: rgba(196, 228, 255, 0.95);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.55), 0 4px 18px rgba(0, 0, 0, 0.45); }
      .w.em { color: #ff3b30; font-weight: 900; font-size: 1.28em; margin: 0 4px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 59, 48, 0.35); }
`;
