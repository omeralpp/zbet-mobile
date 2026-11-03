/**
 * Runs at most `max` tasks at once, in the order they were asked for. A task
 * whose signal aborted while it waited is never started. Used so the day-by-day
 * Karar günlüğü reads reach the BFF (and SAP behind it) a few at a time.
 */
export function createRequestLimiter(max: number) {
  let active = 0;
  const waiting: (() => void)[] = [];
  const next = () => {
    while (active < max && waiting.length) {
      active++;
      waiting.shift()!();
    }
  };
  return function run<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      waiting.push(() => {
        const done = () => {
          active--;
          next();
        };
        if (signal?.aborted) {
          done();
          reject(signal.reason ?? new Error("Aborted"));
          return;
        }
        task().then(resolve, reject).finally(done);
      });
      next();
    });
  };
}
