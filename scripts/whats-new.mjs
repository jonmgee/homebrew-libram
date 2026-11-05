// Writes dist/whats-new.json after the build: this site's What's New list, for the PC on Parchment
// iPhone app, which gathers every tool's list into one on its Guild page. The site never reads it.
// Reads the hand-written list itself (src/lib/changelog.ts), so there's nothing to keep in step.
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync("src/lib/changelog.ts", "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { CHANGELOG } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const entries = CHANGELOG.slice(0, 40).map((e) => ({
  id: e.id,
  date: e.date,
  title: e.title,
  body: e.body ?? "",
  bullets: (e.bullets ?? []).map((b) => (typeof b === "string" ? b : b.text)),
}));
writeFileSync("dist/whats-new.json", JSON.stringify({ entries }));
console.log(`whats-new.json: ${entries.length} entries`);
