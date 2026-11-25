#!/usr/bin/env node
// Render an animated-story episode to a 1080x1920 MP4.
//   node stories/engine/render.mjs ep01                 full render -> stories/out/ep01.mp4
//   node stories/engine/render.mjs ep01 --stills 0,5,12 QA stills -> stories/out/ep01_stills/
//   node stories/engine/render.mjs ep01 --draft         half-res, 15 fps, fast check
// Timing comes from stories/episodes/<ep>/voice.json (ElevenLabs alignment) when present,
// otherwise from a reading-speed estimate (silent preview).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { spawn, spawnSync } from "node:child_process";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ep = process.argv[2];
if (!ep) { console.error("usage: render.mjs <episode> [--stills t,t] [--draft]"); process.exit(1); }
const argv = process.argv.slice(3);
const stillsArg = argv.includes("--stills") ? argv[argv.indexOf("--stills") + 1] : null;
const draft = argv.includes("--draft");
const spec = JSON.parse(readFileSync(join(ROOT, "episodes", `${ep}.json`), "utf8"));
const epDir = join(ROOT, "episodes", ep);
const outDir = join(ROOT, "out");
mkdirSync(outDir, { recursive: true });

// ------------------------------------------------------------ words + timing
export function sceneWords(sc) {
  return sc.say.split(/\s+/).filter(Boolean).map((raw) => ({ raw, red: /\*/.test(raw), w: raw.replace(/\*/g, "") }));
}
export function fullText(spec) { return spec.scenes.map((s) => s.say.replace(/\*/g, "")).join(" "); }

function timeWords(spec) {
  const scenes = spec.scenes.map(sceneWords);
  const flat = scenes.flat();
  const vj = join(epDir, "voice.json");
  if (existsSync(vj)) {
    const al = JSON.parse(readFileSync(vj, "utf8"));
    const text = al.text, st = al.starts, en = al.ends;
    let pos = 0;
    for (const w of flat) {
      const i = text.indexOf(w.w, pos);
      if (i < 0) throw new Error(`word not found in alignment: ${w.w}`);
      w.s = st[i]; w.e = en[i + w.w.length - 1]; pos = i + w.w.length;
    }
  } else {
    let t = 0.3;
    for (const w of flat) {
      w.s = t; t += 0.07 * w.w.length + 0.09; w.e = t;
      if (/[.!?]$/.test(w.w)) t += 0.35; else if (/[,:;]$/.test(w.w)) t += 0.15;
    }
  }
  return scenes;
}

function buildTimeline(spec) {
  const sw = timeWords(spec);
  const scenes = [], chunks = [];
  let step = null;
  sw.forEach((words, i) => {
    const sc = spec.scenes[i];
    const t0 = i === 0 ? 0 : words[0].s - 0.06;
    if (sc.step) step = sc.step === "none" ? null : sc.step;
    scenes.push({ ...sc, t0, step, stepNew: !!sc.step });
    // caption chunks
    let cur = [];
    const flush = () => { if (cur.length) chunks.push({ words: cur, t0: cur[0].s - 0.04, y: sc.capY }); cur = []; };
    for (const w of words) {
      cur.push({ w: w.w.replace(/[,;:]$/, ""), red: w.red, s: w.s });
      const len = cur.reduce((a, x) => a + x.w.length, 0);
      if (/[.!?,;:]$/.test(w.w) || cur.length >= 3 || len > 16) flush();
    }
    flush();
  });
  const last = sw.flat().at(-1);
  const end = last.e + (spec.tail ?? 1.2);
  scenes.forEach((s, i) => (s.t1 = i + 1 < scenes.length ? scenes[i + 1].t0 : end));
  chunks.forEach((c, i) => (c.t1 = i + 1 < chunks.length ? Math.min(chunks[i + 1].t0, c.t0 + 2.4) : end));
  // title shows on scenes flagged title (default first scene)
  return { scenes, chunks, end, title: spec.title };
}

// ------------------------------------------------------------ page
const font = (f) => "data:font/woff2;base64," + readFileSync(join(ROOT, "fonts", f)).toString("base64");
const html = `<!doctype html><html><head><style>
@font-face{font-family:Oswald;font-weight:500;src:url(${font("oswald-500.woff2")})}
@font-face{font-family:Oswald;font-weight:700;src:url(${font("oswald-700.woff2")})}
html,body{margin:0;background:#000;width:1080px;height:1920px;overflow:hidden}
</style></head><body><svg id="s" xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"></svg>
<script>${readFileSync(join(ROOT, "engine", "lib.js"), "utf8")}</script>
<script>
let TL=null;
window.setTL=(tl)=>{TL=tl};
window.draw=(t)=>{
  const sc=TL.scenes.find(s=>t>=s.t0&&t<s.t1)||TL.scenes.at(-1);
  const lt=t-sc.t0, dur=sc.t1-sc.t0;
  let out=renderScene(sc,lt,dur);
  if(sc.stat) out+=statCard(sc.stat,lt);
  if(sc.label) out+=pillLabel(sc.label,lt,sc.labelY);
  if(sc.title || (sc===TL.scenes[0] && sc.title!==false)) out+=titleBlock(TL.title,t);
  if(sc.step) out+=badge(sc.step, sc.stepNew?lt:9);
  const ch=TL.chunks.find(c=>t>=c.t0&&t<c.t1);
  if(ch && !sc.nocap) out+=caption(ch,t-ch.t0);
  // global fade out
  const fo=clamp((TL.end-t)/0.4); if(fo<1) out+='<rect width="1080" height="1920" fill="#000" opacity="'+(1-fo)+'"/>';
  document.getElementById('s').innerHTML=out;
};
</script></body></html>`;

const tl = buildTimeline(spec);
writeFileSync(join(outDir, `${ep}.timeline.json`), JSON.stringify(tl, null, 1));
console.log(`${ep}: ${tl.scenes.length} scenes, ${tl.chunks.length} captions, ${tl.end.toFixed(1)}s${existsSync(join(epDir, "voice.json")) ? "" : " (estimated timing, no voice yet)"}`);

const scaleF = draft ? 0.5 : 1;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scaleF });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.evaluate((t) => window.setTL(t), tl);
await page.evaluate(async () => { await document.fonts.load('700 92px Oswald'); await document.fonts.load('500 50px Oswald'); window.draw(0); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 100))); _mctx = null; });

if (stillsArg) {
  const dir = join(outDir, `${ep}_stills`); mkdirSync(dir, { recursive: true });
  const times = stillsArg === "scenes" ? tl.scenes.map((s) => Math.min(s.t0 + 1.0, (s.t0 + s.t1) / 2)) : stillsArg.split(",").map(Number);
  for (const [i, t] of times.entries()) {
    await page.evaluate((t) => window.draw(t), t);
    await page.screenshot({ path: join(dir, `${String(i).padStart(2, "0")}_${t.toFixed(1)}.jpg`), type: "jpeg", quality: 80 });
  }
  console.log(`stills -> ${dir}`);
  await browser.close();
  process.exit(0);
}

const fps = draft ? 15 : 30;
const nFrames = Math.ceil(tl.end * fps);
const silent = join(outDir, `${ep}.video.mp4`);
const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
  "-c:v", "libx264", "-preset", draft ? "veryfast" : "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-vf", `scale=1080:1920`, "-r", "30", silent], { stdio: ["pipe", "inherit", "inherit"] });
const t0 = Date.now();
for (let f = 0; f < nFrames; f++) {
  await page.evaluate((t) => window.draw(t), f / fps);
  const buf = await page.screenshot({ type: "jpeg", quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 150 === 0) process.stdout.write(`\r  frame ${f}/${nFrames}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();
console.log(`\n  video done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

// ------------------------------------------------------------ audio mix
const voice = join(epDir, "voice.mp3");
const music = existsSync(join(epDir, "music.mp3")) ? join(epDir, "music.mp3") : join(ROOT, "audio", "music.mp3");
const woosh = join(ROOT, "audio", "woosh.mp3");
const pop = join(ROOT, "audio", "pop.mp3");
const final = join(outDir, `${ep}.mp4`);
const inputs = ["-i", silent];
const parts = [];
let n = 1;
if (existsSync(voice)) { inputs.push("-i", voice); parts.push(`[${n}:a]volume=1.0,adelay=0|0[v]`); n++; }
if (existsSync(music)) { inputs.push("-stream_loop", "-1", "-i", music); parts.push(`[${n}:a]volume=${spec.musicVol ?? 0.13},atrim=0:${tl.end},afade=t=out:st=${(tl.end - 1.5).toFixed(2)}:d=1.5[m]`); n++; }
const cuts = tl.scenes.slice(1).map((s) => s.t0);
if (existsSync(woosh) && cuts.length) {
  inputs.push("-i", woosh);
  parts.push(`[${n}:a]asplit=${cuts.length}${cuts.map((_, i) => `[w${i}]`).join("")}`);
  cuts.forEach((c, i) => parts.push(`[w${i}]adelay=${Math.max(0, Math.round((c - 0.12) * 1000))}:all=1,volume=0.35[wd${i}]`));
  n++;
}
const mixIn = [existsSync(voice) && "[v]", existsSync(music) && "[m]", ...(existsSync(woosh) ? cuts.map((_, i) => `[wd${i}]`) : [])].filter(Boolean);
if (mixIn.length) {
  parts.push(`${mixIn.join("")}amix=inputs=${mixIn.length}:normalize=0:duration=longest,atrim=0:${tl.end},loudnorm=I=-14:TP=-1.5:LRA=11[a]`);
  const r = spawnSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", parts.join(";"), "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", final], { stdio: "inherit" });
  if (r.status !== 0) process.exit(1);
} else {
  spawnSync("cp", [silent, final]);
}
console.log(`-> ${final}`);
