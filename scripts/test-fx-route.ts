import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
async function main() {
const fixture = JSON.parse((await readFile(new URL("../tests/fixtures/fx-snapshot.json", import.meta.url), "utf8")).replace(/^\uFEFF/, ""));
const mode = process.env.FX_ROUTE_CASE;
if (!mode) {
  for (const name of ["success", "429", "network", "malformed"]) { const result = spawnSync(process.execPath, ["--import", "tsx", fileURLToPath(import.meta.url)], { env: { ...process.env, FX_ROUTE_CASE: name }, encoding: "utf8" }); process.stdout.write(result.stdout); process.stderr.write(result.stderr); assert.equal(result.status, 0, `${name} test failed`); }
  console.log("FX route tests passed");
} else {
  let calls = 0;
  globalThis.fetch = (async () => { calls += 1; if (mode === "429") return new Response("rate limited", { status: 429 }); if (mode === "network") throw new TypeError("network unavailable"); const payload = structuredClone(fixture); if (mode === "malformed") payload.rates.BAD = "not-a-number"; return Response.json(payload); }) as typeof fetch;
  const { GET } = await import("../app/api/fx/route"); const request = (currency = "USD") => new Request(`http://localhost/api/fx?currency=${currency}`); const first = await GET(request(mode === "429" || mode === "network" ? "NGN" : "USD")); const firstBody = await first.json();
  if (mode === "success") { assert.equal(firstBody.source, "live"); const repeated = await GET(request()); assert.equal((await repeated.json()).source, "cached"); assert.equal(calls, 1); const unknown = await GET(request("ZZZ")); assert.equal((await unknown.json()).currency, "USD"); }
  else if (mode === "malformed") { assert.equal(firstBody.source, "live"); assert.equal(firstBody.currencies.includes("BAD"), false); }
  else { assert.equal(firstBody.source, "fallback"); assert.equal(firstBody.rate, fixture.rates.NGN); assert.match(first.headers.get("cache-control") ?? "", /s-maxage=1200/); }
  console.log(`PASS ${mode}`);
}
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
