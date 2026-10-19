// Builds captions/index.html (a HyperFrames composition) from words.tsv.
// Phrase-by-phrase captions: each word grows in as it is spoken; emphasis words turn red and get bigger.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 440;                  // caption band, placed at ~56% of the 1080x1920 frame
const MAX_WORDS = 4, MAX_CHARS = 22, GAP_BREAK_MS = 300;

// Word indices (from words.tsv, 0-based) that get the red emphasis.
// Force a phrase break after these word indices (keeps the hook readable).
const FORCE_BREAK_AFTER = new Set([3, 6]);
const EMPHASIS = new Set([3, 5, 6, 26, 48, 77, 90, 97, 110, 111, 116, 125, 129, 140, 146, 158, 161, 176, 197, 198, 209, 217]);

const words = readFileSync(join(HERE, "words.tsv"), "utf8").trim().split("\n").map((l, i) => {
  const [s, e, text] = l.split("\t");
  return { i, s: +s / 1000, e: +e / 1000, text };
});

// Group into short phrases.
const phrases = [];
let cur = [];
for (const w of words) {
  const prev = cur[cur.length - 1];
  const chars = cur.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
  const endsClause = /[.,?!]$/.test(w.text);
  // Don't strand a short clause-ending word on its own: keep it with the current phrase.
  const absorb = endsClause && cur.length < 5 && chars <= 28 && !/[.,?!]$/.test(prev?.text ?? "") && !FORCE_BREAK_AFTER.has(prev?.i);
  if (cur.length && !absorb && (cur.length >= MAX_WORDS || chars > MAX_CHARS || FORCE_BREAK_AFTER.has(prev.i) || /[.,?!]$/.test(prev.text) || (w.s - prev.e) * 1000 > GAP_BREAK_MS)) {
    phrases.push(cur); cur = [];
  }
  cur.push(w);
}
if (cur.length) phrases.push(cur);

const TOTAL = 56;
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const clean = (t) => t.replace(/[.,;]$/, "");

let html = "", tl = "";
phrases.forEach((p, pi) => {
  const start = p[0].s;
  const next = phrases[pi + 1];
  const end = Math.min(next ? next[0].s : TOTAL, p[p.length - 1].e + 0.5);
  const dur = Math.max(0.2, end - start).toFixed(3);
  html += `      <div class="phrase clip" id="p${pi}" data-start="${start.toFixed(3)}" data-duration="${dur}" data-track-index="0">`;
  html += p.map((w) => `<span class="w${EMPHASIS.has(w.i) ? " em" : ""}" id="w${w.i}">${esc(clean(w.text))}</span>`).join(" ");
  html += `</div>\n`;
  for (const w of p) {
    const em = EMPHASIS.has(w.i);
    tl += `      tl.fromTo("#w${w.i}", { opacity: 0, scale: 0.55, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: ${em ? 0.22 : 0.16}, ease: "back.out(2.4)" }, ${w.s.toFixed(3)});\n`;
  }
});

const out = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: transparent; }
      #root { position: relative; width: 100%; height: 100%; }
      .phrase {
        position: absolute; inset: 0; padding: 0 70px;
        display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0 18px;
        font-family: "Inter Display", Inter, sans-serif; font-weight: 800; font-size: 62px; line-height: 1.15;
        letter-spacing: -0.01em; text-align: center;
      }
      .w {
        display: inline-block; opacity: 0; transform-origin: 50% 70%;
        color: rgba(196, 228, 255, 0.92);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45), 0 4px 18px rgba(0, 0, 0, 0.35);
      }
      .w.em {
        color: #ff3b30; font-weight: 900; font-size: 80px; margin: 0 4px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 59, 48, 0.35);
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="captions" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
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
mkdirSync(join(HERE, "captions"), { recursive: true });
writeFileSync(join(HERE, "captions", "index.html"), out);
copyFileSync(join(HERE, "../../graphics/intro/gsap.min.js"), join(HERE, "captions", "gsap.min.js"));
console.log(`${phrases.length} phrases:`);
for (const p of phrases) console.log(`  ${p[0].s.toFixed(2)}s  ${p.map((w) => (EMPHASIS.has(w.i) ? `*${w.text}*` : w.text)).join(" ")}`);
