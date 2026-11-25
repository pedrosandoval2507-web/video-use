import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const R = "/home/user/video-use/stories";
const lib = readFileSync(`${R}/engine/lib.js`, "utf8");
const font = (f) => "data:font/woff2;base64," + readFileSync(`${R}/fonts/${f}`).toString("base64");
const variants = [
  ["avatar_a", "#E5322D", "#7A0E12", "E SE?"],
  ["avatar_b", "#2B2350", "#141432", "E SE?"],
  ["avatar_c", "#1FA39B", "#0D4A46", "E SE?"],
];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
for (const [name, c1, c2, txt] of variants) {
  await p.setContent(`<style>@font-face{font-family:Oswald;font-weight:700;src:url(${font("oswald-700.woff2")})}body{margin:0}</style>
  <svg id=s width=1080 height=1080 viewBox="0 0 1080 1080"></svg><script>${lib}</script>`);
  await p.evaluate(() => document.fonts.load("700 100px Oswald"));
  await p.evaluate(([c1, c2, txt]) => {
    const ch = person(0.5, { pose: "think", x: 540, y: 1560, s: 2.9, face: "cheer" });
    document.getElementById("s").innerHTML = `<defs><radialGradient id="g" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
      <rect width="1080" height="1080" fill="url(#g)"/>
      ${[...Array(14)].map((_, i) => `<circle cx="${(Math.sin(i*91.7)*0.5+0.5)*1080}" cy="${(Math.sin(i*37.3)*0.5+0.5)*420}" r="${4+i%3*3}" fill="#fff" opacity=".35"/>`).join("")}
      ${ch}
      <g transform="translate(690 300) rotate(8)"><rect x="-190" y="-95" width="380" height="190" rx="40" fill="#fff"/><path d="M-90 80 L-150 160 L-20 90 Z" fill="#fff"/>
      <text x="0" y="48" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="140" fill="${c1 === "#E5322D" ? "#15151C" : "#E5322D"}">${txt}</text></g>`;
  }, [c1, c2, txt]);
  await p.screenshot({ path: `${R}/brand/${name}.png` });
}
await b.close();
