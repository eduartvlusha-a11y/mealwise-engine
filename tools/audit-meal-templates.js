/* tools/audit-meal-templates.js
   Run: node tools/audit-meal-templates.js
*/

const path = require("path");

// CHANGE THIS PATH ONLY IF YOUR FILE IS ELSEWHERE
const templatesPath = path.join(
  process.cwd(),
  "src",
  "meal-suggestions",
  "meal-templates.table"
);

let mod;
try {
  mod = require(templatesPath);
} catch (e) {
  console.error("❌ Failed to require templates module at:", templatesPath);
  console.error("Reason:", e.message);
  process.exit(1);
}

const templates =
  mod.MEAL_TEMPLATES ||
  mod.mealTemplates ||
  mod.templates ||
  (Array.isArray(mod.default) ? mod.default : null);

if (!Array.isArray(templates)) {
  console.error("❌ Could not find exported templates array.");
  console.error("Exports found:", Object.keys(mod));
  process.exit(1);
}

const norm = (v) => (v == null ? "missing" : String(v).trim().toLowerCase());

const by = (keyFn) => {
  const m = new Map();
  for (const t of templates) {
    const k = keyFn(t);
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

const groupByTwo = (k1, k2) => {
  const m = new Map();
  for (const t of templates) {
    const a = norm(t[k1]);
    const b = norm(t[k2]);
    const key = `${a} | ${b}`;
    m.set(key, (m.get(key) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

const ids = new Set();
const dupIds = new Set();
for (const t of templates) {
  if (!t.id) continue;
  if (ids.has(t.id)) dupIds.add(t.id);
  ids.add(t.id);
}

const countMissing = (field) =>
  templates.reduce((acc, t) => acc + (t[field] == null ? 1 : 0), 0);

console.log("\n============================");
console.log("MEAL TEMPLATES AUDIT");
console.log("============================\n");

console.log("Total templates:", templates.length);
console.log("Unique IDs:", ids.size);
console.log("Duplicate IDs:", dupIds.size);

console.log("\nBy category:");
console.table(by((t) => norm(t.category)));

console.log("\nBy diet:");
console.table(by((t) => norm(t.diet)));

console.log("\nCategory × Diet:");
console.table(groupByTwo("category", "diet"));

console.log("\nProtein class:");
console.table(by((t) => norm(t.proteinClass)));

console.log("\nMissing fields:");
["id", "name", "category", "diet", "proteinClass", "defaultGrams"].forEach((f) =>
  console.log(f, "missing:", countMissing(f))
);

console.log("\nDONE.\n");
