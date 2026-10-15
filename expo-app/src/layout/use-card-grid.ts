import { Platform, type ViewStyle } from "react-native";
import { spacing } from "@/src/theme/theme";
import { cardColumns } from "./breakpoints";
import { useBreakpoint } from "./use-breakpoint";

export type CardGrid = {
  columns: 1 | 2 | 3;
  /** FlatList `columnWrapperStyle` when columns > 1. */
  rowStyle: ViewStyle | undefined;
  /** Wrapper around one card; keeps a short last row at one column's width. */
  cellStyle: ViewStyle | undefined;
  /** Container for a hand-mapped list of cards (a wrapping row). */
  wrapStyle: ViewStyle | undefined;
};

const single: CardGrid = { columns: 1, rowStyle: undefined, cellStyle: undefined, wrapStyle: undefined };

/**
 * Card grid for list screens on a desktop browser. Native and narrow windows
 * get one column and no extra styles, so the phone layout is untouched.
 */
export function useCardGrid(): CardGrid {
  const breakpoint = useBreakpoint();
  const columns = Platform.OS === "web" ? cardColumns(breakpoint) : 1;
  if (columns === 1) {
    return single;
  }
  const gap = spacing.lg;
  const width = `calc(${100 / columns}% - ${(gap * (columns - 1)) / columns}px)` as ViewStyle["width"];
  return {
    columns,
    rowStyle: { gap },
    cellStyle: { width, minWidth: 0 },
    wrapStyle: { flexDirection: "row", flexWrap: "wrap", columnGap: gap }
  };
}
