/** Where to send someone after an email link: only a same-site path, never another host. */
export function safeNext(next: string | null, fallback = "/hari-ini"): string {
  if (!next) return fallback;
  let decoded: string;
  try {
    decoded = decodeURIComponent(next);
  } catch {
    return fallback;
  }
  // "/x" is fine; "//host", "/\host" and "\\host" are read by browsers as another site.
  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("\\")) return fallback;
  return next;
}
