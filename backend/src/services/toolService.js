import { z } from 'zod';
import { catalogRepository } from './catalogRepository.js';
import { runners } from './toolRunners.js';
import { AppError } from './errors.js';

function buildSchema(fields) {
  const shape = {};
  for (const f of fields) {
    let s;
    if (f.type === 'select') {
      s = z.enum(f.options);
    } else if (f.type === 'number') {
      s = z.coerce.number().int().min(f.min ?? 0).max(f.max ?? 1_000_000);
    } else {
      s = z.string().max(f.max ?? 10_000);
      if (f.required) s = s.min(1, 'Wajib diisi');
    }
    shape[f.name] = f.default !== undefined ? s.default(f.default) : s;
  }
  return z.object(shape).strict();
}

export function runTool(slug, body) {
  const tool = catalogRepository.tool(slug);
  if (!tool) throw new AppError(404, 'NOT_FOUND', 'Tool tidak ditemukan.');
  if (tool.status === 'maintenance') throw new AppError(503, 'MAINTENANCE', 'Tool sedang maintenance.');
  if (tool.status === 'not_configured') {
    throw new AppError(409, 'NOT_CONFIGURED', 'Tool belum dikonfigurasi di server ini.', { requires: tool.requires });
  }
  const parsed = buildSchema(tool.fields).safeParse(body ?? {});
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Input tidak valid.', parsed.error.flatten().fieldErrors);
  }
  const run = runners[slug];
  if (!run) throw new AppError(409, 'NOT_CONFIGURED', 'Runner belum tersedia.');
  return run(parsed.data);
}
