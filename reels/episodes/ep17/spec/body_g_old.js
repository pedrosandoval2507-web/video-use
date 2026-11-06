  // Body (times relative to the body's start; the composer shifts them by the hook length).
  ["b_247", 0.0, 5.4, `
    <div class="side" id="b1" style="left:10px;top:330px;width:340px"><div class="sans">trabalhar</div><div class="serif huge" style="font-size:96px">24/7</div></div>
    ${tile("b_clk", "clock", "", "nunca parar", 790, 330, 120, "#ff3b30")}`,
    [rise("#b1", 2.9, 0.35), pop("#b_clk", 4.4)]],
  ["b_muito", 5.4, 5.2, fbox("m0", `<span>trabalhar</span> <span class="serif big">muito</span> <span>✓</span>`), [rise("#m0", 0.8, 0.3)], true],
  ["b_prior_k", 10.6, 5.9, kicker("pk", "ANTES DISSO"), [rise("#pk", 0.0, 0.3)], true],
  ["b_prior", 13.3, 3.2, fbox("p0", `<span>defina suas</span> <span class="markbig small">prioridades</span>`), [rise("#p0", 0.0, 0.3)], true],
  ["b_3", 16.8, 4.4, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="s1"><span class="num">01</span>sono</div>
      <div class="spill" id="s2"><span class="num">02</span>treino</div>
      <div class="spill" id="s3"><span class="num">03</span>trabalho</div>
    </div>`,
    [pop("#s1", 2.7), pop("#s2", 3.1), pop("#s3", 3.6)]],
  ["b_estr", 21.2, 3.9, fbox("e0", `<span>trabalho</span> <span class="serif big">não</span> <span>é o principal</span>`), [rise("#e0", 0.3, 0.3)], true],
  ["b_cab", 25.3, 9.0, `
    ${tile("c_sono", "clock", "", "dormir bem", 40, 330)}
    ${tile("c_tr", "dumbbell", "", "treinar", 828, 330)}`,
    [pop("#c_sono", 2.4), pop("#c_tr", 5.8)]],
  ["b_func", 34.4, 3.8, fbox("f0", `<span>a cabeça não</span> <span class="markbig small">funciona</span>`), [rise("#f0", 0.6, 0.3)], true],
  ["b_efic", 38.2, 3.9, fbox("x0", `<span>trabalhando, mas sem</span> <span class="serif big">eficiência</span>`), [rise("#x0", 1.5, 0.3)], true],
  ["b_conh_k", 42.2, 4.4, kicker("ck", "ANTES DAS PRIORIDADES"), [rise("#ck", 0.0, 0.3)], true],
  ["b_conh", 45.0, 1.6, fbox("c0", `<span>se</span> <span class="serif big">conhece</span>`), [rise("#c0", 0.0, 0.25)], true],
  ["b_manha", 46.6, 9.2, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="r0"><span class="num">☀</span>rendo mais de manhã</div>
      <div class="spill" id="r1"><span class="num">01</span>acordo cedo</div>
      <div class="spill" id="r2"><span class="num">02</span>treino</div>
      <div class="spill" id="r3"><span class="num">03</span>trabalho</div>
      <div class="spill" id="r4"><span class="num">04</span>durmo cedo</div>
    </div>`,
    [pop("#r0", 1.4), pop("#r1", 3.3), pop("#r2", 4.8), pop("#r3", 5.6), pop("#r4", 6.2)]],
  ["b_vc", 55.9, 4.8, fbox("v0", `<span>pra você pode ser</span> <span class="markbig small">diferente</span>`), [rise("#v0", 2.9, 0.3)], true],
  ["b_dica_k", 60.7, 5.9, kicker("dk", "A DICA"), [rise("#dk", 0.0, 0.3)], true],
  ["b_crie", 65.2, 1.4, fbox("d0", `<span>crie a</span> <span class="serif big">sua</span> <span>rotina</span>`), [rise("#d0", 0.0, 0.25)], true],
  ["cta", 66.6, 3.03, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
