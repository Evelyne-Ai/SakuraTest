import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getDb, save } from './store.js';
import { hashPassword, verifyPassword } from './auth.js';
import { AppError } from './errors.js';
import { env } from '../config/env.js';
import { planOf } from './plans.js';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email tidak valid').max(120),
  password: z.string().min(8, 'Password minimal 8 karakter').max(128),
  name: z.string().trim().max(40).optional(),
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(1).max(128),
}).strict();

export const profileSchema = z.object({ name: z.string().trim().min(1).max(40) }).strict();

export const passwordSchema = z.object({
  current: z.string().min(1).max(128),
  next: z.string().min(8, 'Password baru minimal 8 karakter').max(128),
}).strict();

const defaultName = (email) => email.split('@')[0].slice(0, 40);

export const publicUser = (u) => {
  const plan = planOf(u.plan);
  return { id: u.id, email: u.email, name: u.name, role: u.role, plan: plan.id, planName: plan.name, createdAt: u.createdAt };
};

export const findById = (id) => getDb().users.find((u) => u.id === id) ?? null;
export const findByEmail = (email) => getDb().users.find((u) => u.email === email) ?? null;

export async function register({ email, password, name }) {
  if (findByEmail(email)) throw new AppError(409, 'EMAIL_TAKEN', 'Email sudah terdaftar.');
  const user = {
    id: randomUUID(), email, name: name || defaultName(email), passwordHash: await hashPassword(password),
    role: env.adminEmails.includes(email) ? 'admin' : 'user', plan: 'free', createdAt: new Date().toISOString(),
    usage: { total: 0, errors: 0, daily: {}, hourly: {} },
  };
  getDb().users.push(user);
  save();
  return user;
}

// Hash tiruan agar waktu respons tidak membedakan email terdaftar vs tidak.
const DUMMY = 'aa'.repeat(16) + ':' + 'bb'.repeat(64);

export async function login({ email, password }) {
  const user = findByEmail(email);
  const ok = await verifyPassword(password, user ? user.passwordHash : DUMMY);
  if (!user || !ok) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email atau password salah.');
  return user;
}

export async function changePassword(user, { current, next }) {
  if (!(await verifyPassword(current, user.passwordHash))) throw new AppError(401, 'INVALID_CREDENTIALS', 'Password saat ini salah.');
  user.passwordHash = await hashPassword(next);
  save();
}

export function updateProfile(user, { name }) {
  user.name = name;
  save();
  return user;
}

export function setPlan(email, planId) {
  const user = findByEmail(email.toLowerCase());
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User tidak ditemukan.');
  user.plan = planOf(planId).id;
  save();
  return user;
}
