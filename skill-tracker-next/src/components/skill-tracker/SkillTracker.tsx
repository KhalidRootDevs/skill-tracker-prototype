"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { css } from "@/lib/css";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { initials } from "@/lib/auth";
import {
  I, TASKS, SK, ROAD, SCREENS, LABELS, TABS, TAB_OF, OB,
  A, INK, BG, DIV, initialState,
} from "./data";

// Small helper mirroring the prototype's lucide-style single-path icons.
function Svg({ d, size = 18, sw = 2, stroke = "currentColor", style }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={d} />
    </svg>
  );
}

// Shared styling that resets shadcn Input/Textarea back to the modernist look.
const fieldReset =
  "!rounded-none !shadow-none focus-visible:!ring-0 focus-visible:!border-[var(--color-accent)] placeholder:!text-[var(--color-neutral-700)]";

export default function SkillTracker({
  mode = "app",
  onSignOut,
  onOpenAccount,
  user,
}: {
  mode?: "app" | "showcase";
  onSignOut?: () => void;
  onOpenAccount?: () => void;
  user?: { name: string; email: string };
}) {
  const [st, setSt] = useState<any>(initialState);
  const ttRef = useRef<any>(null);

  const setState = (patch: any) =>
    setSt((s: any) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));

  const theme = () => st.theme ?? "light";

  const go = (screen: string) =>
    setState((s: any) => ({ screen, prev: s.screen, sheet: null, jump: null, toast: null }));

  const jump = (k: string) => {
    const base = { jump: k, sheet: null, toast: null, drag: null };
    if (k === "log") return setState({ ...base, screen: "today", sheet: "t3", logMins: 25, sheetComplete: true });
    if (k === "todayDone") { const done: any = {}; TASKS.forEach((t) => (done[t.id] = true)); return setState({ ...base, screen: "today", done, streak: 13, counted: true }); }
    if (k === "skillComplete") return setState({ ...base, screen: "skill", curSkill: "git" });
    if (k === "skill") return setState({ ...base, screen: "skill", curSkill: "react" });
    if (k === "today" || k === "home") return setState({ ...base, screen: k, done: {}, mins: {}, extra: 0, streak: 12, counted: false });
    setState({ ...base, screen: k });
  };

  const complete = (id: string, m?: number, silent?: boolean) => {
    const t = TASKS.find((x) => x.id === id);
    setState((s: any) => {
      const bump = !s.counted;
      return {
        done: { ...s.done, [id]: true }, mins: { ...s.mins, [id]: m ?? t.mins }, streak: bump ? s.streak + 1 : s.streak, counted: true,
        lastLog: { skill: t.skill, mins: m ?? t.mins }, undoOf: { id, bump },
        toast: silent ? null : { title: `${t.title.split(" — ")[0]} · ${m ?? t.mins} min`, sub: bump ? `Streak: ${s.streak + 1} days` : `${t.skill} progress updated` },
      };
    });
    clearTimeout(ttRef.current);
    if (!silent) ttRef.current = setTimeout(() => setState({ toast: null }), 3200);
  };

  const uncomplete = (id: string) => {
    setState((s: any) => {
      const done = { ...s.done }; delete done[id];
      const anyLeft = Object.keys(done).length > 0 || s.extra > 0;
      return { done, streak: anyLeft || !s.counted ? s.streak : s.streak - 1, counted: anyLeft ? s.counted : false };
    });
  };

  // ───── compute view values (ported from renderVals) ─────
  const dark = theme() === "dark";
  const s: any = {};
  ["ob1", "ob2", "ob3", "ob4", "ob5", "ob6", "ob7", "home", "loading", "error", "today", "sessionDone", "skills", "emptySkills", "skill", "roadmap", "create", "progress", "achievements", "profile", "paywall"].forEach((k) => (s[k] = st.screen === k));
  s.obStep = ["ob2", "ob3", "ob4", "ob5", "ob6"].includes(st.screen);
  const obIdx = OB.indexOf(st.screen);
  const chk = (on: any) => (on ? I.check : "");
  const pickStyle = (on: any) => ({ bg: on ? INK : "transparent", fg: on ? BG : INK, bd: on ? INK : DIV });

  const doneCount = TASKS.filter((t) => st.done[t.id]).length;
  const todayMins = TASKS.reduce((a, t) => a + (st.done[t.id] ? (st.mins[t.id] ?? t.mins) : 0), 0) + st.extra;
  const allDone = doneCount === TASKS.length;
  const focusT = TASKS.find((t) => !st.done[t.id]);
  const openSheet = (id: any, m: any) => setState({ sheet: id, logMins: m, sheetComplete: true, drag: null });

  const tasks = TASKS.map((t) => {
    const d = !!st.done[t.id];
    const drag = st.drag && st.drag.id === t.id ? st.drag : null;
    const dx = drag ? Math.max(0, drag.dx) : 0;
    return {
      ...t, check: chk(d), boxBg: d ? INK : "transparent", boxBd: d ? INK : "var(--color-neutral-500)", deco: d ? "line-through" : "none",
      fg: d ? "var(--color-neutral-600)" : INK, dx, tr: drag && drag.active ? "none" : "transform .25s ease",
      swipeLabel: d ? "Already done" : dx > 110 ? "Release to complete" : "Complete",
      priBg: t.pri === "High" ? "var(--color-accent-100)" : "var(--color-neutral-200)", priFg: t.pri === "High" ? "var(--color-accent-800)" : "var(--color-neutral-800)",
      toggle: (e: any) => { if (e) e.stopPropagation(); if (d) uncomplete(t.id); else complete(t.id); },
      down: (e: any) => setState({ drag: { id: t.id, x: e.clientX, dx: 0, active: true } }),
      move: (e: any) => { const g = st.drag; if (g && g.id === t.id && g.active) setState({ drag: { ...g, dx: e.clientX - g.x } }); },
      up: () => { const g = st.drag; if (!g || g.id !== t.id) return; setState({ drag: null }); if (g.dx > 110 && !d) complete(t.id); else if (Math.abs(g.dx) < 6) openSheet(t.id, st.mins[t.id] ?? t.mins); },
      leave: () => { const g = st.drag; if (g && g.id === t.id) { if (g.dx > 110 && !d) complete(t.id); setState({ drag: null }); } },
    };
  });

  const weekBase = [50, 0, 45, 30, 60, 0, 0];
  const wk = weekBase.slice(); wk[1] = todayMins;
  const weekBars = ["M", "T", "W", "T", "F", "S", "S"].map((d, i) => ({ d, h: i > 1 ? "3%" : Math.max(4, (wk[i] / 70) * 100) + "%", bg: i === 1 ? A : i > 1 ? "var(--color-neutral-300)" : INK, lc: i === 1 ? INK : "var(--color-neutral-700)" }));
  const wkTotal = 250 + todayMins;
  const dotsOn = [1, 1, st.counted, 0, 0, 0, 0];
  const weekDots = dotsOn.map((on, i) => ({ bg: on ? (i === 1 ? A : INK) : "var(--color-neutral-300)" }));
  const weekDotsLbl = ["M", "T", "W", "T", "F", "S", "S"].map((d, i) => ({ d, bg: i < 2 ? (i === 1 ? BG : "color-mix(in srgb, var(--color-bg) 70%, transparent)") : "color-mix(in srgb, var(--color-bg) 22%, transparent)" }));

  const sheetT = TASKS.find((t) => t.id === st.sheet);
  const sheet: any = sheetT
    ? { skill: sheetT.skill, title: sheetT.title, hasTask: !st.done[sheetT.id], boxBg: st.sheetComplete ? INK : "transparent", boxBd: st.sheetComplete ? INK : "var(--color-neutral-500)", check: chk(st.sheetComplete) }
    : { skill: "Any skill", title: "Extra practice", hasTask: false };

  const cur = SK.find((k) => k.id === st.curSkill) || SK[0];
  const nDone = cur.pct === 100 ? cur.ms.length : Math.round((cur.pct / 100) * cur.ms.length);
  const sk: any = {
    ...cur, completed: cur.pct === 100, ringOff: (351.9 * (1 - cur.pct / 100)).toFixed(1), doneN: nDone, totalN: cur.ms.length,
    resources: cur.res, activity: cur.act, ctaLabel: cur.pct === 100 ? "Set a new target" : "Log progress",
    cta: cur.pct === 100 ? () => go("create") : () => { go("today"); setTimeout(() => openSheet(cur.id === "react" ? "t3" : null, 25), 0); },
    milestones: cur.ms.map((t: any, i: number) => {
      const d = i < nDone, c = i === nDone;
      return { title: t, check: chk(d), nodeBg: d ? INK : c ? "var(--color-accent-100)" : "transparent", nodeBd: d ? INK : c ? A : "var(--color-neutral-400)", lineBg: i === cur.ms.length - 1 ? "transparent" : d ? INK : "var(--color-neutral-300)", fg: d || c ? INK : "var(--color-neutral-700)", subFg: c ? "var(--color-accent-700)" : "var(--color-neutral-700)", sub: d ? "Completed" : c ? "In progress · 3 of 5 tasks" : "Upcoming" };
    }),
  };

  const counts: any = { active: SK.filter((k) => k.status === "active").length, completed: 1, planned: 2 };
  const skillList = SK.filter((k) => k.status === st.skillFilter).map((k) => ({
    ...k, iconBg: k.status === "completed" ? INK : "var(--color-surface)", iconFg: k.status === "completed" ? BG : INK,
    levelLine: k.status === "planned" ? k.since : k.status === "completed" ? "Advanced reached" : `${k.level} → ${k.target}`,
    pctLabel: k.status === "planned" ? "—" : k.pct + "%", w: k.pct + "%", barBg: k.status === "completed" ? A : INK,
    streakLabel: k.status === "active" ? `${k.streak} d` : k.status === "completed" ? "32 h" : "Planned", streakFg: k.streak >= 7 ? "var(--color-accent-700)" : "var(--color-neutral-700)",
    nextLine: k.status === "completed" ? "Completed 14 Aug" : k.status === "planned" ? k.next : `Next: ${k.next}`,
    open: () => setState({ screen: "skill", curSkill: k.id, jump: null }),
  }));

  const stages = ROAD.map((g, i) => {
    const done = i < 2, curS = i === 2, open = st.openStage === i;
    return {
      n: "0" + (i + 1), name: g.name, short: g.short, open, fg: i > 2 ? "var(--color-neutral-700)" : INK,
      bar: done ? INK : curS ? A : "var(--color-neutral-300)", lc: curS ? "var(--color-accent-700)" : done ? INK : "var(--color-neutral-700)",
      status: done ? "Done" : curS ? "Current" : "Next", tagBg: curS ? "var(--color-accent-100)" : "var(--color-neutral-200)", tagFg: curS ? "var(--color-accent-800)" : "var(--color-neutral-800)",
      meta: done ? `${g.tasks.length} of ${g.tasks.length} milestones` : curS ? "3 of 5 milestones · ~3 weeks left" : `${g.tasks.length} milestones`,
      toggle: () => setState({ openStage: open ? -1 : i }),
      tasks: g.tasks.map((t: any, j: number) => { const d = done || (curS && j < 3); return { t, check: chk(d), bg: d ? INK : "transparent", bd: d ? INK : curS && j === 3 ? A : "var(--color-neutral-400)", fg: d ? "var(--color-neutral-700)" : INK, deco: d ? "line-through" : "none" }; }),
    };
  });

  const R = st.range === "week"
    ? { label: "Learning time · this week", total: `${Math.floor(wkTotal / 60)}h ${wkTotal % 60}m`, delta: "+18% vs last week", gap: "8px", ticks: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], bars: wk.map((v, i) => ({ h: i > 1 ? "3%" : Math.max(3, (v / 70) * 100) + "%", bg: i === 1 ? A : i > 1 ? "var(--color-neutral-300)" : INK })) }
    : { label: "Learning time · September", total: "24h 15m", delta: "+6% vs August", gap: "3px", ticks: ["1 Sep", "8", "15", "22", "29"], bars: Array.from({ length: 29 }, (_, i) => { const v = [40, 25, 0, 55, 30, 45, 0, 60, 35, 20, 50, 0, 40, 65, 30, 0, 45, 50, 25, 35, 0, 70, 40, 55, 30, 0, 50, 45, 0][i]; const v2 = i === 28 ? todayMins : v; return { h: Math.max(3, (v2 / 70) * 100) + "%", bg: i === 28 ? A : INK }; }) };
  const statsRaw: any[] = [["Current streak", st.streak, " days"], ["Longest streak", 21, " days"], ["Milestones", st.range === "week" ? 3 : 9, st.range === "week" ? " this week" : " this month"], ["Completion rate", 86, "%"], ["Skills improved", 4, " of 6"], ["Avg session", 24, " min"]];
  const stats = statsRaw.map(([l, v, u], i) => ({ l, v, u, pl: i % 2 ? "14px" : "0", bl: i % 2 ? "1px solid var(--color-divider)" : "none" }));
  const bySkill = [["Spanish", "5h 10m", "B1 → B1+", 100], ["React", "4h 45m", "Milestone 4", 92], ["UI/UX Design", "3h 20m", "+1 level", 64], ["TypeScript", "2h 30m", "Milestone 3", 48]].map(([name, v, lvl, w]: any) => ({ name, v, lvl, w: w + "%" }));
  const HC = ["var(--color-neutral-200)", "var(--color-accent-200)", "var(--color-accent-400)", "var(--color-accent)", "var(--color-accent-700)"];
  const heat = Array.from({ length: 126 }, (_, i) => { if (i === 121) return { bg: st.counted ? HC[3] : HC[0] }; if (i > 121) return { bg: "transparent" }; const r = (Math.sin(i * 12.9898) * 43758.5453) % 1; const x = Math.abs(r); const lv = i % 7 === 6 && x < 0.6 ? 0 : x < 0.18 ? 0 : x < 0.4 ? 1 : x < 0.68 ? 2 : x < 0.9 ? 3 : 4; return { bg: HC[i > 90 ? Math.max(lv, 1) : lv] }; });

  const ach: any[] = [["01", "First milestone", "Earned 9 Jun", 1], ["7", "7-day streak", "Earned 22 Sep", 1], ["30", "30-day streak", `${st.streak} of 30 days`, st.streak / 30], ["10h", "10 hours learned", "Earned 21 Jun", 1], ["✓", "Skill completed", "Git & GitHub · 14 Aug", 1], ["5+", "Five skills tracked", "Earned 1 Sep", 1], ["100h", "100 hours learned", "Earned 12 Sep", 1], ["250h", "250 hours learned", "178 of 250 h", 0.71], ["50", "50 milestones", "41 of 50", 0.82], ["3×", "Three skills completed", "1 of 3", 0.33]];
  const achievements = ach.map(([mark, name, meta, p]) => { const locked = p < 1; return { mark, name, meta, locked, w: Math.round(p * 100) + "%", bg: locked ? "transparent" : INK, bd: locked ? "var(--color-neutral-400)" : INK, fg: locked ? "var(--color-neutral-600)" : BG, tfg: locked ? "var(--color-neutral-800)" : INK }; });

  const tg = (k: string) => ({ isToggle: true, trackBg: st.toggles[k] ? A : "var(--color-neutral-400)", justify: st.toggles[k] ? "flex-end" : "flex-start", toggle: (e: any) => { e.stopPropagation(); setState((x: any) => ({ toggles: { ...x.toggles, [k]: !x.toggles[k] } })); } });
  const val = (value: any, goFn?: any) => ({ isValue: true, value, go: goFn });
  const settings = [
    { name: "Learning", rows: [{ label: "Daily goal", ...val("45 min") }, { label: "Learning days", ...val("Mon–Fri") }, { label: "Goal", ...val("Lead frontend") }, { label: "Experience levels", ...val("3 skills") }] },
    { name: "Notifications", rows: [{ label: "Daily reminder · 7:30 AM", ...tg("daily") }, { label: "Streak at risk", ...tg("streak") }, { label: "Weekly summary", ...tg("weekly") }, { label: "Smart reminders", pro: true, ...val("", () => go("paywall")) }] },
    { name: "Appearance", rows: [{ label: "Theme", isTheme: true }] },
    { name: "Account", rows: [{ label: "Subscription", ...val("Free", () => go("paywall")) }, { label: "Achievements", ...val("6 of 10", () => go("achievements")) }, { label: "Export data", ...val("CSV, JSON") }, { label: "Sign out", fg: "var(--color-accent-700)", go: onSignOut }] },
  ].map((g) => ({ ...g, rows: g.rows.map((r: any) => ({ fg: INK, go: () => {}, ...r })) }));
  const themeOpts = ["Light", "Dark", "System"].map((l) => { const on = (l === "Dark") === dark && l !== "System"; return { label: l, bg: on ? INK : "transparent", fg: on ? BG : INK, pick: () => setState({ theme: l === "Dark" ? "dark" : "light" }) }; });

  const interestNames = ["React", "TypeScript", "UI/UX Design", "Python", "Spanish", "Public Speaking", "Photography", "Japanese", "Data analysis", "Guitar", "Writing", "Figma"];
  const selInterests = interestNames.filter((k) => st.interests[k]);

  const v: any = {
    i: I, s, streak: st.streak, streakColor: st.counted ? "var(--color-accent-700)" : INK,
    screenLabel: LABELS[st.jump] || LABELS[st.screen] || st.screen,
    themeBtn: { lightBg: dark ? "transparent" : INK, lightFg: dark ? INK : BG, darkBg: dark ? INK : "transparent", darkFg: dark ? BG : INK },
    setLight: () => setState({ theme: "light" }), setDark: () => setState({ theme: "dark" }),
    groups: SCREENS.map((g) => ({ name: g.name, items: g.items.map(([k, label]: any) => { const on = (st.jump || st.screen) === k && (st.jump ? true : !st.sheet); return { label, n: LABELS[k].slice(0, 2), bg: on ? INK : "transparent", fg: on ? BG : INK, go: () => jump(k) }; }) })),
    welcomeGrid: Array.from({ length: 14 }, (_, i) => ({ bg: i === 11 ? A : i < 10 ? INK : "var(--color-neutral-300)" })),
    obNext: () => go(OB[Math.min(obIdx + 1, 6)]), obBack: () => go(OB[Math.max(obIdx - 1, 0)]),
    obSeg: [1, 2, 3, 4, 5].map((k) => ({ bg: k <= obIdx ? A : "var(--color-neutral-300)" })), obStepLabel: `${obIdx}/5`,
    interests: interestNames.map((label) => { const on = !!st.interests[label]; return { label, ...pickStyle(on), toggle: () => setState((x: any) => ({ interests: { ...x.interests, [label]: !x.interests[label] } })) }; }),
    goals: [["Build a real project", "Ship something you can show"], ["Get job-ready", "Interview-level depth"], ["Pass an exam or certificate", "DELE B2, AWS, and similar"], ["Hold a conversation", "For languages"], ["Learn for myself", "No deadline"]].map(([label, sub]) => { const on = !!st.goals[label]; return { label, sub, check: chk(on), bg: on ? INK : "transparent", bd: on ? INK : "var(--color-neutral-500)", toggle: () => setState((x: any) => ({ goals: { ...x.goals, [label]: !x.goals[label] } })) }; }),
    weekly: [["1–2 h", "Light", "~20 min a day"], ["3–5 h", "Steady", "~45 min a day"], ["6–10 h", "Serious", "~1.5 h a day"], ["10+ h", "Intensive", "2 h+ a day"]].map(([label, tag, sub]) => { const on = st.weekly === label; return { label, tag, sub, bd: on ? A : DIV, bg: on ? "var(--color-accent-100)" : "transparent", pick: () => setState({ weekly: label }) }; }),
    days: ["M", "T", "W", "Th", "F", "Sa", "Su"].map((k) => ({ label: k, ...pickStyle(!!st.days[k]), toggle: () => setState((x: any) => ({ days: { ...x.days, [k]: !x.days[k] } })) })),
    dailyHint: `About ${Math.round(({ "1–2 h": 90, "3–5 h": 240, "6–10 h": 480, "10+ h": 660 } as any)[st.weekly] / Math.max(1, Object.values(st.days).filter(Boolean).length))} min on each of ${Object.values(st.days).filter(Boolean).length} days.`,
    levels: (selInterests.length ? selInterests : ["React"]).slice(0, 3).map((skill) => ({ skill, opts: ["New", "Some", "Solid"].map((label) => { const on = (st.levels[skill] || "New") === label; return { label, bg: on ? INK : "transparent", fg: on ? BG : INK, pick: () => setState((x: any) => ({ levels: { ...x.levels, [skill]: label } })) }; }) })),
    motives: ["Career move", "Current job", "A side project", "Exam", "Curiosity", "Staying sharp"].map((label) => ({ label, ...pickStyle(st.motive === label), pick: () => setState({ motive: label }) })),
    obSummary: { skills: Math.min(3, selInterests.length) || 1, hours: st.weekly.replace(" h", "h"), daily: ({ "1–2 h": 20, "3–5 h": 45, "6–10 h": 90, "10+ h": 120 } as any)[st.weekly] },
    obSkillList: (selInterests.length ? selInterests : ["React"]).slice(0, 3).map((name) => { const k = SK.find((x) => x.name === name); return { name, mono: k ? k.mono : name.slice(0, 2), first: k ? `First milestone: ${k.ms[0]}` : "Roadmap drafted" }; }),
    tasks, doneCount, todayMins, planMins: 70, allDone, notAllDone: !allDone, hasFocus: !!focusT,
    focus: focusT ? { skill: focusT.skill, title: focusT.title, mins: focusT.mins, context: focusT.ctx, start: () => { setState({ screen: "today", jump: null }); openSheet(focusT.id, focusT.mins); }, done: () => complete(focusT.id) } : {},
    goalW: Math.min(100, (todayMins / 45) * 100) + "%", weekBars, weekTotal: `${Math.floor(wkTotal / 60)}h ${wkTotal % 60}m`, weekDots, weekDotsLbl,
    taskSegs: TASKS.map((t) => ({ bg: st.done[t.id] ? A : "var(--color-neutral-300)" })),
    continueCards: SK.filter((k) => ["react", "es", "ts"].includes(k.id)).map((k) => ({ ...k, w: k.pct + "%", open: () => setState({ screen: "skill", curSkill: k.id, jump: null }) })),
    quickLog: [15, 30, 45, 60].map((m) => ({ m, open: () => setState({ sheet: "free", logMins: m }) })),
    reflect: ["Hard", "Steady", "It clicked"].map((label) => ({ label, ...pickStyle(st.reflect === label), pick: () => setState({ reflect: label }) })),
    stop: (e: any) => e.stopPropagation(),
    hasToast: !!st.toast && !st.sheet, toast: st.toast || {},
    undo: () => { const u = st.undoOf; if (!u) return; setState((x: any) => { const done = { ...x.done }; delete done[u.id]; return { done, toast: null, streak: u.bump ? x.streak - 1 : x.streak, counted: u.bump ? false : x.counted }; }); },
    hasSheet: !!st.sheet, sheet, logMins: st.logMins,
    minChips: [10, 15, 25, 45, 60].map((m) => ({ m: m + "m", ...pickStyle(st.logMins === m), bd: st.logMins === m ? INK : DIV, pick: () => setState({ logMins: m }) })),
    minDown: () => setState((x: any) => ({ logMins: Math.max(5, x.logMins - 5) })), minUp: () => setState((x: any) => ({ logMins: x.logMins + 5 })),
    toggleSheetComplete: () => setState((x: any) => ({ sheetComplete: !x.sheetComplete })),
    closeSheet: () => setState({ sheet: null }),
    saveLog: () => {
      const id = st.sheet, m = st.logMins;
      if (id && id !== "free" && st.sheetComplete && !st.done[id]) { complete(id, m, true); }
      else { setState((x: any) => ({ extra: x.extra + m, streak: x.counted ? x.streak : x.streak + 1, counted: true, lastLog: { skill: sheetT ? sheetT.skill : "Extra practice", mins: m } })); }
      setState({ sheet: null, screen: "sessionDone", jump: null, toast: null });
    },
    lastLog: st.lastLog,
    filters: [["active", "Active"], ["completed", "Completed"], ["planned", "Planned"]].map(([k, label]) => ({ label, n: counts[k], bg: st.skillFilter === k ? INK : "transparent", fg: st.skillFilter === k ? BG : INK, pick: () => setState({ skillFilter: k }) })),
    skillList, sk, stages,
    templates: [["Frontend fundamentals", "12 milestones · 8 weeks", false], ["Conversational Spanish", "10 milestones · 12 weeks", false], ["Public speaking basics", "8 milestones · 6 weeks", false], ["Product design career path", "24 milestones · 6 months", true]].map(([name, meta, pro]) => ({ name, meta, pro, go: () => go(pro ? "paywall" : "create") })),
    cName: st.cName, setName: (e: any) => setState({ cName: e.target.value }), cWeekly: st.cWeekly,
    wkDown: () => setState((x: any) => ({ cWeekly: Math.max(1, x.cWeekly - 1) })), wkUp: () => setState((x: any) => ({ cWeekly: Math.min(20, x.cWeekly + 1) })),
    cats: ["Development", "Design", "Language", "Career", "Creative", "+ Custom"].map((label) => { const pro = label === "+ Custom"; return { label, pro, ...pickStyle(st.cCat === label), pick: () => (pro ? go("paywall") : setState({ cCat: label })) }; }),
    expOpts: ["None", "Beginner", "Some", "Solid"].map((label) => ({ label, bg: st.cExp === label ? INK : "transparent", fg: st.cExp === label ? BG : INK, pick: () => setState({ cExp: label }) })),
    tgtOpts: ["Basics", "Intermediate", "Advanced", "Mastery"].map((label) => ({ label, bg: st.cTgt === label ? INK : "transparent", fg: st.cTgt === label ? BG : INK, pick: () => setState({ cTgt: label }) })),
    cMilestones: st.cMs.map((t: any, j: number) => ({ t, n: String(j + 1).padStart(2, "0"), remove: () => setState((x: any) => ({ cMs: x.cMs.filter((_: any, k: number) => k !== j) })) })),
    cMsCount: `${st.cMs.length} added`,
    addMs: () => setState((x: any) => ({ cMs: [...x.cMs, ["Error handling", "Testing with pytest", "Package a project"][x.cMs.length % 3]] })),
    createSkill: () => { setState({ screen: "skills", skillFilter: "active", jump: null, toast: { title: `${st.cName} added`, sub: `${st.cMs.length} milestones · ${st.cWeekly} h a week` } }); clearTimeout(ttRef.current); ttRef.current = setTimeout(() => setState({ toast: null }), 3200); },
    ranges: [["week", "Week"], ["month", "Month"]].map(([k, label]) => ({ label, bg: st.range === k ? INK : "transparent", fg: st.range === k ? BG : INK, pick: () => setState({ range: k }) })),
    rng: R, stats, bySkill, heat, achievements, settings, themeOpts,
    proFeatures: [["AI roadmaps", "Five stages, sized to your time and target date"], ["AI milestone generation", "Break any goal into next steps"], ["Unlimited skills", "Plus custom categories"], ["Advanced statistics", "Retention, best times, trends"], ["Detailed insights", "Where you’re slipping, and why"], ["Premium templates", "40+ curated learning paths"], ["Smart reminders", "Nudges when you usually learn"]].map(([t, d]) => ({ t, d })),
    plans: [["annual", "Yearly", "$59.99", "$5.00 / mo · save 37%"], ["monthly", "Monthly", "$7.99", "Billed monthly"]].map(([k, name, price, sub]) => { const on = st.plan === k; return { name, price, sub, bd: on ? A : DIV, bg: on ? "var(--color-accent-100)" : "transparent", subFg: on && k === "annual" ? "var(--color-accent-700)" : "var(--color-neutral-700)", pick: () => setState({ plan: k }) }; }),
    planNote: st.plan === "annual" ? "Free for 7 days, then $59.99 a year. Cancel anytime in Settings." : "Free for 7 days, then $7.99 a month. Cancel anytime in Settings.",
    showTabs: !!TAB_OF[st.screen],
    tabs: TABS.map(([k, label, ic]) => { const on = TAB_OF[st.screen] === k; return { label, d: I[ic], fg: on ? INK : "var(--color-neutral-600)", fw: on ? 800 : 500, bar: on ? A : "transparent", go: () => go(k === "skills" && st.jump === "emptySkills" ? "emptySkills" : k) }; }),
    goHome: () => go("home"), goToday: () => go("today"), goSkills: () => go("skills"), goSkill: () => go("skill"), goRoadmap: () => go("roadmap"),
    goCreate: () => go("create"), goPaywall: () => go("paywall"), goProgress: () => go("progress"), goAchievements: () => go("achievements"),
    goBack: () => go(st.prev && st.prev !== "paywall" ? st.prev : "home"),
  };

  const i = v.i;
  const profileName = user?.name || "Maya Chen";
  const profileInitials = user ? initials(user.name) : "MC";

  // Sidebar with the clickable screen list — only used in "showcase" mode.
  const sidebar = (
    <aside style={css("width:280px;flex:none;display:flex;flex-direction:column;gap:24px")}>
      <div style={css("display:flex;flex-direction:column;gap:6px")}>
        <div style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700)")}>Prototype · Sep 2026</div>
        <div style={css("font-family:var(--font-heading);font-weight:800;font-size:34px;letter-spacing:-0.02em;line-height:1")}>Skill Tracker</div>
        <div style={css("font-size:14px;line-height:1.5;color:var(--color-neutral-800);text-wrap:pretty")}>Everything is clickable. On Today, swipe a task right to complete it, or tap it to log time.</div>
      </div>
      <div style={css("display:flex;border:1px solid var(--color-divider)")}>
        <button onClick={v.setLight} style={css(`flex:1;height:36px;border:none;cursor:pointer;font-size:13px;font-weight:600;text-align:left;padding:0 12px;background:${v.themeBtn.lightBg};color:${v.themeBtn.lightFg}`)}>Light</button>
        <button onClick={v.setDark} style={css(`flex:1;height:36px;border:none;border-left:1px solid var(--color-divider);cursor:pointer;font-size:13px;font-weight:600;text-align:left;padding:0 12px;background:${v.themeBtn.darkBg};color:${v.themeBtn.darkFg}`)}>Dark</button>
      </div>
      {v.groups.map((g: any, gi: number) => (
        <div key={gi} style={css("display:flex;flex-direction:column")}>
          <div style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700);padding-bottom:6px;border-bottom:2px solid var(--color-divider)")}>{g.name}</div>
          {g.items.map((it: any, ii: number) => (
            <button key={ii} onClick={it.go} className="hov-n200" style={css(`display:flex;gap:10px;align-items:baseline;text-align:left;border:none;border-bottom:1px solid var(--color-neutral-400);background:${it.bg};color:${it.fg};padding:7px 8px;font-size:13px;cursor:pointer`)}>
              <span style={css("font-size:11px;opacity:0.7;width:18px;flex:none")}>{it.n}</span><span>{it.label}</span>
            </button>
          ))}
        </div>
      ))}
      <div style={css("display:flex;flex-direction:column")}>
        <div style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700);padding-bottom:6px;border-bottom:2px solid var(--color-divider)")}>Auth (routes)</div>
        {([["/login", "Login"], ["/register", "Register"], ["/forgot", "Forgot password"], ["/account", "My profile"]] as [string, string][]).map(([href, label]) => (
          <a key={href} href={href} className="hov-n200" style={css("display:flex;gap:10px;align-items:baseline;text-align:left;border:none;border-bottom:1px solid var(--color-neutral-400);background:transparent;color:var(--color-text);padding:7px 8px;font-size:13px;text-decoration:none")}>
            <span style={css("font-size:11px;opacity:0.7;width:18px;flex:none")}>↗</span><span>{label}</span>
          </a>
        ))}
      </div>
    </aside>
  );

  // The actual app surface (every screen + overlays). Shared by both modes.
  const screens = (
    <>
          {/* status bar */}
          <div style={css("position:absolute;top:0;left:0;right:0;height:48px;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:0 32px 0 36px;font-size:15px;font-weight:600;pointer-events:none")}>
            <span>9:41</span>
            <div style={css("position:absolute;left:50%;top:11px;width:110px;height:30px;margin-left:-55px;border-radius:20px;background:#0e0e0f")}></div>
            <div style={css("display:flex;gap:6px;align-items:center")}><div style={css("width:16px;height:10px;background:var(--color-text)")}></div><div style={css("width:24px;height:11px;border:1.5px solid var(--color-text);padding:1px")}><div style={css("width:70%;height:100%;background:var(--color-text)")}></div></div></div>
          </div>

          {/* ONBOARDING: welcome */}
          {v.s.ob1 && (
            <div style={css("position:absolute;inset:0;padding:64px 24px 40px;display:flex;flex-direction:column")}>
              <div style={css("display:flex;align-items:center;gap:8px;font-family:var(--font-heading);font-weight:800;font-size:15px")}><div style={css("width:14px;height:14px;background:var(--color-accent)")}></div>Skill Tracker</div>
              <div style={css("flex:1;display:flex;flex-direction:column;justify-content:center;gap:0")}>
                <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:36px")}>
                  {v.welcomeGrid.map((c: any, ci: number) => (<div key={ci} style={css(`aspect-ratio:1;background:${c.bg}`)}></div>))}
                </div>
                <div style={css("font-family:var(--font-heading);font-weight:800;font-size:52px;line-height:0.98;letter-spacing:-0.035em")}>A little better, every day.</div>
                <div style={css("font-size:17px;line-height:1.5;color:var(--color-neutral-800);margin-top:18px;max-width:300px")}>Pick the skills you want. Get one clear task each day. Watch the streak grow.</div>
              </div>
              <div style={css("display:flex;flex-direction:column;gap:8px")}>
                <button onClick={v.obNext} className="hov-acc" style={css("display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 18px;background:var(--color-accent);color:var(--color-bg);border:none;font-family:var(--font-heading);font-weight:800;font-size:16px;cursor:pointer")}><span>Get started</span><Svg d={i.arrow} size={20} sw={2.2} /></button>
                <button onClick={v.goHome} style={css("height:52px;padding:0 18px;background:transparent;color:var(--color-text);border:1px solid var(--color-divider);font-weight:600;font-size:15px;text-align:left;cursor:pointer")}>I already have an account</button>
              </div>
            </div>
          )}

          {/* ONBOARDING: steps 2–6 shell */}
          {v.s.obStep && (
            <div style={css("position:absolute;inset:0;padding:56px 24px 32px;display:flex;flex-direction:column;gap:24px")}>
              <div style={css("display:flex;align-items:center;gap:14px")}>
                <button onClick={v.obBack} style={css("width:36px;height:36px;border:1px solid var(--color-divider);background:transparent;color:var(--color-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none")}><Svg d={i.chevL} /></button>
                <div style={css("flex:1;display:grid;grid-template-columns:repeat(5,1fr);gap:4px")}>{v.obSeg.map((g: any, gi: number) => (<div key={gi} style={css(`height:4px;background:${g.bg}`)}></div>))}</div>
                <div style={css("font-size:12px;font-weight:600;color:var(--color-neutral-700);width:28px;text-align:right")}>{v.obStepLabel}</div>
              </div>

              <div className="no-scrollbar" style={css("flex:1;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:20px")}>
                {v.s.ob2 && (
                  <div style={css("display:flex;flex-direction:column;gap:20px")}>
                    <div style={css("display:flex;flex-direction:column;gap:8px")}><div style={css("font-family:var(--font-heading);font-weight:800;font-size:32px;line-height:1.05;letter-spacing:-0.025em")}>What do you want to learn?</div><div style={css("font-size:15px;color:var(--color-neutral-700)")}>Pick up to 3 to start. Add more anytime.</div></div>
                    <div style={css("display:flex;align-items:center;gap:10px;height:46px;padding:0 14px;background:var(--color-surface);border:1px solid var(--color-divider);color:var(--color-neutral-700)")}><Svg d={i.search} /><span style={css("font-size:15px")}>Search skills</span></div>
                    <div style={css("display:flex;flex-wrap:wrap;gap:8px")}>
                      {v.interests.map((c: any, ci: number) => (<button key={ci} onClick={c.toggle} style={css(`height:40px;padding:0 14px;border:1px solid ${c.bd};background:${c.bg};color:${c.fg};font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px`)}>{c.label}</button>))}
                    </div>
                  </div>
                )}
                {v.s.ob3 && (
                  <div style={css("display:flex;flex-direction:column;gap:20px")}>
                    <div style={css("display:flex;flex-direction:column;gap:8px")}><div style={css("font-family:var(--font-heading);font-weight:800;font-size:32px;line-height:1.05;letter-spacing:-0.025em")}>What does done look like?</div><div style={css("font-size:15px;color:var(--color-neutral-700)")}>We shape milestones around this. Choose any.</div></div>
                    <div style={css("display:flex;flex-direction:column;border-top:2px solid var(--color-divider)")}>
                      {v.goals.map((c: any, ci: number) => (<button key={ci} onClick={c.toggle} style={css("display:flex;align-items:center;gap:14px;padding:16px 4px;border:none;border-bottom:1px solid var(--color-divider);background:transparent;color:var(--color-text);text-align:left;cursor:pointer")}><div style={css(`width:22px;height:22px;flex:none;border:2px solid ${c.bd};background:${c.bg};color:var(--color-bg);display:flex;align-items:center;justify-content:center`)}><Svg d={c.check} size={14} sw={3} /></div><div style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("font-size:16px;font-weight:600")}>{c.label}</span><span style={css("font-size:13px;color:var(--color-neutral-700)")}>{c.sub}</span></div></button>))}
                    </div>
                  </div>
                )}
                {v.s.ob4 && (
                  <div style={css("display:flex;flex-direction:column;gap:20px")}>
                    <div style={css("display:flex;flex-direction:column;gap:8px")}><div style={css("font-family:var(--font-heading);font-weight:800;font-size:32px;line-height:1.05;letter-spacing:-0.025em")}>How much time per week?</div><div style={css("font-size:15px;color:var(--color-neutral-700)")}>Be honest. Consistency beats volume.</div></div>
                    <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px")}>
                      {v.weekly.map((c: any, ci: number) => (<button key={ci} onClick={c.pick} style={css(`display:flex;flex-direction:column;align-items:flex-start;gap:28px;padding:14px;border:2px solid ${c.bd};background:${c.bg};color:var(--color-text);cursor:pointer;text-align:left`)}><span style={css("font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700)")}>{c.tag}</span><span style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:26px")}>{c.label}</span><span style={css("font-size:13px;color:var(--color-neutral-700)")}>{c.sub}</span></span></button>))}
                    </div>
                    <div style={css("display:flex;flex-direction:column;gap:10px")}>
                      <div style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700)")}>Learning days</div>
                      <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:4px")}>{v.days.map((d: any, di: number) => (<button key={di} onClick={d.toggle} style={css(`height:42px;border:1px solid ${d.bd};background:${d.bg};color:${d.fg};font-weight:600;font-size:13px;cursor:pointer`)}>{d.label}</button>))}</div>
                      <div style={css("font-size:14px;color:var(--color-neutral-800)")}>{v.dailyHint}</div>
                    </div>
                  </div>
                )}
                {v.s.ob5 && (
                  <div style={css("display:flex;flex-direction:column;gap:20px")}>
                    <div style={css("display:flex;flex-direction:column;gap:8px")}><div style={css("font-family:var(--font-heading);font-weight:800;font-size:32px;line-height:1.05;letter-spacing:-0.025em")}>Where are you starting?</div><div style={css("font-size:15px;color:var(--color-neutral-700)")}>We&apos;ll skip what you already know.</div></div>
                    <div style={css("display:flex;flex-direction:column;border-top:2px solid var(--color-divider)")}>
                      {v.levels.map((l: any, li: number) => (<div key={li} style={css("display:flex;flex-direction:column;gap:10px;padding:16px 0;border-bottom:1px solid var(--color-divider)")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:18px")}>{l.skill}</span><div style={css("display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--color-divider)")}>{l.opts.map((o: any, oi: number) => (<button key={oi} onClick={o.pick} style={css(`height:40px;border:none;border-right:1px solid var(--color-divider);background:${o.bg};color:${o.fg};font-size:13px;font-weight:600;text-align:left;padding:0 10px;cursor:pointer`)}>{o.label}</button>))}</div></div>))}
                    </div>
                  </div>
                )}
                {v.s.ob6 && (
                  <div style={css("display:flex;flex-direction:column;gap:20px")}>
                    <div style={css("display:flex;flex-direction:column;gap:8px")}><div style={css("font-family:var(--font-heading);font-weight:800;font-size:32px;line-height:1.05;letter-spacing:-0.025em")}>Why now?</div><div style={css("font-size:15px;color:var(--color-neutral-700)")}>We&apos;ll show this back to you on slow days.</div></div>
                    <div style={css("display:flex;flex-wrap:wrap;gap:8px")}>{v.motives.map((c: any, ci: number) => (<button key={ci} onClick={c.pick} style={css(`height:40px;padding:0 14px;border:1px solid ${c.bd};background:${c.bg};color:${c.fg};font-size:14px;font-weight:600;cursor:pointer`)}>{c.label}</button>))}</div>
                    <div style={css("display:flex;flex-direction:column;gap:6px")}><label style={css("font-size:12px;color:var(--color-neutral-700)")}>In one line</label><Textarea className={fieldReset} defaultValue="Lead the frontend team by next summer." style={css("min-height:96px;padding:12px;font-size:16px;line-height:1.4;background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-divider);resize:none")} /></div>
                  </div>
                )}
              </div>

              <button onClick={v.obNext} className="hov-acc" style={css("display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 18px;background:var(--color-accent);color:var(--color-bg);border:none;font-family:var(--font-heading);font-weight:800;font-size:16px;cursor:pointer;flex:none")}><span>Continue</span><Svg d={i.arrow} size={20} sw={2.2} /></button>
            </div>
          )}

          {/* ONBOARDING: plan ready */}
          {v.s.ob7 && (
            <div style={css("position:absolute;inset:0;padding:64px 24px 32px;display:flex;flex-direction:column;gap:24px")}>
              <div style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-accent-700)")}>Plan ready</div>
              <div style={css("font-family:var(--font-heading);font-weight:800;font-size:44px;line-height:1;letter-spacing:-0.03em")}>Your plan is set, Maya.</div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr 1fr;border-top:2px solid var(--color-divider);border-bottom:2px solid var(--color-divider)")}>
                <div style={css("padding:14px 12px 14px 0;display:flex;flex-direction:column;gap:4px")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:30px")}>{v.obSummary.skills}</span><span style={css("font-size:12px;color:var(--color-neutral-700)")}>Skills</span></div>
                <div style={css("padding:14px 12px;border-left:1px solid var(--color-divider);display:flex;flex-direction:column;gap:4px")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:30px")}>{v.obSummary.hours}</span><span style={css("font-size:12px;color:var(--color-neutral-700)")}>Per week</span></div>
                <div style={css("padding:14px 0 14px 12px;border-left:1px solid var(--color-divider);display:flex;flex-direction:column;gap:4px")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:30px")}>{v.obSummary.daily}</span><span style={css("font-size:12px;color:var(--color-neutral-700)")}>Min / day</span></div>
              </div>
              <div style={css("display:flex;flex-direction:column;gap:0")}>
                {v.obSkillList.map((k: any, ki: number) => (<div key={ki} style={css("display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--color-divider)")}><div style={css("width:36px;height:36px;background:var(--color-surface);display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:800;font-size:13px")}>{k.mono}</div><div style={css("flex:1;display:flex;flex-direction:column")}><span style={css("font-weight:600;font-size:15px")}>{k.name}</span><span style={css("font-size:12px;color:var(--color-neutral-700)")}>{k.first}</span></div></div>))}
              </div>
              <div style={css("flex:1")}></div>
              <div style={css("background:var(--color-text);color:var(--color-bg);padding:16px;display:flex;flex-direction:column;gap:4px")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;opacity:0.75")}>First task · today</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px")}>Build a custom useFetch hook</span><span style={css("font-size:13px;opacity:0.75")}>React · 25 min</span></div>
              <button onClick={v.goHome} className="hov-acc" style={css("display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 18px;background:var(--color-accent);color:var(--color-bg);border:none;font-family:var(--font-heading);font-weight:800;font-size:16px;cursor:pointer")}><span>Open my dashboard</span><Svg d={i.arrow} size={20} sw={2.2} /></button>
            </div>
          )}

          {/* HOME */}
          {v.s.home && (
            <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:58px 20px 108px;display:flex;flex-direction:column;gap:24px")}>
              <div style={css("display:flex;justify-content:space-between;align-items:center")}>
                <span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700)")}>Tuesday, 29 September</span>
                <div style={css(`display:flex;align-items:center;gap:5px;font-weight:800;font-family:var(--font-heading);font-size:15px;color:${v.streakColor}`)}><Svg d={i.flame} size={17} />{v.streak}</div>
              </div>
              <div style={css("font-family:var(--font-heading);font-weight:800;font-size:36px;line-height:1;letter-spacing:-0.03em;margin-top:-8px")}>Good morning, Maya.</div>

              {v.hasFocus && (
                <div style={css("background:var(--color-text);color:var(--color-bg);padding:18px;display:flex;flex-direction:column;gap:16px")}>
                  <div style={css("display:flex;justify-content:space-between;align-items:center")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-accent-400)")}>Today&apos;s focus · {v.focus.skill}</span><span style={css("font-size:12px;opacity:0.7")}>{v.focus.mins} min</span></div>
                  <div style={css("font-family:var(--font-heading);font-weight:800;font-size:26px;line-height:1.08;letter-spacing:-0.02em")}>{v.focus.title}</div>
                  <div style={css("font-size:13px;opacity:0.75")}>{v.focus.context}</div>
                  <div style={css("display:grid;grid-template-columns:1fr auto;gap:8px")}>
                    <button onClick={v.focus.start} className="hov-acc" style={css("display:flex;align-items:center;justify-content:space-between;height:48px;padding:0 14px;background:var(--color-accent);color:var(--color-bg);border:none;font-family:var(--font-heading);font-weight:800;font-size:15px;cursor:pointer")}><span>Log this session</span><Svg d={i.arrow} sw={2.2} /></button>
                    <button onClick={v.focus.done} style={css("height:48px;padding:0 14px;background:transparent;color:var(--color-bg);border:1px solid var(--color-neutral-600);font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:6px")}><Svg d={i.check} size={16} sw={2.4} />Done</button>
                  </div>
                </div>
              )}
              {v.allDone && (
                <div style={css("background:var(--color-accent-100);padding:18px;display:flex;flex-direction:column;gap:6px;border-top:2px solid var(--color-accent)")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-accent-700)")}>All done</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:24px;color:var(--color-accent-900)")}>Today&apos;s plan is complete.</span><span style={css("font-size:14px;color:var(--color-accent-800)")}>Tomorrow: TypeScript generics · 20 min</span></div>
              )}

              <div style={css("display:grid;grid-template-columns:1fr 1fr 1fr;border-top:2px solid var(--color-divider);border-bottom:2px solid var(--color-divider)")}>
                <div style={css("padding:14px 10px 14px 0;display:flex;flex-direction:column;gap:6px")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--color-neutral-700)")}>Streak</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:26px;line-height:1")}>{v.streak}<span style={css("font-size:13px;font-weight:600;color:var(--color-neutral-700)")}> days</span></span><div style={css("display:flex;gap:2px")}>{v.weekDots.map((d: any, di: number) => (<div key={di} style={css(`flex:1;height:5px;background:${d.bg}`)}></div>))}</div></div>
                <div style={css("padding:14px 10px;border-left:1px solid var(--color-divider);display:flex;flex-direction:column;gap:6px")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--color-neutral-700)")}>Today</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:26px;line-height:1")}>{v.todayMins}<span style={css("font-size:13px;font-weight:600;color:var(--color-neutral-700)")}>/45m</span></span><div style={css("height:5px;background:var(--color-neutral-300)")}><div style={css(`height:100%;width:${v.goalW};background:var(--color-accent)`)}></div></div></div>
                <div style={css("padding:14px 0 14px 10px;border-left:1px solid var(--color-divider);display:flex;flex-direction:column;gap:6px")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--color-neutral-700)")}>Overall</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:26px;line-height:1")}>49<span style={css("font-size:13px;font-weight:600;color:var(--color-neutral-700)")}>%</span></span><div style={css("height:5px;background:var(--color-neutral-300)")}><div style={css("height:100%;width:49%;background:var(--color-text)")}></div></div></div>
              </div>

              <div style={css("display:flex;flex-direction:column")}>
                <div style={css("display:flex;justify-content:space-between;align-items:baseline;padding-bottom:8px")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px")}>Today · {v.doneCount} of 4</span><button onClick={v.goToday} style={css("border:none;background:none;color:var(--color-accent-700);font-weight:600;font-size:14px;cursor:pointer;padding:0")}>Open</button></div>
                {v.tasks.map((t: any, ti: number) => (<div key={ti} style={css("display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--color-divider)")}><button onClick={t.toggle} style={css(`width:24px;height:24px;flex:none;border:2px solid ${t.boxBd};background:${t.boxBg};color:var(--color-bg);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0`)}><Svg d={t.check} size={14} sw={3} /></button><div style={css("flex:1;display:flex;flex-direction:column;gap:1px;min-width:0")}><span style={css(`font-size:15px;font-weight:600;text-decoration:${t.deco};color:${t.fg}`)}>{t.title}</span><span style={css("font-size:12px;color:var(--color-neutral-700)")}>{t.skill} · {t.mins} min</span></div></div>))}
              </div>

              <div style={css("display:flex;flex-direction:column;gap:10px")}>
                <span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px")}>Continue</span>
                <div className="no-scrollbar" style={css("display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 -20px;padding:0 20px")}>
                  {v.continueCards.map((k: any, ki: number) => (<button key={ki} onClick={k.open} className="hov-n200" style={css("width:200px;flex:none;background:var(--color-surface);border:none;color:var(--color-text);padding:14px;display:flex;flex-direction:column;gap:14px;text-align:left;cursor:pointer")}><div style={css("display:flex;justify-content:space-between;width:100%")}><div style={css("width:36px;height:36px;background:var(--color-bg);display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:800;font-size:13px")}>{k.mono}</div><span style={css("font-family:var(--font-heading);font-weight:800;font-size:20px")}>{k.pct}%</span></div><div style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("font-weight:600;font-size:15px")}>{k.name}</span><span style={css("font-size:12px;color:var(--color-neutral-700)")}>Next: {k.next}</span></div><div style={css("height:4px;width:100%;background:var(--color-neutral-300)")}><div style={css(`height:100%;width:${k.w};background:var(--color-text)`)}></div></div></button>))}
                </div>
              </div>

              <div style={css("display:flex;flex-direction:column;gap:12px;border-top:2px solid var(--color-divider);padding-top:14px")}>
                <div style={css("display:flex;justify-content:space-between;align-items:baseline")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px")}>This week</span><span style={css("font-size:14px;font-weight:600")}>{v.weekTotal}</span></div>
                <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:6px;height:96px;align-items:end")}>{v.weekBars.map((b: any, bi: number) => (<div key={bi} style={css(`height:${b.h};background:${b.bg}`)}></div>))}</div>
                <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:6px")}>{v.weekBars.map((b: any, bi: number) => (<span key={bi} style={css(`font-size:11px;font-weight:600;color:${b.lc}`)}>{b.d}</span>))}</div>
                <div style={css("font-size:14px;color:var(--color-neutral-800)")}>35 min ahead of last week at this point.</div>
              </div>
            </div>
          )}

          {/* LOADING */}
          {v.s.loading && (
            <div style={css("position:absolute;inset:0;padding:58px 20px 108px;display:flex;flex-direction:column;gap:24px")}>
              <div style={css("display:flex;justify-content:space-between")}><div style={css("width:150px;height:12px;background:var(--color-neutral-200)")}></div><div style={css("width:36px;height:12px;background:var(--color-neutral-200)")}></div></div>
              <div style={css("width:260px;height:34px;background:var(--color-neutral-200);margin-top:-8px")}></div>
              <div style={css("height:210px;background:var(--color-neutral-200);padding:18px;display:flex;flex-direction:column;gap:12px")}><div style={css("width:120px;height:10px;background:var(--color-neutral-300)")}></div><div style={css("width:240px;height:24px;background:var(--color-neutral-300)")}></div><div style={css("width:180px;height:24px;background:var(--color-neutral-300)")}></div><div style={css("flex:1")}></div><div style={css("height:48px;background:var(--color-neutral-300)")}></div></div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;border-top:2px solid var(--color-neutral-300);border-bottom:2px solid var(--color-neutral-300);padding:14px 0")}><div style={css("height:46px;background:var(--color-neutral-200)")}></div><div style={css("height:46px;background:var(--color-neutral-200)")}></div><div style={css("height:46px;background:var(--color-neutral-200)")}></div></div>
              <div style={css("display:flex;flex-direction:column;gap:14px")}><div style={css("height:14px;width:60%;background:var(--color-neutral-200)")}></div><div style={css("height:14px;width:80%;background:var(--color-neutral-200)")}></div><div style={css("height:14px;width:70%;background:var(--color-neutral-200)")}></div></div>
              <div style={css("font-size:13px;color:var(--color-neutral-700)")}>Loading today&apos;s plan…</div>
            </div>
          )}

          {/* ERROR / OFFLINE */}
          {v.s.error && (
            <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:58px 20px 108px;display:flex;flex-direction:column;gap:24px")}>
              <div style={css("display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--color-neutral-200);font-size:13px;font-weight:600")}><Svg d={i.wifiOff} size={16} />Offline. Your changes are saved on this device.</div>
              <div style={css("font-family:var(--font-heading);font-weight:800;font-size:36px;line-height:1;letter-spacing:-0.03em")}>Good morning, Maya.</div>
              <div style={css("border-top:2px solid var(--color-accent);padding-top:16px;display:flex;flex-direction:column;gap:10px")}>
                <span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-accent-700)")}>Sync failed</span>
                <span style={css("font-family:var(--font-heading);font-weight:800;font-size:24px;line-height:1.1")}>We couldn&apos;t sync your last session.</span>
                <span style={css("font-size:15px;line-height:1.5;color:var(--color-neutral-800)")}>25 min of React from 8:12 AM is saved locally. Your streak is safe. We&apos;ll retry when you&apos;re back online.</span>
                <div style={css("display:flex;gap:8px;margin-top:6px")}><button onClick={v.goHome} style={css("height:44px;padding:0 16px;background:var(--color-accent);color:var(--color-bg);border:none;font-weight:800;font-family:var(--font-heading);font-size:14px;cursor:pointer;display:flex;align-items:center;gap:8px")}><Svg d={i.refresh} size={16} sw={2.2} />Try again</button><button style={css("height:44px;padding:0 16px;background:transparent;color:var(--color-text);border:1px solid var(--color-divider);font-weight:600;font-size:14px;cursor:pointer")}>Details</button></div>
              </div>
              <div style={css("display:flex;flex-direction:column;gap:6px;padding:16px;background:var(--color-surface)")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700)")}>Still available offline</span><span style={css("font-size:15px")}>Today&apos;s tasks, notes and timers work without a connection.</span></div>
            </div>
          )}

          {/* TODAY */}
          {v.s.today && (
            <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:58px 20px 108px;display:flex;flex-direction:column;gap:22px")}>
              <div style={css("display:flex;justify-content:space-between;align-items:center")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700)")}>Tue 29 Sep</span><div style={css(`display:flex;align-items:center;gap:5px;font-weight:800;font-family:var(--font-heading);font-size:15px;color:${v.streakColor}`)}><Svg d={i.flame} size={17} />{v.streak}</div></div>
              <div style={css("font-family:var(--font-heading);font-weight:800;font-size:40px;line-height:1;letter-spacing:-0.03em;margin-top:-8px")}>Today</div>

              {v.allDone && (
                <div style={css("display:flex;gap:18px;align-items:center;padding:18px;background:var(--color-text);color:var(--color-bg)")}>
                  <svg width="84" height="84" viewBox="0 0 84 84" style={css("flex:none")}><circle cx="42" cy="42" r="36" fill="none" stroke="var(--color-neutral-700)" strokeWidth="8"></circle><circle cx="42" cy="42" r="36" fill="none" stroke="var(--color-accent)" strokeWidth="8" strokeDasharray="226.2" strokeDashoffset="0" transform="rotate(-90 42 42)"></circle></svg>
                  <div style={css("display:flex;flex-direction:column;gap:4px")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:24px")}>Done for today.</span><span style={css("font-size:14px;opacity:0.8")}>{v.todayMins} min across 3 skills. Streak: {v.streak} days.</span><span style={css("font-size:13px;opacity:0.65")}>Tomorrow: Generics · 20 min</span></div>
                </div>
              )}
              {v.notAllDone && (
                <div style={css("display:flex;flex-direction:column;gap:10px;border-top:2px solid var(--color-divider);padding-top:14px")}>
                  <div style={css("display:flex;justify-content:space-between;align-items:baseline")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:28px")}>{v.todayMins}<span style={css("font-size:15px;color:var(--color-neutral-700)")}> / {v.planMins} min</span></span><span style={css("font-size:14px;font-weight:600")}>{v.doneCount} of 4 done</span></div>
                  <div style={css("display:grid;grid-template-columns:repeat(4,1fr);gap:3px")}>{v.taskSegs.map((g: any, gi: number) => (<div key={gi} style={css(`height:6px;background:${g.bg}`)}></div>))}</div>
                  <span style={css("font-size:13px;color:var(--color-neutral-700)")}>Swipe right to complete · tap to log time</span>
                </div>
              )}

              <div style={css("display:flex;flex-direction:column;border-top:1px solid var(--color-divider);margin:0 -20px")}>
                {v.tasks.map((t: any, ti: number) => (
                  <div key={ti} style={css("position:relative;overflow:hidden;border-bottom:1px solid var(--color-divider)")}>
                    <div style={css("position:absolute;inset:0;background:var(--color-accent);color:var(--color-bg);display:flex;align-items:center;gap:8px;padding-left:20px;font-family:var(--font-heading);font-weight:800;font-size:15px")}><Svg d={i.check} sw={2.6} />{t.swipeLabel}</div>
                    <div onPointerDown={t.down} onPointerMove={t.move} onPointerUp={t.up} onPointerLeave={t.leave} style={css(`position:relative;background:var(--color-bg);display:flex;gap:14px;align-items:flex-start;padding:16px 20px;touch-action:pan-y;user-select:none;cursor:grab;transform:translateX(${t.dx}px);transition:${t.tr}`)}>
                      <button onClick={t.toggle} onPointerDown={v.stop} style={css(`width:26px;height:26px;flex:none;border:2px solid ${t.boxBd};background:${t.boxBg};color:var(--color-bg);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;margin-top:1px`)}><Svg d={t.check} size={15} sw={3} /></button>
                      <div style={css("flex:1;display:flex;flex-direction:column;gap:6px;min-width:0")}>
                        <span style={css(`font-size:16px;font-weight:600;line-height:1.25;text-decoration:${t.deco};color:${t.fg}`)}>{t.title}</span>
                        <div style={css("display:flex;gap:10px;align-items:center;font-size:12px;color:var(--color-neutral-700)")}><span style={css("font-weight:600;color:var(--color-text)")}>{t.skill}</span><span style={css("display:flex;align-items:center;gap:4px")}><Svg d={i.clock} size={13} />{t.mins} min</span><span style={css(`padding:2px 7px;background:${t.priBg};color:${t.priFg};font-weight:600`)}>{t.pri}</span></div>
                      </div>
                      <Svg d={i.chevR} stroke="var(--color-neutral-600)" style={css("margin-top:4px;flex:none")} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={css("display:flex;flex-direction:column;gap:10px")}>
                <span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px")}>Log extra time</span>
                <div style={css("display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--color-divider)")}>{v.quickLog.map((q: any, qi: number) => (<button key={qi} onClick={q.open} className="hov-n200" style={css("height:48px;border:none;border-right:1px solid var(--color-divider);background:transparent;color:var(--color-text);font-weight:800;font-family:var(--font-heading);font-size:15px;text-align:left;padding:0 12px;cursor:pointer")}>+{q.m}m</button>))}</div>
              </div>

              <div style={css("display:flex;flex-direction:column;gap:10px;border-top:2px solid var(--color-divider);padding-top:14px")}>
                <span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px")}>Quick reflection</span>
                <span style={css("font-size:14px;color:var(--color-neutral-800)")}>How did today&apos;s learning feel?</span>
                <div style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:6px")}>{v.reflect.map((r: any, ri: number) => (<button key={ri} onClick={r.pick} style={css(`height:44px;border:1px solid ${r.bd};background:${r.bg};color:${r.fg};font-weight:600;font-size:14px;text-align:left;padding:0 12px;cursor:pointer`)}>{r.label}</button>))}</div>
                <Textarea className={fieldReset} placeholder="One thing that clicked, or didn't…" style={css("min-height:76px;padding:12px;font-size:15px;background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-divider);resize:none")} />
              </div>
            </div>
          )}

          {/* SESSION COMPLETE */}
          {v.s.sessionDone && (
            <div style={css("position:absolute;inset:0;padding:60px 20px 28px;display:flex;flex-direction:column;gap:20px")}>
              <div style={css("display:flex;justify-content:space-between;align-items:center")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700)")}>Session logged</span><button onClick={v.goHome} style={css("width:36px;height:36px;border:1px solid var(--color-divider);background:transparent;color:var(--color-text);display:flex;align-items:center;justify-content:center;cursor:pointer")}><Svg d={i.x} /></button></div>
              <div style={css("background:var(--color-accent);color:var(--color-bg);padding:20px 20px 16px;display:flex;flex-direction:column;gap:14px")}>
                <div style={css("display:flex;align-items:flex-end;justify-content:space-between")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:132px;line-height:0.8;letter-spacing:-0.05em")}>{v.streak}</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:22px;line-height:1.05;text-align:right")}>day<br />streak</span></div>
                <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:4px")}>{v.weekDotsLbl.map((d: any, di: number) => (<div key={di} style={css("display:flex;flex-direction:column;gap:5px")}><div style={css(`height:22px;background:${d.bg}`)}></div><span style={css("font-size:11px;font-weight:600")}>{d.d}</span></div>))}</div>
              </div>
              <div style={css("display:flex;flex-direction:column;border-top:2px solid var(--color-divider)")}>
                <div style={css("display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--color-divider)")}><span style={css("font-size:15px")}>{v.lastLog.skill}</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:15px")}>+{v.lastLog.mins} min</span></div>
                <div style={css("display:flex;flex-direction:column;gap:8px;padding:14px 0;border-bottom:1px solid var(--color-divider)")}><div style={css("display:flex;justify-content:space-between")}><span style={css("font-size:15px")}>Milestone 4 · Custom hooks</span><span style={css("font-weight:600;font-size:14px")}>3 / 5</span></div><div style={css("height:5px;background:var(--color-neutral-300)")}><div style={css("height:100%;width:60%;background:var(--color-text)")}></div></div></div>
                <div style={css("display:flex;flex-direction:column;gap:8px;padding:14px 0;border-bottom:1px solid var(--color-divider)")}><div style={css("display:flex;justify-content:space-between")}><span style={css("font-size:15px")}>Daily goal</span><span style={css("font-weight:600;font-size:14px")}>{v.todayMins} / 45 min</span></div><div style={css("height:5px;background:var(--color-neutral-300)")}><div style={css(`height:100%;width:${v.goalW};background:var(--color-accent)`)}></div></div></div>
              </div>
              <div style={css("flex:1")}></div>
              <div style={css("display:flex;flex-direction:column;gap:8px")}>
                {v.hasFocus && (<button onClick={v.goToday} style={css("display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 18px;background:var(--color-text);color:var(--color-bg);border:none;cursor:pointer;text-align:left")}><span style={css("display:flex;flex-direction:column")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;opacity:0.7")}>Up next</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:15px")}>{v.focus.title} · {v.focus.mins}m</span></span><Svg d={i.arrow} size={20} sw={2.2} /></button>)}
                <button onClick={v.goHome} style={css("height:52px;padding:0 18px;background:transparent;color:var(--color-text);border:1px solid var(--color-divider);font-weight:600;font-size:15px;text-align:left;cursor:pointer")}>Back to home</button>
              </div>
            </div>
          )}

          {/* SKILLS */}
          {v.s.skills && (
            <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:58px 20px 108px;display:flex;flex-direction:column;gap:20px")}>
              <div style={css("display:flex;justify-content:space-between;align-items:flex-end")}><div style={css("font-family:var(--font-heading);font-weight:800;font-size:40px;line-height:1;letter-spacing:-0.03em")}>Skills</div><button onClick={v.goCreate} className="hov-acc" style={css("width:44px;height:44px;background:var(--color-accent);color:var(--color-bg);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer")}><Svg d={i.plus} size={22} sw={2.4} /></button></div>
              <div style={css("display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--color-divider)")}>{v.filters.map((f: any, fi: number) => (<button key={fi} onClick={f.pick} style={css(`height:40px;border:none;border-right:1px solid var(--color-divider);background:${f.bg};color:${f.fg};font-weight:600;font-size:13px;text-align:left;padding:0 12px;cursor:pointer`)}>{f.label} <span style={css("opacity:0.65")}>{f.n}</span></button>))}</div>
              <div style={css("display:flex;flex-direction:column;border-top:2px solid var(--color-divider)")}>
                {v.skillList.map((k: any, ki: number) => (
                  <button key={ki} onClick={k.open} className="hov-n100" style={css("display:flex;flex-direction:column;gap:10px;padding:16px 0;border:none;border-bottom:1px solid var(--color-divider);background:transparent;color:var(--color-text);text-align:left;cursor:pointer")}>
                    <div style={css("display:flex;align-items:center;gap:12px;width:100%")}>
                      <div style={css(`width:44px;height:44px;flex:none;background:${k.iconBg};color:${k.iconFg};display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:800;font-size:15px`)}>{k.mono}</div>
                      <div style={css("flex:1;display:flex;flex-direction:column;gap:2px;min-width:0")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:17px")}>{k.name}</span><span style={css("font-size:13px;color:var(--color-neutral-700)")}>{k.levelLine}</span></div>
                      <span style={css("font-family:var(--font-heading);font-weight:800;font-size:22px")}>{k.pctLabel}</span>
                    </div>
                    <div style={css("height:4px;width:100%;background:var(--color-neutral-300)")}><div style={css(`height:100%;width:${k.w};background:${k.barBg}`)}></div></div>
                    <div style={css("display:flex;gap:14px;font-size:12px;color:var(--color-neutral-700);width:100%")}><span style={css(`display:flex;align-items:center;gap:4px;color:${k.streakFg};font-weight:600`)}><Svg d={i.flame} size={13} />{k.streakLabel}</span><span style={css("flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap")}>{k.nextLine}</span></div>
                  </button>
                ))}
              </div>
              <button onClick={v.goPaywall} style={css("display:flex;justify-content:space-between;align-items:center;padding:14px;background:var(--color-surface);border:none;color:var(--color-text);text-align:left;cursor:pointer")}><span style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("font-weight:600;font-size:14px")}>6 of 6 skills on Free</span><span style={css("font-size:13px;color:var(--color-neutral-700)")}>Pro removes the limit and adds custom categories.</span></span><Svg d={i.chevR} /></button>
            </div>
          )}

          {/* SKILLS EMPTY */}
          {v.s.emptySkills && (
            <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:58px 20px 108px;display:flex;flex-direction:column;gap:24px")}>
              <div style={css("font-family:var(--font-heading);font-weight:800;font-size:40px;line-height:1;letter-spacing:-0.03em")}>Skills</div>
              <div style={css("display:flex;flex-direction:column;gap:14px;padding:24px 0;border-top:2px solid var(--color-divider);border-bottom:2px solid var(--color-divider)")}>
                <div style={css("display:grid;grid-template-columns:repeat(3,44px);gap:6px")}><div style={css("height:44px;border:2px dashed var(--color-neutral-400)")}></div><div style={css("height:44px;border:2px dashed var(--color-neutral-400)")}></div><div style={css("height:44px;background:var(--color-accent)")}></div></div>
                <span style={css("font-family:var(--font-heading);font-weight:800;font-size:28px;line-height:1.05")}>No skills yet.</span>
                <span style={css("font-size:15px;line-height:1.5;color:var(--color-neutral-800)")}>Add one skill to start. You can plan the rest later.</span>
                <button onClick={v.goCreate} style={css("display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 16px;background:var(--color-accent);color:var(--color-bg);border:none;font-family:var(--font-heading);font-weight:800;font-size:15px;cursor:pointer;margin-top:6px")}><span>Add a skill</span><Svg d={i.plus} sw={2.4} /></button>
              </div>
              <div style={css("display:flex;flex-direction:column")}>
                <span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700);padding-bottom:8px")}>Or start from a template</span>
                {v.templates.map((t: any, ti: number) => (<button key={ti} onClick={t.go} style={css("display:flex;align-items:center;gap:12px;padding:14px 0;border:none;border-top:1px solid var(--color-divider);background:transparent;color:var(--color-text);text-align:left;cursor:pointer")}><span style={css("flex:1;display:flex;flex-direction:column;gap:2px")}><span style={css("font-weight:600;font-size:15px")}>{t.name}</span><span style={css("font-size:12px;color:var(--color-neutral-700)")}>{t.meta}</span></span>{t.pro && (<span style={css("font-size:11px;font-weight:600;padding:3px 8px;background:var(--color-accent-100);color:var(--color-accent-800)")}>Pro</span>)}<Svg d={i.chevR} /></button>))}
              </div>
            </div>
          )}

          {/* SKILL DETAIL */}
          {v.s.skill && (
            <>
              <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:56px 20px 176px;display:flex;flex-direction:column;gap:22px")}>
                <div style={css("display:flex;justify-content:space-between;align-items:center")}><button onClick={v.goSkills} style={css("display:flex;align-items:center;gap:2px;border:none;background:none;color:var(--color-text);font-weight:600;font-size:15px;cursor:pointer;padding:0")}><Svg d={i.chevL} size={20} />Skills</button><span style={css("font-size:12px;color:var(--color-neutral-700)")}>{v.sk.cat}</span></div>
                <div style={css("display:flex;align-items:center;gap:14px")}><div style={css("width:56px;height:56px;background:var(--color-text);color:var(--color-bg);display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:800;font-size:19px")}>{v.sk.mono}</div><div style={css("display:flex;flex-direction:column")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:34px;line-height:1;letter-spacing:-0.025em")}>{v.sk.name}</span><span style={css("font-size:13px;color:var(--color-neutral-700);margin-top:4px")}>{v.sk.since}</span></div></div>

                {v.sk.completed && (
                  <div style={css("background:var(--color-accent-100);border-top:2px solid var(--color-accent);padding:16px;display:flex;flex-direction:column;gap:4px")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-accent-700)")}>Skill completed</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:20px;color:var(--color-accent-900)")}>Advanced reached on 14 Aug.</span><span style={css("font-size:14px;color:var(--color-accent-800)")}>32 h over 11 weeks. Nicely done.</span></div>
                )}

                <div style={css("display:grid;grid-template-columns:150px minmax(0,1fr);border-top:2px solid var(--color-divider);border-bottom:2px solid var(--color-divider)")}>
                  <div style={css("padding:16px 16px 16px 0;position:relative;display:flex;align-items:center;justify-content:center")}>
                    <svg width="132" height="132" viewBox="0 0 132 132"><circle cx="66" cy="66" r="56" fill="none" stroke="var(--color-neutral-300)" strokeWidth="12"></circle><circle cx="66" cy="66" r="56" fill="none" stroke="var(--color-accent)" strokeWidth="12" strokeDasharray="351.9" strokeDashoffset={v.sk.ringOff} transform="rotate(-90 66 66)"></circle></svg>
                    <div style={css("position:absolute;inset:0;padding-right:16px;display:flex;flex-direction:column;align-items:center;justify-content:center")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:34px;line-height:1")}>{v.sk.pct}%</span><span style={css("font-size:11px;color:var(--color-neutral-700)")}>to target</span></div>
                  </div>
                  <div style={css("display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);border-left:1px solid var(--color-divider)")}>
                    <div style={css("padding:14px 10px;border-bottom:1px solid var(--color-divider);display:flex;flex-direction:column;gap:3px")}><span style={css("font-size:11px;color:var(--color-neutral-700)")}>Current</span><span style={css("font-weight:800;font-family:var(--font-heading);font-size:14px")}>{v.sk.level}</span></div>
                    <div style={css("padding:14px 10px;border-bottom:1px solid var(--color-divider);border-left:1px solid var(--color-divider);display:flex;flex-direction:column;gap:3px")}><span style={css("font-size:11px;color:var(--color-neutral-700)")}>Target</span><span style={css("font-weight:800;font-family:var(--font-heading);font-size:14px")}>{v.sk.target}</span></div>
                    <div style={css("padding:14px 10px;display:flex;flex-direction:column;gap:3px")}><span style={css("font-size:11px;color:var(--color-neutral-700)")}>Streak</span><span style={css("font-weight:800;font-family:var(--font-heading);font-size:14px")}>{v.sk.streak} days</span></div>
                    <div style={css("padding:14px 10px;border-left:1px solid var(--color-divider);display:flex;flex-direction:column;gap:3px")}><span style={css("font-size:11px;color:var(--color-neutral-700)")}>Logged</span><span style={css("font-weight:800;font-family:var(--font-heading);font-size:14px")}>{v.sk.hours} h</span></div>
                  </div>
                </div>

                <div style={css("display:flex;flex-direction:column;gap:12px")}>
                  <div style={css("display:flex;justify-content:space-between;align-items:baseline")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px")}>Milestones · {v.sk.doneN}/{v.sk.totalN}</span><button onClick={v.goRoadmap} style={css("border:none;background:none;color:var(--color-accent-700);font-weight:600;font-size:14px;cursor:pointer;padding:0")}>Full roadmap</button></div>
                  <div style={css("display:flex;flex-direction:column")}>
                    {v.sk.milestones.map((m: any, mi: number) => (
                      <div key={mi} style={css("display:grid;grid-template-columns:20px 1fr;gap:14px")}>
                        <div style={css("display:flex;flex-direction:column;align-items:center")}><div style={css(`width:18px;height:18px;flex:none;margin-top:2px;background:${m.nodeBg};border:2px solid ${m.nodeBd};color:var(--color-bg);display:flex;align-items:center;justify-content:center`)}><Svg d={m.check} size={11} sw={3.5} /></div><div style={css(`flex:1;width:2px;background:${m.lineBg};min-height:14px`)}></div></div>
                        <div style={css("display:flex;flex-direction:column;gap:2px;padding-bottom:16px")}><span style={css(`font-size:15px;font-weight:600;color:${m.fg}`)}>{m.title}</span><span style={css(`font-size:12px;color:${m.subFg}`)}>{m.sub}</span></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={css("display:flex;flex-direction:column")}>
                  <span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px;padding-bottom:8px")}>Resources</span>
                  {v.sk.resources.map((r: any, ri: number) => (<div key={ri} style={css("display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--color-divider)")}><Svg d={i.book} style={css("flex:none")} /><span style={css("flex:1;font-size:15px")}>{r.t}</span><span style={css("font-size:11px;font-weight:600;padding:3px 8px;background:var(--color-neutral-200)")}>{r.k}</span></div>))}
                </div>

                <div style={css("display:flex;flex-direction:column;gap:8px")}>
                  <span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px")}>Notes</span>
                  <div style={css("padding:14px;background:var(--color-surface);font-size:15px;line-height:1.5")}>{v.sk.note}</div>
                </div>

                <div style={css("display:flex;flex-direction:column")}>
                  <span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px;padding-bottom:8px")}>Activity</span>
                  {v.sk.activity.map((a: any, ai: number) => (<div key={ai} style={css("display:grid;grid-template-columns:64px 1fr auto;gap:10px;padding:11px 0;border-top:1px solid var(--color-divider);font-size:14px")}><span style={css("color:var(--color-neutral-700)")}>{a.d}</span><span>{a.t}</span><span style={css("font-weight:600")}>{a.m}</span></div>))}
                </div>
              </div>
              <div style={css("position:absolute;left:0;right:0;bottom:84px;padding:12px 20px;background:var(--color-bg);border-top:2px solid var(--color-divider)")}>
                <button onClick={v.sk.cta} className="hov-acc" style={css("width:100%;display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 16px;background:var(--color-accent);color:var(--color-bg);border:none;font-family:var(--font-heading);font-weight:800;font-size:16px;cursor:pointer")}><span>{v.sk.ctaLabel}</span><Svg d={i.plus} size={20} sw={2.4} /></button>
              </div>
            </>
          )}

          {/* ROADMAP */}
          {v.s.roadmap && (
            <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:56px 20px 108px;display:flex;flex-direction:column;gap:22px")}>
              <button onClick={v.goSkill} style={css("display:flex;align-items:center;gap:2px;border:none;background:none;color:var(--color-text);font-weight:600;font-size:15px;cursor:pointer;padding:0;align-self:flex-start")}><Svg d={i.chevL} size={20} />React</button>
              <div style={css("display:flex;flex-direction:column;gap:6px")}><div style={css("font-family:var(--font-heading);font-weight:800;font-size:40px;line-height:1;letter-spacing:-0.03em")}>Roadmap</div><span style={css("font-size:14px;color:var(--color-neutral-700)")}>12 of 22 milestones · est. 9 weeks to Advanced</span></div>
              <div style={css("display:grid;grid-template-columns:repeat(5,1fr);gap:4px")}>{v.stages.map((g: any, gi: number) => (<div key={gi} style={css("display:flex;flex-direction:column;gap:6px")}><div style={css(`height:6px;background:${g.bar}`)}></div><span style={css(`font-size:10.5px;font-weight:600;color:${g.lc};line-height:1.2`)}>{g.short}</span></div>))}</div>
              <div style={css("display:flex;flex-direction:column;border-top:2px solid var(--color-divider)")}>
                {v.stages.map((g: any, gi: number) => (
                  <div key={gi} style={css("border-bottom:1px solid var(--color-divider)")}>
                    <button onClick={g.toggle} style={css("width:100%;display:flex;align-items:center;gap:12px;padding:16px 0;border:none;background:transparent;color:var(--color-text);text-align:left;cursor:pointer")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:13px;color:var(--color-neutral-700);width:22px")}>{g.n}</span><span style={css("flex:1;display:flex;flex-direction:column;gap:2px")}><span style={css(`font-family:var(--font-heading);font-weight:800;font-size:18px;color:${g.fg}`)}>{g.name}</span><span style={css("font-size:12px;color:var(--color-neutral-700)")}>{g.meta}</span></span><span style={css(`font-size:11px;font-weight:600;padding:3px 8px;background:${g.tagBg};color:${g.tagFg}`)}>{g.status}</span></button>
                    {g.open && (
                      <div style={css("display:flex;flex-direction:column;padding:0 0 12px 34px")}>
                        {g.tasks.map((t: any, ti: number) => (<div key={ti} style={css("display:flex;align-items:center;gap:12px;padding:9px 0")}><div style={css(`width:18px;height:18px;flex:none;border:2px solid ${t.bd};background:${t.bg};color:var(--color-bg);display:flex;align-items:center;justify-content:center`)}><Svg d={t.check} size={11} sw={3.5} /></div><span style={css(`font-size:14px;color:${t.fg};text-decoration:${t.deco}`)}>{t.t}</span></div>))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={v.goPaywall} style={css("display:flex;gap:12px;align-items:flex-start;padding:16px;background:var(--color-text);color:var(--color-bg);border:none;text-align:left;cursor:pointer")}><Svg d={i.sparkles} size={20} stroke="var(--color-accent-400)" style={css("flex:none;margin-top:2px")} /><span style={css("flex:1;display:flex;flex-direction:column;gap:3px")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:16px")}>Rebuild with AI</span><span style={css("font-size:13px;opacity:0.75;line-height:1.4")}>Adjusts milestones to your pace, gaps and target date.</span></span><span style={css("font-size:11px;font-weight:600;padding:3px 8px;background:var(--color-accent);color:var(--color-bg)")}>Pro</span></button>
            </div>
          )}

          {/* CREATE SKILL */}
          {v.s.create && (
            <>
              <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:56px 20px 110px;display:flex;flex-direction:column;gap:22px")}>
                <div style={css("display:flex;justify-content:space-between;align-items:center")}><button onClick={v.goSkills} style={css("width:36px;height:36px;border:1px solid var(--color-divider);background:transparent;color:var(--color-text);display:flex;align-items:center;justify-content:center;cursor:pointer")}><Svg d={i.x} /></button><span style={css("font-size:13px;color:var(--color-neutral-700)")}>Draft saved</span></div>
                <div style={css("font-family:var(--font-heading);font-weight:800;font-size:36px;line-height:1;letter-spacing:-0.03em")}>New skill</div>
                <div style={css("display:flex;flex-direction:column;gap:6px")}><label style={css("font-size:12px;color:var(--color-neutral-700)")}>Skill name</label><Input className={fieldReset} value={v.cName} onChange={v.setName} style={css("height:50px;padding:0 14px;font-size:18px;font-weight:600;background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-divider)")} /></div>
                <div style={css("display:flex;flex-direction:column;gap:8px")}><label style={css("font-size:12px;color:var(--color-neutral-700)")}>Category</label><div style={css("display:flex;flex-wrap:wrap;gap:6px")}>{v.cats.map((c: any, ci: number) => (<button key={ci} onClick={c.pick} style={css(`height:36px;padding:0 12px;border:1px solid ${c.bd};background:${c.bg};color:${c.fg};font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px`)}>{c.label}{c.pro && (<span style={css("font-size:10px;padding:1px 5px;background:var(--color-accent-100);color:var(--color-accent-800)")}>Pro</span>)}</button>))}</div></div>
                <div style={css("display:flex;flex-direction:column;gap:8px")}><label style={css("font-size:12px;color:var(--color-neutral-700)")}>Current experience</label><div style={css("display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--color-divider)")}>{v.expOpts.map((o: any, oi: number) => (<button key={oi} onClick={o.pick} style={css(`height:40px;border:none;border-right:1px solid var(--color-divider);background:${o.bg};color:${o.fg};font-size:13px;font-weight:600;text-align:left;padding:0 8px;cursor:pointer`)}>{o.label}</button>))}</div></div>
                <div style={css("display:flex;flex-direction:column;gap:8px")}><label style={css("font-size:12px;color:var(--color-neutral-700)")}>Target level</label><div style={css("display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--color-divider)")}>{v.tgtOpts.map((o: any, oi: number) => (<button key={oi} onClick={o.pick} style={css(`height:40px;border:none;border-right:1px solid var(--color-divider);background:${o.bg};color:${o.fg};font-size:12px;font-weight:600;text-align:left;padding:0 8px;cursor:pointer`)}>{o.label}</button>))}</div></div>
                <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:10px")}>
                  <div style={css("display:flex;flex-direction:column;gap:6px")}><label style={css("font-size:12px;color:var(--color-neutral-700)")}>Target date</label><div style={css("height:50px;padding:0 14px;display:flex;align-items:center;font-size:16px;font-weight:600;background:var(--color-surface);border:1px solid var(--color-divider)")}>31 Mar 2027</div></div>
                  <div style={css("display:flex;flex-direction:column;gap:6px")}><label style={css("font-size:12px;color:var(--color-neutral-700)")}>Weekly commitment</label><div style={css("height:50px;display:grid;grid-template-columns:44px 1fr 44px;border:1px solid var(--color-divider);background:var(--color-surface)")}><button onClick={v.wkDown} style={css("border:none;border-right:1px solid var(--color-divider);background:transparent;color:var(--color-text);font-size:20px;cursor:pointer")}>−</button><span style={css("display:flex;align-items:center;padding-left:12px;font-size:16px;font-weight:800;font-family:var(--font-heading)")}>{v.cWeekly} h</span><button onClick={v.wkUp} style={css("border:none;border-left:1px solid var(--color-divider);background:transparent;color:var(--color-text);font-size:20px;cursor:pointer")}>+</button></div></div>
                </div>
                <div style={css("display:flex;flex-direction:column")}>
                  <div style={css("display:flex;justify-content:space-between;align-items:baseline;padding-bottom:8px")}><label style={css("font-size:12px;color:var(--color-neutral-700)")}>Milestones</label><span style={css("font-size:12px;color:var(--color-neutral-700)")}>{v.cMsCount}</span></div>
                  {v.cMilestones.map((m: any, mi: number) => (<div key={mi} style={css("display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--color-divider)")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:13px;color:var(--color-neutral-700);width:20px")}>{m.n}</span><span style={css("flex:1;font-size:15px")}>{m.t}</span><button onClick={m.remove} style={css("border:none;background:none;color:var(--color-neutral-600);cursor:pointer;padding:4px;display:flex")}><Svg d={i.x} size={16} /></button></div>))}
                  <button onClick={v.addMs} style={css("display:flex;align-items:center;gap:8px;height:46px;border:none;border-top:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider);background:transparent;color:var(--color-accent-700);font-weight:600;font-size:14px;text-align:left;padding:0;cursor:pointer")}><Svg d={i.plus} size={16} sw={2.4} />Add milestone</button>
                </div>
                <button onClick={v.goPaywall} style={css("display:flex;gap:12px;align-items:flex-start;padding:16px;background:var(--color-text);color:var(--color-bg);border:none;text-align:left;cursor:pointer")}><Svg d={i.sparkles} size={20} stroke="var(--color-accent-400)" style={css("flex:none;margin-top:2px")} /><span style={css("flex:1;display:flex;flex-direction:column;gap:3px")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:16px")}>Generate roadmap with AI</span><span style={css("font-size:13px;opacity:0.75;line-height:1.4")}>5 stages, ~20 milestones, sized to {v.cWeekly} h a week.</span></span><span style={css("font-size:11px;font-weight:600;padding:3px 8px;background:var(--color-accent);color:var(--color-bg)")}>Pro</span></button>
              </div>
              <div style={css("position:absolute;left:0;right:0;bottom:0;padding:12px 20px 30px;background:var(--color-bg);border-top:2px solid var(--color-divider)")}><button onClick={v.createSkill} className="hov-acc" style={css("width:100%;display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 16px;background:var(--color-accent);color:var(--color-bg);border:none;font-family:var(--font-heading);font-weight:800;font-size:16px;cursor:pointer")}><span>Create skill</span><Svg d={i.arrow} size={20} sw={2.4} /></button></div>
            </>
          )}

          {/* PROGRESS */}
          {v.s.progress && (
            <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:58px 20px 108px;display:flex;flex-direction:column;gap:22px")}>
              <div style={css("display:flex;justify-content:space-between;align-items:flex-end")}><div style={css("font-family:var(--font-heading);font-weight:800;font-size:40px;line-height:1;letter-spacing:-0.03em")}>Progress</div><div style={css("display:flex;border:1px solid var(--color-divider)")}>{v.ranges.map((r: any, ri: number) => (<button key={ri} onClick={r.pick} style={css(`height:34px;padding:0 12px;border:none;background:${r.bg};color:${r.fg};font-size:13px;font-weight:600;cursor:pointer`)}>{r.label}</button>))}</div></div>
              <div style={css("display:flex;flex-direction:column;gap:4px;border-top:2px solid var(--color-divider);padding-top:14px")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700)")}>{v.rng.label}</span><div style={css("display:flex;align-items:baseline;gap:10px")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:48px;line-height:1;letter-spacing:-0.03em")}>{v.rng.total}</span><span style={css("font-size:14px;font-weight:600;color:var(--color-accent-700)")}>{v.rng.delta}</span></div></div>
              <div style={css("display:flex;flex-direction:column;gap:8px")}>
                <div style={css(`display:flex;gap:${v.rng.gap};height:120px;align-items:flex-end`)}>{v.rng.bars.map((b: any, bi: number) => (<div key={bi} style={css(`flex:1;height:${b.h};background:${b.bg}`)}></div>))}</div>
                <div style={css("display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:var(--color-neutral-700)")}>{v.rng.ticks.map((t: any, ti: number) => (<span key={ti}>{t}</span>))}</div>
              </div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;border-top:2px solid var(--color-divider)")}>
                {v.stats.map((stx: any, si: number) => (<div key={si} style={css(`padding:14px 0 14px ${stx.pl};border-bottom:1px solid var(--color-divider);border-left:${stx.bl};display:flex;flex-direction:column;gap:4px`)}><span style={css("font-size:12px;color:var(--color-neutral-700)")}>{stx.l}</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:26px;line-height:1")}>{stx.v}<span style={css("font-size:13px;color:var(--color-neutral-700)")}>{stx.u}</span></span></div>))}
              </div>
              <div style={css("display:flex;flex-direction:column;gap:12px")}>
                <span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px")}>Skills improved</span>
                {v.bySkill.map((b: any, bi: number) => (<div key={bi} style={css("display:flex;flex-direction:column;gap:6px")}><div style={css("display:flex;justify-content:space-between;font-size:14px")}><span style={css("font-weight:600")}>{b.name}</span><span style={css("color:var(--color-neutral-700)")}>{b.v} · <span style={css("color:var(--color-accent-700);font-weight:600")}>{b.lvl}</span></span></div><div style={css("height:8px;background:var(--color-neutral-200)")}><div style={css(`height:100%;width:${b.w};background:var(--color-text)`)}></div></div></div>))}
              </div>
              <div style={css("display:flex;flex-direction:column;gap:10px;border-top:2px solid var(--color-divider);padding-top:14px")}>
                <div style={css("display:flex;justify-content:space-between;align-items:baseline")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:19px")}>Last 18 weeks</span><span style={css("font-size:12px;color:var(--color-neutral-700)")}>102 active days</span></div>
                <div style={css("display:grid;grid-template-rows:repeat(7,15px);grid-auto-flow:column;grid-auto-columns:15px;gap:3px")}>{v.heat.map((c: any, ci: number) => (<div key={ci} style={css(`background:${c.bg}`)}></div>))}</div>
                <div style={css("display:flex;align-items:center;gap:4px;font-size:11px;color:var(--color-neutral-700)")}><span style={css("margin-right:4px")}>Less</span><div style={css("width:12px;height:12px;background:var(--color-neutral-200)")}></div><div style={css("width:12px;height:12px;background:var(--color-accent-200)")}></div><div style={css("width:12px;height:12px;background:var(--color-accent-400)")}></div><div style={css("width:12px;height:12px;background:var(--color-accent)")}></div><div style={css("width:12px;height:12px;background:var(--color-accent-700)")}></div><span style={css("margin-left:4px")}>More</span></div>
              </div>
              <button onClick={v.goAchievements} style={css("display:flex;justify-content:space-between;align-items:center;padding:16px 0;border:none;border-top:2px solid var(--color-divider);border-bottom:1px solid var(--color-divider);background:transparent;color:var(--color-text);cursor:pointer;text-align:left")}><span style={css("display:flex;align-items:center;gap:10px")}><Svg d={i.award} size={20} /><span style={css("font-family:var(--font-heading);font-weight:800;font-size:17px")}>Achievements</span></span><span style={css("display:flex;align-items:center;gap:6px;font-size:14px;color:var(--color-neutral-700)")}>6 of 10<Svg d={i.chevR} /></span></button>
              <button onClick={v.goPaywall} style={css("display:flex;flex-direction:column;gap:12px;padding:16px;background:var(--color-surface);border:none;color:var(--color-text);text-align:left;cursor:pointer")}>
                <div style={css("display:flex;justify-content:space-between;width:100%;align-items:center")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:16px")}>Detailed insights</span><span style={css("display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 8px;background:var(--color-accent-100);color:var(--color-accent-800)")}><Svg d={i.lock} size={11} sw={2.4} />Pro</span></div>
                <div style={css("display:flex;flex-direction:column;gap:8px;width:100%;filter:blur(3px);opacity:0.6")}><span style={css("font-size:14px")}>Best time to learn: 7–8 AM</span><div style={css("height:8px;width:70%;background:var(--color-neutral-400)")}></div><span style={css("font-size:14px")}>Retention by skill · 30-day forecast</span><div style={css("height:8px;width:45%;background:var(--color-neutral-400)")}></div></div>
                <span style={css("font-size:13px;color:var(--color-neutral-800)")}>See when you learn best and where you&apos;re slipping.</span>
              </button>
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {v.s.achievements && (
            <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:56px 20px 108px;display:flex;flex-direction:column;gap:22px")}>
              <button onClick={v.goProgress} style={css("display:flex;align-items:center;gap:2px;border:none;background:none;color:var(--color-text);font-weight:600;font-size:15px;cursor:pointer;padding:0;align-self:flex-start")}><Svg d={i.chevL} size={20} />Progress</button>
              <div style={css("display:flex;flex-direction:column;gap:6px")}><div style={css("font-family:var(--font-heading);font-weight:800;font-size:40px;line-height:1;letter-spacing:-0.03em")}>Achievements</div><span style={css("font-size:14px;color:var(--color-neutral-700)")}>6 of 10 earned</span></div>
              <div style={css("background:var(--color-accent);color:var(--color-bg);padding:18px;display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:end")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:88px;line-height:0.8;letter-spacing:-0.05em")}>7</span><div style={css("display:flex;flex-direction:column;gap:3px")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase")}>Latest · 22 Sep</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:20px;line-height:1.1")}>7-day streak</span></div></div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;border-top:2px solid var(--color-divider);border-left:1px solid var(--color-divider)")}>
                {v.achievements.map((a: any, ai: number) => (
                  <div key={ai} style={css("padding:14px;border-right:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider);display:flex;flex-direction:column;gap:14px;min-height:150px")}>
                    <div style={css(`width:52px;height:52px;background:${a.bg};border:2px solid ${a.bd};color:${a.fg};display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:800;font-size:17px`)}>{a.mark}</div>
                    <div style={css("display:flex;flex-direction:column;gap:2px;flex:1")}><span style={css(`font-weight:600;font-size:14px;color:${a.tfg}`)}>{a.name}</span><span style={css("font-size:12px;color:var(--color-neutral-700)")}>{a.meta}</span></div>
                    {a.locked && (<div style={css("height:4px;background:var(--color-neutral-300)")}><div style={css(`height:100%;width:${a.w};background:var(--color-accent)`)}></div></div>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {v.s.profile && (
            <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:58px 20px 108px;display:flex;flex-direction:column;gap:22px")}>
              <div onClick={onOpenAccount} style={css(`display:flex;align-items:center;gap:14px;${onOpenAccount ? "cursor:pointer" : ""}`)}><div style={css("width:64px;height:64px;flex:none;background:var(--color-accent-100);color:var(--color-accent-800);display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:800;font-size:22px")}>{profileInitials}</div><div style={css("flex:1;display:flex;flex-direction:column;gap:2px;min-width:0")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:26px;line-height:1")}>{profileName}</span><span style={css("font-size:13px;color:var(--color-neutral-700)")}>Learning since June 2026 · Free plan</span></div>{onOpenAccount && (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css("flex:none")}><path d={i.chevR}></path></svg>)}</div>
              <button onClick={v.goPaywall} style={css("display:flex;justify-content:space-between;align-items:center;padding:16px;background:var(--color-text);color:var(--color-bg);border:none;text-align:left;cursor:pointer")}><span style={css("display:flex;flex-direction:column;gap:3px")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:17px")}>Try Pro free for 7 days</span><span style={css("font-size:13px;opacity:0.75")}>AI roadmaps, unlimited skills, insights.</span></span><Svg d={i.arrow} size={20} sw={2.2} /></button>
              {v.settings.map((g: any, gi: number) => (
                <div key={gi} style={css("display:flex;flex-direction:column")}>
                  <span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-700);padding-bottom:6px;border-bottom:2px solid var(--color-divider)")}>{g.name}</span>
                  {g.rows.map((r: any, ri: number) => (
                    <div key={ri} onClick={r.go} style={css("display:flex;align-items:center;gap:12px;min-height:52px;border-bottom:1px solid var(--color-divider);cursor:pointer")}>
                      <span style={css(`flex:1;font-size:15px;color:${r.fg}`)}>{r.label}</span>
                      {r.pro && (<span style={css("font-size:11px;font-weight:600;padding:3px 8px;background:var(--color-accent-100);color:var(--color-accent-800)")}>Pro</span>)}
                      {r.isValue && (<><span style={css("font-size:14px;color:var(--color-neutral-700)")}>{r.value}</span><Svg d={i.chevR} size={16} stroke="var(--color-neutral-600)" /></>)}
                      {r.isToggle && (<button onClick={r.toggle} style={css(`width:44px;height:24px;border:none;padding:2px;background:${r.trackBg};display:flex;justify-content:${r.justify};cursor:pointer`)}><div style={css("width:20px;height:20px;background:var(--color-bg)")}></div></button>)}
                      {r.isTheme && (<div style={css("display:flex;border:1px solid var(--color-divider)")}>{v.themeOpts.map((o: any, oi: number) => (<button key={oi} onClick={o.pick} style={css(`height:30px;padding:0 10px;border:none;background:${o.bg};color:${o.fg};font-size:12px;font-weight:600;cursor:pointer`)}>{o.label}</button>))}</div>)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* PAYWALL */}
          {v.s.paywall && (
            <>
              <div className="no-scrollbar" style={css("position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;padding:56px 20px 200px;display:flex;flex-direction:column;gap:22px")}>
                <div style={css("display:flex;justify-content:space-between;align-items:center")}><span style={css("display:flex;align-items:center;gap:8px;font-family:var(--font-heading);font-weight:800;font-size:14px")}><div style={css("width:12px;height:12px;background:var(--color-accent)")}></div>Skill Tracker Pro</span><button onClick={v.goBack} style={css("width:36px;height:36px;border:1px solid var(--color-divider);background:transparent;color:var(--color-text);display:flex;align-items:center;justify-content:center;cursor:pointer")}><Svg d={i.x} /></button></div>
                <div style={css("font-family:var(--font-heading);font-weight:800;font-size:40px;line-height:1;letter-spacing:-0.03em")}>A plan that adjusts to you.</div>
                <div style={css("display:flex;flex-direction:column;border-top:2px solid var(--color-divider)")}>
                  {v.proFeatures.map((f: any, fi: number) => (<div key={fi} style={css("display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--color-divider)")}><Svg d={i.check} stroke="var(--color-accent)" sw={2.6} style={css("flex:none;margin-top:2px")} /><span style={css("display:flex;flex-direction:column;gap:1px")}><span style={css("font-weight:600;font-size:15px")}>{f.t}</span><span style={css("font-size:13px;color:var(--color-neutral-700)")}>{f.d}</span></span></div>))}
                </div>
              </div>
              <div style={css("position:absolute;left:0;right:0;bottom:0;padding:14px 20px 28px;background:var(--color-bg);border-top:2px solid var(--color-divider);display:flex;flex-direction:column;gap:10px")}>
                <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px")}>{v.plans.map((p: any, pi: number) => (<button key={pi} onClick={p.pick} style={css(`display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:10px 12px;border:2px solid ${p.bd};background:${p.bg};color:var(--color-text);text-align:left;cursor:pointer;position:relative`)}><span style={css("font-size:12px;font-weight:600;color:var(--color-neutral-700)")}>{p.name}</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:18px")}>{p.price}</span><span style={css(`font-size:12px;color:${p.subFg};font-weight:600`)}>{p.sub}</span></button>))}</div>
                <button onClick={v.goBack} className="hov-acc" style={css("display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 16px;background:var(--color-accent);color:var(--color-bg);border:none;font-family:var(--font-heading);font-weight:800;font-size:16px;cursor:pointer")}><span>Start 7-day free trial</span><Svg d={i.arrow} size={20} sw={2.2} /></button>
                <span style={css("font-size:12px;color:var(--color-neutral-700)")}>{v.planNote}</span>
              </div>
            </>
          )}

          {/* TOAST */}
          {v.hasToast && (
            <div style={css("position:absolute;left:12px;right:12px;bottom:96px;z-index:8;background:var(--color-text);color:var(--color-bg);padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow-lg)")}><div style={css("width:28px;height:28px;background:var(--color-accent);display:flex;align-items:center;justify-content:center;flex:none")}><Svg d={i.flame} size={16} sw={2.2} /></div><span style={css("flex:1;display:flex;flex-direction:column")}><span style={css("font-weight:600;font-size:14px")}>{v.toast.title}</span><span style={css("font-size:12px;opacity:0.75")}>{v.toast.sub}</span></span><button onClick={v.undo} style={css("border:none;background:none;color:var(--color-accent-400);font-weight:600;font-size:13px;cursor:pointer")}>Undo</button></div>
          )}

          {/* TAB BAR */}
          {v.showTabs && (
            <div style={css("position:absolute;left:0;right:0;bottom:0;height:84px;z-index:6;background:var(--color-bg);border-top:2px solid var(--color-divider);display:grid;grid-template-columns:repeat(5,1fr);padding:0 4px")}>
              {v.tabs.map((t: any, ti: number) => (<button key={ti} onClick={t.go} style={css(`display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:0 10px;padding-top:10px;border:none;border-top:3px solid ${t.bar};margin-top:-2px;background:transparent;color:${t.fg};cursor:pointer`)}><Svg d={t.d} size={22} /><span style={css(`font-size:11px;font-weight:${t.fw}`)}>{t.label}</span></button>))}
            </div>
          )}

          {/* LOG SHEET */}
          {v.hasSheet && (
            <>
              <div onClick={v.closeSheet} style={css("position:absolute;inset:0;z-index:9;background:color-mix(in srgb, var(--color-neutral-900) 50%, transparent)")}></div>
              <div style={css("position:absolute;left:0;right:0;bottom:0;z-index:10;background:var(--color-bg);border-top:3px solid var(--color-accent);padding:18px 20px 32px;display:flex;flex-direction:column;gap:18px;box-shadow:var(--shadow-lg)")}>
                <div style={css("display:flex;justify-content:space-between;align-items:flex-start;gap:12px")}><div style={css("display:flex;flex-direction:column;gap:4px")}><span style={css("font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-accent-700)")}>Log progress · {v.sheet.skill}</span><span style={css("font-family:var(--font-heading);font-weight:800;font-size:22px;line-height:1.1")}>{v.sheet.title}</span></div><button onClick={v.closeSheet} style={css("width:36px;height:36px;flex:none;border:1px solid var(--color-divider);background:transparent;color:var(--color-text);display:flex;align-items:center;justify-content:center;cursor:pointer")}><Svg d={i.x} /></button></div>
                <div style={css("display:grid;grid-template-columns:52px 1fr 52px;border-top:2px solid var(--color-divider);border-bottom:2px solid var(--color-divider)")}><button onClick={v.minDown} style={css("height:80px;border:none;border-right:1px solid var(--color-divider);background:transparent;color:var(--color-text);font-size:26px;cursor:pointer")}>−</button><div style={css("display:flex;align-items:baseline;gap:6px;padding:0 16px;align-self:center")}><span style={css("font-family:var(--font-heading);font-weight:800;font-size:52px;line-height:1;letter-spacing:-0.03em")}>{v.logMins}</span><span style={css("font-size:15px;font-weight:600;color:var(--color-neutral-700)")}>min</span></div><button onClick={v.minUp} style={css("height:80px;border:none;border-left:1px solid var(--color-divider);background:transparent;color:var(--color-text);font-size:26px;cursor:pointer")}>+</button></div>
                <div style={css("display:grid;grid-template-columns:repeat(5,1fr);gap:6px")}>{v.minChips.map((c: any, ci: number) => (<button key={ci} onClick={c.pick} style={css(`height:38px;border:1px solid ${c.bd};background:${c.bg};color:${c.fg};font-weight:600;font-size:13px;cursor:pointer;text-align:left;padding:0 10px`)}>{c.m}</button>))}</div>
                {v.sheet.hasTask && (<button onClick={v.toggleSheetComplete} style={css("display:flex;align-items:center;gap:12px;border:none;background:transparent;color:var(--color-text);padding:0;cursor:pointer;text-align:left")}><div style={css(`width:24px;height:24px;flex:none;border:2px solid ${v.sheet.boxBd};background:${v.sheet.boxBg};color:var(--color-bg);display:flex;align-items:center;justify-content:center`)}><Svg d={v.sheet.check} size={14} sw={3} /></div><span style={css("font-size:15px;font-weight:600")}>Mark task complete</span></button>)}
                <Input className={fieldReset} placeholder="Add a note (optional)" style={css("height:46px;padding:0 12px;font-size:15px;background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-divider)")} />
                <button onClick={v.saveLog} className="hov-acc" style={css("display:flex;align-items:center;justify-content:space-between;height:54px;padding:0 16px;background:var(--color-accent);color:var(--color-bg);border:none;font-family:var(--font-heading);font-weight:800;font-size:16px;cursor:pointer")}><span>Save · {v.logMins} min</span><Svg d={i.check} size={20} sw={2.4} /></button>
              </div>
            </>
          )}

          <div style={css("position:absolute;bottom:8px;left:50%;margin-left:-67px;width:134px;height:5px;border-radius:3px;background:var(--color-text);z-index:11;opacity:0.9")}></div>
    </>
  );

  // SHOWCASE: sidebar screen-list + a phone mockup frame.
  if (mode === "showcase") {
    return (
      <div className="modernist" style={css("min-height:100vh;display:flex;flex-wrap:wrap;gap:48px;padding:40px;align-items:flex-start;justify-content:center")}>
        {sidebar}
        <div style={css("width:410px;height:864px;flex:none;border-radius:54px;background:#0e0e0f;padding:10px;box-shadow:var(--shadow-lg)")}>
          <div data-phone="1" data-screen-label={v.screenLabel} className={dark ? "phone-dark" : undefined} style={css("width:390px;height:844px;border-radius:44px;overflow:hidden;position:relative;background:var(--color-bg);color:var(--color-text);font-family:var(--font-body)")}>
            {screens}
          </div>
        </div>
      </div>
    );
  }

  // APP: full-bleed, phone-sized column centred on larger screens. Installable PWA.
  return (
    <div className="modernist" style={css("width:100%;min-height:100dvh;display:flex;justify-content:center;background:var(--color-neutral-300)")}>
      <div data-phone="1" className={dark ? "phone-dark" : undefined} style={css("position:relative;flex:none;width:min(100vw,430px);height:100dvh;overflow:hidden;background:var(--color-bg);color:var(--color-text);font-family:var(--font-body)")}>
        {screens}
      </div>
    </div>
  );
}
