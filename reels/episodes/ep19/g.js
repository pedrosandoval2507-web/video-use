const G = [
  ["hook_k", 0.1, 5.6, kicker("hk", "EMPREENDEDORISMO"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 3.2, 2.4, fbox("h0", `<span>é</span> <span class="markbig" id="h1">chata</span> <span>e funciona</span>`), [rise("#h0", 0.0, 0.25), slam("#h1", 0.15, -3)], true],
  ["busca", 6.2, 6.0, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="s1"><span class="num">01</span>estratégia nova</div>
      <div class="spill" id="s2"><span class="num">02</span>ferramenta nova</div>
      <div class="spill" id="s3"><span class="num">03</span>curso novo</div>
    </div>`,
    [pop("#s1", 1.0), pop("#s2", 2.5), pop("#s3", 3.5)]],
  ["olha_k", 15.3, 2.6, kicker("ok", "OLHANDO PRA TRÁS"), [rise("#ok", 0.0, 0.3)], true],
  ["genial", 18.0, 1.45, fbox("g0", `<span>não foi algo</span> <span class="serif big">genial</span>`), [rise("#g0", 0.0, 0.25)], true],
  ["basico", 19.5, 1.85, fbox("b0", `<span>foi o</span> <span class="markbig small">básico</span> <span>bem feito</span>`), [rise("#b0", 0.9, 0.25)], true],
  ["exemplos", 21.37, 4.9, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="e1"><span class="num">01</span>responder rápido</div>
      <div class="spill" id="e2"><span class="num">02</span>entregar no prazo</div>
      <div class="spill" id="e3"><span class="num">03</span>cuidar do produto</div>
    </div>`,
    [pop("#e1", 1.4), pop("#e2", 2.7), pop("#e3", 3.4)]],
  ["chato", 26.33, 4.4, fbox("c0", `<span>o básico é</span> <span class="serif big">chato</span>`), [rise("#c0", 2.2, 0.3)], true],
  ["ninguem", 30.83, 2.9, fbox("n0", `<span>quase</span> <span class="markbig small">ninguém</span> <span>faz direito</span>`), [rise("#n0", 1.5, 0.3)], true],
  ["perg_k", 33.8, 5.5, kicker("pk", "ANTES DA PRÓXIMA IDEIA"), [rise("#pk", 0.0, 0.3)], true],
  ["perg", 36.9, 2.4, fbox("p0", `<span>o básico tá</span> <span class="serif big">bem feito</span><span>?</span>`), [rise("#p0", 0.0, 0.3)], true],
  ["cta", 39.32, 3.05, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
];