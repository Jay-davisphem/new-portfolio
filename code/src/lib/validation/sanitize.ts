// Note: React escapes strings by default. This sanitizer is a defense-in-depth helper
// for any field that might later be used in `dangerouslySetInnerHTML` (we should avoid that).

export function sanitizePlainText(input: unknown): string {
  const s = typeof input === "string" ? input : "";
  // Trim and remove common control characters.
  return s.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

export function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidHref(value: string): boolean {
  // Allow site-relative routes like "/#about" and absolute http(s).
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
