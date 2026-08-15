import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import { colors } from "@/src/theme/theme";
import { getTeamLogoUrl } from "@/src/utils/team-logo";

export function TeamLogo({
  participantId,
  size = 20
}: {
  participantId?: string | null | undefined;
  size?: number;
}) {
  const url = getTeamLogoUrl(participantId);
  const [failed, setFailed] = useState(false);

  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 }
  ];

  if (!url || failed) {
    return (
      <View accessibilityElementsHidden style={containerStyle}>
        <MaterialCommunityIcons
          color={colors.textSubtle}
          name="shield-outline"
          size={Math.round(size * 0.65)}
        />
      </View>
    );
  }

  return (
    <View accessibilityElementsHidden style={containerStyle}>
      <Image
        onError={() => setFailed(true)}
        resizeMode="contain"
        source={{ uri: url }}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: "100%"
  }
});
