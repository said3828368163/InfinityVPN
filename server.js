// InfinityVPN Dedicated Cloud Server on GitHub Codespaces
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SERVER_START = Date.now();
const CODESPACE_NAME = process.env.CODESPACE_NAME || 'infinityvpn-server';
const DEFAULT_NODE = 'trojan://sg-trojan-2026@43.173.90.202:443?security=tls&sni=sg-proxy.local&fp=edge&type=tcp&headerType=none#%F0%9F%87%BA%F0%9F%87%B2%20InfinityVPN%20Codespaces%20Server';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const url = req.url || '/';

  // Health check
  if (url === '/health' || url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      server: 'Codespaces InfinityVPN Server',
      codespace: CODESPACE_NAME,
      uptimeSeconds: Math.floor((Date.now() - SERVER_START) / 1000),
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      timestamp: new Date().toISOString()
    }));
  }

  // Subscriptions endpoint
  if (url.startsWith('/sub')) {
    const expireTimestamp = Math.floor(Date.now() / 1000) + (30 * 86400);
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Profile-Title': 'base64:' + Buffer.from('InfinityVPN Codespaces 30D (100GB)').toString('base64'),
      'Subscription-Userinfo': 'upload=0; download=10485760; total=107374182400; expire=' + expireTimestamp,
      'profile-update-interval': '12'
    });
    return res.end(DEFAULT_NODE + '\n');
  }

  // Status endpoint
  if (url === '/status.json') {
    let statusFile = {};
    try {
      statusFile = JSON.parse(fs.readFileSync(path.join(__dirname, 'status.json'), 'utf8'));
    } catch (_) {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ...statusFile,
      codespace: CODESPACE_NAME,
      host: 'GitHub Codespaces UK South',
      serverOnline: true
    }));
  }

  // HTML Dashboard
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>InfinityVPN — Codespaces Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0e17; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; max-width: 520px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .badge { display: inline-block; background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    h1 { margin: 0 0 12px; font-size: 24px; color: #60a5fa; }
    p { color: #9ca3af; line-height: 1.6; margin: 8px 0; }
    .stat { background: #1e293b; padding: 12px; border-radius: 8px; margin-top: 16px; font-family: monospace; font-size: 13px; color: #38bdf8; word-break: break-all; }
    a.btn { display: inline-block; margin-top: 20px; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">● Codespaces Cloud Server Active</div>
    <h1>⚡ InfinityVPN Dedicated Server</h1>
    <p>Сервер успешно запущен в облаке GitHub Codespaces.</p>
    <div class="stat">Codespace: ${CODESPACE_NAME}<br>Port: ${PORT}<br>Uptime: ${Math.floor((Date.now() - SERVER_START) / 1000)}s<br>RAM: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</div>
    <a href="https://t.me/InfinityVPN_serverHost_bot" class="btn" target="_blank">Перейти в Telegram бот</a>
  </div>
</body>
</html>`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('InfinityVPN Codespaces Server running on port ' + PORT);
});
