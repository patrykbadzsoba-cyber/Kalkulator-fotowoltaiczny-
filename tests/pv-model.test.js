const { test } = require("node:test");
const assert = require("node:assert/strict");
const { estimate } = require("../pv-model.js");

const defaults = {
  consumption: 4000,
  roofArea: 50,
  orientation: 0.85,
  tilt: 1,
  shading: 0.8,
  electricityPrice: 0.32,
  feedIn: 0.079,
  battery: 5,
  systemCost: 1600,
  batteryCost: 600,
  localYieldPerKwp: 950
};

test("sizes the system against annual consumption when roof area is sufficient", () => {
  const result = estimate(defaults);
  assert.ok(Math.abs(result.annualYield - 4000) < 1e-9);
  assert.equal(result.roofLimited, false);
});

test("caps system size when the usable roof area is the limiting factor", () => {
  const result = estimate({ ...defaults, roofArea: 9 });
  assert.equal(result.capacity, 2);
  assert.equal(result.roofLimited, true);
  assert.ok(result.annualYield < defaults.consumption);
});

test("reports self-consumption savings and feed-in revenue separately", () => {
  const result = estimate(defaults);
  assert.ok(result.selfConsumed <= result.annualYield);
  assert.ok(result.exported >= 0);
  assert.ok(Math.abs(result.annualYield - result.selfConsumed - result.exported) < 1e-9);
  assert.ok(Math.abs(result.annualSavings - result.selfConsumptionSavings - result.feedInRevenue) < 1e-9);
});

test("battery capacity increases the modeled self-consumption share", () => {
  const withoutBattery = estimate({ ...defaults, battery: 0 });
  const withBattery = estimate({ ...defaults, battery: 10 });
  assert.ok(withBattery.selfConsumptionShare > withoutBattery.selfConsumptionShare);
  assert.ok(withBattery.selfConsumptionShare <= 0.70);
});

test("zero battery cost is valid and does not add investment cost", () => {
  const result = estimate({ ...defaults, battery: 0, batteryCost: 0 });
  assert.equal(result.investment, result.capacity * defaults.systemCost);
});

test("rejects non-finite and physically invalid inputs", () => {
  assert.throws(() => estimate({ ...defaults, consumption: NaN }), TypeError);
  assert.throws(() => estimate({ ...defaults, roofArea: 0 }), RangeError);
  assert.throws(() => estimate({ ...defaults, localYieldPerKwp: -1 }), RangeError);
});


test("distributes annual yield across 12 months using the measured radiation profile", () => {
  const { distributeMonthlyYield } = require("../pv-model.js");
  const monthly = distributeMonthlyYield(Array(12).fill(1), 1200);
  assert.equal(monthly.length, 12);
  assert.ok(monthly.every(value => Math.abs(value - 100) < 1e-9));
  assert.ok(Math.abs(monthly.reduce((sum, value) => sum + value, 0) - 1200) < 1e-8);
});

test("preserves the seasonal shape of monthly solar radiation", () => {
  const { distributeMonthlyYield } = require("../pv-model.js");
  const monthly = distributeMonthlyYield([1, 1, 2, 3, 4, 5, 5, 4, 3, 2, 1, 1], 3200);
  assert.ok(monthly[5] > monthly[0]);
  assert.ok(monthly[6] > monthly[11]);
  assert.ok(Math.abs(monthly.reduce((sum, value) => sum + value, 0) - 3200) < 1e-8);
});

test("rejects incomplete or invalid monthly radiation profiles", () => {
  const { distributeMonthlyYield } = require("../pv-model.js");
  assert.throws(() => distributeMonthlyYield([1, 2], 1000), TypeError);
  assert.throws(() => distributeMonthlyYield(Array(12).fill(-1), 1000), TypeError);
  assert.throws(() => distributeMonthlyYield(Array(12).fill(0), 1000), RangeError);
});
