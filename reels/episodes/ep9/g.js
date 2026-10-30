const G = [
  // Hook: the biggest YouTuber earns more from chocolate than from his videos.
  ["hook_k", 0.1, 4.5, kicker("hk", "MRBEAST · CREATOR ECONOMY"), [rise("#hk", 0.0, 0.3)], true],
  ["hook_t", 2.2, 2.4, fbox("h0", `<span>mais com</span> <span class="markbig" id="h1">chocolate</span>`), [rise("#h0", 0.0, 0.25), slam("#h1", 0.25, -3)], true],
  ["virada", 5.3, 3.3, fbox("v0", `<span>a nova</span> <span class="serif big">virada</span> <span>do mercado</span>`), [rise("#v0", 0.0, 0.3)], true],
  // Investor documents.
  ["docs", 9.8, 4.8, `
    ${tile("d_doc", "pen", "", "documentos", 40, 330)}
    ${tile("d_inv", "people", "", "investidores", 828, 330)}`,
    [pop("#d_doc", 2.0), pop("#d_inv", 2.7)]],
  // Chocolate vs videos.
  ["cmp", 14.7, 7.9, `
    <div class="card cmp" id="mc" style="left:70px;top:${FB}px;width:940px">
      <div class="crow" id="mr1"><div class="clab">chocolate<small>em um ano</small></div><div class="cbar"><i id="mb1"></i></div><div class="cval" id="mv1">US$ 0 mi</div></div>
      <div class="crow" id="mr2"><div class="clab">vídeos<small>no mesmo ano</small></div><div class="cbar"><i id="mb2" class="red"></i></div><div class="cval red">prejuízo</div></div>
    </div>`,
    [rise("#mc", 0.0, 0.35), `tl.fromTo("#mb1", { width: "0%" }, { width: "100%", duration: 1.3, ease: "power2.out" }, 1.1);`,
     `const m1 = { v: 0 }; tl.to(m1, { v: 250, duration: 1.3, ease: "power2.out", onUpdate: () => { document.getElementById("mv1").textContent = "US$ " + Math.round(m1.v) + " mi"; } }, 1.1);`,
     `tl.set("#mr2", { opacity: 0 }, 0.0);`, rise("#mr2", 5.4, 0.3),
     `tl.fromTo("#mb2", { width: "0%" }, { width: "6%", duration: 0.5, ease: "power2.out" }, 5.6);`],
    true],
  ["inverteu", 22.6, 2.9, fbox("i0", `<span>o mercado</span> <span class="markbig small">inverteu</span>`), [rise("#i0", 0.0, 0.3)], true],
  // Videos became marketing; the product is the business.
  ["mkt", 25.6, 7.2, `
    <div class="side" id="k1" style="left:10px;top:330px;width:340px"><div class="sans">vídeos =</div><div class="serif huge" style="font-size:64px">marketing</div></div>
    ${tile("k_prod", "briefcase", "", "produto = negócio", 760, 330, 120, "#16a34a")}`,
    [rise("#k1", 1.0, 0.35), pop("#k_prod", 3.4)]],
  ["qualquer", 32.9, 3.0, fbox("q0", `<span>serve pra</span> <span class="serif big">qualquer</span> <span>pessoa</span>`), [rise("#q0", 0.0, 0.3)], true],
  // Audience + something to offer.
  ["valor", 36.0, 7.2, `
    <div class="stack" style="left:30px;top:340px">
      <div class="spill" id="a1"><span class="num">01</span>audiência</div>
      <div class="spill" id="a2"><span class="num">02</span>algo pra oferecer</div>
    </div>`,
    [pop("#a1", 0.2), pop("#a2", 5.3)]],
  // CTA: profile print.
  ["cta", 43.3, 2.97, `<div class="pcard" id="pc"><img src="${PERFIL}" /><div class="ctasub">me segue 👆</div></div>`, [pop("#pc", 0.05)], true],
];
