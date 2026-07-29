export type SuperDayScopeAction = {
  label: "Bugün" | "Tüm günler";
  nextScope: "LATEST_DAY" | null;
};

export function getSuperDayScopeAction(
  latestDayOnly: boolean
): SuperDayScopeAction {
  return latestDayOnly
    ? { label: "Tüm günler", nextScope: null }
    : { label: "Bugün", nextScope: "LATEST_DAY" };
}
