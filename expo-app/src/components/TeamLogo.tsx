import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors, radii } from "@/src/theme/theme";
import {
  getTeamLogoUrl,
  isProviderPlaceholderLogo,
  resolveTeamLogoSize,
  type TeamLogoSize
} from "@/src/utils/team-logo";

/**
 * Canonical BTB mark, reused from the app icon rather than duplicated. It is a
 * bundled local asset, so falling back never issues a network request and can
 * never loop.
 */
const btbFallbackLogo = require("../../assets/icon.png");

export function TeamLogo({
  participantId,
  size
}: {
  participantId?: string | null | undefined;
  size?: TeamLogoSize | undefined;
}) {
  const url = getTeamLogoUrl(participantId);
  const [failed, setFailed] = useState(false);
  const box = resolveTeamLogoSize(size);

  // The crest CDN returns a provider-branded placeholder with HTTP 200 for an
  // unknown participant, so `onError` never fires for it. It is identified by
  // its intrinsic size on load and replaced with BTB branding.
  const handleLoad = (event: {
    nativeEvent: { source?: { width?: number; height?: number } };
  }) => {
    const source = event.nativeEvent.source;
    if (isProviderPlaceholderLogo(source?.width, source?.height)) {
      setFailed(true);
    }
  };

  // The frame is always rendered at the resolved size so a missing or broken
  // crest keeps home/away rows aligned and never shifts the layout.
  const frame = [
    styles.frame,
    { width: box, height: box, borderRadius: box / 2 }
  ];

  // Missing, invalid, failed, or a provider placeholder all resolve to the BTB
  // mark. The provider's own placeholder is never shown as BTB's fallback.
  if (!url || failed) {
    return (
      <View accessibilityElementsHidden style={frame}>
        <Image
          resizeMode="contain"
          source={btbFallbackLogo}
          style={styles.fallback}
        />
      </View>
    );
  }

  return (
    <View accessibilityElementsHidden style={frame}>
      <Image
        onError={() => setFailed(true)}
        onLoad={handleLoad}
        resizeMode="contain"
        source={{ uri: url }}
        style={styles.image}
      />
    </View>
  );
}

export function TeamLogoPair({
  awayParticipantId,
  homeParticipantId,
  size
}: {
  awayParticipantId?: string | null | undefined;
  homeParticipantId?: string | null | undefined;
  size?: TeamLogoSize | undefined;
}) {
  return (
    <View style={styles.pair}>
      <TeamLogo participantId={homeParticipantId} size={size} />
      <TeamLogo participantId={awayParticipantId} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.borderSoft,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radii.sm
  },
  // Inset slightly so the square mark reads correctly inside the round frame,
  // and contained so it never stretches or crops.
  fallback: {
    width: "78%",
    height: "78%"
  },
  pair: {
    flexDirection: "row",
    gap: 2
  }
});
