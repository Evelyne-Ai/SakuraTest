export type ToolStatus = 'active' | 'maintenance' | 'not_configured';

export interface ToolField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  options?: string[];
  default?: string | number;
  required?: boolean;
  min?: number;
  max?: number;
}

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: ToolStatus;
  requires?: string;
  fields: ToolField[];
}

export interface Category { id: string; name: string; description: string; toolCount?: number }
export interface DocSection { id: string; title: string; body: string }
export interface FaqItem { q: string; a: string }
export interface Endpoint { method: 'GET' | 'POST'; path: string; description: string; auth?: 'apikey' }
export interface DocsPayload { docs: DocSection[]; faq: FaqItem[]; endpoints: Endpoint[]; runnableTools: { slug: string; fields: ToolField[] }[] }
export interface ChangelogEntry { version: string; date: string; items: string[] }

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  dailyLimit: number;
  maxKeys: number;
  highlighted?: boolean;
}
export interface PlansPayload { plans: Plan[]; buyContactUrl: string | null; note: string }

export interface StatsPayload {
  since: string;
  uptimeSeconds: number;
  totalRequests: number;
  successRate: number | null;
  clientErrors: number;
  serverErrors: number;
  topEndpoints: { endpoint: string; count: number }[];
  recent: { method: string; route: string; status: number; ms: number; at: string }[];
  persistence: string;
  registeredUsers: number;
  activeKeys: number;
  keyedRequestsTotal: number;
  activeTools: number;
  categories: number;
}

export interface User { id: string; email: string; name: string; role: 'user' | 'admin'; plan: string; planName: string; createdAt: string }
export interface AuthResult { token: string; user: User }

export interface KeyRecord {
  id: string;
  label: string;
  prefix: string;
  last4: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  total: number;
}

export interface LogItem { id: number; keyPrefix: string; method: string; route: string; status: number; ms: number; at: string }

export interface Dashboard {
  totalEndpoints: number;
  categories: number;
  todayRequests: number;
  dailyLimit: number;
  monthlyRequests: number;
  totalRequests: number;
  successRate: number | null;
  avgLatencyMs: number | null;
  activeKeys: number;
  plan: { id: string; name: string };
  traffic: { hour: string; requests: number; errors: number }[];
  recent: LogItem[];
}

export interface LeaderRow { rank: number; name: string; plan: string; requests: number }
export interface FeedbackItem { id: number; message: string; rating: number | null; at: string }
