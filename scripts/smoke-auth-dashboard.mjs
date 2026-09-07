/**
 * Smoke de auth + dashboard + informe (Fase 4 del plan de producción).
 * Uso: node scripts/smoke-auth-dashboard.mjs
 *
 * Lee .env.local / .env. Variables:
 *   API_URL (default http://localhost:4000)
 *   SMOKE_NIT / SMOKE_PASSWORD — login, dashboard, PQR, estado taller, logout.
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

function budgetLine(name, ms, budgetMs) {
  const ok = ms <= budgetMs;
  console.log(
    `${ok ? 'OK' : 'WARN'} ${name}: ${ms}ms (presupuesto ${budgetMs}ms)`,
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

async function main() {
  const started = Date.now();
  let healthRes;
  try {
    healthRes = await fetch(`${API_URL}/health`);
  } catch (err) {
    console.log(
      `SKIP: API no responde en ${API_URL} (${err instanceof Error ? err.message : err}).`,
    );
    console.log(
      'Arranque el backend y vuelva a ejecutar, o use: npm run load:login-dashboard',
    );
    process.exit(0);
  }

  const healthMs = Date.now() - started;
  if (!healthRes.ok) {
    console.error(`FAIL /health HTTP ${healthRes.status}`);
    process.exit(1);
  }
  budgetLine('GET /health', healthMs, 600);

  const nit = process.env.SMOKE_NIT;
  const password = process.env.SMOKE_PASSWORD;
  if (!nit || !password) {
    console.log(
      'SKIP login/dashboard: defina SMOKE_NIT y SMOKE_PASSWORD (env o .env.local).',
    );
    process.exit(0);
  }

  const loginStarted = Date.now();
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nit_usuario: Number(nit),
      password,
      remember: false,
    }),
  });
  const loginMs = Date.now() - loginStarted;
  if (!loginRes.ok) {
    console.error(`FAIL /auth/login HTTP ${loginRes.status}`);
    process.exit(1);
  }
  budgetLine('POST /auth/login', loginMs, 1500);

  const cookieHeader = cookieHeaderFrom(loginRes);

  const dashStarted = Date.now();
  const dashRes = await fetch(`${API_URL}/dashboard`, {
    headers: { Cookie: cookieHeader },
  });
  const dashMs = Date.now() - dashStarted;
  if (!dashRes.ok) {
    console.error(`FAIL /dashboard HTTP ${dashRes.status}`);
    process.exit(1);
  }
  budgetLine('GET /dashboard', dashMs, 1500);

  const pqrStarted = Date.now();
  const pqrRes = await fetch(
    `${API_URL}/informes/postventa/pqr-nps?estado=abiertos&pagina=1&limite=10`,
    { headers: { Cookie: cookieHeader } },
  );
  const pqrMs = Date.now() - pqrStarted;
  if (!pqrRes.ok) {
    console.error(`FAIL PQR/NPS HTTP ${pqrRes.status}`);
    process.exit(1);
  }
  budgetLine('GET /informes/postventa/pqr-nps', pqrMs, 1500);

  const tallerStarted = Date.now();
  const tallerRes = await fetch(`${API_URL}/taller/estado-taller?bodega=todas`, {
    headers: { Cookie: cookieHeader },
  });
  const tallerMs = Date.now() - tallerStarted;
  if (!tallerRes.ok) {
    console.error(`FAIL estado-taller HTTP ${tallerRes.status}`);
    process.exit(1);
  }
  budgetLine('GET /taller/estado-taller', tallerMs, 1500);

  const logoutRes = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookieHeader },
  });
  if (!logoutRes.ok) {
    console.error(`FAIL /auth/logout HTTP ${logoutRes.status}`);
    process.exit(1);
  }

  const refreshAfter = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: cookieHeader, 'Content-Type': 'application/json' },
  });
  if (refreshAfter.ok) {
    console.error(
      'FAIL: refresh siguió válido después de logout (el token no se invalidó).',
    );
    process.exit(1);
  }
  console.log('OK logout invalidó refresh (refresh posterior no autorizado)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
