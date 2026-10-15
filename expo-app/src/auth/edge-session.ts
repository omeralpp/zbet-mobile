/**
 * Cloudflare Access owns the browser session of the web build. When it lapses,
 * the edge answers an API call with a redirect to its own login page, which a
 * same-origin fetch must not follow. One full reload sends the owner through
 * Access again; a second loss inside the guard window is reported instead of
 * reloading in a loop.
 */
export const edgeLogoutPath = "/cdn-cgi/access/logout";

const reloadGuardKey = "btb.edge.reloadAt";
const reloadGuardMs = 60_000;

export type EdgeResponseShape = {
  status: number;
  type?: string;
};

export type EdgeReloadHost = {
  now(): number;
  read(key: string): string | null;
  write(key: string, value: string): void;
  reload(): void;
};

export function isEdgeSessionLost(response: EdgeResponseShape): boolean {
  return response.type === "opaqueredirect" || response.status === 401;
}

/** Reloads once per guard window; returns whether it reloaded. */
export function recoverEdgeSession(host: EdgeReloadHost): boolean {
  const now = host.now();
  const last = Number(host.read(reloadGuardKey));
  if (Number.isFinite(last) && last > 0 && now - last < reloadGuardMs) {
    return false;
  }
  host.write(reloadGuardKey, String(now));
  host.reload();
  return true;
}

export function browserReloadHost(): EdgeReloadHost | null {
  if (typeof window === "undefined" || !window.location) {
    return null;
  }
  return {
    now: () => Date.now(),
    read: (key) => {
      try {
        return window.sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    write: (key, value) => {
      try {
        window.sessionStorage.setItem(key, value);
      } catch {
        // Storage can be blocked; the reload itself still recovers the session.
      }
    },
    reload: () => window.location.reload()
  };
}
