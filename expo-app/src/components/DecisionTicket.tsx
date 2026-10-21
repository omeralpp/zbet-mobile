import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Line } from "react-native-svg";
import { colors, semantic, typeScale } from "@/src/theme/theme";
import { resultPresentation, type ResultState, type Tone } from "@/src/utils/rebuild-display";

/**
 * "Karar fişi" — BTB's signature for a published decision.
 *
 * A ticket has a stub. Everything above the perforated bronze seam was known
 * when the decision was published and never changes: minute, score, market,
 * stars, first quote. Everything below it happened afterwards. The seam keeps
 * the bronze whether the outcome won or lost, so the line is structure and the
 * outcome colour stays with the outcome.
 *
 * Reserved for published decisions; no other card wears it as decoration.
 * Geometry: 20pt notches showing the page through the card edge, 7/5pt dashes
 * at 80% bronze; a list row uses a short 5/4pt vertical cut instead.
 */

export const toneColor: Record<Tone, string> = {
  positive: semantic.positive,
  negative: semantic.negative,
  neutral: semantic.neutral,
  pending: semantic.intelligence,
  warning: semantic.warning
};

export const toneSoft: Record<Tone, string> = {
  positive: semantic.positiveSoft,
  negative: semantic.negativeSoft,
  neutral: colors.surfaceStrong,
  pending: semantic.intelligenceSoft,
  warning: semantic.warningSoft
};

/** One outcome as a pill; the label is spelled in capitals for Turkish İ. */
export function ResultPill({ state }: { state: ResultState }) {
  const presentation = resultPresentation[state];
  return (
    <View
      accessibilityLabel={`Sonuç: ${presentation.label}`}
      style={[styles.pill, { backgroundColor: toneSoft[presentation.tone] }]}
    >
      <Text style={[styles.pillText, { color: toneColor[presentation.tone] }]}>{presentation.pill}</Text>
    </View>
  );
}

/** A pill for any tone, for states that are not result outcomes. */
export function TonePill({ label, tone, dot = false }: { label: string; tone: Tone; dot?: boolean }) {
  return (
    <View style={[styles.pill, { backgroundColor: toneSoft[tone] }]}>
      {dot ? <View style={[styles.pillDot, { backgroundColor: toneColor[tone] }]} /> : null}
      <Text style={[styles.pillText, { color: toneColor[tone] }]}>{label}</Text>
    </View>
  );
}

/** Half of a 20pt disc in the page colour, biting into the card edge. */
function Notch({ side }: { side: "left" | "right" | "top" | "bottom" }) {
  const horizontal = side === "left" || side === "right";
  return (
    <View
      pointerEvents="none"
      style={[styles.notchClip, horizontal ? styles.notchClipSide : styles.notchClipEnd, styles[side]]}
    >
      <View
        style={[
          styles.notchDisc,
          side === "left" ? { left: -10 } : side === "right" ? { left: 0 } : side === "top" ? { top: -10 } : { top: 0 }
        ]}
      />
    </View>
  );
}

/**
 * The perforation. `inset` is the card's own padding: the seam reaches the card
 * edges so its notches can open them.
 */
export function TicketSeam({
  orientation = "horizontal",
  inset
}: {
  orientation?: "horizontal" | "vertical";
  inset: number;
}) {
  // The dashes live in a flex wrapper and the Svg fills only that wrapper: an
  // Svg sized "100%" next to margins overflows the card on Android.
  if (orientation === "vertical") {
    return (
      <View style={[styles.seamVertical, { marginVertical: -inset }]}>
        <Notch side="top" />
        <View style={styles.seamVerticalLine}>
          <Svg height="100%" width={2}>
            <Line stroke={colors.bronze} strokeDasharray="7 5" strokeOpacity={0.8} strokeWidth={1.5} x1={1} x2={1} y1={0} y2="100%" />
          </Svg>
        </View>
        <Notch side="bottom" />
      </View>
    );
  }
  return (
    <View style={[styles.seam, { marginHorizontal: -inset }]}>
      <Notch side="left" />
      <View style={styles.seamLine}>
        <Svg height={2} width="100%">
          <Line stroke={colors.bronze} strokeDasharray="7 5" strokeOpacity={0.8} strokeWidth={1.5} x1={0} x2="100%" y1={1} y2={1} />
        </Svg>
      </View>
      <Notch side="right" />
    </View>
  );
}

/** The short vertical cut a list row uses between price and outcome. */
export function ListPerforation({ height = 36 }: { height?: number }) {
  return (
    <Svg height={height} width={2}>
      <Line stroke={colors.bronze} strokeDasharray="5 4" strokeOpacity={0.8} strokeWidth={1.5} x1={1} x2={1} y1={0} y2={height} />
    </Svg>
  );
}

/** Label-under-value pair used inside tickets. */
export function TicketFigure({
  value,
  label,
  tone,
  size = "metric",
  align = "left",
  style
}: {
  value: ReactNode;
  label: string;
  tone?: Tone | undefined;
  size?: "metric" | "large" | "compact";
  align?: "left" | "right";
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[align === "right" ? styles.figureEnd : null, style]}>
      <Text
        style={[
          size === "large" ? styles.figureLarge : size === "compact" ? styles.figureCompact : styles.figure,
          tone ? { color: toneColor[tone] } : null
        ]}
      >
        {value}
      </Text>
      <Text style={styles.figureLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  pillDot: {
    borderRadius: 3,
    height: 6,
    width: 6
  },
  pillText: {
    ...typeScale.eyebrow
  },
  seam: {
    alignItems: "center",
    flexDirection: "row",
    height: 20
  },
  seamLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 14,
    overflow: "hidden"
  },
  seamVertical: {
    alignItems: "center",
    width: 20
  },
  seamVerticalLine: {
    flex: 1,
    marginVertical: 14,
    overflow: "hidden",
    width: 2
  },
  notchClip: {
    overflow: "hidden",
    position: "absolute"
  },
  notchClipSide: {
    height: 20,
    width: 10
  },
  notchClipEnd: {
    height: 10,
    width: 20
  },
  // -1 lays each bite over the card's 1pt border so the edge reads as cut.
  left: { left: -1, top: 0 },
  right: { right: -1, top: 0 },
  top: { left: 0, top: -1 },
  bottom: { bottom: -1, left: 0 },
  notchDisc: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 20,
    position: "absolute",
    width: 20
  },
  figure: {
    color: colors.text,
    ...typeScale.metric
  },
  figureLarge: {
    color: colors.text,
    ...typeScale.metric,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "800"
  },
  figureCompact: {
    color: colors.text,
    ...typeScale.metricCompact
  },
  figureEnd: {
    alignItems: "flex-end"
  },
  figureLabel: {
    color: colors.textMuted,
    ...typeScale.label,
    letterSpacing: 0
  }
});
