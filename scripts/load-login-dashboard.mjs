/**
 * Carga mínima login + dashboard (Fase 4) sin k6.
 * Un usuario de prueba: logins en serie (evita pelea en tabla Tokens) y
 * dashboards concurrentes reutilizando una sesión.
 *
 *   npm run load:login-dashboard
 *
 * Variables: API_URL, SMOKE_NIT, SMOKE_PASSWORD (env o .env.local)
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const API_URL = (process.env.API_URL ?? 'http://localhost:4000').replace(
  /\/+$/,
  '',
);
const NIT = process.env.SMOKE_NIT;
const PASSWORD = process.env.SMOKE_PASSWORD;
const LOGIN_SAMPLES = Number(process.env.LOAD_LOGIN_SAMPLES ?? 15);
const DASH_CONCURRENCY = Number(process.env.LOAD_DASH_CONCURRENCY ?? 30);

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.ceil((p / 100) * sorted.length) - 1,
  );
  return sorted[Math.max(0, idx)];
}

function report(name, samplesMs, budgetMs) {
  const sorted = [...samplesMs].sort((a, b) => a - b);
  const p95 = percentile(sorted, 95);
  const avg = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length);
  const ok = p95 <= budgetMs;
  console.log(
    `${ok ? 'OK' : 'WARN'} ${name}: n=${sorted.length} avg=${avg}ms p95=${p95}ms (presupuesto ${budgetMs}ms)`,
  );
  return ok;
}

function cookieHeaderFrom(res) {
  const setCookie = res.headers.getSetCookie?.() ?? [];
  return setCookie
    .map((c) => c.split(';')[0])
    .filter(Boolean)
    .join('; ');
}

async function loginOnce() {
  const started = Date.now();
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nit_usuario: Number(NIT),
      password: PASSWORD,
      remember: false,
    }),
  });
  const ms = Date.now() - started;
  if (!res.ok) {
    throw new Error(`login HTTP ${res.status}`);
  }
  return { ms, cookie: cookieHeaderFrom(res) };
}

async function getDashboard(cookie) {
  const started = Date.now();
  const res = await fetch(`${API_URL}/dashboard`, {
    headers: { Cookie: cookie },
  });
  const ms = Date.now() - started;
  if (!res.ok) {
    throw new Error(`dashboard HTTP ${res.status}`);
  }
  return ms;
}

async function main() {
  if (!NIT || !PASSWORD) {
    console.log(
      'SKIP: defina SMOKE_NIT y SMOKE_PASSWORD para la prueba de carga.',
    );
    process.exit(0);
  }

  try {
    await fetch(`${API_URL}/health`);
  } catch (err) {
    console.log(
      `SKIP: API no responde en ${API_URL} (${err instanceof Error ? err.message : err}).`,
    );
    process.exit(0);
  }

  const loginSamples = [];
  for (let i = 0; i < LOGIN_SAMPLES; i++) {
    const { ms } = await loginOnce();
    loginSamples.push(ms);
  }
  const loginOk = report('POST /auth/login', loginSamples, 1500);

  const { cookie } = await loginOnce();
  const dashSamples = await Promise.all(
    Array.from({ length: DASH_CONCURRENCY }, () => getDashboard(cookie)),
  );
  const dashOk = report('GET /dashboard concurrente', dashSamples, 1500);

  if (!loginOk || !dashOk) {
    process.exit(1);
  }
  console.log(
    `OK carga mínima (${LOGIN_SAMPLES} logins serie + ${DASH_CONCURRENCY} dashboards en paralelo)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
