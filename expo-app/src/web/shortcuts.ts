import { desktopDestinations, type DesktopDestination } from "./desktop-nav";

/**
 * Desktop keyboard grammar, kept free of DOM so it can be tested.
 *
 *   g then o/l/s/t/m   go to Özet / Canlı / Super / Toto / Daha Fazla
 *   Ctrl+K or Cmd+K    open the command palette (also from inside a field)
 *   /                  open the command palette
 *   ?                  show the shortcut help
 *   Escape             close whatever overlay is open
 *
 * Plain keys are ignored while the user types in a field, so a search box or
 * a filter never triggers navigation.
 */
export type ShortcutAction =
  | { kind: "navigate"; path: DesktopDestination["path"] }
  | { kind: "palette" }
  | { kind: "help" }
  | { kind: "escape" };

export type ShortcutKey = {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  /** True when focus is in an input, textarea, select or contenteditable. */
  editable: boolean;
  /** Event time in milliseconds. */
  at: number;
};

export const chordWindowMs = 1200;

export function createShortcutReader() {
  let chordStartedAt: number | null = null;

  return function read(event: ShortcutKey): ShortcutAction | null {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

    if ((event.ctrlKey || event.metaKey) && !event.altKey && key === "k") {
      chordStartedAt = null;
      return { kind: "palette" };
    }
    if (key === "Escape") {
      chordStartedAt = null;
      return { kind: "escape" };
    }
    if (event.editable || event.ctrlKey || event.metaKey || event.altKey) {
      chordStartedAt = null;
      return null;
    }

    if (chordStartedAt !== null) {
      const withinChord = event.at - chordStartedAt <= chordWindowMs;
      chordStartedAt = null;
      if (withinChord) {
        const destination = desktopDestinations.find((item) => item.chordKey === key);
        if (destination) {
          return { kind: "navigate", path: destination.path };
        }
      }
    }

    if (key === "g") {
      chordStartedAt = event.at;
      return null;
    }
    if (key === "/") {
      return { kind: "palette" };
    }
    if (key === "?") {
      return { kind: "help" };
    }
    return null;
  };
}

export const shortcutHelp: readonly { keys: string; action: string }[] = [
  ...desktopDestinations.map((item) => ({
    keys: `g ${item.chordKey}`,
    action: `${item.label} sayfasına git`
  })),
  { keys: "Ctrl K  veya  /", action: "Maç, Super kararı veya Toto programı ara" },
  { keys: "?", action: "Kısayolları göster" },
  { keys: "Esc", action: "Açık pencereyi kapat" }
];
