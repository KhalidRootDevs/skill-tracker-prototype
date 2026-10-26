// Data + constants ported 1:1 from the original Skill Tracker prototype.
/* eslint-disable @typescript-eslint/no-explicit-any */

export const I: Record<string, string> = {
  house:
    "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8 M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  layers:
    "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12 M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
  calCheck:
    "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M9 16l2 2 4-4",
  chart: "M3 3v16a2 2 0 0 0 2 2h16 M18 17V9 M13 17V5 M8 17v-3",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
  flame:
    "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  check: "M20 6 9 17l-5-5",
  plus: "M5 12h14 M12 5v14",
  chevR: "m9 18 6-6-6-6",
  chevL: "m15 18-6-6 6-6",
  x: "M18 6 6 18 M6 6l12 12",
  arrow: "M5 12h14 M12 5l7 7-7 7",
  clock: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z M12 6v6l4 2",
  sparkles:
    "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  lock: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M7 11V7a5 5 0 0 1 10 0v4",
  award:
    "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526 M18 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0z",
  wifiOff:
    "M12 20h.01 M8.5 16.429a5 5 0 0 1 7 0 M5 12.859a10 10 0 0 1 5.17-2.69 M19 12.859a10 10 0 0 0-2.007-1.523 M2 8.82a15 15 0 0 1 4.177-2.643 M22 8.82a15 15 0 0 0-11.288-3.764 M2 2l20 20",
  search: "m21 21-4.34-4.34 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z",
  book:
    "M12 7v14 M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
  refresh:
    "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16 M8 16H3v5",
};

export const TASKS: any[] = [
  { id: "t3", title: "Build a custom useFetch hook", skill: "React", mins: 25, pri: "High", ctx: "Milestone 4 of 7 · Custom hooks" },
  { id: "t1", title: "Read: useReducer patterns", skill: "React", mins: 15, pri: "Medium", ctx: "Milestone 4 of 7 · Custom hooks" },
  { id: "t2", title: "Vocabulary review — 40 cards", skill: "Spanish", mins: 10, pri: "Medium", ctx: "B1 → B2 · Subjunctive mood" },
  { id: "t4", title: "Generics exercises 3–5", skill: "TypeScript", mins: 20, pri: "Low", ctx: "Fundamentals · Generics & constraints" },
];

export const SK: any[] = [
  {
    id: "react", name: "React", mono: "Re", cat: "Development", level: "Intermediate", target: "Advanced", pct: 62, streak: 12, hours: 38, next: "Custom hooks", status: "active", since: "Started 2 Jun · 3 h / week",
    ms: ["JSX & components", "State and props", "Effects & lifecycle", "Custom hooks", "Context & reducers", "Performance", "Testing with RTL"],
    res: [{ t: "react.dev — Hooks reference", k: "Docs" }, { t: "Advanced React Patterns", k: "Course" }, { t: "useFetch from scratch", k: "Video" }],
    note: "Cleanup functions run before the next effect, not just on unmount. Write the abort logic first.",
    act: [{ d: "Today", t: "useReducer patterns", m: "15m" }, { d: "Mon", t: "Custom hooks intro", m: "30m" }, { d: "Sun", t: "Refactor todo app", m: "45m" }, { d: "Sat", t: "Effects deep dive", m: "25m" }],
  },
  {
    id: "ts", name: "TypeScript", mono: "Ts", cat: "Development", level: "Fundamentals", target: "Advanced", pct: 48, streak: 9, hours: 21, next: "Generics & constraints", status: "active", since: "Started 14 Jul · 2 h / week",
    ms: ["Types & inference", "Unions & narrowing", "Generics & constraints", "Utility types", "Declaration files", "Advanced patterns"],
    res: [{ t: "TypeScript Handbook", k: "Docs" }, { t: "Type Challenges", k: "Practice" }], note: "Narrow first, assert never. If I reach for `as`, the type is wrong upstream.",
    act: [{ d: "Mon", t: "Discriminated unions", m: "20m" }, { d: "Sun", t: "Narrowing drills", m: "20m" }],
  },
  {
    id: "ux", name: "UI/UX Design", mono: "Ux", cat: "Design", level: "Intermediate", target: "Advanced", pct: 71, streak: 4, hours: 44, next: "Design systems audit", status: "active", since: "Started 3 Apr · 2 h / week",
    ms: ["Visual hierarchy", "Layout & grids", "Typography", "Interaction patterns", "Design systems audit", "Usability testing"],
    res: [{ t: "Refactoring UI", k: "Book" }, { t: "Grid systems primer", k: "Article" }], note: "Every screen should have one obvious next action. Check with a squint test.",
    act: [{ d: "Fri", t: "Type scale study", m: "40m" }, { d: "Wed", t: "Grid exercise", m: "30m" }],
  },
  {
    id: "es", name: "Spanish", mono: "Es", cat: "Language", level: "B1", target: "B2", pct: 55, streak: 12, hours: 57, next: "Subjunctive mood", status: "active", since: "Started 10 Jan · 4 h / week",
    ms: ["Present & past", "Imperfect vs preterite", "Future & conditional", "Subjunctive mood", "Conversation practice", "B2 mock exam"],
    res: [{ t: "Anki deck — 2,000 words", k: "Cards" }, { t: "Weekly tutor session", k: "Live" }], note: "Subjunctive after emotions and wishes: Espero que vengas.",
    act: [{ d: "Mon", t: "Vocabulary review", m: "10m" }, { d: "Sun", t: "Tutor session", m: "45m" }],
  },
  {
    id: "py", name: "Python", mono: "Py", cat: "Development", level: "Beginner", target: "Intermediate", pct: 34, streak: 0, hours: 12, next: "Functions & modules", status: "active", since: "Started 20 Aug · 1 h / week",
    ms: ["Syntax & types", "Control flow", "Functions & modules", "Files & data", "Small scripts project"],
    res: [{ t: "Automate the Boring Stuff", k: "Book" }], note: "List comprehensions read left to right: output, loop, filter.",
    act: [{ d: "18 Sep", t: "Control flow drills", m: "30m" }],
  },
  {
    id: "ps", name: "Public Speaking", mono: "Ps", cat: "Career", level: "Beginner", target: "Intermediate", pct: 22, streak: 2, hours: 6, next: "Record a 3-min talk", status: "active", since: "Started 1 Sep · 1 h / week",
    ms: ["Structure a talk", "Record a 3-min talk", "Pacing & pauses", "Handle Q&A", "Give a team talk"],
    res: [{ t: "Talk structure template", k: "Guide" }], note: "Pause instead of filler. Silence feels longer to me than to them.",
    act: [{ d: "Sun", t: "Outline first talk", m: "20m" }],
  },
  {
    id: "git", name: "Git & GitHub", mono: "Gt", cat: "Development", level: "Advanced", target: "Advanced", pct: 100, streak: 0, hours: 32, next: "", status: "completed", since: "2 Jun – 14 Aug · 3 h / week",
    ms: ["Commits & branches", "Merging & rebasing", "Pull requests", "Resolving conflicts", "Advanced history"],
    res: [{ t: "Pro Git", k: "Book" }], note: "Rebase local work, merge shared work.", act: [{ d: "14 Aug", t: "Interactive rebase", m: "40m" }],
  },
  { id: "ph", name: "Photography", mono: "Ph", cat: "Creative", level: "New", target: "Intermediate", pct: 0, streak: 0, hours: 0, next: "Starts 1 Nov", status: "planned", since: "Planned · 1 h / week", ms: ["Exposure triangle", "Composition", "Light"], res: [], note: "Start after the Spanish exam.", act: [] },
  { id: "jp", name: "Japanese", mono: "Ja", cat: "Language", level: "New", target: "N5", pct: 0, streak: 0, hours: 0, next: "Starts Jan 2027", status: "planned", since: "Planned · 2 h / week", ms: ["Hiragana", "Katakana", "Basic grammar"], res: [], note: "Hiragana first, two weeks max.", act: [] },
];

export const ROAD: any[] = [
  { name: "Beginner", short: "Begin", tasks: ["JSX & components", "Props and composition", "Rendering lists"] },
  { name: "Fundamentals", short: "Fund.", tasks: ["State with useState", "Effects & cleanup", "Forms and controlled inputs"] },
  { name: "Intermediate", short: "Inter.", tasks: ["Custom hooks", "useReducer patterns", "Context without prop drilling", "Build a custom useFetch hook", "Error boundaries"] },
  { name: "Advanced", short: "Adv.", tasks: ["Memoization & profiling", "Suspense and data loading", "Testing with RTL"] },
  { name: "Mastery", short: "Mastery", tasks: ["Ship a production app", "Teach a concept", "Contribute to open source"] },
];

export const SCREENS: any[] = [
  { name: "Onboarding", items: [["ob1", "Welcome"], ["ob2", "Interests"], ["ob3", "Goals"], ["ob4", "Weekly time"], ["ob5", "Experience"], ["ob6", "Motivation"], ["ob7", "Plan ready"]] },
  { name: "App", items: [["home", "Home"], ["today", "Today"], ["log", "Log progress"], ["sessionDone", "Session logged"], ["skills", "Skills"], ["skill", "Skill detail"], ["roadmap", "Roadmap"], ["create", "Create skill"], ["progress", "Progress"], ["achievements", "Achievements"], ["profile", "Profile"], ["paywall", "Pro paywall"]] },
  { name: "States", items: [["loading", "Loading"], ["error", "Offline / error"], ["emptySkills", "Empty skills"], ["todayDone", "Day complete"], ["skillComplete", "Skill completed"]] },
];

export const LABELS: Record<string, string> = {};
let _n = 0;
SCREENS.forEach((g: any) => g.items.forEach(([k, l]: any) => { _n++; LABELS[k] = String(_n).padStart(2, "0") + " " + l; }));

export const TABS: any[] = [["home", "Home", "house"], ["skills", "Skills", "layers"], ["today", "Today", "calCheck"], ["progress", "Progress", "chart"], ["profile", "Profile", "user"]];
export const TAB_OF: Record<string, string> = { home: "home", loading: "home", error: "home", skills: "skills", skill: "skills", roadmap: "skills", emptySkills: "skills", today: "today", progress: "progress", achievements: "progress", profile: "profile" };
export const OB = ["ob1", "ob2", "ob3", "ob4", "ob5", "ob6", "ob7"];

export const A = "var(--color-accent)";
export const INK = "var(--color-text)";
export const BG = "var(--color-bg)";
export const DIV = "var(--color-divider)";

export const initialState: any = {
  screen: "home", jump: null, theme: null, prev: "home",
  interests: { React: true, TypeScript: true, Spanish: true }, goals: { "Build a real project": true, "Get job-ready": true },
  weekly: "3–5 h", days: { M: 1, T: 1, W: 1, Th: 1, F: 1 }, levels: { React: "Some", TypeScript: "New", Spanish: "Some" }, motive: "Career move",
  done: {}, mins: {}, extra: 0, drag: null, sheet: null, logMins: 25, sheetComplete: true, lastLog: { skill: "React", mins: 25 },
  streak: 12, counted: false, toast: null, skillFilter: "active", curSkill: "react", openStage: 2, plan: "annual", range: "week", reflect: null,
  cName: "Python", cCat: "Development", cExp: "Beginner", cTgt: "Intermediate", cWeekly: 3,
  cMs: ["Syntax & data types", "Control flow", "Functions & modules", "Build a CLI tool"], toggles: { daily: true, streak: true, weekly: false },
};
