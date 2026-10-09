// Script A: "com quem você anda" (Christakis & Fowler, NEJM 2007). ep01/ep02/ep03 = three hooks, same body.
// Close-up selfie framing: the face fills the width, so graphics stay compact (one row) under the chin.
import { mix, tiles, stat, bar, cta } from "./lib.mjs";

export const EMPH = ["anda", "anos", "57%", "obeso", "peso", "felicidade", "redor", "andando", "maioria", "deles", "surpreender", "engorda", "2007"];
export const hookEnd = ({ p }) => p("tem um estudo");

export const hook = {
  ep01: ({ w, HOOK }) => [
    mix("h1", 0.0, w("aonde") - 0.05, [["com quem você", w("com")], ["anda", w("anda"), "serif"]]),
    mix("h2", w("aonde") - 0.05, HOOK - 0.05, [["daqui a", w("daqui")], ["5 anos", w("5"), "mark"]]),
  ],
  ep02: ({ w, HOOK }) => [
    mix("h1", 0.0, w("você", 2) - 0.05, [["se um amigo", w("amigo")], ["engorda", w("engorda"), "serif"]]),
    stat("h2", w("você", 2) - 0.05, HOOK - 0.05, { value: "57", post: "%", countTo: 57, at: w("57%") - 0.1 }),
  ],
  ep03: ({ w, HOOK }) => [
    mix("h1", 0.0, w("e") - 0.05, [["12 mil pessoas", w("12"), "mark"], ["por", w("por")], ["32 anos", w("32"), "serif"]]),
    mix("h2", w("e") - 0.05, HOOK - 0.05, [["vai te", w("vai")], ["surpreender", w("surpreender"), "serif"]]),
  ],
};

export function body({ b, bp, DUR }) {
  return [
    mix("est", bp("tem um estudo") - 0.1, b("acompanhou") - 0.1, [["estudo de", bp("tem um estudo")], ["2007", b("2007"), "mark"]], { kicker: "NEW ENGLAND JOURNAL OF MEDICINE" }),
    stat("n12", b("acompanhou") - 0.1, b("ele") - 0.15, { value: "12", post: `<span class="u">mil pessoas</span>`, countTo: 12, at: b("12") - 0.1, src: "Christakis &amp; Fowler, 2007" }),
    tiles("ami", b("ele") - 0.1, b("chance") - 0.15, [
      { icon: "person", label: "amigo", at: b("amigo") },
      { icon: "arrow", label: "", at: b("obeso") - 0.1 },
      { icon: "person", label: "você", at: b("sua"), color: "#ff3b30" },
    ]),
    bar("p57", b("chance") - 0.15, bp("não é só") - 0.1, { label: "chance de engordar", pct: 57, at: b("57%") - 0.2 }),
    mix("peso", bp("não é só") - 0.1, b("os") - 0.1, [["não é só", bp("não é só")], ["peso", b("peso"), "strike"]]),
    tiles("tb", b("os") - 0.1, b("isso") - 0.1, [
      { icon: "smile", num: "01", label: "felicidade", at: b("felicidade") },
      { icon: "repeat", num: "02", label: "hábitos", at: b("hábitos") },
    ], { kicker: "A MESMA PESQUISA ACHOU" }),
    mix("pas", b("isso") - 0.1, bp("ou seja") - 0.1, [["seus hábitos", b("seus")], ["passam", b("passam"), "serif"], ["pra você", bp("pelas pessoas")]]),
    tiles("obj", bp("ou seja") - 0.1, bp("veja com quem") - 0.1, [{ icon: "target", label: "seus objetivos", at: b("objetivos") - 0.25, color: "#ff3b30" }]),
    mix("veja", bp("veja com quem") - 0.1, b("essas") - 0.1, [["veja com quem", bp("veja com quem")], ["anda", b("andando"), "serif"]]),
    mix("proj", b("essas") - 0.1, b("porque") - 0.1, [["mesmo", b("mesmo")], ["projeto de vida", b("projeto"), "serif"]]),
    mix("mai", b("porque") - 0.1, b("já") - 0.15, [["a", b("maioria") - 0.1], ["maioria", b("maioria"), "mark"], ["te leva", b("ir")]]),
    cta("cta", b("já") - 0.15, DUR, `me <span class="serif">segue</span> aqui`, "pra ver mais conteúdos como esse 👇"),
  ];
}
