import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { SelectionRule } from "@/src/api/selection-decisions-schema";
import { FilterChip } from "@/src/components/FilterChip";
import { RebuildDecisionLog } from "@/src/components/RebuildDecisionLog";
import { Screen } from "@/src/components/Screen";
import { SelectionRuleLog } from "@/src/components/SelectionRuleLog";
import { spacing } from "@/src/theme/theme";

type RuleChoice = "CHAMPION" | SelectionRule;
const rules: readonly { id: RuleChoice; label: string }[] = [
  { id: "CHAMPION", label: "Şampiyon" },
  { id: "C1", label: "C1" },
  { id: "C2", label: "C2 · hazırlanıyor" },
  { id: "C3", label: "C3 · hazırlanıyor" }
];

/**
 * Super · Karar günlüğü: the RB1 published records in the v40 board's layout.
 * The log owns its scrolling (native pages on the phone, a table on desktop).
 * The old A3 history is retired from the client (owner decision 2026-10-21).
 * The rule switch shows Selection Lab alternatives beside the champion
 * (owner direction 2026-11-14); the champion view itself is unchanged.
 */
export default function SuperScreen() {
  const [rule, setRule] = useState<RuleChoice>("CHAMPION");
  return (
    <Screen brand contentStyle={styles.screen} eyebrow="BTB SUPER" scroll={false} title="Karar günlüğü" wide>
      <View style={styles.body}>
        <View accessibilityLabel="Seçim kuralı" accessibilityRole="tablist" style={styles.rules}>
          {rules.map((item) => (
            <FilterChip key={item.id} label={item.label} onPress={() => setRule(item.id)} selected={rule === item.id} />
          ))}
        </View>
        {rule === "CHAMPION" ? <RebuildDecisionLog /> : <SelectionRuleLog key={rule} rule={rule} />}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0
  },
  body: { flex: 1, gap: spacing.md },
  rules: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm }
});
