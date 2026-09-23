/**
 * PM2 — API Nest (cluster).
 *
 * Deploy (no cambia JWT_ACCESS_TOKEN_SECRET ni CORS_ORIGIN):
 *   git pull origin main
 *   npm install          (solo si cambió package.json)
 *   npm run build
 *   pm2 reload postventa-api
 *
 * Apache: ProxyPass /postventa2/api ANTES que /postventa2.
 * En el ProxyPass a :4000 usar disablereuse=On (no reutilizar socket
 * al worker que acaba de morir; si no, GET 503 hasta F5).
 *
 * wait_ready solo aplica si el proceso se arrancó con ESTE archivo:
 *   pm2 delete postventa-api
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 * Si `pm2 show postventa-api` dice node env: N/A, hay que hacer eso una vez.
 */
const fs = require("fs");
const path = require("path");

const script = fs.existsSync(path.join(__dirname, "dist", "src", "main.js"))
  ? "dist/src/main.js"
  : "dist/main.js";

module.exports = {
  apps: [
    {
      name: "postventa-api",
      script,
      cwd: __dirname,
      instances: "max",
      exec_mode: "cluster",
      wait_ready: true,
      listen_timeout: 40000,
      kill_timeout: 30000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
