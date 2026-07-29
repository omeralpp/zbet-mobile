const rootTabPaths = new Set(["/", "/live", "/super", "/toto", "/more"]);

export type AndroidBackAction =
  | "back"
  | "home"
  | "confirm-exit"
  | "delegate";

export function resolveAndroidBackAction(
  pathname: string,
  canGoBack: boolean
): AndroidBackAction {
  if (pathname === "/fiori") {
    return "delegate";
  }

  if (rootTabPaths.has(pathname) && pathname !== "/") {
    return "home";
  }

  if (canGoBack) {
    return "back";
  }

  if (pathname !== "/" && pathname !== "/sign-in") {
    return "home";
  }

  return "confirm-exit";
}

export function resolveAndroidFallbackPath(
  pathname: string,
  origin: string
): "/" | "/live" | "/super" | "/toto" | "/more" {
  if (
    pathname.startsWith("/match/") &&
    rootTabPaths.has(origin)
  ) {
    return origin as "/" | "/live" | "/super" | "/toto" | "/more";
  }
  if (pathname.startsWith("/toto/")) {
    return "/toto";
  }
  return "/";
}
