// Builds two HyperFrames compositions that share one zoom timeline:
//   base/      -> the recording with punch-in zooms baked in (opaque MP4, original audio muxed back in later)
//   presenter/ -> the AI cut-out of the person with the *same* zooms (transparent MOV), layered above images/cards
import { writeFileSync, mkdirSync, copyFileSync, symlinkSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1920, DUR = 55.966;
const ORIGIN = "50% 40%";   // zoom around the face, so it stays in place instead of drifting up
const EASE_IN = 0.3, EASE_OUT = 0.3;

// [start s, duration s, scale]. The hook is a slow suspense push-in.
const ZOOMS = [
  { at: 0, dur: 2.3, from: 1.12, to: 1.32, push: true },
  { at: 14.5, dur: 1.5, to: 1.2 },
  { at: 39.25, dur: 3.0, to: 1.2 },
  { at: 50.15, dur: 5.8, to: 1.1 },
];

function zoomTimeline() {
  return ZOOMS.map((z) => z.push
    ? `tl.fromTo("#cam", { scale: ${z.from} }, { scale: ${z.to}, duration: ${z.dur}, ease: "none" }, ${z.at});
      tl.to("#cam", { scale: 1, duration: ${EASE_OUT}, ease: "power2.inOut" }, ${z.at + z.dur});`
    : `tl.to("#cam", { scale: ${z.to}, duration: ${EASE_IN}, ease: "power3.out" }, ${z.at});
      tl.to("#cam", { scale: 1, duration: ${EASE_OUT}, ease: "power2.inOut" }, ${(z.at + z.dur - EASE_OUT).toFixed(3)});`).join("\n      ");
}

function page(id, src, bg) {
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
      #cam { position: absolute; inset: 0; transform-origin: ${ORIGIN}; }
      #cam video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="${id}" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
      <div id="cam">
        <video id="${id}-video" class="clip" data-start="0" data-duration="${DUR}" data-track-index="0" src="${src}" muted playsinline></video>
      </div>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.set("#cam", { scale: 1 }, 0);
      ${zoomTimeline()}
      window.__timelines = window.__timelines || {};
      window.__timelines["${id}"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
}

for (const [dir, src, bg] of [["base", "source.mp4", "#000"], ["presenter", "presenter.mov", "transparent"]]) {
  const d = join(HERE, dir);
  mkdirSync(d, { recursive: true });
  copyFileSync(join(HERE, "../../graphics/intro/gsap.min.js"), join(d, "gsap.min.js"));
  const media = join(d, src);
  const target = dir === "base" ? join(HERE, "source.mp4") : join(HERE, "cutout", "presenter.mov");
  if (existsSync(media)) rmSync(media);
  symlinkSync(target, media);
  writeFileSync(join(d, "index.html"), page(dir, src, bg));
}
console.log("ok: base/ and presenter/ written; zooms:", ZOOMS.map((z) => `${z.at}s×${z.to}`).join(", "));
