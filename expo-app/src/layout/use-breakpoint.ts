import { useWindowDimensions } from "react-native";
import { resolveBreakpoint, type Breakpoint } from "./breakpoints";

/** The current layout width class; re-renders when the window crosses an edge. */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  return resolveBreakpoint(width);
}
