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

Abspielen öffnet die jeweils beteiligten Systeme automatisch und animiert den Informationsfluss. Pause, Weiter, Zurück und Neustart steuern denselben Ablaufzustand. Alle Knoten können unabhängig geöffnet oder geschlossen werden. „Alle öffnen“ und „Übersicht“ steuern die Darstellung. Bei unklarer Kundenzuordnung endet der automatische Weg; Prüfung und Versand bleiben manuell.

Alle Inhalte sind fiktiv und lokal. Es werden keine E-Mails verschickt, keine echten Kundendaten gespeichert und keine KI-, CRM- oder Outlook-APIs aufgerufen. Die vereinfachten Leistungsbeschreibungen sind Demonstrationsinhalte, keine fachliche Wartungsanleitung.

Auf schmalen Bildschirmen sind die Map-Knoten untereinander angeordnet; Tastaturbedienung und reduzierte Bewegung werden berücksichtigt.

## Bildquelle

Das lokal gespeicherte Outlook-Logo (`public/assets/outlook.svg`) stammt von Microsoft Corporation, über [Wikimedia Commons](<https://commons.wikimedia.org/wiki/File:Microsoft_Office_Outlook_(2018%E2%80%932024).svg>). Es kennzeichnet das in der Demo dargestellte System. Die Demo ist kein Microsoft-Produkt. Die Wissensbasis verwendet ein Lucide-Bibliothekssymbol.

Die Verbindungslinien passen sich beim Aufklappen und bei Größenänderungen an die Knotenpositionen an. Der aktive Zweig wird hervorgehoben, die Alternative bleibt gestrichelt sichtbar. Der CRM-Vorgang ist eine lokale Simulation.

## Kunden & Aufträge

Der bisherige CRM-Knoten heißt in der Oberfläche „Kunden & Aufträge“ und ist neutral für Excel, Handwerkersoftware und CRM gestaltet. Eine shadcn/ui-Tabelle zeigt die fiktiven Vorgänge von Lena Hoffmann. „Liste“ und „Kundenakte“ bieten zwei Ansichten derselben Daten. Die Kundenakte enthält Kontakt, Rechnungsadresse und Objekt/Anlage. Historische Vorgänge sind ausdrücklich fiktive Demodaten.

Vor der Verarbeitung sind zwei abgeschlossene Vorgänge sichtbar. Nach dem Kundenabgleich wird eine neue Wartungsanfrage mit dem Status „Angebot vorbereiten“ ergänzt. Die Vorgangsdetails zeigen erfasste Angaben, ursprüngliche Kundenmail und nächste Aufgabe. Eine Anfrage ist noch kein beauftragter Auftrag. Bei unklarer Zuordnung werden keine Kundendetails angezeigt.

## Animierte Wissenssuche

Im Wissensbasis-Zweig bewegt sich ein KI-Symbol während Schritt 2 auf einer frei geschwungenen, zufällig erzeugten Flugbahn über die Mail und anschließend über zwölf Wissensdateien. Der Scan folgt weder den Absätzen noch der Dateireihenfolge. Danach werden die vier Anliegen mit vier passenden, in der Liste verteilten Quellen verbunden. Die acht übrigen Dokumente bleiben aufklappbar und werden als für diese Mail nicht benötigt gekennzeichnet. Eine Ergebnisanzeige macht die Auswahl sichtbar.

Nummerierte Hinweise und Verbindungslinien bleiben nach dem Scan sichtbar. Dieser Demonstrationsschritt dauert ungefähr 18 Sekunden. Pause hält Flugbahn und Fortschritt an; Fortsetzen setzt denselben Durchlauf fort. Neustart oder eine neue Mail erzeugt eine neue Flugbahn. Bei reduzierter Bewegung wird der Vorgang ohne fliegendes Symbol und schneller dargestellt. Alle Zuordnungen stammen aus den lokalen Beispieldaten, nicht aus einem echten KI-Aufruf.
