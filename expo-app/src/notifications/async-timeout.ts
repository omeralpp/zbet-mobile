export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(timeoutMessage)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

// Centralized bounds for every native/network stage in the manual push
// registration transaction. Individual bounds exist so a stuck stage can be
// diagnosed by name; the watchdog is the real, unconditional ceiling.
export const pushTokenTimeoutMs = 15_000;
export const channelsTimeoutMs = 8_000;
export const permissionCheckTimeoutMs = 8_000;
export const permissionRequestTimeoutMs = 20_000;
export const legacyTopicTimeoutMs = 8_000;
export const deviceRegistrationTimeoutMs = 25_000;
export const registrationWatchdogTimeoutMs = 30_000;
