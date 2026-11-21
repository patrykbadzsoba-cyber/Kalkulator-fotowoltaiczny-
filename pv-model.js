(function (root, factory) {
  const model = factory();
  if (typeof module === "object" && module.exports) module.exports = model;
  if (root) root.PVModel = model;
})(typeof globalThis !== "undefined" ? globalThis : null, function () {
  "use strict";

  // Transparent annual estimate model. This is not an hourly household-load simulation.
  function estimate(input) {
    const {
      consumption, roofArea, orientation, tilt, shading, electricityPrice,
      feedIn, battery, systemCost, batteryCost, localYieldPerKwp
    } = input;

    const values = [
      consumption, roofArea, orientation, tilt, shading, electricityPrice,
      feedIn, battery, systemCost, batteryCost, localYieldPerKwp
    ];
    if (values.some(value => !Number.isFinite(value))) {
      throw new TypeError("All PV model inputs must be finite numbers.");
    }
    if (consumption <= 0 || roofArea <= 0 || electricityPrice <= 0 ||
        feedIn < 0 || battery < 0 || systemCost <= 0 || batteryCost < 0 ||
        localYieldPerKwp <= 0 || orientation <= 0 || tilt <= 0 || shading <= 0) {
      throw new RangeError("PV model inputs are outside the supported range.");
    }

    const maxRoofCapacity = roofArea / 4.5;
    // The current sizing target is annual household electricity consumption.
    const requestedCapacity = consumption /
      Math.max(localYieldPerKwp * orientation * tilt * shading, 1);
    const capacity = Math.min(maxRoofCapacity, requestedCapacity);
    const annualYield = capacity * localYieldPerKwp * orientation * tilt * shading;
    const selfConsumptionShare = Math.min(
      0.78,
      0.28 + (battery > 0
        ? Math.min(0.42, battery / Math.max(consumption / 1000, 1) * 0.12)
        : 0)
    );
    const selfConsumed = Math.min(consumption, annualYield * selfConsumptionShare);
    const exported = Math.max(0, annualYield - selfConsumed);
    const gridCoverage = Math.min(100, selfConsumed / consumption * 100);
    const selfConsumptionSavings = selfConsumed * electricityPrice;
    const feedInRevenue = exported * feedIn;
    const annualSavings = selfConsumptionSavings + feedInRevenue;
    const investment = capacity * systemCost + battery * batteryCost;
    const payback = annualSavings > 0 ? investment / annualSavings : Infinity;
    const panels = Math.round(capacity * 1000 / 430);
    const ownShareOfProduction = annualYield > 0 ? selfConsumed / annualYield * 100 : 0;

    return {
      maxRoofCapacity, requestedCapacity, capacity, annualYield,
      selfConsumptionShare, selfConsumed, exported, gridCoverage,
      selfConsumptionSavings, feedInRevenue, annualSavings, investment,
      payback, panels, ownShareOfProduction,
      roofLimited: maxRoofCapacity < requestedCapacity
    };
  }

  function distributeMonthlyYield(monthlyRadiation, annualYield) {
    if (!Array.isArray(monthlyRadiation) || monthlyRadiation.length !== 12 ||
        monthlyRadiation.some(value => !Number.isFinite(value) || value < 0) ||
        !Number.isFinite(annualYield) || annualYield < 0) {
      throw new TypeError("Monthly radiation must contain 12 non-negative finite values and annual yield must be non-negative.");
    }
    const total = monthlyRadiation.reduce((sum, value) => sum + value, 0);
    if (total <= 0) throw new RangeError("Monthly radiation total must be greater than zero.");
    return monthlyRadiation.map(value => annualYield * value / total);
  }

  return { estimate, distributeMonthlyYield };
});
