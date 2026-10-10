import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, tokenStore } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User) => void;
}

const Ctx = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return v;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!tokenStore.get());

  useEffect(() => {
    if (!tokenStore.get()) return;
    const ctrl = new AbortController();
    api.me(ctrl.signal)
      .then((r) => setUser(r.user))
      .catch((e: unknown) => {
        // Token ditolak server -> hapus. Gangguan jaringan -> biarkan token, user tetap dianggap belum login.
        if (e instanceof ApiError && e.status === 401) tokenStore.clear();
      })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.login({ email, password });
    tokenStore.set(r.token);
    setUser(r.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const r = await api.register({ email, password, ...(name ? { name } : {}) });
    tokenStore.set(r.token);
    setUser(r.user);
  }, []);

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
