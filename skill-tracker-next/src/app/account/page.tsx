"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { css } from "@/lib/css";
import { useAuth, initials } from "@/lib/auth";
import PhoneShell from "@/components/PhoneShell";
import { Icon } from "@/components/Icon";
import { Textarea } from "@/components/ui/textarea";
import { Field, PrimaryButton, GhostButton, FIELD_CLASS } from "@/components/auth/kit";

/* ── small Modernist building blocks ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={css("display:flex;flex-direction:column")}>
      <div style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700);padding-bottom:6px;border-bottom:2px solid var(--color-divider);margin-bottom:4px")}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, sub, right, onClick, danger }: { label: string; sub?: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <div onClick={onClick} style={css(`display:flex;align-items:center;gap:12px;min-height:52px;border-bottom:1px solid var(--color-divider);${onClick ? "cursor:pointer" : ""}`)}>
      <div style={css("flex:1;display:flex;flex-direction:column;min-width:0")}>
        <span style={css(`font-size:15px;color:${danger ? "var(--color-accent-700)" : "var(--color-text)"}`)}>{label}</span>
        {sub && <span style={css("font-size:12px;color:var(--color-neutral-700)")}>{sub}</span>}
      </div>
      {right}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} style={css(`width:44px;height:24px;flex:none;border:none;padding:2px;background:${on ? "var(--color-accent)" : "var(--color-neutral-400)"};display:flex;justify-content:${on ? "flex-end" : "flex-start"};cursor:pointer`)}>
      <div style={css("width:20px;height:20px;background:var(--color-bg)")}></div>
    </button>
  );
}

function Segmented({ options, value, onChange }: { options: (string | [string, string])[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={css("display:flex;border:1px solid var(--color-divider)")}>
      {options.map((o) => {
        const val = Array.isArray(o) ? o[0] : o;
        const label = Array.isArray(o) ? o[1] : o;
        const on = value === val;
        return (
          <button key={val} type="button" onClick={() => onChange(val)} style={css(`flex:1;height:38px;border:none;border-right:1px solid var(--color-divider);background:${on ? "var(--color-text)" : "transparent"};color:${on ? "var(--color-bg)" : "var(--color-text)"};font-size:13px;font-weight:600;cursor:pointer`)}>{label}</button>
        );
      })}
    </div>
  );
}

function ProBadge() {
  return <span style={css("font-size:11px;font-weight:600;padding:3px 8px;background:var(--color-accent-100);color:var(--color-accent-800)")}>Pro</span>;
}

const DAYS: [string, string][] = [["M", "M"], ["T", "T"], ["W", "W"], ["Th", "T"], ["F", "F"], ["Sa", "S"], ["Su", "S"]];
const STATS: [string, string, string][] = [
  ["Streak", "12", " days"],
  ["Longest", "21", " days"],
  ["Logged", "178", " h"],
  ["Skills", "6", " active"],
  ["Milestones", "41", ""],
  ["Completion", "86", "%"],
];

export default function AccountPage() {
  const router = useRouter();
  const { status, user, update, logout, remove } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("Lead the frontend team by next summer.");
  const [dailyGoal, setDailyGoal] = useState("45");
  const [weekly, setWeekly] = useState(4);
  const [days, setDays] = useState<Record<string, boolean>>({ M: true, T: true, W: true, Th: true, F: true, Sa: false, Su: false });
  const [theme, setTheme] = useState("system");
  const [notif, setNotif] = useState<Record<string, boolean>>({ daily: true, streak: true, weekly: false, smart: false });
  const [twoFA, setTwoFA] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "guest") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    // Prefill once auth hydrates from localStorage.
    if (user) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setName(user.name);
      setEmail(user.email);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [user]);

  if (status !== "authed") return <PhoneShell>{null}</PhoneShell>;

  const save = () => {
    update({ name: name.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };
  const signOut = () => { logout(); router.replace("/login"); };
  const deleteAccount = () => {
    if (typeof window !== "undefined" && !window.confirm("Delete your account? This can't be undone.")) return;
    remove();
    router.replace("/login");
  };
  const toggleDay = (k: string) => setDays((d) => ({ ...d, [k]: !d[k] }));
  const toggleNotif = (k: string) => setNotif((n) => ({ ...n, [k]: !n[k] }));
  const chev = <Icon name="chevR" size={16} stroke="var(--color-neutral-600)" />;

  return (
    <PhoneShell>
      <div className="no-scrollbar" style={css("flex:1;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:22px;padding:56px 20px 40px")}>

        {/* top bar */}
        <div style={css("display:flex;justify-content:space-between;align-items:center")}>
          <Link href="/" style={{ color: "var(--color-text)", fontWeight: 600, fontSize: "15px", textDecoration: "none", display: "flex", alignItems: "center", gap: "2px" }}>
            <Icon name="chevL" size={20} />Home
          </Link>
          {saved && <span style={css("font-size:13px;font-weight:600;color:var(--color-accent-700)")}>Saved</span>}
        </div>

        {/* hero */}
        <div style={css("display:flex;align-items:center;gap:14px")}>
          <div style={css("width:64px;height:64px;flex:none;background:var(--color-accent-100);color:var(--color-accent-800);display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:800;font-size:22px")}>{initials(name)}</div>
          <div style={css("display:flex;flex-direction:column;gap:2px;min-width:0")}>
            <span style={css("font-family:var(--font-heading);font-weight:800;font-size:26px;line-height:1;letter-spacing:-0.02em")}>{name || "Your name"}</span>
            <span style={css("font-size:13px;color:var(--color-neutral-700);overflow:hidden;text-overflow:ellipsis;white-space:nowrap")}>{email}</span>
            <span style={css("font-size:12px;color:var(--color-neutral-700)")}>Member since June 2026 · Free plan</span>
          </div>
        </div>

        {/* stats */}
        <div style={css("display:grid;grid-template-columns:1fr 1fr 1fr;border-top:2px solid var(--color-divider);border-bottom:2px solid var(--color-divider)")}>
          {STATS.map(([l, v, u], idx) => (
            <div key={l} style={css(`padding:12px 10px;display:flex;flex-direction:column;gap:4px;${idx % 3 !== 0 ? "border-left:1px solid var(--color-divider);" : ""}${idx >= 3 ? "border-top:1px solid var(--color-divider);" : ""}`)}>
              <span style={css("font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:var(--color-neutral-700)")}>{l}</span>
              <span style={css("font-family:var(--font-heading);font-weight:800;font-size:24px;line-height:1")}>{v}<span style={css("font-size:12px;font-weight:600;color:var(--color-neutral-700)")}>{u}</span></span>
            </div>
          ))}
        </div>

        {/* profile */}
        <Section title="Profile">
          <div style={css("display:flex;flex-direction:column;gap:14px;padding-top:6px")}>
            <Field label="Name" value={name} onChange={setName} placeholder="Your name" autoComplete="name" />
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" autoComplete="email" />
            <label style={css("display:flex;flex-direction:column;gap:6px")}>
              <span style={css("font-size:12px;color:var(--color-neutral-700)")}>Your why</span>
              <Textarea className={FIELD_CLASS} value={goal} onChange={(e) => setGoal(e.target.value)} style={css("min-height:76px;padding:12px;font-size:15px;line-height:1.4;background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-divider);resize:none")} />
            </label>
          </div>
        </Section>

        {/* learning */}
        <Section title="Learning">
          <div style={css("display:flex;flex-direction:column;gap:16px;padding-top:6px")}>
            <div style={css("display:flex;flex-direction:column;gap:8px")}>
              <span style={css("font-size:12px;color:var(--color-neutral-700)")}>Daily goal</span>
              <Segmented options={[["20", "20m"], ["30", "30m"], ["45", "45m"], ["60", "60m"]]} value={dailyGoal} onChange={setDailyGoal} />
            </div>
            <div style={css("display:flex;flex-direction:column;gap:8px")}>
              <span style={css("font-size:12px;color:var(--color-neutral-700)")}>Learning days</span>
              <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:4px")}>
                {DAYS.map(([k, label]) => {
                  const on = days[k];
                  return <button key={k} type="button" onClick={() => toggleDay(k)} style={css(`height:42px;border:1px solid ${on ? "var(--color-text)" : "var(--color-divider)"};background:${on ? "var(--color-text)" : "transparent"};color:${on ? "var(--color-bg)" : "var(--color-text)"};font-weight:600;font-size:13px;cursor:pointer`)}>{label}</button>;
                })}
              </div>
            </div>
            <div style={css("display:flex;flex-direction:column;gap:8px")}>
              <span style={css("font-size:12px;color:var(--color-neutral-700)")}>Weekly commitment</span>
              <div style={css("height:48px;display:grid;grid-template-columns:48px 1fr 48px;border:1px solid var(--color-divider);background:var(--color-surface)")}>
                <button type="button" onClick={() => setWeekly((w) => Math.max(1, w - 1))} style={css("border:none;border-right:1px solid var(--color-divider);background:transparent;color:var(--color-text);font-size:20px;cursor:pointer")}>−</button>
                <span style={css("display:flex;align-items:center;padding-left:14px;font-size:16px;font-weight:800;font-family:var(--font-heading)")}>{weekly} h / week</span>
                <button type="button" onClick={() => setWeekly((w) => Math.min(40, w + 1))} style={css("border:none;border-left:1px solid var(--color-divider);background:transparent;color:var(--color-text);font-size:20px;cursor:pointer")}>+</button>
              </div>
            </div>
            <Row label="Reminder time" right={<span style={css("display:flex;align-items:center;gap:6px;font-size:14px;color:var(--color-neutral-700)")}>7:30 AM {chev}</span>} onClick={() => {}} />
          </div>
        </Section>

        <PrimaryButton onClick={save} icon="check">Save changes</PrimaryButton>

        {/* notifications */}
        <Section title="Notifications">
          <Row label="Daily reminder · 7:30 AM" right={<Toggle on={notif.daily} onChange={() => toggleNotif("daily")} />} />
          <Row label="Streak at risk" right={<Toggle on={notif.streak} onChange={() => toggleNotif("streak")} />} />
          <Row label="Weekly summary" right={<Toggle on={notif.weekly} onChange={() => toggleNotif("weekly")} />} />
          <Row label="Smart reminders" right={<div style={css("display:flex;align-items:center;gap:10px")}><ProBadge /><Toggle on={notif.smart} onChange={() => toggleNotif("smart")} /></div>} />
        </Section>

        {/* appearance */}
        <Section title="Appearance">
          <div style={css("display:flex;align-items:center;gap:12px;min-height:52px;border-bottom:1px solid var(--color-divider)")}>
            <span style={css("flex:1;font-size:15px")}>Theme</span>
            <div style={css("width:200px")}><Segmented options={[["light", "Light"], ["dark", "Dark"], ["system", "System"]]} value={theme} onChange={setTheme} /></div>
          </div>
        </Section>

        {/* subscription */}
        <Section title="Subscription">
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={css("display:flex;flex-direction:column;gap:12px;padding:16px;background:var(--color-text);color:var(--color-bg);cursor:pointer")}>
              <div style={css("display:flex;justify-content:space-between;align-items:center")}>
                <span style={css("font-family:var(--font-heading);font-weight:800;font-size:17px")}>You&apos;re on Free</span>
                <span style={css("display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;padding:3px 8px;background:var(--color-accent);color:var(--color-bg)")}><Icon name="sparkles" size={11} sw={2.4} stroke="var(--color-bg)" />Pro</span>
              </div>
              <span style={css("font-size:13px;opacity:0.8;line-height:1.4")}>Unlock AI roadmaps, unlimited skills and advanced insights. 7-day free trial.</span>
              <span style={css("display:flex;align-items:center;gap:8px;font-family:var(--font-heading);font-weight:800;font-size:14px")}>Upgrade to Pro<Icon name="arrow" size={16} sw={2.2} stroke="var(--color-bg)" /></span>
            </div>
          </Link>
          <div style={css("height:6px")}></div>
          <Row label="Billing history" right={chev} onClick={() => {}} />
          <Row label="Redeem a code" right={chev} onClick={() => {}} />
        </Section>

        {/* connected accounts */}
        <Section title="Connected accounts">
          <Row label="Google" sub="maya@gmail.com" right={<span style={css("font-size:13px;font-weight:600;color:var(--color-neutral-700)")}>Connected</span>} />
          <Row label="Apple" right={<span style={css("font-size:13px;font-weight:600;color:var(--color-accent-700)")}>Connect</span>} onClick={() => {}} />
          <Row label="GitHub" right={<span style={css("font-size:13px;font-weight:600;color:var(--color-accent-700)")}>Connect</span>} onClick={() => {}} />
        </Section>

        {/* security */}
        <Section title="Security">
          <Link href="/forgot" style={{ textDecoration: "none" }}>
            <Row label="Change password" right={chev} onClick={() => {}} />
          </Link>
          <Row label="Two-factor authentication" sub={twoFA ? "On" : "Off"} right={<Toggle on={twoFA} onChange={() => setTwoFA((v) => !v)} />} />
          <Row label="Active sessions" sub="This device · iPhone 15" right={<span style={css("display:flex;align-items:center;gap:6px;font-size:14px;color:var(--color-neutral-700)")}>2 {chev}</span>} onClick={() => {}} />
        </Section>

        {/* data & privacy */}
        <Section title="Data & privacy">
          <Row label="Export data" right={<span style={css("display:flex;align-items:center;gap:6px;font-size:14px;color:var(--color-neutral-700)")}>CSV, JSON {chev}</span>} onClick={() => {}} />
          <Row label="Download my data" right={chev} onClick={() => {}} />
          <Row label="Privacy policy" right={chev} onClick={() => {}} />
          <Row label="Terms of service" right={chev} onClick={() => {}} />
        </Section>

        {/* danger */}
        <div style={css("display:flex;flex-direction:column;gap:8px;margin-top:4px")}>
          <GhostButton onClick={signOut}>Log out</GhostButton>
          <GhostButton onClick={deleteAccount} danger>Delete account</GhostButton>
        </div>

        <span style={css("text-align:center;font-size:12px;color:var(--color-neutral-600);padding-top:4px")}>Skill Tracker · v1.0.0</span>
      </div>
    </PhoneShell>
  );
}
