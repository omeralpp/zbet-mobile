import { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { btbBrandMark } from "@/src/theme/brand-mark";
import { colors, radii, textFont } from "@/src/theme/theme";
import { teamInitials } from "@/src/utils/rebuild-log";
import {
  getTeamLogoUrl,
  isProviderPlaceholderLogo,
  resolveTeamLogoSize,
  type TeamLogoSize
} from "@/src/utils/team-logo";

interface TeamLogoProps {
  participantId?: string | null | undefined;
  size?: TeamLogoSize | undefined;
  /** A team without a crest shows its initials (owner decision 2026-10-21). */
  name?: string | undefined;
}

export function TeamLogo(props: TeamLogoProps) {
  const url = getTeamLogoUrl(props.participantId);
  // Live detail reuses this component when the selected match changes. A
  // failed/placeholder crest belongs to its URL, never the next participant.
  return <TeamLogoImage key={url ?? "missing"} {...props} url={url} />;
}

function TeamLogoImage({ size, name, url }: TeamLogoProps & { url: string | null }) {
  const [failed, setFailed] = useState(false);
  const box = resolveTeamLogoSize(size);

  // The web image's load event carries no intrinsic size, so the provider
  // placeholder would pass as a crest there; the browser measures it instead
  // (from its cache, no second download).
  useEffect(() => {
    if (Platform.OS !== "web" || !url) {
      return;
    }
    let active = true;
    Image.getSize(
      url,
      (width, height) => {
        if (active && isProviderPlaceholderLogo(width, height)) {
          setFailed(true);
        }
      },
      () => undefined
    );
    return () => {
      active = false;
    };
  }, [url]);

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

  // Missing, invalid, failed, or a provider placeholder resolve to the team's
  // initials when the name is known (the v40 board), otherwise to the BTB mark.
  // The provider's own placeholder is never shown as BTB's fallback.
  if ((!url || failed) && name) {
    return (
      <View accessibilityElementsHidden style={frame}>
        <Text style={[styles.initials, { fontSize: Math.max(11, Math.round(box * 0.29)) }]}>{teamInitials(name)}</Text>
      </View>
    );
  }
  if (!url || failed) {
    return (
      <View accessibilityElementsHidden style={frame}>
        <Image
          resizeMode="contain"
          source={btbBrandMark}
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

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.borderSoft,
    borderWidth: 1,
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
  initials: {
    ...textFont("700"),
    color: colors.textMuted,
    includeFontPadding: false,
    letterSpacing: 0.2
  }
});
