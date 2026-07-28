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
