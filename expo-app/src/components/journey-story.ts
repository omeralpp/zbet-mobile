import type { LiveContext, MatchJourney, MatchJourneyPoint, SuperLog } from '../api/schemas';
import { visibleEvents } from './live-context-view';
import { buildSuperRatingMarker } from './super-rating-marker';
import { unavailablePressureMessage } from '../utils/recent-pressure';

export type JourneyMoment = {
  key: string; minute: number | null; label: string; title: string;
  score: string | null; side: 'HOME' | 'AWAY' | null;
  kind: 'GOAL' | 'RED_CARD' | 'POOL_CHANGE' | 'CORRECTION' | 'SUPER';
  player: string | null; point: MatchJourneyPoint | undefined;
  /** Set only on SUPER moments: the recorded decision and its star count. */
  superKey?: string; stars?: number;
};

/**
 * Recorded Super decisions as chart moments (owner decision 2026-10-16: the
 * score and star flow lives inside Maçın Yolu). A decision is a recorded BTB
 * selection at a minute, not a match event and not a measured pool effect, so
 * it never carries a journey point or a score.
 */
export function superMoments(decisions: readonly SuperLog[]): JourneyMoment[] {
  return decisions.map(decision => ({
    key: `super:${decision.key}`, minute: decision.elapsed, label: `${decision.elapsed}′`,
    title: `Super · ${decision.selectedOdd}`, score: null, side: null, kind: 'SUPER' as const,
    player: null, point: undefined, superKey: decision.key,
    stars: buildSuperRatingMarker(decision.rating).starCount
  }));
}

/** Match events, captures and recorded Super decisions on one minute axis. */
export function journeyAndSuperMoments(points: MatchJourneyPoint[], context: LiveContext | undefined,
  decisions: readonly SuperLog[]): JourneyMoment[] {
  return [...journeyMoments(points, context), ...superMoments(decisions)]
    .sort((a,b) => (a.minute ?? Infinity) - (b.minute ?? Infinity));
}

/** Join only an exact score transition. A nearby capture is not proof of an event's effect. */
export function journeyMoments(points: MatchJourneyPoint[], context?: LiveContext): JourneyMoment[] {
  const claimed = new Set<string>();
  const moments: JourneyMoment[] = visibleEvents(context?.timeline).map(event => {
    const capture = event.kind === 'GOAL' && event.scoreAfter
      ? points.find(p => p.kind === 'GOAL' && !claimed.has(p.key) &&
          p.home === event.scoreAfter!.home && p.away === event.scoreAfter!.away)
      : undefined;
    // A delayed capture of the same goal is not a second goal. Its attribution
    // remains unavailable when we cannot align the capture to the event time.
    if (capture) claimed.add(capture.key);
    const point = capture && capture.minute !== null && event.minute != null &&
      Math.abs(capture.minute - event.minute) <= 2 ? capture : undefined;
    return {
      key: event.eventKey, minute: event.minute != null && event.minute >= 0 ? event.minute : null,
      label: event.minuteLabel || (event.minute == null ? 'Dakika yok' : `${event.minute}′`),
      title: event.kind === 'RED_CARD' ? (event.redCardType === 'SECOND_YELLOW_RED' ? 'İkinci sarıdan kırmızı' : 'Kırmızı kart')
        : event.goalKind === 'PENALTY' ? 'Penaltı golü' : event.goalKind === 'OWN_GOAL' ? 'Kendi kalesine gol' : 'Gol',
      score: event.kind === 'GOAL' && event.scoreAfter ? `${event.scoreAfter.home}–${event.scoreAfter.away}` : null,
      side: event.side ?? null, kind: event.kind, player: event.scorer?.rawName ?? event.player?.rawName ?? null, point
    };
  });
  for (const point of points) {
    if ((point.kind !== 'GOAL' || claimed.has(point.key)) && !point.referenceChange && point.kind !== 'CORRECTION') continue;
    moments.push({ key: `capture:${point.key}`, minute: point.plotMinute,
      label: point.plotMinute === null ? 'Dakika yok' : `${point.elapsed || point.plotMinute}′`,
      title: point.referenceChange ? 'İkinci yarı havuzu' : point.kind === 'CORRECTION' ? 'Skor / dakika düzeltmesi' : 'Gol kaydı',
      score: point.home === null || point.away === null ? null : `${point.home}–${point.away}`,
      side: null, kind: point.referenceChange ? 'POOL_CHANGE' : point.kind === 'CORRECTION' ? 'CORRECTION' : 'GOAL', player: null, point });
  }
  return moments.sort((a,b) => (a.minute ?? Infinity) - (b.minute ?? Infinity));
}

/** Keep every real level; rebase vertically at the new reference's own minute. */
export function journeyVertices(points: MatchJourneyPoint[]) {
  const vertices: { minute: number; level: number }[] = [];
  for (const point of points) {
    if (point.level === null || point.plotMinute === null) continue;
    const previous = vertices.at(-1);
    if (previous && point.referenceChange) vertices.push({minute: point.plotMinute, level: previous.level});
    vertices.push({minute: point.plotMinute, level: point.level});
  }
  return vertices;
}

export function poolLeaders(pool: MatchJourney['pools'][number] | undefined) {
  if (!pool) return [];
  return [...pool.rows].sort((a,b) => b.count-a.count).slice(0,3)
    .map(row => ({...row, share: row.count / pool.count}));
}

export function pressureReading(point: MatchJourneyPoint | undefined) {
  const context = point?.decisionContext;
  if (context?.recentPressure.availability === 'UNAVAILABLE') return unavailablePressureMessage(context.recentPressure.reason).detail;
  if (context?.contractVersion === 'decision-context.v3' && context.recentPressure.availability === 'AVAILABLE') {
    const path = context.expectedScorePressure;
    const scores = path.leaders.map(row => row.score).join(' / ');
    if (path.state === 'MIXED') return 'Tahmini baskı var · lider skorlar farklı yollar gerektiriyor';
    if (path.state === 'PRESERVATION') return context.recentPressure.total === 0
      ? `Beklenen ${scores} skoru gerçekleşmiş · bu aralıkta hücum hareketliliği yok`
      : `Beklenen ${scores} skoru gerçekleşmiş · hücum hareketliliği skorun korunmasına karşı`;
    if (path.state === 'TOWARD') return `Tahmini baskı beklenen ${scores} skoruna doğru`;
    if (path.state === 'AGAINST') return path.reason === 'REQUIRED_DIRECTION_NOT_ESTABLISHED'
      ? `Beklenen ${scores} için gereken baskı yönü oluşmamış`
      : `Tahmini baskı beklenen ${scores} skoruna karşı`;
    return 'Baskı kaydı var · beklenen skor yönü doğrulanamadı';
  }
  const value = point?.pressureAlignment;
  if (value == null) return 'Bu kayıtta baskı ölçümü yok';
  if (value === 0) return 'Baskı dengede';
  return value > 0 ? 'Baskı havuz beklentisini destekliyor' : 'Baskı havuz beklentisine karşı';
}

/** A known event minute is not an exact timestamp or a measured pool effect. */
export function journeyMomentEffect(moment: JourneyMoment) {
  if (moment.kind === 'SUPER') return `BTB bu dakikada ${moment.stars ?? 1} yıldızlı Super tercihi kaydetti. Bu bir karar kaydıdır; maç olayı veya ölçülmüş havuz etkisi değildir.`;
  if (moment.kind === 'POOL_CHANGE') return 'Devre skoruna göre yeni bir havuz seçildi. Çizgideki basamak, referansın değişmesidir.';
  const point = moment.point;
  if (point?.eliminatedRatio != null) return `${point.beforeCount} uyumlu sonuçtan ${point.eliminatedCount} elendi; ${point.compatibleCount} kaldı. Bu, golün havuz etkisi; olay sürprizi yüzdesi değil.`;
  return moment.minute === null ? 'Bu olayın dakikası bilinmiyor. Havuz etkisi ölçülmedi.'
    : 'Olayın dakikası kayıtlı. Bu olaya ait havuz etkisi ölçülmedi.';
}

/** Marks are drawn at a fixed pixel width, so two events a few minutes apart can
 *  still collide on a phone-width axis while two far apart never do. Group by
 *  rendered distance from each group's own anchor — not by equal minute, and not
 *  by chaining from the previous member, so a run of near-neighbours cannot
 *  swallow a span wider than one mark. Expects the minute-sorted output of
 *  `journeyMoments`; unplaced events carry no mark and are skipped here. */
export function markerGroups(moments: JourneyMoment[], position: (minute: number) => number, gap: number) {
  const groups: JourneyMoment[][] = [];
  for (const moment of moments) {
    if (moment.minute === null) continue;
    const anchor = groups.at(-1)?.[0];
    if (anchor?.minute != null && position(moment.minute) - position(anchor.minute) < gap) groups.at(-1)!.push(moment);
    else groups.push([moment]);
  }
  return groups;
}
