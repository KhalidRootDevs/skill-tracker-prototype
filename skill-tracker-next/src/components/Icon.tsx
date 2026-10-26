import type { CSSProperties } from "react";
import { I } from "@/components/skill-tracker/data";

// Shared lucide-style icon (single path), driven by the prototype's icon set.
export function Icon({
  name,
  size = 18,
  sw = 2,
  stroke = "currentColor",
  style,
}: {
  name: keyof typeof I | string;
  size?: number;
  sw?: number;
  stroke?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d={I[name]} />
    </svg>
  );
}
