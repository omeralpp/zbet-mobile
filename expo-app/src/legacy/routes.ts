export function buildLegacyMatchUrl(
  launchpadBaseUrl: string,
  matchKey: string
): string {
  const match = matchKey.match(
    /^(\d{4}-\d{2}-\d{2}):(\d+):(\d{2}):(\d{2}):(\d{2})$/
  );
  if (!match) {
    return `${launchpadBaseUrl}#btb-manage`;
  }

  const [, date, id, hours, minutes, seconds] = match;
  const entityPath =
    `zbet_cds_005(datum=datetime'${date}T00%253A00%253A00',` +
    `id=${id},uzeit=time'PT${hours}H${minutes}M${seconds}S')`;

  return (
    `${launchpadBaseUrl}#btb-manage?` +
    "sap-ui-app-id-hint=saas_approuter_com.btb.btb&/" +
    `${entityPath}/?FCLLayout=MidColumnFullScreen`
  );
}

export function buildLegacyTotoUrl(
  launchpadBaseUrl: string,
  gcNo: number,
  version: number
): string {
  if (gcNo <= 0 || version <= 0) {
    return `${launchpadBaseUrl}#SporToto-manage`;
  }

  return (
    `${launchpadBaseUrl}#SporToto-manage?` +
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
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(key.matchDate) ||
    key.matchId <= 0 ||
    key.elapsed < 0 ||
    !key.selectedOdd ||
    key.rating < 1 ||
    key.rating > 5 ||
    !key.reason
  ) {
    return `${launchpadBaseUrl}#SuperLog-display`;
  }

  const entityPath =
    `SuperLog(datum=${key.matchDate},id=${key.matchId},` +
    `elapsed='${encodeODataText(String(key.elapsed))}',` +
    `selected_odd='${encodeODataText(key.selectedOdd)}',` +
    `rating=${key.rating},` +
    `recalc_reason='${encodeODataText(key.reason)}')`;

  return (
    `${launchpadBaseUrl}#SuperLog-display?` +
    "sap-ui-app-id-hint=saas_approuter_com.btb.superlog.zbetsuperlogreport&/" +
    `${entityPath}/?FCLLayout=MidColumnFullScreen`
  );
}
