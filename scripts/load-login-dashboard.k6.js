/**
 * Carga mínima login + dashboard (Fase 4).
 * Requiere k6: https://k6.io
 *
 *   k6 run -e API_URL=http://localhost:4000 -e SMOKE_NIT=... -e SMOKE_PASSWORD=... \
 *     scripts/load-login-dashboard.k6.js
 *
 * Presupuestos (performance-budget):
 *   login P95 <= 1500 ms
 *   dashboard P95 <= 1500 ms
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const API_URL = (__ENV.API_URL || 'http://localhost:4000').replace(/\/+$/, '');
const NIT = __ENV.SMOKE_NIT;
const PASSWORD = __ENV.SMOKE_PASSWORD;

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    'http_req_duration{name:login}': ['p(95)<1500'],
    'http_req_duration{name:dashboard}': ['p(95)<1500'],
  },
};

export default function () {
  if (!NIT || !PASSWORD) {
    throw new Error('Defina SMOKE_NIT y SMOKE_PASSWORD');
  }

  const login = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({
      nit_usuario: Number(NIT),
      password: PASSWORD,
      remember: false,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'login' },
    },
  );

  check(login, { 'login 201/200': (r) => r.status === 200 || r.status === 201 });

  const dash = http.get(`${API_URL}/dashboard`, {
    tags: { name: 'dashboard' },
  });
  check(dash, { 'dashboard 200': (r) => r.status === 200 });

  sleep(1);
}
