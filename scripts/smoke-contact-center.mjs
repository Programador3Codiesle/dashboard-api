/**
 * Smoke tests de lectura para Contact Center (menú 10).
 * Uso: node scripts/smoke-contact-center.mjs
 * Requiere DATABASE_URL en .env.local o entorno.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sql from 'mssql';

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

function parseDatabaseUrl(url) {
  const parts = url.split(';');
  const main = parts[0];
  const config = {
    server: '',
    port: 1433,
    user: '',
    password: '',
    database: '',
    options: { encrypt: false, trustServerCertificate: true },
  };

  if (main.includes('@')) {
    const u = new URL(main.replace('sqlserver://', 'http://'));
    config.server = u.hostname;
    config.port = Number(u.port) || 1433;
    config.user = decodeURIComponent(u.username);
    config.password = decodeURIComponent(u.password);
  } else {
    const hostPart = main.replace('sqlserver://', '');
    const [host, portStr] = hostPart.split(':');
    config.server = host;
    config.port = portStr ? Number(portStr) : 1433;
  }

  for (let i = 1; i < parts.length; i++) {
    const [k, v] = parts[i].split('=');
    if (!k || !v) continue;
    switch (k.toLowerCase()) {
      case 'database':
        config.database = v;
        break;
      case 'user':
        config.user = v;
        break;
      case 'password':
        config.password = v;
        break;
      case 'encrypt':
        config.options.encrypt = v.toLowerCase() === 'true';
        break;
      case 'trustservercertificate':
        config.options.trustServerCertificate = v.toLowerCase() === 'true';
        break;
      default:
        break;
    }
  }

  return config;
}

async function runCheck(label, queryFn) {
  try {
    const result = await queryFn();
    console.log(`✅ ${label}:`, result);
    return true;
  } catch (e) {
    console.error(`❌ ${label}:`, e.message ?? e);
    return false;
  }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL no definida');
  process.exit(1);
}

const config = parseDatabaseUrl(dbUrl);
let pool;
let passed = 0;
let failed = 0;

try {
  pool = await sql.connect(config);
  console.log(`\n🔌 Conectado a ${config.server}/${config.database}\n`);
  console.log('--- Contact Center smoke (solo lectura) ---\n');

  const checks = [
    [
      '188 BDC — vista tiempo Chevrolet',
      async () => {
        const r = await pool
          .request()
          .query('SELECT TOP 1 * FROM v_bdc_tiempo_chevrolet');
        return `${r.recordset.length} fila(s) muestra`;
      },
    ],
    [
      '188 BDC — vista km Chevrolet',
      async () => {
        const r = await pool
          .request()
          .query('SELECT TOP 1 * FROM v_bdc_km_chevrolet');
        return `${r.recordset.length} fila(s) muestra`;
      },
    ],
    [
      '188 BDC — vista fecha compra',
      async () => {
        const r = await pool
          .request()
          .query('SELECT TOP 1 * FROM v_bdc_fechacompra_chevrolet');
        return `${r.recordset.length} fila(s) muestra`;
      },
    ],
    [
      '38 Distribución — agentes perfil 31',
      async () => {
        const r = await pool.request().query(`
          SELECT COUNT(*) AS n FROM w_sist_usuarios wsu
          INNER JOIN terceros t ON t.nit_real = wsu.nit_usuario
          WHERE wsu.perfil_postventa = 31
        `);
        return `${r.recordset[0].n} agentes`;
      },
    ],
    [
      '38 Distribución — bodegas (1,6,7,8,11,16,19)',
      async () => {
        const r = await pool.request().query(`
          SELECT COUNT(*) AS n FROM bodegas WHERE bodega IN (1,6,7,8,11,16,19)
        `);
        return `${r.recordset[0].n} bodegas`;
      },
    ],
    [
      '38 Distribución — periodo mes siguiente',
      async () => {
        const r = await pool.request().query(`
          SELECT MONTH(DATEADD(mm,1,DATEADD(mm,DATEDIFF(mm,0,GETDATE()),0))) AS mes,
                 YEAR(DATEADD(mm,1,DATEADD(mm,DATEDIFF(mm,0,GETDATE()),0))) AS anio
        `);
        const row = r.recordset[0];
        return `mes=${row.mes}, anio=${row.anio}`;
      },
    ],
    [
      '39 Distribución Agente — G.A. actuales (muestra)',
      async () => {
        const r = await pool.request().query(`
          SELECT TOP 3 agente, placa, fecha_estimada FROM postv_maestro_posventa
          WHERE CONVERT(DATE, fecha_estimada) BETWEEN DATEADD(mm, DATEDIFF(mm, 0, GETDATE()), 0) AND GETDATE()
        `);
        return `${r.recordset.length} registro(s) en el mes`;
      },
    ],
    [
      '157 LEADS — banco leads',
      async () => {
        const r = await pool.request().query(`
          SELECT COUNT(*) AS n FROM swcc_bancoleads_postventa
        `);
        return `${r.recordset[0].n} leads totales`;
      },
    ],
    [
      '157 LEADS — agentes asignación hardcodeados',
      async () => {
        const ids = [704, 830, 946, 931, 977];
        const r = await pool.request().query(`
          SELECT COUNT(*) AS n FROM w_sist_usuarios WHERE id_usuario IN (${ids.join(',')})
        `);
        return `${r.recordset[0].n}/5 IDs encontrados en BD`;
      },
    ],
    [
      '98 Auditoría — indicadores',
      async () => {
        const r = await pool.request().query(`
          SELECT COUNT(*) AS n, SUM(CASE WHEN estado = 2 THEN puntuacion ELSE 0 END) AS pts
          FROM postv_auditoria_indicador
        `);
        const row = r.recordset[0];
        return `${row.n} indicadores, ${row.pts ?? 0} pts habilitados`;
      },
    ],
    [
      '98 Auditoría — pendientes sin finalizar',
      async () => {
        const r = await pool.request().query(`
          SELECT COUNT(*) AS n FROM postv_auditoria_agente WHERE fecha_finalizacion IS NULL
        `);
        return `${r.recordset[0].n} auditoría(s) pendiente(s)`;
      },
    ],
    [
      '98 Auditoría — archivos evidencia',
      async () => {
        const r = await pool.request().query(`
          SELECT COUNT(*) AS n FROM postv_auditoria_agente_files
        `);
        return `${r.recordset[0].n} archivo(s)`;
      },
    ],
  ];

  for (const [label, fn] of checks) {
    const ok = await runCheck(label, fn);
    if (ok) passed++;
    else failed++;
  }

  console.log(`\n--- Resultado: ${passed} OK, ${failed} fallos ---\n`);
} catch (e) {
  console.error('Error de conexión:', e.message ?? e);
  process.exit(1);
} finally {
  if (pool) await pool.close();
}

process.exit(failed > 0 ? 1 : 0);
