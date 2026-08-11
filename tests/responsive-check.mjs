import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [html, css] = await Promise.all([
  readFile(path.join(root, "index.html"), "utf8"),
  readFile(path.join(root, "styles.css"), "utf8"),
]);

const checks = [
  ["edge-to-edge viewport support", /viewport-fit=cover/.test(html)],
  ["dynamic viewport height", /100dvh/.test(css)],
  ["bottom safe area", /safe-area-inset-bottom/.test(css)],
  ["horizontal safe areas", /safe-area-inset-left/.test(css) && /safe-area-inset-right/.test(css)],
  ["tablet portrait navigation", /min-width:\s*761px[\s\S]*max-width:\s*900px/.test(css)],
  ["mid-width map filters wrap", /max-width:\s*1120px[\s\S]*facility-filters[\s\S]*repeat\(2/.test(css)],
  [
    "short landscape handling",
    /max-height:\s*620px[\s\S]*min-width:\s*901px[\s\S]*min-height:\s*44px/.test(css),
  ],
  ["short viewport map", /max-height:\s*620px\)[\s\S]*facility-map[\s\S]*58dvh/.test(css)],
  ["foldable inner layout", /min-width:\s*600px[\s\S]*max-width:\s*760px[\s\S]*repeat\(2/.test(css)],
  ["flip cover layout", /max-width:\s*280px[\s\S]*repeat\(5[\s\S]*min-width:\s*44px/.test(css)],
  ["coarse pointer targets", /pointer:\s*coarse[\s\S]*min-height:\s*44px/.test(css)],
];

for (const [name, condition] of checks) assert.ok(condition, name);
console.log(`responsive-check: ${checks.length} checks passed`);
