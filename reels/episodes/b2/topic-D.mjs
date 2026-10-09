// Script D: "quanto custa abrir uma empresa". ep10/ep11/ep12 = three hooks, same body.
// The face sits low in this take (leaning in), so graphics stay compact; build.mjs scales them to fit.
import { mix, tiles, stat, cta } from "./lib.mjs";

export const EMPH = ["mentira", "barato", "absurdo", "mei", "graça", "minutos", "domínio", "ia", "produto", "conteúdo", "celular", "reserva", "fazem", "50", "mil"];
export const hookEnd = ({ p }) => p("o primeiro ponto");

export const hook = {
  ep10: ({ w, HOOK }) => [
    mix("h1", 0.0, w("eu") - 0.05, [["precisa de", w("precisa")], ["R$ 50 mil?", w("50"), "serif"]]),
    mix("h2", w("eu") - 0.05, HOOK - 0.05, [["totalmente", w("totalmente")], ["mentira", w("mentira"), "mark"]]),
  ],
  ep11: ({ w, HOOK }) => [
    mix("h1", 0.0, w("e") - 0.05, [["quanto", w("quanto")], ["custa?", w("custa"), "serif"]]),
    mix("h2", w("e") - 0.05, HOOK - 0.05, [["muito mais", w("muito")], ["barato", w("barato"), "mark"]]),
  ],
  ep12: ({ w, HOOK }) => [
    mix("h1", 0.0, w("mas") - 0.05, [["um custo", w("custo")], ["absurdo", w("absurdo"), "strike"]]),
    mix("h2", w("mas") - 0.05, HOOK - 0.05, [["nem", w("nem")], ["R$ 1.000", w("mil"), "mark"]]),
  ],
};

export function body({ b, bp, HOOK, DUR, EP }) {
  const dom = EP === "ep11" ? "100" : "10";
  return [
    mix("p1", HOOK - 0.05, bp("o segundo ponto") - 0.1, [["01", HOOK, "small"], ["MEI", b("mei"), "mark"], ["de graça", b("graça"), "serif"]]),
    mix("p2", bp("o segundo ponto") - 0.1, bp("e domínio") - 0.1, [["02", bp("o segundo ponto"), "small"], ["loja online", b("loja")], ["com IA", b("ia"), "serif"]]),
    stat("dom", bp("e domínio") - 0.1, bp("o terceiro ponto") - 0.1, { pre: `<span class="u">menos de</span> R$ `, value: dom, at: b("menos") - 0.1, label: `alguns até <span class="serif">de graça</span>`, labelAt: b("graça", 3) }),
    mix("lote", bp("o terceiro ponto") - 0.1, bp("a verdade") - 0.1, [["vai", bp("gastar bastante") - 0.1], ["gastar muito?", bp("gastar bastante"), "serif"]], { kicker: "PONTO 03 · LOTE DO PRODUTO" }),
    tiles("vend", bp("a verdade") - 0.1, b("quarto") - 0.1, [
      { icon: "tag", num: "01", label: "vende", at: b("vende") },
      { icon: "box", num: "02", label: "compra", at: bp("depois compra") + 0.3 },
      { icon: "truck", num: "03", label: "entrega", at: b("manda") },
    ], { kicker: "NEM PRECISA TER PRODUTO" }),
    mix("cont", b("quarto") - 0.1, bp("e hoje") - 0.1, [["como vender?", bp("como que")], ["conteúdo", b("conteúdo"), "serif"]], { kicker: "PONTO 04 · O MAIS IMPORTANTE" }),
    tiles("free", bp("e hoje") - 0.1, bp("e por último") - 0.1, [
      { icon: "phone", label: "celular", at: b("celular") },
      { icon: "person", label: "conta", at: b("conta") },
      { icon: "camera", label: "conteúdo", at: bp("produz conteúdo") + 0.3 },
      { icon: "users", label: "audiência", at: b("audiência"), color: "#ff3b30" },
    ], { kicker: "R$ 0" }),
    mix("res", bp("e por último") - 0.1, bp("mas essa") - 0.1, [["uma", b("reserva") - 0.1], ["reserva", b("reserva"), "mark"], ["pro erro", b("errado")]], { kicker: "PONTO 05 · O ÚNICO QUE CUSTA" }),
    mix("faz", bp("mas essa") - 0.1, bp("já me segue") - 0.15, [["vão atrás e", b("atrás")], ["fazem", b("fazem"), "serif"]]),
    cta("cta", bp("já me segue") - 0.15, DUR, `me <span class="serif">segue</span> aqui`, "pra ver mais conteúdos como esse 👇"),
  ];
}
