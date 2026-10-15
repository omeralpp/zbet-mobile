import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type LocalTabPagerProps<T extends string> = {
  activeKey: T;
  onSelect: (key: T) => void;
  renderPage: (key: T) => ReactNode;
  tabs: readonly T[];
};

/**
 * Web counterpart of the native pager. A browser has no page swipe, so the
 * filter chips alone switch pages. Every page stays mounted, as on Android,
 * so a page keeps its scroll position and query state when it is hidden.
 */
export function LocalTabPager<T extends string>({
  activeKey,
  renderPage,
  tabs
}: LocalTabPagerProps<T>) {
  const active = tabs.includes(activeKey) ? activeKey : tabs[0];
  return (
    <View style={styles.pager}>
      {tabs.map((key) => (
        <View
          aria-hidden={key !== active}
          key={key}
          style={[styles.page, key !== active && styles.hidden]}
        >
          {renderPage(key)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1
  },
  page: {
    flex: 1
  },
  hidden: {
    display: "none"
  }
});
