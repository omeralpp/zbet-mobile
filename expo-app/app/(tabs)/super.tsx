import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import type { SelectionRule } from "@/src/api/selection-decisions-schema";
import { DailyCouponLog } from "@/src/components/DailyCouponLog";
import { ChipRow } from "@/src/components/ChipRow";
import { FilterChip } from "@/src/components/FilterChip";
import { RebuildDecisionLog } from "@/src/components/RebuildDecisionLog";
import { Screen } from "@/src/components/Screen";
import { SelectionRuleLog } from "@/src/components/SelectionRuleLog";
import { spacing } from "@/src/theme/theme";

type RuleChoice = "CHAMPION" | "COUPONS" | SelectionRule;
const rules: readonly { id: RuleChoice; label: string }[] = [
  { id: "CHAMPION", label: "Şampiyon" },
  { id: "COUPONS", label: "Günlük kupon" },
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
 * Daily Coupons results live here too (owner direction 2026-11-17); Özet
 * opens this view with `view=COUPONS`.
 */
export default function SuperScreen() {
  // The chosen view lives in the route, so Özet and a reload open the same one.
  const { view } = useLocalSearchParams<{ view?: string }>();
  const router = useRouter();
  const rule: RuleChoice = rules.find((item) => item.id === view)?.id ?? "CHAMPION";
  const setRule = (next: RuleChoice) => router.setParams({ view: next === "CHAMPION" ? "" : next });
  return (
    <Screen brand contentStyle={styles.screen} eyebrow="BTB SUPER" scroll={false} title="Karar günlüğü" wide>
      <View style={styles.body}>
        <ChipRow label="Seçim kuralı">
          {rules.map((item) => (
            <FilterChip key={item.id} label={item.label} onPress={() => setRule(item.id)} selected={rule === item.id} />
          ))}
        </ChipRow>
        {rule === "CHAMPION" ? <RebuildDecisionLog /> : rule === "COUPONS" ? <DailyCouponLog /> : <SelectionRuleLog key={rule} rule={rule} />}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0
  },
  body: { flex: 1, gap: spacing.md }
});
