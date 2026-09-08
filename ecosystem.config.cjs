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
      listen_timeout: 20000,
      kill_timeout: 10000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
