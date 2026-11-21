# PV-Rechner Deutschland — Produktionsreife

Stand: 21.11.2026  
Status: Arbeitsplan; keine Behauptung einer abgeschlossenen Implementierung.

## 1. Bestand (im Repository geprüft)

Bereits vorhanden:
- Standortsuche über Open-Meteo Geocoding und Browser-Geolocation
- Gebäudegrundrisse über OpenStreetMap/Overpass als unverbindliche Orientierung
- Eingaben für Verbrauch, Dachfläche, Ausrichtung, Neigung, Verschattung, Strompreis, Einspeisevergütung und Speicher
- automatische Modellrechnung
- Druckansicht für PDF sowie CSV-Export
- GitHub Actions mit Quellcode-Validierung und GitHub-Pages-Deployment

Aktuelle fachliche Grenzen:
- Der standortbezogene Ertrag wird aus Open-Meteo-Strahlungsdaten und einem pauschalen Faktor abgeleitet; das ist keine PVGIS-Systemsimulation.
- Die Monatsproduktion wird nicht ausgewiesen.
- Der Eigenverbrauch wird aus einer vereinfachten Jahresquote abgeleitet; ein stündliches Lastprofil und eine zeitliche Speicher-Simulation fehlen.
- Die Amortisation ist eine einfache Division von Investition durch jährlichen Nutzen; laufende Kosten, Degradation, Ersatzinvestitionen, Finanzierung und Preisentwicklung fehlen.
- Die aktuelle Flächen-/Gebäudeerkennung vermisst kein Dach. Der 65-%-Wert bleibt eine unverbindliche Startannahme.

## 2. Zielbild

Ein neutraler, kostenloser PV-Vorrechner für Wohngebäude in Deutschland, der:
1. Standort und Dachparameter nachvollziehbar erfasst;
2. PVGIS-Ertragsdaten mit sichtbarer Quelle und Parametern verwendet;
3. Jahres- und Monatswerte ausweist;
4. Eigenverbrauch, Einspeisung und Speicher als Modellannahmen transparent trennt;
5. Wirtschaftlichkeit als Szenario statt als Renditeversprechen darstellt;
6. einen verständlichen PDF-/CSV-Bericht erzeugt;
7. ohne fingierte Installateure, Kunden, Bewertungen oder Referenzen auskommt.

## 3. Umsetzung in Arbeitspaketen

### A — PVGIS-Ertragsmodell
- PVGIS API v5.3 PVcalc-Endpunkt integrieren.
- Standortkoordinaten, installierte Leistung, Systemverluste, Neigung und Azimut explizit übergeben.
- Azimut-Konvention dokumentieren und die UI-Auswahl eindeutig darauf abbilden.
- Jahreswert E_y sowie monatliche E_m-Werte aus der PVGIS-Antwort übernehmen.
- Quelle, API-Version, Abrufdatum, Koordinaten und verwendete Parameter im Ergebnisbericht anzeigen.
- Bei API-Ausfall keinen PVGIS-Wert vortäuschen: Fallback klar als vereinfachte Schätzung markieren.
- Eingaben validieren und API-Fehler / Zeitüberschreitungen nutzerverständlich behandeln.

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
- API-Antworten mit gültigen und ungültigen Beispielen testen.
- Browser-Tests für Standortsuche, manuelle Eingaben, PDF-Druck und CSV-Export.
- Mobilansicht und Tastaturbedienung prüfen.
- GitHub Actions muss Tests und Syntaxprüfung vor Deployment ausführen.
- Nach Deployment Live-URL, HTTP-Erreichbarkeit und Kernfunktionen tatsächlich prüfen.

## 4. Freigabekriterien

Die Anwendung darf erst als verkaufsfähiges Produkt bezeichnet werden, wenn:
- PVGIS-Integration im Live-Build nachweislich funktioniert;
- Monats- und Jahreswerte reproduzierbar sind;
- die verwendeten Annahmen im UI und Bericht sichtbar sind;
- Tests automatisiert laufen und erfolgreich sind;
- PDF-/CSV-Exporte die angezeigten Werte korrekt wiedergeben;
- ein kompletter Testlauf auf Mobilgerät und Desktop dokumentiert ist;
- Impressum, Datenschutzinformationen und Verantwortlichkeit für den Betrieb geklärt sind.

## 5. Unverhandelbare Produktregeln

- Keine erfundenen Daten, Kunden, Partner, Bewertungen oder Testergebnisse.
- Keine versteckten Kosten und keine irreführenden Versprechen.
- Keine Übermittlung der Verbrauchs- und Kosteneingaben an externe Dienste, sofern dafür keine ausdrücklich erklärte Funktion erforderlich ist.
- Standort- und API-Datenübertragung transparent erklären.
- Markenneutral bleiben.
- Eine Schätzung klar als Schätzung kennzeichnen.

## 6. Nächste technische Reihenfolge

1. PVGIS-Parameter und Azimut-Mapping implementieren.
2. PVGIS-Jahres- und Monatsdaten in UI und Bericht integrieren.
3. Modell für Verbrauch, Speicher und Wirtschaftlichkeit präzisieren.
4. automatisierte Tests ergänzen.
5. Pull Request prüfen, mergen und erst danach Live-Version validieren.
