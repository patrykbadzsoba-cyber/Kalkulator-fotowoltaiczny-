# PV-Rechner Deutschland — Produktionsreife

Stand: 21.11.2026  
Status: technischer Arbeitsplan; Funktionen gelten erst nach Live-Test als fertig.

## 1. Bestand (im Repository geprüft)

Bereits vorhanden:
- Standortsuche über Open-Meteo Geocoding und Browser-Geolocation
- Gebäudegrundrisse über OpenStreetMap/Overpass als unverbindliche Orientierung
- Eingaben für Verbrauch, Dachfläche, Ausrichtung, Neigung, Verschattung, Strompreis, Einspeisevergütung und Speicher
- automatische Modellrechnung
- Druckansicht für PDF sowie CSV-Export
- GitHub Pages Deployment

Aktuelle fachliche Grenzen:
- Der standortbezogene Ertrag wird aus Open-Meteo-Strahlungsdaten und einem pauschalen Faktor abgeleitet; das ist keine PVGIS-Systemsimulation.
- Die Monatsproduktion wird nicht ausgewiesen.
- Der Eigenverbrauch wird aus einer vereinfachten Jahresquote abgeleitet; ein stündliches Lastprofil und eine zeitliche Speicher-Simulation fehlen.
- Die Amortisation ist eine einfache Division von Investition durch jährlichen Nutzen; laufende Kosten, Degradation, Ersatzinvestitionen, Finanzierung und Preisentwicklung fehlen.
- Die Gebäudegrundriss-Erkennung vermisst kein Dach. Der 65-%-Wert bleibt eine unverbindliche Startannahme.

## 2. Technische Voraussetzung für PVGIS

Die offizielle JRC-Dokumentation bestätigt:
- PVGIS 5.3 stellt den PVcalc-Endpunkt unter /api/v5_3/PVcalc bereit.
- PVcalc liefert Jahres- und Monatswerte für netzgekoppelte PV-Anlagen.
- Direkte AJAX-Aufrufe an PVGIS aus dem Browser sind ausdrücklich nicht erlaubt.

Daraus folgt: Der statische GitHub-Pages-Client darf PVGIS nicht direkt aufrufen. Vor der UI-Integration muss ein eigener serverseitiger Proxy bereitgestellt werden (z. B. ein kostenloser Worker-Endpunkt). Der Client ruft danach ausschließlich diesen eigenen Proxy auf. Solange der Proxy nicht deployed und getestet ist, bleibt die vorhandene Open-Meteo-Schätzung aktiv und wird nicht als PVGIS ausgegeben.

## 3. Umsetzung in Arbeitspaketen

### A — PVGIS-Proxy und Ertragsmodell
- Serverlosen Proxy mit fester PVGIS-Upstream-Adresse bereitstellen.
- Nur erforderliche Parameter akzeptieren: Koordinaten, Neigung und Azimut.
- Wertebereiche serverseitig validieren; Peakpower und Systemverluste als kontrollierte Modellparameter setzen.
- CORS ausschließlich für die tatsächliche Rechner-Domain erlauben; keine Wildcard-Freigabe.
- Upstream-Fehler und Timeouts kontrolliert behandeln; Antworten kurzzeitig cachen. Rate-Limits müssen zusätzlich auf der Hosting-Ebene konfiguriert werden.
- PVGIS 5.3 JSON-Antwort mit Jahreswert E_y und zwölf Monatswerten E_m validieren.
- Azimut-Konvention dokumentieren: 0° Süd, +90° West, -90° Ost.
- Quelle, API-Version, Abrufdatum, Koordinaten und verwendete Parameter im Bericht ausweisen.
- Fallback nur als vereinfachte Schätzung kennzeichnen.

### B — Monatliche Energiebilanz
- Monatsproduktion in kWh anzeigen.
- Monatliche Verbrauchsverteilung als explizite Annahme kennzeichnen; zunächst darf ein gleichmäßiger Monatsverbrauch als Standard dienen.
- Eigenverbrauch und Einspeisung nicht als gemessene Werte darstellen.
- Speicherwirkung nur mit klar ausgewiesener Modellannahme berechnen; keine stündliche Simulation behaupten, solange kein Lastprofil vorliegt.

### C — Wirtschaftlichkeit
- Investitionskosten getrennt nach PV-Anlage und Speicher ausweisen.
- Jährliche Einsparung durch vermiedenen Netzbezug und Einspeiseerlös separat ausweisen.
- Laufende Kosten und optionale Ersatzinvestitionen als Eingaben oder klar sichtbare Annahmen ergänzen.
- Einfache Amortisationszeit ausdrücklich als statische Näherung bezeichnen.
- Optional eine mehrjährige Cashflow-Sicht mit Degradation und Sensitivität ergänzen.
- Keine Renditegarantie, keine verbindliche Finanzierungs- oder Steuerberatung.

### D — Bericht
- PDF-Bericht mit Standort, Dachannahmen, PVGIS-Quelle/Parametern, Monatswerten, Wirtschaftlichkeit und Warnhinweisen.
- CSV mit Rohwerten und Einheiten; deutsche Zahlen-/Dezimalformate korrekt handhaben.
- Bericht muss Datum und Modellversion enthalten.

### E — Qualität / Freigabe
- Unit-Tests für Größenbegrenzung, Ertrag, Eigenverbrauch, Einspeisung, Kosten und Grenzfälle.
- Proxy-Tests für gültige Parameter, ungültige Koordinaten, Upstream-Fehler, Timeout und CORS.
- Browser-Tests für Standortsuche, manuelle Eingaben, PDF-Druck und CSV-Export.
- Mobilansicht und Tastaturbedienung prüfen.
- GitHub Actions muss Syntaxprüfung und Tests vor Deployment ausführen.
- Nach Deployment Live-URL, HTTP-Erreichbarkeit und Kernfunktionen tatsächlich prüfen.

## 4. Freigabekriterien

Die Anwendung darf erst als verkaufsfähig bezeichnet werden, wenn:
- PVGIS-Proxy deployed und erreichbar ist;
- PVGIS-Jahres- und Monatswerte nachweislich geladen werden;
- Monats- und Jahreswerte reproduzierbar sind;
- die verwendeten Annahmen im UI und Bericht sichtbar sind;
- Tests automatisiert laufen und erfolgreich sind;
- PDF-/CSV-Exporte die angezeigten Werte korrekt wiedergeben;
- ein kompletter Testlauf auf Mobilgerät und Desktop dokumentiert ist;
- Impressum, Datenschutzinformationen und Verantwortlichkeit für den Betrieb geklärt sind.

## 5. Unverhandelbare Produktregeln

- Keine erfundenen Daten, Kunden, Partner, Bewertungen oder Testergebnisse.
- Keine versteckten Kosten und keine irreführenden Versprechen.
- Keine Übermittlung von Verbrauchs- und Kosteneingaben an externe Dienste.
- Standort- und API-Datenübertragung transparent erklären.
- Markenneutral bleiben.
- Eine Schätzung klar als Schätzung kennzeichnen.

## 6. Nächste technische Reihenfolge

1. Serverseitigen PVGIS-Proxy bereitstellen und testen.
2. PVGIS-Jahres- und Monatsdaten in UI, CSV und PDF integrieren.
3. Modell für Verbrauch, Speicher und Wirtschaftlichkeit präzisieren.
4. automatisierte Tests und CI ergänzen.
5. PRs prüfen, mergen und erst danach Live-Version validieren.
