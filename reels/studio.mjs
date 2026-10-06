#!/usr/bin/env node
// Video Studio: Tella recording + HyperFrames graphics + Epidemic Sound music -> finished MP4 via FFmpeg.
//
//   node studio.mjs new <episode>     create episodes/<episode>/episode.json from the template
//   node studio.mjs build <episode>   render graphics, assemble, mix music, export to output/
//   node studio.mjs check             verify Node, FFmpeg and HyperFrames are ready

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const HF = ["--yes", "hyperframes@0.8.137"];
const NPX = process.platform === "win32" ? "npx.cmd" : "npx";
const W = 1920, H = 1080, FPS = 30;

function run(cmd, args, opts = {}) {
  console.log(`\n$ ${cmd} ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", ...opts });
  if (r.status !== 0) {
    console.error(`\n✗ ${cmd} failed (exit ${r.status}).`);
    process.exit(1);
  }
}

function probeDuration(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  const d = parseFloat(r.stdout);
  if (!Number.isFinite(d)) throw new Error(`Could not read duration of ${file}`);
  return d;
}

function hasAudio(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", file], { encoding: "utf8" });
  return r.stdout.trim().length > 0;
}

function renderGraphic(name, variables, out, format = "mp4") {
  const args = ["render", "-o", out, "--variables", JSON.stringify(variables), "--quiet"];
  if (format !== "mp4") args.push("--format", format);
  run(NPX, [...HF, ...args], { cwd: join(ROOT, "graphics", name) });
}

// Re-encode any clip to the shared spec so the segments can be joined cleanly.
const VIDEO_SPEC = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,fps=${FPS},format=yuv420p,setsar=1`;
const ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"];

function normalizeSilent(input, out) {
  const d = probeDuration(input);
  run("ffmpeg", ["-y", "-v", "error", "-i", input, "-f", "lavfi", "-t", String(d), "-i", "anullsrc=r=48000:cl=stereo",
    "-filter_complex", `[0:v]${VIDEO_SPEC}[v]`, "-map", "[v]", "-map", "1:a", ...ENC, "-shortest", out]);
}

function buildMain(ep, epDir, work) {
  const rec = resolve(epDir, ep.recording);
  if (!existsSync(rec)) throw new Error(`Recording not found: ${rec}\nExport your Tella video as MP4 and put it there.`);
  const lt = ep.lowerThird;
  const inputs = ["-i", rec];
  const audioIn = hasAudio(rec) ? "0:a" : null;
  if (!audioIn) inputs.push("-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo");
  let filter = `[0:v]${VIDEO_SPEC}[base]`;
  let vOut = "[base]";
  if (lt?.enabled) {
    // libvpx-vp9 decoder is needed to keep the WebM's alpha channel.
    inputs.push("-c:v", "libvpx-vp9", "-itsoffset", String(lt.at ?? 2), "-i", join(work, "lower-third.webm"));
    const idx = audioIn ? 1 : 2;
    filter += `;[${idx}:v]format=yuva420p[lt];[base][lt]overlay=0:0:eof_action=pass[withlt]`;
    vOut = "[withlt]";
  }
  const out = join(work, "main.mp4");
  run("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", filter, "-map", vOut, "-map", audioIn ?? "1:a",
    ...ENC, "-shortest", out]);
  return out;
}

function finalMix(segments, ep, outFile) {
  const m = ep.music ?? {};
  const musicFile = m.file ? resolve(m.dir, m.file) : null;
  const total = segments.reduce((t, s) => t + probeDuration(s), 0);
  const inputs = segments.flatMap((s) => ["-i", s]);
  const n = segments.length;
  let f = segments.map((_, i) => `[${i}:v][${i}:a]`).join("") + `concat=n=${n}:v=1:a=1[v][voice]`;

  if (musicFile) {
    if (!existsSync(musicFile)) throw new Error(`Music not found: ${musicFile}\nDownload the track from Epidemic Sound into inbox/music/.`);
    inputs.push("-stream_loop", "-1", "-i", musicFile);
    const vol = m.volume ?? 0.18;
    const fadeIn = m.fadeIn ?? 1.5, fadeOut = m.fadeOut ?? 3;
    f += `;[${n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${total.toFixed(3)},volume=${vol},` +
      `afade=t=in:d=${fadeIn},afade=t=out:st=${Math.max(0, total - fadeOut).toFixed(3)}:d=${fadeOut}[music]`;
    if (m.duck !== false) {
      // Sidechain: the voice track pushes the music down whenever you talk.
      f += `;[voice]asplit=2[voice1][key];[music][key]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=450[ducked]` +
        `;[voice1][ducked]amix=inputs=2:duration=first:normalize=0[mix]`;
    } else {
      f += `;[voice][music]amix=inputs=2:duration=first:normalize=0[mix]`;
    }
  } else {
    f += `;[voice]anull[mix]`;
  }
  // -14 LUFS is the YouTube / most-platforms loudness target.
  f += `;[mix]loudnorm=I=${ep.loudness ?? -14}:TP=-1.5:LRA=11[aout]`;

  run("ffmpeg", ["-y", "-v", "error", "-stats", ...inputs, "-filter_complex", f, "-map", "[v]", "-map", "[aout]",
    ...ENC, "-movflags", "+faststart", outFile]);
}

function build(name) {
  const epDir = join(ROOT, "episodes", name);
  const epFile = join(epDir, "episode.json");
  if (!existsSync(epFile)) throw new Error(`No episode at ${epFile}. Run: node studio.mjs new ${name}`);
  const ep = JSON.parse(readFileSync(epFile, "utf8"));
  if (ep.music) ep.music.dir = epDir;
  const accent = ep.accent ?? "#7c5cff";
  const work = join(epDir, ".work");
  mkdirSync(work, { recursive: true });

  console.log("\n▶ 1/4  Rendering HyperFrames graphics");
  const segments = [];
  if (ep.intro?.enabled !== false) {
    renderGraphic("intro", { title: ep.title, subtitle: ep.intro?.subtitle ?? "", accent }, join(work, "intro-raw.mp4"));
  }
  if (ep.outro?.enabled !== false) {
    renderGraphic("outro", { cta: ep.outro?.cta ?? "Thanks for watching", handle: ep.outro?.handle ?? "", accent }, join(work, "outro-raw.mp4"));
  }
  if (ep.lowerThird?.enabled) {
    renderGraphic("lower-third", { name: ep.lowerThird.name, role: ep.lowerThird.role ?? "", accent }, join(work, "lower-third.webm"), "webm");
  }

  console.log("\n▶ 2/4  Preparing segments");
  if (ep.intro?.enabled !== false) { normalizeSilent(join(work, "intro-raw.mp4"), join(work, "intro.mp4")); segments.push(join(work, "intro.mp4")); }
  segments.push(buildMain(ep, epDir, work));
  if (ep.outro?.enabled !== false) { normalizeSilent(join(work, "outro-raw.mp4"), join(work, "outro.mp4")); segments.push(join(work, "outro.mp4")); }

  console.log("\n▶ 3/4  Joining, mixing music, normalizing loudness");
  mkdirSync(join(ROOT, "output"), { recursive: true });
  const outFile = join(ROOT, "output", `${name}.mp4`);
  finalMix(segments, ep, outFile);

  console.log("\n▶ 4/4  Thumbnail");
  run("ffmpeg", ["-y", "-v", "error", "-ss", "2", "-i", outFile, "-frames:v", "1", join(ROOT, "output", `${name}-thumb.jpg`)]);

  console.log(`\n✓ Done: ${outFile}  (${probeDuration(outFile).toFixed(1)}s)`);
}

function create(name) {
  const epDir = join(ROOT, "episodes", name);
  if (existsSync(join(epDir, "episode.json"))) throw new Error(`Episode already exists: ${epDir}`);
  mkdirSync(epDir, { recursive: true });
  copyFileSync(join(ROOT, "episode.template.json"), join(epDir, "episode.json"));
  console.log(`✓ Created ${join(epDir, "episode.json")} — edit it, then run: node studio.mjs build ${name}`);
}

function check() {
  const ok = (label, good, hint) => console.log(`${good ? "✓" : "✗"} ${label}${good ? "" : `  →  ${hint}`}`);
  const major = Number(process.versions.node.split(".")[0]);
  ok(`Node ${process.versions.node}`, major >= 22, "Install Node 22+ from https://nodejs.org");
  const ff = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  ok("FFmpeg", ff.status === 0, "Install FFmpeg (brew install ffmpeg / winget install FFmpeg / apt install ffmpeg)");
  const vp9 = spawnSync("ffmpeg", ["-v", "error", "-decoders"], { encoding: "utf8" });
  ok("FFmpeg libvpx-vp9 decoder (lower-third transparency)", /libvpx-vp9/.test(vp9.stdout ?? ""), "Install a full FFmpeg build");
  console.log("\nRunning HyperFrames doctor…");
  spawnSync(NPX, [...HF, "doctor"], { stdio: "inherit", shell: process.platform === "win32" });
}

const [cmd, arg] = process.argv.slice(2);
try {
  if (cmd === "new" && arg) create(arg);
  else if (cmd === "build" && arg) build(arg);
  else if (cmd === "check") check();
  else console.log("Usage:\n  node studio.mjs check\n  node studio.mjs new <episode>\n  node studio.mjs build <episode>");
} catch (e) {
  console.error(`\n✗ ${e.message}`);
  process.exit(1);
}
