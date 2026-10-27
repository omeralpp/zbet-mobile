import { StyleSheet, Text, View } from "react-native";
import type { TeamFormContext, TeamFormSide } from "@/src/api/schemas";
import {
  colors,
  radii,
  semantic,
  spacing,
  typeScale,
  textFont,
  numericFont
} from "@/src/theme/theme";
import { CaveatLine, OriginBadge } from "./IntelligenceNotice";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { SystemState } from "./StateView";
import {
  comparisonWidths,
  describeSideForAccessibility,
  formatRowValue,
  formRecord,
  formResultLabels,
  formReadingOrderCaption,
  formResultsInReadingOrder,
  type FormReadingOrder,
  resolveTeamFormState,
  sampleLabel,
  smallSampleNotice,
  teamFormRows,
  type TeamFormRow
} from "./team-form-view";

/**
 * Read-only team-form comparison (M15 / TASK-0040).
 *
 * A short answer to "who has been in better shape", built only from derived
 * summaries. No provider payload, no fixture list and no opponent identity
 * reaches this component — the contract has already terminated all of it.
 *
 * Every judgement the card makes is delegated to `team-form-view`, so the rules
 * about small samples and missing values are testable without a renderer and
 * cannot be quietly re-decided here.
 */
export function TeamFormCard({
  awayTeam,
  context,
  homeTeam,
  isLoading
}: {
  awayTeam: string;
  context: TeamFormContext | undefined;
  homeTeam: string;
  isLoading?: boolean;
}) {
  const state = resolveTeamFormState(context, isLoading);

  if (state === "LOADING") {
    return <SystemState kind="LOADING" />;
  }

  if (state === "UNAVAILABLE") {
    return (
      <SystemState
        kind="UNAVAILABLE"
        message="Takım formu şu anda kullanılamıyor. Maç detayının geri kalanı etkilenmez."
      />
    );
  }

  if (state === "EMPTY") {
    return (
      <SystemState
        kind="EMPTY"
        message="Bu takımların örneklemde henüz oynanmış maçı yok."
      />
    );
  }

  const rows = teamFormRows(context);

  return (
    <View style={styles.card}>
      <SurfaceMaterial radius={radii.lg} />
      <View style={styles.header}>
        <Text style={styles.intro}>Yakın dönem takım karşılaştırması</Text>
        <OriginBadge origin={context?.origin} />
      </View>

      <View style={styles.records}>
        <RecordBlock
          align="flex-start"
          order="OLDEST_FIRST"
          sideLabel="Ev sahibi"
          side={context?.home ?? null}
          team={homeTeam}
        />
        <RecordBlock
          align="flex-end"
          order="OLDEST_FIRST"
          sideLabel="Deplasman"
          side={context?.away ?? null}
          team={awayTeam}
        />
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>{formReadingOrderCaption.OLDEST_FIRST}</Text>
        <Text style={styles.legendText}>G: Galibiyet · B: Beraberlik · M: Mağlubiyet</Text>
      </View>

      <View style={styles.rows}>
        {rows.map((row) => (
          <FormRow key={row.key} awayTeam={awayTeam} homeTeam={homeTeam} row={row} />
        ))}
      </View>

      <Text style={styles.contextNote}>Saha puanı: ev sahibi iç sahada, deplasman takımı dış sahada.</Text>
      <CaveatLine text={smallSampleNotice(context)} />
    </View>
  );
}

function RecordBlock({
  align,
  order,
  side,
  sideLabel,
  team
}: {
  align: "flex-start" | "flex-end";
  order: FormReadingOrder;
  side: TeamFormSide | null;
  sideLabel: "Ev sahibi" | "Deplasman";
  team: string;
}) {
  const recent = formResultsInReadingOrder(side, order);
  return (
    <View
      accessibilityLabel={`${sideLabel}, ${describeSideForAccessibility(side, team, order)}`}
      accessible
      style={[styles.recordBlock, { alignItems: align }]}
    >
      <Text style={[styles.sideLabel, { color: sideLabel === "Ev sahibi" ? colors.blue : colors.orange }]}>
        {sideLabel}
      </Text>
      <Text numberOfLines={2} style={[styles.recordTeam, align === "flex-end" && styles.awayText]}>
        {team}
      </Text>
      {recent?.length ? (
        <>
          <View style={styles.resultStrip}>
            {recent.map((result, index) => {
              const label = formResultLabels[result];
              const accent = semantic[label.tone];
              return (
                <View key={`${index}-${result}`} style={[styles.resultChip, { borderColor: accent }]}>
                  <Text style={[styles.resultText, { color: accent }]}>{label.short}</Text>
                </View>
              );
            })}
          </View>
        </>
      ) : side && side.matchesSampled > 0 ? <Text style={styles.recordSample}>Sonuç sırası paylaşılmadı</Text> : null}
      <Text style={styles.recordValue}>
        {side ? formRecord(side) : "—"}
      </Text>
      <Text style={styles.recordSample}>
        {side ? sampleLabel(side) : "veri yok"}
      </Text>
    </View>
  );
}

/**
 * One comparison row.
 *
 * Team colours and explicit names keep each numeric value attributable. Bars
 * preserve the existing relative-share arithmetic; a missing value never
 * becomes a zero or an invented advantage.
 */
function FormRow({ awayTeam, homeTeam, row }: { awayTeam: string; homeTeam: string; row: TeamFormRow }) {
  const widths = comparisonWidths(row);
  const homeWidth: `${number}%` = `${widths.home}%`;
  const awayWidth: `${number}%` = `${widths.away}%`;
  const homeValue = formatRowValue(row.home, row.format).replace(".", ",");
  const awayValue = formatRowValue(row.away, row.format).replace(".", ",");
  const unit = row.format === "RATE"
    ? row.key === "formPpg" || row.key === "venuePpg" ? "puan / maç" : "gol / maç"
    : row.format === "PERCENT" ? "maçların yüzdesi" : "son maçtan beri";

  return (
    <View
      accessible
      accessibilityLabel={`${row.label}, ${unit}. ${homeTeam}: ${homeValue}. ${awayTeam}: ${awayValue}.${row.lowerIsBetter ? " Düşük değer daha iyi." : ""}`}
      style={styles.row}
    >
      <View style={styles.rowLabels}>
        <Text style={[styles.rowValue, styles.homeText]}>
          {homeValue}
        </Text>
        <View style={styles.rowHeading}>
          <Text style={styles.rowLabel}>{row.label}</Text>
          <Text style={styles.rowUnit}>{unit}{row.lowerIsBetter ? " · düşük daha iyi" : ""}</Text>
        </View>
        <Text style={[styles.rowValue, styles.awayValue]}>
          {awayValue}
        </Text>
      </View>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.dualBar}>
        <View style={[styles.homeBar, { width: homeWidth }]} />
        <View style={[styles.awayBar, { width: awayWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.lg
  },
  header: {
    gap: spacing.sm
  },
  intro: {
    ...typeScale.bodyCompact,
    color: colors.textMuted
  },
  records: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  recordBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  resultStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginVertical: spacing.xs,
    maxWidth: "100%"
  },
  resultChip: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    borderWidth: 1,
    minWidth: 21,
    minHeight: 23,
    paddingHorizontal: 3,
    paddingVertical: 2
  },
  resultText: {
    ...textFont("800"),
    fontSize: 11
  },
  recordTeam: {
    color: colors.text,
    ...typeScale.identity,
    fontWeight: "700"
  },
  sideLabel: {
    ...typeScale.label
  },
  recordValue: {
    ...numericFont("800"),
    color: colors.text,
    fontSize: 17,
    lineHeight: 22
  },
  recordSample: {
    color: colors.textSubtle,
    ...typeScale.label
  },
  legend: {
    gap: 2
  },
  legendText: {
    ...typeScale.label,
    color: colors.textMuted
  },
  rows: {
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  rowLabels: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rowValue: {
    ...numericFont("800"),
    color: colors.text,
    fontSize: 17,
    minWidth: 50,
    flexShrink: 0
  },
  homeText: {
    color: colors.blue
  },
  awayValue: {
    color: colors.orange,
    textAlign: "right"
  },
  awayText: {
    textAlign: "right"
  },
  rowHeading: {
    flex: 1,
    minWidth: 0,
    gap: 1,
    paddingHorizontal: spacing.xs
  },
  rowLabel: {
    color: colors.textMuted,
    textAlign: "center",
    ...typeScale.label
  },
  rowUnit: {
    ...typeScale.label,
    color: colors.textSubtle,
    textAlign: "center"
  },
  dualBar: {
    flexDirection: "row",
    backgroundColor: colors.borderSoft,
    borderRadius: 3,
    overflow: "hidden",
    height: 5
  },
  homeBar: {
    backgroundColor: colors.blue,
    height: 5
  },
  awayBar: {
    backgroundColor: colors.orange,
    height: 5
  },
  contextNote: {
    ...typeScale.label,
    color: colors.textMuted
  }
});
