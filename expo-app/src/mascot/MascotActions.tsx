import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

export type MascotPageActions = {
  back: () => void;
  refresh: () => void;
  openExternal: () => void;
};

type MascotActionsValue = {
  pageActions: MascotPageActions | null;
  setPageActions: (actions: MascotPageActions | null) => void;
};

const MascotActionsContext = createContext<MascotActionsValue | null>(null);

export function MascotActionsProvider({ children }: PropsWithChildren) {
  const [pageActions, setPageActionsState] =
    useState<MascotPageActions | null>(null);
  const setPageActions = useCallback(
    (actions: MascotPageActions | null) => {
      setPageActionsState(actions);
    },
    []
  );
  const value = useMemo(
    () => ({ pageActions, setPageActions }),
    [pageActions, setPageActions]
  );

  return (
    <MascotActionsContext.Provider value={value}>
      {children}
    </MascotActionsContext.Provider>
  );
}

export function useMascotActions(): MascotActionsValue {
  const value = useContext(MascotActionsContext);
  if (!value) {
    throw new Error(
      "useMascotActions must be used inside MascotActionsProvider."
    );
  }
  return value;
}
