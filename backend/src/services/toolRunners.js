import { createHash, randomUUID, randomInt } from 'node:crypto';
import { AppError } from './errors.js';

const words = (s) => s.match(/[\p{L}\p{N}]+/gu) ?? [];

const caseModes = {
  upper: (s) => s.toUpperCase(),
  lower: (s) => s.toLowerCase(),
  title: (s) => s.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, a, b) => a + b.toUpperCase()),
  camel: (s) => {
    const w = words(s.toLowerCase());
    return w.map((x, i) => (i === 0 ? x : x[0].toUpperCase() + x.slice(1))).join('');
  },
  snake: (s) => words(s.toLowerCase()).join('_'),
  kebab: (s) => words(s.toLowerCase()).join('-'),
};

export const runners = {
  base64({ mode, text }) {
    if (mode === 'encode') return { output: Buffer.from(text, 'utf8').toString('base64') };
    const clean = text.replace(/\s+/g, '');
    if (!/^[A-Za-z0-9+/_-]*={0,2}$/.test(clean) || clean.length % 4 === 1) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Input bukan Base64 yang valid.');
    }
    return { output: Buffer.from(clean.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8') };
  },

  hash({ algorithm, text }) {
    return { algorithm, output: createHash(algorithm).update(text, 'utf8').digest('hex') };
  },

  'json-formatter'({ mode, text }) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new AppError(400, 'VALIDATION_ERROR', `JSON tidak valid: ${e.message}`);
    }
    return { output: mode === 'minify' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2) };
  },

  uuid({ count }) {
    const list = Array.from({ length: count }, () => randomUUID());
    return { output: list.join('\n'), items: list };
  },

  'url-codec'({ mode, text }) {
    try {
      return { output: mode === 'encode' ? encodeURIComponent(text) : decodeURIComponent(text) };
    } catch {
      throw new AppError(400, 'VALIDATION_ERROR', 'Teks mengandung urutan percent-encoding yang tidak valid.');
    }
  },

  slugify({ text }) {
    const output = text
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return { output };
  },

  'text-stats'({ text }) {
    const w = words(text);
    const sentences = (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).filter((s) => s.trim()).length;
    const stats = {
      characters: [...text].length,
      charactersNoSpaces: [...text.replace(/\s/g, '')].length,
      words: w.length,
      sentences,
      lines: text.split(/\r\n|\r|\n/).length,
      readingTimeMinutes: Math.max(1, Math.round(w.length / 200)),
    };
    return { output: JSON.stringify(stats, null, 2), stats };
  },

  'case-converter'({ mode, text }) {
    return { output: caseModes[mode](text) };
  },

  'password-generator'({ length, symbols }) {
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const syms = '!@#$%^&*()-_=+[]{}?';
    const sets = [lower, upper, digits, ...(symbols === 'yes' ? [syms] : [])];
    const all = sets.join('');
    const chars = sets.map((s) => s[randomInt(s.length)]);
    while (chars.length < length) chars.push(all[randomInt(all.length)]);
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return { output: chars.join('') };
  },
};
