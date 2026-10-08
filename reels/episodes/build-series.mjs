// Series "efeito Zeigarnik" (ep3/ep4/ep5): same body take, three different hooks.
// Builds <ep>/final/: a master HyperFrames composition stacking
//   base (zoomed cut) < back graphics < presenter (AI cut-out, same zooms) < front graphics < captions
// Style: reels/EDITING-STYLE.md (approved ep2 recipe). Graphics are anchored to spoken words
// from <ep>/words.tsv, so re-cutting only needs a rebuild.
// usage: node build-series.mjs ep3|ep4|ep5
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = dirname(fileURLToPath(import.meta.url));
const EP = process.argv[2];
const DIR = join(ROOT, EP);
const W = 1080, H = 1920;
const DUR = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", join(DIR, "source.mp4")]).toString().trim();
const HOOK = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", join(ROOT, "parts", `hook_${EP}.mov`)]).toString().trim();

// ---------- words ----------
const WORDS = readFileSync(join(DIR, "words.tsv"), "utf8").trim().split("\n").map((l, i) => {
  const [s, e, text] = l.split("\t");
  return { i, s: +s / 1000, e: +e / 1000, text, key: text.toLowerCase().replace(/[.,!?…]/g, "") };
});
// Time of the n-th occurrence of a word (after `from` seconds).
function w(word, n = 1, from = 0, end = false) {
  const k = word.toLowerCase().replace(/[.,!?…]/g, "");
  const hits = WORDS.filter((x) => x.key === k && x.s >= from);
  if (hits.length < n) throw new Error(`word not found: ${word} #${n} after ${from}`);
  return +(end ? hits[n - 1].e : hits[n - 1].s).toFixed(3);
}
const b = (word, n = 1, end = false) => w(word, n, HOOK - 0.05, end); // inside the body

// ---------- icons (viewBox 0 0 100 100, line style) ----------
const S = `fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;
const ICON = {
  briefcase: `<rect ${S} x="12" y="32" width="76" height="52" rx="9"/><path ${S} d="M37 32v-9h26v9M12 54h76"/>`,
  cap: `<path ${S} d="M8 40 50 22 92 40 50 58Z"/><path ${S} d="M27 49v16c14 10 32 10 46 0V49"/><path ${S} d="M92 40v20"/>`,
  camera: `<rect ${S} x="10" y="30" width="58" height="44" rx="9"/><path ${S} d="M68 46 90 34v36L68 58"/>`,
  plus: `<path ${S} d="M50 20v60M20 50h60"/>`,
  battery: `<rect ${S} x="10" y="30" width="72" height="40" rx="8"/><path ${S} d="M90 42v16"/><rect x="19" y="39" width="12" height="22" rx="3" fill="#ff3b30"/>`,
  doc: `<path ${S} d="M24 10h36l18 18v62H24Z"/><path ${S} d="M60 10v18h18M36 50h28M36 64h28M36 78h18"/>`,
  alarm: `<circle ${S} cx="50" cy="54" r="30"/><path ${S} d="M50 38v17l11 8M18 22l12-10M82 22 70 12M30 84l-6 8M70 84l6 8"/>`,
  bell: `<path ${S} d="M26 70V46a24 24 0 0 1 48 0v24l8 8H18Z"/><path ${S} d="M42 86a8 8 0 0 0 16 0"/>`,
  flask: `<path ${S} d="M38 10h24M42 10v28L18 82a6 6 0 0 0 5 9h54a6 6 0 0 0 5-9L58 38V10"/><path ${S} d="M28 64h44"/>`,
  lock: `<rect ${S} x="20" y="44" width="60" height="44" rx="9"/><path ${S} d="M32 44V32a18 18 0 0 1 36 0v12"/><path ${S} d="M50 62v10"/>`,
  person: `<circle ${S} cx="50" cy="32" r="16"/><path ${S} d="M18 90c0-20 14-34 32-34s32 14 32 34"/>`,
  brain: `<path ${S} d="M48 18c-8-6-22-2-22 10-10 2-14 14-8 22-6 8-2 20 8 22 0 10 12 16 22 10V18Z"/><path ${S} d="M52 18c8-6 22-2 22 10 10 2 14 14 8 22 6 8 2 20-8 22 0 10-12 16-22 10V18Z"/>`,
  arrow: `<path ${S} d="M12 50h70M64 30l20 20-20 20"/>`,
  check: `<path fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" d="M28 52l15 15 30-32"/>`,
  cross: `<path fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" d="M33 33l34 34M67 33 33 67"/>`,
};
const svg = (name, size, color = "#141414") => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="color:${color}">${ICON[name]}</svg>`;
const tile = (id, icon, num, label, x, y, size = 110, color) => `
  <div class="tile" id="${id}" style="left:${x}px;top:${y}px">
    <div class="tbox" style="width:${size + 50}px;height:${size + 50}px">${svg(icon, size, color)}</div>
    ${label ? `<div class="tlab"><span class="num">${num}</span>${label}</div>` : ""}
  </div>`;
const pop = (sel, t) => `tl.fromTo("${sel}", { opacity: 0, scale: 0.4, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "back.out(2.2)" }, ${t});`;
const rise = (sel, t, d = 0.35) => `tl.fromTo("${sel}", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: ${d}, ease: "power3.out" }, ${t});`;
const strike = (sel, t) => `tl.fromTo("${sel}", { "--s": 0 }, { "--s": 1, duration: 0.35, ease: "power2.out" }, ${t});`;
const ring = (sel, t, dur) => `tl.to("${sel}", { rotate: 9, duration: 0.07, yoyo: true, repeat: ${Math.max(1, Math.round(dur / 0.07) | 1)}, ease: "sine.inOut" }, ${t});`;
const fill = (sel, t, to = 50) => `tl.fromTo("${sel}", { width: "0%" }, { width: "${to}%", duration: 0.7, ease: "power2.out" }, ${t});`;

// Chest zone (front layer, between chin ~37% and captions ~56%): y 760-1060.
// Beside the head (back layer): x 20-250 / 830-1060, y 300-700. Above the head: only y 235-300.
const CHEST = 790;

// ---------- hooks ----------
const HOOKS = {
  ep3: () => [
    ["front", "h1", 0.0, HOOK, `
      <div class="title" style="top:${CHEST}px"><span id="a1">sobrecarregado de</span> <span class="strike" id="a2">trabalho</span></div>
      <div class="title" style="top:${CHEST + 100}px"><span id="a3">de coisas</span> <span class="serif big" id="a4">pela metade</span></div>
      <div class="bar" id="bar" style="top:${CHEST + 235}px"><div class="barfill" id="bf"></div><span class="barpct" id="bp">50%</span></div>`,
      [rise("#a1", w("sobrecarregado") - 0.05), rise("#a2", w("trabalho.") - 0.1), strike("#a2", w("tá", 2) + 0.05),
       rise("#a3", w("coisas")), `tl.fromTo("#a4", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ${w("começou,")});`,
       rise("#bar", w("mas") - 0.05, 0.25), fill("#bf", w("mas")), rise("#bp", w("terminou."), 0.25)]],
  ],
  ep4: () => [
    ["back", "h0", w("científico") - 0.1, HOOK - w("científico") + 0.1, tile("t_fl", "flask", "", "ciência", 840, 330, 100),
      [pop("#t_fl", 0.0)]],
    ["front", "h1", 0.0, HOOK, `
      <div class="title" style="top:${CHEST}px"><span id="a1">um motivo</span> <span class="serif big" id="a2">científico</span></div>
      <div class="title" style="top:${CHEST + 130}px"><span id="a3">não é</span> <span class="strike" id="a4">preguiça</span></div>`,
      [rise("#a1", w("motivo") - 0.1), `tl.fromTo("#a2", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ${w("científico")});`,
       rise("#a3", w("não", 2)), rise("#a4", w("preguiça.") - 0.15), strike("#a4", w("preguiça.") + 0.35)]],
  ],
  ep5: () => [
    ["back", "h0", w("travando") - 0.15, HOOK - w("travando") + 0.15, tile("t_lk", "lock", "", "travado", 840, 330, 100),
      [pop("#t_lk", 0.0), `tl.to("#t_lk", { x: 8, duration: 0.05, yoyo: true, repeat: 5 }, 0.45);`]],
    ["front", "h1", 0.0, HOOK, `
      <div class="title" style="top:${CHEST}px"><span id="a1">seu cérebro odeia</span></div>
      <div class="title" style="top:${CHEST + 95}px"><span id="a2">coisas</span> <span class="serif big" id="a3">pela metade</span></div>
      <div class="bar" id="bar" style="top:${CHEST + 235}px"><div class="barfill" id="bf"></div><span class="barpct" id="bp">50%</span></div>`,
      [rise("#a1", w("cérebro") - 0.15), rise("#a2", w("coisas")), `tl.fromTo("#a3", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ${w("pela")});`,
       rise("#bar", w("metade.") + 0.1, 0.25), fill("#bf", w("metade.") + 0.15), rise("#bp", w("metade.") + 0.6, 0.25)]],
  ],
};

// ---------- body (shared) ----------
function body() {
  const G = [];
  // 1. my own routine
  G.push(["front", "rot", b("olhando") - 0.1, b("Tinha") - b("olhando") - 0.05, `
    <div class="title" style="top:${CHEST + 20}px"><span id="r1">a minha própria</span> <span class="serif big" id="r2">rotina</span></div>`,
    [rise("#r1", 0), `tl.fromTo("#r2", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ${(b("rotina,") - b("olhando") + 0.1).toFixed(2)});`]]);
  // 2. everything at once: icon row that builds up
  {
    const t0 = b("Tinha") - 0.05, t1 = b("dias") - 0.35;
    const xs = [70, 320, 570, 820];
    G.push(["front", "jug", t0, t1 - t0, `
      ${tile("t1", "briefcase", "01", "trabalho", xs[0], CHEST - 10, 96)}
      ${tile("t2", "cap", "02", "faculdade", xs[1], CHEST - 10, 96)}
      ${tile("t3", "camera", "03", "conteúdo", xs[2], CHEST - 10, 96)}
      ${tile("t4", "plus", "", "outras coisas", xs[3], CHEST - 10, 96)}`,
      [pop("#t1", b("trabalho") - t0), pop("#t2", b("faculdade,") - t0), pop("#t3", b("conteúdo") - t0), pop("#t4", b("outras") - t0)]]);
  }
  // 3. exhausted
  {
    const t0 = b("terminava") - 0.05, t1 = b("Mas") - 0.1;
    G.push(["front", "exa", t0, t1 - t0, `
      <div class="title" style="top:${CHEST - 20}px"><span class="serif huge" id="e1">exausto</span> <span id="e2" class="inl">${svg("battery", 110)}</span></div>
      <div class="title sm" style="top:${CHEST + 150}px"><span id="e3">sem fazer quase</span> <span class="markbig small" id="e4">nada</span></div>`,
      [`tl.fromTo("#e1", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ${(b("exausto") - t0).toFixed(2)});`,
       pop("#e2", b("exausto") - t0 + 0.3), rise("#e3", b("sem") - t0), pop("#e4", b("nada.") - t0)]]);
  }
  // 4. the why + the study
  {
    const t0 = b("entendi") - 0.1, t1 = b("chamado") - 0.35;
    G.push(["back", "why_t", b("estudo") - 0.1, t1 - b("estudo") + 0.1, tile("t_doc", "doc", "", "o estudo", 840, 330, 100), [pop("#t_doc", 0)]]);
    G.push(["front", "why", t0, t1 - t0, `
      <div class="title" style="top:${CHEST + 20}px"><span id="y1">aí eu entendi o</span> <span class="serif big" id="y2">porquê</span></div>`,
      [rise("#y1", 0), `tl.fromTo("#y2", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ${(b("porquê") - t0).toFixed(2)});`]]);
  }
  // 5. Zeigarnik card
  {
    const t0 = b("efeito") - 0.1, t1 = b("Porque", 1) - 0.1;
    G.push(["front", "zei", t0, t1 - t0, `
      <div class="card center" id="zc" style="top:${CHEST - 20}px">
        <div class="kicker">EFEITO</div>
        <div class="bigserif" id="zn">Zeigarnik</div>
        <div class="src">Bluma Zeigarnik · psicóloga, 1927</div>
      </div>`,
      [rise("#zc", 0, 0.4), `tl.fromTo("#zn", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, ${(b("Zeigarnik.") - t0).toFixed(2)});`]]);
  }
  // 6-7. unfinished task = alarm that keeps ringing
  {
    const ta = b("alarme.") - 0.1, tEnd = b("uma") - 0.25;
    G.push(["back", "alarm", ta, tEnd - ta, tile("t_al", "alarm", "", "alarme", 840, 330, 100, "#ff3b30"),
      [pop("#t_al", 0), ring("#t_al .tbox", 0.4, 1.2), ring("#t_al .tbox", b("esquecer") - ta, 0.8), ring("#t_al .tbox", b("momento") - ta, 0.8)]]);
    const t0 = b("tarefa") - 0.1, t1 = b("esquecer") - 0.15;
    G.push(["front", "inac", t0, t1 - t0, `
      <div class="title" style="top:${CHEST + 20}px"><span id="i1">tarefa</span> <span class="serif big" id="i2">inacabada</span></div>`,
      [rise("#i1", 0), `tl.fromTo("#i2", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ${(b("inacabada") - t0).toFixed(2)});`]]);
    const t2 = t1, t3 = b("relembrando") - 0.1;
    G.push(["front", "esq", t2, t3 - t2, `
      <div class="title" style="top:${CHEST + 20}px"><span id="q1">não te deixa</span> <span class="serif big" id="q2">esquecer</span></div>`,
      [rise("#q1", 0.05), `tl.fromTo("#q2", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 0.15);`]]);
    G.push(["front", "mom", t3, tEnd - t3, `
      <div class="title" style="top:${CHEST - 10}px"><span id="m1">a cada</span> <span class="serif big" id="m2">momento</span></div>
      <div class="row" style="top:${CHEST + 140}px">${[0, 1, 2].map((k) => `<div class="tbox sm" id="bl${k}">${svg("bell", 70)}</div>`).join("")}</div>`,
      [rise("#m1", b("cada") - t3), `tl.fromTo("#m2", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, ${(b("momento") - t3).toFixed(2)});`,
       pop("#bl0", b("cada") - t3 + 0.1), pop("#bl1", b("momento") - t3 + 0.1), pop("#bl2", b("passa.") - t3)]]);
  }
  // 8. Sophie Leroy
  {
    const t0 = b("pesquisadora") - 0.1, t1 = b("Porque", 3) - 0.1;
    G.push(["front", "leroy", t0, t1 - t0, `
      <div class="card" id="lc" style="top:${CHEST - 20}px;left:90px;right:90px">
        <div class="srow"><div class="tbox sm">${svg("person", 80)}</div>
          <div><div class="kicker">PESQUISADORA</div><div class="nm">Sophie <span class="serif">Leroy</span></div></div>
          <span class="pill red" id="pio">piora ↑</span></div>
        <div class="src">Organizational Behavior and Human Decision Processes, 2009</div>
      </div>`,
      [rise("#lc", 0, 0.4), pop("#pio", b("piora") - t0)]]);
  }
  // 9. switching tasks leaves part of the brain behind
  {
    const t0 = b("troca") - 0.15, t1 = b("ela") - 0.2;
    G.push(["front", "swi", t0, t1 - t0, `
      <div class="row" style="top:${CHEST - 20}px;align-items:center">
        <div class="tile st" id="ta">${`<div class="tbox" style="width:150px;height:150px">${svg("doc", 96)}</div><div class="tlab">tarefa A</div>`}</div>
        <div id="ar">${svg("arrow", 110)}</div>
        <div class="tile st" id="tb">${`<div class="tbox" style="width:150px;height:150px">${svg("doc", 96)}</div><div class="tlab">tarefa B</div>`}</div>
      </div>
      <div class="pill red" id="still" style="top:${CHEST + 215}px;left:110px">${svg("brain", 44, "#fff")} ainda lá</div>`,
      [pop("#ta", 0), rise("#ar", b("tarefa", 2) - t0 - 0.15, 0.3), pop("#tb", b("tarefa", 2) - t0),
       pop("#still", b("relembrando", 2) - t0), `tl.to("#ta", { opacity: 0.45, duration: 0.3 }, ${(b("parte") - t0).toFixed(2)});`]]);
  }
  // 10. attention residue
  {
    const t0 = b("chamou") - 0.1, t1 = b("Então") - 0.1;
    G.push(["front", "res", t0, t1 - t0, `
      <div class="card center" id="rc" style="top:${CHEST - 20}px">
        <div class="kicker">ELA CHAMOU DE</div>
        <div class="bigline">resíduo de <span class="serif">atenção</span></div>
      </div>`,
      [rise("#rc", 0, 0.4)]]);
  }
  // 11. join the two
  {
    const t0 = b("junta") - 0.1, t1 = b("lado") - 0.4;
    G.push(["front", "join", t0, t1 - t0, `
      <div class="row" style="top:${CHEST + 10}px;align-items:center">
        <div class="pill2" id="p1">efeito <span class="serif">Zeigarnik</span></div>
        <div class="plus" id="pp">+</div>
        <div class="pill2" id="p2">resíduo de <span class="serif">atenção</span></div>
      </div>`,
      [pop("#p1", 0.05), pop("#pp", b("duas") - t0), pop("#p2", b("duas") - t0 + 0.15)]]);
  }
  // 12. ten projects = ten alarms ringing
  {
    const t0 = b("10") - 0.15, t1 = b("nunca") - 0.3;
    const icons = Array.from({ length: 10 }, (_, k) => `<div class="tbox xs" id="al${k}">${svg("alarm", 54, k < 10 ? "#ff3b30" : "#141414")}</div>`).join("");
    G.push(["front", "ten", t0, t1 - t0, `
      <div class="title sm" style="top:${CHEST - 25}px"><span class="bignum2" id="n10">10</span> <span id="tx">projetos começados</span></div>
      <div class="grid" style="top:${CHEST + 105}px">${icons}</div>`,
      [rise("#n10", 0, 0.3), rise("#tx", 0.2), ...Array.from({ length: 10 }, (_, k) => pop(`#al${k}`, (b("projetos") - t0 + k * 0.08).toFixed(2))),
       `tl.call(() => { document.getElementById("tx").textContent = "alarmes tocando"; }, null, ${(b("alarmes") - t0).toFixed(2)});`,
       ...Array.from({ length: 10 }, (_, k) => ring(`#al${k}`, (b("alarmes") - t0 + (k % 3) * 0.04).toFixed(2), 1.3))]]);
  }
  // 13. CTA
  {
    const t0 = b("nunca") - 0.25;
    G.push(["front", "cta", t0, DUR - t0, `
      <div class="ctabox" id="cta" style="top:${CHEST - 20}px">
        <div class="ctaq">você nunca tá <span class="serif">inteiro</span></div>
        <div class="ctasub">quantos alarmes tão tocando aí? comenta 👇</div>
      </div>`,
      [rise("#cta", 0, 0.4)]]);
  }
  return G;
}

const CSS = `
@font-face { font-family: "Instrument Serif"; font-style: italic; src: url("fonts/InstrumentSerif-Italic.woff2") format("woff2"); }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: transparent; }
#root { position: relative; width: 100%; height: 100%; font-family: Inter, sans-serif; color: #141414; }
.grp { position: absolute; inset: 0; }
.title { position: absolute; left: 0; right: 0; text-align: center; font-weight: 800; font-size: 66px; letter-spacing: -0.02em; line-height: 1.1; color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.45), 0 6px 26px rgba(0,0,0,0.4); }
.title.sm { font-size: 54px; }
.title > span { display: inline-block; vertical-align: middle; }
.serif { font-family: "Instrument Serif", serif; font-style: italic; font-weight: 400; letter-spacing: 0; }
.title .serif { text-shadow: 0 2px 6px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.5); }
.title .serif.big { font-size: 112px; }
.title .serif.huge { font-size: 170px; line-height: 0.9; }
.inl svg { background: #fff; border-radius: 26px; padding: 14px; box-shadow: 0 12px 30px rgba(0,0,0,0.25); }
.markbig { display: inline-block; background: #ff3b30; color: #fff; padding: 2px 26px 8px; border-radius: 10px; font-weight: 900; font-size: 88px; letter-spacing: -0.02em; text-shadow: none;
  box-shadow: 0 10px 30px rgba(255,59,48,0.35); }
.markbig.small { font-size: 60px; padding: 0 16px 4px; }
.strike { position: relative; --s: 0; }
.strike::after { content: ""; position: absolute; left: -6px; right: -6px; top: 54%; height: 9px; background: #ff3b30; border-radius: 4px; transform-origin: left; transform: scaleX(var(--s)); }
.row { position: absolute; left: 0; right: 0; display: flex; justify-content: center; gap: 26px; }
.tile { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.tile.st { position: relative; }
.tbox { background: #fff; border-radius: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 14px 36px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12); }
.tbox.sm { width: 110px; height: 110px; border-radius: 28px; flex-shrink: 0; }
.tbox.xs { width: 84px; height: 84px; border-radius: 22px; }
.tlab { background: #fff; border-radius: 999px; padding: 7px 16px; font-weight: 800; font-size: 28px; display: flex; gap: 8px; align-items: center; box-shadow: 0 6px 18px rgba(0,0,0,0.18); white-space: nowrap; }
.num { font-size: 18px; font-weight: 900; color: #fff; background: #141414; border-radius: 8px; padding: 3px 7px; }
.num:empty { display: none; }
.card { position: absolute; background: #fff; border-radius: 34px; padding: 30px 40px 28px; box-shadow: 0 18px 50px rgba(0,0,0,0.28); }
.card.center { left: 140px; right: 140px; text-align: center; }
.kicker { font-weight: 800; font-size: 24px; letter-spacing: 0.22em; color: #6b6b6b; margin-bottom: 6px; }
.bigserif { font-family: "Instrument Serif", serif; font-style: italic; font-size: 150px; line-height: 0.95; color: #141414; }
.bigline { font-weight: 800; font-size: 64px; letter-spacing: -0.02em; }
.bigline .serif { font-size: 92px; color: #ff3b30; }
.src { margin-top: 10px; font-size: 22px; font-weight: 500; color: #8a8a8a; }
.srow { display: flex; align-items: center; gap: 26px; }
.nm { font-weight: 800; font-size: 58px; letter-spacing: -0.02em; }
.nm .serif { font-size: 76px; }
.pill { display: inline-flex; align-items: center; gap: 10px; border-radius: 999px; padding: 10px 26px; font-weight: 900; font-size: 34px; color: #fff; background: #ff3b30;
  box-shadow: 0 10px 26px rgba(255,59,48,0.35); white-space: nowrap; }
#still { position: absolute; }
#lc .pill { margin-left: auto; }
.pill2 { background: #fff; border-radius: 999px; padding: 14px 30px; font-weight: 800; font-size: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.22); white-space: nowrap; }
.pill2 .serif { font-size: 54px; color: #ff3b30; }
.plus { font-weight: 900; font-size: 80px; color: #fff; text-shadow: 0 4px 18px rgba(0,0,0,0.4); }
.grid { position: absolute; left: 0; right: 0; display: grid; grid-template-columns: repeat(5, 84px); gap: 18px; justify-content: center; }
.bignum2 { font-weight: 900; font-size: 120px; color: #ff3b30; letter-spacing: -0.04em; text-shadow: 0 6px 24px rgba(0,0,0,0.3); }
.bar { position: absolute; left: 240px; right: 240px; height: 34px; background: rgba(255,255,255,0.9); border-radius: 999px; box-shadow: 0 10px 26px rgba(0,0,0,0.25); }
.barfill { position: absolute; left: 4px; top: 4px; bottom: 4px; width: 0; background: #ff3b30; border-radius: 999px; }
.barpct { position: absolute; right: -110px; top: -12px; font-weight: 900; font-size: 44px; color: #fff; text-shadow: 0 4px 16px rgba(0,0,0,0.4); }
.ctabox { position: absolute; left: 100px; right: 100px; background: #fff; border-radius: 34px; padding: 22px 30px 20px; text-align: center; box-shadow: 0 18px 50px rgba(0,0,0,0.28); }
.ctaq { font-weight: 800; font-size: 56px; letter-spacing: -0.02em; }
.ctaq .serif { font-size: 80px; color: #ff3b30; }
.ctasub { margin-top: 4px; font-weight: 700; font-size: 30px; color: #6b6b6b; }
`;

function comp(id, groups) {
  let html = "", anim = "";
  groups.forEach(([, gid, at, dur, body, an], i) => {
    html += `      <div class="grp clip" id="g_${gid}" data-start="${at.toFixed(3)}" data-duration="${dur.toFixed(3)}" data-track-index="${i}">${body}\n      </div>\n`;
    const shifted = an.map((s) => s.replace(/, ([0-9.]+)\);$/, (_, t) => `, ${(at + +t).toFixed(3)});`)).join("\n      ");
    anim += `      ${shifted}\n      tl.to("#g_${gid}", { opacity: 0, duration: 0.2, ease: "power2.in" }, ${(at + dur - 0.2).toFixed(3)});\n`;
  });
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="gsap.min.js"></script>
    <style>${CSS}</style>
  </head>
  <body>
    <div id="root" data-composition-id="${id}" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
${html}    </div>
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

// ---------- captions (light blue, phrase by phrase, red emphasis) ----------
const EMPH = new Set(["sobrecarregado", "terminou", "científico", "preguiça", "metade", "travando", "honesto", "exausto", "porquê",
  "zeigarnik", "inacabada", "alarme", "esquecer", "piora", "anterior", "resíduo", "atenção", "alarmes", "inteiro"]);
function captions() {
  const CW = 1080, CH = 440, MAX_WORDS = 4, MAX_CHARS = 22, GAP_BREAK_MS = 300;
  const phrases = [];
  let cur = [];
  for (const x of WORDS) {
    const prev = cur[cur.length - 1];
    const chars = cur.reduce((n, y) => n + y.text.length + 1, 0) + x.text.length;
    if (cur.length && (cur.length >= MAX_WORDS || chars > MAX_CHARS || /[.,?!]$/.test(prev.text) || (x.s - prev.e) * 1000 > GAP_BREAK_MS || (prev.s < HOOK && x.s >= HOOK - 0.02))) {
      phrases.push(cur); cur = [];
    }
    cur.push(x);
  }
  if (cur.length) phrases.push(cur);
  let html = "", tl = "";
  phrases.forEach((p, pi) => {
    const start = p[0].s, next = phrases[pi + 1];
    const end = Math.min(next ? next[0].s : DUR, p[p.length - 1].e + 0.5);
    html += `      <div class="phrase clip" id="p${pi}" data-start="${start.toFixed(3)}" data-duration="${Math.max(0.2, end - start).toFixed(3)}" data-track-index="0">`;
    html += p.map((x) => `<span class="w${EMPH.has(x.key) ? " em" : ""}" id="w${x.i}">${x.text.replace(/[.,;]$/, "")}</span>`).join(" ") + `</div>\n`;
    for (const x of p) tl += `      tl.fromTo("#w${x.i}", { opacity: 0, scale: 0.55, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: ${EMPH.has(x.key) ? 0.22 : 0.16}, ease: "back.out(2.4)" }, ${x.s.toFixed(3)});\n`;
  });
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${CW}, height=${CH}" />
    <script src="gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${CW}px; height: ${CH}px; overflow: hidden; background: transparent; }
      #root { position: relative; width: 100%; height: 100%; }
      .phrase { position: absolute; inset: 0; padding: 0 70px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0 18px;
        font-family: Inter, sans-serif; font-weight: 800; font-size: 62px; line-height: 1.15; letter-spacing: -0.01em; text-align: center; }
      .w { display: inline-block; opacity: 0; transform-origin: 50% 70%; color: rgba(196, 228, 255, 0.95);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.55), 0 4px 18px rgba(0, 0, 0, 0.45); }
      .w.em { color: #ff3b30; font-weight: 900; font-size: 80px; margin: 0 4px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 59, 48, 0.35); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="captions" data-start="0" data-duration="${DUR}" data-width="${CW}" data-height="${CH}">
${html}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${tl}      window.__timelines = window.__timelines || {};
      window.__timelines["captions"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
}

// ---------- base + presenter with the same (small) zooms ----------
const ZOOMS = [
  { at: 0, dur: HOOK, from: 1.0, to: 1.07, push: true },
  { at: b("Zeigarnik.") - 0.1, dur: 1.6, to: 1.08 },
  { at: b("resíduo") - 0.1, dur: 1.8, to: 1.08 },
  { at: b("inteiro") - 0.3, dur: DUR - b("inteiro") + 0.3, to: 1.06 },
];
function cam(id, src, bg, clips = [[0, DUR]]) {
  const z = ZOOMS.map((q) => q.push
    ? `tl.fromTo("#cam", { scale: ${q.from} }, { scale: ${q.to}, duration: ${q.dur.toFixed(3)}, ease: "none" }, ${q.at});
      tl.to("#cam", { scale: 1, duration: 0.3, ease: "power2.inOut" }, ${q.dur.toFixed(3)});`
    : `tl.to("#cam", { scale: ${q.to}, duration: 0.3, ease: "power3.out" }, ${q.at.toFixed(3)});
      tl.to("#cam", { scale: 1, duration: 0.3, ease: "power2.inOut" }, ${Math.min(DUR - 0.31, q.at + q.dur - 0.3).toFixed(3)});`).join("\n      ");
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${bg}; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; }
      #cam { position: absolute; inset: 0; transform-origin: 50% 40%; }
      #cam video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="${id}" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="cam">${clips.map(([a, d], k) => `<video id="${id}-video${k}" class="clip" data-start="${a.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="${k}" src="${clips.length > 1 ? `${id}_${k}.mov` : src}" muted playsinline></video>`).join("")}</div>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.set("#cam", { scale: 1 }, 0);
      ${z}
      window.__timelines = window.__timelines || {};
      window.__timelines["${id}"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
}

// ---------- write final/ ----------
const groups = [...HOOKS[EP](), ...body()];
const F = join(DIR, "final");
rmSync(F, { recursive: true, force: true });
mkdirSync(join(F, "compositions", "fonts"), { recursive: true });
mkdirSync(join(F, "fonts"), { recursive: true });
const C = join(F, "compositions");
writeFileSync(join(C, "base.html"), cam("base", "source.mp4", "#000"));
// The cut-out only matters where a graphic sits behind the person (front graphics are drawn over it anyway),
// so the presenter layer is limited to those windows: rendering extracts every frame of it as PNG.
const wins = [];
for (const g of groups.filter((x) => x[0] === "back").map((x) => [Math.max(0, x[2] - 0.3), Math.min(DUR, x[2] + x[3] + 0.1)]).sort((p, q) => p[0] - q[0])) {
  const last = wins[wins.length - 1];
  if (last && g[0] <= last[1]) last[1] = Math.max(last[1], g[1]); else wins.push([...g]);
}
const fps30 = (t) => Math.round(t * 30) / 30;
const clips = wins.map(([a, e]) => [fps30(a), fps30(e) - fps30(a)]);
clips.forEach(([a, d], k) => execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", a.toFixed(3), "-i", join(DIR, "cutout", "presenter.mov"), "-t", d.toFixed(3),
  "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", join(C, `presenter_${k}.mov`)]));
writeFileSync(join(C, "presenter.html"), cam("presenter", "presenter.mov", "transparent", clips.length ? clips : [[0, 0.5]]));
writeFileSync(join(C, "back.html"), comp("back", groups.filter((g) => g[0] === "back")));
writeFileSync(join(C, "front.html"), comp("front", groups.filter((g) => g[0] === "front")));
writeFileSync(join(C, "captions.html"), captions());
const gsap = join(ROOT, "../graphics/intro/gsap.min.js"), font = join(ROOT, "ep2/fonts/InstrumentSerif-Italic.woff2");
for (const d of [F, C]) {
  copyFileSync(gsap, join(d, "gsap.min.js"));
  copyFileSync(font, join(d, "fonts", "InstrumentSerif-Italic.woff2"));
  for (const [name, target] of [["source.mp4", join(DIR, "source.mp4")], ["presenter.mov", join(DIR, "cutout", "presenter.mov")]]) {
    if (existsSync(join(d, name))) rmSync(join(d, name));
    symlinkSync(target, join(d, name));
  }
}
const layer = (id, src, extra = "") => `      <div class="layer" id="l_${id}" data-composition-id="${id}" data-composition-src="compositions/${src}.html" data-start="0" data-duration="${DUR}" data-track-index="${["base", "back", "presenter", "front", "captions"].indexOf(id)}"${extra}></div>\n`;
writeFileSync(join(F, "index.html"), `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; }
      .layer { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
      #l_captions { top: 1075px; height: 440px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="reel" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920">
${layer("base", "base")}${layer("back", "back")}${layer("presenter", "presenter")}${layer("front", "front")}${layer("captions", "captions", ' data-track-kind="captions"')}    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.set({}, {}, ${DUR});
      window.__timelines = window.__timelines || {};
      window.__timelines["reel"] = tl;
    </script>
  </body>
</html>
`);
console.log(`${EP}: ${DUR.toFixed(2)}s (hook ${HOOK.toFixed(2)}s), ${groups.length} graphic groups`);
for (const g of groups) console.log(`  ${g[0].padEnd(5)} ${g[1].padEnd(8)} ${g[2].toFixed(2)} → ${(g[2] + g[3]).toFixed(2)}`);
