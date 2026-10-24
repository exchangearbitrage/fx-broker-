import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const fallbackPath = fileURLToPath(new URL("../lib/fx/fallback.ts", import.meta.url));
function validRates(payload) {
  if (payload?.result !== "success" || payload?.base_code !== "USD" || !payload?.rates || typeof payload.rates !== "object") throw new Error("invalid FX payload");
  const rates = Object.fromEntries(Object.entries(payload.rates).filter(([code, value]) => /^[A-Z]{3}$/.test(code) && typeof value === "number" && Number.isFinite(value) && value > 0));
  if (rates.USD !== 1) throw new Error("USD rate missing");
  return rates;
}
try {
  const response = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json(); const rates = validRates(payload);
  const updatedAt = typeof payload.time_last_update_unix === "number" ? new Date(payload.time_last_update_unix * 1000).toISOString() : new Date().toISOString();
  await writeFile(fallbackPath, `// Generated from ExchangeRate-API snapshot. Do not edit manually.\nexport const FALLBACK_SNAPSHOT = {\n  base: "USD" as const,\n  rates: ${JSON.stringify(rates, null, 2)},\n  updatedAt: ${JSON.stringify(updatedAt)},\n} as const;\n`);
  console.log(`[fx] refreshed ${Object.keys(rates).length} rates`);
} catch (error) {
  console.log(`[fx] refresh skipped: ${error instanceof Error ? error.message : "unknown error"}`);
}