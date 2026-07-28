export type WidgetInputData = Record<string, unknown>;

export type BtbWidgetPayload = {
  title?: string;
  body?: string;
  route?: "home" | "btb" | "super" | "toto";
  rating?: number;
  match_id?: string;
  match_date?: string;
  match_time?: string;
  toto_coverage_hits?: number;
  toto_coverage_total?: number;
  toto_program_gc_no?: number;
  toto_program_version?: number;
  super_min_rating?: number;
  super_wins?: number;
  super_losses?: number;
  super_profit?: number;
};

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function firstValue(data: WidgetInputData, ...keys: string[]): string {
  for (const key of keys) {
    const value = asString(data[key]);
    if (value) {
      return value;
    }
  }
  return "";
}

function nonNegativeInteger(value: unknown): number | null {
  const text = asString(value);
  const parsed = Number(text);
  return /^\d+$/.test(text) &&
    Number.isSafeInteger(parsed) &&
    parsed >= 0
    ? parsed
    : null;
}

function finiteNumber(value: unknown): number | null {
  const text = asString(value);
  const parsed = Number(text);
  return text && Number.isFinite(parsed) ? parsed : null;
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

function normalizeRoute(
  explicitRoute: string,
  title: string,
  body: string
): "home" | "btb" | "super" | "toto" {
  const route = explicitRoute.toLowerCase();
  if (["super", "superlog", "super-log", "sclear"].includes(route)) {
    return "super";
  }
  if (["btb", "main", "live"].includes(route)) {
    return "btb";
  }
  if (["toto", "sportoto", "spor-toto"].includes(route)) {
    return "toto";
  }

  const text = `${title} ${body}`.toLowerCase();
  if (text.includes("super") || text.includes("sclear")) {
    return "super";
  }
  if (text.includes("toto")) {
    return "toto";
  }
  return title || body ? "btb" : "home";
}

function parseRating(value: unknown, body: string): number {
  const explicit = Number.parseInt(asString(value), 10);
  if (explicit >= 1 && explicit <= 5) {
    return explicit;
  }

  const match = body.match(/\brating\s*([1-5])\b/i);
  return match?.[1] ? Number.parseInt(match[1], 10) : 0;
}

function cleanWidgetBody(body: string, rating: number): string {
  if (!rating) {
    return body;
  }

  const cleaned = body
    .replace(/\s*\(\s*rating\s*[1-5]\s*\)\s*[.!?]?\s*$/i, "")
    .replace(/\s*[★⭐]{1,5}\s*[.!?]?\s*$/, "")
    .trim();
  return cleaned && !/[.!?]$/.test(cleaned) ? `${cleaned}.` : cleaned;
}

export function buildWidgetPayload(
  data: WidgetInputData
): BtbWidgetPayload | null {
  const title = firstValue(data, "notification_title", "title");
  const notificationBody = firstValue(
    data,
    "notification_body",
    "body"
  );
  const sourceBody =
    firstValue(data, "widget_body") || notificationBody;
  const rating = parseRating(
    data.rating ?? data.star ?? data.stars ?? data.super_rating,
    notificationBody || sourceBody
  );
  const matchId = firstValue(data, "match_id", "matchId");
  const matchDate = normalizeDate(data.match_date ?? data.matchDate);
  const matchTime = normalizeTime(data.match_time ?? data.matchTime);
  const hasMatch =
    /^\d+$/.test(matchId) && Boolean(matchDate) && Boolean(matchTime);
  const payload: BtbWidgetPayload = {};

  if (title || sourceBody) {
    payload.title = title || (rating ? "Yeni Super bildirimi" : "BTB Mobile");
    payload.body =
      cleanWidgetBody(sourceBody, rating) ||
      "BTB uygulamasını açmak için dokunun.";
    payload.route = hasMatch
      ? "btb"
      : normalizeRoute(
          firstValue(data, "route", "target", "screen"),
          title,
          sourceBody
        );
    if (rating) {
      payload.rating = rating;
    }
    if (hasMatch) {
      payload.match_id = matchId;
      payload.match_date = matchDate;
      payload.match_time = matchTime;
    }
  }

  const totoHits = nonNegativeInteger(
    data.toto_coverage_hits ?? data.totoCoverageHits
  );
  const totoTotal = nonNegativeInteger(
    data.toto_coverage_total ?? data.totoCoverageTotal
  );
  if (totoHits !== null && totoTotal !== null && totoHits <= totoTotal) {
    payload.toto_coverage_hits = totoHits;
    payload.toto_coverage_total = totoTotal;
    const gcNo = nonNegativeInteger(
      data.toto_program_gc_no ?? data.totoProgramGcNo
    );
    const version = nonNegativeInteger(
      data.toto_program_version ?? data.totoProgramVersion
    );
    if (gcNo && version) {
      payload.toto_program_gc_no = gcNo;
      payload.toto_program_version = version;
    }
  }

  const minRating = nonNegativeInteger(
    data.super_min_rating ?? data.superMinRating
  );
  if (minRating !== null && minRating >= 1 && minRating <= 5) {
    const wins =
      nonNegativeInteger(data.super_wins ?? data.superWins ?? 0) ?? 0;
    const losses =
      nonNegativeInteger(data.super_losses ?? data.superLosses ?? 0) ?? 0;
    const profit =
      finiteNumber(data.super_profit ?? data.superProfit ?? 0) ?? 0;
    payload.super_min_rating = minRating;
    payload.super_wins = wins;
    payload.super_losses = losses;
    payload.super_profit = profit;
  }

  return Object.keys(payload).length ? payload : null;
}
