export type NotificationData = Record<string, unknown>;

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function normalizeDate(value: unknown): string {
  const text = asString(value);
  const compact = text.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    return `${compact[1]}-${compact[2]}-${compact[3]}`;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function normalizeTime(value: unknown): string {
  const text = asString(value);
  const compact = text.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (compact) {
    return `${compact[1]}:${compact[2]}:${compact[3]}`;
  }
  if (/^\d{2}:\d{2}$/.test(text)) {
    return `${text}:00`;
  }
  return /^\d{2}:\d{2}:\d{2}$/.test(text) ? text : "";
}

function notificationMatchKey(data: NotificationData): string {
  const explicit = asString(data.match_key ?? data.matchKey);
  if (explicit) {
    return explicit;
  }

  const id = asString(data.match_id ?? data.matchId);
  const date = normalizeDate(data.match_date ?? data.matchDate);
  const time = normalizeTime(data.match_time ?? data.matchTime);

  return /^\d+$/.test(id) && date && time ? `${date}:${id}:${time}` : "";
}

export function notificationDataToPath(data: NotificationData): string {
  const matchKey = notificationMatchKey(data);
  if (matchKey) {
    return `/match/${encodeURIComponent(matchKey)}`;
  }

  const gcNo = asString(
    data.toto_program_gc_no ?? data.totoProgramGcNo ?? data.gc_no
  );
  const version = asString(
    data.toto_program_version ?? data.totoProgramVersion ?? data.version_no
  );
  if (/^\d+$/.test(gcNo) && /^\d+$/.test(version)) {
    return `/toto/${gcNo}/${version}`;
  }

  const route = asString(data.route ?? data.target ?? data.screen).toLowerCase();
  if (
    route === "super" ||
    route === "superlog" ||
    route === "super-log" ||
    route === "sclear"
  ) {
    return "/super";
  }
  if (route === "toto" || route === "sportoto" || route === "spor-toto") {
    return "/toto";
  }
  if (route === "btb" || route === "main" || route === "live") {
    return "/live";
  }
  return "/";
}
