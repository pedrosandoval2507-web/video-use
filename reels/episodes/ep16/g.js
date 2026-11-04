const G = [
  // Hook: what do people regret most at the end of life?
  ["hook_k", 0.1, 3.5, kicker("hk", "VOCÊ JÁ PAROU PRA PENSAR?"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 1.6, 2.0, fbox("h0", `<span>o maior</span> <span class="markbig small">arrependimento</span>`), [rise("#h0", 0.6, 0.3)], true],
  // Bronnie Ware, an Australian nurse.
  ["bronnie", 3.7, 4.5, `
    <div class="side" id="b1" style="left:10px;top:330px;width:340px"><div class="sans">enfermeira</div><div class="serif huge" style="font-size:58px">Bronnie Ware</div></div>
    ${tile("b_gl", "globe", "", "Austrália", 790, 330)}`,
    [rise("#b1", 1.7, 0.35), pop("#b_gl", 1.0)]],
  ["cuid", 8.3, 3.1, `${tile("c_ht", "heart", "", "anos cuidando de pacientes", 40, 330, 120, "#ff3b30")}`, [pop("#c_ht", 1.0)]],
  ["notou", 11.47, 2.1, fbox("n0", `<span>o que elas mais</span> <span class="serif big">falavam</span>`), [rise("#n0", 0.0, 0.3)], true],
  // Regret number 1: courage.
  ["n1_k", 13.6, 2.9, kicker("nk", "ARREPENDIMENTO Nº 1"), [rise("#nk", 0.0, 0.3)], true],
  ["coragem", 15.9, 0.7, fbox("c0", `<span class="markbig" id="c1">coragem</span>`), [rise("#c0", 0.0, 0.2), slam("#c1", 0.1, -3)], true],
  ["viver", 16.6, 4.6, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="v1"><span class="num">✓</span>a vida que queriam</div>
      <div class="spill" id="v2"><span class="num">✕</span>a expectativa dos outros</div>
    </div>`,
    [pop("#v1", 2.2), pop("#v2", 3.5)]],
  ["surp_k", 21.27, 4.1, kicker("sk", "O QUE MAIS SURPREENDEU"), [rise("#sk", 0.0, 0.3)], true],
  ["naofez", 25.45, 2.0, fbox("x0", `<span>não ter</span> <span class="markbig small">feito</span>`), [rise("#x0", 0.8, 0.3)], true],
  ["medo", 27.53, 4.4, `
    <div class="side" id="m1" style="left:10px;top:330px;width:340px"><div class="sans">medo da</div><div class="serif huge red" style="font-size:62px">aprovação</div></div>`,
    [rise("#m1", 3.3, 0.35)]],
  ["estudo", 32.0, 2.8, fbox("e0", `<span>pensa nesse</span> <span class="serif big">estudo</span>`), [rise("#e0", 1.7, 0.3)], true],
  // CTA: profile print.
  ["cta", 34.83, 3.94, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
];
