const G = [
  // Hook: everyone posts day 1, nobody posts day 47.
  ["hook_k", 0.1, 5.5, kicker("hk", "TAVA PENSANDO AQUI"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 2.5, 3.1, fbox("h0", `<span>dia</span> <span class="markbig" id="h1">1</span> <span>×</span> <span>dia</span> <span class="markbig" id="h2">47</span>`), [rise("#h0", 0.0, 0.25), slam("#h1", 0.7, -3), slam("#h2", 1.8, 3)], true],
  // Day 1: new project, gym, focus.
  ["dia1", 5.7, 5.4, `
    ${tile("d_brief", "briefcase", "", "novo projeto", 40, 330)}
    ${tile("d_gym", "dumbbell", "", "academia", 828, 330)}`,
    [pop("#d_brief", 2.5), pop("#d_gym", 3.9)]],
  ["todos", 11.1, 2.2, fbox("t0", `<span>todo mundo</span> <span class="serif big">quer ver</span>`), [rise("#t0", 0.0, 0.3)], true],
  // Day 47: boring, nobody watching.
  ["d47", 13.4, 6.0, `
    <div class="side" id="q1" style="left:10px;top:330px;width:300px"><div class="sans">dia</div><div class="serif huge">47</div></div>
    ${tile("q_clk", "clock", "", "ninguém vê", 790, 330, 120, "#ff3b30")}`,
    [rise("#q1", 0.2, 0.35), pop("#q_clk", 3.3)]],
  ["parar", 19.4, 2.5, fbox("p0", `<span>vontade de</span> <span class="markbig small">parar</span>`), [rise("#p0", 0.9, 0.3)], true],
  ["separa", 22.0, 6.0, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="s1"><span class="num">01</span>dia 47</div>
      <div class="spill" id="s2"><span class="num">02</span>dia 53</div>
      <div class="spill" id="s3"><span class="num">03</span>dias aleatórios</div>
    </div>`,
    [pop("#s1", 1.6), pop("#s2", 2.8), pop("#s3", 5.0)]],
  ["desiste", 28.1, 3.0, fbox("x0", `<span>quem</span> <span class="serif big">quer</span> <span>× quem</span> <span class="markbig small">desiste</span>`), [rise("#x0", 0.0, 0.3)], true],
  ["internet", 31.2, 3.2, `${tile("i_gl", "globe", "", "a internet parece perfeita", 40, 330)}`, [pop("#i_gl", 1.4)]],
  ["nada", 34.4, 2.4, fbox("n0", `<span>nada acontece no</span> <span class="markbig small">dia 1</span>`), [rise("#n0", 0.9, 0.3)], true],
  ["res_k", 36.9, 5.6, kicker("rk", "O RESULTADO VEM"), [rise("#rk", 0.4, 0.3)], true],
  ["ninguem", 40.6, 1.9, fbox("g0", `<span>no dia que</span> <span class="serif big">ninguém</span> <span>tá vendo</span>`), [rise("#g0", 0.0, 0.3)], true],
  // CTA: comment so we connect.
  ["cta_k", 42.4, 5.27, kicker("ck", "SE VOCÊ TAMBÉM TÁ CONSTRUINDO"), [rise("#ck", 0.3, 0.3)], true],
  ["cta", 44.4, 3.27, fbox("c0", `<span>comenta</span> <span class="markbig small">aqui</span> <span>👇</span>`), [rise("#c0", 0.0, 0.3)], true],
];
