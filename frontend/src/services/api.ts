import type {
  AuthResult, Category, ChangelogEntry, Dashboard, DocsPayload, FeedbackItem, KeyRecord, LeaderRow, LogItem,
  PlansPayload, StatsPayload, Tool, User,
} from '../types';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';
const TOKEN_KEY = 'sakuraapis_token';

export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t: string) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* storage diblokir */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage diblokir */ } },
};

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), 15_000);
  signal?.addEventListener('abort', () => timeout.abort());
  const token = tokenStore.get();
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
      signal: timeout.signal,
    });
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* body bukan JSON */ }
    if (!res.ok) {
      throw new ApiError(res.status, json?.error?.code ?? 'HTTP_ERROR', json?.error?.message ?? `Permintaan gagal (${res.status}).`, json?.error?.details);
    }
    return json as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if ((e as Error).name === 'AbortError') throw new ApiError(0, 'ABORTED', 'Permintaan dibatalkan atau melebihi batas waktu.');
    throw new ApiError(0, 'NETWORK', 'Tidak dapat terhubung ke server API.');
  } finally {
    clearTimeout(timer);
  }
}

const post = <T>(path: string, body: unknown, method = 'POST') => request<T>(path, { method, body: JSON.stringify(body) });

export const api = {
  // publik
  health: (s?: AbortSignal) => request<{ status: string; uptimeSeconds: number; time: string }>('/health', {}, s),
  tools: (s?: AbortSignal) => request<{ total: number; tools: Tool[] }>('/tools', {}, s),
  categories: (s?: AbortSignal) => request<{ categories: Category[] }>('/categories', {}, s),
  stats: (s?: AbortSignal) => request<StatsPayload>('/stats', {}, s),
  changelog: (s?: AbortSignal) => request<{ changelog: ChangelogEntry[] }>('/changelog', {}, s),
  plans: (s?: AbortSignal) => request<PlansPayload>('/plans', {}, s),
  docs: (s?: AbortSignal) => request<DocsPayload>('/docs', {}, s),
  leaderboard: (s?: AbortSignal) => request<{ leaderboard: LeaderRow[] }>('/leaderboard', {}, s),
  // akun
  register: (b: { email: string; password: string; name?: string }) => post<AuthResult>('/auth/register', b),
  login: (b: { email: string; password: string }) => post<AuthResult>('/auth/login', b),
  me: (s?: AbortSignal) => request<{ user: User }>('/auth/me', {}, s),
  updateMe: (name: string) => post<{ user: User }>('/me', { name }, 'PATCH'),
  changePassword: (current: string, next: string) => post<{ ok: true }>('/me/password', { current, next }),
  dashboard: (s?: AbortSignal) => request<Dashboard>('/me/dashboard', {}, s),
  logs: (page: number, s?: AbortSignal) => request<{ total: number; page: number; pageSize: number; items: LogItem[]; retention: string }>(`/me/logs?page=${page}`, {}, s),
  // API key
  keys: (s?: AbortSignal) => request<{ keys: KeyRecord[]; maxKeys: number }>('/keys', {}, s),
  createKey: (label: string) => post<{ key: string; record: KeyRecord }>('/keys', { label }),
  revokeKey: (id: string) => request<{ key: KeyRecord }>(`/keys/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  // feedback
  feedback: (s?: AbortSignal) => request<{ feedback: FeedbackItem[] }>('/feedback', {}, s),
  sendFeedback: (message: string, rating?: number) => post<{ feedback: FeedbackItem }>('/feedback', { message, ...(rating ? { rating } : {}) }),
};
