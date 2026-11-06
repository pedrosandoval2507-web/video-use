const G = [
  ["hook_k", 0.1, 5.43, kicker("hk", "WORKAHOLIC 24/7"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 3.0, 2.53, fbox("h0", `<span>você rende</span> <span class="markbig" id="hh1">menos</span>`), [rise("#h0", 0.0, 0.25), slam("#hh1", 1.2, -3)], true],
  // Body (times relative to the body's start; the composer shifts them by the hook length).
  ["b_247", 5.53, 5.4, `
    <div class="side" id="b1" style="left:10px;top:330px;width:340px"><div class="sans">trabalhar</div><div class="serif huge" style="font-size:96px">24/7</div></div>
    ${tile("b_clk", "clock", "", "nunca parar", 790, 330, 120, "#ff3b30")}`,
    [rise("#b1", 2.9, 0.35), pop("#b_clk", 4.4)]],
  ["b_muito", 10.93, 5.2, fbox("m0", `<span>trabalhar</span> <span class="serif big">muito</span> <span>✓</span>`), [rise("#m0", 0.8, 0.3)], true],
  ["b_prior_k", 16.13, 5.9, kicker("pk", "ANTES DISSO"), [rise("#pk", 0.0, 0.3)], true],
  ["b_prior", 18.83, 3.2, fbox("p0", `<span>defina suas</span> <span class="markbig small">prioridades</span>`), [rise("#p0", 0.0, 0.3)], true],
  ["b_3", 22.33, 4.4, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="s1"><span class="num">01</span>sono</div>
      <div class="spill" id="s2"><span class="num">02</span>treino</div>
      <div class="spill" id="s3"><span class="num">03</span>trabalho</div>
    </div>`,
    [pop("#s1", 2.7), pop("#s2", 3.1), pop("#s3", 3.6)]],
  ["b_estr", 26.73, 3.9, fbox("e0", `<span>trabalho</span> <span class="serif big">não</span> <span>é o principal</span>`), [rise("#e0", 0.3, 0.3)], true],
  ["b_cab", 30.84, 5.38, `
    ${tile("c_sono", "clock", "", "dormir bem", 40, 330)}
    ${tile("c_tr", "dumbbell", "", "treinar", 828, 330)}`,
    [pop("#c_sono", 1.2), pop("#c_tr", 2.0)]],
  ["b_func", 36.32, 3.44, fbox("f0", `<span>a cabeça não</span> <span class="markbig small">funciona</span>`), [rise("#f0", 0.6, 0.3)], true],
  ["b_efic", 39.76, 3.9, fbox("x0", `<span>trabalhando, mas sem</span> <span class="serif big">eficiência</span>`), [rise("#x0", 1.5, 0.3)], true],
  ["b_conh_k", 43.76, 4.4, kicker("ck", "ANTES DAS PRIORIDADES"), [rise("#ck", 0.0, 0.3)], true],
  ["b_conh", 46.56, 1.6, fbox("c0", `<span>se</span> <span class="serif big">conhece</span>`), [rise("#c0", 0.0, 0.25)], true],
  ["b_manha", 48.16, 8.77, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="r0"><span class="num">☀</span>rendo mais de manhã</div>
      <div class="spill" id="r1"><span class="num">01</span>acordo cedo</div>
      <div class="spill" id="r2"><span class="num">02</span>treino</div>
      <div class="spill" id="r3"><span class="num">03</span>trabalho</div>
      <div class="spill" id="r4"><span class="num">04</span>durmo cedo</div>
    </div>`,
    [pop("#r0", 1.1), pop("#r1", 3.3), pop("#r2", 4.9), pop("#r3", 5.1), pop("#r4", 5.7)]],
  ["b_vc", 56.96, 4.8, fbox("v0", `<span>pra você pode ser</span> <span class="markbig small">diferente</span>`), [rise("#v0", 2.9, 0.3)], true],
  ["b_dica_k", 61.76, 5.9, kicker("dk", "A DICA"), [rise("#dk", 0.0, 0.3)], true],
  ["b_crie", 66.26, 1.4, fbox("d0", `<span>crie a</span> <span class="serif big">sua</span> <span>rotina</span>`), [rise("#d0", 0.0, 0.25)], true],
  ["cta", 67.66, 3.03, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
];
