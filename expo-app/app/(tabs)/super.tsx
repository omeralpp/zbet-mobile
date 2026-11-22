import { useIsFocused, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import type { SelectionRule } from "@/src/api/selection-decisions-schema";
import { DailyCouponLog } from "@/src/components/DailyCouponLog";
import { SegmentedControl, ViewTabs } from "@/src/components/FilterControls";
import { LocalTabPager } from "@/src/components/LocalTabPager";
import { RebuildDecisionLog } from "@/src/components/RebuildDecisionLog";
import { Screen } from "@/src/components/Screen";
import { SelectionRuleLog } from "@/src/components/SelectionRuleLog";
import { spacing } from "@/src/theme/theme";

type LogView = "CHAMPION" | "COUPONS" | "LAB";
const views = [
  { id: "CHAMPION", label: "Şampiyon", icon: "trophy-outline" },
  { id: "COUPONS", label: "Günlük kupon", icon: "ticket-confirmation-outline" },
  { id: "LAB", label: "Lab", icon: "flask-outline" }
] as const satisfies readonly { id: LogView; label: string; icon: string }[];
const viewIds: readonly LogView[] = views.map((item) => item.id);
const labRules: readonly { id: SelectionRule; label: string }[] = [
  { id: "C1", label: "C1" },
  { id: "C2", label: "C2" },
  { id: "C3", label: "C3" }
];

/**
 * Super · Karar günlüğü: the RB1 published records in the v40 board's layout.
 * Each log owns its scrolling (native pages on the phone, a table on desktop).
 * Three views (owner direction 2026-11-17): the champion, Daily Coupons and
 * Lab, where C1, C2 and C3 are a filter of one Selection Lab view. On a phone
 * the views are swipeable sibling pages; past the last one the swipe carries
 * on to the neighbouring app tab, as the native pager hands it upwards.
 * Özet opens `view=COUPONS`; an older `view=C1` link opens Lab on C1.
 */
export default function SuperScreen() {
  // The chosen view lives in the route, so Özet and a reload open the same one.
  const { view, rule } = useLocalSearchParams<{ view?: string; rule?: string }>();
  const router = useRouter();
  const focused = useIsFocused();
  const legacyRule = labRules.find((item) => item.id === view)?.id;
  const current: LogView = legacyRule ? "LAB" : views.find((item) => item.id === view)?.id ?? "CHAMPION";
  const labRule: SelectionRule = labRules.find((item) => item.id === rule)?.id ?? legacyRule ?? "C1";
  const setView = (next: LogView) => router.setParams({ view: next === "CHAMPION" ? "" : next });
  const setLabRule = (next: SelectionRule) => router.setParams({ view: "LAB", rule: next });
  return (
    <Screen brand contentStyle={styles.screen} eyebrow="BTB SUPER" scroll={false} title="Karar günlüğü" wide>
      <View style={styles.body}>
        <ViewTabs label="Karar günlüğü görünümü" onChange={setView} options={views} value={current} />
        <LocalTabPager
          activeKey={current}
          onSelect={setView}
          renderPage={(page) => (
            <View style={styles.page}>
              {page === "CHAMPION" ? <RebuildDecisionLog /> : page === "COUPONS" ? <DailyCouponLog active={focused && current === "COUPONS"} /> : (
                <SelectionRuleLog
                  rule={labRule}
                  ruleControl={<SegmentedControl label="Lab kuralı" onChange={setLabRule} options={labRules} value={labRule} />}
                />
              )}
            </View>
          )}
          tabs={viewIds}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0
  },
  body: { flex: 1, gap: spacing.md },
  page: { flex: 1, gap: spacing.md }
});
