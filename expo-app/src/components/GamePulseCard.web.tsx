import { memo, useMemo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { buildGamePulseUrl } from "@/src/external/bilyoner";
import { colors, iconSizes, radii, semantic, spacing } from "@/src/theme/theme";

/**
 * Web twin of GamePulseCard (platform exception under the Client Parity rule).
 *
 * Bilyoner's own Content-Security-Policy allows its panel to be framed only by
 * bilyoner.com (`frame-ancestors 'self' https://bilyoner.com
 * https://*.bilyoner.com`, observed 2026-10-15), so an iframe on
 * app.surklase.com would stay an empty box. The web card therefore opens the
 * same allowlisted panel in a new tab; the Android app keeps the embedded view.
 */
function GamePulseCardComponent({
  betRadarId
}: {
  betRadarId?: string | null | undefined;
}) {
  const url = useMemo(() => buildGamePulseUrl(betRadarId), [betRadarId]);

  return (
    <View style={styles.card}>
      <View style={styles.state}>
        <MaterialCommunityIcons
          color={url ? semantic.live : semantic.unavailable}
          name="pulse"
          size={iconSizes.state}
        />
        <Text style={styles.stateTitle}>
          {url ? "Canlı tempo Bilyoner'de" : "Canlı tempo bekleniyor"}
        </Text>
        <Text style={styles.stateBody}>
          {url
            ? "Bilyoner canlı anlatım panelini yalnız kendi sitesinde gösteriyor; panel yeni sekmede açılır."
            : "Bu maç için canlı tempo verisi henüz sunulmuyor. Diğer analizler kullanılabilir."}
        </Text>
        {url ? (
          <Pressable
            accessibilityHint="Bilyoner canlı anlatım panelini yeni sekmede açar"
            accessibilityRole="link"
            onPress={() => {
              Linking.openURL(url).catch(() => undefined);
            }}
            style={({ hovered, pressed }) => [styles.open, hovered && styles.openHover, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons color={colors.white} name="open-in-new" size={iconSizes.small} />
            <Text style={styles.openText}>Canlı anlatımı aç</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.source}>Kaynak: Bilyoner canlı anlatım</Text>
    </View>
  );
}

export const GamePulseCard = memo(GamePulseCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden"
  },
  state: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg
  },
  stateTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  stateBody: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    maxWidth: 420,
    textAlign: "center"
  },
  open: {
    alignItems: "center",
    backgroundColor: semantic.intelligence,
    borderRadius: radii.round,
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.xl
  },
  openHover: {
    opacity: 0.9
  },
  pressed: {
    opacity: 0.75
  },
  openText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900"
  },
  source: {
    color: colors.textSubtle,
    fontSize: 9,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    textAlign: "right"
  }
});
