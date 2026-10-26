"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import PhoneShell from "@/components/PhoneShell";
import { css } from "@/lib/css";
import { Brand, Field, PrimaryButton, OAuthButton, Divider, TextLink } from "@/components/auth/kit";

export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "authed") router.replace("/");
  }, [status, router]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    login(email.trim(), password);
    router.push("/");
  };

  const oauth = (provider: string) => {
    login(`you@${provider}.com`);
    router.push("/");
  };

  return (
    <PhoneShell>
      <form onSubmit={submit} style={css("flex:1;display:flex;flex-direction:column;gap:22px;padding:64px 24px 36px")}>
        <Brand />
        <div style={css("display:flex;flex-direction:column;gap:8px;margin-top:8px")}>
          <div style={css("font-family:var(--font-heading);font-weight:800;font-size:40px;line-height:1;letter-spacing:-0.03em")}>Welcome back.</div>
          <div style={css("font-size:15px;color:var(--color-neutral-700)")}>Log in to keep your streak going.</div>
        </div>

        <div style={css("display:flex;flex-direction:column;gap:14px")}>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" autoComplete="email" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
          <div style={css("display:flex;justify-content:flex-end")}>
            <TextLink href="/forgot">Forgot password?</TextLink>
          </div>
        </div>

        <PrimaryButton type="submit">Log in</PrimaryButton>

        <Divider label="or" />
        <div style={css("display:flex;flex-direction:column;gap:8px")}>
          <OAuthButton onClick={() => oauth("google")}>Continue with Google</OAuthButton>
          <OAuthButton onClick={() => oauth("apple")}>Continue with Apple</OAuthButton>
        </div>

        <div style={css("margin-top:auto;display:flex;justify-content:center;gap:6px;font-size:14px;color:var(--color-neutral-700)")}>
          <span>New here?</span>
          <TextLink href="/register">Create account</TextLink>
        </div>
      </form>
    </PhoneShell>
  );
}
