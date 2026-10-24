import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const configPath = join(root, "config", "brand.config.ts");
const source = readFileSync(configPath, "utf8");
const forbidden = Array.from(new Set([...source.matchAll(/"([^"]{4,})"/g)].map((match) => match[1]).filter((value) => /your brand|example\.com/i.test(value))));

if (!forbidden.length) {
  console.log("No brand-specific forbidden strings found in config.");
  process.exit(0);
}

const skippedDirs = new Set([".git", ".next", ".npm-cache", "node_modules", "config", "brands", "public"]);
const scannedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".css", ".mjs"]);

function collectFiles(dir, prefix = "") {
  return readdirSync(dir).flatMap((entry) => {
    const relativePath = prefix ? `${prefix}/${entry}` : entry;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      return skippedDirs.has(entry) ? [] : collectFiles(fullPath, relativePath);
    }

    const extension = entry.includes(".") ? `.${entry.split(".").pop()}` : "";
    return scannedExtensions.has(extension) ? [relativePath] : [];
  });
}

const leaks = [];

for (const file of collectFiles(root)) {
  const body = readFileSync(join(root, file), "utf8");
  for (const token of forbidden) {
    if (body.includes(token)) {
      leaks.push(`${file}: ${token}`);
    }
  }
}

if (leaks.length) {
  console.error("Brand leak check failed:");
  for (const leak of leaks) {
    console.error(`- ${leak}`);
  }
  process.exit(1);
}

console.log("Brand leak check passed.");
