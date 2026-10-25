import type { PathMoment } from "./match-path-model";

/** Exact events advance in their retained order, including ties at one minute.
 * From a sampled minute, the controls also offer events at that same minute. */
export function journeyNavigation(moments: readonly PathMoment[], key: string | null, minute: number | undefined) {
  const index = moments.findIndex(moment => moment.key === key);
  if (index >= 0) return { index, previous: moments[index - 1], next: moments[index + 1] };
  if (minute === undefined) return { index, previous: undefined, next: moments[0] };
  return { index, previous: [...moments].reverse().find(moment => moment.minute <= minute), next: moments.find(moment => moment.minute >= minute) };
}
