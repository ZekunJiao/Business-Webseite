# Business-Webseite

Persönliche Geschäftswebsite von Zekun Jiao (Software, KI und Automatisierung) mit branchenneutraler Startseite und eigenständigen Branchenseiten. Die interaktive E-Mail-Demo für das Handwerk liegt unter `/handwerk`. Daneben ist `/hausverwaltung` als eigenständige Vorlagenseite initialisiert: mit Einstieg und Platzhaltern für Anwendungsfälle, Demos sowie Vorstellung/Kontakt. Es gibt keine Navigation zwischen den Branchenseiten; `/hausverwaltung` wird nur über die direkt eingegebene oder zugesandte Adresse erreicht. Das ist keine Zugriffsbeschränkung.

Die branchenneutrale Startseite `/` verlinkt auf beide Branchen. Der frühere Pfad `/workflow` leitet auf `/handwerk` weiter; `#workflow` bleibt dort ein Sprunganker zur Demo. Beide Branchenpfade können direkt aufgerufen und neu geladen werden (Vite stellt dafür den SPA-Fallback bereit). Unbekannte Pfade zeigen eine neutrale Fehlerseite ohne Branchenlinks. Als Hosting ist Cloudflare Workers vorgesehen (siehe Abschnitt „Hosting“).

## Start und Prüfung

Voraussetzung: Node.js 22.12+ (hier geprüft mit Node 24) und npm.

```sh
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` prüft TypeScript und erzeugt den statischen Build in `dist/`.

## Hosting

Gewählt: Cloudflare Workers (statische Dateien aus `dist/`), automatisch aus dem GitHub-Repository `ZekunJiao/Business-Webseite` (Branch `main`). Das Projekt heißt `business-webseite`; Konfiguration in `wrangler.jsonc`. Einstellungen im Cloudflare-Dashboard unter Workers & Pages → Projekt → Settings → Build:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Node-Version: über `.node-version` (22)

`wrangler.jsonc` stellt `not_found_handling: single-page-application` ein. Deshalb funktionieren `/handwerk` und `/hausverwaltung` auch beim direkten Aufruf. Jeder Push auf `main` veröffentlicht automatisch neu. Die Adresse lautet `https://business-webseite.xiaokun77.workers.dev` (zu finden unter Settings → Domains & Routes). Eine eigene Domain ist noch nicht festgelegt.

Vor dem Versenden des Links offen: Kontaktdaten in `src/contact.ts` und Bestätigung der Werkzeuge in `src/integrations.ts`.

### Passwortschutz

Die gesamte Seite ist passwortgeschützt (`worker/index.ts`, HTTP Basic Auth; der Worker liefert nach korrektem Passwort die Dateien aus `dist/` aus, siehe `run_worker_first` in `wrangler.jsonc`). Der Browser fragt nach Benutzername und Passwort; der Benutzername ist beliebig, nur das Passwort zählt. Das Passwort steht nicht im Repository: Im Cloudflare-Dashboard unter dem Projekt → Settings → Variables and Secrets → Add → Typ „Secret“, Name `SITE_PASSWORD`. Ohne gesetztes Passwort antwortet die Seite mit 503 (gesperrt). Antworten tragen `X-Robots-Tag: noindex, nofollow`, damit Suchmaschinen nichts indexieren. Lokal (`npm run dev`, `npm run preview`) läuft der Worker nicht; dort gibt es keinen Schutz. Passwort ändern: Secret ändern. Zum Entfernen `main`, `run_worker_first` und `binding` aus `wrangler.jsonc` sowie den Ordner `worker/` löschen.

## Umsetzung

React, TypeScript und Vite; originale shadcn/ui-Buttons und -Badges mit Tailwind CSS; Motion und SVG für die Workflow-Map. Die UI-Komponenten wurden mit der offiziellen shadcn-CLI hinzugefügt.

## Workflow-Tabs

> Vorerst ausgeblendet, siehe Abschnitt „Hero auf /handwerk“.

Unter `/handwerk` stehen browserähnliche Tabs für „E-Mail-Anfragen“, „Telefonassistenz“ und „Angebote“ über einem gemeinsamen Demobereich. Die E-Mail-Demo ist zunächst ausgewählt. Die beiden anderen Tabs enthalten ausdrücklich als „Demo in Vorbereitung“ gekennzeichnete Platzhalter. Es gibt keine aufklappbare Workflow-Auswahl.

Die Tab-Leiste bleibt beim Scrollen innerhalb des Demobereichs am oberen Rand sichtbar und lässt sich auf schmalen Bildschirmen horizontal scrollen. Pfeiltasten wechseln zwischen den Tabs; Pos1/Ende wählen den ersten/letzten Tab. Tab und Panel sind über ARIA verknüpft. Die Bedienung verwendet vorhandene shadcn/ui-Buttons.

Beim Wechsel bleibt der Zustand der E-Mail-Demo erhalten; laufende Wiedergabe pausiert und wird beim Zurückwechseln nicht automatisch fortgesetzt. Ein noch laufender Posteingangs-Introflug wird abgebrochen. `EmailWorkflowDemo` unterstützt dafür die optionale Property `active` (Standard `true`).

Direktlinks wählen einen Tab über `?demo=telefonassistenz` bzw. `?demo=angebote`; ohne Parameter oder mit einem unbekannten Wert öffnet sich E-Mail. Ein Tabwechsel aktualisiert die Adresse, Zurück/Vorwärts stellt die Auswahl wieder her. `#workflow` springt weiterhin zum gesamten Demobereich. Die Branchenseiten bleiben ohne gegenseitige Links.

`EmailWorkflowDemo` aus `src/App.tsx` lässt sich als Abschnitt wiederverwenden. Die optionale Property `initialScenario` akzeptiert `partial` (Standard), `complete` und `unknown`. Szenarien und Quellen stehen in `src/data.ts`. `partial` zeigt eine Wartungsanfrage über die Kundenverwaltung, `complete` eine allgemeine Leistungsfrage über die Wissensbasis und `unknown` eine nicht eindeutig zuordenbare Anfrage.

Die Map verbindet vier aufklappbare App-Knoten: Posteingang, Wissensbasis, Kundenverwaltung und Antwortentwurf. Nach dem Posteingang verzweigt sie nach dem E-Mail-Anliegen: allgemeine Fragen nutzen die Wissensbasis, konkrete Wartungsanfragen werden in der Kundenverwaltung als Anfrage vorbereitet. Beide Zweige münden in den Antwortentwurf. Die drei Beispielszenarien bestimmen den Pfad deterministisch; es findet keine echte KI-Klassifikation statt. Der Posteingang zeigt eine Outlook-artige Oberfläche mit drei auswählbaren Beispielmails. Dokumente lassen sich in der Wissensbasis öffnen; der Entwurf zeigt vorbereitete Antworten und offene Angaben.

Die Demo wird direkt in der Map bedient. Ein schwebender Wegweiser mit violettem Funkensymbol fliegt zuerst zum Outlook-Knoten und nach dem Öffnen zu den Play-Buttons neben den Beispielmails. Ein kleiner Pfeil zeigt auf den nächsten Klick; das frühere Textkästchen entfällt. Die Klickanweisung bleibt als zugänglicher Name erhalten. Während ein Beispiel läuft, blendet er sich aus; bei einer Pause zeigt er auf den Fortsetzen-Button, nach Abschluss auf eine andere Beispielmail. Der Wegweiser ist selbst anklickbar und löst dieselbe Aktion wie das gezeigte Ziel aus. Auf schmalen Bildschirmen steht er oberhalb des Ziels; bei reduzierter Bewegung ohne Flug und Schweben. Diese starten jeweils ein Beispiel, öffnen die beteiligten Systeme und animieren den Informationsfluss. Derselbe Button pausiert das laufende Beispiel und setzt es fort; abgeschlossene Beispiele lassen sich erneut starten. Die Knoten bleiben unabhängig aufklappbar. Bei unklarer Kundenzuordnung endet der automatische Weg; Prüfung und Versand bleiben manuell. Es gibt keine übergeordnete Steuerleiste und keine zusätzliche Demoüberschrift.

Beim Öffnen des geschlossenen Posteingangs fliegen zuerst drei Briefsymbole in den Outlook-Knoten. Nach etwa 1,5 Sekunden klappt die Mailübersicht darunter auf. Bei reduzierter Bewegung öffnet sich der Posteingang direkt.

Alle Inhalte sind fiktiv und lokal. Es werden keine E-Mails verschickt, keine echten Kundendaten gespeichert und keine KI-, Kundenverwaltungs- oder Outlook-APIs aufgerufen. Die vereinfachten Leistungsbeschreibungen sind Demonstrationsinhalte, keine fachliche Wartungsanleitung.

Auf schmalen Bildschirmen sind die Map-Knoten untereinander angeordnet; Tastaturbedienung und reduzierte Bewegung werden berücksichtigt.

## Absender und Kontakt

Name, Rolle, Kurzvorstellung und Kontaktdaten stehen in `src/contact.ts`. Vor dem Versenden des Links `email` und `phone` dort eintragen; leere Felder werden nicht angezeigt, dann erscheint kein Kontaktlink. Der Block „Kontakt“ (`AuthorBlock`, Anker `#kontakt`) steht unter den Demos, die Kopfzeile verlinkt dorthin. Bisher ist kein Kontaktkanal bestätigt.

## Orientierung in der E-Mail-Demo

- Die Statusleiste der Demo bleibt beim Scrollen unter der Tab-Leiste sichtbar.
- Beim Abspielen scrollt die Seite sanft zum jeweils aktiven Fenster (Posteingang, Kundenverwaltung/Wissensbasis, Entwurf, Ergebnis). Bei reduzierter Bewegung ist das deaktiviert.
- Nach dem fertigen Entwurf fasst `DemoResult` in drei bis vier Schritten zusammen, was erkannt, nachgeschlagen bzw. vorbereitet wurde und dass das Team prüft und selbst sendet. Es werden keine Einsparungen behauptet.
- Orange Platzhalter im Entwurf werden mit „Orange = noch offen. Hier ergänzt dein Team.“ erklärt.
- Schriftgröße: In Hero, Kopfzeile und Überblick-Animation sind Labels und Kicker mindestens 12 px, Beschriftungen 13 px. Die ausgeblendete Detaildemo nutzt weiterhin 11–12 px.

## Handyansicht der E-Mail-Demo

Bis 760 px Breite (`MOBILE_QUERY` in `src/lib/useMediaQuery.ts`) zeigt `MobileEmailFlow` statt der Map drei Schritte untereinander: Mail, Kundenverwaltung bzw. Betriebswissen, Antwortentwurf, danach das Ergebnis. Ein „Weiter“-Button blendet jeweils den nächsten Schritt ein; „Noch einmal von vorn“ startet neu. Die Inhalte sind vereinfachte Darstellungen derselben Beispieldaten ohne Verbindungslinien.

## Hero auf /handwerk

Der Hero hat einen Einstiegs-Button „Ablauf ansehen“ (Sprung zu `#ueberblick`) und einen Textlink „Kennenlerngespräch vereinbaren“ zum Kontaktblock (`#kontakt`). Die Überblick-Animation ist der Einstieg. Die Detaildemo (Workflow-Tabs mit E-Mail-Demo, `#workflow`) ist vorerst ausgeblendet: Der Einbau in `src/App.tsx` und der Link „Vollständige Demo ansehen“ in `src/components/OverviewFlow.tsx` sind auskommentiert, der Code (`HandwerkWorkflows`, `EmailWorkflowDemo`, `MobileEmailFlow` usw.) bleibt erhalten. Zum Reaktivieren die Kommentare entfernen; die Abschnitte unten beschreiben die Detaildemo.

## Anwendungsfälle auf /handwerk

`UseCaseStage` (`src/components/UseCaseStage.tsx`, Anker `#ueberblick`) zeigt oben eine Karte je Anwendungsfall und darunter eine Bühne mit genau einer Überblick-Animation für den gewählten Fall. Ein Klick auf eine Karte wechselt den Fall; die Animation startet dabei neu. Weitere Karten mit „In Vorbereitung“ sind sichtbar, aber nicht wählbar und zeigen keine Inhalte.

- **Inhalte:** `src/overviewFlows.ts`. `overviewSets` enthält die Anwendungsfälle mit Karte (`card`), Überschrift und Beispielfällen; `upcomingUseCases` die Platzhalter; `useCaseSection` den Kopf. Ein neuer Anwendungsfall ist ein weiterer Eintrag in `overviewSets`.
- **Direktlink:** `/handwerk?anwendungsfall=anfragen` wählt einen Fall und springt zur Bühne. Ohne Parameter oder mit unbekanntem Wert ist der erste Fall (`telefon`) gewählt. Zurück/Vorwärts stellt die Auswahl wieder her; der Anker `#telefon` funktioniert weiter.
- **Handy (bis 760 px):** Die Karten stehen in einer horizontal scrollbaren Reihe.

## Telefon-Demo

Der Anwendungsfall „Kein Anruf geht verloren“ (`telefon`) zeigt statt des Diagramms `PhoneStory` (`src/components/PhoneStory.tsx`, Inhalte in `src/phoneStory.ts` und `src/phoneLines.json`): einen Vergleich „Ohne/Mit Assistent“ (ohne Zahlen) und darunter zwei getrennte Bereiche:

- **Das Telefonat** (links): Anruferin und digitaler Assistent mit Sprechwelle beim aktiven Sprecher, Status (Klingelt/Verbunden/Beendet) und Gesprächsdauer. Darunter eine Live-Mitschrift als Untertitel: aktuelle Zeile groß, die letzten drei Zeilen klein, nach dem Ende aufklappbar die ganze Mitschrift. Bewusst keine Chatblasen.
- **Dein Handy** (rechts): Sperrbildschirm, der während des Gesprächs still bleibt. Nach dem Gespräch erscheint die Push-Nachricht mit der Zusammenfassung. Darunter füllt sich die Gesprächsnotiz live; offene Angaben sind orange.

Bis 900 px Breite stehen beide untereinander; nach dem Gespräch scrollt die Seite zum Handy.

- **Bedienung:** „Gespräch anhören“ bzw. „Assistent geht ran“ startet, derselbe Button pausiert und setzt an derselben Stelle fort. „Ganzes Gespräch zeigen“ springt zum Ergebnis. „Ton aus“ schaltet auf Lesetempo um.
- **Ton:** vorab erzeugte MP3s je Zeile in `public/assets/phone/line-01.mp3` … `line-08.mp3`, abgespielt über ein `<audio>`-Element, erst nach einem Klick. Kann eine Datei nicht geladen oder abgespielt werden (fehlt, blockiert, startet nicht innerhalb von 6 s), läuft die Mitschrift im Lesetempo weiter und ein Hinweis „Ton konnte nicht abgespielt werden“ erscheint. Bei der Demo steht „Stimmen KI-generiert“.
- **Audio erzeugen (einmalig):** `scripts/generate-phone-audio.mjs` ruft OpenAI Text-to-Speech auf (Modell `gpt-4o-mini-tts`, Assistent Stimme `cedar`, Anruferin `marin`, mit Sprechanweisungen für natürliches Hochdeutsch) und speichert die MP3s. Die Webseite spielt nur diese Dateien ab und ruft keine API auf. `OPENAI_API_KEY` in der Shell oder in einer lokalen `.env` setzen (in `.gitignore`, nie einchecken), dann `npm run audio:phone` (nutzt mit `--use-env-proxy` den Proxy aus `HTTPS_PROXY`, z. B. im Firmennetz). Vorhandene Dateien werden übersprungen; einzelne Zeilen neu: `npm run audio:phone -- --only=3,5`, alle neu: `npm run audio:phone -- --force`. Modell und Stimmen über `OPENAI_TTS_MODEL`, `PHONE_VOICE_ASSISTANT` und `PHONE_VOICE_CALLER` änderbar. Nach Textänderungen in `src/phoneLines.json` die betroffenen Zeilen neu erzeugen. Die MP3s werden eingecheckt. OpenAI hat die Abschaltung von `gpt-4o-mini-tts` für Januar 2027 angekündigt; gespeicherte Dateien bleiben nutzbar.
- **Inhalte:** Betrieb („Haustechnik Muster“), Anruferin und Angaben sind erfunden. Der Assistent stellt sich als digitaler Assistent vor.
- **Technik:** Das bisherige Diagramm mit den Telefon-Beispielfällen steht aufklappbar unter „So hängt es technisch zusammen“ (`OverviewFlow` mit `embedded`) und wird erst beim Aufklappen gerendert.
- **Reduzierte Bewegung:** kein Klingeln, keine Sprechwelle und keine Einblendungen; der Ablauf startet nur auf Klick.
- **Offen:** eine echte Demo-Nummer zum Selbst-Anrufen (braucht Telefonie-Anbieter).

## Posteingang-Demo

Der Anwendungsfall „Anfragen beantworten“ (`anfragen`) zeigt statt des Diagramms `InboxStory` (`src/components/InboxStory.tsx`, Inhalte in `src/inboxStory.ts`): einen Vergleich „Ohne/Mit Assistent“ (ohne Zahlen) und darunter drei nummerierte Spalten in Leserichtung:

1. **Die Anfrage kommt rein:** Eingang mit drei Beispielanfragen (neueste oben); ein Kennzeichen an jeder Zeile zeigt den Eingangsweg („E-Mail“ oder „Formular“). Darunter die geöffnete Anfrage. Beim Lesen markiert der Assistent die übernommenen Stellen gelb wie mit einem Textmarker. Die Formular-Anfrage erscheint als ausgefüllte Formularfelder.
2. **Der Assistent arbeitet:** vier Schritte mit Symbolen (Mail lesen, Kundenverwaltung, Unterlagen bzw. Dringlichkeit, Entwurf). Jeder erledigte Schritt zeigt sein Ergebnis, z. B. „Kein Eintrag: neuer Kunde“ oder das gefundene Dokument.
3. **Für dein Team vorbereitet:** Antwortentwurf, der sich absatzweise füllt, mit Hinweisen „aus deinen Unterlagen: …“ und orangen Stellen „Ergänzt dein Team“. Darunter der „Eintrag in deiner Software“; jedes Feld zeigt, ob es aus der Anfrage oder aus der Kundenverwaltung stammt.

- **Abschluss:** „Prüfen & senden“ füllt die orangen Stellen mit dem Satz des Teams (grün, „Von dir ergänzt“), markiert die Mail als „Beantwortet“ und speichert den Eintrag. Erst dieser Klick sendet; der Assistent sendet nie selbst.
- **Dringend:** Sobald der Assistent die Störung als dringend erkennt, rutscht die Mail im Posteingang nach oben.
- **Fälle:** Neue Anfrage über das Kontaktformular (Badsanierung, Neukunde), Wartungswunsch einer Bestandskundin, Störungsmeldung mit Foto (dringend). Bewusst die drei häufigsten Anfragearten als Annahme, keine erhobenen Zahlen. Betrieb, Personen, Adressen, Anlagen und Dokumentnamen sind erfunden.
- **Bedienung:** Startet einmal von selbst, sobald die Bühne gut im Blick ist (obere zwei Drittel des Fensters). „Pausieren/Fortsetzen“, „Ergebnis zeigen“, danach „Noch einmal“ und „Nächste Mail“. Ein Klick auf eine Mail im Posteingang startet diesen Fall.
- **Schmale Bildschirme (bis 1100 px):** statt drei Spalten ein Umschalter „Anfrage / Assistent / Entwurf“, der dem Ablauf automatisch folgt und sich von Hand umschalten lässt.
- **Reduzierte Bewegung:** kein Autostart, keine Einblendungen oder Markerstriche; jeder Fall erscheint direkt fertig, „Prüfen & senden“ funktioniert weiter.
- **Technik:** Das Diagramm mit denselben drei Fällen steht aufklappbar unter „So hängt es technisch zusammen“. Gemeinsame Layout-Klassen mit der Telefon-Demo heißen `story-*`, eigene Klassen `mailbox-*`.

## Überblick-Animation

Auf der Bühne der Anwendungsfälle zeigt `OverviewFlow` (`src/components/OverviewFlow.tsx`) einen möglichen Ablauf in vier Spalten: Anliegen (E-Mail, Homepage-Formular), Assistent, Werkzeuge (Kundenverwaltung, Betriebswissen) und „Dein Team“. Bei Telefon und Anfragen steht es aufklappbar unter der jeweiligen Demo. Die Beispielfälle des gewählten Anwendungsfalls laufen in einer Schleife. Jeder Fall endet bei der menschlichen Prüfung; es wird nichts automatisch gesendet.

- **Inhalte:** `src/overviewFlows.ts`. Die Anfragen-Fälle sind dieselben drei wie in der Posteingang-Demo (Neue Anfrage per Formular, Wartung, Störung). Das Homepage-Formular ist ein erfundenes Beispiel; die Seite hat kein echtes Formular.
- **Zielsysteme:** im Diagramm bewusst generische Begriffe (Kundenverwaltung, Betriebswissen). Darunter nennt eine Zeile „Anbindbar an Handwerkersoftware, z. B.“ die Programme aus `src/integrations.ts`, mit Logos aus `public/assets/integrations/`. Sie erscheint nur auf schmalen Bildschirmen und bei reduzierter Bewegung; in der Desktop-Animation stehen die Logos bereits im Diagramm. Bestätigt ist: Die Anbindung an Handwerkersoftware ist möglich und die Logos dürfen gezeigt werden. Es gibt nur Tools in der Liste, für die eine Anbindung oder ein Vertrag besteht; aktuell stehen plancraft und ToolTime als Platzhalter dort und sind vor dem Versenden zu bestätigen. Die Aussage lautet „anbindbar“, nicht „bereits angebunden“ oder „Partner“. Ein Marken- oder Simulationshinweis steht bewusst nicht dabei. Das ToolTime-Logo ist für dunklen Grund gedacht und liegt deshalb auf einer dunklen Kachel.
- **Technik:** SVG-Linien mit Dash-Animation und ein Etikett, das entlang der Kurve läuft. Gesteuert wird alles über eine eigene `requestAnimationFrame`-Schleife (wie in den Demo-Overlays). Zeiten stehen in `src/lib/demoTiming.ts` (`OVERVIEW_STEP_MS`, `OVERVIEW_HOLD_MS`) und laufen in Echtzeit, ohne `DEMO_PLAYBACK_SPEED`. Ein Durchlauf aller drei Fälle dauert etwa 20 Sekunden.
- **Bedienung:** „Pausieren/Fortsetzen“ und drei Fall-Buttons. Bei Pause zeigt ein Sprung direkt das fertige Ergebnis des Falls. Die Animation läuft nur, solange der Abschnitt sichtbar und der Browser-Tab aktiv ist.
- **Schmale Bildschirme (bis 1100 px):** statt Linien eine nummerierte Schrittliste des gewählten Falls, die weiterläuft.
- **Reduzierte Bewegung:** keine Schleife; stattdessen alle drei Fälle als statische Schrittlisten. Die Textfassung steht außerdem als `sr-only`-Alternative bereit, die Animation selbst ist für Screenreader ausgeblendet.
- Die Idee eines Überblicks mit Kanälen links und Systemen rechts ist von einer ähnlichen Darstellung inspiriert; Begriffe, Gestaltung und Inhalte sind eigenständig.

## Bildquelle

Das lokal gespeicherte Outlook-Logo (`public/assets/outlook.svg`) stammt von Microsoft Corporation, über [Wikimedia Commons](<https://commons.wikimedia.org/wiki/File:Microsoft_Office_Outlook_(2018%E2%80%932024).svg>). Es kennzeichnet das in der Demo dargestellte System. Die Demo ist kein Microsoft-Produkt. Die Wissensbasis verwendet ein Lucide-Bibliothekssymbol.

Die Verbindungslinien passen sich beim Aufklappen und bei Größenänderungen an die Knotenpositionen an. Der aktive Zweig wird hervorgehoben, die Alternative bleibt gestrichelt sichtbar. Die Anfrage in der Kundenverwaltung ist eine lokale Simulation.

## Kundenverwaltung

Der Knoten heißt in der Oberfläche „Kundenverwaltung“ (früher „Kunden & Vorgänge“, „Kunden & Aufträge“ bzw. CRM) und ist neutral für Excel oder Handwerkersoftware gestaltet; „CRM“ wird auf der Seite nicht mehr verwendet. Eine shadcn/ui-Tabelle zeigt die fiktiven Anfragen und Aufträge von Lena Hoffmann sowie zwei weitere fiktive Kunden. „Alle Anfragen“ und „Kundenakte“ bieten zwei Ansichten derselben Daten. Die Kundenakte enthält Kontakt, Rechnungsadresse und Objekt/Anlage; das Anlagenmodell ist nicht hinterlegt, das Baujahr steht erst nach der Verarbeitung als „laut E-Mail · zu bestätigen“ da. Historische Einträge sind ausdrücklich fiktive Demodaten.

Vor der Verarbeitung sind zwei abgeschlossene Einträge sichtbar. Nach dem Kundenabgleich wird eine neue Wartungsanfrage mit dem Status „Neue Anfrage“ ergänzt. Die Anfragedetails trennen „Angaben aus der E-Mail“, „Aufgaben“ und „Intern im Büro“ und weisen auf die Prüfung durch das Team hin (nur ein Hinweistext, keine Freigabe-Funktion). Eine Anfrage ist noch kein beauftragter Auftrag. Bei unklarer Zuordnung werden keine Kundendetails angezeigt.

Die Beispielmails und Antwortentwürfe sind für die Demo gekürzt; Anliegen, Zuordnungen und offene Rückfragen bleiben erhalten. Mailtext und Entwurfsantworten verwenden 14 px, die AI-Statusanzeige 13 px. Nach dem Start einer Mail leuchtet die erste Verbindung zweimal für jeweils 1,5 Sekunden auf; nach insgesamt drei Sekunden beginnt die Verarbeitung. Die weiteren automatischen Übergänge warten jeweils drei Sekunden.

## Animierte Wissenssuche

Wegweiser und Animationen verwenden ein kompaktes AI-Symbol (38 px statt 52 px, AI-Beschriftung 11 px). Sichtbare Textkästchen neben dem Symbol entfallen. Das Symbol zeigt den Zustand: pulsierendes Gehirn beim Verarbeiten, eine bewegte Lupe beim Suchen, das normale Funkensymbol beim Verbinden, einen Stift beim Schreiben und ein Pausensymbol beim Anhalten. Bei reduzierter Bewegung bleiben die Icons statisch. Die Statusmeldung zur Wissenssuche bleibt für Screenreader verfügbar.

Im Wissensbasis-Zweig bewegt sich ein KI-Symbol während Schritt 2 auf einer frei geschwungenen, zufällig erzeugten Flugbahn über die Mail und anschließend über zwölf Wissensdateien. Der Scan folgt weder den Absätzen noch der Dateireihenfolge. Danach werden die vier Anliegen mit vier passenden, in der Liste verteilten Quellen verbunden. Die acht übrigen Dokumente bleiben aufklappbar und werden als für diese Mail nicht benötigt gekennzeichnet. Eine Ergebnisanzeige macht die Auswahl sichtbar.

Zuordnungen mit Artikeltiteln und Verbindungslinien bleiben nach dem Scan sichtbar. Dieser Demonstrationsschritt dauert ungefähr 16 Sekunden. Pause hält Flugbahn und Fortschritt an; Fortsetzen setzt denselben Durchlauf fort. Neustart oder eine neue Mail erzeugt eine neue Flugbahn. Bei reduzierter Bewegung wird der Vorgang ohne fliegendes Symbol und schneller dargestellt. Alle Zuordnungen stammen aus den lokalen Beispieldaten, nicht aus einem echten KI-Aufruf.

Bei jeder Zuordnung erscheint „Anliegen N → Artikeltitel“ zunächst groß und halbtransparent über dem jeweiligen Absatz. Innerhalb von etwa 1,03 Sekunden schrumpft der Text und landet als dauerhafte Quellenzuordnung darunter. Der Absatz bleibt sichtbar, die Zuordnung reserviert ihren Platz vorab. Pause hält auch den Stempel an; bei reduzierter Bewegung oder erneutem Öffnen eines pausierten Fensters erscheint die Zuordnung direkt.

Die Wissensdemo verbindet relevante Artikel auch mit den daraus vorbereiteten Antwortabsätzen im Outlook-Entwurf.

Beim Erstellen der wissensgestützten Antwort sammelt das AI-Symbol pro Absatz Informationen am passenden Artikel und folgt anschließend dem schrittweise eingeblendeten Text. Pause/Fortsetzen erhält den Schreibstand; bei reduzierter Bewegung erscheint der vollständige Entwurf direkt.

## Geführte Übernahme in die Kundenverwaltung

Die Wartungsanfrage zeigt vier Übernahmen in Leserichtung: Anlage, Anliegen, Zeitfenster (Angaben) und „Rückfrage an Kundin“ (Aufgabe). Pro Feld wird die Quelle etwa 467 ms hervorgehoben, die AI folgt etwa 733 ms einer durchgezogenen Verbindung und das Feld erscheint innerhalb der folgenden 533 ms. Nach etwa 533 ms Abschlussansicht geht es weiter zum Entwurf (insgesamt etwa 7,47 Sekunden).

Das Anliegen verweist auf Wartungsangebot und Startgeräusch; die zusätzliche Quelle erscheint bei aktiver Übernahme oder Auswahl. Fertige Linien bleiben dezent. Felder lassen sich mit Maus, Tastatur oder Touch auswählen und zeigen dann die Quelle. Reservierte Feldhöhen verhindern Layoutsprünge. Pause/Fortsetzen erhält den Fortschritt, ein Neustart setzt ihn zurück. Auf Mobilgeräten ersetzen lokale Hervorhebungen und Quellenhinweise den Flug zwischen den Fenstern; bei reduzierter Bewegung erscheint das Ergebnis direkt.

Die fliegenden AI-Symbole folgen ihrer Flugbahn ohne Ausweichsprünge und dürfen dabei Bedienelemente überfliegen. Nach Abschluss der jeweiligen Animation werden sie ausgeblendet, damit keine Buttons oder Textfelder verdeckt bleiben.

Das gemeinsame Tempo in `src/lib/demoTiming.ts` beschleunigt die Flug-, Such-, Übernahme-, Schreib- und Stempelanimationen um den Faktor 2,5. Die Zeitachsen behalten ihre bisherigen relativen Phasen und Pause/Fortsetzen. Die erste Hauptverbindung ist auf zwei Durchläufe begrenzt.

Auch im Zweig „Kundenverwaltung“ entsteht der Entwurf mit derselben Schreibanimation: Die AI nutzt Rückfrage/Typenschildfoto, Anliegen, Zeitfenster und die nächste Aufgabe in der Anfrage als Quellen für die vier Absätze. Die zwei fachlich offenen Punkte bleiben ausdrücklich als manuell zu ergänzende Platzhalter erhalten. Das Schreiben läuft bis zum vollständigen Entwurf; Pause und Tabwechsel halten es an. Erst danach erscheint die Aufforderung zur menschlichen Prüfung.
