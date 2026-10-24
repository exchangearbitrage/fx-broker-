import type { BrandConfig } from "@/config/brand.schema";

export function assertLiveModeLegalGate(config: BrandConfig) {
  if (config.mode !== "live") {
    return;
  }

  const missing = [
    ["regulatorName", config.legal.regulatorName],
    ["licenseNumber", config.legal.licenseNumber],
    ["regulatorUrl", config.legal.regulatorUrl],
    ["riskWarningText", config.legal.riskWarningText],
  ].filter(([, value]) => !value);

  if (missing.length) {
    throw new Error(`Live mode is not configured. Missing legal fields: ${missing.map(([field]) => field).join(", ")}`);
  }
}
