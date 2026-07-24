import { useSyncExternalStore } from "react";

// Matches everything below Tailwind's `md` breakpoint (768px): the widths where
// the sidebar becomes a drawer instead of a permanent column.
const SMALL_SCREEN_QUERY = "(max-width: 767px)";

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(SMALL_SCREEN_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(SMALL_SCREEN_QUERY).matches;
}

/**
 * True on phone-sized viewports. Uses useSyncExternalStore so the media query
 * is read during render rather than synced into state by an effect.
 */
export function useIsSmallScreen() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
