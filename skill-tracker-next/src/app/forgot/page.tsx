"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import PhoneShell from "@/components/PhoneShell";
import { Icon } from "@/components/Icon";
import { Brand, Field, PrimaryButton, GhostButton, TextLink } from "@/components/auth/kit";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setSent(true); // mock: pretend the email went out
  };

  return (
    <PhoneShell>
      <form onSubmit={submit} style={css("flex:1;display:flex;flex-direction:column;gap:22px;padding:64px 24px 36px")}>
        <Brand />

        {!sent ? (
          <>
            <div style={css("display:flex;flex-direction:column;gap:8px;margin-top:8px")}>
              <div style={css("font-family:var(--font-heading);font-weight:800;font-size:40px;line-height:1;letter-spacing:-0.03em")}>Reset your password.</div>
              <div style={css("font-size:15px;color:var(--color-neutral-700)")}>We&apos;ll email you a reset link.</div>
            </div>
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" autoComplete="email" />
            <PrimaryButton type="submit">Send reset link</PrimaryButton>
          </>
        ) : (
          <>
            <div style={css("display:flex;flex-direction:column;gap:12px;margin-top:8px")}>
              <div style={css("width:48px;height:48px;background:var(--color-accent);color:var(--color-bg);display:flex;align-items:center;justify-content:center")}>
                <Icon name="check" size={26} sw={2.6} />
              </div>
              <div style={css("font-family:var(--font-heading);font-weight:800;font-size:34px;line-height:1.05;letter-spacing:-0.02em")}>Check your email.</div>
              <div style={css("font-size:15px;line-height:1.5;color:var(--color-neutral-800)")}>
                If an account exists for {email}, a reset link is on its way.
              </div>
            </div>
            <GhostButton href="/login">Back to log in</GhostButton>
          </>
        )}

        <div style={css("margin-top:auto;display:flex;justify-content:center;gap:6px;font-size:14px;color:var(--color-neutral-700)")}>
          <span>Remembered it?</span>
          <TextLink href="/login">Log in</TextLink>
        </div>
      </form>
    </PhoneShell>
  );
}
