# PV-Rechner Deutschland — B2B-Angebot für Installationsbetriebe

**Produkt:** Markenunabhängiger Photovoltaik-Rechner für private Haushalte in Deutschland  
**Angebotsform:** Einrichtung, Anpassung und technische Betreuung  
**Status:** Vorbereitete Angebotsgrundlage — die aktuelle Software ist noch nicht für einen uneingeschränkten kommerziellen Livebetrieb freigegeben.

## Kurzbeschreibung

Der PV-Rechner bietet privaten Hauseigentümern eine erste, unverbindliche Orientierung zur möglichen Photovoltaikanlage. Interessenten können Verbrauch, nutzbare Dachfläche, Ausrichtung, Neigung, Verschattung, Strompreis und Speicherannahmen eingeben und erhalten eine modellierte Schätzung zu Anlagengröße, Jahresertrag, Eigenverbrauch, Einspeisung, finanziellem Nutzen und einfacher Amortisationszeit.

Der Rechner ist herstellerneutral und benötigt kein Benutzerkonto. Die Berechnung der Eingaben erfolgt im Browser.

## Nutzen für einen Installationsbetrieb

- Ein digitaler Erstkontaktpunkt auf der eigenen Website oder in Kampagnen.
- Eine nachvollziehbare Vorab-Orientierung für Interessenten vor einem Beratungsgespräch.
- Ein konfigurierbarer Kontakt-Weiterleitungspunkt zur eigenen Kontaktseite.
- Eine druckbare Ergebnisübersicht und ein CSV-Export für die weitere Besprechung.
- Eine neutrale Darstellung ohne Bindung an einen bestimmten Modul- oder Speicherhersteller.

## Was im aktuellen Stand tatsächlich enthalten ist

- Rechner für Anlagengröße, Modulanzahl, modellierten Jahresertrag, Eigenverbrauch, Netzeinspeisung, Nutzen und statische Amortisation.
- Standortsuche und Standortwahl auf einer Karte.
- Historische Globalstrahlungsdaten von Open-Meteo als Grundlage einer standortbezogenen Ertragsschätzung, sofern genügend Daten verfügbar sind.
- Modellierte Monatsverteilung, Druckansicht/PDF über den Browser und CSV-Export.
- Optionaler Kontaktlink des Installationsbetriebs über HTTPS-URL-Parameter.
- Keine Anmeldung und keine Übermittlung der Verbrauchs- und Kosteneingaben an den Betreiber oder den Installationsbetrieb.

## Was ausdrücklich noch nicht angeboten wird

- Noch keine produktiv bestätigten PVGIS-Ergebnisse. Der Frontend-Client ist integriert und kann PVGIS 5.3 nutzen, sobald der Cloudflare-Worker veröffentlicht und seine echte HTTPS-URL in `pvgis-config.js` eingetragen ist. Der letzte Worker-Deploy scheiterte an fehlenden GitHub Actions Secrets; bis zur erfolgreichen Live-Prüfung bleibt die Open-Meteo-Schätzung aktiv.
- Keine stündliche Simulation des Haushaltsverbrauchs oder der Speichersteuerung.
- Keine Dachvermessung, Statikprüfung, Verschattungsanalyse oder verbindliche Anlagenplanung.
- Keine automatische Lead-Übermittlung, kein CRM, keine Lead-Zählung und keine Conversion-Statistik.
- Keine bestätigten Kundenreferenzen, Partnerlogos, Bewertungen oder garantierten Einsparungen.
- Keine Rechtsberatung und keine automatisch bereitgestellten Betreiberangaben wie Impressum oder Datenschutzerklärung.

## Möglicher Leistungsumfang

Der konkrete Auftrag kann nach technischer Freigabe folgende Dienstleistungen umfassen:

1. **Einrichtung:** Konfiguration des Rechners für den Webauftritt des Betriebs.
2. **Gestaltung:** Anpassung von Farben, Logo, Texten und Kontaktziel.
3. **Bereitstellung:** Unterstützung bei Hosting, Domain und Veröffentlichung.
4. **Wartung:** Technische Aktualisierungen, Fehlerbehebung und regelmäßige Funktionskontrolle.
5. **Erweiterungen:** Separat vereinbarte Funktionen, zum Beispiel CRM-Anbindung oder Lead-Statistik, nach Spezifikation und Datenschutzprüfung.

Jeder Leistungsumfang wird vor Auftragserteilung schriftlich festgelegt. Preise werden erst nach Klärung von Anpassungsumfang, Hosting und Supportaufwand angeboten; diese Angebotsgrundlage enthält bewusst keine erfundenen Marktpreise.

## Transparenz der Berechnung

Die aktuelle Ertragsberechnung verwendet historische Globalstrahlungsdaten von Open-Meteo und ein vereinfachtes Jahresmodell. Monatswerte sind eine Verteilung des geschätzten Jahresertrags, keine eigenständige PVGIS-Simulation. Eigenverbrauch und Speicherwirkung werden über eine vereinfachte Jahresquote angenähert. Die Amortisationszeit ist statisch und berücksichtigt unter anderem nicht vollständig Finanzierung, Steuern, Wartung, Reparaturen, Degradation oder künftige Energiepreise.

Alle angezeigten Geld- und Ertragswerte sind Szenario-Schätzungen auf Basis der Benutzereingaben. Sie sind weder ein verbindliches Angebot noch eine Ertrags- oder Renditegarantie.

## Lizenz und Nutzungsrechte

Der vorhandene Quellcode steht unter der MIT-Lizenz. Diese erlaubt unter ihren Bedingungen die kommerzielle Nutzung, Veränderung und Weitergabe. Das bestehende Projekt kann deshalb nicht als exklusiv lizenzierbares Softwareprodukt mit ausschließlichen Rechten am unveränderten Code angeboten werden.

Gegenstand eines entgeltlichen Auftrags sind zusätzliche Leistungen wie Einrichtung, individuelle Anpassung, Bereitstellung, Wartung und Support. Lizenzhinweise und Copyright-Vermerke müssen bei Weitergabe entsprechend der MIT-Lizenz erhalten bleiben. Für neu entwickelte Bestandteile sind Rechte und Lizenzbedingungen im jeweiligen Auftrag eindeutig zu vereinbaren.

## Voraussetzungen vor einem bezahlten Liveeinsatz

Vor einer produktiven Kundeninstallation müssen mindestens folgende Punkte abgeschlossen und geprüft sein:

- aktueller GitHub-Pages-Stand erfolgreich veröffentlicht und öffentliche URL extern geprüft;
- Standortsuche, Karte, Berechnung, Monatsdarstellung, CSV und Druck/PDF auf Smartphone und Desktop getestet;
- PVGIS-Proxy bereitgestellt und live getestet, bevor PVGIS als Datenquelle beworben wird;
- korrekte Betreiberangaben, Impressum und Datenschutzerklärung für den tatsächlichen Betreiber und die eingesetzten Drittanbieter ergänzt;
- Datenschutz- und Auftragsverarbeitungsfragen für das konkrete Hosting und mögliche spätere Integrationen geklärt;
- vollständiger Abnahmetest mit dem jeweiligen Installationsbetrieb dokumentiert.

## Nächster Schritt

Ein Pilotauftrag sollte zunächst als klar abgegrenzte Einrichtung und Anpassung vereinbart werden. Der Installationsbetrieb erhält vor einer Freigabe eine Demo, eine Liste der enthaltenen Funktionen und Grenzen sowie ein schriftliches Abnahmeprotokoll. Ein produktiver Einsatz wird erst nach Erfüllung der oben genannten Freigabekriterien zugesagt.
