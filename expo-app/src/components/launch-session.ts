/**
 * Whether the branded launch has already played in this app session. A native
 * launch is a cold start, so it always plays; the web twin
 * (launch-session.web.ts) plays it once per browser tab instead of on every
 * reload or newly opened link.
 */
export function hasPlayedLaunch(): boolean {
  return false;
}

export function markLaunchPlayed(): void {
  // Nothing to remember on native.
}
