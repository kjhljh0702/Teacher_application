import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(`${pathToFileURL(path.join(root, "content-policy.js")).href}?test=${Date.now()}`);

const policy = globalThis.TeacherLinkContentPolicy;
assert.ok(policy, "content policy module did not initialize");
assert.ok(policy.terms.profanity.length >= 60, "profanity dictionary is unexpectedly small");
assert.ok(policy.terms.sexual.length >= 40, "sexual-language dictionary is unexpectedly small");

for (const [type, terms] of Object.entries(policy.terms)) {
  for (const term of terms) {
    const obfuscated = Array.from(term).join(".");
    const result = policy.maskRestrictedLanguage(obfuscated, () => "**");
    assert.ok(result.counts[type] >= 1, `${type} term was not masked: ${term}`);
    assert.ok(result.text.includes("**"), `${type} mask was not inserted: ${term}`);
  }
}

const combined = policy.maskRestrictedLanguage("썅, 개 같은 운영에 오 럴 섹 스와 몸-캠 홍보", () => "**");
assert.equal(combined.counts.profanity, 2);
assert.equal(combined.counts.sexual, 2);
assert.equal(combined.masked, 4);

const safeSentences = [
  "새 사업의 시발점입니다.",
  "그 장면을 보지 못했고 잠을 자지 못했습니다.",
  "성희롱과 성폭력 피해를 운영자에게 신고합니다.",
  "성교육 자료와 피해자 지원 절차를 확인했습니다.",
];

for (const sentence of safeSentences) {
  const result = policy.maskRestrictedLanguage(sentence, () => "**");
  assert.equal(result.text, sentence, `safe context changed: ${sentence}`);
  assert.equal(result.masked, 0, `safe context was masked: ${sentence}`);
}

const schema = await readFile(path.join(root, "supabase/schema.sql"), "utf8");
assert.match(schema, /function public\.public_text_has_restricted_language\(p_value text\)/);
assert.match(schema, /regexp_replace\(lower\(coalesce\(p_value, ''\)\)/);
assert.match(schema, /썅\|[\s\S]*개같은/);
assert.match(schema, /오럴섹스\|[\s\S]*몸캠/);
assert.match(schema, /성적·음란 표현/);

console.log(`content-policy-check: ${policy.terms.profanity.length + policy.terms.sexual.length} terms checked`);
