import { jinxNewsBriefSchema, type JinxNewsBrief } from "./jinx-news-schema";
import { jinxDailyLinesSchema, jinxNotesSchema, type JinxDailyLines, type JinxNotes } from "./jinx-notes-schema";

/** Synthetic Maç gündemi for the mock preview: sample sentences, example.com sources. */
export function mockJinxNewsBrief(key: string): JinxNewsBrief {
  const now = Date.now(), day = (offset: number) => new Date(now - offset * 86_400_000).toISOString().slice(0, 10);
  return jinxNewsBriefSchema.parse({
    schemaVersion: "btb-jinx-news.v1", matchKey: key, status: "AVAILABLE", displayOnly: true,
    generatedAt: new Date(now - 40 * 60_000).toISOString(), observedAt: new Date(now).toISOString(),
    refreshAvailableAt: new Date(now - 10 * 60_000).toISOString(),
    bullets: [
      { date: day(1), text: "Örnek: Ev sahibinin kaptanı hafif sakatlığı nedeniyle maç kadrosunda yer almıyor.", sources: [0] },
      { date: day(2), text: "Örnek: Deplasman takımı grupta ikinci sırada; tur için en az beraberliğe ihtiyaç duyuyor.", sources: [1, 0] },
      { date: day(4), text: "Örnek: Ev sahibi son dört iç saha maçında yenilmedi.", sources: [1] }
    ],
    sources: [{ title: "Örnek kaynak A", url: "https://example.com/haber-a" }, { title: "Örnek kaynak B", url: "https://example.com/haber-b" }]
  });
}

/** Synthetic Jinx notes for the mock preview. */
export function mockJinxNotes(key: string): JinxNotes {
  const at = new Date(Date.now() - 20 * 60_000).toISOString();
  return jinxNotesSchema.parse({ contractVersion: "btb-jinx-notes.v1", matchKey: key, status: "AVAILABLE", notes: [
    { kind: "DECISION", decisionId: null, text: "Örnek: Karar 63. dakikada, skor 1-0 iken kaydedildi; havuzdaki 10 benzer maçın 8'i destekliyordu.", generatedAt: at },
    { kind: "PRE", decisionId: null, text: "Örnek: Ev sahibi kaptanından yoksun; deplasman tur için en az bir puan arıyor.", generatedAt: at }
  ] });
}

/** Synthetic mascot lines for the mock preview. */
export function mockJinxDailyLines(): JinxDailyLines {
  return jinxDailyLinesSchema.parse({ contractVersion: "btb-jinx-lines.v1", day: new Date().toISOString().slice(0, 10), status: "AVAILABLE",
    signature: "mock", stale: false, lines: ["Örnek: Bugün 3 öneri yayımlandı, biri hâlâ bekliyor.", "Örnek: Bugünün Banko listesi 3 maçlı.",
      "Örnek: Dün BTB öneri yayımlamadı."] });
}
