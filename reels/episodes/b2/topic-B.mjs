// Script B: "500 mil no 1º mês — as 3 decisões". ep04/ep05/ep06 = three hooks, same body.
// Medium framing (chin ~47%): cards sit under the chin, in front (the torso would hide a card behind the cut-out).
import { mix, tiles, card, cta } from "./lib.mjs";

export const EMPH = ["três", "conteúdo", "anúncio", "orgânica", "fomo", "suspense", "influenciadoras", "jornalistas", "comunidade", "recompra", "genial", "anuncia", "diferença", "escalar", "500", "16"];
export const hookEnd = ({ p }) => p("e essas aqui foram");
const money = (id, t0, t1, at, kicker) => card(id, t0, t1, { kicker, big: `R$ <span class="red">500 mil</span>`, bigAt: at });

export const hook = {
  ep04: () => [], // the iPad with the real result is the hook visual: nothing goes over it
  ep05: ({ w, HOOK }) => [
    mix("h1", 0.0, w("faturei") - 0.05, [["com", w("com")], ["16 anos", w("16"), "mark"]]),
    money("h2", w("faturei") - 0.05, HOOK - 0.05, w("500"), "1º MÊS DA MINHA EMPRESA"),
  ],
  ep06: ({ w, HOOK }) => [
    mix("h1", 0.0, w("500") - 0.15, [["como eu", w("como")], ["fiz?", w("fiz"), "serif"]]),
    money("h2", w("500") - 0.15, HOOK - 0.05, w("500"), "E-COMMERCE · 1º MÊS"),
  ],
};

export function body({ b, bp, HOOK, DUR }) {
  return [
    mix("tres", HOOK - 0.05, bp("a primeira") - 0.1, [["as", b("três") - 0.1], ["3 decisões", b("três"), "serif"]]),
    tiles("d1", bp("a primeira") - 0.1, b("hoje") - 0.1, [
      { icon: "camera", label: "conteúdo", at: b("conteúdo"), x: "✓", xat: b("conteúdo") + 0.4 },
      { icon: "megaphone", label: "anúncio", at: b("anúncio"), x: "✕", xat: b("anúncio") + 0.3 },
    ], { kicker: "DECISÃO 01" }),
    mix("ning", b("hoje") - 0.1, bp("as pessoas querem") - 0.1, [["ninguém quer ver", b("ninguém")], ["anúncio", b("anúncio", 2), "strike"]]),
    mix("org", bp("as pessoas querem") - 0.1, bp("a segunda") - 0.1, [[["de forma", b("forma")], ["orgânica", b("orgânica"), "serif"]], [["na rotina de quem já", b("rotina")], ["acompanha", b("acompanha"), "red"]]]),
    card("fomo", bp("a segunda") - 0.1, b("enquanto") - 0.1, { kicker: "DECISÃO 02", big: "FOMO", bigAt: b("fomo"), sub: `medo de <span class="serif">ficar de fora</span>`, subAt: b("fomo") + 0.5 }),
    tiles("susp", b("enquanto") - 0.1, b("deixando") - 0.1, [
      { icon: "users", label: "todo mundo queria", at: b("queriam") },
      { icon: "lock", label: "suspense", at: b("suspense"), color: "#ff3b30" },
    ]),
    tiles("infl", b("deixando") - 0.1, b("terceiro") - 0.3, [
      { icon: "star", num: "01", label: "influenciadoras", at: b("influenciadoras") },
      { icon: "mic", num: "02", label: "jornalistas", at: b("jornalistas") },
      { icon: "megaphone", num: "03", label: "burburinho", at: b("burburinho"), color: "#ff3b30" },
    ], { kicker: "SÓ ALGUNS USAVAM PRIMEIRO" }),
    tiles("com", b("terceiro") - 0.3, bp("ou seja") - 0.1, [
      { icon: "users", label: "comunidade", at: b("comunidade", 2) },
      { icon: "party", label: "eventos", at: b("eventos") },
      { icon: "repeat", label: "recompra", at: b("recompra"), color: "#ff3b30" },
    ], { kicker: "DECISÃO 03" }),
    mix("jeito", bp("ou seja") - 0.1, bp("já me segue") - 0.15, [[["produto", bp("o produto pode")], ["genial", b("genial"), "strike"]], [["o", b("jeito") - 0.1], ["jeito", b("jeito"), "serif"], ["que você anuncia", b("anuncia")]]]),
    cta("cta", bp("já me segue") - 0.15, DUR, `escalar sua <span class="serif">operação</span>`, "me segue pra ver como 👇"),
  ];
}
