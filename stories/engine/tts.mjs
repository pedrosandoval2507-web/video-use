#!/usr/bin/env node
// Narration + sound assets via ElevenLabs.
//   node stories/engine/tts.mjs voices              list voices on the account
//   node stories/engine/tts.mjs ep01 [ep02 ...]     narrate episodes -> episodes/<ep>/voice.mp3 + voice.json
//   node stories/engine/tts.mjs sfx                 woosh + background music -> stories/audio/
// Key: ELEVENLABS_API_KEY from the environment or the repo's .env.
// Voice: ELEVEN_VOICE_ID (default below), model: ELEVEN_MODEL (default eleven_multilingual_v2).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = resolve(ROOT, "..");
function key() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  for (const f of [join(REPO, ".env"), join(ROOT, ".env")]) if (existsSync(f)) {
    const m = readFileSync(f, "utf8").match(/^\s*ELEVENLABS_API_KEY\s*=\s*"?([^"\n]+)"?/m);
    if (m) return m[1].trim();
  }
  console.error("ELEVENLABS_API_KEY not set (env or .env)"); process.exit(1);
}
const API = "https://api.elevenlabs.io";
const H = () => ({ "xi-api-key": key(), "Content-Type": "application/json" });
const VOICE = process.env.ELEVEN_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
const MODEL = process.env.ELEVEN_MODEL || "eleven_multilingual_v2";

async function call(path, body, raw = false) {
  for (let a = 0; a < 4; a++) {
    const r = await fetch(API + path, { method: body ? "POST" : "GET", headers: H(), body: body && JSON.stringify(body) });
    if (r.ok) return raw ? Buffer.from(await r.arrayBuffer()) : r.json();
    const txt = await r.text();
    if (r.status < 500 && r.status !== 429) throw new Error(`${r.status} ${txt.slice(0, 300)}`);
    await new Promise((res) => setTimeout(res, 2000 * (a + 1)));
  }
  throw new Error("ElevenLabs request failed after retries");
}

const cmd = process.argv[2];
if (cmd === "voices") {
  const { voices } = await call("/v1/voices");
  for (const v of voices) console.log(v.voice_id, "|", v.name, "|", JSON.stringify(v.labels || {}));
} else if (cmd === "sfx") {
  const dir = join(ROOT, "audio"); mkdirSync(dir, { recursive: true });
  const woosh = await call("/v1/sound-generation", { text: "quick clean whoosh swipe transition sound effect, short, airy", duration_seconds: 0.8, prompt_influence: 0.6 }, true);
  writeFileSync(join(dir, "woosh.mp3"), woosh); console.log("woosh.mp3");
  try {
    const music = await call("/v1/music", { prompt: "upbeat motivational lo-fi hip hop instrumental for short explainer videos, light drums, curious playful mood, no vocals, loopable", music_length_ms: 70000 }, true);
    writeFileSync(join(dir, "music.mp3"), music); console.log("music.mp3");
  } catch (e) {
    console.log("music generation unavailable on this plan:", e.message, "- falling back to sound-generation loop");
    const loop = await call("/v1/sound-generation", { text: "upbeat curious instrumental background music loop, light percussion, plucky synth, no vocals", duration_seconds: 22, prompt_influence: 0.5 }, true);
    writeFileSync(join(dir, "music.mp3"), loop); console.log("music.mp3 (sfx loop)");
  }
} else {
  for (const ep of process.argv.slice(2)) {
    const spec = JSON.parse(readFileSync(join(ROOT, "episodes", `${ep}.json`), "utf8"));
    const text = spec.scenes.map((s) => s.say.replace(/\*/g, "")).join(" ");
    const res = await call(`/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
      text, model_id: MODEL,
      voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 1.08 },
    });
    const dir = join(ROOT, "episodes", ep); mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "voice.mp3"), Buffer.from(res.audio_base64, "base64"));
    const al = res.alignment;
    writeFileSync(join(dir, "voice.json"), JSON.stringify({ text: al.characters.join(""), starts: al.character_start_times_seconds, ends: al.character_end_times_seconds }));
    console.log(`${ep}: ${text.length} chars, ${al.character_end_times_seconds.at(-1).toFixed(1)}s`);
  }
}
