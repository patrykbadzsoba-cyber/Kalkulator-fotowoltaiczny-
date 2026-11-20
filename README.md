# Markenunabhängiger Photovoltaik-Rechner

Kostenloser, unverbindlicher PV-Rechner für Eigenheime in Deutschland. Keine Herstellerbindung, keine Anmeldung und keine Weitergabe von Formulardaten an einen Server.

## Start

Die Anwendung besteht aus statischen Dateien. Öffne `index.html` lokal im Browser oder veröffentliche das Repository über **GitHub Pages** (Repository → Settings → Pages → Deploy from a branch → `main` / `/(root)`).

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
- Zahlen- und Währungsformat nach deutschem Gebietsschema (z. B. 1.575,10 €)
- Eingabeprüfung für leere bzw. ungültige Werte und Warnung bei begrenzter Dachfläche
- Anlagen- und Speicherpreise sind frei änderbare Beispielwerte, keine Marktpreis-Zusage

Die Berechnung ist eine erste Orientierung und ersetzt keine standortbezogene Ertragssimulation, Dachprüfung, Netzprüfung oder ein verbindliches Angebot. Verschattung, genaue Dachgeometrie, Standort, Anlagenverluste, Wechselrichter, Speicherwirkungsgrad, Lastprofil, Alterung, Wartung, Finanzierung, Steuern und gesetzliche Änderungen werden nicht vollständig modelliert.

## Datenschutz

Die Berechnung läuft vollständig im Browser. Die Anwendung enthält kein Konto, kein Tracking und keine Formularübermittlung.

## Lizenz

MIT. Siehe [LICENSE](LICENSE).
