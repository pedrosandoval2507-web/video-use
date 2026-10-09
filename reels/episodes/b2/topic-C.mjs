// Script C: "3 erros que eu cometi no meu e-commerce". ep07/ep08/ep09 = three hooks, same body.
import { mix, tiles, card, stat, cta } from "./lib.mjs";

export const EMPH = ["três", "erros", "errado", "quebrei", "estoque", "igual", "sazonalidade", "ofertas", "posicionar", "fornecedores", "equipe", "prejudicaram", "marca", "domínio", "disponível", "perdido", "cnpj", "bobos"];
export const hookEnd = ({ p, w }) => {
  const t = p("primeiro erro");
  try { const o = p("o primeiro erro"); if (Math.abs(o - t) < 0.6) return o; } catch {}
  return t;
};

export const hook = {
  ep07: ({ w, HOOK }) => [
    mix("h1", 0.0, w("não") - 0.05, [["vai abrir um", w("abrir")], ["e-commerce?", w("e-commerce"), "serif"]]),
    tiles("h2", w("não") - 0.05, HOOK - 0.05, [1, 2, 3].map((k) => ({ icon: "warning", num: `0${k}`, label: "erro", at: w("três") + (k - 1) * 0.15, x: "✕", xat: w("cometi") + (k - 1) * 0.1 })), { kicker: "NÃO COMETA" }),
  ],
  ep08: ({ w, HOOK }) => [
    mix("h1", 0.0, w("eu") - 0.05, [["ninguém posta o que", w("ninguém")], ["deu errado", w("errado"), "serif"]]),
    mix("h2", w("eu") - 0.05, HOOK - 0.05, [["os meus", w("contar")], ["erros", w("errado", 2), "mark"]]),
  ],
  ep09: ({ w, HOOK }) => [
    mix("h1", 0.0, w("faturava") - 0.1, [["eu quase", w("quase")], ["quebrei", w("quebrei"), "serif"]]),
    card("h2", w("faturava") - 0.1, w("e") - 0.05, { kicker: "UMA EMPRESA QUE FATURAVA", big: `<span class="red">6 dígitos</span>/mês`, bigAt: w("seis") }, { L: "back", overlap: 50 }),
    mix("h3", w("e") - 0.05, HOOK - 0.05, [["3 erros", w("três"), "mark"], ["bobos", w("bobos"), "serif"]]),
  ],
};

export function body({ b, bp, HOOK, DUR }) {
  return [
    tiles("e1", HOOK - 0.05, bp("eu achava") - 0.1, [
      { icon: "box", label: "estoque demais", at: b("estoque"), color: "#ff3b30" },
      { icon: "chart", label: "depois de um mês bom", at: b("bom") - 0.2 },
    ], { kicker: "ERRO 01" }),
    mix("igual", bp("eu achava") - 0.1, b("mas") - 0.1, [["todo mês", b("todo")], ["igual", b("igual"), "strike"]]),
    tiles("saz", b("mas") - 0.1, bp("ou seja") - 0.1, [
      { icon: "waves", label: "sazonalidade", at: b("sazonalidade") },
      { icon: "tag", label: "ofertas", at: b("ofertas") },
    ], { kicker: "A VERDADE" }),
    tiles("qdo", bp("ou seja") - 0.1, b("segundo") - 0.3, [{ icon: "calendar", label: "quando comprar de novo", at: b("quando"), color: "#ff3b30" }]),
    mix("pos", b("segundo") - 0.3, bp("não saber") - 0.1, [["não se", b("posicionar") - 0.4], ["posicionar", b("posicionar"), "serif"]], { kicker: "ERRO 02" }),
    tiles("forn", bp("não saber") - 0.1, b("porque") - 0.1, [
      { icon: "truck", num: "01", label: "fornecedores", at: b("fornecedores") },
      { icon: "handshake", num: "02", label: "o que exigir", at: b("exigir") },
      { icon: "users", num: "03", label: "equipe", at: b("equipe") },
    ]),
    mix("peq", b("porque") - 0.1, bp("e o erro") - 0.1, [[["pequenas", b("pequenas")], ["ações", b("ações"), "serif"]], [["grande", b("prejudicaram") - 0.1], ["prejuízo", b("prejudicaram") + 0.2, "mark"]]]),
    mix("marca", bp("e o erro") - 0.1, bp("eu já estava") - 0.1, [["antes de lançar a", b("lançar")], ["marca", b("marca"), "serif"]], { kicker: "ERRO 03" }),
    tiles("logo", bp("eu já estava") - 0.1, bp("e quando") - 0.1, [
      { icon: "star", num: "01", label: "logo", at: b("logo") },
      { icon: "tag", num: "02", label: "peças", at: b("peças") },
      { icon: "globe", num: "03", label: "domínio?", at: b("domínio"), color: "#ff3b30" },
    ]),
    card("indisp", bp("e quando") - 0.1, b("então") - 0.1, { icon: "globe", kicker: "SUAMARCA.COM.BR", big: `<span class="red">indisponível</span>`, bigAt: b("disponível", 2), sub: "outra empresa já tinha o nome", subAt: b("nome", 3) }, { L: "back", overlap: 50 }),
    stat("perd", b("então") - 0.1, bp("já salva") - 0.15, { value: "2", post: `<span class="u">meses perdidos</span>`, at: b("dois") - 0.1 }),
    cta("cta", bp("já salva") - 0.15, DUR, `salva antes de abrir o <span class="serif">CNPJ</span>`, "e me segue pra mais 👇"),
  ];
}
