const G = [
  // Hook: in 2008 SpaceX had money for one more rocket.
  ["hook_k", 0.1, 3.5, kicker("hk", "2008 · SPACEX"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 1.6, 2.0, fbox("h0", `<span>dinheiro pra</span> <span class="markbig" id="h1">1 foguete</span>`), [rise("#h0", 0.0, 0.25), slam("#h1", 0.9, -3)], true],
  // Money for 4 rockets, the first 3 exploded.
  ["quatro", 6.9, 4.5, `
    <div class="side" id="q1" style="left:10px;top:330px;width:340px"><div class="sans">dinheiro pra</div><div class="serif huge" style="font-size:80px">4 foguetes</div></div>
    ${tile("q_down", "down", "", "3 explodiram", 790, 330, 120, "#ff3b30")}`,
    [rise("#q1", 0.3, 0.35), pop("#q_down", 2.7)]],
  ["tesla", 11.4, 3.7, fbox("t0", `<span>a Tesla</span> <span class="markbig small">quase falindo</span>`), [rise("#t0", 0.0, 0.3)], true],
  ["fim", 15.2, 4.3, fbox("f0", `<span>era o</span> <span class="markbig" id="f1">fim</span>`), [rise("#f0", 0.0, 0.3), slam("#f1", 3.3, -3)], true],
  // September 2008: the 4th rocket reached orbit.
  ["orbita", 19.5, 4.4, `
    ${tile("o_up", "up", "", "4º foguete", 40, 330, 120, "#16a34a")}
    ${tile("o_ok", "check", "", "chegou na órbita", 790, 330, 120, "#16a34a")}`,
    [pop("#o_up", 1.6), pop("#o_ok", 3.8)]],
  ["nasa", 23.9, 6.9, `
    <div class="side" id="n1" style="left:10px;top:330px;width:340px"><div class="sans">contrato NASA</div><div class="serif huge" style="font-size:84px">US$ 1,6 bi</div></div>`,
    [rise("#n1", 3.7, 0.35)]],
  // June 2026: biggest IPO in history.
  ["ipo_k", 31.6, 7.3, kicker("ik", "JUNHO DE 2026"), [rise("#ik", 0.0, 0.3)], true],
  ["ipo_t", 35.6, 3.3, fbox("i0", `<span>o maior</span> <span class="serif big">IPO</span> <span>da história</span>`), [rise("#i0", 0.0, 0.3)], true],
  ["valor", 38.9, 8.1, `
    <div class="side" id="v1" style="left:10px;top:330px;width:340px"><div class="sans">levantou</div><div class="serif huge" style="font-size:84px">US$ 75 bi</div></div>
    <div class="side" id="v2" style="left:730px;top:330px;width:340px"><div class="sans">passou a valer</div><div class="serif huge red" style="font-size:84px">US$ 1,8 tri</div></div>`,
    [rise("#v1", 1.3, 0.35), rise("#v2", 5.8, 0.35)]],
  ["fechar", 47.0, 4.9, fbox("c0", `<span>a</span> <span class="serif big">um foguete</span> <span>de fechar</span>`), [rise("#c0", 2.2, 0.3)], true],
  // What separates failure from a case like this: one more try.
  ["coisa_k", 51.9, 7.5, kicker("ck", "FRACASSO × CASE DE SUCESSO"), [rise("#ck", 0.4, 0.3)], true],
  ["coisa", 57.9, 1.55, fbox("x0", `<span>mais uma</span> <span class="markbig small">tentativa</span>`), [rise("#x0", 0.0, 0.3)], true],
  // CTA: profile print.
  ["cta", 59.45, 2.52, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
];
