import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TotoPrediction } from "@/src/api/schemas";
import { colors, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { formatFixtureDateTime, formatPercentage } from "@/src/utils/format";
import { couponCells, couponWidth } from "./toto-coupon";

type ResultPresentation = (result: TotoPrediction["result"]) => { color: string; label: string };

/**
 * Desktop Toto coupon (platform exception: wide web layout of the phone's
 * prediction list). One row per match with the 1/X/2 cells as they sit on a
 * real coupon: the main pick filled, other covered outcomes outlined, and the
 * settled result ringed. A row opens the match on Bilyoner, as on the phone.
 */
export function TotoCouponGrid({
  predictions,
  presentResult,
  onOpen
}: {
  predictions: readonly TotoPrediction[];
  presentResult: ResultPresentation;
  onOpen: (eventId: number | null) => void;
}) {
  return (
    <View role="table" aria-label="Toto kuponu" style={styles.table}>
      <View role="row" style={[styles.row, styles.headerRow]}>
        <Text style={[styles.headerText, styles.no]}>#</Text>
        <Text style={[styles.headerText, styles.match]}>Maç</Text>
        {["1", "X", "2"].map((outcome) => (
          <Text key={outcome} style={[styles.headerText, styles.cellColumn]}>
            {outcome}
          </Text>
        ))}
        <Text style={[styles.headerText, styles.confidence]}>Güven</Text>
        <Text style={[styles.headerText, styles.status]}>Durum</Text>
      </View>
      {predictions.map((prediction, index) => {
        const cells = couponCells(prediction);
        const presentation = presentResult(prediction.result);
        const width = couponWidth(prediction);
        return (
          <Pressable
            accessibilityHint="Karşılaşmayı Bilyoner'de açar"
            accessibilityLabel={`${prediction.matchNo}. ${prediction.matchName}, kupon ${prediction.coverage}, ${presentation.label}`}
            disabled={!prediction.eventId}
            key={prediction.matchNo}
            onPress={() => onOpen(prediction.eventId)}
            role="row"
            style={({ hovered }) => [styles.row, index % 2 === 1 && styles.zebra, hovered && styles.rowHover]}
          >
            <Text style={[styles.number, styles.no]}>{prediction.matchNo}</Text>
            <View style={styles.match}>
              <Text numberOfLines={1} style={styles.matchName}>
                {prediction.matchName}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {formatFixtureDateTime(prediction.matchDate, prediction.matchTime)}
                {width > 1 ? ` · ${width === 2 ? "çift" : "üçlü"}` : ""}
                {prediction.homeScore !== null && prediction.awayScore !== null
                  ? ` · Skor ${prediction.homeScore}-${prediction.awayScore}`
                  : ""}
              </Text>
            </View>
            {cells.map((cell) => (
              <View key={cell.outcome} style={styles.cellColumn}>
                <View
                  accessibilityLabel={`${cell.outcome}${cell.main ? " ana tahmin" : cell.covered ? " kuponda" : ""}${cell.actual ? ", sonuç" : ""}`}
                  style={[
                    styles.cell,
                    cell.covered && styles.cellCovered,
                    cell.main && styles.cellMain,
                    cell.actual && styles.cellActual
                  ]}
                >
                  <Text style={[styles.cellText, cell.main && styles.cellTextMain, !cell.covered && styles.cellTextOff]}>
                    {cell.outcome}
                  </Text>
                </View>
              </View>
            ))}
            <Text style={[styles.meta, styles.confidence]}>{formatPercentage(prediction.confidence)}</Text>
            <Text style={[styles.statusText, styles.status, { color: presentation.color }]}>{presentation.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
    overflow: "hidden"
  },
  row: {
    alignItems: "center",
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 54,
    paddingHorizontal: spacing.md
  },
  headerRow: {
    backgroundColor: colors.background,
    minHeight: 38
  },
  zebra: {
    backgroundColor: `${colors.surface}40`
  },
  rowHover: {
    backgroundColor: colors.surface
  },
  headerText: {
    ...typeScale.micro,
    color: colors.textSubtle,
    textTransform: "uppercase"
  },
  no: {
    textAlign: "center",
    width: 28
  },
  number: {
    ...typeScale.metricCompact,
    color: colors.textMuted
  },
  match: {
    flex: 1,
    minWidth: 0
  },
  matchName: {
    ...typeScale.identityCompact,
    color: colors.text
  },
  meta: {
    ...typeScale.meta,
    color: colors.textSubtle
  },
  cellColumn: {
    alignItems: "center",
    textAlign: "center",
    width: 44
  },
  cell: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderWidth: 1.5,
    height: 30,
    justifyContent: "center",
    width: 34
  },
  cellCovered: {
    borderColor: semantic.positive
  },
  cellMain: {
    backgroundColor: semantic.positive
  },
  cellActual: {
    // A gold ring outside the cell marks the settled result.
    outlineColor: colors.gold,
    outlineStyle: "solid",
    outlineWidth: 2,
    outlineOffset: 2
  } as never,
  cellText: {
    ...typeScale.metricCompact,
    color: colors.text
  },
  cellTextMain: {
    color: colors.background
  },
  cellTextOff: {
    color: colors.textSubtle,
    opacity: 0.5
  },
  confidence: {
    textAlign: "right",
    width: 56
  },
  status: {
    textAlign: "right",
    width: 96
  },
  statusText: {
    ...typeScale.micro
  }
});
