import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TotoProgram } from "@/src/api/schemas";
import {
  colors,
  iconSizes,
  radii,
  semantic,
  shadows,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { hasTheoreticalPrize, totoProgramTone } from "@/src/utils/toto-status";
import { dayRange, formatCost, kickoffLabel, kickoffText, outOf, programAction, totoProgress } from "@/src/utils/toto-lifecycle";
import {
  formatCurrencyAmount,
  formatProgramStatus
} from "@/src/utils/format";

export function totoStatusColor(status: TotoProgram["status"]): string {
  const tone = totoProgramTone(status);
  // Waiting for results wears the v40 board's gold (owner decision
  // 2026-10-21); the tone itself stays "open" in toto-status.ts.
  return tone === "LIVE"
    ? semantic.live
    : tone === "OPEN"
      ? colors.gold
      : tone === "PROBLEM"
        ? semantic.negative
        : colors.textMuted;
}

/** Countdowns read in whole minutes; a per-second clock would re-render every card. */
export function useMinuteNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(timer); }, []);
  return now;
}

/** Settled outcomes as one proportional bar: main hits, other coverage, misses, open. */
export function TotoProgressBar({ progress }: { progress: Pick<ReturnType<typeof totoProgress>, "mainHits" | "coveredOnly" | "misses" | "open" | "total"> }) {
  const parts = [[progress.mainHits, colors.green], [progress.coveredOnly, colors.gold], [progress.misses, colors.red], [progress.open, colors.textSubtle]] as const;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.track}>
      {progress.total > 0 ? parts.map(([count, color], index) => count > 0 ? <View key={index} style={[styles.segment, { flex: count, backgroundColor: color }]} /> : null) : null}
    </View>
  );
}

function Metric({ value, label, detail }: { value: string; label: string; detail?: string | undefined }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {detail ? <Text style={styles.metricLabel}>{detail}</Text> : null}
    </View>
  );
}

/**
 * A program card shaped by its lifecycle: an unplanned program says when play
 * starts, a planned one shows its coupon and first kickoff, a waiting one its
 * running results against the matches still open, and a resulted one its final
 * x/15. `compact` is the one-line history row of the Programlar list.
 */
export function TotoProgramCard({ program, showContextNote = true, compact = false }: { program: TotoProgram; showContextNote?: boolean; compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const now = useMinuteNow();
  const progress = totoProgress(program, now);
  const tone = totoProgramTone(program.status);
  const statusColor = totoStatusColor(program.status);
  // Current programs and errors earn an accent; completed history recedes.
  const inPlay = tone === "LIVE" || tone === "OPEN";
  const highlighted = inPlay || tone === "PROBLEM";
  const number = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });
  const capacity = Math.min(1, program.maxColumns > 0 ? program.columns / program.maxColumns : 0);
  const span = progress.firstKickoff !== null && progress.lastKickoff !== null ? dayRange(progress.firstKickoff, progress.lastKickoff) : null;
  const prize = hasTheoreticalPrize(program) ? formatCurrencyAmount(program.theoreticalPrize!, program.theoreticalPrizeCurrency) : null;
  const of = (count: number | null) => outOf(count, progress.total);
  const cost = formatCost(program.cost, program.costCurrency);
  const plan = `${number.format(program.columns)} kolon · ${cost} maliyet`;
  // SAP's coupon close when known, otherwise the first kickoff.
  const when = progress.deadline ? { label: progress.deadline.label, text: kickoffText(progress.deadline.at, now) } : { label: "İlk maç", text: "tarih bekleniyor" };
  const whenLower = `${when.label.toLocaleLowerCase("tr-TR")} ${when.text}`;
  const unplanned = program.status === "ACTIVE" && !progress.planned;
  const open = () => router.push({ pathname: "/toto/[gcNo]/[version]", params: { gcNo: program.gcNo, version: program.version, from: pathname } } as never);
  const spoken = [`Program ${program.gcNo}`, program.weekText, formatProgramStatus(program.status),
    unplanned ? `${program.predictions.length ? "henüz kolon planı yok" : "tahmin hazırlanıyor"}, ${whenLower}`
      : program.status === "ACTIVE" ? `${plan}${program.costCurrency ? "" : ", maliyet birimi belirtilmedi"}, ${whenLower}`
      : program.status === "WAITING_RESULT" ? `${progress.settled}/${progress.total} maç sonuçlandı, kapsama ${program.coverageHits ?? "bilinmiyor"}, ana isabet ${program.mainHits ?? "bilinmiyor"}, en fazla ${progress.maxCoverage ?? "bilinmiyor"} kapsama`
      : `kapsama ${of(program.coverageHits)}, ana isabet ${of(program.mainHits)}${span ? `, ${span}` : ""}${prize ? `, teorik ikramiye ${prize}` : ""}`].join(", ");

  if (compact) {
    return (
      <Pressable accessibilityHint="Toto program detayını açar" accessibilityLabel={spoken} accessibilityRole="button" onPress={open}
        style={({ pressed, hovered }) => [styles.row, hovered && styles.hover, pressed && styles.pressed]}>
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>Program {program.gcNo}</Text>
          <Text style={styles.week}>{[span ?? program.weekText, prize ? `teorik ${prize}` : null].filter(Boolean).join(" · ")}</Text>
        </View>
        <View style={styles.rowFigure}>
          <Text style={styles.rowValue}>{of(program.coverageHits)}</Text>
          <Text style={styles.metricLabel}>kapsama · ana {of(program.mainHits)}</Text>
        </View>
        <MaterialCommunityIcons color={semantic.intelligence} name="chevron-right" size={iconSizes.small} />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityHint="Toto program detayını açar"
      accessibilityLabel={spoken}
      accessibilityRole="button"
      onPress={open}
      style={({ pressed, hovered }) => [styles.card, hovered && styles.hover, pressed && styles.pressed]}
    >
      <SurfaceMaterial
        {...(highlighted ? { accent: statusColor } : {})}
        radius={20}
      />
      <View style={styles.header}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            color={highlighted ? statusColor : colors.textMuted}
            name="ticket-confirmation-outline"
            size={iconSizes.control}
          />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Program {program.gcNo}</Text>
          <Text style={styles.week}>{program.weekText}</Text>
        </View>
        <View style={styles.statusStack}>
          <View
            style={[styles.statusPill, highlighted ? { backgroundColor: `${statusColor}24` } : null]}
          >
            {highlighted ? <View style={[styles.statusDot, { backgroundColor: statusColor }]} /> : null}
            <Text style={[styles.status, { color: highlighted ? statusColor : colors.text }]}>
              {formatProgramStatus(program.status).toLocaleUpperCase("tr-TR")}
            </Text>
          </View>
        </View>
      </View>

      {unplanned ? (
        <View style={styles.kickoff}>
          <MaterialCommunityIcons color={colors.textMuted} name="clock-outline" size={iconSizes.inline} />
          <Text style={styles.kickoffText}>{program.predictions.length ? "Henüz kolon planı yok" : "Tahmin hazırlanıyor"} · {whenLower}</Text>
        </View>
      ) : program.status === "ACTIVE" ? (
        <>
          <View style={styles.metrics}>
            <Metric label="kolon" value={number.format(program.columns)} />
            <Metric label="maliyet" value={cost} />
            <View style={styles.metric}>
              <Text style={styles.structure}>{progress.structure ?? "—"}</Text>
              <Text style={styles.metricLabel}>kupon yapısı</Text>
            </View>
          </View>
          <View style={styles.kickoff}>
            <MaterialCommunityIcons color={colors.textMuted} name="clock-outline" size={iconSizes.inline} />
            <Text style={styles.kickoffText}>{when.label} {when.text}</Text>
          </View>
          <View style={styles.capacityBlock}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${capacity * 100}%` }]} />
            </View>
            <View style={styles.capacityRow}>
              <Text style={styles.capacityLabel}>Kolon kapasitesi</Text>
              <Text style={styles.capacityValue}>
                {number.format(program.columns)} / {number.format(program.maxColumns)}
              </Text>
            </View>
          </View>
        </>
      ) : program.status === "WAITING_RESULT" ? (
        <>
          <View style={styles.metrics}>
            <Metric label="sonuçlandı" value={`${progress.settled}/${progress.total}`} />
            <Metric detail={`ana ${program.mainHits ?? "—"}`} label="kapsama" value={program.coverageHits === null ? "—" : String(program.coverageHits)} />
            <Metric label="en fazla kapsama" value={progress.maxCoverage === null ? "—" : `${progress.maxCoverage}/${progress.total}`} />
          </View>
          <TotoProgressBar progress={progress} />
          {progress.next ? <Text style={styles.kickoffText}>{progress.next.started ? "Sonuç bekleniyor" : "Sıradaki"}: {progress.next.matchName}{progress.next.at !== null ? ` · ${kickoffLabel(progress.next.at)}` : ""}</Text> : null}
          <Text style={styles.metricLabel}>{plan}</Text>
        </>
      ) : program.status === "RESULTED" ? (
        <>
          <View style={styles.metrics}>
            <Metric detail={`ana ${of(program.mainHits)}`} label="kapsama" value={of(program.coverageHits)} />
            <Metric label="kolon" value={number.format(program.columns)} />
            <Metric label="maliyet" value={cost} />
          </View>
          {span || prize ? <Text style={styles.kickoffText}>{[span, prize ? `Teorik ikramiye ${prize}` : null].filter(Boolean).join(" · ")}</Text> : null}
        </>
      ) : (
        <View style={styles.metrics}>
          <Metric label="kolon" value={number.format(program.columns)} />
          <Metric label="maliyet" value={cost} />
          <Metric detail={`ana ${program.mainHits ?? "—"}`} label="kapsama" value={program.coverageHits === null ? "—" : String(program.coverageHits)} />
        </View>
      )}

      {showContextNote && !unplanned ? <Text style={styles.contextNote}>Kapsama kupon kazancı değildir.{program.costCurrency ? "" : " Maliyet birimi kaynakta belirtilmiyor."}</Text> : null}

      <View style={styles.open}>
        <View style={styles.openAction}>
          <Text style={styles.openText}>{programAction(program.status, !unplanned)}</Text>
          <MaterialCommunityIcons color={semantic.intelligence} name="chevron-right" size={iconSizes.small} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: 14,
    marginBottom: spacing.md,
    ...shadows.card
  },
  pressed: {
    opacity: 0.76
  },
  hover: { borderColor: semantic.intelligence },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md
  },
  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.surfaceStrong
  },
  headerCopy: {
    flex: 1,
    minWidth: 140
  },
  title: {
    color: colors.text,
    ...typeScale.moduleTitle
  },
  week: {
    color: colors.textMuted,
    ...typeScale.bodyCompact
  },
  statusPill: {
    alignItems: "center",
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6
  },
  statusStack: {
    alignItems: "flex-end",
    marginLeft: "auto",
    flexShrink: 0,
    gap: spacing.xs
  },
  status: {
    ...typeScale.eyebrow
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  metric: {
    flex: 1,
    minWidth: 0
  },
  metricValue: {
    color: colors.text,
    ...typeScale.metric,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "800"
  },
  metricLabel: {
    color: colors.textMuted,
    ...typeScale.label,
    letterSpacing: 0
  },
  structure: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700", minHeight: 30 },
  kickoff: { flexDirection: "row", alignItems: "center", gap: 6 },
  kickoffText: { flexShrink: 1, color: colors.textMuted, ...typeScale.bodyCompact },
  capacityBlock: {
    gap: 6
  },
  track: {
    flexDirection: "row",
    gap: 2,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden"
  },
  segment: { height: "100%" },
  // Capacity is a readout, not an outcome, so it takes the analytical accent
  // rather than the colour of a won decision.
  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: semantic.intelligence
  },
  capacityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  capacityLabel: {
    color: colors.textMuted,
    ...typeScale.label,
    fontWeight: "700",
    letterSpacing: 0
  },
  capacityValue: {
    color: colors.text,
    ...typeScale.metricCompact,
    fontSize: 14,
    lineHeight: 18
  },
  open: {
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    flexDirection: "row",
    gap: spacing.sm
  },
  openAction: { flexDirection: "row", alignItems: "center", gap: 2 },
  openText: {
    color: semantic.intelligence,
    ...typeScale.bodyCompact,
    fontSize: 14,
    fontWeight: "700"
  },
  contextNote: { ...typeScale.bodyCompact, color: colors.textMuted },
  // History row: one settled program per line, its final x/15 at the end.
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.backgroundElevated
  },
  rowCopy: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: { color: colors.text, ...typeScale.identity, fontWeight: "700" },
  rowFigure: { alignItems: "flex-end", gap: 2 },
  rowValue: { color: colors.text, ...typeScale.metricCompact, fontSize: 20, lineHeight: 22 }
});
