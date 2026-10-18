export type DialogKeyAction = { kind: "close" } | { kind: "focus"; index: number } | { kind: "none" };

/** A negative index means focus escaped the modal; -1 also denotes an empty dialog. */
export function dialogKeyAction(key: string, shift: boolean, activeIndex: number, count: number): DialogKeyAction {
  if (key === "Escape") return { kind: "close" };
  if (key !== "Tab") return { kind: "none" };
  if (count === 0) return { kind: "focus", index: -1 };
  if (activeIndex < 0) return { kind: "focus", index: shift ? count - 1 : 0 };
  if (shift && activeIndex === 0) return { kind: "focus", index: count - 1 };
  if (!shift && activeIndex === count - 1) return { kind: "focus", index: 0 };
  return { kind: "none" };
}

type BackgroundElement = {
  inert: boolean;
  getAttribute: (name: string) => string | null;
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
};

/** Restore the exact pre-existing state rather than blindly enabling the page. */
export function suspendDialogBackground(elements: readonly BackgroundElement[]): () => void {
  const previous = elements.map(element => ({ element, inert: element.inert, hidden: element.getAttribute("aria-hidden") }));
  for (const { element } of previous) { element.inert = true; element.setAttribute("aria-hidden", "true"); }
  return () => {
    for (const { element, inert, hidden } of previous) {
      element.inert = inert;
      if (hidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", hidden);
    }
  };
}
