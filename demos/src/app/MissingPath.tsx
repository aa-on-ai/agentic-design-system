"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getPathname = () => window.location.pathname;
const getServerPathname = () => null;

/**
 * Names the path that failed so people can tell a typo from a moved page.
 * The 404 page is prerendered once, so the server snapshot is empty and the real
 * path appears after hydration. Reading it during the server render would cause a
 * hydration mismatch that resets the theme attribute on <html>.
 */
export function MissingPath() {
  const pathname = useSyncExternalStore(subscribe, getPathname, getServerPathname);
  if (!pathname || pathname === "/") return null;
  return (
    <>
      There is no page at <code>{pathname}</code>.
    </>
  );
}
