"use client";

// Mock auth — localStorage only, no backend. Swap the body of login/register/
// logout/update/remove for real API calls (NextAuth / Supabase / your API) later;
// the component contract stays the same.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type User = { name: string; email: string };
type Status = "loading" | "authed" | "guest";

type AuthContextValue = {
  status: Status;
  user: User | null;
  login: (email: string, password?: string) => void;
  register: (name: string, email: string, password?: string) => void;
  logout: () => void;
  update: (patch: Partial<User>) => void;
  remove: () => void;
};

const KEY = "st_auth_v1";
const AuthContext = createContext<AuthContextValue | null>(null);

function read(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function write(user: User | null) {
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    // localStorage is only readable after mount; hydrating auth state here is the
    // SSR-safe pattern (a lazy initializer would desync server vs client render).
    const u = read();
    /* eslint-disable react-hooks/set-state-in-effect */
    setUser(u);
    setStatus(u ? "authed" : "guest");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const login = useCallback((email: string) => {
    const u: User = { name: email.split("@")[0] || "Learner", email };
    setUser(u);
    setStatus("authed");
    write(u);
  }, []);

  const register = useCallback((name: string, email: string) => {
    const u: User = { name: name || email.split("@")[0] || "Learner", email };
    setUser(u);
    setStatus("authed");
    write(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStatus("guest");
    write(null);
  }, []);

  const update = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      const u: User = { name: "", email: "", ...(prev ?? {}), ...patch };
      write(u);
      return u;
    });
  }, []);

  const remove = useCallback(() => {
    setUser(null);
    setStatus("guest");
    write(null);
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout, update, remove }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function initials(name?: string | null): string {
  if (!name) return "ST";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const take = (parts.length >= 2 ? [parts[0], parts[parts.length - 1]] : parts).map((p) => p[0]);
  return (take.join("") || "ST").slice(0, 2).toUpperCase();
}
