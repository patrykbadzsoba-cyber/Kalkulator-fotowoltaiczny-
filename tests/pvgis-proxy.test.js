const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

let workerModule;
async function getWorker() {
  if (!workerModule) {
    const source = await readFile(path.join(process.cwd(), "worker/pvgis-proxy.js"), "utf8");
    workerModule = import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
  }
  return workerModule;
}
const origin = "https://patrykbadzsoba-cyber.github.io";
const params = new URLSearchParams({ lat: "53.55", lon: "9.99", angle: "35", aspect: "0" });
const monthly = Array.from({ length: 12 }, (_, index) => ({ month: index + 1, E_m: 80 + index }));
const payload = { outputs: { totals: { fixed: { E_y: 1100 } }, monthly: { fixed: monthly } } };
function env(success = true) {
  return {
    APP_ORIGIN: origin,
    PVGIS_RATE_LIMITER: { limit: async () => ({ success }) }
  };
}
function request(query = params, options = {}) {
  return new Request("https://worker.example.workers.dev/?"+query.toString(), {
    method: options.method || "GET",
    headers: { Origin: options.origin || origin, "CF-Connecting-IP": "203.0.113.10" }
  });
}
async function withFetch(mock, callback) {
  const original = global.fetch;
  global.fetch = mock;
  try { return await callback(); } finally { global.fetch = original; }
}
async function invoke(req, bindings = env()) {
  const { default: worker } = await getWorker();
  return worker.fetch(req, bindings);
}

test("rejects requests from an unapproved origin", async () => {
  const response = await invoke(request(params, { origin: "https://evil.example" }));
  assert.equal(response.status, 403);
});
test("handles CORS preflight without calling the PVGIS API", async () => {
  const response = await invoke(request(params, { method: "OPTIONS" }));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
});
test("rejects missing and empty parameters before upstream access", async () => {
  const missing = await invoke(request(new URLSearchParams({ lat: "53.55", lon: "9.99", angle: "35" })));
  const empty = await invoke(request(new URLSearchParams({ lat: "", lon: "9.99", angle: "35", aspect: "0" })));
  assert.equal(missing.status, 400);
  assert.equal(empty.status, 400);
});
test("rejects coordinates outside the supported Germany region", async () => {
  const response = await invoke(request(new URLSearchParams({ lat: "0", lon: "0", angle: "35", aspect: "0" })));
  assert.equal(response.status, 400);
});
test("rejects unsupported HTTP methods", async () => {
  const response = await invoke(request(params, { method: "POST" }));
  assert.equal(response.status, 405);
});
test("fails closed when the rate limiter is not configured", async () => {
  const response = await invoke(request(), { APP_ORIGIN: origin });
  assert.equal(response.status, 503);
});
test("returns 429 when the client rate limit is exceeded", async () => {
  const response = await invoke(request(), env(false));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
});
test("maps a valid PVGIS response to annual and monthly kWh per kWp", async () => {
  await withFetch(async (url) => {
    const upstream = new URL(url);
    assert.equal(upstream.searchParams.get("peakpower"), "1");
    assert.equal(upstream.searchParams.get("loss"), "14");
    assert.equal(upstream.searchParams.get("angle"), "35");
    assert.equal(upstream.searchParams.get("aspect"), "0");
    return new Response(JSON.stringify(payload), { status: 200 });
  }, async () => {
    const response = await invoke(request());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
    assert.match(response.headers.get("cache-control"), /max-age=3600/);
    const body = await response.json();
    assert.equal(body.source, "PVGIS 5.3");
    assert.equal(body.annualYieldKwhPerKwp, 1100);
    assert.equal(body.monthlyYieldKwhPerKwp.length, 12);
    assert.equal(body.monthlyYieldKwhPerKwp[0], 80);
  });
});
test("returns 502 when PVGIS responds with an error", async () => {
  await withFetch(async () => new Response("upstream unavailable", { status: 503 }), async () => {
    const response = await invoke(request());
    assert.equal(response.status, 502);
  });
});
test("rejects incomplete monthly data from PVGIS", async () => {
  await withFetch(async () => new Response(JSON.stringify({
    outputs: { totals: { fixed: { E_y: 1000 } }, monthly: { fixed: monthly.slice(0, 11) } }
  }), { status: 200 }), async () => {
    const response = await invoke(request());
    assert.equal(response.status, 502);
  });
});
