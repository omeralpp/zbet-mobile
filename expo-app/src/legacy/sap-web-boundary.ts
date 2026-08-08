export function parseSapWebAllowedHosts(value: string): string[] {
  return [...new Set(
    value
      .split(/[\s,]+/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(
        (entry) =>
          /^(?:\*\.)?[a-z0-9.-]+$/.test(entry) &&
          !entry.includes("..") &&
          entry.replace(/^\*\./, "").split(".").length >= 3
      )
  )];
}

export function isAllowedSapWebUrl(
  candidate: string,
  allowedHosts: readonly string[]
): boolean {
  if (candidate === "about:blank") {
    return true;
  }
  try {
    const url = new URL(candidate);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !allowedHosts.length
    ) {
      return false;
    }
    const hostname = url.hostname.toLowerCase();
    return allowedHosts.some((entry) =>
      entry.startsWith("*.")
        ? hostname.endsWith(entry.slice(1)) && hostname !== entry.slice(2)
        : hostname === entry
    );
  } catch {
    return false;
  }
}
