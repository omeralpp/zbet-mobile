import { classifyUiError } from "../components/ui-error";

type TotoQuerySnapshot<T> = {
  data: T | undefined;
  dataUpdatedAt: number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};
type TotoQueryView<T> =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "current" | "retained"; data: T; receivedAt: number };

/** Failed refreshes retain read-only evidence, never an access-denied record. */
export function totoQueryView<T>(query: TotoQuerySnapshot<T>): TotoQueryView<T> {
  if (query.data === undefined) return { kind: query.isLoading ? "loading" : "unavailable" };
  if (query.isError) {
    const category = classifyUiError(query.error);
    if (category === "SESSION" || category === "FORBIDDEN" || category === "NOT_FOUND") return { kind: "unavailable" };
    return { kind: "retained", data: query.data, receivedAt: query.dataUpdatedAt };
  }
  return { kind: "current", data: query.data, receivedAt: query.dataUpdatedAt };
}
