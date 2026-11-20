const form = document.querySelector("#pv-form");
const el = (id) => document.getElementById(id);
const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const errorBox = el("calc-error");
const resultsPanel = document.querySelector(".results-panel");
const locationStatus = el("location-status");
const locationDetails = el("location-details");
const searchButton = el("location-search-button");
const locateButton = el("locate-button");
let selectedLocation = null;
let localYieldPerKwp = 950;
let locationRequest = 0;

function clearResults() {
  ["system-size","panel-count","yield","self-use","self-use-detail","savings","payback","investment","coverage","summary"].forEach((id) => {
    el(id).textContent = "–";
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
    const field = el(id);
    if (field.value.trim() === "") return fail("Bitte fülle alle Eingabefelder aus. Leere Werte können nicht berechnet werden.");
    if (!Number.isFinite(Number(field.value))) return fail("Bitte gib gültige Zahlen in allen Feldern ein.");
    if (!field.checkValidity()) {
      const label = document.querySelector('label[for="' + id + '"]')?.textContent.trim() || id;
      return fail("Bitte prüfe den Wert für „" + label + "“. Er liegt außerhalb des zulässigen Eingabebereichs.");
    }
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

  const maxRoofCapacity = roofArea / 4.5;
  const requestedCapacity = consumption / 1000;
  const capacity = Math.min(maxRoofCapacity, requestedCapacity);
  const annualYield = capacity * localYieldPerKwp * orientation * tilt;
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
    + gridCoverage.toLocaleString("de-DE", {maximumFractionDigits: 0}) + " % deines Jahresbedarfs."
    + (selectedLocation ? " Standort: " + selectedLocation.name + ". Lokaler Ertragsrichtwert: " + number.format(localYieldPerKwp) + " kWh/kWp/Jahr." : " Es wird ein allgemeiner Richtwert von 950 kWh/kWp/Jahr verwendet.");
}
async function loadSolarEstimate(lat, lon, label) {
  const requestId = ++locationRequest;
  selectedLocation = { lat, lon, name: label };
  localYieldPerKwp = 950;
  locationStatus.textContent = "Standort erkannt. Lokale Sonneneinstrahlung wird geladen …";
  locationDetails.hidden = true;
  calculate();
  // Auf Mobilgeräten das Ergebnis direkt nach der Standortwahl sichtbar machen.
  resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    const start = "2021-01-01";
    const end = "2025-12-31";
    const url = "https://archive-api.open-meteo.com/v1/archive?latitude=" + encodeURIComponent(lat)
      + "&longitude=" + encodeURIComponent(lon)
      + "&start_date=" + start + "&end_date=" + end
      + "&daily=shortwave_radiation_sum&timezone=auto";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Solar-Daten konnten nicht abgerufen werden.");
    const data = await response.json();
    if (requestId !== locationRequest) return;
    const values = data.daily?.shortwave_radiation_sum?.filter(v => Number.isFinite(v));
    if (!values || values.length < 300) throw new Error("Für diesen Standort liegen nicht genügend Strahlungsdaten vor.");
    const years = {};
    (data.daily.time || []).forEach((date, i) => {
      const value = data.daily.shortwave_radiation_sum[i];
      if (!Number.isFinite(value)) return;
      const year = date.slice(0, 4);
      years[year] = (years[year] || 0) + value;
    });
    const annualMj = Object.values(years);
    if (!annualMj.length) throw new Error("Die Jahreswerte konnten nicht berechnet werden.");
    const avgAnnualKwhM2 = annualMj.reduce((a,b)=>a+b,0) / annualMj.length / 3.6;
    localYieldPerKwp = Math.max(650, Math.min(1250, avgAnnualKwhM2 * 0.80));
    locationStatus.textContent = "Standort und lokale Klimadaten geladen. Die Berechnung verwendet den Mittelwert der Jahre 2021–2025.";
    locationDetails.textContent = label + " · " + Number(lat).toFixed(4) + "° N, " + Number(lon).toFixed(4) + "° E · geschätzter Ertrag: " + number.format(localYieldPerKwp) + " kWh/kWp/Jahr.";
    locationDetails.hidden = false;
  } catch (error) {
    if (requestId !== locationRequest) return;
    locationStatus.textContent = "Standort gespeichert, aber lokale Klimadaten sind gerade nicht erreichbar. Es wird vorläufig der allgemeine Richtwert verwendet.";
    locationDetails.textContent = label + " · " + Number(lat).toFixed(4) + "°, " + Number(lon).toFixed(4) + "° · 950 kWh/kWp/Jahr (allgemeiner Richtwert).";
    locationDetails.hidden = false;
  }
  calculate();
}
async function searchLocation() {
  const query = el("location-search").value.trim();
  if (query.length < 2) {
    locationStatus.textContent = "Bitte gib mindestens zwei Zeichen einer Stadt oder Postleitzahl ein.";
    return;
  }
  searchButton.disabled = true;
  locationStatus.textContent = "Standort wird gesucht …";
  try {
    const url = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(query) + "&count=5&language=de&format=json";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Standortsuche nicht verfügbar.");
    const data = await response.json();
    const place = data.results?.find(p => p.country_code === "DE") || data.results?.[0];
    if (!place) throw new Error("Kein passender Ort gefunden. Bitte prüfe die Eingabe.");
    const label = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
    await loadSolarEstimate(place.latitude, place.longitude, label);
  } catch (error) {
    locationStatus.textContent = error.message || "Die Standortsuche ist fehlgeschlagen. Bitte versuche es erneut oder nutze deinen Standort.";
  } finally {
    searchButton.disabled = false;
  }
}
searchButton.addEventListener("click", searchLocation);
el("location-search").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchLocation();
  }
});
locateButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = "Dein Browser unterstützt keine Standortfreigabe. Suche stattdessen nach Stadt oder Postleitzahl.";
    return;
  }
  locateButton.disabled = true;
  locationStatus.textContent = "Dein Standort wird abgefragt. Bitte erlaube den Zugriff im Browser.";
  navigator.geolocation.getCurrentPosition(
    position => {
      locateButton.disabled = false;
      const { latitude, longitude } = position.coords;
      loadSolarEstimate(latitude, longitude, "Dein aktueller Standort");
    },
    error => {
      locateButton.disabled = false;
      const messages = {
        1: "Standortzugriff wurde nicht erlaubt. Du kannst stattdessen Stadt oder Postleitzahl eingeben.",
        2: "Dein Standort ist gerade nicht verfügbar. Bitte suche nach Stadt oder Postleitzahl.",
        3: "Die Standortabfrage hat zu lange gedauert. Bitte versuche es erneut."
      };
      locationStatus.textContent = messages[error.code] || "Standort konnte nicht ermittelt werden.";
    },
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
  );
});
form.addEventListener("input", calculate);
form.addEventListener("change", calculate);
form.addEventListener("reset", () => setTimeout(calculate, 0));
calculate();