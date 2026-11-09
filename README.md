# Interaktive E-Mail-Workflow-Demo

Lokaler, wiederverwendbarer Demoabschnitt für eine spätere Branchenseite. Noch keine vollständige Geschäftswebsite und keine Entscheidung über das Hosting der späteren Website.

## Start und Prüfung

Voraussetzung: Node.js 22.12+ (hier geprüft mit Node 24) und npm.

```sh
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` prüft TypeScript und erzeugt den statischen Build in `dist/`.

## Umsetzung

React, TypeScript und Vite; originale shadcn/ui-Buttons und -Badges mit Tailwind CSS; Motion und SVG für die Workflow-Map. Die UI-Komponenten wurden mit der offiziellen shadcn-CLI hinzugefügt.

`EmailWorkflowDemo` aus `src/App.tsx` lässt sich als Abschnitt wiederverwenden. Die optionale Property `initialScenario` akzeptiert `partial` (Standard), `complete` und `unknown`. Szenarien und Quellen stehen in `src/data.ts`. `partial` zeigt eine Wartungsanfrage über das CRM, `complete` eine allgemeine Leistungsfrage über die Wissensbasis und `unknown` eine nicht eindeutig zuordenbare Anfrage.

Die Map verbindet vier aufklappbare App-Knoten: Posteingang, Wissensbasis, CRM und Antwortentwurf. Nach dem Posteingang verzweigt sie nach dem E-Mail-Anliegen: allgemeine Fragen nutzen die Wissensbasis, konkrete Wartungsanfragen werden im CRM als Vorgang vorbereitet. Beide Zweige münden in den Antwortentwurf. Die drei Beispielszenarien bestimmen den Pfad deterministisch; es findet keine echte KI-Klassifikation statt. Der Posteingang zeigt eine Outlook-artige Oberfläche mit drei auswählbaren Beispielmails. Dokumente lassen sich in der Wissensbasis öffnen; der Entwurf zeigt vorbereitete Antworten und offene Angaben.

Die Demo wird direkt in der Map bedient. Ein schwebender Wegweiser mit violettem Funkensymbol fliegt zuerst zum Outlook-Knoten und nach dem Öffnen zu den Play-Buttons neben den Beispielmails. Seine Sprechblase nennt den nächsten Klick. Während ein Beispiel läuft, blendet er sich aus; bei einer Pause zeigt er auf den Fortsetzen-Button, nach Abschluss auf eine andere Beispielmail. Der Wegweiser ist selbst anklickbar und löst dieselbe Aktion wie das gezeigte Ziel aus. Auf schmalen Bildschirmen steht er oberhalb des Ziels; bei reduzierter Bewegung ohne Flug und Schweben. Diese starten jeweils ein Beispiel, öffnen die beteiligten Systeme und animieren den Informationsfluss. Derselbe Button pausiert das laufende Beispiel und setzt es fort; abgeschlossene Beispiele lassen sich erneut starten. Die Knoten bleiben unabhängig aufklappbar. Bei unklarer Kundenzuordnung endet der automatische Weg; Prüfung und Versand bleiben manuell. Es gibt keine übergeordnete Steuerleiste und keine zusätzliche Demoüberschrift.

Beim Öffnen des geschlossenen Posteingangs fliegen zuerst drei Briefsymbole in den Outlook-Knoten. Nach etwa 2,2 Sekunden klappt die Mailübersicht darunter auf. Bei reduzierter Bewegung öffnet sich der Posteingang direkt.

Alle Inhalte sind fiktiv und lokal. Es werden keine E-Mails verschickt, keine echten Kundendaten gespeichert und keine KI-, CRM- oder Outlook-APIs aufgerufen. Die vereinfachten Leistungsbeschreibungen sind Demonstrationsinhalte, keine fachliche Wartungsanleitung.

Auf schmalen Bildschirmen sind die Map-Knoten untereinander angeordnet; Tastaturbedienung und reduzierte Bewegung werden berücksichtigt.

## Bildquelle

Das lokal gespeicherte Outlook-Logo (`public/assets/outlook.svg`) stammt von Microsoft Corporation, über [Wikimedia Commons](<https://commons.wikimedia.org/wiki/File:Microsoft_Office_Outlook_(2018%E2%80%932024).svg>). Es kennzeichnet das in der Demo dargestellte System. Die Demo ist kein Microsoft-Produkt. Die Wissensbasis verwendet ein Lucide-Bibliothekssymbol.

Die Verbindungslinien passen sich beim Aufklappen und bei Größenänderungen an die Knotenpositionen an. Der aktive Zweig wird hervorgehoben, die Alternative bleibt gestrichelt sichtbar. Der CRM-Vorgang ist eine lokale Simulation.

## Kunden & Aufträge

Der bisherige CRM-Knoten heißt in der Oberfläche „Kunden & Aufträge“ und ist neutral für Excel, Handwerkersoftware und CRM gestaltet. Eine shadcn/ui-Tabelle zeigt die fiktiven Vorgänge von Lena Hoffmann. „Liste“ und „Kundenakte“ bieten zwei Ansichten derselben Daten. Die Kundenakte enthält Kontakt, Rechnungsadresse und Objekt/Anlage. Historische Vorgänge sind ausdrücklich fiktive Demodaten.

Vor der Verarbeitung sind zwei abgeschlossene Vorgänge sichtbar. Nach dem Kundenabgleich wird eine neue Wartungsanfrage mit dem Status „Angebot vorbereiten“ ergänzt. Die Vorgangsdetails zeigen erfasste Angaben, ursprüngliche Kundenmail und nächste Aufgabe. Eine Anfrage ist noch kein beauftragter Auftrag. Bei unklarer Zuordnung werden keine Kundendetails angezeigt.

Die Beispielmails und Antwortentwürfe sind für die Demo gekürzt; Anliegen, Zuordnungen und offene Rückfragen bleiben erhalten. Mailtext und Entwurfsantworten verwenden 14 px, die AI-Statusanzeige 13 px. Nach dem Start einer Mail bleiben sechs Sekunden zum Lesen, bevor die Verarbeitung beginnt. Die weiteren automatischen Übergänge warten jeweils 4,5 Sekunden.

## Animierte Wissenssuche

Wegweiser und Scan verwenden dasselbe vergrößerte Funkensymbol mit gut lesbarem „AI“ darunter. Am fliegenden Scan steht der aktuelle Status: „Untersuche Mail-Inhalt“, „Durchsuche Betriebswissen“ oder „Ordne passende Quellen zu“. Eine Pause wird ausdrücklich angezeigt; der Wegweiser zeigt zusätzlich „Bereit“, „Pausiert“ oder „Abgeschlossen“. Der Scanstatus steht auch als zugängliche Statusmeldung über der Map.

Im Wissensbasis-Zweig bewegt sich ein KI-Symbol während Schritt 2 auf einer frei geschwungenen, zufällig erzeugten Flugbahn über die Mail und anschließend über zwölf Wissensdateien. Der Scan folgt weder den Absätzen noch der Dateireihenfolge. Danach werden die vier Anliegen mit vier passenden, in der Liste verteilten Quellen verbunden. Die acht übrigen Dokumente bleiben aufklappbar und werden als für diese Mail nicht benötigt gekennzeichnet. Eine Ergebnisanzeige macht die Auswahl sichtbar.

Zuordnungen mit Artikeltiteln und Verbindungslinien bleiben nach dem Scan sichtbar. Dieser Demonstrationsschritt dauert ungefähr 24 Sekunden. Pause hält Flugbahn und Fortschritt an; Fortsetzen setzt denselben Durchlauf fort. Neustart oder eine neue Mail erzeugt eine neue Flugbahn. Bei reduzierter Bewegung wird der Vorgang ohne fliegendes Symbol und schneller dargestellt. Alle Zuordnungen stammen aus den lokalen Beispieldaten, nicht aus einem echten KI-Aufruf.

Bei jeder Zuordnung erscheint „Anliegen N → Artikeltitel“ zunächst groß und halbtransparent über dem jeweiligen Absatz. Innerhalb von etwa 1,55 Sekunden schrumpft der Text und landet als dauerhafte Quellenzuordnung darunter. Der Absatz bleibt sichtbar, die Zuordnung reserviert ihren Platz vorab. Pause hält auch den Stempel an; bei reduzierter Bewegung oder erneutem Öffnen eines pausierten Fensters erscheint die Zuordnung direkt.

Die Wissensdemo verbindet relevante Artikel auch mit den daraus vorbereiteten Antwortabsätzen im Outlook-Entwurf.

Beim Erstellen der wissensgestützten Antwort sammelt das AI-Symbol pro Absatz Informationen am passenden Artikel und folgt anschließend dem schrittweise eingeblendeten Text. Pause/Fortsetzen erhält den Schreibstand; bei reduzierter Bewegung erscheint der vollständige Entwurf direkt.


## Geführte Übernahme in Kunden & Aufträge

Die Wartungsanfrage zeigt vier Übernahmen in Leserichtung: Anlage, Rückfrage, Anliegen und Zeitfenster. Pro Feld wird die Quelle 700 ms hervorgehoben, die AI folgt 1.100 ms einer durchgezogenen Verbindung und das Feld erscheint innerhalb der folgenden 800 ms. Nach 800 ms Abschlussansicht geht es weiter zum Entwurf (insgesamt 11,2 Sekunden statt des bisherigen 4,5-Sekunden-Übergangs).

Das Anliegen verweist auf Wartungsangebot und Startgeräusch; die zusätzliche Quelle erscheint bei aktiver Übernahme oder Auswahl. Fertige Linien bleiben dezent. Felder lassen sich mit Maus, Tastatur oder Touch auswählen und zeigen dann die Quelle. Reservierte Feldhöhen verhindern Layoutsprünge. Pause/Fortsetzen erhält den Fortschritt, ein Neustart setzt ihn zurück. Auf Mobilgeräten ersetzen lokale Hervorhebungen und Quellenhinweise den Flug zwischen den Fenstern; bei reduzierter Bewegung erscheint das Ergebnis direkt.

## Seitenstruktur

- `/`: Branchenneutrale Startseite mit Links zu den Branchenbereichen.
- `/handwerk`: Bestehende interaktive E-Mail-Workflow-Demo.
- `/hausverwaltung`: Eigene Einstiegsseite, vorerst als Bereich im Aufbau.

Die Pfade sind Unterseiten derselben Domain, keine Subdomains. Die Zuordnung erfolgt schlank über den URL-Pfad ohne zusätzliche Router-Abhängigkeit. Beim späteren Hosting müssen Seitenaufrufe auf `index.html` zurückfallen (SPA-Fallback), damit direkte Links und Neuladen funktionieren. Die Branchenbereiche legen keine ausschließliche Spezialisierung fest.
