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
- Modellierter Jahresertrag, Eigenverbrauch und Netzeinspeisung
- Individuell einstellbarer Strompreis und Einspeisevergütung
- Optionale Batteriespeicher-Kapazität
- Geschätzte Investition, jährlicher finanzieller Nutzen und einfache Amortisationszeit
- Responsives Layout für Smartphones und Desktop

## Modellannahmen

- Rund 4,5 m² nutzbare Dachfläche je kWp installierter Leistung (vereinfachter Planungswert)
- Standard-Ertragsbasis: 950 kWh je kWp und Jahr, angepasst mit vereinfachten Ausrichtungs- und Neigungsfaktoren
- Eigenverbrauchsquote als vereinfachtes Modell, abhängig von der Speichergröße
- Beispielmodul: 430 Wp
- Zahlen- und Währungsformat nach deutschem Gebietsschema
- Anlagen- und Speicherpreise sind frei änderbare Beispielwerte, keine Marktpreis-Zusage

Die Berechnung ist eine erste Orientierung und ersetzt keine standortbezogene Ertragssimulation, Dachprüfung, Netzprüfung oder ein verbindliches Angebot. Verschattung, genaue Dachgeometrie, Standort, Anlagenverluste, Wechselrichter, Speicherwirkungsgrad, Lastprofil, Alterung, Wartung, Finanzierung, Steuern und gesetzliche Änderungen werden nicht vollständig modelliert.

## Datenschutz und gewerblicher Einsatz

Die Berechnung läuft vollständig im Browser. In dieser Version gibt es kein Konto, kein Tracking und keine Formularübermittlung. Damit werden auch keine Interessentenanfragen an einen Installationsbetrieb übertragen. Eine gewerbliche Veröffentlichung in Deutschland benötigt vor dem Livebetrieb außerdem ein korrektes Impressum und eine auf das tatsächliche Hosting und die eingesetzten Dienste abgestimmte Datenschutzerklärung. Diese Angaben müssen vom Betreiber ergänzt und rechtlich geprüft werden.

## Lizenz

MIT. Siehe LICENSE.
