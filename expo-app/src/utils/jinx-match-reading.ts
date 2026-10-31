import type { AnalysisContext } from "../api/schemas";
import type { RebuildMatch, RebuildRecommendation } from "../api/rebuild-schemas";
import { latestPublished } from "./rebuild-hero";
import { currentRebuild } from "./rebuild-current";
import { resultPresentation } from "./rebuild-display";
import { formatSelection } from "./format";
import { jinxInsight, jinxQualityLimit } from "./jinx-insight";
import { jinxScoreCondition } from "./jinx-score-condition";

export type JinxReading = {
  title: string; text: string; tone: "neutral" | "warning";
  decisionId?: string;
  comparison?: { label: string; before: string; after: string };
  sources: { label: string; value: string }[];
};
type MatchContext = Pick<AnalysisContext, "matchKey" | "acquiredAt" | "expiresAt" | "sources" | "sourceAvailability">;
const fixture = (key: string) => key.split(":").slice(0, 2).join(":");
const fresh = (at: string, now: number, age: number) => Number.isFinite(Date.parse(at))
  && now >= Date.parse(at) && now - Date.parse(at) <= age;
const score = (home: number, away: number) => `${home}–${away}`;
const ratio = (support: number, used: number) => `${support}/${used}`;
const time = (at: string) => new Date(at).toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", second: "2-digit" });
const failedReasons: Record<string, string> = {
  PRESSURE_FAILED: "Son hesapta baskı koşulu sağlanmıyor.",
  LEADER_FAILED: "Son hesapta lider skorlardan biri bu seçimi desteklemiyor.",
  SCORE_FAILED: "Son hesapta tutarlılık puanı seçim eşiğinin altında.",
  CONFIRMATION_PENDING: "Yeni baskı teyidi henüz tamamlanmamış."
};

/** Prioritize material changes, then score conditions, then the frozen record.
 * Current fields never replace the frozen decision or its native result. */
export function jinxMatchReading({ record, data, matchKey, context, now, sourceFailed = false }: {
  record: RebuildRecommendation; data: RebuildMatch; matchKey: string;
  context?: MatchContext | undefined; now: number; sourceFailed?: boolean;
}): JinxReading {
  const initialScore = score(record.homeScore, record.awayScore);
  const sources = [{ label: "İlk karar", value: `${record.minute}′ · ${initialScore} · baskı ${ratio(record.votesSupport, record.votesUsed)}` }];
  const view = (title: string, text: string, comparison?: JinxReading["comparison"], warning = false): JinxReading =>
    ({ title, text, ...(comparison ? { comparison } : {}), tone: warning ? "warning" : "neutral", sources: [...sources] });
  const sameFixture = fixture(record.matchKey) === fixture(matchKey) && data.matchKey === matchKey;
  if (!sameFixture) return { title: "Kayıt doğrulanamadı", text: "Bu maçın karar kaydı doğrulanamadı.", tone: "warning", sources: [] };
  if (sourceFailed || data.availability === "UNAVAILABLE" || data.availability === "NOT_STARTED"
    || Date.parse(record.publishedAt) > Date.parse(data.asOf) || !fresh(data.asOf, now, 30_000)) return view("Güncel kontrol bekleniyor",
    "Son karar kaydı korunuyor; güncel değişim karşılaştırılamıyor.", undefined, true);

  const match = context?.sources.matchDetail;
  // Acquisition bounds our read of the current row; it is not a provider
  // measurement timestamp. Pressure changes use actual interval endpoints.
  const usableContext = context && match && match.currentMatchRecord && fixture(context.matchKey) === fixture(matchKey)
    && ["OK", "AVAILABLE", "SYNTHETIC"].includes(context.sourceAvailability.matchDetail ?? "")
    && fixture(match.key) === fixture(matchKey) && fresh(context.acquiredAt, now, 120_000)
    && Date.parse(context.acquiredAt) >= Date.parse(record.publishedAt) && Date.parse(context.expiresAt) >= now
    && Math.abs(Date.parse(context.acquiredAt) - Date.parse(data.asOf)) <= 30_000;
  const condition = usableContext ? jinxScoreCondition(record.market, match.homeScore, match.awayScore) : null;
  const currentScore = usableContext ? score(match.homeScore, match.awayScore) : null;
  if (usableContext) sources.push({ label: "Saha kontrolü", value: `${match.elapsed}′ · ${currentScore} · ${time(context.acquiredAt)}` });
  const scoreComparison = currentScore ? { label: "Skor", before: `${record.minute}′ · ${initialScore}`,
    after: `${match!.elapsed}′ · ${currentScore}` } : undefined;

  if (record.result.state === "VOID") return view("Karar geçersiz", "Bu karar geçersiz sonuçlanmış; kazanç veya kayıp diye değerlendirilmez.");
  if (record.result.state === "UNRESOLVED") return view("Sonuç doğrulanıyor", "Kararın sonucu henüz doğrulanamıyor; skor tek başına sonuç kaydının yerini tutmaz.", undefined, true);
  if (usableContext && match.status === "NOT_PLAYED") return view("Maç oynanmadı", "Maç oynanmamış; geçmiş karar güncel bir seçim gibi okunmamalı.");
  if (usableContext && (match.homeScore < record.homeScore || match.awayScore < record.awayScore))
    return view("Skor geriye değişmiş", "Son skor ilk kararın skorundan geriye değişmiş; önceki hesabın aynı kaldığı varsayılamaz.", scoreComparison, true);
  if (usableContext && match.status === "FINISHED" && condition) {
    sources.push({ label: "Karar sonucu", value: `${resultPresentation[record.result.state].label} · revizyon ${record.result.revision}` });
    if ((record.result.state === "WIN" && !condition.holds) || (record.result.state === "LOSS" && condition.holds))
      return view("Sonuç kontrolü gerekli", "Skor ile sonuç kaydı farklı görünüyor; aynı kapsamda doğrulama gerekiyor.", scoreComparison, true);
    if (record.result.state === "PENDING") return view("Sonuç kaydı bekleniyor",
      `Son skorla seçimin koşulu ${condition.holds ? "karşılanıyor" : "karşılanmıyor"}; kararın sonucu henüz kesinleşmemiş.`, scoreComparison, true);
    return view("Maç sonu değerlendirme", [`Karardaki ${initialScore} skoru ${currentScore} olmuş; seçimin skor koşulu ${condition.holds ? "sağlanmış" : "sağlanmamış"}.`, jinxQualityLimit(record)].filter(Boolean).join(" "), scoreComparison);
  }
  // A resolved record cannot borrow a later live snapshot as a new live signal.
  if (record.result.state !== "PENDING") return view("Karar anı", jinxInsight(record));
  if (usableContext && match.status === "FINISHED") return view("Maç sonu değerlendirme",
    "Maç tamamlanmış; bu pazarın skor koşulu eldeki kayıttan değerlendirilemiyor.");
  if (!usableContext || !["LIVE", "HALF_TIME"].includes(match.status)) {
    sources.push({ label: "Güncel kıyaslama", value: "Doğrulanmış güncel saha kaydı bekleniyor" });
    return view("Karar anı", jinxInsight(record));
  }
  if (["ENDPOINT_STALE", "QUOTE_STALE", "TRANSACTION_RECONCILIATION_REQUIRED"].includes(data.reason))
    return view("Güncel kanıt bekleniyor", "Yeni hesap için veri doğrulanamıyor; ilk kararın güncel teyidi varsayılamaz.", undefined, true);

  // A newer published record remains navigable after its live admission expires.
  // Existence of the record does not label it active or playable.
  const latest = latestPublished(data.history, matchKey);
  if (latest && Date.parse(latest.publishedAt) <= Date.parse(data.asOf) && latest.decisionId !== record.decisionId) return { ...view("Yeni karar var",
    "Bu kart önceki kararı gösteriyor; daha yeni bir BTB kararı yayımlanmış.",
    { label: "Pazar", before: formatSelection(record.market), after: formatSelection(latest.market) }), decisionId: latest.decisionId };
  if (data.reason === "RED_CARD_UNKNOWN") return view("Kart verisi yok",
    "Sağlayıcı kırmızı kart sayısını göndermiyor; güncel seçim teyidi yapılamıyor.", undefined, true);
  const candidates = data.candidates.filter(candidate => candidate.market === record.market);
  const candidate = candidates.length === 1 ? candidates[0] : null;
  if (candidate?.reason === "MARKET_ALREADY_DECIDED") return view("Pazar sonuçlandı",
    "Son kontrolde pazarın sonucu belirlenmiş; kararın sonuç kaydı ayrıca doğrulanır.");
  if (candidate?.marketOpen === false || /^(QUOTE_CLOSED|MARKET_CLOSED)$/.test(candidate?.reason ?? ""))
    return view("Pazar kapalı", "Son kontrolde bu pazar kapalı; ilk karardaki oran güncel işlem fiyatı değil.",
      { label: "Pazar", before: "Kararda açık", after: "Son kontrolde kapalı" }, true);

  // A positive number of evaluated windows and a later endpoint are required;
  // default zeroes from early rejection never become a pressure deterioration.
  const ends = candidate?.votes.map(vote => Date.parse(vote.endsAt)) ?? [];
  const measuredLater = candidate && candidate.votesUsed > 0 && candidate.votesSupport <= candidate.votesUsed
    && ends.length >= candidate.votesUsed && ends.every((end, index) => Number.isFinite(end) && end <= Date.parse(data.asOf)
      && end >= Date.parse(candidate.votes[index]!.startsAt))
    && Math.max(...ends) > Date.parse(record.publishedAt) && now - Math.max(...ends) <= 120_000;
  if (measuredLater && record.votesUsed > 0
    && candidate.votesSupport * record.votesUsed !== record.votesSupport * candidate.votesUsed) {
    const less = candidate.votesSupport * record.votesUsed < record.votesSupport * candidate.votesUsed;
    const confirmed = candidate.admitted && currentRebuild(data, now)?.decisionId === record.decisionId;
    const text = less ? !candidate.admitted
      ? "Baskı desteği azalmış; oran açık olsa da son hesap bu pazarı teyit etmiyor."
      : confirmed ? "Baskı desteği azalmış; son hesap bu seçimi yine de teyit ediyor."
        : "Baskı desteği azalmış; ilk kararın güncel teyidi ayrıca doğrulanmalı."
      : !candidate.admitted ? "Baskı desteği artmış; son hesap bu pazarı yine de uygun bulmuyor."
        : "Son baskı aralıklarında destek artmış; bu, ilk kararın yıldızını değiştirmez.";
    sources.push({ label: "Son baskı aralıkları", value: `${ratio(candidate.votesSupport, candidate.votesUsed)} · ${time(new Date(Math.max(...ends)).toISOString())}${candidate.votes.some(vote => vote.estimated) ? " · tahmini ölçüm var" : ""}` });
    return view(less ? "Baskı desteği azaldı" : "Baskı desteği arttı",
      text,
      { label: "Baskı teyidi", before: ratio(record.votesSupport, record.votesUsed), after: ratio(candidate.votesSupport, candidate.votesUsed) }, less);
  }
  if (candidate && !candidate.admitted && failedReasons[candidate.reason]) return view("İlk karar artık teyit edilmiyor",
    `${failedReasons[candidate.reason]} Eski kararın yıldızı güncel teyit değildir.`, undefined, true);
  if (measuredLater && candidate.directionConflict && !record.directionConflict)
    return view("Yeni yön çelişkisi", "İlk kararda bulunmayan yön çelişkisi son hesapta ortaya çıkmış.", undefined, true);
  if (usableContext && condition && ["LIVE", "HALF_TIME"].includes(match.status))
    return view(condition.irreversible ? "Skor koşulu belirleyici" : "Skorun kritik koşulu",
      [condition.text, jinxQualityLimit(record)].filter(Boolean).join(" "), scoreComparison);
  return view("Karar anı", jinxInsight(record));
}
