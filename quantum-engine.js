(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
  const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  function readInputs() {
    return {
      consumption: Number($("consumption").value),
      roofArea: Number($("roof-area").value),
      orientation: Number($("orientation").value),
      tilt: Number($("tilt").value),
      shading: Number($("shading").value),
      electricityPrice: Number($("electricity-price").value),
      feedIn: Number($("feed-in").value),
      battery: Number($("battery").value),
      systemCost: Number($("system-cost").value),
      batteryCost: Number($("battery-cost").value),
      localYieldPerKwp: window.PVAppLocalYield || 950
    };
  }

  // Binary-encoded search with a simulated-annealing schedule. This is a
  // quantum-inspired classical heuristic, not execution on quantum hardware.
  function optimize(base) {
    const maxKw = Math.max(0.5, Math.min(roofKw(base.roofArea), 30));
    const maxBattery = Math.max(0, Math.min(20, base.consumption / 500));
    const kwSteps = Math.max(1, Math.floor(maxKw * 2));
    const batterySteps = Math.max(0, Math.floor(maxBattery * 2));
    const bits = Math.ceil(Math.log2(kwSteps + 1)) + Math.ceil(Math.log2(batterySteps + 1));
    const kwBits = Math.ceil(Math.log2(kwSteps + 1));
    const mask = (1 << Math.min(bits, 20)) - 1;
    const decode = state => {
      const k = state & ((1 << kwBits) - 1);
      const b = state >>> kwBits;
      return {
        kw: Math.max(0.5, Math.min(maxKw, (k + 1) / 2)),
        battery: Math.min(maxBattery, b / 2)
      };
    };
    const score = state => {
      const choice = decode(state);
      const model = window.PVModel.estimate({
        ...base,
        roofArea: choice.kw * 4.5,
        battery: choice.battery
      });
      // Ten-year undiscounted scenario value; same model used by the visible calculator.
      return model.annualSavings * 10 - model.investment;
    };
    let state = Math.floor(Math.random() * (mask + 1));
    let bestState = state;
    let current = score(state);
    let best = current;
    let accepted = 0;
    const iterations = 2400;
    for (let i = 0; i < iterations; i++) {
      const bit = 1 << Math.floor(Math.random() * Math.max(1, bits));
      const candidate = (state ^ bit) & mask;
      const next = score(candidate);
      const temperature = 1800 * Math.pow(0.015, i / iterations);
      if (next > current || Math.random() < Math.exp((next - current) / Math.max(temperature, 1e-9))) {
        state = candidate;
        current = next;
        accepted++;
      }
      if (current > best) {
        best = current;
        bestState = state;
      }
    }
    const choice = decode(bestState);
    const result = window.PVModel.estimate({
      ...base,
      roofArea: choice.kw * 4.5,
      battery: choice.battery
    });
    return { ...choice, result, score: best, iterations, accepted };
  }

  function roofKw(area) { return area / 4.5; }

  function run() {
    const status = $("quantum-status");
    const output = $("quantum-output");
    const button = $("quantum-run");
    if (!window.PVModel) {
      status.textContent = "PV-Modell ist nicht verfügbar.";
      return;
    }
    try {
      button.disabled = true;
      status.textContent = "Optimierung läuft …";
      const base = readInputs();
      const optimized = optimize(base);
      const current = window.PVModel.estimate(base);
      const gain = optimized.result.annualSavings - current.annualSavings;
      output.hidden = false;
      $("quantum-size").textContent = number.format(optimized.kw) + " kWp";
      $("quantum-battery").textContent = number.format(optimized.battery) + " kWh";
      $("quantum-benefit").textContent = euro.format(optimized.result.annualSavings) + "/Jahr";
      $("quantum-payback").textContent = Number.isFinite(optimized.result.payback) ? number.format(optimized.result.payback) + " Jahre" : "nicht berechenbar";
      $("quantum-delta").textContent = (gain >= 0 ? "+" : "") + euro.format(gain) + "/Jahr gegenüber deinen aktuellen Einstellungen";
      $("quantum-meta").textContent = optimized.iterations.toLocaleString("de-DE") + " Suchschritte · " + optimized.accepted.toLocaleString("de-DE") + " akzeptierte Zustandswechsel · klassischer Simulated-Annealing-Lauf";
      status.textContent = "Optimierung abgeschlossen. Die Empfehlung ist ein Szenario aus deinen Eingaben, kein Anlagenangebot.";
    } catch (error) {
      status.textContent = "Optimierung nicht möglich: " + (error.message || "Eingaben prüfen.");
    } finally {
      button.disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if ($("quantum-run")) $("quantum-run").addEventListener("click", run);
  });
})();
