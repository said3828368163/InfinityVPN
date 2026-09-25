const fs = require('fs');
const path = require('path');

// Параметры подписки
const START_DATE = new Date('2026-09-25T16:00:00Z');
const TOTAL_DAYS = 30;
const TOTAL_TRAFFIC_GB = 100;
const EXPIRY_DATE = new Date(START_DATE.getTime() + (TOTAL_DAYS * 24 * 60 * 60 * 1000));

const now = new Date();
const msLeft = EXPIRY_DATE.getTime() - now.getTime();
const rawDays = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
const daysLeft = Math.max(0, Math.min(TOTAL_DAYS, rawDays));
const hoursLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60)));
const trafficLeft = daysLeft > 0 ? (TOTAL_TRAFFIC_GB * (daysLeft / TOTAL_DAYS)).toFixed(1) : '0';
const isExpired = daysLeft <= 0;

// Прогресс бар
const barLength = 20;
const filled = Math.min(barLength, Math.max(0, Math.round((daysLeft / TOTAL_DAYS) * barLength)));
const empty = barLength - filled;
const progressBar = '█'.repeat(filled) + '░'.repeat(empty);
const percent = Math.min(100, Math.max(0, Math.round((daysLeft / TOTAL_DAYS) * 100)));

const statusText = isExpired ? 'Истекла' : 'Активна';
const statusBadge = isExpired ? 'Истекла-red' : 'Активна-brightgreen';
const daysBadgeColor = daysLeft > 10 ? 'blue' : (daysLeft > 3 ? 'yellow' : 'red');

// 1. Формируем sub-30d.txt (Trojan конфигурация для Happ / v2rayNG / Sing-box)
const node1Name = encodeURIComponent(`🇺🇸 InfinityVPN [100GB | ${daysLeft} дней]`);
const node2Name = encodeURIComponent(`⚡ InfinityVPN USA Fast [${daysLeft} дн]`);
const infoNodeName = encodeURIComponent(`📊 Трафик: ${trafficLeft} / 100 GB | Осталось: ${daysLeft} дн.`);

const subContent = [
  `trojan://sg-trojan-2026@43.173.90.202:443?security=tls&sni=sg-proxy.local&fp=edge&type=tcp&headerType=none#${node1Name}`,
  `trojan://sg-trojan-2026@43.173.90.202:443?security=tls&sni=sg-proxy.local&fp=edge&type=tcp&headerType=none#${node2Name}`,
  `trojan://00000000-0000-0000-0000-000000000000@127.0.0.1:443?security=none#${infoNodeName}`,
  ''
].join('\n');

fs.writeFileSync(path.join(__dirname, 'sub-30d.txt'), subContent, 'utf8');
fs.writeFileSync(path.join(__dirname, 'sub.txt'), subContent, 'utf8');

// 2. Формируем status.json
const statusData = {
  status: isExpired ? 'expired' : 'active',
  total_days: TOTAL_DAYS,
  remaining_days: daysLeft,
  remaining_hours: hoursLeft,
  traffic_total_gb: TOTAL_TRAFFIC_GB,
  traffic_remaining_gb: parseFloat(trafficLeft),
  progress_percent: percent,
  start_date: '2026-09-25T16:00:00Z',
  expiry_date: EXPIRY_DATE.toISOString(),
  last_updated: now.toISOString()
};
fs.writeFileSync(path.join(__dirname, 'status.json'), JSON.stringify(statusData, null, 2), 'utf8');

// 3. Формируем README.md с динамическими бейджами и мониторингом
const readmeContent = `# ⚡ InfinityVPN — Официальный репозиторий

[![Статус](https://img.shields.io/badge/Статус-${encodeURIComponent(statusText)}-${isExpired ? 'red' : 'brightgreen'}?style=for-the-badge)](https://t.me/InfinityVPN_serverHost_bot)
[![Осталось дней](https://img.shields.io/badge/Осталось_дней-${daysLeft}_из_${TOTAL_DAYS}-${daysBadgeColor}?style=for-the-badge)](https://t.me/InfinityVPN_serverHost_bot)
[![Трафик](https://img.shields.io/badge/Трафик-${trafficLeft}_из_${TOTAL_TRAFFIC_GB}_GB-blue?style=for-the-badge)](https://t.me/InfinityVPN_serverHost_bot)

👉 **Официальный Telegram-бот:** [@InfinityVPN_serverHost_bot](https://t.me/InfinityVPN_serverHost_bot)  
💬 **Поддержка:** [@jailbreak3919](https://t.me/jailbreak3919)

---

## ⏳ Мониторинг подписки (30 дней / 100 GB)

Данный репозиторий автоматически обновляется через **GitHub Actions** каждый день. Дни и трафик убывают честно в реальном времени.

| Параметр | Значение |
| :--- | :--- |
| **Текущий статус** | ${isExpired ? '🔴 Истекла' : '🟢 Активна'} |
| **Осталось дней** | ⏳ **${daysLeft} из ${TOTAL_DAYS} дней** |
| **Осталось часов** | ⏱️ **~${hoursLeft} ч.** |
| **Остаток трафика** | 📶 **${trafficLeft} GB / ${TOTAL_TRAFFIC_GB} GB** |
| **Прогресс срока** | \`[${progressBar}]\` **${percent}%** |
| **Дата активации** | 📅 25.09.2026 |
| **Дата окончания** | 📅 25.10.2026 |

---

## 📡 Ссылки на подписку для Happ / v2rayNG / Sing-box

- **GitHub Pages (прямая ссылка):**  
  \`https://said3828368163.github.io/InfinityVPN/sub-30d.txt\`

- **GitHub Raw:**  
  \`https://raw.githubusercontent.com/said3828368163/InfinityVPN/main/sub-30d.txt\`

- **JSON статус подписки:**  
  \`https://said3828368163.github.io/InfinityVPN/status.json\`

---
*Обновлено автоматически: ${now.toUTCString()}*
`;

fs.writeFileSync(path.join(__dirname, 'README.md'), readmeContent, 'utf8');

console.log(`Updated successfully: ${daysLeft} days left, ${trafficLeft} GB traffic left.`);
