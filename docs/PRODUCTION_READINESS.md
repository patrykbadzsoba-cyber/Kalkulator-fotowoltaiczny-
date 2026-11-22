# PV-Rechner Deutschland — Produktionsreife

Stand: 21.11.2026

## 1. Status der Version auf main

Der aktuelle Quellcode enthält bereits:
- Rechnerformular mit Jahresverbrauch, Dachfläche, Ausrichtung, Neigung, Verschattung, Strompreis, Einspeisevergütung und Speicher.
- automatische Berechnung von Anlagengröße, Modulanzahl, Jahresertrag, Eigenverbrauch, Einspeisung, finanziellem Nutzen und statischer Amortisationszeit.
- Standortsuche über Open-Meteo Geocoding und Browser-Geolocation.
- standortbezogene Ertragsannahme aus historischen Open-Meteo-Strahlungsdaten (2021–2025), sofern mindestens drei ausreichend vollständige Kalenderjahre verfügbar sind.
- Monatsdiagramm und Monatswerte im CSV-Export. Die Monatsverteilung skaliert das historische Strahlungsprofil auf den geschätzten Jahresertrag.
- Druckansicht für PDF und CSV-Export.
- optionale Weiterleitung zu einer Partner-Kontaktseite über HTTPS-URL-Parameter.
- unverbindliche OpenStreetMap-Gebäudegrundrisssuche in der Nähe des ausgewählten Punkts.

Die Hauptversion enthält jetzt zusätzlich eine interaktive OpenStreetMap-Karte (Leaflet). Ein Klick auf die Karte setzt den Berechnungspunkt, verschiebt den Marker, lädt die lokalen Klimadaten und startet die Gebäudegrundrisssuche. Diese neue Karteninteraktion ist im Quellcode vorhanden, muss nach erfolgreichem Pages-Deploy aber noch im Browser auf Smartphone und Desktop geprüft werden. Der Marker bestätigt Koordinaten, keine hausnummerngenaue Adresse. Der Gebäudegrundriss ist kein Dachaufmaß und darf nicht als bestätigte Dachfläche ausgegeben werden.

## 2. Fachliche Grenzen

- Die aktuelle Live-Berechnungslogik verwendet Open-Meteo-Strahlungsdaten und einen vereinfachten Ertragsfaktor. Sie ist keine PVGIS-Systemsimulation.
- Monatswerte sind eine modellierte Verteilung des geschätzten Jahresertrags anhand historischer monatlicher Globalstrahlung; keine PVGIS-Monatswerte und keine Messwerte.
- Eigenverbrauch und Speicherwirkung beruhen auf einer vereinfachten Jahresquote. Es gibt keine stündliche Verbrauchs- oder Speicher-Simulation.
- Die Amortisation ist eine statische Näherung: Investition geteilt durch den modellierten jährlichen Nutzen. Laufende Kosten, Degradation, Ersatzinvestitionen, Finanzierung, Steuern und Preisentwicklung sind nicht vollständig modelliert.
- Preise für Anlage und Speicher sind editierbare Beispielannahmen, keine Marktpreis-Zusage.
- Die Gebäudefläche aus OpenStreetMap ist nur eine Orientierung. Der 65-%-Startwert ist eine grobe Annahme und muss vom Nutzer geprüft werden.

## 3. PVGIS-Proxy — vorbereitet, aber nicht produktiv integriert

Im Repository vorhanden:
- `worker/pvgis-proxy.js`: Cloudflare Worker-Proxy für PVGIS 5.3 mit Parameterprüfung, CORS-Allowlist, Timeout, Antwortprüfung und Rate-Limit-Binding.
- `pvgis-client.js` und `pvgis-config.js`: Frontend-Client und bewusst leere Proxy-URL-Konfiguration. Die echte Worker-URL wird erst nach erfolgreichem Cloudflare-Deploy eingetragen.
- `wrangler.toml`: Worker-Konfiguration.
- `.github/workflows/deploy-pvgis-worker.yml`: Workflow für die Bereitstellung bei Änderungen an Worker-Dateien.

Noch nicht bestätigt:
- erfolgreicher Cloudflare-Worker-Deploy;
- Die letzte dokumentierte Deploy-Ausführung am 21.11.2026 scheiterte bereits bei der Secret-Prüfung: `CLOUDFLARE_API_TOKEN` und `CLOUDFLARE_ACCOUNT_ID` waren leer; deshalb wurde kein Worker veröffentlicht.
- konfigurierte `PVGIS_RATE_LIMITER`-Binding (20 Anfragen pro Minute und Client-IP; Cloudflare beschreibt diese Limits als approximativ und pro Standort);
- aktive Worker-URL;
- erfolgreicher Live-Aufruf mit erlaubtem CORS-Origin;
- Integration der Worker-URL in das Frontend;
- Anzeige von verifizierten PVGIS-Jahres- und Monatswerten.

Der Client darf PVGIS nicht direkt aus dem Browser aufrufen. Bis Proxy-Deploy und Live-Test abgeschlossen sind, muss die App ihre vorhandene Open-Meteo-Schätzung klar als Schätzung kennzeichnen. Es darf keine PVGIS-Integration behauptet werden.

### Cloudflare-Voraussetzungen

Die Schritt-für-Schritt-Anleitung zur einmaligen Aktivierung liegt in `docs/PVGIS-AKTIVIERUNG.md`.

Der Deploy-Workflow benötigt die GitHub-Actions-Secrets:
- `CLOUDFLARE_API_TOKEN` — Cloudflare API Token mit Workers Scripts: Edit.
- `CLOUDFLARE_ACCOUNT_ID` — Account-ID des Cloudflare-Kontos.

Außerdem muss die `workers.dev`-Subdomain des Kontos aktiviert sein. Diese Kontoeinstellungen und Secrets können nicht aus dem GitHub-Quellcode abgeleitet oder durch einen normalen Repository-Datei-Commit ersetzt werden. Keine Zugangsdaten in den Quellcode schreiben.

## 4. GitHub Actions / Veröffentlichung

- Pull Request #8 (Monatsproduktion und Tests) ist in `main` gemergt.
- Pull Request #6 (PVGIS-Proxy-Vorbereitung und Produktionsreife-Dokumentation) ist in `main` gemergt.
- Für den nach PR #15 gemergten Main-Commit `1e00261bae9828b4df16556a9927b3258a9fb877` wurde der GitHub-Pages-Workflow am 22.11.2026 um 11:26 UTC erfolgreich abgeschlossen. GitHub meldete `Reported success`; die veröffentlichte URL ist https://patrykbadzsoba-cyber.github.io/Kalkulator-fotowoltaiczny-/.
- Die Pages-Veröffentlichung führte vor dem Deploy die Quelltextprüfung und `node --test` aus; der Workflow endete erfolgreich.
- Der Cloudflare-Deploy-Workflow für denselben Commit endete am 22.11.2026 mit `failure`, weil `CLOUDFLARE_API_TOKEN` und `CLOUDFLARE_ACCOUNT_ID` in GitHub Actions leer waren. Die Schritte zur Quelltextprüfung und zum Deploy wurden übersprungen. Es wurde kein Worker veröffentlicht.

Die erfolgreiche ältere Pages-Ausführung beweist nicht, dass der neueste Stand live ist. Die öffentliche URL muss nach einem erfolgreichen aktuellen Deployment separat per HTTP und Browser getestet werden.

## 5. Automatisierte Tests

Vorhandene Node.js-Tests prüfen:
- Dimensionierung anhand von Verbrauch und Dachfläche;
- Begrenzung durch Dachfläche;
- Energiebilanz aus Eigenverbrauch und Einspeisung;
- vereinfachten Batterieeffekt;
- Kostenberechnung und ungültige Eingaben;
- Monatsverteilung, saisonalen Verlauf und ungültige Strahlungsprofile.

Der Pages-Workflow führt Syntaxprüfungen und `node --test` aus. Diese Unit-Tests sind kein Ersatz für Browser-End-to-End-Tests auf Mobilgerät und Desktop.

## 6. Freigabekriterien für kommerzielle Nutzung

Die Anwendung darf erst als vollständig produktionsreif oder als PVGIS-basiert beworben werden, wenn:
1. der aktuelle Main-Stand erfolgreich veröffentlicht wurde;
2. die öffentliche URL von außen erreichbar ist;
3. Formular, Standortsuche, Berechnung, Monatsdiagramm, CSV und Druck/PDF im Browser getestet wurden;
4. die Worker-URL eingerichtet und der PVGIS-Live-Aufruf einschließlich CORS und zwölf Monatswerten verifiziert wurde, falls PVGIS beworben werden soll;
5. Impressum und Datenschutzerklärung für den tatsächlichen Betreiber und das Hosting ergänzt wurden;
6. die Annahmen und Modellgrenzen in UI und Bericht sichtbar bleiben.

## 7. Unverhandelbare Produktregeln

- Keine erfundenen Daten, Kunden, Partner, Bewertungen oder Testergebnisse.
- Keine Rendite- oder Ertragsgarantie.
- Keine versteckten Kosten oder irreführenden Versprechen.
- Keine Übermittlung von Verbrauchs- und Kosteneingaben an externe Dienste.
- Standort- und API-Datenübertragung transparent erklären.
- Markenneutral bleiben.
- Schätzungen klar als Schätzungen kennzeichnen.
- MIT-Lizenz beachten: kostenpflichtig angeboten werden können zusätzliche Dienstleistungen wie Einrichtung, individuelle Anpassung, Hosting-Betreuung und Support, nicht ein exklusives Nutzungsrecht am bestehenden Code.

## 8. Nächste technische Schritte

1. Einen neuen erfolgreichen Pages-Workflow auf dem aktuellen `main` erzielen und die öffentliche URL verifizieren.
2. Cloudflare-Secrets und `workers.dev`-Subdomain prüfen; Worker deployen und die URL ermitteln.
3. Die echte Worker-URL in `pvgis-config.js` eintragen und PVGIS-Jahres- und Monatswerte per Live-Test verifizieren.
4. Neue interaktive Kartenwahl nach erfolgreichem Pages-Deploy auf Smartphone und Desktop testen; hausnummerngenaue Adressbestätigung ist weiterhin nicht implementiert.
5. Browser-End-to-End-Tests und rechtliche Betreiberangaben abschließen.
