import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const nameIndex = process.argv.findIndex((arg) => arg === "--name");
const rawName = nameIndex >= 0 ? process.argv[nameIndex + 1] : "";
const slug = slugify(rawName);

if (!slug) {
  throw new Error('Usage: npm run new-brand -- --name "Acme"');
}

const root = process.cwd();
const targetDir = join(root, "brands", slug);
const publicTargetDir = join(root, "public", "brands", slug);
const templateDir = join(root, "brands", "_template");

if (existsSync(targetDir)) {
  throw new Error(`Brand folder already exists: ${targetDir}`);
}

mkdirSync(targetDir, { recursive: true });
mkdirSync(publicTargetDir, { recursive: true });

for (const file of ["logo-light.svg", "logo-dark.svg", "favicon.svg", "og-image.svg", "hero-placeholder.svg", "README.md"]) {
  copyFileSync(join(templateDir, file), join(targetDir, file));
  if (file.endsWith(".svg")) {
    copyFileSync(join(templateDir, file), join(publicTargetDir, file));
  }
}

const configSource = readFileSync(join(root, "config", "brand.config.ts"), "utf8")
  .replaceAll(`Your ${"Brand"}`, rawName)
  .replaceAll("/brands/default/", `/brands/${slug}/`);

writeFileSync(join(targetDir, "brand.config.ts"), configSource);

console.log(`Created brand "${rawName}" at brands/${slug}`);
console.log(`Run with BRAND=${slug} npm run dev on macOS/Linux or $env:BRAND="${slug}"; npm run dev on PowerShell.`);
