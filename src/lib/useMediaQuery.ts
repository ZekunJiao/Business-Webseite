import { useSyncExternalStore } from "react";

// Einheitlicher Breakpoint für die vereinfachte Handy-Ansicht der Demo.
export const MOBILE_QUERY = "(max-width: 760px)";

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
