"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import SkillTracker from "@/components/skill-tracker/SkillTracker";
import PhoneShell from "@/components/PhoneShell";
import { css } from "@/lib/css";

// Root route: requires auth. Guests are bounced to /login; a brand splash shows
// while auth state resolves to avoid a flash of app content.
export default function AppRoute() {
  const router = useRouter();
  const { status, user, logout } = useAuth();

  useEffect(() => {
    if (status === "guest") router.replace("/login");
  }, [status, router]);

  if (status !== "authed") {
    return (
      <PhoneShell>
        <div style={css("flex:1;display:flex;align-items:center;justify-content:center")}>
          <div style={css("display:flex;align-items:center;gap:8px;font-family:var(--font-heading);font-weight:800;font-size:18px")}>
            <div style={css("width:16px;height:16px;background:var(--color-accent)")}></div>
            Skill Tracker
          </div>
        </div>
      </PhoneShell>
    );
  }

  return (
    <SkillTracker
      mode="app"
      user={user ?? undefined}
      onSignOut={() => {
        logout();
        router.replace("/login");
      }}
      onOpenAccount={() => router.push("/account")}
    />
  );
}
