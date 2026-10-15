const launchKey = "btb.web.launchPlayed";

/** The launch plays once per browser tab; reloads and deep links skip it. */
export function hasPlayedLaunch(): boolean {
  try {
    return window.sessionStorage.getItem(launchKey) === "1";
  } catch {
    return false;
  }
}

export function markLaunchPlayed(): void {
  try {
    window.sessionStorage.setItem(launchKey, "1");
  } catch {
    // Blocked storage only means the launch plays again next time.
  }
}
