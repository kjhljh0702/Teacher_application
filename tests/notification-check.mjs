import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");
const [app, html, worker] = await Promise.all([read("app.js"), read("index.html"), read("service-worker.js")]);

const imageFiles = [
  "assets/teacher-network-hero.webp",
  "assets/career-desk.webp",
  "assets/teacher-community.webp",
];
const imageStats = await Promise.all(imageFiles.map((file) => stat(path.join(root, file))));

const checks = [
  ["notification center exists", /id="notificationTray"/.test(html) && /id="notificationList"/.test(html)],
  ["permission requires a click handler", /notificationPermissionBtn\.addEventListener\("click"/.test(app)],
  ["permission is not requested during boot", !/async function boot\(\)[\s\S]*?Notification\.requestPermission\(\)[\s\S]*?function createDefaultState/.test(app)],
  ["lock screen body is generic", /body: "앱을 열어 새 소식을 확인해 주세요\."/.test(app)],
  ["notification targets are allowlisted", /NOTIFICATION_TARGETS\.has/.test(app) && /NOTIFICATION_TARGETS\.has/.test(worker)],
  ["notification click is handled", /notificationclick/.test(worker) && /OPEN_NOTIFICATION/.test(worker)],
  ["sound is user configurable", /notificationSoundBtn\.addEventListener\("click"/.test(app) && /AudioContext/.test(app)],
  ["generated images are referenced", imageFiles.every((file) => html.includes(`./${file}`))],
  ["generated images are offline cached", imageFiles.every((file) => worker.includes(`./${file}`))],
  ["generated images are optimized", imageStats.every((entry) => entry.size > 20_000 && entry.size < 300_000)],
];

for (const [name, condition] of checks) assert.ok(condition, name);
console.log(`notification-check: ${checks.length} checks passed`);
