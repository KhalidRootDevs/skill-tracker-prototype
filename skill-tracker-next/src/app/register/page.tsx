"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import PhoneShell from "@/components/PhoneShell";
import { css } from "@/lib/css";
import { Brand, Field, PrimaryButton, OAuthButton, Divider, TextLink } from "@/components/auth/kit";

export default function RegisterPage() {
  const router = useRouter();
  const { register, status } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "authed") router.replace("/");
  }, [status, router]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    register(name.trim(), email.trim(), password);
    // New accounts land on the dashboard; wire onboarding here later.
    router.push("/");
  };

  const oauth = (provider: string) => {
    register("", `you@${provider}.com`);
    router.push("/");
  };

  return (
    <PhoneShell>
      <form onSubmit={submit} style={css("flex:1;display:flex;flex-direction:column;gap:22px;padding:64px 24px 36px")}>
        <Brand />
        <div style={css("display:flex;flex-direction:column;gap:8px;margin-top:8px")}>
          <div style={css("font-family:var(--font-heading);font-weight:800;font-size:40px;line-height:1;letter-spacing:-0.03em")}>Create your account.</div>
          <div style={css("font-size:15px;color:var(--color-neutral-700)")}>Pick your skills, get one task a day.</div>
        </div>

        <div style={css("display:flex;flex-direction:column;gap:14px")}>
          <Field label="Name" value={name} onChange={setName} placeholder="Maya Chen" autoComplete="name" />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" autoComplete="email" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" />
        </div>

        <PrimaryButton type="submit">Create account</PrimaryButton>

        <Divider label="or" />
        <div style={css("display:flex;flex-direction:column;gap:8px")}>
          <OAuthButton onClick={() => oauth("google")}>Sign up with Google</OAuthButton>
          <OAuthButton onClick={() => oauth("apple")}>Sign up with Apple</OAuthButton>
        </div>

        <div style={css("margin-top:auto;display:flex;justify-content:center;gap:6px;font-size:14px;color:var(--color-neutral-700)")}>
          <span>Already have an account?</span>
          <TextLink href="/login">Log in</TextLink>
        </div>
      </form>
    </PhoneShell>
  );
}
