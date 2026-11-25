import { jinxNewsBriefSchema, type JinxNewsBrief } from "./jinx-news-schema";

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
