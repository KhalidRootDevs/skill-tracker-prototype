"use client";

import type { ReactNode } from "react";
import { css } from "@/lib/css";

// Full-bleed, phone-width column centred on larger screens. Matches the app's
// "app" mode so auth routes feel like part of the same installed app.
export default function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="modernist"
      style={css(
        "width:100%;min-height:100dvh;display:flex;justify-content:center;background:var(--color-neutral-300)"
      )}
    >
      <div
        style={css(
          "position:relative;flex:none;width:min(100vw,430px);min-height:100dvh;overflow-x:hidden;background:var(--color-bg);color:var(--color-text);font-family:var(--font-body);display:flex;flex-direction:column"
        )}
      >
        {children}
      </div>
    </div>
  );
}
