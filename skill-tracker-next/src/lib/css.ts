import type { CSSProperties } from "react";

// Parse a plain CSS declaration string ("background:red;border-bottom:1px solid")
// into a React style object. Lets us copy the prototype's inline styles verbatim.
// Values may contain commas (color-mix, rgba) but never semicolons/colons inside,
// which keeps the split trivial.
const cache = new Map<string, CSSProperties>();

export function css(decl: string): CSSProperties {
  const cached = cache.get(decl);
  if (cached) return cached;
  const out: Record<string, string> = {};
  for (const part of decl.split(";")) {
    const i = part.indexOf(":");
    if (i === -1) continue;
    const rawKey = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (!rawKey || val === "") continue;
    // Custom properties stay as-is; others convert kebab-case -> camelCase.
    const key = rawKey.startsWith("--")
      ? rawKey
      : rawKey.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = val;
  }
  const obj = out as CSSProperties;
  cache.set(decl, obj);
  return obj;
}
