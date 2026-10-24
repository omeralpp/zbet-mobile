import type { MatchJourneyPoint } from "@/src/api/schemas";
import type { RebuildObservation, RebuildPoolPath } from "@/src/api/rebuild-statistics-schemas";
import type { RebuildRecommendation } from "@/src/api/rebuild-schemas";
import { formatQuote, formatUnits, resultPresentation } from "@/src/utils/rebuild-display";
import { formatSelection } from "@/src/utils/format";
import { observedChanges, type IntervalReading } from "@/src/utils/rebuild-pressure";
import type { VisibleEvent } from "./live-context-view";
import { journeyVertices } from "./journey-story";

/**
 * Maçın yolu (v45 board, owner approval 2026-10-22): one minute axis that
 * carries the score story, both teams' events, the pool-alignment line when a
 * source exposes it, and BTB's published decisions as tickets.
 *
 * RB1 does not expose the expected-score pool path yet
 * (RB1_POOL_PATH_NOT_EXPOSED), so an RB1 match never draws a line and never
 * borrows legacy pool history: it says so once. Provider events are the
 * source of goal and card minutes; RB1 observations fill a change only when
 * the provider has no event for it, and say that their minute is the first
 * observation of the new state.
 */
export type PathMomentKind = "GOAL" | "RED_CARD" | "BTB" | "POOL" | "LATEST" | "ACTIVITY";
export type PathSide = "HOME" | "AWAY";

export interface PathMoment {
  key: string;
  minute: number;
  kind: PathMomentKind;
  side: PathSide | null;
  railTitle: string;
  railSub: string;
  /** Short spoken summary for the marker and the rail button. */
  label: string;
  score: string | null;
  record: RebuildRecommendation | null;
  /** Extra lines for the selected-moment panel. */
  lines: string[];
}

export interface ScoreChip { key: string; minute: number; label: string; current: boolean }

export interface PathModel {
  moments: PathMoment[];
  chips: ScoreChip[];
  line: { minute: number; level: number; connects?: boolean }[];
  poolShare: boolean;
  referenceMinute: number | null;
  /** Shown instead of the line; null when the line is drawn. */
  lineNotice: { title: string; body: string } | null;
  maxMinute: number;
  nowMinute: number | null;
  halfTimeLabel: string | null;
  defaultKey: string | null;
  headline: string;
}

export interface PathInput {
  match: { homeTeam: string; awayTeam: string; status: string; elapsed: number; homeScore: number; awayScore: number };
  isRebuild: boolean;
  events: readonly VisibleEvent[];
  observations: readonly RebuildObservation[];
  records: readonly RebuildRecommendation[];
  /** Legacy pool-alignment points; never passed for an RB1 match. */
  journeyPoints: readonly MatchJourneyPoint[];
  halfTimeScore: string | null;
  latestReading: IntervalReading | null;
  latestReadingKind?: "ACTIVITY";
  poolPath?: RebuildPoolPath | undefined;
}

const unmeasured = "Olayın dakikası kayıtlı. Bu olaya ait havuz etkisi ölçülmedi.";

function team(input: PathInput, side: PathSide | null) {
  return side === "HOME" ? input.match.homeTeam : side === "AWAY" ? input.match.awayTeam : "";
}

function stars(count: number) {
  return "★".repeat(count);
}

function levelHeadline(level: number) {
  return level >= 0.7 ? "Havuz beklentisiyle uyumlu" : level >= 0.3 ? "Beklentiden uzaklaşıyor" : "Havuzun sıra dışı yolu";
}

export function buildMatchPath(input: PathInput): PathModel {
  const live = input.match.status === "LIVE" || input.match.status === "HALF_TIME";
  const moments: PathMoment[] = [];
  const eventScores = new Set<string>();
  const eventGoals = { HOME: 0, AWAY: 0 };
  const eventReds = { HOME: 0, AWAY: 0 };

  for (const event of input.events) {
    if (event.minute == null || event.minute < 0 || !event.side) continue;
    const side = event.side;
    if (event.kind === "GOAL") {
      const score = event.scoreAfter ? `${event.scoreAfter.home}–${event.scoreAfter.away}` : null;
      if (score) eventScores.add(score);
      eventGoals[side] += 1;
      const kind = event.goalKind === "PENALTY" ? "Penaltı golü" : event.goalKind === "OWN_GOAL" ? "Kendi kalesine gol" : "Gol";
      const player = event.scorer?.rawName ?? null;
      moments.push({
        key: `event:${event.eventKey}`, minute: event.minute, kind: "GOAL", side,
        railTitle: `${event.minuteLabel || `${event.minute}′`} · ${kind}`,
        railSub: [team(input, side), score].filter(Boolean).join(" · "),
        label: `${event.minute}. dakika ${kind.toLocaleLowerCase("tr-TR")}, ${team(input, side)}${score ? `, skor ${score}` : ""}`,
        score, record: null, lines: player ? [`${player} · ${team(input, side)}`, unmeasured] : [unmeasured]
      });
    } else {
      eventReds[side] += 1;
      const title = event.redCardType === "SECOND_YELLOW_RED" ? "İkinci sarıdan kırmızı" : "Kırmızı kart";
      const player = event.player?.rawName ?? null;
      moments.push({
        key: `event:${event.eventKey}`, minute: event.minute, kind: "RED_CARD", side,
        railTitle: `${event.minuteLabel || `${event.minute}′`} · ${title}`, railSub: team(input, side),
        label: `${event.minute}. dakika ${title.toLocaleLowerCase("tr-TR")}, ${team(input, side)}`,
        score: null, record: null, lines: player ? [`${player} · ${team(input, side)}`, unmeasured] : [unmeasured]
      });
    }
  }

  // RB1 observations only add what the provider timeline is missing.
  const observedGoals = { HOME: 0, AWAY: 0 };
  const observedReds = { HOME: 0, AWAY: 0 };
  for (const change of observedChanges(input.observations)) {
    if (change.kind === "GOAL") {
      observedGoals[change.side] += 1;
      if (eventScores.has(change.score) || observedGoals[change.side] <= eventGoals[change.side]) continue;
    }
    if (change.kind === "RED_CARD") {
      observedReds[change.side] += 1;
      if (observedReds[change.side] <= eventReds[change.side]) continue;
    }
    const observed = `${change.minute}′ kaydında görüldü; olay dakikası sağlayıcıdan gelmedi.`;
    if (change.kind === "GOAL") {
      moments.push({ key: `observed:${change.key}`, minute: change.minute, kind: "GOAL", side: change.side,
        railTitle: `${change.minute}′ · Skor kaydı`, railSub: `${team(input, change.side)} · ${change.score}`,
        label: `${change.minute}. dakika skor kaydı, ${team(input, change.side)}, skor ${change.score}`,
        score: change.score, record: null, lines: [`Yeni skor ${change.score} ilk kez ${observed}`] });
    } else if (change.kind === "RED_CARD") {
      moments.push({ key: `observed:${change.key}`, minute: change.minute, kind: "RED_CARD", side: change.side,
        railTitle: `${change.minute}′ · Kart kaydı`, railSub: team(input, change.side),
        label: `${change.minute}. dakika kırmızı kart kaydı, ${team(input, change.side)}`,
        score: null, record: null, lines: [`Kırmızı kart ilk kez ${observed}`] });
    }
  }

  for (const record of input.records) {
    const result = resultPresentation[record.result.state];
    const at = `${record.homeScore}–${record.awayScore}`;
    moments.push({
      key: `btb:${record.decisionId}`, minute: record.minute, kind: "BTB", side: null,
      railTitle: `${record.minute}′ · BTB kararı`,
      railSub: `${stars(record.stars)} · ${formatQuote(record.quote)} · ${result.label}`,
      label: `${record.minute}. dakika BTB kararı, ${formatSelection(record.market) || record.market}, ${record.stars} yıldız, seçim oranı ${formatQuote(record.quote)}, ${result.label}`,
      score: at, record,
      lines: [
        `Karar anındaki skor ${at}; oran ve yıldız o anda dondu.`,
        record.result.state === "PENDING" ? "Sonuç maç bitince hesaplanır."
          : `Sonuç ${result.label.toLocaleLowerCase("tr-TR")} · ${formatUnits(record.result.net)} birim (varsayımsal).`
      ]
    });
  }

  const poolShare = input.isRebuild;
  const poolPoints = input.poolPath?.availability === "AVAILABLE" ? input.poolPath.points : [];
  const line = input.isRebuild ? poolPoints.map(point => ({minute:point.minute,level:point.level,connects:point.connects})) : journeyVertices([...input.journeyPoints]);
  const reference = input.isRebuild ? undefined : input.journeyPoints.find((point) => point.referenceChange && point.plotMinute !== null);
  if (reference && reference.plotMinute !== null) {
    moments.push({ key: `pool:${reference.key}`, minute: reference.plotMinute, kind: "POOL", side: null,
      railTitle: `${reference.plotMinute}′ · Yeni havuz`, railSub: input.halfTimeScore ? `İY ${input.halfTimeScore}` : "Devre",
      label: "Devre arası, yeni havuz", score: input.halfTimeScore, record: null,
      lines: ["Devre skoruna göre maç sonu havuzu seçildi; çizgi bu yüzden basamak yapar."] });
  }

  const latestLevel = line.at(-1)?.level;
  const latestPool = poolPoints.at(-1);
  const poolHeadline = latestPool ? `Havuzda kalan pay %${Math.round(latestPool.level*100)} · ${latestPool.remainingCount}/${latestPool.baselineCount} referans` : null;
  const describeLevel = (value:number) => poolShare ? poolHeadline ?? `Havuzda kalan pay %${Math.round(value*100)}` : levelHeadline(value);
  const lastObserved = input.observations.at(-1);
  const nowMinute = live ? Math.max(0, input.match.elapsed) : null;
  if (live && nowMinute !== null) {
    const score = `${input.match.homeScore}–${input.match.awayScore}`;
    const reading = input.latestReading;
    moments.push({
      key: "latest", minute: nowMinute, kind: "LATEST", side: null,
      railTitle: `${nowMinute}′ · Son kayıt`,
      railSub: latestLevel !== undefined ? describeLevel(latestLevel) : reading ? reading.headline : score,
      label: `Son kayıt, ${nowMinute}. dakika, skor ${score}`, score, record: null,
      lines: [
        latestLevel !== undefined ? describeLevel(latestLevel) : null,
        reading ? `${input.latestReadingKind === "ACTIVITY" ? "Son hareketlilik penceresi" : "Son baskı aralığı"} ${reading.range} · ${input.latestReadingKind === "ACTIVITY" ? reading.headline.replace("baskın", "daha hareketli") : reading.headline} (ev ${reading.homeText} · deplasman ${reading.awayText})`
          : input.isRebuild ? input.latestReadingKind === "ACTIVITY" ? "Doğrulanmış 5 dakikalık hareketlilik penceresi yok." : "Bu maç için kayıtlı baskı aralığı yok." : null,
        lastObserved ? `Son doğrulanmış gözlem ${lastObserved.minute}′.` : null
      ].filter((text): text is string => Boolean(text))
    });
  }

  const order: Record<PathMomentKind, number> = { POOL: 0, GOAL: 1, RED_CARD: 2, BTB: 3, LATEST: 4, ACTIVITY: 5 };
  moments.sort((a, b) => a.minute - b.minute || order[a.kind] - order[b.kind]);

  const finalScore = `${input.match.homeScore}–${input.match.awayScore}`;
  const chips: ScoreChip[] = [{ key: "start", minute: 0, label: "0–0", current: false }];
  for (const moment of moments) {
    if (moment.kind === "GOAL" && moment.score && moment.score !== chips.at(-1)?.label) {
      chips.push({ key: moment.key, minute: moment.minute, label: moment.score, current: false });
    }
  }
  if (input.match.status !== "NOT_STARTED" && chips.at(-1)?.label !== finalScore) {
    // The scoreboard knows a score no event explains; show it where it is known.
    chips.push({ key: "scoreboard", minute: nowMinute ?? Math.max(90, ...moments.map((moment) => moment.minute)), label: finalScore, current: false });
  }
  const lastChip = chips.at(-1);
  if (lastChip && input.match.status !== "NOT_STARTED") lastChip.current = true;

  const maxMinute = Math.max(90, nowMinute ?? 0, ...moments.map((moment) => moment.minute), ...line.map((vertex) => vertex.minute));
  const latestBtb = [...moments].reverse().find((moment) => moment.kind === "BTB");
  const lastGoal = [...moments].reverse().find((moment) => moment.kind === "GOAL");
  const defaultKey = live ? "latest" : latestBtb?.key ?? lastGoal?.key ?? moments.at(-1)?.key ?? null;

  const lineNotice = (poolShare ? line.length > 0 : line.length > 1) ? null : input.isRebuild
    ? { title: "Havuzda kalan pay kaydı yok", body: "Doğrulanmış havuz yolu bulunamadı; eski maçlar için sonradan çizgi üretilmez. Skor, olaylar ve BTB kararları gösteriliyor." }
    : { title: "Havuz uyumu kaydı yok", body: "Bu maç için havuz kaydı yok; geçmişe çizgi üretilmez." };
  const headline = input.match.status === "NOT_STARTED" ? "Başlama düdüğünden sonra ilk kayıtla başlar."
    : line.length > 0 && latestLevel !== undefined ? describeLevel(latestLevel)
      : "Skor, iki takımın olayları ve BTB kararları tek zaman çizgisinde.";

  return {
    moments, chips, line, poolShare, referenceMinute: poolShare ? poolPoints.find(point=>point.phase==="2H")?.minute ?? null : reference?.plotMinute ?? null, lineNotice, maxMinute, nowMinute,
    halfTimeLabel: input.halfTimeScore ? `İY ${input.halfTimeScore}` : null,
    defaultKey, headline
  };
}
