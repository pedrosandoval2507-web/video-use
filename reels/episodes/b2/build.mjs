// Batch 2 (12 takes: 4 scripts x 3 hooks). One builder for every episode; the content lives in topic-*.mjs.
// Face-safe layout: every graphic and every caption phrase is placed from the face track of the cut
// (face.json, Haar boxes grown to cover hair and chin, zoom applied), so nothing ever sits on the face.
//   node build.mjs ep05 --plan   -> writes epNN/plan.json (cut-out windows) only
//   node build.mjs ep05          -> writes epNN/final/ (HyperFrames project) + epNN/sfx.json
// Layers: base (zoomed cut) < back (graphics tucked under the chin) < presenter (AI cut-out, only in
// the back windows) < front graphics < captions.  Style: reels/EDITING-STYLE.md (ep2 recipe).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import * as H from "./lib.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const EP = process.argv[2];
const PLAN = process.argv.includes("--plan");
const TOPIC = { ep01: "A", ep02: "A", ep03: "A", ep04: "B", ep05: "B", ep06: "B", ep07: "C", ep08: "C", ep09: "C", ep10: "D", ep11: "D", ep12: "D" }[EP];
const DIR = join(ROOT, EP);
const W = 1080, H1 = 1920;
const SAFE_TOP = 235, SAFE_BOT = 1495, GAP = 26;
const probe = (f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim();
const DUR = probe(join(DIR, "source.mp4"));

// ---------- words ----------
const norm = (t) => t.toLowerCase().replace(/[.,!?…;:"]/g, "");
const WORDS = readFileSync(join(DIR, "words.tsv"), "utf8").trim().split("\n").map((l, i) => {
  const [s, e, text] = l.split("\t");
  return { i, s: +s / 1000, e: +e / 1000, text, key: norm(text) };
});
function w(word, n = 1, from = 0, end = false) {
  const k = norm(word);
  const hits = WORDS.filter((x) => x.key === k && x.s >= from);
  if (hits.length < n) throw new Error(`${EP}: word not found: ${word} #${n} after ${from}`);
  return +(end ? hits[n - 1].e : hits[n - 1].s).toFixed(3);
}
// first word of a phrase (several words in a row) after `from`
function p(phrase, from = 0, end = false) {
  const ks = phrase.split(" ").map(norm);
  for (let i = 0; i + ks.length <= WORDS.length; i++) {
    if (WORDS[i].s < from) continue;
    if (ks.every((k, j) => WORDS[i + j].key === k)) return +(end ? WORDS[i + ks.length - 1].e : WORDS[i].s).toFixed(3);
  }
  throw new Error(`${EP}: phrase not found: ${phrase} after ${from}`);
}

// ---------- content ----------
const T = await import(`./topic-${TOPIC}.mjs`);
const HOOK = T.hookEnd({ w, p, EP }); // time the body starts (first body word)
const b = (word, n = 1, end = false) => w(word, n, HOOK - 0.05, end);
const bp = (phrase, end = false) => p(phrase, HOOK - 0.05, end);
const ctx = { w, p, b, bp, HOOK, DUR, EP, ...H };
const groups = [...T.hook[EP](ctx), ...T.body(ctx)].map((g) => ({ ...g, L: g.L || "front" }));
groups.forEach((g) => { g.t0 = Math.max(0, g.t0); g.t1 = Math.min(DUR, g.t1); });

// ---------- zooms (hook push-in + punch-ins from the topic) ----------
const ZOOMS = [{ at: 0, dur: HOOK, from: 1.0, to: 1.05, push: true }, ...(T.zooms ? T.zooms(ctx) : [])];
function scaleAt(t) {
  let s = 1;
  for (const z of ZOOMS) if (t >= z.at - 0.05 && t <= z.at + z.dur + 0.3) s = Math.max(s, z.to);
  return s;
}

// ---------- face track ----------
const FJ = join(DIR, "face.json");
if (!existsSync(FJ)) execFileSync("python3", ["-I", join(ROOT, "../../scripts/facetrack.py"), join(DIR, "source.mp4"), FJ], { stdio: "inherit" });
const RAWF = JSON.parse(readFileSync(FJ, "utf8"));
// Drop false detections (hands, shadows): a box whose top/bottom is far from the median of its
// ~2 s neighbourhood is ignored; the rest is smoothed with a median of 3.
const mdn = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const KEEP = RAWF.filter((r, i) => {
  const nb = RAWF.slice(Math.max(0, i - 5), i + 6);
  const h = mdn(nb.map((q) => q.y1 - q.y0));
  return Math.abs(r.y0 - mdn(nb.map((q) => q.y0))) < 0.3 * h && Math.abs(r.y1 - mdn(nb.map((q) => q.y1))) < 0.3 * h;
});
const FACE = KEEP.map((r, i) => {
  const a = KEEP[Math.max(0, i - 1)], c = KEEP[Math.min(KEEP.length - 1, i + 1)];
  const m3 = (k) => mdn([a[k], r[k], c[k]]);
  return { t: r.t, y0: m3("y0"), y1: m3("y1"), x0: m3("x0"), x1: m3("x1") };
});
function face(t0, t1) {
  const hits = FACE.filter((r) => r.t >= t0 - 0.35 && r.t <= t1 + 0.35);
  const src = hits.length ? hits : FACE.filter((r) => Math.abs(r.t - (t0 + t1) / 2) < 2);
  const s = Math.max(scaleAt(t0), scaleAt(t1));
  const z = (y) => 768 + (y - 768) * s;
  return { top: z(Math.min(...src.map((r) => r.y0))), bottom: z(Math.max(...src.map((r) => r.y1))) };
}

// ---------- layout ----------
const boxes = []; // placed graphics {t0,t1,y0,y1}
const warn = [];
function place(g) {
  const f = face(g.t0, g.t1);
  if (g.L === "back") {
    // tucked under the chin: the cut-out's chin/neck overlaps the top edge of the card
    let y = f.bottom - (g.overlap ?? 40), s = 1;
    if (y + g.h > SAFE_BOT) s = Math.max(0.6, (SAFE_BOT - y) / g.h);
    if (y + g.h * s > SAFE_BOT) { y = SAFE_BOT - g.h * s; warn.push(`${g.id}: back card pushed up`); }
    return { y, s };
  }
  const below = [f.bottom + GAP, SAFE_BOT], above = [SAFE_TOP, f.top - GAP];
  const room = (iv) => iv[1] - iv[0];
  const CAPRES = 118; // keep room for the caption line under the graphic when possible
  const opts = [
    { y: below[0], s: Math.min(1, (room(below) - CAPRES) / g.h), w: 1.0 },
    { y: null, s: Math.min(1, room(above) / g.h), w: 0.98, above: true },
    { y: below[0], s: Math.min(1, room(below) / g.h), w: 0.8 },
  ].filter((o) => o.s > 0);
  const o = opts.sort((x, z) => z.s * z.w - x.s * x.w)[0] || { y: below[0], s: 0.3 };
  const s = o.s;
  if (o.above) return { y: above[1] - g.h * s, s, aboveHead: true };
  if (s < 0.6) warn.push(`${g.id}: scaled to ${s.toFixed(2)} (face ${f.top.toFixed(0)}-${f.bottom.toFixed(0)})`);
  return { y: o.y, s };

}
for (const g of groups) {
  Object.assign(g, place(g));
  boxes.push({ t0: g.t0, t1: g.t1, y0: g.y, y1: g.y + g.h * g.s, id: g.id });
}

// ---------- captions ----------
const EMPH = new Set(T.EMPH);
const phrases = [];
{
  const MAX_WORDS = 4, MAX_CHARS = 21, GAP_BREAK_MS = 300;
  let cur = [];
  for (const x of WORDS) {
    const prev = cur[cur.length - 1];
    const chars = cur.reduce((n, y) => n + y.text.length + 1, 0) + x.text.length;
    if (cur.length && (cur.length >= MAX_WORDS || chars > MAX_CHARS || /[.,?!]$/.test(prev.text) || (x.s - prev.e) * 1000 > GAP_BREAK_MS)) { phrases.push(cur); cur = []; }
    cur.push(x);
  }
  if (cur.length) phrases.push(cur);
}
const CAP = [];
phrases.forEach((ph, pi) => {
  const start = ph[0].s, next = phrases[pi + 1];
  const end = Math.min(next ? next[0].s : DUR, ph[ph.length - 1].e + 0.5);
  const f = face(start, end);
  let ivs = [[SAFE_TOP, SAFE_BOT]];
  const cut = (a, b) => { ivs = ivs.flatMap(([x, y]) => (b <= x || a >= y) ? [[x, y]] : [[x, a], [b, y]].filter(([u, v]) => v - u > 0)); };
  cut(f.top - GAP, f.bottom + GAP);
  for (const bx of boxes) if (bx.t0 < end && bx.t1 > start) cut(bx.y0 - 14, bx.y1 + 14);
  const P = 1250;
  let best = null;
  for (const [CH, fs] of [[100, 62], [82, 50]]) {
    for (const [a, z] of ivs) {
      if (z - a < CH) continue;
      const top = Math.min(z - CH, Math.max(a, P));
      if (!best || Math.abs(top - P) < Math.abs(best.top - P)) best = { top, CH, fs };
    }
    if (best) break;
  }
  if (!best) { warn.push(`caption "${ph.map((x) => x.text).join(" ")}" hidden at ${start.toFixed(1)}s`); return; }
  CAP.push({ pi, ph, start, end, ...best });
});

// ---------- cut-out windows ----------
const fps30 = (t) => Math.round(t * 30) / 30;
const wins = [];
for (const g of groups.filter((x) => x.L === "back").map((x) => [Math.max(0, x.t0 - 0.3), Math.min(DUR, x.t1 + 0.1)]).sort((a, c) => a[0] - c[0])) {
  const last = wins[wins.length - 1];
  if (last && g[0] <= last[1] + 0.5) last[1] = Math.max(last[1], g[1]); else wins.push([...g]);
}
const clips = wins.map(([a, e]) => [fps30(a), +(fps30(e) - fps30(a)).toFixed(3)]);
writeFileSync(join(DIR, "plan.json"), JSON.stringify({ clips, HOOK, DUR }, null, 1));
if (PLAN) { console.log(`${EP}: plan`, JSON.stringify(clips)); process.exit(0); }

// ---------- compositions ----------
function comp(id, gs) {
  let html = "", anim = "";
  gs.forEach((g, i) => {
    html += `      <div class="grp clip" id="g_${g.id}" data-start="${g.t0.toFixed(3)}" data-duration="${(g.t1 - g.t0).toFixed(3)}" data-track-index="${i}" style="top:${g.y.toFixed(0)}px;height:${g.h}px;transform:scale(${g.s.toFixed(3)})">${g.html}\n      </div>\n`;
    const shifted = g.an.map((s) => s.replace(/, (-?[0-9.]+)\);$/, (_, t) => `, ${(g.t0 + +t).toFixed(3)});`)).join("\n      ");
    anim += `      ${shifted}\n      tl.to("#g_${g.id}", { opacity: 0, duration: 0.2, ease: "power2.in" }, ${(g.t1 - 0.2).toFixed(3)});\n`;
  });
  return H.page(id, DUR, `<style>${H.CSS}</style>`, html, anim);
}
function captions() {
  let html = "", tl = "";
  for (const c of CAP) {
    html += `      <div class="phrase clip" id="p${c.pi}" data-start="${c.start.toFixed(3)}" data-duration="${Math.max(0.2, c.end - c.start).toFixed(3)}" data-track-index="0" style="top:${c.top.toFixed(0)}px;height:${c.CH}px;font-size:${c.fs}px">`;
    html += c.ph.map((x) => `<span class="w${EMPH.has(x.key) ? " em" : ""}" id="w${x.i}">${x.text.replace(/[.,;]$/, "")}</span>`).join(" ") + `</div>\n`;
    for (const x of c.ph) tl += `      tl.fromTo("#w${x.i}", { opacity: 0, scale: 0.55, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: ${EMPH.has(x.key) ? 0.22 : 0.16}, ease: "back.out(2.4)" }, ${x.s.toFixed(3)});\n`;
  }
  return H.page("captions", DUR, `<style>${H.CAPCSS}</style>`, html, tl);
}
function cam(id, bg, cl) {
  const z = ZOOMS.map((q) => q.push
    ? `tl.fromTo("#cam", { scale: ${q.from} }, { scale: ${q.to}, duration: ${q.dur.toFixed(3)}, ease: "none" }, ${q.at});
      tl.to("#cam", { scale: 1, duration: 0.3, ease: "power2.inOut" }, ${q.dur.toFixed(3)});`
    : `tl.to("#cam", { scale: ${q.to}, duration: 0.3, ease: "power3.out" }, ${q.at.toFixed(3)});
      tl.to("#cam", { scale: 1, duration: 0.3, ease: "power2.inOut" }, ${Math.min(DUR - 0.31, q.at + q.dur - 0.3).toFixed(3)});`).join("\n      ");
  const vids = cl.map(([a, d], k) => `<video id="${id}-video${k}" class="clip" data-start="${a.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="${k}" src="${id === "base" ? "source.mp4" : `presenter_${k}.mov`}" muted playsinline></video>`).join("");
  return H.page(id, DUR, `<style>
      html, body { background: ${bg}; }
      #root { overflow: hidden; }
      #cam { position: absolute; inset: 0; transform-origin: 50% 40%; }
      #cam video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    </style>`, `      <div id="cam">${vids}</div>\n`, `      tl.set("#cam", { scale: 1 }, 0);\n      ${z}\n`);
}

const F = join(DIR, "final");
rmSync(F, { recursive: true, force: true });
const C = join(F, "compositions");
mkdirSync(join(C, "fonts"), { recursive: true });
mkdirSync(join(F, "fonts"), { recursive: true });
writeFileSync(join(C, "base.html"), cam("base", "#000", [[0, DUR]]));
clips.forEach((_, k) => {
  const src = join(DIR, "cutout", `w${k}.mov`);
  if (!existsSync(src)) throw new Error(`${EP}: missing cut-out ${src} (run cutout.sh)`);
  symlinkSync(src, join(C, `presenter_${k}.mov`));
});
writeFileSync(join(C, "presenter.html"), cam("presenter", "transparent", clips.length ? clips : []));
writeFileSync(join(C, "back.html"), comp("back", groups.filter((g) => g.L === "back")));
writeFileSync(join(C, "front.html"), comp("front", groups.filter((g) => g.L === "front")));
writeFileSync(join(C, "captions.html"), captions());
const gsap = join(ROOT, "../../graphics/intro/gsap.min.js"), font = join(ROOT, "../ep2/fonts/InstrumentSerif-Italic.woff2");
for (const d of [F, C]) {
  copyFileSync(gsap, join(d, "gsap.min.js"));
  copyFileSync(font, join(d, "fonts", "InstrumentSerif-Italic.woff2"));
  if (!existsSync(join(d, "source.mp4"))) symlinkSync(join(DIR, "source.mp4"), join(d, "source.mp4"));
}
const LAYERS = ["base", "back", "presenter", "front", "captions"];
const layer = (id) => `      <div class="layer" id="l_${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="0" data-duration="${DUR}" data-track-index="${LAYERS.indexOf(id)}"></div>\n`;
writeFileSync(join(F, "index.html"), H.page("reel", DUR, `<style>
      html, body { background: #000; }
      #root { overflow: hidden; }
      .layer { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
    </style>`, LAYERS.map(layer).join(""), `      tl.set({}, {}, ${DUR});\n`, false));

// ---------- sound effects (mixed locally by mix.sh) ----------
const sfx = [["suspense-riser", 0, 0.45, HOOK], ["heartbeat", 0, 0.55, HOOK], ["impact-boom", HOOK - 0.15, 0.5, 1.8]];
for (const g of groups) for (const [n, t, v] of g.sfx || []) sfx.push([n, +(g.t0 + t).toFixed(3), v, null]);
writeFileSync(join(DIR, "sfx.json"), JSON.stringify({ HOOK, DUR, sfx }));

console.log(`${EP} (${TOPIC}): ${DUR.toFixed(2)}s, hook ${HOOK.toFixed(2)}s, ${groups.length} groups, ${CAP.length}/${phrases.length} caption phrases, cut-out ${clips.map((c) => c[1]).reduce((a, c) => a + c, 0).toFixed(1)}s`);
for (const g of groups) console.log(`  ${g.L.padEnd(5)} ${g.id.padEnd(10)} ${g.t0.toFixed(2)}→${g.t1.toFixed(2)}  y ${g.y.toFixed(0)} h ${g.h} s ${g.s.toFixed(2)}`);
for (const x of warn) console.log("  ! " + x);
