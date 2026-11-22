# Markenunabhängiger Photovoltaik-Rechner

Kostenloser, unverbindlicher PV-Rechner für Eigenheime in Deutschland. Keine Herstellerbindung, keine Anmeldung und keine Weitergabe von Formulardaten an einen Server.

## Veröffentlichung mit GitHub Pages

1. Öffne im Repository Settings → Pages.
2. Wähle unter Build and deployment als Source: GitHub Actions.
3. Speichere die Einstellung.
4. Öffne Actions → Deploy PV calculator to GitHub Pages und starte bei Bedarf Run workflow.
5. Nach erfolgreichem Lauf ist die Website unter https://patrykbadzsoba-cyber.github.io/Kalkulator-fotowoltaiczny-/ erreichbar.

Wichtig: GitHub Actions kann den Pages-Dienst nicht selbst aktivieren, wenn GitHub die Erstellung der Pages-Site für das Workflow-Token blockiert. Die einmalige Konfiguration unter Settings → Pages muss dann vom Repository-Eigentümer vorgenommen werden. Danach veröffentlicht der Workflow automatisch bei jedem Push auf main.

## Funktionen

- Schätzung der PV-Leistung anhand von Jahresverbrauch und nutzbarer Dachfläche
- Berücksichtigung von Dachausrichtung und Dachneigung über vereinfachte Planungsfaktoren
- Modellierter Jahresertrag, saisonale Monatsverteilung aus historischen Open-Meteo-Strahlungsdaten, Eigenverbrauch und Netzeinspeisung
- Individuell einstellbarer Strompreis und Einspeisevergütung
- Optionale Batteriespeicher-Kapazität
- Geschätzte Investition, jährlicher finanzieller Nutzen und einfache Amortisationszeit
- Druckbarer Ergebnisbericht (im Druckdialog als PDF speicherbar)
- CSV-Export der Eingaben, Annahmen und Berechnungsergebnisse
- Responsives Layout für Smartphones und Desktop

## Modellannahmen

- Rund 4,5 m² nutzbare Dachfläche je kWp installierter Leistung (vereinfachter Planungswert)
- Standard-Ertragsbasis: 950 kWh je kWp und Jahr; bei gewähltem Standort wird sie anhand historischer Open-Meteo-Strahlungsdaten angenähert
- Die Ziel-Anlagengröße wird anhand des geschätzten lokalen Jahresertrags sowie Dachausrichtung und -neigung dimensioniert; Dachfläche begrenzt die Größe
- Eigenverbrauchsquote als vereinfachtes Modell, abhängig von der Speichergröße
- Beispielmodul: 430 Wp
- Zahlen- und Währungsformat nach deutschem Gebietsschema
- Anlagen- und Speicherpreise sind frei änderbare Beispielwerte, keine Marktpreis-Zusage

Wenn der PVGIS-Proxy aktiv ist, werden die PVGIS-Jahres- und Monatswerte für die ausgewählte Koordinate, Dachneigung und Dachausrichtung verwendet. Die Proxy-URL wird in `pvgis-config.js` gesetzt. Solange dort keine verifizierte HTTPS-Worker-URL eingetragen ist, verwendet der Rechner weiterhin die Open-Meteo-Schätzung. Die Monatsverteilung aus Open-Meteo wird nur angezeigt, wenn ausreichend historische tägliche Strahlungsdaten für mindestens drei vollständige Kalenderjahre geladen werden konnten. Sie verteilt den geschätzten Jahresertrag proportional zur mittleren monatlichen Globalstrahlung; sie ist keine separate PVGIS-Simulation. Die Berechnung ist eine erste Orientierung und ersetzt keine standortbezogene Ertragssimulation, Dachprüfung, Netzprüfung oder ein verbindliches Angebot. Verschattung, genaue Dachgeometrie, Standort, Anlagenverluste, Wechselrichter, Speicherwirkungsgrad, Lastprofil, Alterung, Wartung, Finanzierung, Steuern und gesetzliche Änderungen werden nicht vollständig modelliert.

## Partner-Modus für Installationsbetriebe

Ein Installationsbetrieb kann den Rechner mit einem eigenen Kontaktziel verlinken. Beispiel (URL-Parameter müssen URL-kodiert werden):

```text
https://patrykbadzsoba-cyber.github.io/Kalkulator-fotowoltaiczny-/?partner=Seven%20Solar&kontakt=https%3A%2F%2Fseven-solar.de%2Fkontakt%2F
```

- Der CTA erscheint nur, wenn `kontakt` eine gültige HTTPS-Adresse enthält.
- `partner` ist ein optionaler Anzeigename.
- Der Rechner übermittelt keine Eingaben, Berechnungsergebnisse oder Kontaktdaten an uns oder den Partner.
- Der CTA öffnet lediglich die Kontaktseite des Betriebs. Ein Interessent muss dort selbst aktiv eine Anfrage absenden.
- Es gibt in dieser Version keine Lead-Zählung, kein Tracking und keine Conversion-Statistik.

Die Software steht unter der MIT-Lizenz. Sie erlaubt auch die kostenlose kommerzielle Nutzung, Veränderung und Weitergabe unter den Lizenzbedingungen. Eine exklusive oder kostenpflichtige Softwarelizenz für den bestehenden Code wird deshalb nicht verkauft. Ein kostenpflichtiges Angebot kann sich nur auf zusätzliche Dienstleistungen beziehen, z. B. Einrichtung, individuelle Anpassung, betreute Bereitstellung, Wartung und Support. Für den kommerziellen Einsatz muss der jeweilige Betreiber außerdem Einbindung, Markenkennzeichnung, Impressums- und Datenschutzpflichten prüfen. Die Modellwerte sind unverbindliche Schätzungen und kein technisches Angebot.

## Datenschutz und gewerblicher Einsatz

Die Rechenlogik läuft im Browser. Es gibt kein Konto, keine Analyse-/Werbe-Tracker und keine Formularübermittlung. Für die Standortsuche und den standortbezogenen Ertragsrichtwert werden Suchbegriff bzw. Koordinaten an die Open-Meteo-Geocoding- und Wetter-APIs übertragen. Die Kartenkacheln werden von OpenStreetMap geladen; bei einer Kartenauswahl werden die gewählten Koordinaten für die Klimadatenabfrage an Open-Meteo und für die Gebäudeumgebung an OpenStreetMap/Overpass übertragen. Damit werden auch keine Interessentenanfragen an einen Installationsbetrieb übertragen. Eine gewerbliche Veröffentlichung in Deutschland benötigt vor dem Livebetrieb außerdem ein korrektes Impressum und eine auf das tatsächliche Hosting und die eingesetzten Dienste abgestimmte Datenschutzerklärung. Diese Angaben müssen vom Betreiber ergänzt und rechtlich geprüft werden.

## Lizenz

MIT. Siehe LICENSE.


## Gewerbliche Einrichtung für Installationsbetriebe

Eine transparente B2B-Angebotsgrundlage mit Funktionsumfang, Grenzen, Lizenzhinweisen und Freigabekriterien steht in [`docs/COMMERCIAL_OFFER_DE.md`](docs/COMMERCIAL_OFFER_DE.md). Der aktuelle Stand ist noch nicht für einen uneingeschränkten kommerziellen Livebetrieb freigegeben; die offenen technischen und rechtlichen Punkte sind dort ausdrücklich dokumentiert.


## PVGIS aktivieren

Die einmalige Cloudflare-Konfiguration und die erforderlichen GitHub Actions Secrets sind in [`docs/PVGIS-AKTIVIERUNG.md`](docs/PVGIS-AKTIVIERUNG.md) beschrieben. Bis zum erfolgreichen Worker-Deploy und Live-Test bleibt die Open-Meteo-Schätzung aktiv.
