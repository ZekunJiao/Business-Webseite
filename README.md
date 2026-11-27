# Business-Webseite

Persönliche Geschäftswebsite von Zekun Jiao (Software, KI und Automatisierung) mit branchenneutraler Startseite und eigenständigen Branchenseiten. Die interaktive E-Mail-Demo für das Handwerk liegt unter `/handwerk`. Daneben gibt es `/hausverwaltung` und `/steuerkanzlei` mit demselben Aufbau, eigenen Anwendungsfällen und Demos (siehe Abschnitt „Branchenseiten“). Es gibt keine Navigation zwischen den Branchenseiten; `/hausverwaltung` und `/steuerkanzlei` werden nur über die direkt eingegebene oder zugesandte Adresse erreicht. Das ist keine Zugriffsbeschränkung.

Die branchenneutrale Startseite `/` verlinkt vorerst nur auf `/handwerk`; die Karte für `/hausverwaltung` ist ausgeblendet, die Seite selbst bleibt per Direktlink erreichbar. Vorerst leitet der Worker `/` außerdem vorübergehend (302) auf `/handwerk` weiter; abschalten über `HOME_REDIRECT_FROM = null` in `worker/index.ts`. Unter `npm run dev` gibt es keinen Worker und damit keine Weiterleitung. Der frühere Pfad `/workflow` leitet auf `/handwerk` weiter; `#workflow` bleibt dort ein Sprunganker zur Demo. Alle Branchenpfade können direkt aufgerufen und neu geladen werden (Vite stellt dafür den SPA-Fallback bereit). Unbekannte Pfade zeigen eine neutrale Fehlerseite ohne Branchenlinks. Als Hosting ist Cloudflare Workers vorgesehen (siehe Abschnitt „Hosting“).

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

Gewählt: Cloudflare Workers (statische Dateien aus `dist/`), automatisch aus dem GitHub-Repository `ZekunJiao/Business-Webseite`. Das Projekt heißt `business-webseite`; Konfiguration in `wrangler.jsonc`. Einstellungen im Cloudflare-Dashboard unter Workers & Pages → Projekt → Settings → Build:

- Production branch: `prod`
- Enable Preview Builds: aktiviert (Worker Previews)
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Preview command: `npx wrangler preview`
- Node-Version: über `.node-version` (22)

Entschieden: Nur `prod` ist live auf `zekun.de`. `main` ist der Arbeitsstand; jeder Push auf `main` aktualisiert die Testadresse `https://main-business-webseite.xiaokun77.workers.dev` (Worker Preview, mit `noindex`). Previews übernehmen keine Produktionseinstellungen; Variablen und das Mail-Binding stehen deshalb zusätzlich im Block `previews` in `wrangler.jsonc`. Andere Branches bekommen nur eine Vorschau, wenn sie nach GitHub gepusht werden. Veröffentlichen: `main` nach `prod` übernehmen, z. B. `git push origin main:prod`. Der Copilot-Hook `.github/hooks/auto-push.ps1` committet und pusht nach jeder Agent-Antwort den aktuellen Branch, aber nie `prod`.

`wrangler.jsonc` stellt `not_found_handling: single-page-application` ein. Deshalb funktionieren `/handwerk` und `/hausverwaltung` auch beim direkten Aufruf. Domain: `zekun.de` (registriert bei IONOS, DNS bei Cloudflare); daneben besteht noch `https://business-webseite.xiaokun77.workers.dev`. Die eigene Domain wird im Worker unter Settings → Domains & Routes → Custom Domain verbunden.

Vor dem Versenden des Links offen: Bestätigung der Werkzeuge in `src/integrations.ts`.

### Öffentlich, aber nicht in Suchmaschinen

Entschieden: Die Seite ist ohne Passwort erreichbar und soll vorerst nicht in Suchmaschinen erscheinen. Der Worker (`worker/index.ts`, siehe `run_worker_first` in `wrangler.jsonc`) liefert die Dateien aus `dist/` aus und setzt auf jede Antwort `X-Robots-Tag: noindex, nofollow`. Keine `robots.txt` mit `Disallow` anlegen, sonst sehen Suchmaschinen das `noindex` nicht. Zum Freigeben für Suchmaschinen die Header-Zeile im Worker entfernen. Lokal (`npm run dev`, `npm run preview`) läuft der Worker nicht. Das frühere Secret `SITE_PASSWORD` wird nicht mehr verwendet und kann im Cloudflare-Dashboard gelöscht werden.

### Kontaktformular

Zweiter Kontaktweg neben der E-Mail (Impressumspflicht). Das Formular (`src/components/ContactForm.tsx`) steht im Block „Über mich“ auf `/handwerk` und auf `/kontakt`; der Footer verlinkt `/kontakt`. Es sendet an `POST /api/kontakt` im Worker, der die Nachricht über Cloudflare Email Routing (Binding `send_email` in `wrangler.jsonc`) als E-Mail an `KONTAKT_TO` schickt; Antworten gehen per Reply-To an den Absender. Nichts wird gespeichert. Schutz gegen Spam: verstecktes Feld, Längenbegrenzung, nur Anfragen von derselben Domain.

Einmalig im Cloudflare-Dashboard nötig, sonst schlägt der Versand fehl: `zekun.de` → Email → Email Routing → aktivieren (legt MX- und SPF-Einträge an) und unter Destination addresses `zekun@kmu-workflow.de` hinzufügen und per Link in der Bestätigungsmail freischalten. Absender ist `formular@zekun.de` (`KONTAKT_FROM`).

Lokal testen: `npm run build`, dann `npx wrangler dev`; der Mailversand wird dort nur simuliert. Unter `npm run dev` gibt es keinen Worker, das Formular zeigt dann den Fehlerhinweis mit der E-Mail-Adresse.

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

Name, Rolle, Vorstellung, „Was ich baue“, Kennzahlen aus Kundenprojekten (Angaben von Zekun Jiao), Umfang der bisherigen Kundenarbeit (`trackRecord`, derzeit ausgeblendet) und die Punkte „Was du von mir bekommst“ stehen zusammen mit den Kontaktdaten in `src/contact.ts`. Bestätigt sind E-Mail (`zekun@zekun.de`, Weiterleitung über Cloudflare an das Google-Workspace-Postfach), LinkedIn und Anschrift; `phone` ist leer. Leere Felder werden nicht angezeigt. Der Block „Kontakt“ (`AuthorBlock`, Anker `#kontakt`) steht unter den Demos, die Kopfzeile verlinkt dorthin.

## Impressum und Datenschutz

`/impressum` und `/datenschutz` (`src/pages/LegalPage.tsx`) sind von jeder Seite über den Footer verlinkt. Name, E-Mail, Anschrift und gegebenenfalls Umsatzsteuer-ID kommen aus `src/contact.ts`; fehlt die Anschrift, steht dort sichtbar „Anschrift folgt“. Die Datenschutzerklärung beschreibt den aktuellen Stand (Cloudflare-Hosting, Kontaktformular über Cloudflare an ein Google-Workspace-Postfach, keine Cookies, kein Tracking, keine externen Einbindungen). Kommen Analyse, Formulare oder externe Dienste hinzu, muss sie angepasst werden; den Stand oben in der Datei mitpflegen. Die Texte sind Vorlagen und keine Rechtsberatung.

## Orientierung in der E-Mail-Demo

- Die Statusleiste der Demo bleibt beim Scrollen unter der Tab-Leiste sichtbar.
- Beim Abspielen scrollt die Seite sanft zum jeweils aktiven Fenster (Posteingang, Kundenverwaltung/Wissensbasis, Entwurf, Ergebnis). Bei reduzierter Bewegung ist das deaktiviert.
- Nach dem fertigen Entwurf fasst `DemoResult` in drei bis vier Schritten zusammen, was erkannt, nachgeschlagen bzw. vorbereitet wurde und dass das Team prüft und selbst sendet. Es werden keine Einsparungen behauptet.
- Orange Platzhalter im Entwurf werden mit „Orange = noch offen. Hier ergänzt dein Team.“ erklärt.
- Schriftgröße: In Hero, Kopfzeile und Gesamtbild sind Labels und Kicker mindestens 12 px, Beschriftungen 13 px. Die ausgeblendete Detaildemo nutzt weiterhin 11–12 px.

## Handyansicht der E-Mail-Demo

Bis 760 px Breite (`MOBILE_QUERY` in `src/lib/useMediaQuery.ts`) zeigt `MobileEmailFlow` statt der Map drei Schritte untereinander: Mail, Kundenverwaltung bzw. Betriebswissen, Antwortentwurf, danach das Ergebnis. Ein „Weiter“-Button blendet jeweils den nächsten Schritt ein; „Noch einmal von vorn“ startet neu. Die Inhalte sind vereinfachte Darstellungen derselben Beispieldaten ohne Verbindungslinien.

## Branchenseiten

Branchenseiten haben denselben Aufbau (`src/pages/BranchPage.tsx`): Kopfzeile, dunkler Einstieg, Anwendungsfälle mit Demos, Gesamtbild, „So läuft es ab“ mit FAQ, Abschluss, „Über mich“ mit Kontaktformular, Footer. Die Inhalte stehen je Branche in `src/branches/` (Typ `Branch` in `src/branches/types.ts`): `handwerk.ts`, `hausverwaltung/` und `steuerkanzlei/`. Eine neue Branche ist eine weitere Konfiguration, eingetragen in `branches` in `src/App.tsx`. Die erste Adresse in `paths` ist die Seite, weitere leiten darauf um (`/workflow` → `/handwerk`).

- **Texte:** Alle sichtbaren Texte der Seite, auch die Anrede (du/Sie), kommen aus der Konfiguration. Jeder Anwendungsfall wählt seine Demo über `story.kind` (`phone`, `inbox`, `quote`, `schedule`, `invoice`, `costs`, `meeting`, `notice`) und bringt die Daten in `story.data` mit. Beschriftungen in den Demos stehen bei Posteingang, Plan und Rechnung in `labels`, beim Telefon in eigenen Feldern (`caller`, `phone`, `push`, `afterwards` usw.). Das Angebot hat noch feste du-Beschriftungen, Betriebskosten, Versammlung und Bescheid feste Sie-Beschriftungen (bisher nur auf `/hausverwaltung` bzw. `/steuerkanzlei` genutzt). `tech.operations` ersetzt den gemeinsamen Block „Datenschutz und Betrieb“ unter den technischen Details. Im Posteingang bekommt eine Mail in anderer Sprache `foreign` (Sprachcode, Kennzeichen, aufklappbare Übersetzung, Entwurf zusätzlich in dieser Sprache mit zwei Reitern); `draft.closing` ersetzt den gemeinsamen Gruß.
- **Telefon ohne Aufnahme:** Ist `audio` leer, läuft das Gespräch mit Lesezeit pro Zeile; der Hinweis „Stimmen KI-generiert“ und der Knopf „Ton an/aus“ entfallen.
- **Rechnungs-Demo ohne Beträge:** Hat keine Zeile der Liste einen Betrag und der Fall keine Positionen, entfällt die Betragsspalte (genutzt für die Unterlagenliste auf `/steuerkanzlei`).
- **Kennzahlen:** `author.results`; `hero.proof` zeigt die Einträge mit `teaser` im Einstieg. Ohne `proof` entfällt der Block im Einstieg, mit leerem `results` der Block „Zahlen aus Kundenprojekten“. Handwerk übernimmt Kennzahlen, Vorstellung und Stärken aus `src/contact.ts`.
- **Gesamtbild:** `overview` mit Eingängen, Software (`integrations` mit Logos, `extras` mit Symbol oder Bild) und Team.

### /hausverwaltung

Inhalte in `src/branches/hausverwaltung/` (`index.ts` für die Seite, je eine Datei für die Beispieldaten der Demos). Entschieden: Anrede mit „Sie“; keine Kennzahlen aus Kundenprojekten (die bisherigen stammen aus SHK-Betrieben), daher ohne `hero.proof` und mit leerem `results`; Verwaltungssoftware nur als Text „z. B. Domus, PowerHaus, Karthago“ ohne Logos; unter den technischen Details nur tatsächlich genutzte Dienste. Hausverwaltung ist eine von mehreren Erkundungsrichtungen, keine festgelegte Spezialisierung.

Fünf Anwendungsfälle mit Demo, alle mit erfundenen Beispieldaten:

- **Notfall am Telefon** (`phone.ts`, Demo `phone`): Mieter meldet sonntagabends einen Wasserschaden; Gesprächsnotiz und Push an das Bereitschaftshandy. Gesprächszeilen in `phoneLines.json`, Aufnahmen in `public/assets/phone/hausverwaltung/` (Assistent: Sebastian wie bei Handwerk; Anrufer: Chris, Standardstimme von ElevenLabs).
- **Mieter- und Eigentümeranfragen** (`inbox.ts`, Demo `inbox`): Nachzahlung Betriebskosten, Wallbox nach § 20 WEG, Schimmel mit Foto (dringend).
- **Schaden an Handwerker** (`damage.ts`, Demo `schedule`): Heizungsausfall mit Freigabegrenze, Wasserfleck mit Eigentümer-Nachricht, Absage eines Handwerkers. Der Plan zeigt Handwerksbetriebe statt Monteuren.

- **Betriebskosten** (`costs.ts`, Demo `costs`, `src/components/CostStory.tsx`): drei Belegstapel. Der Assistent ordnet Kostenarten zu, trennt Reparaturen, Verwaltungskosten und doppelte Rechnungen ab, prüft Zeiträume und vergleicht mit dem Vorjahr. Offene Punkte (Reparaturanteil, Police über den Jahreswechsel, neue Hecke) entscheidet das Team per Auswahl; Summe und Anteil je Wohnung (nach Wohnfläche, Wohnung wählbar) rechnen mit der Wahl. Vereinfacht, Heizkosten separat, keine Rechtsberatung.
- **Eigentümerversammlung** (`meeting.ts`, Demo `meeting`, `src/components/MeetingStory.tsx`): drei Mitschnitte. Ergebnis sind Beschlüsse mit Abstimmung, Aufgaben mit Fristen und Einträge für die Beschlusssammlung. Je Beispiel eine unklare Stelle (Zählung, Fälligkeit, Name), die das Team klärt; im Beschluss steht dafür `{?}`. „Im Mitschnitt bei …“ springt zur Stelle (auf schmalen Bildschirmen in die Spalte „Mitschnitt“).

Die neueren Demos (Betriebskosten, Versammlung, Bescheid) nutzen den gemeinsamen Rahmen `src/components/storyFrame.tsx` (Kopf mit Vergleich, Steuerung, Assistentenspalte, Bühne mit Umschalter). Die fünf älteren Demos haben diese Teile noch jeweils selbst; umgestellt werden sie erst, wenn sie ohnehin angefasst werden.

### /steuerkanzlei

Inhalte in `src/branches/steuerkanzlei/` (`index.ts` für die Seite, je eine Datei für die Beispieldaten der Demos). `/steuerberater` leitet auf `/steuerkanzlei` um. Wie bei der Hausverwaltung: Anrede mit „Sie“, keine Kennzahlen (kein Kundenprojekt in einer Kanzlei), Kanzleisoftware nur als Text „z. B. DATEV, Addison, Agenda“ ohne Logos und ohne zugesagte Anbindung, unter den technischen Details nur tatsächlich genutzte Dienste. Der Assistent gibt in allen Texten keine steuerlichen Auskünfte, er bereitet vor. Verschwiegenheit nach § 62a StBerG in Textform mit Belehrung nach § 203 StGB (FAQ und „Datenschutz & Betrieb“). Wegen § 62a Abs. 4 (Dienstleister im Ausland) nennt der Telefon-Fall keine US-Dienste, sondern einen Sprachdienst mit Verarbeitung in der EU, der vor dem Start ausgewählt wird; noch ist keiner festgelegt. Steuerkanzlei ist eine von mehreren Erkundungsrichtungen, keine festgelegte Spezialisierung.

Vier Anwendungsfälle mit Demo, alle mit erfundenen Beispieldaten (Kanzlei Mustermann, Sachbearbeiterin Frau Berger):

- **Steuerbescheide prüfen** (`notice.ts`, Demo `notice`, `src/components/NoticeStory.tsx`, Datenform in `src/noticeStory.ts`): drei Bescheide. Der Assistent gleicht mit Erklärung bzw. Buchhaltung ab, ordnet jede Zeile ein (wie erklärt, Abweichung mit Begründung, Fehler des Finanzamts), berechnet die Frist und schreibt die Mail an den Mandanten. Fälle: Nachzahlung statt Erstattung (Herr Keller aus der Telefon-Demo; Vorauszahlungen nicht angerechnet, Spenden und Fahrtage gekürzt; Entscheidung Einspruch oder nur Anrechnung), Bescheid wie erklärt (ohne Entscheidung, direkt „Prüfen & senden“), Vorauszahlungen erhöht (Abgleich mit der Buchhaltung; Herabsetzung beantragen oder nicht). Die Entscheidung wählt das Team per Auswahl, die Mail übernimmt den passenden Absatz (`{decision}` in `mail.paragraphs`); das Kennzeichen in der Liste zeigt danach die Wahl. Fristen: Bekanntgabe am vierten Tag nach dem Bescheiddatum (seit 2025), Einspruch ein Monat, Ende am Wochenende auf den nächsten Werktag; die Daten sind von Hand eingetragen und bei Änderungen nachzurechnen. Die Beträge im ersten Fall gehen auf (380 € Erstattung erwartet, 2.140 € Nachzahlung, Differenz 190 + 380 + 1.950 €).

- **Fehlende Unterlagen & Belege** (`documents.ts`, Demo `invoice`): Statt offener Posten zeigt die Liste „Unterlagen je Mandant“ ohne Beträge. Fälle: Unterlagen mit der Checkliste abgleichen (Kinderbetreuung als offene Entscheidung), Erinnerung aus der Fristenkontrolle (zusätzlicher Anruf als Entscheidung), Kontoumsätze ohne Beleg (Tankstelle privat oder nachfragen).
- **Mandantenanfragen** (`inbox.ts`, Demo `inbox`): Anfrage auf Albanisch zur E-Rechnungspflicht ab 2027 (Kennzeichen „Shqip“, aufklappbare Übersetzung, Entwurf auf Deutsch zur Prüfung und auf Albanisch für den Mandanten; albanische Texte vom Auftraggeber vorgegeben), neue Minijob-Aushilfe für die Lohnabrechnung, Schreiben vom Finanzamt mit Frist über das Mandantenportal (dringend).
- **Anrufe, wenn alle Leitungen besetzt sind** (`phone.ts`, Demo `phone`): Mandant mit Steuerbescheid und Nachzahlung, Rückrufnotiz an die Sachbearbeiterin. Aufnahmen in `public/assets/phone/steuerkanzlei/` (ElevenLabs, Anrufer-Stimme Eric), erzeugt mit `npm run audio:phone -- --story=steuerkanzlei`; die Zeilen stehen in `phoneLines.json`.

Fachliche Angaben (E-Rechnung: Ausstellungspflicht an Firmenkunden ab 1.1.2027 bei mehr als 800.000 € Vorjahresumsatz, Privatkunden ausgenommen, PDF ist keine E-Rechnung; eine Verschiebung auf 2028 war im November 2026 nur gefordert, nicht beschlossen; Homeoffice-Pauschale im Bescheid-Beispiel; Rentenversicherungspflicht bei Minijobs, Grenze 2026: 603 €; Überweisung als Nachweis für Handwerkerkosten) sind vereinfacht und im November 2026 mit Quellen abgeglichen. Bei Gesetzesänderungen nachziehen. Geplant (optional): Belege vorkontieren, Tonaufnahmen für die Telefon-Demo, eigenes Vorschaubild.

## Hero auf /handwerk

Der Hero hat einen Einstiegs-Button „Beispiele ansehen“ (Sprung zu `#ueberblick`) und einen Textlink „Kostenlose Prozessanalyse“ direkt zum Formular „Prozessanalyse anfragen“ (`#schreib-mir` im Kontaktblock; Button „Anfrage senden“, Beispielsätze als Platzhalter im Nachrichtenfeld, Zusage „innerhalb eines Werktags mit Terminvorschlägen“). Die allgemeine Seite `/kontakt` nutzt dasselbe `ContactForm` mit neutralen Standardtexten. Der Link „Kontakt“ im Kopf springt ebenfalls zu `#schreib-mir`. Beide setzen nach dem Klick den Fokus ins erste Formularfeld. Eine Terminbuchung gibt es nicht. Darunter steht eine Zeile mit Foto, Name und Hintergrund (verlinkt auf das Profil `#kontakt`), danach zwei Kennzahlen „Aus einem Kundenprojekt“ (45 von 50 vorbereitete Anfragen und 5+ Std. gesparte Bürozeit, beide vom selben SHK-Betrieb): alle Einträge in `contact.results` mit `teaser`, verlinkt auf die Rechnungen im Kontaktblock (`#zahlen`). Die Anwendungsfälle mit ihren Demos sind der Einstieg. Die Detaildemo (Workflow-Tabs mit E-Mail-Demo, `#workflow`) ist vorerst ausgeblendet: Der Einbau in `src/pages/BranchPage.tsx` ist auskommentiert, der Code (`HandwerkWorkflows`, `EmailWorkflowDemo`, `MobileEmailFlow` usw.) bleibt erhalten. Zum Reaktivieren die Kommentare entfernen; die Abschnitte unten beschreiben die Detaildemo.

Zwischen Anwendungsfällen und Kontaktblock steht „So läuft es ab“ (`src/components/ProcessFaq.tsx`, Anker `#ablauf`, Inhalte in `process` der Branchen-Konfiguration): drei Schritte der Zusammenarbeit und häufige Fragen. Die Antworten sind Zusagen an Interessenten; Preise stehen dort erst, wenn das Angebot festgelegt ist.

Danach folgt ein dunkler Abschlussblock (`.closing-cta` in `src/pages/BranchPage.tsx`, Texte in `closing` der Branchen-Konfiguration) „Reden wir über deine Prozesse.“; die Fakten stehen im Kicker („Kostenlos · 45 Minuten · In München oder online“), rechts Name und „Dein Ansprechpartner“ (bewusst ohne Foto, weil „Über mich“ mit großem Foto direkt folgt) mit genau einem Button „Prozessanalyse anfragen“ zum Formular (auf dem Handy darunter). Bestätigtes Angebot (Zekun Jiao): Die Prozessanalyse ist ein kostenloses Gespräch von 45 Minuten, vor Ort in München oder online, ohne Verkaufsgespräch; der Interessent geht mit zwei, drei konkreten Ansatzpunkten raus, auch ohne spätere Zusammenarbeit. Dieselben Angaben stehen im ersten Schritt von „So läuft es ab“; der Hero-Link nennt nur „Kostenlose Prozessanalyse“ ohne Dauer. Bei Änderungen alle Stellen anpassen. Die Bezeichnung „Prozessanalyse“ ist bewusst gewählt (klingt nach Ergebnis statt nach Verkaufsgespräch), obwohl die Seite sonst „Abläufe“ sagt. Der Text spricht von „ich“, nicht „wir“; absolute Versprechen wie „Zeitfresser eliminieren“ werden nicht verwendet.

## Linkvorschau und Schrift

`index.html` enthält Titel, Beschreibung und Open-Graph-Tags für die Vorschau in WhatsApp, LinkedIn und E-Mail-Programmen; sie gelten für `/handwerk` und alle Pfade ohne eigene Vorschau. Vorschaubild: `public/og-handwerk.png` (1200 × 630). Für `/hausverwaltung` und `/steuerkanzlei` (auch `/steuerberater`) tauscht der Worker Titel, Beschreibung und Open-Graph-Angaben im ausgelieferten HTML aus (`worker/previews.ts`, per HTMLRewriter); Adresse und Bild zeigen dabei auf den aufgerufenen Host, damit auch die Testadresse eine passende Vorschau hat. Die Texte dort entsprechen `meta` der Branchen-Konfiguration und sind bei Änderungen nachzuziehen. Unter `npm run dev` läuft kein Worker, dort gilt überall die Vorschau aus `index.html`; prüfen mit `npm run build`, dann `npx wrangler dev` und z. B. `curl http://127.0.0.1:8787/steuerkanzlei`.

Die Bilder `public/og-hausverwaltung.png` und `public/og-steuerkanzlei.png` erzeugt `npm run og:images` (`scripts/generate-og-images.mjs`) im Stil des Handwerk-Bilds über einen lokal installierten Google Chrome im Headless-Modus (Pfad über `CHROME_PATH`). Vorhandene Bilder werden übersprungen; neu: `npm run og:images -- --force` bzw. `--only=steuerkanzlei`. Texte der Bilder stehen im Skript unter `images`. LinkedIn speichert Vorschauen zwischen; nach Änderungen im Post Inspector neu abrufen. Die Schrift Inter liegt über `@fontsource-variable/inter` im Build (keine externe Schriftquelle); geladen wird nur der benötigte Zeichensatz. Überschriften (`h1`–`h3`) nutzen Archivo (`@fontsource-variable/archivo`, nur Gewichtsachse).

## Farben und Gestaltung

Die Grundfarben stehen als Variablen in `:root` in `src/index.css`: Dunkelblau (`--ink`) für Schrift, zwei Grautöne (`--muted`, `--muted-light`), Linien (`--line`, `--line-strong`) und Orange als sparsamer Akzent (`--accent`, `--accent-strong`, `--accent-text`). Der Seitenhintergrund ist reines Weiß (`--bg`); nur der Hero auf `/handwerk` steht auf einer dunkelblauen Fläche über die volle Breite (`.hero-dark`). Der Assistent erscheint in den Demos in Petrol statt Lila und mit sachlichen Symbolen (Headset, Person mit Zahnrad) statt Sparkles. Anwendungsfälle und „So läuft es ab“ sind als Leiste bzw. Zeitleiste ohne Karten gestaltet; Ecken sind höchstens 8–10 px rund, dekorative Schatten entfallen.

## Anwendungsfälle auf /handwerk

`UseCaseStage` (`src/components/UseCaseStage.tsx`, Anker `#ueberblick`) zeigt oben eine Karte je fertigem Anwendungsfall und darunter eine Bühne mit genau einer Demo für den gewählten Fall. Ein Klick auf eine Karte wechselt den Fall. Geplante Anwendungsfälle (`upcomingUseCases`) stehen nicht als Karten, sondern als dezente Zeile „Weitere Abläufe in Vorbereitung: …“ unter den Karten.

- **Inhalte:** `src/overviewFlows.ts`. `overviewSets` enthält die Anwendungsfälle mit Karte (`card`), Überschrift, Demo (`story`) und technischen Bausteinen; `upcomingUseCases` die Platzhalter; `useCaseSection` den Kopf. Ein neuer Anwendungsfall ist ein weiterer Eintrag in `overviewSets`.
- **Fertige Fälle:** `telefon`, `anfragen`, `angebote`, `termine` und `rechnungen`. `story.kind` wählt die Demo-Komponente (`phone`, `inbox`, `quote`, `schedule`, `invoice`), `story.data` liefert ihre Beispieldaten (z. B. `inboxStory` aus `src/inboxStory.ts`). Dieselbe Komponente kann so mit anderen Daten auf einer anderen Branchenseite laufen.
- **Direktlink:** `/handwerk?anwendungsfall=anfragen` wählt einen Fall und springt zur Bühne. Ohne Parameter oder mit unbekanntem Wert ist der erste Fall (`telefon`) gewählt. Zurück/Vorwärts stellt die Auswahl wieder her; der Anker `#telefon` funktioniert weiter.
- **Handy (bis 760 px):** Die Karten stehen kompakt untereinander (Symbol links, Text rechts).

## Telefon-Demo

Der Anwendungsfall „Anrufe auffangen, wenn niemand rangeht“ (`telefon`; bewusst kein absolutes Versprechen wie „Kein Anruf geht verloren“) zeigt statt des Diagramms `PhoneStory` (`src/components/PhoneStory.tsx`, Inhalte in `src/phoneStory.ts` und `src/phoneLines.json`). Der Kopf ist bewusst schlank (Kicker und Titel), damit der Anruf früh sichtbar ist. Darunter zwei Spalten:

- **Links: das Telefonat und die Gesprächsnotiz.** Anruferin und digitaler Assistent mit Sprechwelle beim aktiven Sprecher, Status (Klingelt/Verbunden/Beendet) und Gesprächsdauer. Im Startzustand nur der Knopf „Assistent geht ran“ und der Hinweis „Ohne Assistent springt jetzt die Mailbox an.“ Danach eine Live-Mitschrift als Untertitel: nur die aktuelle Zeile, nach dem Ende aufklappbar die ganze Mitschrift. Bewusst keine Chatblasen. Darunter die Zeile „Beispiel · Heizung ausgefallen · Stimmen KI-generiert“ und die Gesprächsnotiz: vor dem Start nur „Wird während des Anrufs ausgefüllt.“, dann erscheinen die Felder, sobald sie notiert sind; offene Angaben sind orange, die Legende erscheint mit dem ersten offenen Feld.
- **Rechts: dein Handy** im Sperrbildschirm (Hochformat), das beim Scrollen mitläuft. Während des Gesprächs bleibt es still; danach erscheint die Push-Nachricht mit der Zusammenfassung.

Bis 900 px Breite steht alles untereinander (Telefonat, Notiz, Handy); nach dem Gespräch scrollt die Seite zum Handy.

- **Bedienung:** Einziger Start ist „Assistent geht ran“. Danach stehen im Kopf des Telefonats Pausieren/Fortsetzen, Ton an/aus und „Zum Ergebnis“ (auf dem Handy nur als Symbole mit Beschriftung für Screenreader); nach dem Ende „Noch einmal“. „Zum Ergebnis“ setzt die Gesprächsdauer auf die Länge der Aufnahmen (aus den MP3-Metadaten, sonst geschätzt). „Ton aus“ schaltet auf Lesetempo um.
- **Ton:** vorab erzeugte MP3s je Zeile in `public/assets/phone/line-01.mp3` … `line-08.mp3`, abgespielt über ein `<audio>`-Element, erst nach einem Klick. Auch die Längen der Aufnahmen (für „Zum Ergebnis“) werden erst nach „Assistent geht ran“ abgefragt; der Seitenaufruf lädt keine Audiodaten. Kann eine Datei nicht geladen oder abgespielt werden (fehlt, blockiert, startet nicht innerhalb von 6 s), läuft die Mitschrift im Lesetempo weiter und ein Hinweis „Ton konnte nicht abgespielt werden“ erscheint. Bei der Demo steht „Stimmen KI-generiert“.
- **Audio erzeugen (einmalig):** `scripts/generate-phone-audio.mjs` ruft ElevenLabs auf (Modell `eleven_v4`, Sprache Deutsch, MP3 44,1 kHz/128 kbit/s) und speichert die MP3s. Jede Zeile bekommt die Nachbarzeilen als Kontext (`previous_text`/`next_text`), damit der Gesprächsfluss stimmt. Die Webseite spielt nur diese Dateien ab und ruft keine API auf. Benötigt `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ASSISTANT` und `ELEVENLABS_VOICE_CALLER` (Stimmen-IDs) in der Shell oder in einer lokalen `.env` (in `.gitignore`, nie einchecken). Stimmen-IDs aus dem eigenen Konto anzeigen: `npm run audio:phone -- --list-voices` (Stimmen aus der Voice Library vorher zu „My Voices“ hinzufügen). Dann `npm run audio:phone` (nutzt mit `--use-env-proxy` den Proxy aus `HTTPS_PROXY`, z. B. im Firmennetz). Vorhandene Dateien werden übersprungen; einzelne Zeilen neu: `npm run audio:phone -- --only=3,5`, alle neu: `npm run audio:phone -- --force`. Modell und Format über `ELEVENLABS_MODEL` und `ELEVENLABS_OUTPUT_FORMAT` änderbar (`mp3_44100_192` ab Creator-Tarif). Nach Textänderungen in `src/phoneLines.json` die betroffenen Zeilen neu erzeugen. Weitere Branchen über `--story=…` (z. B. `npm run audio:phone -- --story=hausverwaltung`, Zeilen aus `src/branches/hausverwaltung/phoneLines.json`, Ausgabe nach `public/assets/phone/hausverwaltung/`); Zeilen, Zielordner und Stimme der anrufenden Person stehen im Skript unter `stories`. Der aktuelle API-Schlüssel hat keine Berechtigung `voices_read`, `--list-voices` geht damit nicht. Die MP3s werden eingecheckt. Für die Veröffentlichung braucht es einen ElevenLabs-Tarif mit kommerzieller Lizenz (ab Starter); Dateien aus dem Free-Tarif nur zum Testen.
- **Inhalte:** Betrieb („Haustechnik Mustermann“), Anruferin und Angaben sind erfunden. Der Assistent stellt sich als digitaler Assistent vor.
- **Technik:** Bausteine unter „So hängt es technisch zusammen“ (siehe „Technik je Anwendungsfall“).
- **Klingeln:** Solange es klingelt, wackelt der Knopf „Assistent geht ran“ alle 2,4 Sekunden kurz wie ein klingelndes Telefon (pausiert bei Hover und Fokus). Sobald das Telefonat zu 60 % im Blick ist, spielt einmal je Seitenaufruf ein Klingelton (`src/lib/ringtone.ts`): im Browser erzeugt (Web Audio, keine Datei), zweimal „Brring-brring“, etwa 3 Sekunden, leise. Länger automatisch abgespielter Ton bräuchte nach WCAG 1.4.2 einen eigenen Stopp-Knopf. Browser erlauben Ton erst nach einem Klick oder Tastendruck auf der Seite; bis dahin wartet der Klingelton darauf. Ist dieser erste Klick „Assistent geht ran“, klingelt es nicht mehr. Weg scrollen, Tab wechseln oder Annehmen bricht den Ton sofort ab.
- **Reduzierte Bewegung:** kein Klingel-Puls, kein Wackeln, keine Sprechwelle und keine Einblendungen; der Ablauf startet nur auf Klick. Der Klingelton bleibt.
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
- **Technik:** Bausteine unter „So hängt es technisch zusammen“ (siehe „Technik je Anwendungsfall“). Gemeinsame Layout-Klassen mit der Telefon-Demo heißen `story-*`, eigene Klassen `mailbox-*`.

## Angebots-Demo

Der Anwendungsfall „Angebote vorbereiten“ (`angebote`, Direktlink `/handwerk?anwendungsfall=angebote`) zeigt `QuoteStory` (`src/components/QuoteStory.tsx`, Inhalte in `src/quoteStory.ts`). Aufbau wie die Posteingang-Demo: Vergleich „Ohne/Mit Assistent“ (ohne Zahlen) und drei nummerierte Spalten:

1. **Das kommt von dir:** Liste mit drei Beispielen und darunter der geöffnete Eingang: die eigene Sprachnotiz als Mitschrift, eigene Stichpunkte aus dem Handy oder ein bereits verschicktes Angebot. Die Zeilen zeigen die Leistung mit Symbol der Eingangsart und „für Kunde“, damit der Eingang nicht wie eine Kundennachricht wirkt. Übernommene Stellen werden gelb markiert.
2. **Der Assistent arbeitet:** Bei beiden Angebotsfällen dieselben fünf Schritte (Notiz lesen, Kunde finden, Preisliste, Vergleich mit ähnlichen Angeboten, schreiben); nur die Ergebnisse unterscheiden sich. Die Preisliste liefert Preise, der Vergleich findet fehlende Positionen. Beim Nachfassen drei Schritte.
3. **Für dein Team vorbereitet:** Angebotsentwurf mit Positionen, die nacheinander erscheinen, darunter Netto, MwSt. und Brutto; im dritten Fall ein Mailentwurf. Darunter der „Eintrag in deiner Software“ mit der Herkunft jeder Angabe.

- **Fälle:** „Vom Vor-Ort-Termin zum Angebot“ (Badsanierung aus einer Sprachnotiz, ein Preis fehlt in der Preisliste), „Nichts vergessen“ (Heizungstausch, drei Positionen als Vorschlag aus ähnlichen Angeboten), „Nachfassen“ (Angebot seit 8 Tagen ohne Antwort). Die Auswahl dieser drei Probleme ist eine Annahme auf Basis von Fachpresse und Ratgebern, keine erhobene Zahl. Es werden keine Einsparungen genannt.
- **Preise:** erfundene Beispielpreise, in der Demo als solche gekennzeichnet. Summen werden aus Menge × Einzelpreis berechnet (`vatRate` in `src/quoteStory.ts`). Offene Preise und Vorschläge zählen erst ab der Prüfung mit, und zwar mit den Werten des Teams; bis dahin steht „ohne offene Position“ bzw. „ohne Vorschläge“ dabei.
- **Prüfen und freigeben:** Am Ende steht nicht „Senden“, sondern „Offenen Preis prüfen“ bzw. „Offene Punkte prüfen“. Im Prüfschritt (lokaler Zustand in `QuoteStory`): beim offenen Preis ein Feld „Einzelpreis in €“, vorausgefüllt mit `teamPrice` (Beispielpreis, änderbar, akzeptiert z. B. 740, 740,50, 1.250); bei Vorschlägen je eine Checkbox „ins Angebot übernehmen“; bei der Nachfrage ein Textfeld mit dem Beispielsatz (leer = Absatz entfällt). Summen rechnen live mit. „Angebot freigeben“ bzw. „Nachfrage freigeben“ ist gesperrt, solange kein gültiger Preis über 0 € eingetragen ist; Enter im Preisfeld gibt frei, „Abbrechen“ verwirft die Eingaben. Danach zeigen Angebot, Abschlusszeile und „Eintrag in deiner Software“ die eingegebenen Werte (z. B. „Von dir geprüft: Glasabtrennung 120 cm zu 820,00 €“), abgewählte Vorschläge stehen durchgestrichen als „Nicht übernommen“ da. „Noch einmal“ und der Wechsel des Beispiels setzen die Eingaben zurück. Der Assistent sendet nie selbst.
- **Abschluss:** Das Kennzeichen in der Liste wechselt auf „Gesendet“ oder „Nachgefasst“.
- **Nächster Schritt:** Anfragen, Termine und Rechnungen füllen orange Stellen mit „Prüfen & senden“ weiterhin ohne Rückfrage aus; dort fehlt der Prüfschritt noch.
- **Bedienung, schmale Bildschirme, reduzierte Bewegung:** wie bei der Posteingang-Demo (Autostart einmal, Umschalter „Eingang / Assistent / Angebot“ bis 1100 px, bei reduzierter Bewegung direkt das fertige Ergebnis).
- **Technik:** Bausteine unter „So hängt es technisch zusammen“ (siehe „Technik je Anwendungsfall“). `ColumnLabel` und `Marked` liegen für beide Demos in `src/components/storyParts.tsx`. Eigene Klassen heißen `quote-*`, der Rest nutzt `story-*` und `mailbox-*`.

## Termin-Demo

Der Anwendungsfall „Termine & Einsätze planen“ (`termine`, Direktlink `/handwerk?anwendungsfall=termine`) zeigt `ScheduleStory` (`src/components/ScheduleStory.tsx`, Inhalte in `src/scheduleStory.ts`). Hülle wie bei Anfragen und Angeboten, drei Spalten:

1. **Das kommt rein:** Eingang mit drei Nachrichten, jeweils mit Absender und Rolle (Kundin, Kunde, „dein Monteur“), darunter die geöffnete Nachricht mit gelben Markierungen.
2. **Der Assistent arbeitet:** in allen drei Beispielen dieselben fünf Schritte (Nachricht lesen, Kalender, wer es kann, Fahrweg und Material, Vorschlag schreiben); nur die Ergebnisse unterscheiden sich.
3. **Für dein Team vorbereitet:** der Einsatzplan als Tabelle (Monteure × Tage bzw. Tagesabschnitte). Der Plan ist von Anfang an mit dem Stand vor der Änderung sichtbar. Vorschläge erscheinen orange, verlegte Termine bleiben bis zum Senden durchgestrichen am alten Platz. Darunter „Warum so?“ mit der Begründung zu jedem Vorschlag und die Nachrichten an die betroffenen Kunden.

- **Fälle:** „Termin finden“ (zwei Terminvorschläge für eine Wartung), „Notfall einschieben“ (Störung heute, eine Wartung rückt auf morgen), „Monteur fällt aus“ (Krankmeldung, zwei Termine neu verteilt, ein Tag bleibt als offene Entscheidung). Die Auswahl ist eine Annahme, keine erhobene Zahl. Betrieb, Monteure, Kunden und Termine sind erfunden.
- **Abschluss:** „Prüfen & senden“ macht Vorschläge grün („vorgemerkt“ bzw. „eingeplant“), entfernt die durchgestrichenen alten Plätze und füllt die offene Stelle. Der Assistent sendet nie selbst.
- **Handy (bis 760 px):** Der Plan wird zur Liste je Monteur; vor jedem Termin steht der Spaltenname.
- **Technik:** Bausteine unter „So hängt es technisch zusammen“. Eigene Klassen heißen `schedule-*`. Den Ablauf (Takte, Pause, Autostart, Senden, reduzierte Bewegung) liefert `useStoryPlayback` in `src/lib/useStoryPlayback.ts`; die Angebots-Demo nutzt denselben Hook, die Posteingang-Demo hat ihre eigene, gleich aufgebaute Logik.

## Rechnungs-Demo

Der Anwendungsfall „Rechnungen & Erinnerungen“ (`rechnungen`, Direktlink `/handwerk?anwendungsfall=rechnungen`) zeigt `InvoiceStory` (`src/components/InvoiceStory.tsx`, Inhalte in `src/invoiceStory.ts`). Hülle wie bei Angeboten und Terminen, drei Spalten:

1. **Das kommt rein:** drei Meldungen mit Absender und Rolle: Fertigmeldung der Monteurin, Hinweis aus der eigenen Software, Zahlungseingang vom Bankkonto.
2. **Der Assistent arbeitet:** in allen drei Beispielen dieselben fünf Schritte (Meldung lesen, Auftrag und Rechnung finden, abgleichen, Verlauf prüfen, Entwurf schreiben).
3. **Für dein Team vorbereitet:** oben die Liste „Offene Posten“, von Anfang an mit dem Stand vor der Änderung sichtbar; die betroffene Zeile wird orange (Vorschlag) und nach dem Senden grün. Darunter beim ersten Beispiel der Rechnungsentwurf mit Positionen und Summen, dann „Warum so?“ mit den Belegen und die Nachricht an den Kunden.

- **Fälle:** „Rechnung nach Auftragsende“ (Badsanierung aus der Angebots-Demo, sechs Positionen wie im Angebot, zwei Stunden Mehraufwand als offene Entscheidung), „Zahlungserinnerung“ (Rechnung 14 Tage überfällig, erste freundliche Erinnerung), „Zahlung passt nicht“ (Skonto nach Fristende abgezogen, Restbetrag nachfordern oder ausbuchen). Die Auswahl ist eine Annahme, keine erhobene Zahl.
- **Beträge:** erfundene Beispielbeträge. Die Rechnungssumme wird aus Menge × Einzelpreis berechnet (`vatRate` in `src/invoiceStory.ts`); der Mehraufwand zählt erst nach „Prüfen & senden“ mit. Die Beträge in den Texten des dritten Beispiels (3.141,60 € abzüglich 2 % = 3.078,77 €, Rest 62,83 €) sind von Hand eingetragen und bei Änderungen nachzurechnen.
- **Abgrenzung:** vereinfachte Darstellung, keine Rechts- oder Steuerberatung. Gezeigt wird eine Zahlungserinnerung, keine förmliche Mahnung mit Verzugszinsen; die Rechnung enthält nicht alle Pflichtangaben. Die Beispielkunden sind Privatleute, die E-Rechnungspflicht zwischen Unternehmen kommt deshalb nicht vor.
- **Technik:** Bausteine unter „So hängt es technisch zusammen“. Eigene Klassen heißen `invoice-*` (Offene Posten); Positionen und Summen nutzen `quote-*`, Begründung und Nachricht `schedule-*`. Ablauf über `useStoryPlayback`.
- **Karten der Anwendungsfälle:** Zwischen 761 und 1100 px stehen drei Karten je Reihe; zwei übrige Karten teilen sich die letzte Reihe. `upcomingUseCases` ist jetzt leer, die Zeile „Weitere Abläufe in Vorbereitung“ entfällt.

## Gesamtbild

`SystemOverview` (`src/components/SystemOverview.tsx`, Anker `#zusammenhang`) steht unter der Bühne der Anwendungsfälle und vor „So läuft es ab“. Es zeigt einmal für alle Workflows vier Spalten: Was reinkommt (nur Eingänge, die auch in den Demos vorkommen), „Digitaler Assistent“ (bewusst nicht nur „Assistent“, damit niemand an eine Bürokraft denkt), „Deine Software & dein Wissen“ und „Dein Team“. Keine Beispielfälle; die einzige Bewegung ist ein leiser Datenpunkt (siehe unten).

- **Software:** die Programme aus `src/integrations.ts` mit Logos aus `public/assets/integrations/`, dazu „Excel & andere“, Kalender sowie Betriebswissen & Preisliste. Bestätigt ist: Die Anbindung an Handwerkersoftware ist möglich und die Logos dürfen gezeigt werden. Es gibt nur Tools in der Liste, für die eine Anbindung oder ein Vertrag besteht; HERO, plancraft und ToolTime sind bestätigt.
- **Linien:** SVG, einmal und bei Größenänderung (`ResizeObserver`) vermessen; jede Linie trägt `data-seg` (`in`, `out`, `team`). Bis 1180 px stehen die Spalten untereinander mit Pfeilen, ohne SVG (eigene Grenze, weil die vier Spalten darunter zu eng würden). Die Spalten sind Listen mit Überschriften, das SVG ist `aria-hidden`.
- **Abstände:** Die vier Spalten sind so breit wie ihr Inhalt (`repeat(4, auto)`, `justify-content: space-between`), Beschriftungen brechen nicht um. Dadurch sind die Abstände Eingänge → Assistent → Kasten → Team etwa gleich groß (bei 1440 px rund 175 px, bei 1200 px rund 95 px) und links und rechts bleibt derselbe Rand.
- **Datenpunkt:** Ein orangefarbener Punkt (`.system-packet`) fährt ohne Halt von einem zufälligen Eingang über den Assistenten zu einem zufälligen Programm und weiter zum Team; hinter Assistent und Software-Kasten gleitet er auf einem unsichtbaren geraden Stück durch, statt zu springen. Gleichmäßiges Tempo über die ganze Strecke, nur Anfang und Ende sind weich. Danach eine Pause. Eingang und Programm wechseln jedes Mal. Die Linien, die er schon befahren hat, färben sich hell orange (`.is-active`), bis der Durchlauf endet. Kommt der Punkt beim Assistenten an und fährt zum Programm, dreht sich das Zahnrad im Symbol (Lucide `UserRoundCog` ab dem 3. Element, Winkel per CSS-Variable `--cog`, läuft weich an und aus). Kommt er beim Team an, blinkt der Haken kurz auf (`data-checked`, Lucide `UserRoundCheck`, 3. Element) mit einem leichten Ring. Zeiten in `TRAVEL_MS`, `GAP_MS` und `COG_SPEED` in `SystemOverview.tsx` (ein Durchlauf 7 Sekunden: 5,4 s Fahrt, 1,6 s Pause). Läuft per `requestAnimationFrame` nur, solange das Bild sichtbar und der Tab aktiv ist; bei reduzierter Bewegung und in der gestapelten Ansicht gibt es keinen Punkt.
- **Ausrichtung:** Die Symbole von Assistent und Team stehen auf der Mitte der Listen (`padding-top` an `.system-col-center` gleicht Spaltenüberschrift und Beschriftung aus). Das Excel-Logo und die Symbole von Kalender und Betriebswissen stehen in einem 22 px breiten Feld links bündig mit den Logos darüber; ihre Texte beginnen dadurch etwa auf Höhe der Schriftzüge von HERO, plancraft und ToolTime.
- Die frühere Überblick-Animation (`OverviewFlow` mit Beispielfällen) ist entfernt; der Stand liegt in Git.

## Technik je Anwendungsfall

Jede der fünf Demos endet mit dem Aufklapper „So hängt es technisch zusammen“ (`src/components/StoryTechnical.tsx`, natives `details`, keine Animation). Er zeigt vier Bausteine: Eingang, Assistent, Anbindung, Datenschutz & Betrieb. Jeder Baustein hat einen Satz in Alltagssprache, die Dienste mit Rolle („Womit“) und optional Hinweise. Inhalte stehen im Feld `tech` des jeweiligen Eintrags in `overviewSets` (`src/overviewFlows.ts`); Datenschutz & Betrieb kommt für alle aus `techOperations`, Abweichungen je Workflow stehen in `tech.operationsNotes`.

- **Bestätigte Entscheidung:** Dienste werden als Text mit ihrer Rolle genannt, nicht als Logos, und nur, wenn sie tatsächlich im Einsatz sind (Angaben von Zekun Jiao). Eigene Anbindungen in Python werden ebenfalls so genannt.
- **Stand der Dienste:** sipgate, ElevenLabs Agents bzw. Vapi mit Deepgram, GPT über Azure OpenAI (EU), Whisper über Azure, n8n selbst gehostet, Python (FastAPI) auf Hetzner, WhatsApp Business über 360dialog, Microsoft 365 / IMAP, WordPress (Contact Form 7), DATANORM, Lexware Office, Google Maps Routes API, CAMT.053.
- **Datenschutz & Betrieb:** Server und Ablaufsteuerung in Deutschland (Hetzner), Sprachmodell in der EU (Azure OpenAI), Löschung nach 30 Tagen, Ablaufprotokolle 14 Tage, AVV nach Art. 28 DSGVO, TLS und verschlüsselte Speicherung, Hosting beim Kunden möglich. Zusagen zum Training stehen je Dienst, nicht pauschal (bestätigt von Zekun Jiao): Azure OpenAI inkl. Whisper vertraglich ausgeschlossen, EU; ElevenLabs per Einstellung abgeschaltet, Daten in den USA; Hetzner, n8n und sipgate ohne KI-Training; Google Maps bekommt nur die Adresse. **Noch offen:** Vapi/Deepgram und 360dialog/Meta (WhatsApp); dort steht „klären wir vor dem Start“, bis die Angaben bestätigt sind. Die FAQ „Wie ist es mit dem Datenschutz?“ fasst das zusammen und verweist für Ausnahmen auf den Technikteil.

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
