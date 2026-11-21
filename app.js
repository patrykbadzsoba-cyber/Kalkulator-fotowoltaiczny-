const form = document.querySelector("#pv-form");
const el = (id) => document.getElementById(id);
const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const errorBox = el("calc-error");
const resultsPanel = document.querySelector(".results-panel");
const locationStatus = el("location-status");
const locationDetails = el("location-details");
const buildingStatus = el("building-status");
const buildingResults = el("building-results");
const searchButton = el("location-search-button");
const locateButton = el("locate-button");
const partnerCta = el("partner-cta");
const partnerCtaTitle = el("partner-cta-title");
const partnerCtaLink = el("partner-cta-link");

// Partner mode: pass an HTTPS contact URL via ?kontakt= and an optional name via ?partner=.
(function configurePartnerCta() {
  const params = new URLSearchParams(window.location.search);
  const contact = params.get("kontakt");
  const partner = (params.get("partner") || "deinem Fachbetrieb").trim().slice(0, 80);
  if (!contact) return;
  try {
    const url = new URL(contact);
    if (url.protocol !== "https:" || url.username || url.password) return;
    partnerCtaTitle.textContent = "Weiter zu " + partner;
    partnerCtaLink.href = url.href;
    partnerCta.hidden = false;
  } catch (_) {
    // Invalid partner URLs are ignored; the calculator remains usable.
  }
})();
let selectedLocation = null;
let localYieldPerKwp = 950;
let locationRequest = 0;

function clearResults() {
  ["system-size","panel-count","yield","self-use","self-use-detail","savings","savings-detail","payback","investment","coverage","summary"].forEach((id) => {
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
  const shading = Number(el("shading").value);
  const electricityPrice = Number(el("electricity-price").value);
  const feedIn = Number(el("feed-in").value);
  const battery = Number(el("battery").value);
  const systemCost = Number(el("system-cost").value);
  const batteryCost = Number(el("battery-cost").value);
  if (consumption <= 0 || roofArea <= 0) return fail("Stromverbrauch und nutzbare Dachfläche müssen größer als 0 sein.");
  if (electricityPrice <= 0 || feedIn < 0 || battery < 0 || systemCost <= 0 || batteryCost < 0) return fail("Bitte prüfe Strompreis, Einspeisevergütung und Kostenangaben.");

  const maxRoofCapacity = roofArea / 4.5;
  // Size the array against the estimated local annual yield, not a fixed 1,000 kWh/kWp assumption.
  const requestedCapacity = consumption / Math.max(localYieldPerKwp * orientation * tilt * shading, 1);
  const capacity = Math.min(maxRoofCapacity, requestedCapacity);
  const annualYield = capacity * localYieldPerKwp * orientation * tilt * shading;
  const selfConsumptionShare = Math.min(0.78, 0.28 + (battery > 0 ? Math.min(0.42, battery / Math.max(consumption / 1000, 1) * 0.12) : 0));
  const selfConsumed = Math.min(consumption, annualYield * selfConsumptionShare);
  const exported = Math.max(0, annualYield - selfConsumed);
  const gridCoverage = Math.min(100, selfConsumed / consumption * 100);
  const selfConsumptionSavings = selfConsumed * electricityPrice;
  const feedInRevenue = exported * feedIn;
  const annualSavings = selfConsumptionSavings + feedInRevenue;
  const investment = capacity * systemCost + battery * batteryCost;
  const payback = annualSavings > 0 ? investment / annualSavings : Infinity;
  const panels = Math.round(capacity * 1000 / 430);

  el("system-size").innerHTML = capacity.toLocaleString("de-DE", {maximumFractionDigits: 2}) + ' <small>kWp</small>';
  el("panel-count").textContent = "Ungefähr " + number.format(panels) + " Module à 430 Wp · Dachmaximum " + maxRoofCapacity.toLocaleString("de-DE", {maximumFractionDigits: 2}) + " kWp";
  el("yield").textContent = number.format(annualYield);
  el("self-use").textContent = number.format(selfConsumed);
  el("self-use-detail").textContent = "von " + number.format(consumption) + " kWh Verbrauch";
  el("savings").textContent = euro.format(annualSavings);
  el("savings-detail").textContent = "Eigenverbrauch: " + euro.format(selfConsumptionSavings) + " · Einspeisung: " + euro.format(feedInRevenue);
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
    + "Berücksichtigte Verschattung: " + Math.round((1 - shading) * 100) + " %. Mit den eingegebenen Annahmen könnten etwa " + euro.format(annualSavings)
    + " Stromkostenersparnis und Einspeiseerlöse pro Jahr entstehen. Der Eigenverbrauch deckt rechnerisch rund "
    + gridCoverage.toLocaleString("de-DE", {maximumFractionDigits: 0}) + " % deines Jahresbedarfs."
    + (selectedLocation ? " Standort: " + selectedLocation.name + ". Lokaler Ertragsrichtwert: " + number.format(localYieldPerKwp) + " kWh/kWp/Jahr." : " Es wird ein allgemeiner Richtwert von 950 kWh/kWp/Jahr verwendet.");
}
async function loadSolarEstimate(lat, lon, label) {
  const requestId = ++locationRequest;
  selectedLocation = { lat, lon, name: label };
  findNearbyBuildings(lat, lon);
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
    const dates = data.daily?.time || [];
    const radiation = data.daily?.shortwave_radiation_sum || [];
    if (dates.length !== radiation.length || dates.length < 300) {
      throw new Error("Für diesen Standort liegen nicht genügend Strahlungsdaten vor.");
    }
    const years = {};
    dates.forEach((date, i) => {
      const value = radiation[i];
      if (!Number.isFinite(value)) return;
      const year = date.slice(0, 4);
      if (!years[year]) years[year] = { totalMj: 0, days: 0 };
      years[year].totalMj += value;
      years[year].days += 1;
    });
    // Ignore incomplete calendar years: averaging partial years as full years understates yield.
    const completeYears = Object.values(years).filter(year => year.days >= 300);
    if (completeYears.length < 3) {
      throw new Error("Es liegen weniger als drei vollständige Jahre mit ausreichenden Strahlungsdaten vor.");
    }
    const avgAnnualKwhM2 = completeYears.reduce((sum, year) => sum + year.totalMj, 0) / completeYears.length / 3.6;
    localYieldPerKwp = Math.max(650, Math.min(1250, avgAnnualKwhM2 * 0.80));
    locationStatus.textContent = "Standort und lokale Klimadaten geladen. Verwendet werden " + completeYears.length + " vollständige Kalenderjahre aus dem Zeitraum 2021–2025.";
    locationDetails.textContent = label + " · " + Math.abs(Number(lat)).toFixed(4) + "° " + (lat >= 0 ? "N" : "S") + ", " + Math.abs(Number(lon)).toFixed(4) + "° " + (lon >= 0 ? "E" : "W") + " · geschätzter Ertrag: " + number.format(localYieldPerKwp) + " kWh/kWp/Jahr.";
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
    const place = data.results?.find(p => p.country_code === "DE");
    if (!place) throw new Error("Kein passender Ort in Deutschland gefunden. Bitte prüfe die Eingabe.");
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

function csvCell(value) {
  return '"' + String(value ?? "").replace(/"/g, '""') + '"';
}
function exportResultsCsv() {
  if (errorBox.hidden === false) {
    errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const rows = [
    ["PV-Rechner Deutschland – unverbindliche Schätzung"],
    ["Standort", selectedLocation?.name || "Allgemeiner Richtwert"],
    ["Ertragsannahme", localYieldPerKwp + " kWh/kWp/Jahr"],
    ["Jährlicher Stromverbrauch (kWh)", el("consumption").value],
    ["Nutzbare Dachfläche (m²)", el("roof-area").value],
    ["Dachausrichtung", el("orientation").selectedOptions[0].text],
    ["Dachneigung", el("tilt").selectedOptions[0].text],
    ["Verschattung (Modellannahme)", el("shading").selectedOptions[0].text],
    ["Strompreis (EUR/kWh)", el("electricity-price").value],
    ["Einspeisevergütung (EUR/kWh)", el("feed-in").value],
    ["Speicher (kWh)", el("battery").value],
    ["Anlagengröße (kWp)", el("system-size").textContent],
    ["Jahresertrag (kWh)", el("yield").textContent],
    ["Eigenverbrauch (kWh)", el("self-use").textContent],
    ["Jährlicher finanzieller Gesamtnutzen (EUR)", el("savings").textContent],
    ["Ersparnis durch Eigenverbrauch (EUR)", el("savings-detail").textContent.split(" · ")[0]],
    ["Einspeiseerlös (EUR)", el("savings-detail").textContent.split(" · ")[1]],
    ["Geschätzte Investition", el("investment").textContent],
    ["Einfache Amortisationszeit", el("payback").textContent],
    ["Hinweis", "Modellrechnung, keine Ertragsgarantie und kein verbindliches Angebot."]
  ];
  const csv = "\uFEFF" + rows.map(row => row.map(csvCell).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pv-berechnung.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
el("print-report").addEventListener("click", () => {
  if (!errorBox.hidden) {
    errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  window.print();
});
el("export-csv").addEventListener("click", exportResultsCsv);
calculate();

// OpenStreetMap building footprints: discovery aid, not a roof survey.
// A footprint is never treated as measured roof area; the user must explicitly apply
// a conservative 65% starting estimate and can edit it afterwards.
function polygonAreaM2(points) {
  if (!Array.isArray(points) || points.length < 3) return 0;
  const lat0 = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const metersPerLat = 111132;
  const metersPerLon = 111320 * Math.cos(lat0 * Math.PI / 180);
  const originLat = points[0].lat;
  const originLon = points[0].lon;
  const xy = points.map(p => ({ x: (p.lon - originLon) * metersPerLon, y: (p.lat - originLat) * metersPerLat }));
  let area = 0;
  for (let i = 0; i < xy.length; i++) {
    const j = (i + 1) % xy.length;
    area += xy[i].x * xy[j].y - xy[j].x * xy[i].y;
  }
  return Math.abs(area / 2);
}
function distanceMeters(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180;
  const x = (lon2 - lon1) * rad * Math.cos((lat1 + lat2) * rad / 2);
  const y = (lat2 - lat1) * rad;
  return Math.sqrt(x*x + y*y) * 6371000;
}
async function findNearbyBuildings(lat, lon) {
  buildingStatus.textContent = "Kartierte Gebäude werden in der Umgebung gesucht …";
  buildingResults.replaceChildren();
  const query = '[out:json][timeout:20];way(around:60,' + Number(lat) + ',' + Number(lon) + ')["building"];out tags geom;';
  try {
    const endpoint = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("OpenStreetMap/Overpass antwortet derzeit nicht.");
    const data = await response.json();
    const candidates = (data.elements || []).map(item => {
      const points = (item.geometry || []).map(p => ({lat:p.lat, lon:p.lon}));
      if (points.length > 2 && points[0].lat === points[points.length-1].lat && points[0].lon === points[points.length-1].lon) points.pop();
      const area = polygonAreaM2(points);
      const center = points.length ? {
        lat: points.reduce((s,p)=>s+p.lat,0)/points.length,
        lon: points.reduce((s,p)=>s+p.lon,0)/points.length
      } : null;
      return { id:item.id, tags:item.tags || {}, area, center };
    }).filter(b => b.area >= 15 && b.center)
      .map(b => ({...b, distance:distanceMeters(lat,lon,b.center.lat,b.center.lon)}))
      .filter(b => b.distance <= 60)
      .sort((a,b)=>a.distance-b.distance)
      .slice(0,8);
    if (!candidates.length) {
      buildingStatus.textContent = "In 60 m Umgebung wurde kein geeigneter Gebäudegrundriss gefunden. Bitte prüfe die Adresse oder gib die Dachfläche manuell ein.";
      return;
    }
    buildingStatus.textContent = candidates.length + " kartierte Gebäude gefunden. Wähle nur dann eines aus, wenn es tatsächlich dein Haus ist.";
    for (const building of candidates) {
      const card = document.createElement("article");
      card.className = "building-card";
      const heading = document.createElement("strong");
      heading.textContent = (building.tags.name || building.tags["addr:housenumber"] || "Gebäude") + " · " + Math.round(building.area) + " m² Grundfläche";
      const detail = document.createElement("p");
      const roofTags = [building.tags["roof:shape"], building.tags["roof:angle"] ? "Dachwinkel " + building.tags["roof:angle"] + "°" : "", building.tags["roof:direction"] ? "Dachrichtung " + building.tags["roof:direction"] : ""].filter(Boolean);
      detail.textContent = "Etwa " + Math.round(building.distance) + " m vom gewählten Punkt" + (roofTags.length ? " · Kartierte Dachmerkmale: " + roofTags.join(", ") : " · Keine verlässlichen Dachmerkmale kartiert");
      const apply = document.createElement("button");
      apply.type = "button";
      apply.className = "building-apply";
      apply.textContent = "65 % als vorläufige nutzbare Fläche übernehmen (" + Math.max(6, Math.round(building.area * 0.65)) + " m²)";
      apply.addEventListener("click", () => {
        el("roof-area").value = Math.max(6, Math.min(500, Math.round(building.area * 0.65)));
        calculate();
        buildingStatus.textContent = "Vorläufiger Flächenwert übernommen. Bitte Dachfläche anhand von Plänen oder Messung prüfen.";
        apply.textContent = "Flächenwert übernommen";
        apply.disabled = true;
      });
      card.append(heading, detail, apply);
      buildingResults.append(card);
    }
  } catch (error) {
    buildingStatus.textContent = "Gebäudeabfrage fehlgeschlagen: " + (error.message || "Unbekannter Fehler") + " Bitte Dachfläche manuell eintragen.";
  }
}
