const G = [
  // Hook: Itaú just bought a Brazilian startup for almost R$ 3 billion.
  ["hook_k", 0.1, 5.4, kicker("hk", "ESSA SEMANA · ITAÚ"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 3.9, 1.75, fbox("h0", `<span>quase</span> <span class="markbig" id="h1">R$ 3 bi</span>`), [rise("#h0", 0.0, 0.25), slam("#h1", 0.3, -3)], true],
  ["neo", 5.7, 3.3, `
    <div class="side" id="n1" style="left:10px;top:330px;width:340px"><div class="sans">a startup</div><div class="serif huge" style="font-size:72px">NeoSpace</div></div>
    <div class="side" id="n2" style="left:730px;top:330px;width:340px"><div class="sans">tem só</div><div class="serif huge red" style="font-size:96px">2 anos</div></div>`,
    [rise("#n1", 0.9, 0.35), rise("#n2", 2.2, 0.35)]],
  ["ia", 9.0, 3.6, `${tile("i_key", "key", "", "IA para bancos", 40, 330)}`, [pop("#i_key", 1.4)]],
  ["como", 12.6, 3.9, fbox("c0", `<span>como isso</span> <span class="serif big">aconteceu</span>`), [rise("#c0", 0.4, 0.3)], true],
  // Client -> partner -> owner.
  ["passos", 16.5, 16.4, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="p1"><span class="num">01</span>cliente</div>
      <div class="spill" id="p2"><span class="num">02</span>sócio · 15% por US$ 15 mi</div>
      <div class="spill" id="p3"><span class="num">03</span>dono · 100% por R$ 2,9 bi</div>
    </div>`,
    [pop("#p1", 1.2), pop("#p2", 3.9), pop("#p3", 11.8)]],
  ["nao", 33.0, 2.3, fbox("v0", `<span>não</span> <span class="serif big">venderam</span> <span>pro banco</span>`), [rise("#v0", 0.0, 0.3)], true],
  ["resolve", 35.3, 4.8, fbox("r0", `<span>resolveram um</span> <span class="markbig small">problema</span>`), [rise("#r0", 0.7, 0.3)], true],
  ["pitch_k", 40.1, 4.9, kicker("pk", "O MELHOR PITCH"), [rise("#pk", 0.3, 0.3)], true],
  ["pitch", 42.3, 2.7, fbox("x0", `<span>não</span> <span class="serif big">vive sem</span> <span>você</span>`), [rise("#x0", 0.0, 0.3)], true],
  // CTA: profile print.
  ["cta", 45.03, 2.3, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
];
