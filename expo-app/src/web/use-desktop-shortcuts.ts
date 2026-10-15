import { useEffect } from "react";
import { createShortcutReader, type ShortcutAction } from "./shortcuts";

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

/** Binds the desktop keyboard grammar to the window for the shell's lifetime. */
export function useDesktopShortcuts(onAction: (action: ShortcutAction) => void): void {
  useEffect(() => {
    const read = createShortcutReader();
    const handler = (event: KeyboardEvent) => {
      const action = read({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        editable: isEditable(event.target),
        at: event.timeStamp || Date.now()
      });
      if (action) {
        event.preventDefault();
        onAction(action);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAction]);
}
