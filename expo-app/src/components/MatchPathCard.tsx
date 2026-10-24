import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import type { MatchDetail } from "@/src/api/schemas";
import { colors, fontFamilies, iconSizes, numericFont, radii, semantic, spacing, textFont, typeScale } from "@/src/theme/theme";
import { formatElapsed, formatSelection } from "@/src/utils/format";
import { matchPeriodLabel } from "@/src/utils/match-period";
import { formatQuote, formatUnits, resultPresentation, unitsTone } from "@/src/utils/rebuild-display";
import { ResultPill, toneColor } from "./DecisionTicket";
import { JourneyEventGlyph, journeySvgAccessibility } from "./JourneyEventIcon";
import { journeyDragIntent } from "./journey-interaction";
import type { PathModel, PathMoment } from "./match-path-model";
import type { PressureInterval } from "@/src/utils/rebuild-pressure";
import { activityAt, activityHeadline, activityMoment } from "./match-path-activity";
import { MatchActivityBars, MatchActivitySummary } from "./MatchActivityTrack";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { TeamLogo } from "./TeamLogo";

/**
 * Maçın yolu as its own full-width card under the Jinx card (v45 boards
 * W-MacYolu / M-MacYolu, owner approval 2026-10-22). The chart draws the score
 * ribbon, the home lane above and the away lane below, the pool-alignment
 * line or its one honest notice, and BTB's decisions as tickets. Every mark
 * is a 44 pt target; the selected moment opens beside the chart on desktop and
 * under it on a phone, and the rail below lists every moment in order.
 */
const RIB = 16, HOME = 60, PT = 88, LANE_GAP = 30, BTB_GAP = 44, AXIS_GAP = 30;
const bands = [{ label: "Olağan", from: 0.7, to: 1 }, { label: "Sıra dışı", from: 0.3, to: 0.7 }, { label: "Sürpriz", from: 0, to: 0.3 }];

type Geometry = { width: number; height: number; gutter: number; plotWidth: number; plotHeight: number; poolTop: number; pressureMid: number; away: number; btb: number; axis: number; x: (minute: number) => number; y: (level: number) => number };

function geometry(width: number, wide: boolean, model: PathModel, integrated: boolean): Geometry {
  const gutter = wide ? 118 : 40, right = wide ? 20 : 12;
  const plotWidth = Math.max(120, width - gutter - right);
  const plotHeight = model.lineNotice ? (wide ? 84 : 96) : wide ? 120 : 96;
  const poolTop = integrated ? 252 : PT;
  const away = poolTop + plotHeight + LANE_GAP, btb = away + BTB_GAP, axis = btb + AXIS_GAP;
  return {
    width, height: axis + 24, gutter, plotWidth, plotHeight, poolTop, pressureMid: 158, away, btb, axis,
    x: (minute) => gutter + Math.min(Math.max(minute, 0), model.maxMinute) / model.maxMinute * plotWidth,
    y: (level) => poolTop + (1 - level) * plotHeight
  };
}

function laneY(moment: PathMoment, g: Geometry, model: PathModel) {
  if (moment.kind === "GOAL" || moment.kind === "RED_CARD") return moment.side === "AWAY" ? g.away : HOME;
  if (moment.kind === "BTB") return g.btb;
  if (moment.kind === "POOL") return g.poolTop;
  const last = model.line.at(-1);
  return last ? g.y(last.level) : g.axis;
}

/** Marks a few pixels apart share one target with a count, like the old event lane. */
function groupMarks(moments: readonly PathMoment[], g: Geometry, model: PathModel, gap: number) {
  const groups: { lead: PathMoment; members: PathMoment[]; cx: number; cy: number }[] = [];
  for (const moment of moments) {
    const cx = g.x(moment.minute), cy = laneY(moment, g, model);
    const previous = [...groups].reverse().find((group) => group.cy === cy);
    if (previous && cx - previous.cx < gap) previous.members.push(moment);
    else groups.push({ lead: moment, members: [moment], cx, cy });
  }
  return groups;
}

/** Score chips keep their order and never overlap; each still points at its minute. */
function placeChips(model: PathModel, g: Geometry, chipWidth: number) {
  const left = g.gutter, right = g.gutter + g.plotWidth;
  const capacity = Math.max(2, Math.floor((g.plotWidth + 4) / (chipWidth + 4)));
  const visible = model.chips.length <= capacity ? model.chips : model.chips.filter((_, index) =>
    index === 0 || index === model.chips.length - 1 || index % Math.ceil((model.chips.length - 1) / (capacity - 1)) === 0);
  const placed = visible.map((chip, index) => {
    const at = g.x(chip.minute);
    return { ...chip, at, left: index === 0 ? at : at - chipWidth / 2 };
  });
  for (let index = 1; index < placed.length; index++) {
    placed[index]!.left = Math.max(placed[index]!.left, placed[index - 1]!.left + chipWidth + 4);
  }
  for (let index = placed.length - 1; index >= 0; index--) {
    const limit = index === placed.length - 1 ? right - chipWidth : placed[index + 1]!.left - chipWidth - 4;
    placed[index]!.left = Math.max(left, Math.min(placed[index]!.left, limit));
  }
  return placed;
}

function statusPill(match: MatchDetail) {
  if (match.status === "LIVE") return { label: `${match.clock?.period === "ET" ? matchPeriodLabel(match) : "CANLI"} · ${formatElapsed(match.status,match.elapsed,match.clock)}`, live: true };
  if (match.status === "HALF_TIME") return { label: "DEVRE ARASI", live: true };
  if (match.status === "NOT_STARTED") return { label: "BAŞLAMADI", live: false };
  return { label: "MAÇ TAMAMLANDI", live: false };
}

const kindLabel: Record<PathMoment["kind"], string> = { GOAL: "Gol", RED_CARD: "Kırmızı kart", BTB: "BTB kararı", POOL: "Devre", LATEST: "Son kayıt", ACTIVITY: "Hareketlilik" };

function MomentGlyph({ moment, size }: { moment: PathMoment; size: number }) {
  if (moment.kind === "BTB") return <Svg width={size} height={size} viewBox="0 0 24 24" {...journeySvgAccessibility}><JourneyEventGlyph kind="SUPER" color={colors.gold} /></Svg>;
  if (moment.kind === "RED_CARD") return <View style={[styles.cardGlyph, { width: size * 0.5, height: size * 0.7 }]} />;
  if (moment.kind === "POOL") return <View style={[styles.poolGlyph, { width: size * 0.42, height: size * 0.42 }]} />;
  if (moment.kind === "LATEST") return <View style={[styles.latestGlyph, { width: size * 0.42, height: size * 0.42 }]} />;
  return <Svg width={size} height={size} viewBox="0 0 24 24" {...journeySvgAccessibility}><JourneyEventGlyph kind="GOAL" color={colors.text} /></Svg>;
}

function SelectedMoment({ moment, match, model, showBack, onBack, onDecisionPress, activityReading }: {
  moment: PathMoment | undefined; match: MatchDetail; model: PathModel; showBack: boolean; onBack: () => void; onDecisionPress: (decisionId: string) => void;
  activityReading?: PressureInterval | null | undefined;
}) {
  if (!moment) {
    return <View style={styles.panel}><Text style={styles.panelEmpty}>{model.headline}</Text></View>;
  }
  const record = moment.record;
  const side = moment.side === "HOME" ? match.homeTeam : moment.side === "AWAY" ? match.awayTeam : null;
  const title = moment.kind === "BTB" && record ? formatSelection(record.market) || record.market
    : moment.kind === "ACTIVITY" ? "Son 5 dakikalık hareketlilik"
    : moment.kind === "LATEST" ? (moment.railSub || "Son kayıt")
      : moment.kind === "POOL" ? "İkinci yarı havuzu"
        : [moment.railTitle.split(" · ")[1], side].filter(Boolean).join(" · ");
  return (
    <View accessibilityLiveRegion="polite" style={styles.panel}>
      <View style={styles.panelTop}>
        <Text style={styles.eyebrow}>SEÇİLİ AN · {kindLabel[moment.kind].toLocaleUpperCase("tr-TR")}</Text>
        {showBack ? <Pressable accessibilityRole="button" onPress={onBack} style={({ hovered }) => [styles.backAction, hovered && styles.hover]}>
          <Text style={styles.backText}>Son kayda dön</Text>
        </Pressable> : null}
      </View>
      <View style={styles.panelHead}>
        <Text style={styles.panelBig}>{moment.minute}′{moment.score ? ` · ${moment.score}` : ""}</Text>
        <Text style={styles.panelTitle}>{title}</Text>
      </View>
      {record ? <View style={styles.ticket}>
        <View style={styles.ticketRow}>
          <Text accessibilityLabel={`${record.stars} yıldız`} style={styles.ticketStars}>
            {"★".repeat(record.stars)}<Text style={styles.ticketStarsOff}>{"★".repeat(5 - record.stars)}</Text>
          </Text>
          <ResultPill state={record.result.state} />
        </View>
        <View style={styles.ticketRow}>
          <View><Text style={styles.ticketFigure}>{formatQuote(record.quote)}</Text><Text style={styles.ticketLabel}>seçim oranı</Text></View>
          <View style={styles.alignEnd}>
            <Text style={[styles.ticketFigure, { color: toneColor[unitsTone(record.result.net)] }]}>{formatUnits(record.result.net)}</Text>
            <Text style={styles.ticketLabel}>birim · varsayımsal</Text>
          </View>
        </View>
        <Text style={styles.ticketNote}>Yıldız tutarlılık ve kanıt kalitesini gösterir; kazanma olasılığı değildir.</Text>
      </View> : null}
      {moment.lines.map((line) => <Text key={line} style={styles.panelLine}>{line}</Text>)}
      {activityReading !== undefined && moment.kind !== "ACTIVITY" && moment.kind !== "LATEST" ? <View style={styles.selectedActivity}>
        <Text style={styles.eyebrow}>BU ANDAKİ HAREKETLİLİK</Text>
        <Text style={styles.panelLine}>{activityHeadline(activityReading, match)}</Text>
        {activityReading ? <Text style={styles.panelLine}>{match.homeTeam} {activityReading.homeText} · {match.awayTeam} {activityReading.awayText}</Text> : null}
        <Text style={styles.ticketNote}>Tahmini 5 dakikalık pencere; BTB kararının baskı ölçümü değildir.</Text>
      </View> : null}
      {record ? <Pressable accessibilityHint="Super kararını açar" accessibilityRole="button" onPress={() => onDecisionPress(record.decisionId)}
        style={({ hovered, pressed }) => [styles.openDecision, hovered && styles.hover, pressed && styles.pressed]}>
        <Text style={styles.openDecisionText}>Super kararını aç ›</Text>
      </Pressable> : null}
    </View>
  );
}

export function MatchPathCard({ match, model, synthetic, analysisText, collapsed, onToggleCollapse, onDecisionPress, wide, footer, activity }: {
  match: MatchDetail;
  model: PathModel;
  /** The legacy line came from a synthetic sample (shows ÖRNEK VERİ). */
  synthetic: boolean;
  /** Legacy pool analysis summary; RB1 does not expose one. */
  analysisText: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onDecisionPress: (decisionId: string) => void;
  wide: boolean;
  footer?: ReactNode;
  activity?: { intervals: readonly PressureInterval[]; failed: boolean; loading: boolean };
}) {
  const [width, setWidth] = useState(wide ? 740 : 330);
  // Chart and panel sit side by side only where the card itself is wide enough;
  // the desktop Canlı split view embeds this card in a narrower pane.
  const [cardWidth, setCardWidth] = useState(0);
  const sideBySide = wide && cardWidth >= 820;
  const [picked, setPicked] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const selectedKey = cursor !== null ? `activity:${cursor}` : picked && model.moments.some((moment) => moment.key === picked) ? picked : model.defaultKey;
  const selected = cursor !== null && activity ? activityMoment(activity.intervals, cursor, match) : model.moments.find((moment) => moment.key === selectedKey);
  const chartModel = useMemo(() => activity ? { ...model, maxMinute: Math.max(model.maxMinute, ...activity.intervals.map(point => point.endMinute)) } : model, [activity, model]);
  const g = useMemo(() => geometry(width, wide && width >= 620, chartModel, Boolean(activity)), [width, wide, chartModel, activity]);
  const lineInk = activity ? colors.teal : colors.blue;
  const chooseMoment = useCallback((key: string) => { setCursor(null); setPicked(key); }, []);
  const groups = useMemo(() => groupMarks(model.moments, g, model, wide ? 34 : 28), [g, model, wide]);
  const chipWidth = wide ? 44 : 38;
  const chips = useMemo(() => placeChips(model, g, chipWidth), [model, g, chipWidth]);
  const status = statusPill(match);
  const hasLine = !model.lineNotice;
  const lineD = hasLine ? model.line.map((vertex,index) => `${index === 0 || vertex.connects === false ? "M" : "L"} ${g.x(vertex.minute).toFixed(1)} ${g.y(vertex.level).toFixed(1)}`).join(" ") : "";
  const first = model.line[0], last = model.line.at(-1);
  const areaD = hasLine && first && last ? `${lineD} L ${g.x(last.minute).toFixed(1)} ${g.poolTop + g.plotHeight} L ${g.x(first.minute).toFixed(1)} ${g.poolTop + g.plotHeight} Z` : "";
  // Without a line the live pill sits on the axis; the minutes it would cover
  // are left out, since the pill itself states the current minute.
  const pillX = !hasLine && model.nowMinute !== null ? g.x(model.nowMinute) : null;
  const ticks = (wide ? [0, 15, 30, 45, 60, 75, 90] : [0, 30, 45, 60, 90])
    .filter((minute) => minute <= model.maxMinute && (pillX === null || Math.abs(g.x(minute) - pillX) > 52));
  // The half-time label takes the side of the divider that no home mark uses,
  // and drops under the plot only when both sides are taken.
  const halfTime = (() => {
    if (!model.halfTimeLabel || model.maxMinute < 45) return null;
    const text = hasLine && model.referenceMinute !== null ? `${model.halfTimeLabel} · yeni havuz` : model.halfTimeLabel;
    const width = text.length * 7 + 6, at = g.x(45);
    const taken = (from: number, to: number) => groups.some((group) => group.cy === HOME && group.cx + 16 > from && group.cx - 16 < to);
    if (!taken(at, at + width + 5)) return { text, width, left: at + 5, top: g.poolTop - 18, alignEnd: false };
    if (!taken(at - width - 5, at)) return { text, width, left: at - width - 5, top: g.poolTop - 18, alignEnd: true };
    return { text, width, left: at + 5, top: g.poolTop + g.plotHeight + 1, alignEnd: false };
  })();

  const nearest = useCallback((px: number, py: number | null) => {
    if (!model.moments.length) return null;
    if (py !== null) {
      const hit = groups.find((group) => Math.abs(group.cx - px) <= 22 && Math.abs(group.cy - py) <= 24);
      if (hit) return hit.lead.key;
    }
    return model.moments.reduce((best, moment) =>
      Math.abs(g.x(moment.minute) - px) < Math.abs(g.x(best.minute) - px) ? moment : best).key;
  }, [g, groups, model.moments]);
  const pickAt = useCallback((px: number, py: number | null) => {
    const hit = py === null ? null : groups.find(group => Math.abs(group.cx - px) <= 22 && Math.abs(group.cy - py) <= 24);
    if (hit) { chooseMoment(hit.lead.key); return; }
    if (activity && (py === null || py >= 100 && py <= 218)) {
      setCursor(Math.round(Math.max(0, Math.min(chartModel.nowMinute ?? chartModel.maxMinute, (px - g.gutter) / g.plotWidth * chartModel.maxMinute))));
      return;
    }
    const key = nearest(px, py);
    if (key) chooseMoment(key);
  }, [nearest, activity, groups, g, chartModel, chooseMoment]);

  // One gesture canvas owns physical input: a horizontal drag walks the
  // moments, a tap picks the mark under it; vertical movement scrolls the page.
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const dragging = useSharedValue(false);
  const gesture = useMemo(() => {
    const pan = Gesture.Pan().manualActivation(true).maxPointers(1)
      .onTouchesDown((event) => { "worklet"; const touch = event.changedTouches[0]; if (touch) { startX.set(touch.x); startY.set(touch.y); dragging.set(false); } })
      .onTouchesMove((event, manager) => {
        "worklet";
        if (event.numberOfTouches !== 1) { manager.fail(); return; }
        if (dragging.get()) return;
        const touch = event.allTouches[0];
        if (!touch) { manager.fail(); return; }
        const intent = journeyDragIntent(touch.x - startX.get(), touch.y - startY.get());
        if (intent === "SCROLL") manager.fail();
        else if (intent === "SCRUB") { dragging.set(true); manager.activate(); }
      })
      .onTouchesUp((_event, manager) => { "worklet"; if (!dragging.get()) manager.fail(); })
      .onTouchesCancelled((_event, manager) => { "worklet"; manager.fail(); })
      .onUpdate((event) => { "worklet"; scheduleOnRN(pickAt, event.x, null); })
      .onFinalize(() => { "worklet"; dragging.set(false); });
    const tap = Gesture.Tap().maxDistance(8).runOnJS(true).onEnd((event, success) => { if (success) pickAt(event.x, event.y); });
    return Gesture.Exclusive(pan, tap);
  }, [dragging, pickAt, startX, startY]);

  const chart = (
    <View style={styles.chartBox} onLayout={(event) => setWidth(Math.max(240, event.nativeEvent.layout.width))}>
      <GestureDetector gesture={gesture} touchAction="pan-y">
        <View collapsable={false} style={{ height: g.height }} testID="match-path-canvas">
          <Svg width={g.width} height={g.height} {...journeySvgAccessibility}>
            <Defs><LinearGradient id="matchPathFill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.blue} stopOpacity={0.3} /><Stop offset="1" stopColor={colors.blue} stopOpacity={0.02} /></LinearGradient></Defs>
            {activity ? <MatchActivityBars intervals={activity.intervals} x={g.x} left={g.gutter} right={g.gutter + g.plotWidth} mid={g.pressureMid} height={108} /> : null}
            {hasLine && model.poolShare ? [0,0.5,1].map(level => <G key={level}>
              <Line x1={g.gutter} x2={g.gutter+g.plotWidth} y1={g.y(level)} y2={g.y(level)} stroke={colors.borderSoft} strokeDasharray="3 4" />
              <SvgText x={g.gutter+4} y={g.y(level)+(level===1?12:-4)} fill={colors.textMuted} fontSize={11} fontFamily={fontFamilies.text}>%{Math.round(level*100)}</SvgText>
            </G>) : hasLine ? bands.map((band, index) => <G key={band.label}>
              <Rect x={g.gutter} y={g.y(band.to)} width={g.plotWidth} height={g.y(band.from) - g.y(band.to)}
                fill={index === 0 ? colors.blue : index === 1 ? colors.gold : colors.violet} opacity={index === 1 ? 0.05 : 0.08} />
              {wide ? <SvgText x={g.gutter - 8} y={(g.y(band.from) + g.y(band.to)) / 2 + 4} textAnchor="end" fill={colors.textMuted} fontSize={12} fontFamily={fontFamilies.text}>{band.label}</SvgText>
                : <SvgText x={g.gutter + g.plotWidth - 4} y={g.y(band.to) + 13} textAnchor="end" fill={colors.textMuted} fontSize={11} fontFamily={fontFamilies.text}>{band.label}</SvgText>}
            </G>) : <Rect x={g.gutter} y={g.poolTop + 6} width={g.plotWidth} height={g.plotHeight - 12} rx={12} fill={colors.surface} stroke={colors.borderSoft} strokeDasharray="4 5" />}
            {hasLine ? <>
              {!model.poolShare ? <Path d={areaD} fill="url(#matchPathFill)" /> : null}
              <Path d={lineD} fill="none" stroke={lineInk} strokeOpacity={0.12} strokeWidth={9} strokeLinejoin="round" />
              <Path d={lineD} fill="none" stroke={lineInk} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
              {model.poolShare ? model.line.map((point,index)=><Circle key={index} cx={g.x(point.minute)} cy={g.y(point.level)} r={3} fill={lineInk} />) : null}
            </> : null}
            <Line x1={g.gutter} x2={g.gutter + g.plotWidth} y1={RIB} y2={RIB} stroke={colors.borderSoft} strokeWidth={2} />
            <Line x1={g.gutter} x2={g.gutter + g.plotWidth} y1={HOME} y2={HOME} stroke={colors.borderSoft} />
            <Line x1={g.gutter} x2={g.gutter + g.plotWidth} y1={g.away} y2={g.away} stroke={colors.borderSoft} />
            <Line x1={g.gutter} x2={g.gutter + g.plotWidth} y1={g.btb} y2={g.btb} stroke={colors.borderSoft} strokeDasharray="1 4" />
            <Line x1={g.gutter} x2={g.gutter + g.plotWidth} y1={g.axis} y2={g.axis} stroke={colors.borderSoft} />
            {model.maxMinute >= 45 ? <Line x1={g.x(45)} x2={g.x(45)} y1={RIB + 14} y2={g.axis} stroke={colors.bronze} strokeDasharray="4 4" /> : null}
            {groups.map((group) => {
              // Guides link a mark to the plot; around the notice they stop at its edge.
              const inset = model.lineNotice ? 6 : 0;
              const top = activity ? group.cy === HOME ? HOME + 16 : g.pressureMid : group.cy === HOME ? HOME + 16 : g.poolTop + (inset ? g.plotHeight - inset : 0);
              const bottom = activity ? group.cy === HOME ? g.pressureMid : 212 : group.cy === HOME ? g.poolTop + (inset || g.plotHeight) : group.cy - 18;
              const ink = group.lead.kind === "BTB" ? colors.gold : group.lead.kind === "RED_CARD" ? colors.red : colors.text;
              return group.lead.kind === "LATEST" || group.lead.kind === "POOL" || activity && group.lead.kind === "BTB" || bottom <= top ? null
                : <Line key={`guide:${group.lead.key}`} x1={group.cx} x2={group.cx} y1={top} y2={bottom} stroke={ink} strokeOpacity={0.3} />;
            })}
            {selected ? <Line x1={g.x(selected.minute)} x2={g.x(selected.minute)} y1={RIB + 14} y2={g.axis} stroke={colors.text} strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="3 3" /> : null}
            {model.nowMinute !== null ? <Line x1={g.x(model.nowMinute)} x2={g.x(model.nowMinute)} y1={activity ? 100 : g.poolTop} y2={g.axis} stroke={semantic.live} strokeOpacity={0.6} strokeWidth={2} /> : null}
            {chips.map((chip) => <Line key={`tick:${chip.key}`} x1={chip.at} x2={chip.at} y1={RIB - 3} y2={RIB + 3} stroke={colors.textMuted} />)}
          </Svg>

          {/* Minute labels are native Text: Android's SVG text mis-measures the
              fallback prime glyph when a label is centred or end-aligned. */}
          {ticks.map((minute) => {
            const anchor = minute === 0 ? 0 : minute >= model.maxMinute ? 1 : 0.5;
            return <Text key={`tick:${minute}`} numberOfLines={1} pointerEvents="none"
              style={[styles.tick, { left: g.x(minute) - 40 * anchor, top: g.axis + 5, textAlign: anchor === 0 ? "left" : anchor === 1 ? "right" : "center" }]}>{minute}′</Text>;
          })}
          {chips.map((chip) => <View key={chip.key} pointerEvents="none" style={[styles.chip, { left: chip.left, width: chipWidth }, chip.current && styles.chipCurrent]}>
            <Text style={[styles.chipText, chip.current && styles.chipTextCurrent]}>{chip.label}</Text>
          </View>)}
          {halfTime ? <Text numberOfLines={1} pointerEvents="none" style={[styles.halfTime, { left: halfTime.left, top: halfTime.top, width: halfTime.width },
            halfTime.alignEnd && styles.alignEndText]}>{halfTime.text}</Text> : null}
          <View pointerEvents="none" style={[styles.gutter, { top: HOME - 15, width: g.gutter - 6 }]}>
            <TeamLogo name={match.homeTeam} participantId={match.homeParticipantId} size={wide ? "standard" : "compact"} />
            {wide ? <Text numberOfLines={1} style={styles.gutterName}>{match.homeTeam}</Text> : null}
          </View>
          <View pointerEvents="none" style={[styles.gutter, { top: g.away - 15, width: g.gutter - 6 }]}>
            <TeamLogo name={match.awayTeam} participantId={match.awayParticipantId} size={wide ? "standard" : "compact"} />
            {wide ? <Text numberOfLines={1} style={styles.gutterName}>{match.awayTeam}</Text> : null}
          </View>
          <View pointerEvents="none" style={[styles.gutter, { top: g.btb - 13 }]}>
            <View style={styles.btbBadge}><Svg width={14} height={14} viewBox="0 0 24 24" {...journeySvgAccessibility}><JourneyEventGlyph kind="SUPER" color={colors.gold} /></Svg></View>
            {wide ? <Text style={styles.gutterName}>BTB</Text> : null}
          </View>
          {activity ? <Text pointerEvents="none" style={[styles.lineLabel, { top: 82, left: g.gutter, color: colors.textMuted }]}>HAREKETLİLİK · SON 5 DK</Text> : null}
          {activity && !activity.intervals.length ? <View pointerEvents="none" style={[styles.notice, { left: g.gutter + 1, width: g.plotWidth - 2, top: 108, height: 100 }]}>
            <Text style={styles.noticeTitle}>Hareketlilik penceresi yok</Text><Text style={styles.noticeBody}>Eksik ölçümler boş bırakılır.</Text>
          </View> : null}
          {hasLine && (wide || activity) ? <Text pointerEvents="none" style={[styles.lineLabel, { top: g.poolTop - 18, ...(activity ? { left: g.gutter, color: lineInk } : {}) }]}>{model.poolShare ? "HAVUZDA KALAN PAY" : "HAVUZ UYUMU"}</Text> : null}
          {model.lineNotice ? <View pointerEvents="none" style={[styles.notice, { left: g.gutter + 1, width: g.plotWidth - 2, top: g.poolTop + 7, height: g.plotHeight - 14 }]}>
            <Text style={styles.noticeTitle}>{model.lineNotice.title}</Text>
            <Text style={styles.noticeBody}>{model.lineNotice.body}</Text>
          </View> : null}

          {groups.map((group) => {
            const lead = group.lead;
            const active = group.members.some((member) => member.key === selectedKey);
            const count = group.members.length;
            const label = count > 1 ? `${count} an: ${group.members.map((member) => member.label).join("; ")}` : lead.label;
            const tone = lead.record ? toneColor[resultPresentation[lead.record.result.state].tone] : colors.gold;
            const atAxis = lead.kind === "LATEST" && !hasLine && !activity;
            // A ticket or the live pill is wider than a glyph; its target grows with it.
            const markWidth = lead.kind === "BTB" ? (wide ? 88 : 76) : atAxis ? 76 : 44;
            return <Pressable key={lead.key} accessibilityLabel={label} accessibilityRole="button" accessibilityState={{ selected: active }}
              onPress={() => chooseMoment(lead.key)} pointerEvents="none"
              style={[styles.mark, { left: group.cx - markWidth / 2, width: markWidth, top: (atAxis ? g.axis : group.cy) - 22 }]}>
              {lead.kind === "BTB" && lead.record ? <View style={[styles.ticketMark, { borderColor: tone }, active && styles.ticketMarkActive]}>
                <Text numberOfLines={1} style={styles.ticketMarkStars}>{"★".repeat(lead.record.stars)}<Text style={styles.ticketStarsOff}>{"★".repeat(5 - lead.record.stars)}</Text></Text>
                <Text numberOfLines={1} style={styles.ticketMarkText}>{lead.minute}′{wide ? ` · ${formatQuote(lead.record.quote)}` : ""}</Text>
              </View> : lead.kind === "LATEST" ? (atAxis
                ? <View style={[styles.nowPill, active && styles.markActive]}><Text numberOfLines={1} style={styles.nowText}>{lead.minute}′ canlı</Text></View>
                : <View style={[styles.latestDot, active && styles.markActive]} />)
              : lead.kind === "POOL" ? <View style={[styles.poolMark, active && styles.markActive]} />
              : lead.kind === "RED_CARD" ? <View style={[styles.redMark, active && styles.markActive]} />
              : <View style={[styles.goalMark, active && styles.markActive]}>
                <Svg width={wide ? 18 : 16} height={wide ? 18 : 16} viewBox="0 0 24 24" {...journeySvgAccessibility}><JourneyEventGlyph kind="GOAL" color={colors.text} /></Svg>
              </View>}
              {lead.kind === "GOAL" || lead.kind === "RED_CARD" ? <Text style={[styles.markMinute, lead.side === "AWAY" ? styles.markMinuteBelow : styles.markMinuteAbove,
                lead.kind === "RED_CARD" && { color: colors.red }]}>{lead.minute}′</Text> : null}
              {count > 1 ? <View style={styles.countBadge}><Text style={styles.countText}>{count}</Text></View> : null}
            </Pressable>;
          })}
        </View>
      </GestureDetector>
    </View>
  );

  return (
    <View testID="match-path-card" onLayout={(event) => setCardWidth(event.nativeEvent.layout.width)} style={styles.card}>
      <SurfaceMaterial radius={radii.xl} />
      <View style={styles.accent} />
      <View style={styles.header}>
        <View style={styles.icon}><MaterialCommunityIcons color={colors.blue} name="chart-timeline-variant" size={22} /></View>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text accessibilityRole="header" aria-level={2} style={styles.title}>Maçın yolu</Text>
            <View style={[styles.statusPill, status.live && styles.statusLive]}><Text style={[styles.statusText, status.live && styles.statusTextLive]}>{status.label}</Text></View>
            {synthetic && hasLine ? <View style={styles.samplePill}><Text style={styles.sampleText}>ÖRNEK VERİ</Text></View> : null}
          </View>
          {collapsed ? null : <Text style={styles.lede}>{model.headline}</Text>}
        </View>
        {wide && !collapsed ? <View style={styles.legend}>
          <View style={styles.legendItem}><Svg width={16} height={16} viewBox="0 0 24 24" {...journeySvgAccessibility}><JourneyEventGlyph kind="GOAL" color={colors.text} /></Svg><Text style={styles.legendText}>Gol</Text></View>
          <View style={styles.legendItem}><View style={styles.legendCard} /><Text style={styles.legendText}>Kırmızı kart</Text></View>
          <View style={styles.legendItem}><Svg width={16} height={16} viewBox="0 0 24 24" {...journeySvgAccessibility}><JourneyEventGlyph kind="SUPER" color={colors.gold} /></Svg><Text style={styles.legendText}>BTB kararı</Text></View>
          <View style={styles.legendItem}><View style={styles.legendDivider} /><Text style={styles.legendText}>Devre</Text></View>
        </View> : null}
        <Pressable accessibilityLabel={collapsed ? "Maçın yolu bölümünü aç" : "Maçın yolu bölümünü daralt"} accessibilityRole="button"
          accessibilityState={{ expanded: !collapsed }} onPress={onToggleCollapse}
          style={({ hovered, pressed }) => [styles.collapse, hovered && styles.hover, pressed && styles.pressed]}>
          <MaterialCommunityIcons color={colors.text} name={collapsed ? "chevron-down" : "chevron-up"} size={iconSizes.control} />
        </Pressable>
      </View>

      {collapsed ? null : <>
        {activity ? <MatchActivitySummary intervals={activity.intervals} match={match} failed={activity.failed} loading={activity.loading} /> : null}
        <View style={[styles.body, sideBySide && styles.bodyWide]}>
          <View style={sideBySide ? styles.chartColumn : undefined}>
            {chart}
            <Text style={styles.hint}>{Platform.OS === "web" ? "Bir işarete tıkla ya da grafikte sürükleyerek gez." : "↔ Grafikte sürükle · işarete dokun · ↑↓ sayfa kayar"}</Text>
          </View>
          <View style={sideBySide ? styles.panelColumn : undefined}>
            <SelectedMoment match={match} model={model} moment={selected} onBack={() => chooseMoment("latest")}
              activityReading={activity ? activityAt(activity.intervals, selected?.minute ?? 0) : undefined}
              onDecisionPress={onDecisionPress} showBack={model.nowMinute !== null && selectedKey !== "latest"} />
          </View>
        </View>

        {model.moments.length ? <ScrollView accessibilityLabel="Maçın anları" horizontal showsHorizontalScrollIndicator={Platform.OS === "web"}
          contentContainerStyle={styles.rail}>
          {model.moments.map((moment) => {
            const active = moment.key === selectedKey;
            return <Pressable key={moment.key} accessibilityLabel={moment.label} accessibilityRole="button" accessibilityState={{ selected: active }}
              onPress={() => chooseMoment(moment.key)}
              style={({ hovered, pressed }) => [styles.railItem, wide && styles.railItemWide, active && styles.railItemActive, hovered && styles.hover, pressed && styles.pressed]}>
              <View style={[styles.railIcon, moment.kind === "BTB" && { backgroundColor: colors.goldSoft },
                moment.kind === "RED_CARD" && { backgroundColor: colors.redSoft }, moment.kind === "LATEST" && { backgroundColor: semantic.liveSoft }]}>
                <MomentGlyph moment={moment} size={18} />
              </View>
              <View style={styles.railCopy}>
                <Text numberOfLines={1} style={styles.railTitle}>{moment.railTitle}</Text>
                <Text numberOfLines={1} style={styles.railSub}>{moment.railSub}</Text>
              </View>
            </Pressable>;
          })}
        </ScrollView> : null}

        <View style={[styles.footer, wide && styles.footerWide]}>
          {analysisText ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: analysisOpen }} onPress={() => setAnalysisOpen(!analysisOpen)}
            style={({ hovered }) => [styles.disclosure, wide && styles.disclosureWide, hovered && styles.hover]}>
            <View style={styles.disclosureCopy}><Text style={styles.disclosureTitle}>Havuz analizi</Text><Text style={styles.disclosureMeta}>{analysisOpen ? analysisText : "Son ölçüm ve örneklem"}</Text></View>
            <Text style={styles.disclosureSign}>{analysisOpen ? "−" : "+"}</Text>
          </Pressable> : null}
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: rulesOpen }} onPress={() => setRulesOpen(!rulesOpen)}
            style={({ hovered }) => [styles.disclosure, wide && styles.disclosureWide, hovered && styles.hover]}>
            <View style={styles.disclosureCopy}><Text style={styles.disclosureTitle}>Nasıl okunur?</Text><Text style={styles.disclosureMeta}>{model.moments.length} an</Text></View>
            <Text style={styles.disclosureSign}>{rulesOpen ? "−" : "+"}</Text>
          </Pressable>
        </View>
        {rulesOpen ? <Text style={styles.rules}>
          Üstteki şerit her golün yeni skorunu kendi dakikasında gösterir. Ev sahibinin olayları üst, deplasmanın olayları alt şeritte.
          {activity ? " Mavi ve turuncu sütunlar son 5 dakikanın tahmini hareketliliğidir; eksik pencereler boştur ve bu değerler BTB seçim hesabına katılmaz. Sütunlara dokunarak veya sürükleyerek o dakikayı incele. Havuz çizgisinin yüzde ölçeği ayrıdır; aynı zaman eksenini paylaşırlar." : null}
          {hasLine && model.poolShare ? " Mavi çizgi yarının ilk geçerli referans havuzunda güncel skorla uyumlu kalan paydır; kazanma olasılığı değildir. Devrede veya kaynak değişiminde çizgi kesilir. Yalnız kayıtlı havuzlar gösterilir." : hasLine ? " Mavi çizgi maçın havuzla uyumudur; devrede havuz değişir ve çizgi basamak yapar." : " Havuz çizgisi yalnız kaynak sunduğunda çizilir."}
          {" "}Altın fişler BTB kararlarıdır: dakika, yıldız, donmuş seçim oranı ve sonucun rengi. Yıldız tutarlılık ve kanıt kalitesidir.
        </Text> : null}
        {footer}
      </>}
    </View>
  );
}

const styles = StyleSheet.create({
  selectedActivity: { gap: 5, paddingTop: spacing.md, marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  card: { borderRadius: radii.xl, borderWidth: 1, borderColor: colors.borderSoft, padding: spacing.lg, gap: spacing.md, overflow: "hidden" },
  accent: { position: "absolute", left: 20, top: -1, width: 72, height: 2, borderRadius: 2, backgroundColor: colors.blue },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, flexWrap: "wrap" },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.blueSoft, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, minWidth: 180, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm },
  title: { ...typeScale.moduleTitle, color: colors.text },
  statusPill: { borderRadius: radii.round, backgroundColor: colors.surfaceStrong, paddingHorizontal: 9, paddingVertical: 3 },
  statusLive: { backgroundColor: semantic.liveSoft },
  statusText: { ...typeScale.eyebrow, color: colors.textMuted },
  statusTextLive: { color: semantic.live },
  samplePill: { borderRadius: radii.round, backgroundColor: colors.goldSoft, paddingHorizontal: 9, paddingVertical: 3 },
  sampleText: { ...typeScale.eyebrow, color: colors.gold },
  lede: { ...typeScale.bodyCompact, color: colors.textMuted },
  legend: { flexDirection: "row", alignItems: "center", gap: spacing.md, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendText: { ...typeScale.label, color: colors.textMuted },
  legendCard: { width: 9, height: 12, borderRadius: 2, backgroundColor: colors.red },
  legendDivider: { width: 0, height: 14, borderLeftWidth: 2, borderStyle: "dashed", borderColor: colors.bronze },
  collapse: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  body: { gap: spacing.md },
  bodyWide: { flexDirection: "row", alignItems: "stretch", gap: spacing.lg },
  chartColumn: { flex: 1, minWidth: 0, gap: spacing.sm },
  panelColumn: { width: 300 },
  chartBox: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.background, overflow: "hidden" },
  hint: { ...typeScale.label, color: colors.textMuted, marginTop: spacing.xs },
  chip: { position: "absolute", top: RIB - 12, height: 24, borderRadius: 8, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  chipCurrent: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { ...numericFont("700"), fontSize: 14, color: colors.text },
  chipTextCurrent: { color: colors.background },
  // Backed by the chart ground so the live and cursor lines never cross the label.
  tick: { position: "absolute", width: 40, ...textFont("500"), fontSize: 12, lineHeight: 16, color: colors.textMuted },
  halfTime: { position: "absolute", ...textFont("700"), fontSize: 11, lineHeight: 14, color: colors.bronze, backgroundColor: colors.background, paddingHorizontal: 2 },
  gutter: { position: "absolute", left: 6, flexDirection: "row", alignItems: "center", gap: 6 },
  gutterName: { ...textFont("700"), fontSize: 12, color: colors.text, flexShrink: 1 },
  btbBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.goldSoft, alignItems: "center", justifyContent: "center" },
  lineLabel: { position: "absolute", left: 6, ...typeScale.eyebrow, color: colors.blue },
  // Opaque, so the divider and cursor lines stop at the box instead of crossing its words.
  notice: { position: "absolute", alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md, gap: 2, borderRadius: 11, backgroundColor: colors.surface },
  alignEndText: { textAlign: "right" },
  noticeTitle: { ...textFont("700"), fontSize: 13, lineHeight: 17, color: colors.text, textAlign: "center" },
  noticeBody: { ...textFont("400"), fontSize: 12, lineHeight: 16, color: colors.textMuted, textAlign: "center" },
  mark: { position: "absolute", width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  markActive: { borderColor: colors.text, borderWidth: 2 },
  goalMark: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: colors.text, backgroundColor: colors.surfaceStrong, alignItems: "center", justifyContent: "center" },
  redMark: { width: 15, height: 20, borderRadius: 3, backgroundColor: colors.red },
  poolMark: { width: 13, height: 13, borderRadius: 3, backgroundColor: colors.bronze, transform: [{ rotate: "45deg" }] },
  latestDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: semantic.live },
  nowPill: { borderRadius: radii.round, backgroundColor: semantic.liveSoft, paddingHorizontal: 8, paddingVertical: 1 },
  nowText: { ...numericFont("800"), fontSize: 13, color: semantic.live },
  markMinute: { position: "absolute", ...numericFont("700"), fontSize: 12, color: colors.text },
  markMinuteAbove: { top: -6 },
  markMinuteBelow: { bottom: -6 },
  ticketMark: { minWidth: 46, alignItems: "center", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 9, borderWidth: 1.5, backgroundColor: colors.backgroundElevated },
  ticketMarkActive: { borderWidth: 3, backgroundColor: colors.surfaceStrong },
  ticketMarkStars: { fontSize: 11, lineHeight: 13, letterSpacing: 0, color: colors.gold },
  ticketMarkText: { ...numericFont("700"), fontSize: 13, lineHeight: 15, color: colors.text },
  countBadge: { position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  countText: { ...numericFont("800"), fontSize: 11, color: colors.background },
  panel: { flex: 1, gap: spacing.sm, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.surface },
  panelEmpty: { ...typeScale.bodyCompact, color: colors.textMuted },
  panelTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  eyebrow: { ...typeScale.eyebrow, color: colors.textMuted, flexShrink: 1 },
  backAction: { minHeight: 36, borderRadius: 10, backgroundColor: colors.blueSoft, paddingHorizontal: 10, justifyContent: "center" },
  backText: { ...textFont("700"), fontSize: 12, color: colors.blue },
  panelHead: { gap: 2 },
  panelBig: { ...numericFont("700"), fontSize: 28, lineHeight: 30, color: colors.text },
  panelTitle: { ...textFont("700"), fontSize: 16, lineHeight: 22, color: colors.text },
  panelLine: { ...typeScale.bodyCompact, color: colors.text },
  ticket: { gap: spacing.sm, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.background },
  ticketRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.sm },
  ticketStars: { fontSize: 15, letterSpacing: 1.5, color: colors.gold },
  ticketStarsOff: { color: colors.borderSoft },
  ticketFigure: { ...numericFont("700"), fontSize: 22, lineHeight: 24, color: colors.text },
  ticketLabel: { ...typeScale.label, color: colors.textMuted },
  ticketNote: { ...typeScale.label, color: colors.textMuted },
  alignEnd: { alignItems: "flex-end" },
  openDecision: { minHeight: 44, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderSoft, alignItems: "center", justifyContent: "center", marginTop: "auto" },
  openDecisionText: { ...textFont("700"), fontSize: 14, color: colors.blue },
  rail: { gap: spacing.sm, paddingVertical: 2 },
  railItem: { width: 156, minHeight: 56, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.background },
  railItemWide: { width: 186, minHeight: 60 },
  railItemActive: { borderColor: colors.text, borderWidth: 1.5, backgroundColor: colors.surfaceStrong },
  railIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.surfaceStrong, alignItems: "center", justifyContent: "center" },
  cardGlyph: { borderRadius: 2, backgroundColor: colors.red },
  poolGlyph: { borderRadius: 2, backgroundColor: colors.bronze, transform: [{ rotate: "45deg" }] },
  latestGlyph: { borderRadius: 99, backgroundColor: semantic.live },
  railCopy: { flex: 1, minWidth: 0, gap: 1 },
  railTitle: { ...textFont("700"), fontSize: 13, lineHeight: 17, color: colors.text },
  railSub: { ...textFont("400"), fontSize: 12, lineHeight: 16, color: colors.textMuted },
  footer: { gap: spacing.sm, borderTopWidth: 1, borderColor: colors.borderSoft, paddingTop: spacing.md },
  footerWide: { flexDirection: "row", flexWrap: "wrap" },
  disclosure: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderSoft },
  disclosureWide: { flex: 1, minWidth: 280 },
  disclosureCopy: { flex: 1, gap: 1 },
  disclosureTitle: { ...textFont("700"), fontSize: 14, color: colors.blue },
  disclosureMeta: { ...typeScale.label, color: colors.textMuted },
  disclosureSign: { ...textFont("700"), fontSize: 18, color: colors.blue },
  rules: { ...typeScale.bodyCompact, color: colors.textMuted },
  hover: { opacity: 0.86 },
  pressed: { opacity: 0.72 }
});
