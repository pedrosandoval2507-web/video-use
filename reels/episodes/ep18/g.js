const G = [
  ["hook_k", 0.1, 3.3, kicker("hk", "TEMPO × DISTRAÇÃO"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 1.9, 1.6, fbox("h0", `<span>menos</span> <span class="markbig" id="h1">distração</span>`), [rise("#h0", 0.0, 0.25), slam("#h1", 1.0, -3)], true],
  ["horas", 3.8, 4.3, `
    <div class="side" id="n1" style="left:10px;top:330px;width:340px"><div class="sans">na internet por dia</div><div class="serif huge" style="font-size:110px">9h</div></div>
    ${tile("n_gl", "globe", "", "brasileiro médio", 790, 330)}`,
    [pop("#n_gl", 0.4), rise("#n1", 2.1, 0.35)]],
  ["trab", 8.2, 2.6, fbox("t0", `<span>mais do que a maioria</span> <span class="serif big">trabalha</span>`), [rise("#t0", 0.5, 0.3)], true],
  ["semtempo", 11.1, 4.6, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="s1"><span class="num">✕</span>treinar</div>
      <div class="spill" id="s2"><span class="num">✕</span>estudar</div>
      <div class="spill" id="s3"><span class="num">✕</span>projeto novo</div>
    </div>`,
    [pop("#s1", 1.7), pop("#s2", 2.3), pop("#s3", 3.9)]],
  ["correta", 15.8, 4.1, fbox("c0", `<span>não sabemos usar o</span> <span class="markbig small">tempo</span>`), [rise("#c0", 2.4, 0.3)], true],
  ["exerc_k", 19.97, 7.4, kicker("ek", "FAZ O EXERCÍCIO"), [rise("#ek", 0.0, 0.3)], true],
  ["exerc", 21.2, 6.2, `${tile("e_clk", "clock", "", "tempo de tela", 40, 330, 120, "#ff3b30")}`, [pop("#e_clk", 2.6)]],
  ["assustei", 27.4, 2.9, fbox("a0", `<span>eu também</span> <span class="serif big">me assustei</span>`), [rise("#a0", 0.3, 0.3)], true],
  ["menos", 33.3, 1.4, fbox("m0", `<span>menos</span> <span class="markbig small">celular</span>`), [rise("#m0", 0.0, 0.25)], true],
  ["manha", 34.75, 4.9, `
    <div class="side" id="d1" style="left:10px;top:330px;width:340px"><div class="sans">celular longe</div><div class="serif huge" style="font-size:72px">de manhã</div></div>
    ${tile("d_up", "up", "", "rendo mais", 790, 330, 120, "#16a34a")}`,
    [rise("#d1", 1.9, 0.35), pop("#d_up", 4.2)]],
  ["bloq", 39.77, 3.6, fbox("b0", `<span>não precisa se</span> <span class="serif big">bloquear</span>`), [rise("#b0", 0.1, 0.3)], true],
  ["decide_k", 43.39, 8.3, kicker("dk", "DECIDA"), [rise("#dk", 0.0, 0.3)], true],
  ["decide", 43.39, 8.3, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="q1"><span class="num">01</span>quando ela entra</div>
      <div class="spill" id="q2"><span class="num">02</span>como ela entra</div>
      <div class="spill" id="q3"><span class="num">✓</span>aprendizagem</div>
      <div class="spill" id="q4"><span class="num">✕</span>distração</div>
    </div>`,
    [pop("#q1", 2.6), pop("#q2", 4.4), pop("#q3", 6.2), pop("#q4", 7.5)]],
  ["coment", 53.0, 4.38, fbox("k0", `<span>comenta seu</span> <span class="markbig small">tempo de tela</span>`), [rise("#k0", 0.0, 0.3)], true],
  ["cta", 57.38, 2.82, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
];