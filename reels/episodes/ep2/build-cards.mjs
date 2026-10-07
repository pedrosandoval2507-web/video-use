// Builds the animated data cards (one HyperFrames composition each) under cards/<id>/.
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 1000, H = 400;

// at = start time (s) on the reel timeline; dur = card length (s).
export const CARDS = [
  {
    id: "quote", at: 7.4, dur: 2.9,
    body: `<div class="label">A FRASE</div>
      <div class="quote">“Você é a média das <span class="red">5 pessoas</span> com quem mais convive.”</div>
      <div class="by">— Jim Rohn</div>`,
    anim: `tl.from(".label", { opacity: 0, y: 12, duration: 0.3 }, 0.1)
        .from(".quote", { opacity: 0, y: 24, duration: 0.45, ease: "power3.out" }, 0.2)
        .from(".by", { opacity: 0, x: -20, duration: 0.35 }, 0.7);`,
  },
  {
    id: "stat57", at: 16.95, dur: 3.5,
    body: `<div class="row"><div class="big red" id="n">0%</div>
      <div class="txt">mais chance de <b>engordar</b> se um amigo próximo engordar</div></div>
      <div class="src">Christakis &amp; Fowler · New England Journal of Medicine, 2007</div>`,
    counter: { to: 57, suffix: "%", from: 0.15, dur: 1.1 },
    anim: `tl.from(".txt", { opacity: 0, x: 30, duration: 0.4 }, 0.3).from(".src", { opacity: 0, duration: 0.3 }, 0.8);`,
  },
  {
    id: "stat25", at: 21.0, dur: 4.6,
    body: `<div class="row"><div class="big blue" id="n">+0%</div>
      <div class="txt">mais chance de você <b>ser feliz</b> se um amigo que mora perto é feliz</div></div>
      <div class="src">Fowler &amp; Christakis · BMJ, 2008</div>`,
    counter: { to: 25, prefix: "+", suffix: "%", from: 0.15, dur: 1.0 },
    anim: `tl.from(".txt", { opacity: 0, x: 30, duration: 0.4 }, 0.3).from(".src", { opacity: 0, duration: 0.3 }, 0.8);`,
  },
  {
    id: "sixth", at: 26.35, dur: 2.7,
    body: `<div class="label" id="lbl">5 ALCOÓLATRAS</div>
      <div class="people">${[0, 1, 2, 3, 4].map((i) => `<div class="p" id="p${i}"><div class="hd"></div><div class="bd"></div><div class="beer">🍺</div></div>`).join("")}
        <div class="p you" id="you"><div class="hd"></div><div class="bd"></div><div class="tag">VOCÊ</div></div></div>`,
    anim: `tl.from("#lbl", { opacity: 0, y: 10, duration: 0.25 }, 0.05);
      ${[0, 1, 2, 3, 4].map((i) => `tl.from("#p${i}", { opacity: 0, scale: 0.4, duration: 0.25, ease: "back.out(2)" }, ${(0.8 + i * 0.1).toFixed(2)});`).join("\n      ")}
      tl.from("#you", { opacity: 0, scale: 0.2, duration: 0.35, ease: "back.out(3)" }, 2.3);`,
  },
  {
    id: "negpos", at: 34.45, dur: 3.7,
    body: `<div class="line" id="l1"><span class="ico">🍺</span><span class="what">Bar e bebida</span><span class="pill neg">NEGATIVO</span></div>
      <div class="line" id="l2"><span class="ico">📈</span><span class="what">Negócios e crescimento</span><span class="pill pos">POSITIVO</span></div>`,
    anim: `tl.from("#l1", { opacity: 0, x: -40, duration: 0.35, ease: "power3.out" }, 0.25)
        .from("#l2", { opacity: 0, x: -40, duration: 0.35, ease: "power3.out" }, 1.9);`,
  },
];

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: transparent; }
#root { position: relative; width: 100%; height: 100%; font-family: Inter, sans-serif; color: #eef6ff; }
.card { position: absolute; inset: 14px; border-radius: 40px; padding: 38px 48px;
  background: rgba(10, 14, 24, 0.80); border: 2px solid rgba(196, 228, 255, 0.22);
  box-shadow: 0 18px 50px rgba(0,0,0,0.45); display: flex; flex-direction: column; justify-content: center; gap: 14px; }
.label { font-size: 26px; font-weight: 800; letter-spacing: 0.14em; color: rgba(196, 228, 255, 0.85); }
.quote { font-size: 50px; font-weight: 800; line-height: 1.12; letter-spacing: -0.01em; }
.by { font-size: 30px; font-weight: 600; color: rgba(196, 228, 255, 0.9); }
.red { color: #ff3b30; } .blue { color: #8fd0ff; }
.row { display: flex; align-items: center; gap: 34px; }
.big { font-size: 128px; font-weight: 900; letter-spacing: -0.04em; line-height: 1; flex-shrink: 0; }
.txt { font-size: 40px; font-weight: 600; line-height: 1.18; } .txt b { font-weight: 900; color: #fff; }
.src { font-size: 22px; color: rgba(196, 228, 255, 0.65); font-weight: 500; }
.people { display: flex; align-items: flex-end; justify-content: center; gap: 30px; margin-top: 10px; }
.p { position: relative; width: 110px; height: 190px; display: flex; flex-direction: column; align-items: center; }
.hd { width: 64px; height: 64px; border-radius: 50%; background: #6b7280; }
.bd { width: 110px; height: 110px; border-radius: 55px 55px 18px 18px; background: #6b7280; margin-top: 10px; }
.beer { position: absolute; right: -14px; top: 70px; font-size: 44px; }
.you .hd, .you .bd { background: #ff3b30; box-shadow: 0 0 30px rgba(255,59,48,0.6); }
.tag { position: absolute; bottom: -6px; font-size: 26px; font-weight: 900; color: #fff; }
.line { display: flex; align-items: center; gap: 22px; padding: 14px 0; }
.ico { font-size: 54px; } .what { flex: 1; font-size: 44px; font-weight: 800; }
.pill { font-size: 30px; font-weight: 900; padding: 12px 22px; border-radius: 999px; letter-spacing: 0.06em; }
.neg { background: #ff3b30; } .pos { background: #22c55e; color: #04220f; }
`;

for (const c of CARDS) {
  const dir = join(HERE, "cards", c.id);
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(HERE, "../../graphics/intro/gsap.min.js"), join(dir, "gsap.min.js"));
  const counter = c.counter
    ? `const n = { v: 0 }; const el = document.getElementById("n");
      tl.to(n, { v: ${c.counter.to}, duration: ${c.counter.dur}, ease: "power2.out", onUpdate: () => { el.textContent = "${c.counter.prefix ?? ""}" + Math.round(n.v) + "${c.counter.suffix ?? ""}"; } }, ${c.counter.from});
      tl.fromTo("#n", { scale: 0.6 }, { scale: 1, duration: 0.4, ease: "back.out(2)" }, 0.05);`
    : "";
  writeFileSync(join(dir, "index.html"), `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="gsap.min.js"></script>
    <style>${CSS}</style>
  </head>
  <body>
    <div id="root" data-composition-id="${c.id}" data-start="0" data-duration="${c.dur}" data-width="${W}" data-height="${H}">
      <div class="card clip" data-start="0" data-duration="${c.dur}" data-track-index="0">
      ${c.body}
      </div>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(".card", { opacity: 0, scale: 0.85, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.8)" }, 0);
      ${counter}
      ${c.anim}
      tl.to(".card", { opacity: 0, scale: 0.92, duration: 0.25, ease: "power2.in" }, ${(c.dur - 0.25).toFixed(2)});
      window.__timelines = window.__timelines || {};
      window.__timelines["${c.id}"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`);
}
console.log(CARDS.map((c) => `${c.id} @${c.at}s for ${c.dur}s`).join("\n"));
