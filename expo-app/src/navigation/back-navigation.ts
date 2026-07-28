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
