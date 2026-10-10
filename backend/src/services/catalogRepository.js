import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { env } from '../config/env.js';

// Adapter data: saat ini membaca shared/catalog.json.
// Untuk pindah ke database, cukup implementasikan ulang fungsi di file ini.
const here = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = process.env.CATALOG_PATH || path.resolve(here, '../../../shared/catalog.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));

function statusOf(tool) {
  if (env.maintenanceTools.includes(tool.slug)) return 'maintenance';
  if (!tool.implemented) return 'not_configured';
  if (tool.requires && !env.integrations[tool.requires]) return 'not_configured';
  return 'active';
}

const withStatus = (t) => ({ ...t, status: statusOf(t) });

export const catalogRepository = {
  categories: () => catalog.categories,
  tools: () => catalog.tools.map(withStatus),
  tool: (slug) => {
    const t = catalog.tools.find((x) => x.slug === slug);
    return t ? withStatus(t) : null;
  },
  docs: () => catalog.docs,
  faq: () => catalog.faq,
  changelog: () => catalog.changelog ?? [],
  plans: () => catalog.plans ?? [],
  plansNote: () => catalog.plansNote ?? '',
};
