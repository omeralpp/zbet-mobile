import { useEffect, useRef, type ReactNode } from "react";
import * as Haptics from "expo-haptics";
import PagerView from "react-native-pager-view";
import { Platform, StyleSheet, View } from "react-native";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";

type LocalTabPagerProps<T extends string> = {
  activeKey: T;
  onSelect: (key: T) => void;
  renderPage: (key: T) => ReactNode;
  tabs: readonly T[];
};

/**
 * A page-local native pager used when filter chips represent real sibling
 * views. Both pages stay mounted, so the neighbour is already painted while
 * the finger is between tabs instead of appearing after a release callback.
 */
export function LocalTabPager<T extends string>({
  activeKey,
  onSelect,
  renderPage,
  tabs
}: LocalTabPagerProps<T>) {
  const pagerRef = useRef<PagerView>(null);
  const reduceMotion = useReducedMotion();
  const activeIndex = Math.max(0, tabs.indexOf(activeKey));
  const settledIndex = useRef(activeIndex);

  useEffect(() => {
    if (settledIndex.current === activeIndex) {
      return;
    }
    settledIndex.current = activeIndex;
    if (reduceMotion) {
      pagerRef.current?.setPageWithoutAnimation(activeIndex);
    } else {
      pagerRef.current?.setPage(activeIndex);
    }
  }, [activeIndex, reduceMotion]);

  return (
    <PagerView
      initialPage={activeIndex}
      offscreenPageLimit={Math.max(1, tabs.length - 1)}
      onPageSelected={(event) => {
        const nextIndex = event.nativeEvent.position;
        settledIndex.current = nextIndex;
        const next = tabs[nextIndex];
        if (!next || next === activeKey) {
          return;
        }
        if (Platform.OS !== "web") {
          Haptics.selectionAsync().catch(() => undefined);
        }
        onSelect(next);
      }}
      overScrollMode="never"
      ref={pagerRef}
      scrollEnabled={!reduceMotion}
      style={styles.pager}
    >
      {tabs.map((key) => (
        <View collapsable={false} key={key} style={styles.page}>
          {renderPage(key)}
        </View>
      ))}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1
  },
  page: {
    flex: 1
  }
});
