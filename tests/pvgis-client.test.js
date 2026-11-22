const { test } = require("node:test");
const assert = require("node:assert/strict");
const PVGISClient = require("../pvgis-client.js");

test("builds a PVGIS proxy URL with exact system parameters", () => {
  const url = PVGISClient.buildRequest("https://example.workers.dev/pvgis", 53.55, 9.99, 35, -90);
  assert.equal(url.protocol, "https:");
  assert.equal(url.searchParams.get("lat"), "53.55");
  assert.equal(url.searchParams.get("lon"), "9.99");
  assert.equal(url.searchParams.get("angle"), "35");
  assert.equal(url.searchParams.get("aspect"), "-90");
});
test("rejects non-HTTPS proxy URLs and out-of-region coordinates", () => {
  assert.throws(() => PVGISClient.buildRequest("http://example.workers.dev", 53.55, 9.99, 35, 0), TypeError);
  assert.throws(() => PVGISClient.buildRequest("https://example.workers.dev", 0, 0, 35, 0), RangeError);
});
test("validates the annual and twelve monthly PVGIS values", () => {
  const parsed = PVGISClient.parseResponse({ annualYieldKwhPerKwp: 1050, monthlyYieldKwhPerKwp: Array(12).fill(80) });
  assert.equal(parsed.annualYieldKwhPerKwp, 1050);
  assert.equal(parsed.monthlyYieldKwhPerKwp.length, 12);
  assert.throws(() => PVGISClient.parseResponse({ annualYieldKwhPerKwp: 0, monthlyYieldKwhPerKwp: Array(12).fill(80) }), TypeError);
  assert.throws(() => PVGISClient.parseResponse({ annualYieldKwhPerKwp: 1050, monthlyYieldKwhPerKwp: Array(11).fill(80) }), TypeError);
});
