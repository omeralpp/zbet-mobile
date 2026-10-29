/** A drop still commits exactly once when its decorative animation is skipped. */
export function createReorderSettlement({ startAnimated, snapToEnd, onSettled }: {
  startAnimated: (complete: () => void) => () => void;
  snapToEnd: () => void;
  onSettled: () => void;
}) {
  let state: "idle" | "running" | "done" = "idle";
  let stopAnimation: (() => void) | undefined;

  const complete = () => {
    if (state === "done") return;
    state = "done";
    onSettled();
  };
  const finish = () => {
    if (state === "done") return;
    // A stopped RN animation may synchronously call its completion callback.
    // Mark completion first, so that callback cannot commit the move twice.
    state = "done";
    stopAnimation?.();
    snapToEnd();
    onSettled();
  };
  return {
    start(reduceMotion: boolean) {
      if (state !== "idle") return;
      if (reduceMotion) {
        finish();
      } else {
        state = "running";
        stopAnimation = startAnimated(complete);
      }
    },
    finish,
    cancel() {
      if (state === "done") return;
      state = "done";
      stopAnimation?.();
    }
  };
}

export type ReorderSettlement = ReturnType<typeof createReorderSettlement>;
