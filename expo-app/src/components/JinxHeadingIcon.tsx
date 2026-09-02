import { Image, StyleSheet } from "react-native";

/** Static identity only; not the ambient mascot or another interaction. */
export function JinxHeadingIcon() {
  return (
    <Image
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no"
      resizeMode="contain"
      source={require("../../assets/mascot/jinx-open.png")}
      style={styles.icon}
    />
  );
}

const styles = StyleSheet.create({
  icon: { width: 32, height: 32, flexShrink: 0 }
});
