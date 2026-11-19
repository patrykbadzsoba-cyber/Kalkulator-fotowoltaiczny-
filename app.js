const form = document.querySelector("#pv-form");
const el = (id) => document.getElementById(id);
const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

function calculate() {
  const consumption = Number(el("consumption").value);
  const roofArea = Number(el("roof-area").value);
  const orientation = Number(el("orientation").value);
  const tilt = Number(el("tilt").value);
  const electricityPrice = Number(el("electricity-price").value);
  const feedIn = Number(el("feed-in").value);
  const battery = Number(el("battery").value);
  const systemCost = Number(el("system-cost").value);
  const batteryCost = Number(el("battery-cost").value);

  const values = [consumption, roofArea, orientation, tilt, electricityPrice, feedIn, battery, systemCost, batteryCost];
  if (values.some((v) => !Number.isFinite(v) || v < 0) || consumption <= 0 || roofArea <= 0) return;

  // Planning assumptions, not a site-specific yield simulation.
  const maxRoofCapacity = roofArea / 6; // approx. 6 m² per kWp
  const suggestedCapacity = consumption / 1000;
  const capacity = Math.max(0.1, Math.min(maxRoofCapacity, suggestedCapacity));
  const annualYield = capacity * 950 * orientation * tilt;
  const selfConsumptionShare = Math.min(0.78, 0.28 + (battery > 0 ? Math.min(0.42, battery / Math.max(consumption / 1000, 1) * 0.12) : 0));
  const selfConsumed = Math.min(consumption, annualYield * selfConsumptionShare);
  const exported = Math.max(0, annualYield - selfConsumed);
  const gridCoverage = Math.min(100, selfConsumed / consumption * 100);
  const annualSavings = selfConsumed * electricityPrice + exported * feedIn;
  const investment = capacity * systemCost + battery * batteryCost;
  const payback = annualSavings > 0 ? investment / annualSavings : Infinity;
  const panels = Math.round(capacity * 1000 / 430);

  el("system-size").innerHTML = capacity.toLocaleString("de-DE", {maximumFractionDigits: 1}) + ' <small>kWp</small>';
  el("panel-count").textContent = "Ungefähr " + number.format(panels) + " Module à 430 Wp (Orientierungswert)";
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
  const roofLimited = maxRoofCapacity < suggestedCapacity;
  el("summary").textContent = (roofLimited
    ? "Die angegebene Dachfläche begrenzt die mögliche Anlagengröße. "
    : "Die Dachfläche bietet rechnerisch Platz für die angesetzte Anlagengröße. ")
    + "Mit den eingegebenen Annahmen könnten etwa " + euro.format(annualSavings)
    + " Stromkosten und Einspeiseerlöse pro Jahr entstehen. Der Eigenverbrauch deckt rechnerisch rund "
    + gridCoverage.toLocaleString("de-DE", {maximumFractionDigits: 0}) + " % deines Jahresbedarfs.";
}

form.addEventListener("input", calculate);
form.addEventListener("change", calculate);
form.addEventListener("reset", () => requestAnimationFrame(calculate));
calculate();
