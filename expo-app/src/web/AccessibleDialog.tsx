import { useEffect, useRef, type PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { dialogKeyAction, suspendDialogBackground } from "./dialog-focus";

function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("button,a[href],input,select,textarea,[tabindex]"))
    .filter(element => element.tabIndex >= 0 && !element.hasAttribute("disabled") &&
      element.getAttribute("aria-disabled") !== "true" && !element.closest("[inert]") && element.getClientRects().length > 0);
}

/** Web-only caller. The body portal also clears the mascot's stacking context. */
export function AccessibleDialog({ children, label, onClose, returnFocus }: PropsWithChildren<{
  label: string; onClose: () => void; returnFocus: HTMLElement | null;
}>) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const focusFirst = () => (focusableElements(node)[0] ?? node).focus({ preventScroll: true });
    focusFirst();
    const restoreBackground = suspendDialogBackground(Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== node && !element.contains(node)));
    const keydown = (event: KeyboardEvent) => {
      const items = focusableElements(node);
      const index = items.indexOf(document.activeElement as HTMLElement);
      const action = dialogKeyAction(event.key, event.shiftKey, index, items.length);
      if (action.kind === "none") return;
      event.preventDefault(); event.stopPropagation();
      if (action.kind === "close") onClose();
      else (items[action.index] ?? node).focus({ preventScroll: true });
    };
    const focusin = (event: FocusEvent) => { if (!node.contains(event.target as Node)) focusFirst(); };
    document.addEventListener("keydown", keydown, true);
    document.addEventListener("focusin", focusin, true);
    return () => {
      document.removeEventListener("keydown", keydown, true);
      document.removeEventListener("focusin", focusin, true);
      restoreBackground();
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    };
  }, [onClose, returnFocus]);
  return createPortal(<div ref={root} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}
    style={{ display: "flex", inset: 0, position: "fixed", zIndex: 10000, outline: "none" }}>{children}</div>, document.body);
}
