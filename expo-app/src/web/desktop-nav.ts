/**
 * The five top-level destinations of the desktop shell, in tab order. They
 * are the same expo-router routes the mobile bottom bar switches between, so
 * the sidebar, the keyboard and the command palette all address one list.
 */
export type DesktopDestination = {
  route: "index" | "live" | "super" | "toto" | "more";
  path: "/" | "/live" | "/super" | "/toto" | "/more";
  label: string;
  /** Second key of the `g` navigation chord. */
  chordKey: "o" | "l" | "s" | "t" | "m";
};

export const desktopDestinations: readonly DesktopDestination[] = [
  { route: "index", path: "/", label: "Özet", chordKey: "o" },
  { route: "live", path: "/live", label: "Canlı", chordKey: "l" },
  { route: "super", path: "/super", label: "Super", chordKey: "s" },
  { route: "toto", path: "/toto", label: "Toto", chordKey: "t" },
  { route: "more", path: "/more", label: "Daha Fazla", chordKey: "m" }
];

/** Which destination a pathname belongs to; detail screens map to their tab. */
export function activeDestination(pathname: string): DesktopDestination["route"] {
  const path = pathname.split("?")[0] ?? "/";
  if (path.startsWith("/live") || path.startsWith("/match/")) {
    return "live";
  }
  if (path.startsWith("/super")) {
    return "super";
  }
  if (path.startsWith("/toto")) {
    return "toto";
  }
  if (path.startsWith("/more")) {
    return "more";
  }
  return "index";
}
