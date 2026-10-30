const G = [
  // Hook: remember Labubu?
  ["hook_k", 0.1, 2.5, kicker("hk", "POP MART · LABUBU"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 2.7, 2.0, fbox("h0", `<span>esgotava em</span> <span class="markbig small">minutos</span>`), [rise("#h0", 0.0, 0.3)], true],
  ["tripl", 4.7, 4.9, `
    <div class="side" id="t1" style="left:10px;top:330px;width:340px"><div class="sans">a Pop Mart quase</div><div class="serif huge" style="font-size:96px">3x</div></div>
    ${tile("t_up", "up", "", "em 2025", 790, 330, 120, "#16a34a")}`,
    [rise("#t1", 2.2, 0.35), pop("#t_up", 3.9)]],
  ["tri_k", 9.8, 3.0, kicker("rk", "RESULTADO DO TRIMESTRE"), [rise("#rk", 0.0, 0.3)], true],
  // Revenue almost halved; -70% in the US.
  ["receita", 12.9, 6.5, `
    <div class="card cmp" id="mc" style="left:70px;top:${FB}px;width:940px">
      <div class="crow" id="mr1"><div class="clab">receita<small>no trimestre</small></div><div class="cbar"><i id="mb1" class="red"></i></div><div class="cval red">−50%</div></div>
      <div class="crow" id="mr2"><div class="clab">nos EUA<small>no trimestre</small></div><div class="cbar"><i id="mb2" class="red"></i></div><div class="cval red">−70%</div></div>
    </div>`,
    [rise("#mc", 0.0, 0.35), `tl.fromTo("#mb1", { width: "100%" }, { width: "50%", duration: 0.9, ease: "power2.inOut" }, 0.7);`,
     `tl.set("#mr2", { opacity: 0 }, 0.0);`, rise("#mr2", 4.7, 0.3),
     `tl.fromTo("#mb2", { width: "100%" }, { width: "30%", duration: 0.9, ease: "power2.inOut" }, 5.0);`],
    true],
  ["fila", 19.4, 4.0, fbox("f0", `<span>tinha</span> <span class="serif big">fila</span> <span>na porta</span>`), [rise("#f0", 1.9, 0.3)], true],
  // He tried to hold the hype; the fad passed faster.
  ["hype", 23.4, 8.7, `
    <div class="side" id="y1" style="left:10px;top:330px;width:340px"><div class="sans">segurar o</div><div class="serif huge" style="font-size:96px">hype</div></div>
    ${tile("y_clk", "clock", "", "a moda passou", 790, 330, 120, "#ff3b30")}`,
    [rise("#y1", 1.8, 0.35), pop("#y_clk", 6.9)]],
  ["qualquer_k", 32.2, 5.4, kicker("qk", "SERVE PRA QUALQUER NEGÓCIO"), [rise("#qk", 2.0, 0.3)], true],
  ["passa", 37.6, 1.55, fbox("p0", `<span>a moda é</span> <span class="markbig small">passageira</span>`), [rise("#p0", 0.0, 0.3)], true],
  // Going viral is great; depending on it isn't.
  ["viral", 39.1, 7.9, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="s1"><span class="num">01</span>viralizar ✓</div>
      <div class="spill" id="s2"><span class="num">02</span>depender disso ✕</div>
    </div>`,
    [pop("#s1", 0.3), pop("#s2", 2.4)]],
  // CTA: profile print.
  ["cta", 47.06, 2.37, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
];
