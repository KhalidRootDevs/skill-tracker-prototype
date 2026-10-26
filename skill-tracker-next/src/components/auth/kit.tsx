"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { css } from "@/lib/css";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/Icon";

// Reset that pulls shadcn's Input back to the Modernist look.
export const FIELD_CLASS =
  "!rounded-none !shadow-none focus-visible:!ring-0 focus-visible:!border-[var(--color-accent)] placeholder:!text-[var(--color-neutral-700)]";

const fieldStyle = css(
  "height:52px;padding:0 14px;font-size:16px;background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-divider)"
);

export function Brand() {
  return (
    <div style={css("display:flex;align-items:center;gap:8px;font-family:var(--font-heading);font-weight:800;font-size:15px")}>
      <div style={css("width:14px;height:14px;background:var(--color-accent)")}></div>
      Skill Tracker
    </div>
  );
}

export function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label style={css("display:flex;flex-direction:column;gap:6px")}>
      <span style={css("font-size:12px;color:var(--color-neutral-700)")}>{label}</span>
      <Input
        className={FIELD_CLASS}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={fieldStyle}
      />
    </label>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  icon = "arrow",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  icon?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="hov-acc"
      style={css(
        "display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 18px;background:var(--color-accent);color:var(--color-bg);border:none;font-family:var(--font-heading);font-weight:800;font-size:16px;cursor:pointer"
      )}
    >
      <span>{children}</span>
      <Icon name={icon} size={20} sw={2.2} />
    </button>
  );
}

export function OAuthButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={css(
        "display:flex;align-items:center;justify-content:center;gap:10px;height:52px;padding:0 18px;background:transparent;color:var(--color-text);border:1px solid var(--color-divider);font-weight:600;font-size:15px;cursor:pointer"
      )}
    >
      {children}
    </button>
  );
}

// Secondary button that is either a link or a plain button.
export function GhostButton({
  children,
  href,
  onClick,
  danger,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const style = css(
    `height:52px;padding:0 18px;background:transparent;color:${danger ? "var(--color-accent-700)" : "var(--color-text)"};border:1px solid var(--color-divider);font-weight:600;font-size:15px;text-align:left;cursor:pointer;display:flex;align-items:center`
  );
  if (href) {
    return (
      <Link href={href} style={{ ...style, textDecoration: "none" }}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div style={css("display:flex;align-items:center;gap:12px;color:var(--color-neutral-700)")}>
      <div style={css("flex:1;height:1px;background:var(--color-divider)")}></div>
      <span style={css("font-size:12px;font-weight:600")}>{label}</span>
      <div style={css("flex:1;height:1px;background:var(--color-divider)")}></div>
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{ color: "var(--color-accent-700)", fontWeight: 600, textDecoration: "none" }}>
      {children}
    </Link>
  );
}
