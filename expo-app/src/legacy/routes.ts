/**
 * The configured Work Zone base URL is a site URL and must carry no
 * fragment of its own (`#Shell-home` included) — every caller below adds
 * exactly one `#<semanticObject>-<action>` (or `#Shell-home` for plain
 * home navigation). Stripping any existing fragment here, once, keeps a
 * misconfigured base (e.g. one still carrying `#Shell-home`) from ever
 * producing a double-hash URL that Work Zone's shell cannot parse.
 */
export function normalizeWorkZoneBaseUrl(launchpadBaseUrl: string): string {
  const fragmentIndex = launchpadBaseUrl.indexOf("#");
  return fragmentIndex === -1
    ? launchpadBaseUrl
    : launchpadBaseUrl.slice(0, fragmentIndex);
}

export function buildWorkZoneHomeUrl(launchpadBaseUrl: string): string {
  return `${normalizeWorkZoneBaseUrl(launchpadBaseUrl)}#Shell-home`;
}

export function buildLegacyMatchUrl(
  launchpadBaseUrl: string,
  matchKey: string
): string {
  const base = normalizeWorkZoneBaseUrl(launchpadBaseUrl);
  const match = matchKey.match(
    /^(\d{4}-\d{2}-\d{2}):(\d+):(\d{2}):(\d{2}):(\d{2})$/
  );
  if (!match) {
    return `${base}#btb-manage`;
  }

  const [, date, id, hours, minutes, seconds] = match;
  const entityPath =
    `zbet_cds_005(datum=datetime'${date}T00%253A00%253A00',` +
    `id=${id},uzeit=time'PT${hours}H${minutes}M${seconds}S')`;

  return (
    `${base}#btb-manage?` +
    "sap-ui-app-id-hint=saas_approuter_com.btb.btb&/" +
    `${entityPath}/?FCLLayout=MidColumnFullScreen`
  );
}

export function buildLegacyTotoUrl(
  launchpadBaseUrl: string,
  gcNo: number,
  version: number
): string {
  const base = normalizeWorkZoneBaseUrl(launchpadBaseUrl);
  if (gcNo <= 0 || version <= 0) {
    return `${base}#SporToto-manage`;
  }

  return (
    `${base}#SporToto-manage?` +
    "sap-ui-app-id-hint=saas_approuter_com.btb.toto.zbettotoapp&/" +
    `Programs(gc_no=${gcNo},version_no=${version})/` +
    "?FCLLayout=MidColumnFullScreen"
  );
}

function encodeODataText(value: string): string {
  return encodeURIComponent(value.replace(/'/g, "''"));
}

export function buildLegacySuperLogUrl(
  launchpadBaseUrl: string,
  key: {
    matchDate: string;
    matchId: number;
    elapsed: number;
    selectedOdd: string;
    rating: number;
    reason: string;
  }
): string {
  const base = normalizeWorkZoneBaseUrl(launchpadBaseUrl);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(key.matchDate) ||
    key.matchId <= 0 ||
    key.elapsed < 0 ||
    !key.selectedOdd ||
    key.rating < 1 ||
    key.rating > 5 ||
    !key.reason
  ) {
    return `${base}#SuperLog-display`;
  }

  const entityPath =
    `SuperLog(datum=${key.matchDate},id=${key.matchId},` +
    `elapsed='${encodeODataText(String(key.elapsed))}',` +
    `selected_odd='${encodeODataText(key.selectedOdd)}',` +
    `rating=${key.rating},` +
    `recalc_reason='${encodeODataText(key.reason)}')`;

  return (
    `${base}#SuperLog-display?` +
    "sap-ui-app-id-hint=saas_approuter_com.btb.superlog.zbetsuperlogreport&/" +
    `${entityPath}/?FCLLayout=MidColumnFullScreen`
  );
}
