import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const brand = process.env.BRAND;

if (!brand || brand === "default") {
  process.exit(0);
}

if (!/^[a-z0-9-]+$/.test(brand)) {
  throw new Error("BRAND may only contain lowercase letters, numbers, and hyphens.");
}

const root = process.cwd();
const sourceDir = join(root, "brands", brand);
const sourceConfig = join(sourceDir, "brand.config.ts");

if (!existsSync(sourceConfig)) {
  throw new Error(`Missing brand config: brands/${brand}/brand.config.ts`);
}

copyFileSync(sourceConfig, join(root, "config", "brand.config.ts"));

const publicDir = join(root, "public", "brands", brand);
mkdirSync(publicDir, { recursive: true });

for (const file of ["logo-light.svg", "logo-dark.svg", "favicon.svg", "og-image.svg", "hero-placeholder.svg"]) {
  const source = join(sourceDir, file);
  if (existsSync(source)) {
    copyFileSync(source, join(publicDir, file));
  }
}

console.log(`Selected brand: ${brand}`);
