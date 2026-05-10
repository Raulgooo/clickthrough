import { createContext, useContext } from "react";

export type ActionHandler = (actionId: string, payload?: Record<string, unknown>) => void;

export const ActionContext = createContext<ActionHandler | undefined>(undefined);

export function useAction(): ActionHandler | undefined {
  return useContext(ActionContext);
}
