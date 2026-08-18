import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { colors, surfaceGradient, themeMode } from "@/src/theme/theme";
import { resolveEdgeTrace } from "@/src/theme/surface";

/**
 * The Intelligence Noir material for one content surface.
 *
 * Renders behind a card's own content as an absolutely positioned layer, so a
 * caller keeps its existing `Pressable`, border, radius and shadow and only has
 * to make its background transparent and clip its corners. That keeps the
 * migration to a couple of lines per card and leaves press and layout behaviour
 * exactly as it was.
 *
 * `accent` is the semantic colour of whatever the surface is reporting — pass
 * `semantic.live` for a live match and nothing at all otherwise. An accent is a
 * claim that this card is worth looking at before the others, so passing one by
 * default would spend the language's whole budget on the first screen.
 */
export function SurfaceMaterial({
  accent,
  radius
}: {
  accent?: string | undefined;
  radius: number;
}) {
  const trace = resolveEdgeTrace(accent, colors.border);

  // The material clips itself rather than relying on `overflow: "hidden"` on the
  // card. A card already carries `elevation` for its shadow, and on Android a
  // view with both elevation and clipping can drop its children entirely - which
  // it did, rendering metric cards as empty outlines. Clipping here keeps that
  // combination off any card.
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: radius }, styles.clip]}
    >
      <LinearGradient
        colors={surfaceGradient}
        end={{ x: 0, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={trace.colors}
        end={{ x: 1, y: 0 }}
        start={{ x: 0, y: 0 }}
        style={[
          styles.trace,
          { opacity: trace.opacity, width: `${trace.widthRatio * 100}%` }
        ]}
      />
    </View>
  );
}

/**
 * Divider that carries the surface's energy when it has any.
 *
 * Inside a live card this is the data-flow motif: the rule separating identity
 * from decision stops being structure and becomes a trace with the live colour
 * running through it. Calm cards keep an ordinary hairline, which is what makes
 * the lit one legible as a signal.
 */
export function SurfaceDivider({
  accent,
  style
}: {
  accent?: string | undefined;
  style?: object;
}) {
  if (!accent) {
    return <View style={[styles.divider, style]} />;
  }
  return (
    <LinearGradient
      colors={[`${accent}00`, accent, `${accent}00`]}
      end={{ x: 1, y: 0 }}
      start={{ x: 0, y: 0 }}
      style={[styles.divider, styles.dividerLit, style]}
    />
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden"
  },
  trace: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 1
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft
  },
  dividerLit: {
    // The lit divider is a trace, not a rule, so it never reaches full strength
    // across the card even at its brightest point.
    opacity: themeMode === "light" ? 0.55 : 0.42
  }
});
