const form = document.querySelector("#pv-form");
const el = (id) => document.getElementById(id);
const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const errorBox = el("calc-error");
const resultsPanel = document.querySelector(".results-panel");

function clearResults() {
  ["system-size","panel-count","yield","self-use","self-use-detail","savings","payback","investment","coverage","summary"].forEach((id) => {
    if (id === "system-size") el(id).textContent = "–";
    else el(id).textContent = "–";
  });
  el("used-bar").style.width = "0%";
  el("export-bar").style.width = "0%";
}
function fail(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  resultsPanel.classList.add("has-error");
  clearResults();
}
function calculate() {
  errorBox.hidden = true;
  resultsPanel.classList.remove("has-error");
  const raw = ["consumption","roof-area","electricity-price","feed-in","battery","system-cost","battery-cost"];
  for (const id of raw) {
    if (el(id).value.trim() === "") return fail("Bitte fülle alle Eingabefelder aus. Leere Werte können nicht berechnet werden.");
    if (!Number.isFinite(Number(el(id).value))) return fail("Bitte gib gültige Zahlen in allen Feldern ein.");
  }
  const consumption = Number(el("consumption").value);
  const roofArea = Number(el("roof-area").value);
  const orientation = Number(el("orientation").value);
  const tilt = Number(el("tilt").value);
  const electricityPrice = Number(el("electricity-price").value);
  const feedIn = Number(el("feed-in").value);
  const battery = Number(el("battery").value);
  const systemCost = Number(el("system-cost").value);
  const batteryCost = Number(el("battery-cost").value);
  if (consumption <= 0 || roofArea <= 0) return fail("Stromverbrauch und nutzbare Dachfläche müssen größer als 0 sein.");
  if (electricityPrice <= 0 || feedIn < 0 || battery < 0 || systemCost <= 0 || batteryCost < 0) return fail("Bitte prüfe Strompreis, Einspeisevergütung und Kostenangaben.");

  // Transparent preliminary planning model; site-specific shading and losses are not simulated.
  const maxRoofCapacity = roofArea / 4.5;
  const requestedCapacity = consumption / 1000;
  const capacity = Math.min(maxRoofCapacity, requestedCapacity);
  const annualYield = capacity * 950 * orientation * tilt;
  const selfConsumptionShare = Math.min(0.78, 0.28 + (battery > 0 ? Math.min(0.42, battery / Math.max(consumption / 1000, 1) * 0.12) : 0));
  const selfConsumed = Math.min(consumption, annualYield * selfConsumptionShare);
  const exported = Math.max(0, annualYield - selfConsumed);
  const gridCoverage = Math.min(100, selfConsumed / consumption * 100);
  const annualSavings = selfConsumed * electricityPrice + exported * feedIn;
  const investment = capacity * systemCost + battery * batteryCost;
  const payback = annualSavings > 0 ? investment / annualSavings : Infinity;
  const panels = Math.round(capacity * 1000 / 430);

  el("system-size").innerHTML = capacity.toLocaleString("de-DE", {maximumFractionDigits: 2}) + ' <small>kWp</small>';
  el("panel-count").textContent = "Ungefähr " + number.format(panels) + " Module à 430 Wp · Dachmaximum " + maxRoofCapacity.toLocaleString("de-DE", {maximumFractionDigits: 2}) + " kWp";
  el("yield").textContent = number.format(annualYield);
  el("self-use").textContent = number.format(selfConsumed);
  el("self-use-detail").textContent = "von " + number.format(consumption) + " kWh Verbrauch";
  el("savings").textContent = euro.format(annualSavings);
  el("payback").textContent = Number.isFinite(payback) ? payback.toLocaleString("de-DE", {maximumFractionDigits: 1}) + " Jahre" : "–";
  el("investment").textContent = "Investition ca. " + euro.format(investment);
  el("coverage").textContent = gridCoverage.toLocaleString("de-DE", {maximumFractionDigits: 0}) + " % deines Jahresverbrauchs";
  const ownShareOfProduction = annualYield > 0 ? selfConsumed / annualYield * 100 : 0;
  el("used-bar").style.width = ownShareOfProduction + "%";
  el("export-bar").style.width = (100 - ownShareOfProduction) + "%";
  const roofLimited = maxRoofCapacity < requestedCapacity;
  el("summary").textContent = (roofLimited
    ? "Achtung: Die Dachfläche begrenzt die Anlage. Für " + requestedCapacity.toLocaleString("de-DE", {maximumFractionDigits: 1}) + " kWp wären ungefähr " + (requestedCapacity * 4.5).toLocaleString("de-DE", {maximumFractionDigits: 0}) + " m² nutzbare Fläche nötig. "
    : "Die Dachfläche bietet rechnerisch Platz für die angesetzte Anlagengröße. ")
    + "Mit den eingegebenen Annahmen könnten etwa " + euro.format(annualSavings)
    + " Stromkostenersparnis und Einspeiseerlöse pro Jahr entstehen. Der Eigenverbrauch deckt rechnerisch rund "
    + gridCoverage.toLocaleString("de-DE", {maximumFractionDigits: 0}) + " % deines Jahresbedarfs.";
}
form.addEventListener("input", calculate);
form.addEventListener("change", calculate);
form.addEventListener("reset", () => requestAnimationFrame(calculate));
calculate();
