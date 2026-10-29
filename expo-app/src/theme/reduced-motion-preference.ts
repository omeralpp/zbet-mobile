export type ReducedMotionPreference = {
  ready: boolean;
  reduceMotion: boolean;
};

export const pendingReducedMotionPreference: ReducedMotionPreference = { ready: false, reduceMotion: true };

type MotionPreferenceSource = {
  read(): Promise<boolean>;
  subscribe(listener: (enabled: boolean) => void): { remove(): void };
};

/** Subscribe before reading so a newer device setting wins over an old async answer. */
export function observeReducedMotionPreference(source: MotionPreferenceSource, publish: (preference: ReducedMotionPreference) => void): () => void {
  let active = true;
  let eventReceived = false;
  let listenerFailed = false;
  let subscription: { remove(): void } | undefined;
  const settle = (enabled: boolean) => {
    if (active && !eventReceived) publish({ ready: true, reduceMotion: listenerFailed || enabled !== false });
  };
  try {
    subscription = source.subscribe(enabled => {
      if (!active) return;
      eventReceived = true;
      publish({ ready: true, reduceMotion: enabled !== false });
    });
  } catch {
    // Without observation, a later user setting cannot be honored reliably.
    listenerFailed = true;
  }
  try {
    source.read().then(settle).catch(() => settle(true));
  } catch {
    settle(true);
  }
  return () => {
    if (!active) return;
    active = false;
    subscription?.remove();
  };
}
