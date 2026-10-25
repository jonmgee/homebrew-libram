// Writes dist/app-manifest.json after the build: every built file with its size and SHA-256.
// The PC on Parchment iPhone app ships a copy of this site and uses this list to fetch only
// the files that changed, so fixes reach the app without a store release. The site never reads it.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const dist = "dist";
const files = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    const rel = relative(dist, path).split(sep).join("/");
    if (rel === "app-manifest.json") continue;
    const data = readFileSync(path);
    files.push({ path: rel, size: data.length, sha256: createHash("sha256").update(data).digest("hex") });
  }
}

walk(dist);
files.sort((a, b) => (a.path < b.path ? -1 : 1));
// Named by content, not by build: the same files give the same version wherever they're built.
const version = createHash("sha256")
  .update(files.map((f) => `${f.path} ${f.sha256}`).join("\n"))
  .digest("hex")
  .slice(0, 16);
writeFileSync(join(dist, "app-manifest.json"), JSON.stringify({ version, builtAt: new Date().toISOString(), files }));
console.log(`app-manifest.json: ${files.length} files, version ${version}`);
