const G = [
  // Hook: what do people regret most at the end of life?
  ["hook_k", 0.1, 3.9, kicker("hk", "VOCÊ JÁ PAROU PRA PENSAR?"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 1.6, 2.4, fbox("h0", `<span>o maior</span> <span class="markbig small">arrependimento</span>`), [rise("#h0", 0.9, 0.3)], true],
  // Bronnie Ware, an Australian nurse.
  ["bronnie", 4.1, 4.8, `
    <div class="side" id="b1" style="left:10px;top:330px;width:340px"><div class="sans">enfermeira</div><div class="serif huge" style="font-size:58px">Bronnie Ware</div></div>
    ${tile("b_gl", "globe", "", "Austrália", 790, 330)}`,
    [rise("#b1", 1.7, 0.35), pop("#b_gl", 1.1)]],
  ["cuid", 8.9, 3.5, `${tile("c_ht", "heart", "", "anos cuidando de pacientes", 40, 330, 120, "#ff3b30")}`, [pop("#c_ht", 1.2)]],
  ["notou", 12.4, 2.2, fbox("n0", `<span>o que elas mais</span> <span class="serif big">falavam</span>`), [rise("#n0", 0.0, 0.3)], true],
  // Regret number 1: courage.
  ["n1_k", 14.6, 3.7, kicker("nk", "ARREPENDIMENTO Nº 1"), [rise("#nk", 0.0, 0.3)], true],
  ["coragem", 17.2, 1.1, fbox("c0", `<span class="markbig" id="c1">coragem</span>`), [rise("#c0", 0.0, 0.2), slam("#c1", 0.1, -3)], true],
  ["viver", 18.3, 5.9, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="v1"><span class="num">✓</span>a vida que queriam</div>
      <div class="spill" id="v2"><span class="num">✕</span>a expectativa dos outros</div>
    </div>`,
    [pop("#v1", 2.7), pop("#v2", 4.6)]],
  ["surp_k", 24.3, 4.4, kicker("sk", "O QUE MAIS SURPREENDEU"), [rise("#sk", 0.0, 0.3)], true],
  ["naofez", 28.8, 2.1, fbox("x0", `<span>não ter</span> <span class="markbig small">feito</span>`), [rise("#x0", 0.8, 0.3)], true],
  ["medo", 30.9, 4.8, `
    <div class="side" id="m1" style="left:10px;top:330px;width:340px"><div class="sans">medo da</div><div class="serif huge red" style="font-size:62px">aprovação</div></div>`,
    [rise("#m1", 3.3, 0.35)]],
  ["estudo", 35.7, 3.1, fbox("e0", `<span>pensa nesse</span> <span class="serif big">estudo</span>`), [rise("#e0", 0.8, 0.3)], true],
  // CTA: profile print.
  ["cta", 38.8, 4.4, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
];
