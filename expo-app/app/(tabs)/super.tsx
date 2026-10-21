import { StyleSheet } from "react-native";
import { RebuildDecisionLog } from "@/src/components/RebuildDecisionLog";
import { Screen } from "@/src/components/Screen";

/**
 * Super · Karar günlüğü: the RB1 published records in the v40 board's layout.
 * The log owns its scrolling (native pages on the phone, a table on desktop).
 * The old A3 history is retired from the client (owner decision 2026-10-21).
 */
export default function SuperScreen() {
  return (
    <Screen brand contentStyle={styles.screen} eyebrow="BTB SUPER" scroll={false} title="Karar günlüğü" wide>
      <RebuildDecisionLog />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0
  }
});
