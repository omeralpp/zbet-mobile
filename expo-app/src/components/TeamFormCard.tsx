import { StyleSheet, Text, View } from "react-native";
import type { TeamFormContext, TeamFormSide } from "@/src/api/schemas";
import {
  colors,
  radii,
  semantic,
  spacing,
  typeScale
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
  orderedFormResults,
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
        <OriginBadge origin={context?.origin} />
      </View>

      <View style={styles.records}>
        <RecordBlock
          align="flex-start"
          side={context?.home ?? null}
          team={homeTeam}
        />
        <RecordBlock
          align="flex-end"
          side={context?.away ?? null}
          team={awayTeam}
        />
      </View>

      {rows.map((row) => (
        <FormRow key={row.key} row={row} />
      ))}

      <CaveatLine text={smallSampleNotice(context)} />
    </View>
  );
}

function RecordBlock({
  align,
  side,
  team
}: {
  align: "flex-start" | "flex-end";
  side: TeamFormSide | null;
  team: string;
}) {
  const recent = orderedFormResults(side);
  return (
    <View
      accessibilityLabel={describeSideForAccessibility(side, team)}
      accessible
      style={[styles.recordBlock, { alignItems: align }]}
    >
      <Text numberOfLines={1} style={styles.recordTeam}>
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
          <Text style={styles.recordSample}>En yeni → eski</Text>
        </>
      ) : null}
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
 * The dual bar is the same relative-share treatment the live statistics module
 * uses, so form and live stats read as one language rather than two charts that
 * happen to sit on the same screen. A side with no value gets no bar, which
 * leaves a one-sided row visibly one-sided.
 */
function FormRow({ row }: { row: TeamFormRow }) {
  const widths = comparisonWidths(row);
  const homeWidth: `${number}%` = `${widths.home}%`;
  const awayWidth: `${number}%` = `${widths.away}%`;

  return (
    <View style={styles.row}>
      <View style={styles.rowLabels}>
        <Text style={styles.rowValue}>
          {formatRowValue(row.home, row.format)}
        </Text>
        <Text style={styles.rowLabel}>{row.label}</Text>
        <Text style={styles.rowValue}>
          {formatRowValue(row.away, row.format)}
        </Text>
      </View>
      <View style={styles.dualBar}>
        <View style={styles.homeTrack}>
          <View style={[styles.homeBar, { width: homeWidth }]} />
        </View>
        <View style={styles.awayTrack}>
          <View style={[styles.awayBar, { width: awayWidth }]} />
        </View>
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
    flexDirection: "row"
  },
  records: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  recordBlock: {
    flex: 1,
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
    fontSize: 11,
    fontWeight: "900"
  },
  recordTeam: {
    color: colors.textMuted,
    ...typeScale.label
  },
  recordValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22
  },
  recordSample: {
    color: colors.textSubtle,
    ...typeScale.label
  },
  row: {
    gap: spacing.xs
  },
  rowLabels: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rowValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    minWidth: 56
  },
  rowLabel: {
    color: colors.textMuted,
    flexShrink: 1,
    textAlign: "center",
    ...typeScale.label
  },
  dualBar: {
    flexDirection: "row",
    gap: 3
  },
  homeTrack: {
    alignItems: "flex-end",
    flex: 1
  },
  awayTrack: {
    flex: 1
  },
  homeBar: {
    backgroundColor: semantic.intelligence,
    borderRadius: 2,
    height: 4
  },
  awayBar: {
    backgroundColor: colors.bronze,
    borderRadius: 2,
    height: 4
  }
});
