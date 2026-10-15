/**
 * The only react-dom API the web shell uses. react-dom ships with Expo for the
 * web target, but its type package is not a dependency of this app; declaring
 * the one function keeps the dependency set unchanged.
 */
declare module "react-dom" {
  import type { ReactNode, ReactPortal } from "react";

  export function createPortal(
    children: ReactNode,
    container: Element | DocumentFragment,
    key?: string | null
  ): ReactPortal;
}
