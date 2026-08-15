import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import { colors, radii } from "@/src/theme/theme";
import {
  getTeamLogoUrl,
  resolveTeamLogoSize,
  type TeamLogoSize
} from "@/src/utils/team-logo";

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

  // The frame is always rendered at the resolved size so a missing or broken
  // crest keeps home/away rows aligned and never shifts the layout.
  const frame = [
    styles.frame,
    { width: box, height: box, borderRadius: box / 2 }
  ];

  if (!url || failed) {
    return (
      <View accessibilityElementsHidden style={frame}>
        <MaterialCommunityIcons
          color={colors.textSubtle}
          name="shield-outline"
          size={Math.round(box * 0.6)}
        />
      </View>
    );
  }

  return (
    <View accessibilityElementsHidden style={frame}>
      <Image
        onError={() => setFailed(true)}
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
  pair: {
    flexDirection: "row",
    gap: 2
  }
});
