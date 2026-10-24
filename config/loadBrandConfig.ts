import defaultBrandConfig from "@/config/brand.config";
import { brandConfigSchema, type BrandConfig } from "@/config/brand.schema";
import { assertLiveModeLegalGate } from "@/lib/liveModeGate";

let cachedConfig: BrandConfig | undefined;

export function getBrandConfig(): BrandConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const parsed = brandConfigSchema.safeParse(defaultBrandConfig);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Invalid brand config:\n${message}`);
  }

  assertLiveModeLegalGate(parsed.data);
  cachedConfig = parsed.data;
  return cachedConfig;
}

export function resetBrandConfigForTests() {
  cachedConfig = undefined;
}
