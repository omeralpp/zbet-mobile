export const mainTabRoutes = ["/", "/live", "/super", "/toto", "/more"] as const;

export type MainTabRoute = (typeof mainTabRoutes)[number];
export type MainTabDirection = "PREVIOUS" | "NEXT";

export function adjacentMainTab(
  pathname: string,
  direction: MainTabDirection
): MainTabRoute | null {
  const normalized = pathname === "/index" ? "/" : pathname;
  const index = mainTabRoutes.indexOf(normalized as MainTabRoute);
  if (index < 0) {
    return null;
  }
  const targetIndex = index + (direction === "NEXT" ? 1 : -1);
  return mainTabRoutes[targetIndex] ?? null;
}
