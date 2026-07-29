import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/src/auth/AuthProvider";
import { colors } from "@/src/theme/theme";

export default function AuthCallbackScreen() {
  const auth = useAuth();

  if (auth.status === "authenticated" || auth.status === "preview") {
    return <Redirect href="/" />;
  }
  if (
    auth.status === "unauthenticated" ||
    auth.status === "configuration-error"
  ) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.green} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center"
  }
});
