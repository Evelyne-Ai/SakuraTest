import { catalogRepository } from './catalogRepository.js';
import { env } from '../config/env.js';

// Limit dibaca dari katalog; dailyLimit null berarti memakai FREE_DAILY_LIMIT dari env.
export function allPlans() {
  return catalogRepository.plans().map((p) => ({ ...p, dailyLimit: p.dailyLimit ?? env.freeDailyLimit }));
}

export function planOf(id) {
  const plans = allPlans();
  return plans.find((p) => p.id === id) ?? plans.find((p) => p.id === 'free') ?? { id: 'free', name: 'Free', dailyLimit: env.freeDailyLimit, maxKeys: 3 };
}
