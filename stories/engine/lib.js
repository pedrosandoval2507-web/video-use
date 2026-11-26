// Flat-vector scene library for the animated-story Reels format.
// Everything is a pure function of time so any frame can be rendered on demand.
// Canvas: 1080x1920. Characters/props draw around a local origin and are placed with x/y/s.

const W = 1080, H = 1920;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = (k) => 1 - Math.pow(1 - clamp(k), 3);
const easeInOut = (k) => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const backOut = (k) => { k = clamp(k); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// deterministic pseudo-random
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const C = {
  skin: "#E9B48C", hair: "#3A2A22", hoodie: "#1FA39B", hoodieDark: "#178079", pants: "#26304A",
  pack: "#F2C230", packDark: "#D9A514", shoe: "#1C1C24", red: "#E5322D", white: "#FFFFFF",
  ink: "#16161E", cream: "#F4EEE2",
};

// ---------------------------------------------------------------- character
function person(t, o = {}) {
  const pose = o.pose || "stand";
  const walking = pose === "walk" || pose === "run";
  const sp = pose === "run" ? 14 : 9;
  const sw = walking ? Math.sin(t * sp) : 0;
  const bob = walking ? Math.abs(Math.sin(t * sp)) * -8 : Math.sin(t * 2.2) * 2;
  const shirt = o.shirt || C.hoodie, shirtD = o.shirtDark || C.hoodieDark;
  const skin = o.skin || C.skin, hair = o.hair || C.hair;
  const legA = walking ? sw * 24 : 0, legB = -legA;
  let armL = 8, armR = -8; // degrees, 0 = straight down
  if (walking) { armL = -sw * 26; armR = sw * 26; }
  if (pose === "scared") { armL = 150 + Math.sin(t * 20) * 6; armR = -150 - Math.sin(t * 20) * 6; }
  if (pose === "cheer") { armL = 155 + Math.sin(t * 8) * 10; armR = -155 - Math.sin(t * 8) * 10; }
  if (pose === "point") { armR = -95; }
  if (pose === "phone") { armR = -140; }
  if (pose === "think") { armR = -150; }
  if (pose === "shrug") { armL = 70; armR = -70; }
  const blink = (t % 3.3) < 0.12 ? 0.15 : 1;
  const mouth = {
    scared: `<ellipse cx="0" cy="-272" rx="9" ry="12" fill="#5A2020"/>`,
    cheer: `<path d="M-14 -278 Q0 -258 14 -278 Z" fill="#5A2020"/>`,
    sad: `<path d="M-12 -268 Q0 -280 12 -268" stroke="#5A2020" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  }[o.face || pose] || `<path d="M-11 -276 Q0 -268 11 -276" stroke="#5A2020" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const leg = (x, a) => `<g transform="rotate(${a} ${x} -130)"><rect x="${x - 15}" y="-132" width="30" height="128" rx="12" fill="${C.pants}"/><ellipse cx="${x + 6}" cy="-4" rx="24" ry="12" fill="${C.shoe}"/></g>`;
  const arm = (x, a) => `<g transform="rotate(${a} ${x} -232)"><rect x="${x - 13}" y="-240" width="26" height="104" rx="13" fill="${shirtD}"/><circle cx="${x}" cy="-132" r="14" fill="${skin}"/></g>`;
  const phone = pose === "phone" ? `<g transform="translate(70 -330)"><rect x="-22" y="-38" width="44" height="76" rx="8" fill="#20232C"/><rect x="-17" y="-31" width="34" height="58" rx="4" fill="#5FC8FF" opacity="${0.75 + 0.25 * Math.sin(t * 6)}"/></g>` : "";
  const thinkBubble = pose === "think" ? `<g opacity="0.9"><circle cx="70" cy="-370" r="8" fill="#fff"/><circle cx="95" cy="-405" r="13" fill="#fff"/></g>` : "";
  const pack = o.pack === false ? "" : `<rect x="-62" y="-250" width="124" height="120" rx="22" fill="${C.pack}"/><rect x="-62" y="-170" width="124" height="18" fill="${C.packDark}"/>`;
  const sc = (o.s || 1) * (o.flip ? -1 : 1);
  return `<g transform="translate(${o.x || 540} ${(o.y || 1500) + bob}) scale(${sc} ${o.s || 1})">
    <ellipse cx="0" cy="2" rx="70" ry="12" fill="#000" opacity="0.18"/>
    ${pack}
    ${leg(-20, legA)}${leg(20, legB)}
    ${arm(-52, armL)}
    <rect x="-48" y="-255" width="96" height="135" rx="26" fill="${shirt}"/>
    <rect x="-48" y="-150" width="96" height="30" rx="10" fill="${shirtD}"/>
    ${o.pack === false ? "" : `<rect x="-40" y="-252" width="12" height="100" rx="6" fill="${C.packDark}"/><rect x="28" y="-252" width="12" height="100" rx="6" fill="${C.packDark}"/>`}
    ${arm(52, armR)}
    <rect x="-12" y="-268" width="24" height="18" fill="${skin}"/>
    <circle cx="0" cy="-300" r="50" fill="${skin}"/>
    <path d="M-52 -300 Q-56 -362 0 -360 Q56 -362 52 -300 Q40 -330 0 -332 Q-40 -330 -52 -300 Z" fill="${hair}"/>
    <ellipse cx="-17" cy="-300" rx="5.5" ry="${7 * blink}" fill="${C.ink}"/><ellipse cx="17" cy="-300" rx="5.5" ry="${7 * blink}" fill="${C.ink}"/>
    ${mouth}${phone}${thinkBubble}
  </g>`;
}

// ---------------------------------------------------------------- backgrounds
const grad = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
function stars(t, n = 40, maxY = 900, seed = 1) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = rnd(i + seed) * W, y = rnd(i * 3 + seed) * maxY, r = 1.5 + rnd(i * 7 + seed) * 2.5;
    const o = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i));
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${o.toFixed(2)}"/>`;
  }
  return s;
}
function skyline(t, baseY, color, lit, seed = 3, tall = 1) {
  let s = "", x = -20, i = 0;
  while (x < W + 40) {
    const w = 90 + rnd(i + seed) * 110, h = (220 + rnd(i * 5 + seed) * 420) * tall;
    s += `<rect x="${x.toFixed(0)}" y="${(baseY - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 4).toFixed(0)}" fill="${color}"/>`;
    if (lit) {
      for (let yy = baseY - h + 24; yy < baseY - 30; yy += 46) for (let xx = x + 16; xx < x + w - 24; xx += 34) {
        const k = rnd(xx * 0.37 + yy * 0.11 + seed);
        if (k > 0.55) {
          const on = lit === "flicker" ? (Math.sin(t * 3 + k * 50) > -0.6) : true;
          if (on) s += `<rect x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="16" height="22" fill="${k > 0.85 ? "#FFE9A8" : "#F8D36A"}" opacity="0.9"/>`;
        }
      }
    }
    x += w + 6; i++;
  }
  return s;
}
function pine(x, y, s, c = "#1F5E45", c2 = "#174A37") {
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-8" y="-30" width="16" height="34" fill="#4A3020"/><path d="M0 -230 L70 -30 L-70 -30 Z" fill="${c}"/><path d="M0 -230 L70 -30 L0 -30 Z" fill="${c2}"/></g>`;
}
function hills(y, color, amp = 60, seed = 1, f = 1) {
  let d = `M0 ${H} L0 ${y}`;
  for (let x = 0; x <= W; x += 60) d += ` L${x} ${(y - amp * (0.5 + 0.5 * Math.sin(x * 0.006 * f + seed))).toFixed(0)}`;
  return `<path d="${d} L${W} ${H} Z" fill="${color}"/>`;
}

const BG = {
  room_night(t) {
    return `<defs>${grad("rn", [[0, "#2B2350"], [1, "#3B2F63"]])}</defs><rect width="${W}" height="${H}" fill="url(#rn)"/>
    <rect x="560" y="420" width="380" height="460" rx="10" fill="#141432"/>${`<g clip-path="url(#win)"><clipPath id="win"><rect x="575" y="435" width="350" height="430"/></clipPath>${skyline(t, 880, "#232046", "flicker", 9, 0.8)}</g>`}
    <rect x="745" y="420" width="10" height="460" fill="#4B3F7A"/><rect x="560" y="640" width="380" height="10" fill="#4B3F7A"/>
    <rect x="0" y="1450" width="${W}" height="470" fill="#5B3B2E"/><rect x="0" y="1450" width="${W}" height="16" fill="#71493A"/>`;
  },
  city_night(t) {
    return `<defs>${grad("cn", [[0, "#1A1740"], [0.6, "#3A2D6B"], [1, "#7C4A8A"]])}</defs><rect width="${W}" height="${H}" fill="url(#cn)"/>
    ${stars(t, 30, 700)}<circle cx="860" cy="640" r="60" fill="#FFF3C4"/><circle cx="882" cy="626" r="53" fill="#2E2660"/>
    ${skyline(t, 1500, "#2A2452", false, 11, 1.4)}${skyline(t, 1560, "#1C1838", "flicker", 4, 1.1)}
    <rect x="0" y="1560" width="${W}" height="360" fill="#2C2C38"/><rect x="0" y="1560" width="${W}" height="14" fill="#44445A"/>`;
  },
  city_day(t) {
    return `<defs>${grad("cd", [[0, "#7EC8F2"], [1, "#CDEBFA"]])}</defs><rect width="${W}" height="${H}" fill="url(#cd)"/>
    <circle cx="200" cy="620" r="80" fill="#FFE38A"/>
    <g transform="translate(${(t * 20) % 1300 - 200} 0)"><ellipse cx="300" cy="460" rx="110" ry="34" fill="#fff"/><ellipse cx="360" cy="440" rx="70" ry="40" fill="#fff"/></g>
    ${skyline(t, 1500, "#9BB4CF", false, 7, 1.3)}${skyline(t, 1560, "#6F87A6", false, 2, 1)}
    <rect x="0" y="1560" width="${W}" height="360" fill="#5E6270"/><rect x="0" y="1560" width="${W}" height="14" fill="#8A8E9C"/>`;
  },
  street_top(t) {
    let lanes = "";
    for (let y = -200; y < H + 200; y += 160) lanes += `<rect x="530" y="${(y + (t * 220) % 160).toFixed(0)}" width="20" height="80" fill="#F4F4F4"/>`;
    return `<rect width="${W}" height="${H}" fill="#3E4250"/><rect x="0" y="0" width="190" height="${H}" fill="#8C8F9C"/><rect x="890" y="0" width="190" height="${H}" fill="#8C8F9C"/>
    <rect x="0" y="0" width="150" height="${H}" fill="#5E5A7A"/><rect x="930" y="0" width="150" height="${H}" fill="#5E5A7A"/>${lanes}`;
  },
  sunset(t) {
    return `<defs>${grad("ss", [[0, "#3B2B6E"], [0.45, "#C04F7A"], [0.75, "#F49A6B"], [1, "#F7C88A"]])}</defs><rect width="${W}" height="${H}" fill="url(#ss)"/>
    ${stars(t, 14, 500, 5)}<circle cx="540" cy="1180" r="150" fill="#FFD27A" opacity="0.85"/>
    ${hills(1250, "#6B3F7E", 120, 1)}${hills(1350, "#4F2F66", 80, 3, 1.4)}
    <rect x="0" y="1450" width="${W}" height="470" fill="#5C8A4A"/><rect x="0" y="1450" width="${W}" height="20" fill="#6E9E58"/>`;
  },
  field_day(t) {
    return `<defs>${grad("fd", [[0, "#6CC3F0"], [1, "#D8F1FF"]])}</defs><rect width="${W}" height="${H}" fill="url(#fd)"/>
    <circle cx="860" cy="620" r="90" fill="#FFE07A"/>
    <g transform="translate(${(t * 25) % 1400 - 300} 0)"><ellipse cx="300" cy="420" rx="120" ry="36" fill="#fff"/><ellipse cx="370" cy="398" rx="76" ry="44" fill="#fff"/></g>
    ${hills(1300, "#7DBB63", 90, 2)}${hills(1420, "#5FA04B", 50, 5, 1.6)}<rect x="0" y="1480" width="${W}" height="440" fill="#4E8C3E"/>`;
  },
  mountains(t) {
    let trees = "";
    for (let i = 0; i < 9; i++) trees += pine(40 + i * 125 + rnd(i) * 40, 1420 + rnd(i + 4) * 60, 0.9 + rnd(i + 9) * 0.5);
    return `<defs>${grad("mt", [[0, "#5D4E9A"], [0.5, "#B77AA8"], [1, "#F2B5A0"]])}</defs><rect width="${W}" height="${H}" fill="url(#mt)"/>
    <path d="M-100 1200 L260 640 L620 1200 Z" fill="#5A5A92"/><path d="M260 640 L330 750 L290 730 L260 770 L225 735 L190 750 Z" fill="#fff"/>
    <path d="M380 1250 L780 560 L1180 1250 Z" fill="#4B4A80"/><path d="M780 560 L860 700 L815 680 L780 720 L745 685 L700 700 Z" fill="#fff"/>
    ${hills(1330, "#2F6E52", 60, 4)}${trees}<rect x="0" y="1500" width="${W}" height="420" fill="#2A5E45"/>`;
  },
  space(t) {
    return `<rect width="${W}" height="${H}" fill="#0B0A22"/>${stars(t, 90, H, 2)}
    <circle cx="540" cy="1750" r="620" fill="#2F7BD8"/><path d="M120 1450 Q300 1300 460 1420 Q620 1520 760 1380 Q900 1260 1000 1400 L1100 1900 L0 1900 Z" fill="#45A85B" opacity="0.9"/>
    <circle cx="540" cy="1750" r="640" fill="none" stroke="#7CC4FF" stroke-width="18" opacity="0.35"/>`;
  },
  night_field(t) {
    return `<defs>${grad("nf", [[0, "#12123A"], [1, "#2D2A6A"]])}</defs><rect width="${W}" height="${H}" fill="url(#nf)"/>${stars(t, 60, 1100, 7)}
    ${hills(1250, "#22204A", 90, 2)}<rect x="0" y="1400" width="${W}" height="520" fill="#1B1A3A"/>`;
  },
  office(t) {
    return `<rect width="${W}" height="${H}" fill="#E7E2D6"/><rect x="0" y="0" width="${W}" height="1300" fill="#D6E3EA"/>
    <rect x="140" y="380" width="330" height="420" rx="8" fill="#9CC9E6"/><rect x="150" y="390" width="310" height="400" fill="#BFE2F5"/>${skyline(t, 790, "#8AAFCB", false, 6, 0.4).replace(/<rect x="(-?\d+)"/g, (m, x) => (x < 150 || x > 440 ? '<rect opacity="0" x="' + x + '"' : m))}
    <rect x="620" y="420" width="300" height="200" rx="10" fill="#fff"/><rect x="650" y="560" width="40" height="40" fill="#5FC08A"/><rect x="710" y="520" width="40" height="80" fill="#5FC08A"/><rect x="770" y="470" width="40" height="130" fill="#E5322D"/>
    <rect x="0" y="1300" width="${W}" height="620" fill="#B98B5F"/><rect x="0" y="1300" width="${W}" height="20" fill="#CFA073"/>`;
  },
  kitchen(t) {
    let tiles = "";
    for (let y = 0; y < 1250; y += 90) for (let x = (y / 90) % 2 ? -45 : 0; x < W; x += 90) tiles += `<rect x="${x + 3}" y="${y + 3}" width="84" height="84" fill="#2E3A5A"/>`;
    return `<rect width="${W}" height="${H}" fill="#273250"/>${tiles}<rect x="0" y="1250" width="${W}" height="40" fill="#D9C49A"/><rect x="0" y="1290" width="${W}" height="630" fill="#5A3B2A"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${40 + i * 260}" y="1340" width="230" height="420" rx="10" fill="#6B4632"/><rect x="${140 + i * 260}" y="1380" width="30" height="8" rx="4" fill="#C9A77A"/>`).join("")}`;
  },
  store(t) {
    let shelves = "";
    for (let r = 0; r < 4; r++) {
      shelves += `<rect x="80" y="${520 + r * 220}" width="920" height="16" fill="#8A6A4A"/>`;
      for (let i = 0; i < 9; i++) {
        const empty = rnd(i + r * 9) > 0.5;
        if (!empty) shelves += `<rect x="${110 + i * 100}" y="${420 + r * 220}" width="70" height="100" rx="8" fill="${["#E5322D", "#F2C230", "#1FA39B", "#5B7FD6"][(i + r) % 4]}"/>`;
      }
    }
    return `<rect width="${W}" height="${H}" fill="#F1E9DA"/>${shelves}<rect x="0" y="1450" width="${W}" height="470" fill="#CFC6B8"/>`;
  },
  dark(t) { return `<rect width="${W}" height="${H}" fill="#111118"/>`; },
  red(t) {
    return `<defs><radialGradient id="rg" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#E23B33"/><stop offset="1" stop-color="#6A0E10"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#rg)"/>`;
  },
  blue(t) {
    return `<defs><radialGradient id="bg2" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="#3B5BD8"/><stop offset="1" stop-color="#141B4A"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#bg2)"/>`;
  },
  green(t) {
    return `<defs><radialGradient id="gg" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="#2FB57A"/><stop offset="1" stop-color="#0D3B2A"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#gg)"/>`;
  },
  purple(t) {
    return `<defs><radialGradient id="pg" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="#6B4BC8"/><stop offset="1" stop-color="#1D1440"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#pg)"/>`;
  },
  desert(t) {
    return `<defs>${grad("ds", [[0, "#F6B65A"], [1, "#FBE3A8"]])}</defs><rect width="${W}" height="${H}" fill="url(#ds)"/>
    <circle cx="540" cy="520" r="${150 + Math.sin(t * 2) * 6}" fill="#FFF3C0" opacity="0.9"/>${hills(1300, "#E0A25A", 70, 1)}<rect x="0" y="1420" width="${W}" height="500" fill="#C98A48"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${120 + i * 200} 1500 l40 60 l-30 40 l50 70" stroke="#A86F36" stroke-width="6" fill="none"/>`).join("")}`;
  },
  forest_night(t) {
    let trees = "";
    for (let i = 0; i < 10; i++) trees += pine(rnd(i + 2) * W, 1380 + rnd(i) * 160, 1 + rnd(i + 5) * 0.6, "#173A35", "#122E2A");
    return `<defs>${grad("fn", [[0, "#0F1530"], [1, "#24345A"]])}</defs><rect width="${W}" height="${H}" fill="url(#fn)"/>${stars(t, 50, 900, 4)}
    <circle cx="220" cy="640" r="70" fill="#F6F1D0"/>${hills(1300, "#16283A", 70, 3)}${trees}<rect x="0" y="1520" width="${W}" height="400" fill="#10202A"/>`;
  },

  beach(t) {
    let waves = "";
    for (let i = 0; i < 4; i++) waves += `<path d="M0 ${1180 + i * 70 + Math.sin(t * 2 + i) * 8} Q270 ${1150 + i * 70} 540 ${1180 + i * 70 + Math.sin(t * 2 + i) * 8} T1080 ${1180 + i * 70}" stroke="#fff" stroke-width="8" fill="none" opacity="0.5"/>`;
    return `<defs>${grad("bc", [[0, "#5EC4F2"], [1, "#CFF0FF"]])}</defs><rect width="${W}" height="${H}" fill="url(#bc)"/><circle cx="860" cy="640" r="80" fill="#FFE07A"/>
    <rect x="0" y="1000" width="${W}" height="520" fill="#1F8FD0"/>${waves}<path d="M0 1500 Q540 1440 1080 1500 L1080 1920 L0 1920 Z" fill="#F2D59A"/>`;
  },
  ocean(t) {
    let waves = "";
    for (let i = 0; i < 8; i++) waves += `<path d="M-50 ${700 + i * 160 + Math.sin(t * 2 + i) * 12} Q270 ${660 + i * 160} 540 ${700 + i * 160 + Math.sin(t * 2 + i) * 12} T1130 ${700 + i * 160}" stroke="#7CC4FF" stroke-width="10" fill="none" opacity="0.45"/>`;
    return `<defs>${grad("oc", [[0, "#9ADBFF"], [0.3, "#2F7BD8"], [1, "#0D2E6B"]])}</defs><rect width="${W}" height="${H}" fill="url(#oc)"/><rect x="0" y="0" width="${W}" height="560" fill="#BDE8FF"/>${waves}`;
  },
  sky(t) {
    let clouds = "";
    for (let i = 0; i < 6; i++) { const x = ((rnd(i) * 1400 - t * (80 + i * 30)) % 1500 + 1500) % 1500 - 250, y = 300 + rnd(i + 3) * 1300; clouds += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><ellipse rx="160" ry="50" fill="#fff" opacity="0.9"/><ellipse cx="60" cy="-30" rx="90" ry="55" fill="#fff" opacity="0.9"/></g>`; }
    return `<defs>${grad("sk", [[0, "#3C8DE0"], [1, "#BFE6FF"]])}</defs><rect width="${W}" height="${H}" fill="url(#sk)"/>${clouds}`;
  },
  elevator(t) {
    return `<rect width="${W}" height="${H}" fill="#9AA3B5"/><rect x="80" y="200" width="920" height="1520" fill="#C9CED8"/>${[0, 1, 2].map((i) => `<rect x="${110 + i * 300}" y="230" width="270" height="1460" fill="#D8DCE4"/>`).join("")}
    <rect x="80" y="1560" width="920" height="160" fill="#6B7080"/><rect x="0" y="1720" width="${W}" height="200" fill="#4A4E5A"/><rect x="460" y="300" width="160" height="70" rx="10" fill="#1D2030"/><text x="540" y="352" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="48" fill="${Math.sin(t * 4) > 0 ? "#E5322D" : "#5A1010"}">--</text>`;
  },
  mars(t) {
    return `<defs>${grad("ms", [[0, "#3A1A1A"], [0.5, "#B3502F"], [1, "#E0864A"]])}</defs><rect width="${W}" height="${H}" fill="url(#ms)"/>${stars(t, 30, 600, 8)}
    ${hills(1250, "#A8462A", 90, 2)}${hills(1400, "#8E3A22", 60, 6, 1.5)}<rect x="0" y="1500" width="${W}" height="420" fill="#7A311D"/>
    ${[0, 1, 2, 3].map((i) => `<ellipse cx="${150 + i * 260}" cy="${1600 + (i % 2) * 120}" rx="70" ry="20" fill="#5E2414"/>`).join("")}`;
  },
  island(t) {
    return `<defs>${grad("is", [[0, "#5EC4F2"], [1, "#CFF0FF"]])}</defs><rect width="${W}" height="${H}" fill="url(#is)"/><circle cx="220" cy="640" r="80" fill="#FFE07A"/>
    <rect x="0" y="1050" width="${W}" height="870" fill="#1F8FD0"/><ellipse cx="540" cy="1480" rx="520" ry="150" fill="#F2D59A"/>
    <path d="M700 1450 Q690 1200 760 1000" stroke="#7A5236" stroke-width="34" fill="none"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M760 1000 Q${760 + Math.cos(i * 1.3) * 160} ${930 + Math.sin(i * 1.3) * 60} ${760 + Math.cos(i * 1.3) * 260} ${1040 + Math.sin(i * 1.3) * 40}" stroke="#2F9E55" stroke-width="40" fill="none" stroke-linecap="round"/>`).join("")}`;
  },
  hospital(t) {
    return `<rect width="${W}" height="${H}" fill="#E8F1F5"/><rect x="0" y="1350" width="${W}" height="570" fill="#BFD3DD"/><rect x="380" y="380" width="320" height="320" rx="30" fill="#fff"/><rect x="505" y="430" width="70" height="220" fill="${C.red}"/><rect x="430" y="505" width="220" height="70" fill="${C.red}"/>`;
  },
  bedroom(t) {
    return `<defs>${grad("br", [[0, "#1F2350"], [1, "#2F3570"]])}</defs><rect width="${W}" height="${H}" fill="url(#br)"/><rect x="620" y="380" width="300" height="360" rx="10" fill="#141432"/>${stars(t, 8, 700, 3).replace(/cx="(\d+)/g, (m, x) => `cx="${640 + (x % 260)}`)}
    <rect x="0" y="1450" width="${W}" height="470" fill="#4A3A5A"/><rect x="120" y="1250" width="840" height="260" rx="30" fill="#E6DFD0"/><rect x="120" y="1180" width="220" height="110" rx="30" fill="#fff"/><rect x="300" y="1250" width="660" height="260" rx="30" fill="#5B7FD6"/>`;
  },
  classroom(t) {
    return `<rect width="${W}" height="${H}" fill="#E8D8B8"/><rect x="120" y="380" width="840" height="520" rx="12" fill="#2F5A45"/><rect x="120" y="380" width="840" height="520" rx="12" fill="none" stroke="#8A6A4A" stroke-width="22"/>
    <text x="540" y="560" text-anchor="middle" font-family="Caveat, cursive" font-size="64" fill="#fff" opacity="0.85" font-style="italic">a² + b² = c²</text>
    <text x="540" y="680" text-anchor="middle" font-size="54" fill="#fff" opacity="0.6" font-family="Oswald">REVOLUÇÃO FRANCESA · 1789</text>
    <rect x="0" y="1450" width="${W}" height="470" fill="#A9845C"/>`;
  },
};

// ---------------------------------------------------------------- props / icons (centered ~ 200x200)
const P = {
  phone: (t, o) => `<rect x="-70" y="-130" width="140" height="260" rx="22" fill="#1D2030"/><rect x="-58" y="-112" width="116" height="214" rx="10" fill="${o.screen || "#3AA0FF"}"/>${o.label ? `<text x="0" y="10" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="30" fill="#fff">${esc(o.label)}</text>` : ""}<circle cx="0" cy="118" r="6" fill="#444"/>`,
  phone_off: (t) => `<rect x="-70" y="-130" width="140" height="260" rx="22" fill="#1D2030"/><rect x="-58" y="-112" width="116" height="214" rx="10" fill="#0C0D14"/>`,
  money: (t) => [0, 1, 2].map((i) => `<g transform="translate(${-10 + i * 10} ${30 - i * 26})"><rect x="-110" y="-45" width="220" height="90" rx="10" fill="#4FB06A"/><rect x="-98" y="-34" width="196" height="68" rx="6" fill="none" stroke="#2E8048" stroke-width="5"/><circle r="24" fill="#2E8048"/><text y="11" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="32" fill="#BFF0C9">$</text></g>`).join(""),
  coin: (t) => `<ellipse rx="${80 * Math.abs(Math.cos(t * 3)) + 8}" ry="80" fill="#F2C230" stroke="#C99A12" stroke-width="8"/><text y="24" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="70" fill="#C99A12" transform="scale(${Math.abs(Math.cos(t * 3))} 1)">$</text>`,
  wifi_off: (t) => `<g stroke="#fff" stroke-width="18" fill="none" stroke-linecap="round"><path d="M-90 -20 Q0 -100 90 -20"/><path d="M-55 15 Q0 -35 55 15"/></g><circle cx="0" cy="55" r="16" fill="#fff"/><path d="M-100 -100 L100 100" stroke="${C.red}" stroke-width="22" stroke-linecap="round"/>`,
  wifi: (t) => `<g stroke="#fff" stroke-width="18" fill="none" stroke-linecap="round"><path d="M-90 -20 Q0 -100 90 -20"/><path d="M-55 15 Q0 -35 55 15"/></g><circle cx="0" cy="55" r="16" fill="#fff"/>`,
  outlet: (t) => `<rect x="-90" y="-120" width="180" height="240" rx="26" fill="${C.cream}"/><circle cx="0" cy="-50" r="48" fill="#E6DFD0"/><circle cx="-16" cy="-50" r="8" fill="#3A2A22"/><circle cx="16" cy="-50" r="8" fill="#3A2A22"/><circle cx="0" cy="55" r="48" fill="#E6DFD0"/><circle cx="-16" cy="55" r="8" fill="#3A2A22"/><circle cx="16" cy="55" r="8" fill="#3A2A22"/>`,
  battery: (t, o) => { const lv = o.level ?? 0.15; const c = lv < 0.25 ? C.red : "#4FC36A"; return `<rect x="-110" y="-55" width="200" height="110" rx="16" fill="none" stroke="#fff" stroke-width="12"/><rect x="92" y="-22" width="22" height="44" rx="6" fill="#fff"/><rect x="-96" y="-41" width="${172 * lv}" height="82" rx="8" fill="${c}" opacity="${lv < 0.25 ? 0.5 + 0.5 * Math.sin(t * 8) : 1}"/>`; },
  bottle: (t) => `<rect x="-22" y="-140" width="44" height="30" rx="6" fill="#2F7BD8"/><path d="M-50 -110 L50 -110 L58 -70 L58 130 Q58 150 38 150 L-38 150 Q-58 150 -58 130 L-58 -70 Z" fill="#9FD8FF" opacity="0.9"/><rect x="-58" y="-20" width="116" height="60" fill="#2F7BD8"/>`,
  can: (t) => `<rect x="-60" y="-80" width="120" height="160" rx="12" fill="#C9CED8"/><rect x="-60" y="-50" width="120" height="100" fill="${C.red}"/><text y="14" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="34" fill="#fff">FEIJÃO</text><ellipse cy="-80" rx="60" ry="12" fill="#E3E6ED"/>`,
  radio: (t) => `<rect x="-120" y="-70" width="240" height="140" rx="20" fill="#7A5236"/><circle cx="-50" cy="5" r="44" fill="#3A2A22"/><circle cx="-50" cy="5" r="${30 + Math.sin(t * 12) * 3}" fill="#5A4030"/><rect x="20" y="-35" width="80" height="30" rx="6" fill="#F2C230"/><circle cx="60" cy="35" r="14" fill="#E6DFD0"/><path d="M-90 -70 L-130 -170" stroke="#999" stroke-width="8"/>`,
  flashlight: (t) => `<path d="M0 -40 L260 -150 L260 150 L0 40 Z" fill="#FFF3B0" opacity="0.35"/><rect x="-160" y="-30" width="140" height="60" rx="12" fill="#30323C"/><rect x="-30" y="-48" width="40" height="96" rx="10" fill="#4A4D5A"/>`,
  candle: (t) => `<rect x="-26" y="-40" width="52" height="140" rx="8" fill="${C.cream}"/><path d="M0 ${-100 + Math.sin(t * 9) * 4} Q24 -60 0 -44 Q-24 -60 0 ${-100 + Math.sin(t * 9) * 4} Z" fill="#FFB43A"/><circle cy="-60" r="60" fill="#FFB43A" opacity="0.15"/>`,
  ai_eye: (t) => { const p = 1 + Math.sin(t * 3) * 0.04; return `<g transform="scale(${p})"><circle r="170" fill="${C.red}" opacity="0.18"/><path d="M-200 0 Q0 -150 200 0 Q0 150 -200 0 Z" fill="#7A0E12"/><path d="M-170 0 Q0 -120 170 0 Q0 120 -170 0 Z" fill="${C.red}"/><circle r="70" fill="#FF6A4A"/><ellipse rx="16" ry="62" fill="#1A0505"/></g>`; },
  robot: (t) => `<rect x="-90" y="-110" width="180" height="150" rx="30" fill="#BFC7D6"/><rect x="-70" y="-85" width="140" height="80" rx="16" fill="#1D2030"/><circle cx="-32" cy="-45" r="14" fill="${C.red}" opacity="${0.6 + 0.4 * Math.sin(t * 5)}"/><circle cx="32" cy="-45" r="14" fill="${C.red}" opacity="${0.6 + 0.4 * Math.sin(t * 5)}"/><path d="M0 -110 L0 -150" stroke="#BFC7D6" stroke-width="10"/><circle cy="-158" r="14" fill="${C.red}"/><rect x="-70" y="50" width="140" height="110" rx="20" fill="#9AA3B5"/>`,
  asteroid: (t) => `<g transform="rotate(${t * 40})"><path d="M-120 -40 Q-110 -120 -20 -125 Q70 -140 115 -60 Q150 20 90 95 Q20 140 -60 110 Q-140 70 -120 -40 Z" fill="#7A6658"/><circle cx="-40" cy="-30" r="24" fill="#5E4E43"/><circle cx="45" cy="30" r="32" fill="#5E4E43"/><circle cx="10" cy="-80" r="14" fill="#5E4E43"/></g>`,
  fire_trail: (t) => `<path d="M0 -60 Q-260 -40 -420 -260 Q-200 -10 0 60 Z" fill="#FF8A3A" opacity="${0.6 + 0.2 * Math.sin(t * 20)}"/><path d="M0 -36 Q-180 -20 -300 -180 Q-140 -5 0 36 Z" fill="#FFD25A"/>`,
  rocket: (t) => `<path d="M0 -150 Q60 -80 50 60 L-50 60 Q-60 -80 0 -150 Z" fill="#EDEFF4"/><circle cy="-40" r="24" fill="#3AA0FF" stroke="#9AA3B5" stroke-width="6"/><path d="M-50 20 L-90 90 L-50 70 Z M50 20 L90 90 L50 70 Z" fill="${C.red}"/><path d="M-30 60 Q0 ${150 + Math.sin(t * 25) * 20} 30 60 Z" fill="#FFB43A"/>`,
  clock: (t) => `<circle r="120" fill="#fff" stroke="${C.ink}" stroke-width="12"/><path d="M0 0 L0 -80" stroke="${C.ink}" stroke-width="12" stroke-linecap="round" transform="rotate(${t * 360})"/><path d="M0 0 L55 0" stroke="${C.red}" stroke-width="12" stroke-linecap="round" transform="rotate(${t * 30})"/><circle r="12" fill="${C.ink}"/>`,
  calendar: (t, o) => `<rect x="-120" y="-110" width="240" height="230" rx="20" fill="#fff"/><rect x="-120" y="-110" width="240" height="70" rx="20" fill="${C.red}"/><rect x="-120" y="-60" width="240" height="20" fill="${C.red}"/><text y="70" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="${o.small ? 70 : 110}" fill="${C.ink}">${esc(o.label || "30")}</text>`,
  brain: (t) => `<path d="M-110 20 Q-140 -60 -70 -100 Q-30 -150 20 -120 Q90 -150 120 -80 Q160 -20 110 40 Q100 110 30 100 Q-20 140 -70 100 Q-130 90 -110 20 Z" fill="#F49AB5"/><path d="M0 -120 Q-20 -20 10 100 M-70 -60 Q-40 -30 -60 10 M60 -70 Q40 -20 70 20" stroke="#D2708F" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  chart_up: (t) => { const k = clamp(t / 1.2); return `<rect x="-150" y="-130" width="300" height="260" rx="20" fill="#fff"/><polyline points="-110,80 -50,30 10,50 70,-30 120,-90" fill="none" stroke="#2FB57A" stroke-width="16" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="400" stroke-dashoffset="${400 * (1 - k)}"/>`; },
  chart_down: (t) => { const k = clamp(t / 1.2); return `<rect x="-150" y="-130" width="300" height="260" rx="20" fill="#fff"/><polyline points="-110,-90 -50,-40 10,-60 70,30 120,90" fill="none" stroke="${C.red}" stroke-width="16" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="400" stroke-dashoffset="${400 * (1 - k)}"/>`; },
  house: (t) => `<path d="M-140 -10 L0 -140 L140 -10 Z" fill="${C.red}"/><rect x="-110" y="-20" width="220" height="150" fill="${C.cream}"/><rect x="-25" y="40" width="50" height="90" fill="#7A5236"/><rect x="-90" y="10" width="45" height="45" fill="#9FD8FF"/><rect x="45" y="10" width="45" height="45" fill="#9FD8FF"/>`,
  cabin: (t) => `<path d="M-180 -20 L0 -170 L180 -20 Z" fill="#5A3020"/><rect x="-150" y="-30" width="300" height="190" fill="#8A5A36"/>${[0, 1, 2, 3].map((i) => `<rect x="-150" y="${-10 + i * 45}" width="300" height="6" fill="#6B4228"/>`).join("")}<rect x="-30" y="60" width="60" height="100" fill="#4A2A18"/><rect x="60" y="20" width="60" height="50" fill="#FFD27A"/><rect x="90" y="-190" width="30" height="80" fill="#5A3020"/>${[0, 1, 2].map((i) => `<circle cx="${105 + Math.sin(t * 2 + i) * 12}" cy="${-210 - ((t * 40 + i * 40) % 120)}" r="${16 + i * 4}" fill="#ccc" opacity="${0.5 - ((t * 40 + i * 40) % 120) / 300}"/>`).join("")}`,
  cart: (t) => `<path d="M-150 -90 L-110 -90 L-70 60 L110 60 L140 -50 L-95 -50" fill="none" stroke="#fff" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/><circle cx="-50" cy="100" r="20" fill="#fff"/><circle cx="90" cy="100" r="20" fill="#fff"/>`,
  card: (t) => `<rect x="-150" y="-95" width="300" height="190" rx="18" fill="#2B2F45"/><rect x="-150" y="-55" width="300" height="34" fill="#11131D"/><rect x="-120" y="10" width="60" height="44" rx="6" fill="#F2C230"/><text x="120" y="70" text-anchor="end" font-family="Oswald" font-size="26" fill="#aaa">•••• 4021</text>`,
  lock: (t) => `<path d="M-60 -20 L-60 -80 Q-60 -140 0 -140 Q60 -140 60 -80 L60 -20" fill="none" stroke="#C9CED8" stroke-width="24"/><rect x="-100" y="-30" width="200" height="160" rx="22" fill="#F2C230"/><circle cy="35" r="18" fill="${C.ink}"/><rect x="-7" y="35" width="14" height="45" fill="${C.ink}"/>`,
  ear: (t) => `<path d="M-40 -110 Q60 -150 90 -40 Q100 40 30 70 Q0 90 10 140 Q0 170 -40 150" fill="none" stroke="${C.skin}" stroke-width="50" stroke-linecap="round"/><path d="M-10 -50 Q40 -60 40 0" fill="none" stroke="#C98A68" stroke-width="16" stroke-linecap="round"/>${[1, 2, 3].map((i) => `<path d="M${-90 - i * 40} -60 Q${-120 - i * 40} 0 ${-90 - i * 40} 60" fill="none" stroke="#fff" stroke-width="10" opacity="${clamp(Math.sin(t * 4 - i) * 0.5 + 0.5)}" stroke-linecap="round"/>`).join("")}`,
  mic: (t) => `<rect x="-50" y="-150" width="100" height="170" rx="50" fill="#C9CED8"/><path d="M-80 -20 Q-80 80 0 80 Q80 80 80 -20" fill="none" stroke="#C9CED8" stroke-width="14"/><rect x="-7" y="80" width="14" height="60" fill="#C9CED8"/><rect x="-60" y="140" width="120" height="16" rx="8" fill="#C9CED8"/><circle cx="60" cy="-140" r="16" fill="${C.red}" opacity="${0.5 + 0.5 * Math.sin(t * 6)}"/>`,
  zombie: (t, o) => person(t, { ...o, x: 0, y: 0, s: 1, shirt: "#6E6A5A", shirtDark: "#555244", skin: "#8DB07A", hair: "#3A3A2A", pack: false, face: "sad", pose: o.pose || "walk" }).replace(/rotate\((-?[\d.]+) (-?52) -232\)/g, "rotate(-95 $2 -232)").replace(/rotate\((-?[\d.]+) (52) -232\)/g, "rotate(-95 $2 -232)"),
  person: (t, o) => person(t, { ...o, x: 0, y: 0, s: 1 }),
  map: (t) => `<path d="M-150 -110 L-50 -140 L50 -110 L150 -140 L150 120 L50 150 L-50 120 L-150 150 Z" fill="#F4E7C6"/><path d="M-50 -140 L-50 120 M50 -110 L50 150" stroke="#D8C79E" stroke-width="6"/><path d="M-120 80 Q-60 0 0 30 Q60 60 110 -70" fill="none" stroke="${C.red}" stroke-width="8" stroke-dasharray="16 12"/><path d="M95 -95 l30 30 m0 -30 l-30 30" stroke="${C.red}" stroke-width="10"/>`,
  bike: (t) => `<g fill="none" stroke="#30323C" stroke-width="10"><circle cx="-90" cy="40" r="60" transform="rotate(${t * 300} -90 40)" stroke-dasharray="20 8"/><circle cx="90" cy="40" r="60" stroke-dasharray="20 8"/><path d="M-90 40 L-20 -40 L60 -40 L90 40 M-20 -40 L0 40 L60 -40 M60 -40 L50 -80 L80 -80"/></g>`,
  car: (t, o) => `<rect x="-160" y="-40" width="320" height="90" rx="24" fill="${o.color || C.red}"/><path d="M-100 -40 L-60 -100 L70 -100 L110 -40 Z" fill="${o.color || C.red}"/><path d="M-80 -45 L-50 -88 L0 -88 L0 -45 Z M15 -45 L15 -88 L62 -88 L90 -45 Z" fill="#BFE2F5"/><circle cx="-90" cy="55" r="36" fill="#1D2030"/><circle cx="90" cy="55" r="36" fill="#1D2030"/><circle cx="-90" cy="55" r="14" fill="#888"/><circle cx="90" cy="55" r="14" fill="#888"/>`,
  bulb: (t) => `<circle cy="-40" r="${90 + Math.sin(t * 4) * 4}" fill="#FFE07A"/><circle cy="-40" r="140" fill="#FFE07A" opacity="0.2"/><rect x="-40" y="40" width="80" height="60" rx="8" fill="#9AA3B5"/><path d="M-20 -40 L0 0 L20 -40" fill="none" stroke="#E0A21A" stroke-width="8"/>`,
  book: (t) => `<path d="M0 -90 Q-80 -120 -160 -90 L-160 110 Q-80 80 0 110 Z" fill="#fff"/><path d="M0 -90 Q80 -120 160 -90 L160 110 Q80 80 0 110 Z" fill="#F4EEE2"/><path d="M0 -90 L0 110" stroke="#C9CED8" stroke-width="6"/>${[0, 1, 2, 3].map((i) => `<path d="M-130 ${-50 + i * 35} L-30 ${-55 + i * 35} M30 ${-55 + i * 35} L130 ${-50 + i * 35}" stroke="#C9CED8" stroke-width="6"/>`).join("")}`,
  cap: (t) => `<path d="M-170 -20 L0 -100 L170 -20 L0 60 Z" fill="#1D2030"/><path d="M-100 15 L-100 80 Q0 130 100 80 L100 15 L0 60 Z" fill="#2B2F45"/><path d="M150 -10 L150 90" stroke="#F2C230" stroke-width="8"/><circle cx="150" cy="95" r="14" fill="#F2C230"/>`,
  briefcase: (t) => `<rect x="-150" y="-80" width="300" height="200" rx="22" fill="#7A5236"/><path d="M-50 -80 L-50 -120 L50 -120 L50 -80" fill="none" stroke="#5A3A24" stroke-width="18"/><rect x="-150" y="-10" width="300" height="16" fill="#5A3A24"/><rect x="-22" y="-20" width="44" height="36" rx="6" fill="#F2C230"/>`,
  crown: (t) => `<path d="M-150 80 L-150 -60 L-75 10 L0 -110 L75 10 L150 -60 L150 80 Z" fill="#F2C230" stroke="#C99A12" stroke-width="10" stroke-linejoin="round"/><circle cx="0" cy="30" r="22" fill="${C.red}"/><circle cx="-90" cy="40" r="14" fill="#3AA0FF"/><circle cx="90" cy="40" r="14" fill="#3AA0FF"/>`,
  globe: (t) => `<circle r="140" fill="#2F7BD8"/><g clip-path="url(#gclip)"><clipPath id="gclip"><circle r="140"/></clipPath><g transform="translate(${((t * 40) % 280) - 140} 0)">${[-280, 0, 280].map((dx) => `<path d="M${dx - 90} -80 Q${dx - 20} -120 ${dx + 20} -60 Q${dx + 40} 0 ${dx - 10} 40 Q${dx - 60} 60 ${dx - 90} 10 Z M${dx + 50} 40 Q${dx + 110} 30 ${dx + 120} 90 Q${dx + 80} 130 ${dx + 40} 100 Z" fill="#45A85B"/>`).join("")}</g></g><circle r="140" fill="none" stroke="#7CC4FF" stroke-width="8"/>`,
  warning: (t) => `<path d="M0 -150 L150 110 L-150 110 Z" fill="#F2C230" stroke="#1D2030" stroke-width="14" stroke-linejoin="round"/><rect x="-12" y="-60" width="24" height="100" rx="10" fill="#1D2030"/><circle cy="75" r="15" fill="#1D2030"/>`,
  check: (t) => `<circle r="120" fill="#2FB57A"/><path d="M-55 0 L-15 45 L60 -45" fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`,
  cross: (t) => `<circle r="120" fill="${C.red}"/><path d="M-50 -50 L50 50 M50 -50 L-50 50" stroke="#fff" stroke-width="26" stroke-linecap="round"/>`,
  tower: (t) => `<path d="M-80 160 L0 -160 L80 160 M-55 60 L55 60 M-30 -40 L30 -40" fill="none" stroke="#C9CED8" stroke-width="14"/><circle cy="-170" r="16" fill="${C.red}" opacity="${0.4 + 0.6 * (Math.sin(t * 6) > 0)}"/>`,
  fence: (t) => [...Array(9)].map((_, i) => `<rect x="${-440 + i * 100}" y="-140" width="60" height="200" rx="8" fill="#9A6A42"/>`).join("") + `<rect x="-460" y="-100" width="920" height="22" fill="#7A5236"/><rect x="-460" y="0" width="920" height="22" fill="#7A5236"/>`,
  fridge: (t) => `<rect x="-110" y="-260" width="220" height="520" rx="20" fill="#DCE3EC"/><rect x="-110" y="-80" width="220" height="10" fill="#AAB4C2"/><rect x="70" y="-220" width="14" height="100" rx="6" fill="#AAB4C2"/><rect x="70" y="-40" width="14" height="140" rx="6" fill="#AAB4C2"/>`,
  tv: (t) => `<rect x="-170" y="-110" width="340" height="210" rx="16" fill="#1D2030"/><rect x="-155" y="-95" width="310" height="180" rx="8" fill="${Math.sin(t * 7) > 0 ? "#3A3D55" : "#2A2D45"}"/>${[...Array(30)].map((_, i) => `<rect x="${-150 + rnd(i + Math.floor(t * 12)) * 290}" y="${-90 + rnd(i * 3 + Math.floor(t * 12)) * 170}" width="14" height="4" fill="#fff" opacity="0.5"/>`).join("")}<rect x="-40" y="100" width="80" height="30" fill="#1D2030"/>`,
  instagram: (t) => `<rect x="-120" y="-120" width="240" height="240" rx="60" fill="#D6337A"/><rect x="-80" y="-80" width="160" height="160" rx="44" fill="none" stroke="#fff" stroke-width="16"/><circle r="38" fill="none" stroke="#fff" stroke-width="16"/><circle cx="52" cy="-52" r="10" fill="#fff"/>`,
  heart: (t) => `<path d="M0 110 Q-170 0 -130 -90 Q-80 -160 0 -80 Q80 -160 130 -90 Q170 0 0 110 Z" fill="${C.red}" transform="scale(${1 + Math.max(0, Math.sin(t * 6)) * 0.08})"/>`,
  bell: (t) => `<g transform="rotate(${Math.sin(t * 14) * 12})"><path d="M-90 60 Q-90 -110 0 -110 Q90 -110 90 60 L120 90 L-120 90 Z" fill="#F2C230"/><circle cy="110" r="24" fill="#F2C230"/><circle cy="-120" r="16" fill="#F2C230"/></g><circle cx="80" cy="-90" r="34" fill="${C.red}"/><text x="80" y="-76" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="40" fill="#fff">9</text>`,
  sun: (t) => `<g transform="rotate(${t * 20})">${[...Array(12)].map((_, i) => `<rect x="-10" y="-190" width="20" height="50" rx="10" fill="#FFC53A" transform="rotate(${i * 30})"/>`).join("")}</g><circle r="120" fill="#FFC53A"/>`,
  drop: (t) => `<path d="M0 -150 Q100 0 100 50 Q100 140 0 140 Q-100 140 -100 50 Q-100 0 0 -150 Z" fill="#3AA0FF"/><path d="M-50 40 Q-50 90 -10 105" stroke="#BFE6FF" stroke-width="14" fill="none" stroke-linecap="round"/>`,
  pill: (t) => `<g transform="rotate(-35)"><rect x="-140" y="-55" width="280" height="110" rx="55" fill="#fff"/><path d="M0 -55 L-85 -55 Q-140 -55 -140 0 Q-140 55 -85 55 L0 55 Z" fill="${C.red}"/></g>`,
  hourglass: (t) => `<rect x="-110" y="-160" width="220" height="24" rx="10" fill="#7A5236"/><rect x="-110" y="136" width="220" height="24" rx="10" fill="#7A5236"/><path d="M-90 -136 L90 -136 L10 0 L90 136 L-90 136 L-10 0 Z" fill="#DCEAF5" opacity="0.8"/><path d="M${-60 + 40 * clamp(t / 4)} ${-110 + 100 * clamp(t / 4)} L${60 - 40 * clamp(t / 4)} ${-110 + 100 * clamp(t / 4)} L5 -5 L-5 -5 Z" fill="#F2C230"/><path d="M-80 130 L80 130 L${20 - 20 * clamp(t / 4)} ${90 - 60 * clamp(t / 4)} L${-20 + 20 * clamp(t / 4)} ${90 - 60 * clamp(t / 4)} Z" fill="#F2C230"/>`,
  dollar_sign: (t) => `<text y="80" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="260" fill="#4FB06A">$</text>`,
  scale: (t) => { const a = Math.sin(t * 2) * 8; return `<rect x="-8" y="-120" width="16" height="250" fill="#C9CED8"/><rect x="-80" y="120" width="160" height="20" rx="8" fill="#C9CED8"/><g transform="rotate(${a} 0 -110)"><rect x="-170" y="-118" width="340" height="14" rx="7" fill="#C9CED8"/><path d="M-170 -110 L-210 -20 L-130 -20 Z M170 -110 L130 -20 L210 -20 Z" fill="none" stroke="#C9CED8" stroke-width="6"/><ellipse cx="-170" cy="-20" rx="50" ry="12" fill="#F2C230"/><ellipse cx="170" cy="-20" rx="50" ry="12" fill="#F2C230"/></g>`; },
  smoke: (t) => [0, 1, 2, 3].map((i) => { const k = ((t * 0.6 + i * 0.25) % 1); return `<circle cx="${Math.sin(i * 2 + t) * 40}" cy="${-k * 300}" r="${40 + k * 60}" fill="#555" opacity="${0.6 * (1 - k)}"/>`; }).join(""),
  bars: (t, o) => { const v = o.values || [0.3, 0.6, 1]; const cols = o.colors || ["#9AA3B5", "#9AA3B5", C.red]; const k = easeOut(t / 1); return v.map((h, i) => `<rect x="${-150 + i * (300 / v.length)}" y="${120 - 260 * h * k}" width="${300 / v.length - 20}" height="${260 * h * k}" rx="8" fill="${cols[i % cols.length]}"/>`).join("") + `<rect x="-170" y="120" width="340" height="8" fill="#fff"/>`; },
  plug: (t) => `<rect x="-70" y="-60" width="140" height="120" rx="20" fill="#E6DFD0"/><rect x="-40" y="-120" width="18" height="60" fill="#C9CED8"/><rect x="22" y="-120" width="18" height="60" fill="#C9CED8"/><path d="M0 60 Q0 150 120 180" stroke="#E6DFD0" stroke-width="22" fill="none"/>`,
  water_glass: (t) => `<path d="M-80 -120 L80 -120 L60 130 L-60 130 Z" fill="#DCEAF5" opacity="0.6"/><path d="M-70 -20 L70 -20 L60 130 L-60 130 Z" fill="#3AA0FF" opacity="0.8"/>`,

  snake: (t) => { let d = "M-200 60"; for (let i = 0; i <= 8; i++) d += ` Q${-175 + i * 50} ${60 + (i % 2 ? -60 : 60) * Math.cos(t * 4 + i * 0.6)} ${-150 + i * 50} 60`; return `<path d="${d}" stroke="#5FA04B" stroke-width="46" fill="none" stroke-linecap="round"/><ellipse cx="260" cy="50" rx="60" ry="40" fill="#5FA04B"/><circle cx="275" cy="35" r="9" fill="#1D2030"/><path d="M318 55 l40 -6 m-40 6 l40 10" stroke="${C.red}" stroke-width="6"/>`; },
  plane: (t) => `<g transform="rotate(${Math.sin(t * 1.5) * 3})"><ellipse rx="260" ry="55" fill="#EDEFF4"/><path d="M-60 -10 L60 -10 L-40 -170 L-90 -170 Z" fill="#C9CED8"/><path d="M-60 10 L60 10 L-40 170 L-90 170 Z" fill="#C9CED8"/><path d="M-260 0 L-230 -110 L-190 -110 L-180 -20 Z" fill="${C.red}"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${-120 + i * 50}" cy="-12" r="12" fill="#5FC8FF"/>`).join("")}<path d="M220 -20 Q262 0 220 30" fill="#5FC8FF"/></g>`,
  parachute: (t) => `<g transform="rotate(${Math.sin(t * 2) * 6})"><path d="M-170 -60 Q0 -260 170 -60 Q130 -90 85 -60 Q42 -90 0 -60 Q-42 -90 -85 -60 Q-130 -90 -170 -60 Z" fill="${C.red}"/><path d="M-170 -60 L0 120 M170 -60 L0 120 M-85 -60 L0 120 M85 -60 L0 120 M0 -60 L0 120" stroke="#fff" stroke-width="4"/><circle cy="140" r="28" fill="${C.skin}"/><rect x="-22" y="165" width="44" height="70" rx="14" fill="${C.hoodie}"/></g>`,
  moon: (t) => `<circle r="150" fill="#E6E2D3"/><circle cx="-50" cy="-40" r="30" fill="#C9C4B2"/><circle cx="60" cy="30" r="40" fill="#C9C4B2"/><circle cx="-10" cy="80" r="18" fill="#C9C4B2"/>`,
  wave: (t) => `<path d="M-300 120 Q-200 ${-200 + Math.sin(t * 3) * 20} 0 -160 Q160 -130 120 -40 Q60 -100 0 -60 Q120 40 300 120 Z" fill="#2F7BD8"/><path d="M-300 120 Q-200 -120 0 -150" stroke="#fff" stroke-width="16" fill="none" opacity="0.7"/>`,
  arrow: (t, o) => `<g transform="rotate(${o.dir || 0})"><path d="M-160 -30 L60 -30 L60 -90 L170 0 L60 90 L60 30 L-160 30 Z" fill="${o.color || "#fff"}" transform="translate(${Math.sin(t * 5) * 10} 0)"/></g>`,
  tree: (t) => `<rect x="-24" y="0" width="48" height="200" fill="#7A5236"/><circle cy="-60" r="130" fill="#2F9E55"/><circle cx="-90" cy="10" r="90" fill="#2F9E55"/><circle cx="90" cy="10" r="90" fill="#268746"/>`,
  palm: (t) => `<path d="M0 200 Q-20 0 40 -150" stroke="#7A5236" stroke-width="34" fill="none"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M40 -150 Q${40 + Math.cos(i * 1.3) * 150} ${-220 + Math.sin(i * 1.3) * 60} ${40 + Math.cos(i * 1.3) * 250} ${-110 + Math.sin(i * 1.3) * 40}" stroke="#2F9E55" stroke-width="38" fill="none" stroke-linecap="round"/>`).join("")}`,
  dog: (t, o) => `<g transform="translate(0 ${Math.abs(Math.sin(t * 8)) * -6})"><ellipse rx="150" ry="70" fill="${o.color || "#9A6A42"}"/><circle cx="160" cy="-70" r="70" fill="${o.color || "#9A6A42"}"/><ellipse cx="225" cy="-55" rx="45" ry="30" fill="#7A5236"/><circle cx="262" cy="-62" r="12" fill="#1D2030"/><circle cx="175" cy="-95" r="10" fill="#1D2030"/><path d="M120 -125 L110 -190 L160 -135 Z" fill="#5A3A24"/>${o.angry ? `<path d="M205 -30 l10 18 l10 -18 l10 18 l10 -18" stroke="#fff" stroke-width="6" fill="none"/>` : `<path d="M230 -20 Q240 10 225 30" stroke="${C.red}" stroke-width="16" stroke-linecap="round" fill="none"/>`}<rect x="-120" y="40" width="30" height="90" rx="12" fill="#7A5236"/><rect x="90" y="40" width="30" height="90" rx="12" fill="#7A5236"/><path d="M-150 -10 Q-220 ${-60 + Math.sin(t * 14) * 30} -230 -100" stroke="${o.color || "#9A6A42"}" stroke-width="22" fill="none" stroke-linecap="round"/></g>`,
  bee: (t) => `<g transform="translate(${Math.sin(t * 3) * 30} ${Math.sin(t * 7) * 15})"><ellipse cx="-30" cy="-90" rx="60" ry="40" fill="#fff" opacity="0.8" transform="rotate(${-20 + Math.sin(t * 40) * 15} -30 -60)"/><ellipse cx="40" cy="-90" rx="60" ry="40" fill="#fff" opacity="0.8" transform="rotate(${20 - Math.sin(t * 40) * 15} 40 -60)"/><ellipse rx="130" ry="85" fill="#F2C230"/><rect x="-60" y="-85" width="36" height="170" fill="#1D2030"/><rect x="20" y="-82" width="36" height="164" fill="#1D2030"/><circle cx="110" cy="-10" r="12" fill="#1D2030"/><path d="M-130 0 L-170 0" stroke="#1D2030" stroke-width="10"/></g>`,
  mosquito: (t) => `<g transform="translate(${Math.sin(t * 4) * 40} ${Math.sin(t * 9) * 20})"><ellipse cx="-20" cy="-50" rx="70" ry="25" fill="#DCEAF5" opacity="0.8" transform="rotate(${-30 + Math.sin(t * 50) * 20} 0 -20)"/><ellipse cx="20" cy="-50" rx="70" ry="25" fill="#DCEAF5" opacity="0.8" transform="rotate(${30 - Math.sin(t * 50) * 20} 0 -20)"/><ellipse rx="110" ry="26" fill="#3A3A3A"/><circle cx="110" cy="-10" r="30" fill="#3A3A3A"/><path d="M135 0 L230 40" stroke="#3A3A3A" stroke-width="6"/>${[-60, -10, 40].map((x) => `<path d="M${x} 15 L${x - 30} 110 M${x} 15 L${x + 30} 110" stroke="#3A3A3A" stroke-width="5"/>`).join("")}</g>`,
  fire: (t) => [0, 1, 2].map((i) => `<path d="M${-90 + i * 90} 120 Q${-160 + i * 90} ${-20 - i % 2 * 40} ${-90 + i * 90} ${-160 + Math.sin(t * 10 + i) * 25} Q${-20 + i * 90} ${-20 - i % 2 * 40} ${-90 + i * 90} 120 Z" fill="${["#FF8A3A", "#FFB43A", "#FF6A3A"][i]}"/>`).join("") + `<ellipse cy="120" rx="170" ry="24" fill="#7A3A1A"/>`,
  lightning: (t) => `<path d="M40 -200 L-80 20 L0 20 L-50 200 L100 -40 L20 -40 L80 -200 Z" fill="#FFE07A" opacity="${Math.sin(t * 15) > -0.3 ? 1 : 0.4}"/>`,
  burger: (t) => `<path d="M-150 -20 Q-150 -140 0 -140 Q150 -140 150 -20 Z" fill="#E0A04A"/><rect x="-160" y="-20" width="320" height="30" rx="10" fill="#5FA04B"/><rect x="-155" y="10" width="310" height="50" rx="20" fill="#6B3A22"/><rect x="-160" y="60" width="320" height="20" fill="#F2C230"/><rect x="-150" y="80" width="300" height="60" rx="22" fill="#E0A04A"/>${[0, 1, 2, 3].map((i) => `<ellipse cx="${-80 + i * 50}" cy="-100" rx="8" ry="5" fill="#fff"/>`).join("")}`,
  sugar: (t) => [0, 1, 2].map((i) => `<g transform="translate(${-110 + i * 110} ${i === 1 ? -40 : 30})"><path d="M-50 -30 L0 -55 L50 -30 L50 40 L0 65 L-50 40 Z" fill="#fff" stroke="#DDE3EC" stroke-width="6"/><path d="M-50 -30 L0 -5 L50 -30 M0 -5 L0 65" stroke="#DDE3EC" stroke-width="6" fill="none"/></g>`).join(""),
  soda: (t) => `<rect x="-70" y="-140" width="140" height="280" rx="24" fill="${C.red}"/><ellipse cy="-140" rx="70" ry="16" fill="#C9CED8"/><path d="M-70 -30 Q0 10 70 -30 L70 0 Q0 40 -70 0 Z" fill="#fff"/>`,
  coffee: (t) => `<path d="M-90 -60 L90 -60 L70 110 L-70 110 Z" fill="#fff"/><rect x="-90" y="-80" width="180" height="24" rx="8" fill="#7A5236"/><path d="M90 -20 Q150 -20 150 30 Q150 70 80 70" stroke="#fff" stroke-width="20" fill="none"/>${[0, 1].map((i) => `<path d="M${-30 + i * 50} -100 q-20 -40 0 -70 q20 -30 0 -60" stroke="#ccc" stroke-width="8" fill="none" opacity="${0.4 + 0.3 * Math.sin(t * 3 + i)}"/>`).join("")}`,
  bed: (t) => `<rect x="-220" y="-20" width="440" height="110" rx="20" fill="#5B7FD6"/><rect x="-220" y="-60" width="140" height="70" rx="20" fill="#fff"/><rect x="-240" y="-120" width="30" height="260" rx="10" fill="#7A5236"/><rect x="210" y="-40" width="30" height="180" rx="10" fill="#7A5236"/><text x="140" y="-80" font-family="Oswald" font-weight="700" font-size="70" fill="#fff" opacity="${0.5 + 0.5 * Math.sin(t * 3)}">Z</text>`,
  gas_pump: (t) => `<rect x="-90" y="-160" width="180" height="300" rx="16" fill="${C.red}"/><rect x="-60" y="-130" width="120" height="80" rx="8" fill="#1D2030"/><text y="-75" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="44" fill="#5FC8FF">0,00</text><rect x="-110" y="140" width="220" height="30" rx="8" fill="#6B7080"/><path d="M90 -40 Q160 -40 160 40 L160 100" stroke="#1D2030" stroke-width="16" fill="none"/><rect x="140" y="90" width="40" height="60" rx="8" fill="#1D2030"/>`,
  truck: (t) => `<rect x="-220" y="-110" width="300" height="170" rx="12" fill="#EDEFF4"/><path d="M80 -60 L170 -60 L220 0 L220 60 L80 60 Z" fill="${C.red}"/><path d="M100 -45 L160 -45 L195 -5 L100 -5 Z" fill="#BFE2F5"/><circle cx="-150" cy="70" r="38" fill="#1D2030"/><circle cx="-60" cy="70" r="38" fill="#1D2030"/><circle cx="150" cy="70" r="38" fill="#1D2030"/>`,
  ball: (t, o) => `<circle r="110" fill="${o.color || "#2FB57A"}"/><circle r="70" fill="#fff"/><text y="30" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="84" fill="${C.ink}">${esc(o.label || "7")}</text>`,
  sos: (t) => `<text y="70" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="240" fill="#fff" stroke="#7A5236" stroke-width="10" opacity="${0.7 + 0.3 * Math.sin(t * 3)}">SOS</text>`,
  shield: (t) => `<path d="M0 -160 L140 -110 Q140 80 0 160 Q-140 80 -140 -110 Z" fill="#2FB57A"/><path d="M-55 0 L-15 45 L60 -45" fill="none" stroke="#fff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>`,
  thermo: (t, o) => `<rect x="-30" y="-180" width="60" height="280" rx="30" fill="#fff"/><circle cy="120" r="60" fill="${o.cold ? "#3AA0FF" : C.red}"/><rect x="-16" y="${o.cold ? 40 : -150}" width="32" height="${o.cold ? 80 : 270}" rx="16" fill="${o.cold ? "#3AA0FF" : C.red}"/>`,
  door: (t) => `<rect x="-120" y="-220" width="240" height="440" rx="10" fill="#7A5236"/><rect x="-95" y="-190" width="190" height="170" rx="8" fill="#6B4632"/><rect x="-95" y="10" width="190" height="180" rx="8" fill="#6B4632"/><circle cx="85" cy="10" r="16" fill="#F2C230"/>`,
  whatsapp: (t) => `<circle r="130" fill="#2FB57A"/><path d="M-90 110 L-70 50 Q-110 -40 -40 -95 Q40 -140 100 -60 Q140 20 70 80 Q10 120 -50 95 Z" fill="none" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M-30 -40 Q-40 0 0 35 Q30 60 50 40" stroke="#fff" stroke-width="18" fill="none" stroke-linecap="round"/>`,
  qr: (t) => { let s = `<rect x="-140" y="-140" width="280" height="280" rx="16" fill="#fff"/>`; for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) if (rnd(i * 10 + j) > 0.5) s += `<rect x="${-115 + i * 23}" y="${-115 + j * 23}" width="21" height="21" fill="${C.ink}"/>`; return s + [[-115, -115], [47, -115], [-115, 47]].map(([x, y]) => `<rect x="${x}" y="${y}" width="68" height="68" fill="#fff" stroke="${C.ink}" stroke-width="14"/>`).join(""); },
  hole: (t) => `<ellipse rx="220" ry="70" fill="#1D1410"/><ellipse rx="220" ry="70" fill="none" stroke="#5A3A24" stroke-width="16"/><ellipse cy="10" rx="120" ry="30" fill="#FF6A3A" opacity="${0.3 + 0.2 * Math.sin(t * 4)}"/>`,
  sunflare: (t) => `<circle r="${200 + Math.sin(t * 3) * 10}" fill="#FFB43A"/><circle r="260" fill="#FFB43A" opacity="0.25"/>${[...Array(8)].map((_, i) => `<path d="M0 0 Q${Math.cos(i) * 300} ${Math.sin(i) * 300} ${Math.cos(i + 0.3) * (380 + Math.sin(t * 5 + i) * 40)} ${Math.sin(i + 0.3) * (380 + Math.sin(t * 5 + i) * 40)}" stroke="#FF6A3A" stroke-width="22" fill="none" opacity="0.6" stroke-linecap="round"/>`).join("")}`,
  planet_mars: (t) => `<circle r="150" fill="#C9572F"/><circle cx="-50" cy="-40" r="28" fill="#A8462A"/><circle cx="55" cy="40" r="38" fill="#A8462A"/><ellipse cx="0" cy="-138" rx="60" ry="14" fill="#fff" opacity="0.8"/>`,
  people: (t, o) => [...Array(o.n || 5)].map((_, i) => `<g transform="translate(${(i - ((o.n || 5) - 1) / 2) * 90} 0) scale(0.5)">${person(t + i, { x: 0, y: 0, s: 1, pack: false, shirt: ["#1FA39B", "#E5322D", "#F2C230", "#5B7FD6", "#9A6A42"][i % 5], shirtDark: ["#178079", "#B8241F", "#D9A514", "#3F5FB0", "#7A5236"][i % 5], pose: o.pose || "stand" })}</g>`).join(""),
  gun_off: () => "",
};

// ---------------------------------------------------------------- overlays
function textLines(lines, x, y, size, color, weight = 700, family = "Oswald", anchor = "middle", lh = 1.08) {
  return lines.map((l, i) => `<text x="${x}" y="${y + i * size * lh}" text-anchor="${anchor}" font-family="${family}" font-weight="${weight}" font-size="${size}" fill="${color}" style="paint-order:stroke" stroke="#000" stroke-opacity="0.25" stroke-width="${size * 0.06}">${esc(l)}</text>`).join("");
}
let _mctx = null;
function measure(str, size, weight = 700) {
  if (typeof document !== "undefined") {
    _mctx = _mctx || document.createElement("canvas").getContext("2d");
    _mctx.font = `${weight} ${size}px Oswald`;
    return _mctx.measureText(str).width;
  }
  let w = 0; for (const ch of str) w += /[MW]/.test(ch) ? 0.72 : /[IÍ1 .,!:;']/.test(ch) ? 0.28 : 0.5;
  return w * size;
}
function badge(step, lt) {
  if (!step) return "";
  const k = backOut(lt / 0.35);
  const lines = String(step.t).split("\n");
  const lw = Math.max(...lines.map((l) => measure(l.toUpperCase(), 38))) + 40;
  const isStar = step.n === "*";
  const num = isStar ? `<path d="M0 -30 L9 -9 L31 -9 L13 5 L20 27 L0 14 L-20 27 L-13 5 L-31 -9 L-9 -9 Z" fill="#fff" transform="translate(50 50)"/>` : `<text x="50" y="72" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="64" fill="#fff">${esc(step.n)}</text>`;
  return `<g transform="translate(70 210) scale(${k})"><rect x="0" y="0" width="${100 + lw}" height="100" rx="10" fill="#15151C" opacity="0.92"/><rect x="0" y="0" width="100" height="100" rx="10" fill="${C.red}"/>${num}
    ${lines.map((l, i) => `<text x="${118}" y="${lines.length === 1 ? 64 : 44 + i * 40}" font-family="Oswald" font-weight="700" font-size="38" fill="#fff">${esc(l.toUpperCase())}</text>`).join("")}</g>`;
}
function titleBlock(title, t) {
  if (!title) return "";
  const k = easeOut(t / 0.4);
  const fit = (str) => Math.min(86, 86 * 960 / Math.max(1, measure(str.toUpperCase(), 86)));
  const s0 = fit(title[0]), s1 = title[1] ? fit(title[1]) : 86;
  return `<g opacity="${k}" transform="translate(0 ${(1 - k) * -30})">${textLines([title[0].toUpperCase()], 540, 330, s0, "#fff")}${title[1] ? textLines([title[1].toUpperCase()], 540, 330 + Math.max(s0, 70) * 1.15, s1, C.red) : ""}</g>`;
}
function pillLabel(label, lt, y = 560) {
  if (!label) return "";
  const k = backOut((lt - 0.15) / 0.35);
  const w = measure(label.toUpperCase(), 52) + 90;
  return `<g transform="translate(540 ${y}) scale(${clamp(k, 0, 2)})"><rect x="${-w / 2}" y="-50" width="${w}" height="100" rx="50" fill="#15151C" opacity="0.9" stroke="${C.red}" stroke-width="5"/><text y="18" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="52" fill="#fff">${esc(label.toUpperCase())}</text></g>`;
}
function statCard(st, lt) {
  if (!st) return "";
  const k = backOut((lt - 0.1) / 0.45);
  let value = st.value;
  if (st.count) { // animate the leading number
    const m = String(st.value).match(/^(\D*)([\d.,]+)(.*)$/);
    if (m) { const target = parseFloat(m[2].replace(/\./g, "").replace(",", ".")); const v = target * easeOut(lt / 1.2); value = m[1] + (Number.isInteger(target) ? Math.round(v).toLocaleString("pt-BR") : v.toFixed(1).replace(".", ",")) + m[3]; }
  }
  const y = st.y || 860;
  return `<g transform="translate(540 ${y}) scale(${clamp(k, 0, 2)})"><rect x="-430" y="-200" width="860" height="${st.src ? 400 : 350}" rx="34" fill="#fff"/>
    ${st.top ? `<text y="-115" text-anchor="middle" font-family="Oswald" font-weight="500" font-size="50" fill="#555">${esc(st.top.toUpperCase())}</text>` : ""}
    <text y="${st.top ? 40 : 20}" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="${st.size || 150}" fill="${st.color || C.red}">${esc(value)}</text>
    ${st.sub ? `<text y="${st.top ? 115 : 105}" text-anchor="middle" font-family="Oswald" font-weight="500" font-size="48" fill="${C.ink}">${esc(st.sub.toUpperCase())}</text>` : ""}
    ${st.src ? `<text y="175" text-anchor="middle" font-family="Inter" font-size="30" fill="#888">Fonte: ${esc(st.src)}</text>` : ""}</g>`;
}
function caption(chunk, ct) {
  if (!chunk) return "";
  const k = backOut(ct / 0.18);
  const size = 92;
  const words = chunk.words;
  const total = words.reduce((a, w) => a + measure(w.w.toUpperCase(), size) + size * 0.19, -size * 0.19);
  const sc = total > 940 ? 940 / total : 1;
  let x = -total / 2, s = "";
  for (const w of words) {
    const ww = measure(w.w.toUpperCase(), size);
    s += `<text x="${x}" y="0" font-family="Oswald" font-weight="700" font-size="${size}" fill="${w.red ? C.red : "#fff"}" style="paint-order:stroke" stroke="#000" stroke-width="12" stroke-linejoin="round">${esc(w.w.toUpperCase())}</text>`;
    x += ww + size * 0.19;
  }
  return `<g transform="translate(540 ${chunk.y || 1180}) scale(${(0.85 + 0.15 * k) * sc})" opacity="${clamp(ct / 0.08)}">${s}</g>`;
}

// ---------------------------------------------------------------- prop animation
function placeProp(p, lt, dur, i) {
  const d = p.d ?? 0.15 * i;
  const pt = lt - d;
  if (pt < 0 && p.a !== "none" && p.a !== "drive" && p.a !== "float") return "";
  const fn = P[p.k];
  if (!fn) return `<!-- unknown prop ${p.k} -->`;
  let x = p.x ?? 540, y = p.y ?? 900, s = p.s ?? 1, r = p.r || 0, op = 1;
  const a = p.a || "pop";
  if (a === "pop") s *= clamp(backOut(pt / 0.35), 0, 2);
  if (a === "fade") op = clamp(pt / 0.4);
  if (a === "slideL") x = lerp(-300, x, easeOut(pt / 0.45));
  if (a === "slideR") x = lerp(1380, x, easeOut(pt / 0.45));
  if (a === "slideU") y = lerp(2200, y, easeOut(pt / 0.5));
  if (a === "fall") y = lerp(-300, y, backOut(pt / 0.5));
  if (a === "drive" && p.to) { const k = easeInOut(clamp(lt / (p.dur || dur))); x = lerp(x, p.to[0], k); y = lerp(y, p.to[1] ?? y, k); }
  if (a === "shake") { s *= clamp(backOut(pt / 0.3), 0, 2); x += Math.sin(lt * 40) * 8; }
  if (p.float) y += Math.sin(lt * 2.5 + i) * 14;
  if (p.pulse) s *= 1 + Math.sin(lt * 6) * 0.05;
  if (p.spin) r += lt * p.spin;
  if (p.wob) r += Math.sin(lt * 3) * p.wob;
  if (p.out && lt > p.out) op *= clamp(1 - (lt - p.out) / 0.25);
  const flip = p.flip ? -1 : 1;
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(1)}) scale(${(s * flip).toFixed(3)} ${s.toFixed(3)})" opacity="${op.toFixed(2)}">${fn(Math.max(0, pt), p)}</g>`;
}

function renderScene(sc, lt, dur) {
  // camera
  let cam = "";
  const camK = easeInOut(clamp(lt / Math.max(dur, 0.1)));
  const mode = sc.cam || "push";
  if (mode === "push") { const z = 1 + 0.07 * camK; cam = `translate(540 960) scale(${z}) translate(-540 -960)`; }
  if (mode === "pull") { const z = 1.08 - 0.07 * camK; cam = `translate(540 960) scale(${z}) translate(-540 -960)`; }
  if (mode === "panL") cam = `translate(${30 - 60 * camK} 0) scale(1.06) translate(-30 -50)`;
  if (mode === "panR") cam = `translate(${-30 + 60 * camK} 0) scale(1.06) translate(-30 -50)`;
  if (mode === "shake") { const z = 1.04; cam = `translate(${Math.sin(lt * 37) * 9} ${Math.cos(lt * 31) * 9}) translate(540 960) scale(${z}) translate(-540 -960)`; }
  const bg = (BG[sc.bg] || BG.dark)(lt);
  const props = (sc.props || []).map((p, i) => (p.k === "char" ? "" : placeProp(p, lt, dur, i)));
  let chars = "";
  for (const ch of [].concat(sc.char || [])) {
    let x = ch.x ?? 540;
    if (ch.to !== undefined) x = lerp(ch.x ?? 540, ch.to, easeInOut(clamp(lt / (ch.dur || dur))));
    const enter = ch.a === "pop" ? clamp(backOut(lt / 0.35), 0, 2) : 1;
    chars += person(lt, { ...ch, x, s: (ch.s || 1.4) * enter });
  }
  const back = props.filter((_, i) => sc.props[i].behind).join("");
  const front = props.filter((_, i) => !sc.props[i].behind).join("");
  const flash = lt < 0.08 ? `<rect width="${W}" height="${H}" fill="#fff" opacity="${0.35 * (1 - lt / 0.08)}"/>` : "";
  const vign = sc.dim ? `<rect width="${W}" height="${H}" fill="#000" opacity="${sc.dim}"/>` : "";
  return `<g transform="${cam}">${bg}${back}${chars}${front}</g>${vign}${flash}`;
}

if (typeof module !== "undefined") module.exports = { W, H, renderScene, badge, titleBlock, pillLabel, statCard, caption, clamp };
if (typeof window !== "undefined") Object.assign(window, { renderScene, badge, titleBlock, pillLabel, statCard, caption, clamp, easeOut });
