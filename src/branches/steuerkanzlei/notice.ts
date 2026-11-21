import type { NoticeStoryData } from "../../noticeStory";

// Beispielbescheide für die Bescheid-Demo der Steuerkanzlei. Kanzlei,
// Mandanten, Finanzamt und Beträge sind erfunden. Vereinfachte Darstellung,
// keine Steuerberatung.
//
// Fristen: Bekanntgabe am vierten Tag nach dem Bescheiddatum (§ 122 Abs. 2
// AO, seit 2025), Einspruchsfrist ein Monat; fällt das Ende auf ein
// Wochenende, gilt der nächste Werktag. Bei Änderung der Daten nachrechnen.
//
// Fall Keller (passt zum Anruf in der Telefon-Demo): Laut Kanzlei 380 €
// Erstattung, laut Bescheid 2.140 € Nachzahlung. Differenz 2.520 € =
// 190 € (Fahrten) + 380 € (Spenden) + 1.950 € (Vorauszahlungen).
export const bescheidStory: NoticeStoryData = {
  without:
    "Bescheide kommen in Wellen. Jeder wird Zeile für Zeile mit der Erklärung verglichen, die Frist von Hand berechnet und dem Mandanten am Telefon erklärt.",
  with: "Jeder Bescheid ist abgeglichen, Abweichungen sind eingeordnet, die Frist ist berechnet und eine verständliche Mail an den Mandanten liegt bereit.",
  closing: "Mit freundlichen Grüßen\nIhre Steuerkanzlei Mustermann",
  cases: [
    {
      id: "nachzahlung",
      headline: "Nachzahlung statt Erstattung",
      client: "Stefan Keller",
      kind: "Einkommensteuer 2025",
      channel: "Mandantenportal",
      time: "11:40",
      notice: {
        title: "Bescheid für 2025 über Einkommensteuer",
        authority: "Finanzamt Freising",
        date: "12. November 2026",
        lines: [
          { label: "Festgesetzte Einkommensteuer", value: "9.870,00 €" },
          { label: "Abzüglich Lohnsteuer", value: "7.730,00 €" },
          { label: "Abzüglich Vorauszahlungen", value: "0,00 €" },
          { label: "Verbleibende Nachzahlung", value: "2.140,00 €" },
        ],
        explanation: [
          "Die Fahrten zur ersten Tätigkeitsstätte wurden an 180 Tagen berücksichtigt. Ihr Arbeitgeber hat 40 Tage Tätigkeit in der Wohnung bescheinigt.",
          "Zuwendungen wurden nur in Höhe von 200 € berücksichtigt. Eine Zuwendungsbestätigung über 1.000 € lag nicht vor.",
        ],
      },
      marks: [
        "Abzüglich Vorauszahlungen",
        "2.140,00 €",
        "an 180 Tagen",
        "40 Tage Tätigkeit in der Wohnung",
        "nur in Höhe von 200 €",
        "Zuwendungsbestätigung über 1.000 €",
      ],
      steps: [
        { kind: "read", label: "Liest den Bescheid", result: "Nachzahlung 2.140 €, 2 Erläuterungen" },
        { kind: "compare", label: "Gleicht mit der Erklärung ab", result: "3 Abweichungen, Rest wie erklärt" },
        { kind: "history", label: "Prüft Akte und Konto", result: "Vorauszahlungen 4 × 487,50 € bezahlt" },
        { kind: "deadline", label: "Berechnet die Einspruchsfrist", result: "bis Mittwoch, 16. Dezember 2026" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Mail an Herrn Keller bereit" },
      ],
      columns: ["Erklärung", "Bescheid"],
      compareWith: "der Erklärung",
      sameLabel: "wie erklärt",
      summary: {
        before: { label: "Laut Ihrer Berechnung", value: "Erstattung 380 €" },
        after: { label: "Laut Bescheid", value: "Nachzahlung 2.140 €" },
        tone: "due",
      },
      rows: [
        {
          label: "Vorauszahlungen",
          declared: "1.950 €",
          assessed: "0 €",
          tone: "error",
          effect: "+ 1.950 €",
          note: "Laut Kontoauszug vier Raten à 487,50 € bezahlt. Fehler bei der Anrechnung, beim Finanzamt berichtigen lassen.",
        },
        {
          label: "Spenden",
          declared: "1.200 €",
          assessed: "200 €",
          tone: "deviation",
          effect: "+ 380 € Steuer",
          note: "Die Bestätigung über 1.000 € liegt in der Akte. Sie wurde nicht angefordert und kann nachgereicht werden.",
        },
        {
          label: "Fahrten zur Arbeit",
          declared: "220 Tage",
          assessed: "180 Tage",
          tone: "deviation",
          effect: "+ 190 € Steuer",
          note: "Passt zur Bescheinigung des Arbeitgebers. Für die 40 Tage zu Hause lässt sich die Homeoffice-Pauschale von 240 € nachträglich beantragen.",
        },
        {
          label: "Lohn, Versicherungen, Kinderbetreuung",
          declared: "wie erklärt",
          assessed: "wie erklärt",
          tone: "same",
        },
      ],
      deadline: [
        { label: "Bescheid vom", value: "Do, 12. November 2026" },
        { label: "Bekannt gegeben", value: "Mo, 16. November 2026" },
        { label: "Einspruch bis", value: "Mi, 16. Dezember 2026" },
      ],
      decision: {
        question: "Wie reagiert die Kanzlei?",
        options: [
          {
            label: "Einspruch einlegen",
            tag: "Einspruch vorbereitet",
            paragraph:
              "Wir legen deshalb Einspruch ein, reichen die Spendenbestätigung nach und beantragen die Homeoffice-Pauschale für die 40 Tage. Die Anrechnung der Vorauszahlungen lassen wir gleichzeitig berichtigen.",
          },
          {
            label: "Nur Anrechnung berichtigen",
            tag: "Anrechnung beantragt",
            paragraph:
              "Wir lassen die Anrechnung der Vorauszahlungen beim Finanzamt berichtigen. Die Kürzungen bei Spenden und Fahrten nehmen wir hin.",
          },
        ],
      },
      sentTag: "Geprüft",
      mail: {
        to: "Stefan Keller",
        salutation: "Guten Tag Herr Keller,",
        paragraphs: [
          "wir haben Ihren Einkommensteuerbescheid 2025 geprüft. Den größten Teil der Nachzahlung erklärt ein Fehler des Finanzamts: Ihre vier Vorauszahlungen von zusammen 1.950 € wurden nicht angerechnet.",
          "Außerdem hat das Finanzamt 1.000 € Spenden und 40 Fahrtage nicht berücksichtigt.",
          "{decision}",
          "Frau Berger bespricht das heute Nachmittag am Telefon mit Ihnen, auch wie Sie bis zur Klärung mit der Zahlung umgehen.",
        ],
      },
    },
    {
      id: "wie-erklaert",
      headline: "Bescheid wie erklärt",
      client: "Familie Roth",
      kind: "Einkommensteuer 2025",
      channel: "Bescheiddaten",
      time: "07:15",
      notice: {
        title: "Bescheid für 2025 über Einkommensteuer",
        authority: "Finanzamt Freising",
        date: "5. November 2026",
        lines: [
          { label: "Festgesetzte Einkommensteuer", value: "14.320,00 €" },
          { label: "Abzüglich Lohnsteuer", value: "15.560,00 €" },
          { label: "Verbleibende Erstattung", value: "1.240,00 €" },
        ],
        explanation: [
          "Die Festsetzung ist nach § 165 AO teilweise vorläufig. Die Vorläufigkeit betrifft Fragen, die noch bei Gerichten anhängig sind.",
        ],
      },
      marks: ["1.240,00 €", "teilweise vorläufig"],
      steps: [
        { kind: "read", label: "Liest den Bescheid", result: "Erstattung 1.240 €, keine Abweichung erläutert" },
        { kind: "compare", label: "Gleicht mit der Erklärung ab", result: "Alle Werte wie erklärt" },
        { kind: "history", label: "Prüft die Vorläufigkeit", result: "Üblicher Vermerk, nichts zu tun" },
        { kind: "deadline", label: "Berechnet die Einspruchsfrist", result: "bis Mittwoch, 9. Dezember 2026" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Mail an Familie Roth bereit" },
      ],
      columns: ["Erklärung", "Bescheid"],
      compareWith: "der Erklärung",
      sameLabel: "wie erklärt",
      summary: {
        before: { label: "Laut Ihrer Berechnung", value: "Erstattung 1.240 €" },
        after: { label: "Laut Bescheid", value: "Erstattung 1.240 €" },
        tone: "credit",
      },
      rows: [
        {
          label: "Löhne beider Ehegatten",
          declared: "wie erklärt",
          assessed: "wie erklärt",
          tone: "same",
        },
        {
          label: "Kinderbetreuung",
          declared: "3.600 €",
          assessed: "3.600 €",
          tone: "same",
        },
        {
          label: "Handwerkerleistungen",
          declared: "840 € Ermäßigung",
          assessed: "840 € Ermäßigung",
          tone: "same",
        },
      ],
      deadline: [
        { label: "Bescheid vom", value: "Do, 5. November 2026" },
        { label: "Bekannt gegeben", value: "Mo, 9. November 2026" },
        { label: "Einspruch bis", value: "Mi, 9. Dezember 2026" },
      ],
      sentTag: "Geprüft · informiert",
      mail: {
        to: "Familie Roth",
        salutation: "Guten Tag Frau Roth, guten Tag Herr Roth,",
        paragraphs: [
          "Ihr Einkommensteuerbescheid 2025 ist da und entspricht unserer Berechnung: Sie bekommen 1.240 € zurück. Das Geld kommt in den nächsten Tagen auf Ihr Konto.",
          "Der Bescheid ist in einzelnen Punkten vorläufig. Das ist üblich und für Sie ohne Folgen.",
          "Sie müssen nichts weiter tun.",
        ],
      },
    },
    {
      id: "vorauszahlungen",
      headline: "Vorauszahlungen erhöht",
      client: "Markus Lindner",
      kind: "Vorauszahlungen 2026",
      channel: "Mandantenportal",
      time: "08:05",
      notice: {
        title: "Bescheid über Einkommensteuer-Vorauszahlungen",
        authority: "Finanzamt Freising",
        date: "10. November 2026",
        lines: [
          { label: "Vorauszahlung je Quartal bisher", value: "1.200,00 €" },
          { label: "Vorauszahlung je Quartal neu", value: "2.050,00 €" },
          { label: "Erstmals fällig", value: "10. Dezember 2026" },
        ],
        explanation: [
          "Die Vorauszahlungen wurden an die Veranlagung 2025 angepasst. Grundlage ist ein Gewinn aus Gewerbebetrieb von 68.000 €.",
        ],
      },
      marks: [
        "2.050,00 €",
        "an die Veranlagung 2025 angepasst",
        "Gewinn aus Gewerbebetrieb von 68.000 €",
      ],
      steps: [
        { kind: "read", label: "Liest den Bescheid", result: "Vorauszahlung steigt auf 2.050 € je Quartal" },
        { kind: "compare", label: "Gleicht mit der Buchhaltung ab", result: "Gewinn Januar bis Oktober: 40.800 €" },
        { kind: "history", label: "Rechnet das Jahr hoch", result: "Gewinn 2026 etwa 49.000 €" },
        { kind: "deadline", label: "Berechnet Frist und nächste Rate", result: "Rate am 10. Dezember, Einspruch bis 14. Dezember" },
        { kind: "write", label: "Schreibt den Entwurf", result: "Mail an Herrn Lindner bereit" },
      ],
      columns: ["Buchhaltung", "Bescheid"],
      compareWith: "der Buchhaltung",
      sameLabel: "unverändert",
      summary: {
        before: { label: "Passend zu 2026", value: "ca. 1.200 € je Quartal" },
        after: { label: "Laut Bescheid", value: "2.050 € je Quartal" },
        tone: "due",
      },
      rows: [
        {
          label: "Gewinn als Grundlage",
          declared: "ca. 49.000 € (2026)",
          assessed: "68.000 € (2025)",
          tone: "deviation",
          effect: "− 19.000 €",
          note: "Umsatz bis Oktober 14 % unter Vorjahr, dazu ab Dezember eine neue Aushilfe.",
        },
        {
          label: "Vorauszahlung je Quartal",
          declared: "ca. 1.200 €",
          assessed: "2.050 €",
          tone: "deviation",
          effect: "− 850 € je Quartal",
          note: "Mit dem hochgerechneten Gewinn 2026 gerechnet, Bandbreite ± 150 €.",
        },
        {
          label: "Zahlungstermine",
          declared: "10.3., 10.6., 10.9., 10.12.",
          assessed: "wie bisher",
          tone: "same",
        },
      ],
      deadline: [
        { label: "Bescheid vom", value: "Di, 10. November 2026" },
        { label: "Bekannt gegeben", value: "Sa, 14. November 2026" },
        { label: "Einspruch bis", value: "Mo, 14. Dezember 2026" },
        { label: "Nächste Rate", value: "Do, 10. Dezember 2026" },
      ],
      decision: {
        question: "Was tun mit den höheren Vorauszahlungen?",
        options: [
          {
            label: "Herabsetzung beantragen",
            tag: "Antrag vorbereitet",
            paragraph:
              "Wir beantragen deshalb, die Vorauszahlungen bei 1.200 € je Quartal zu lassen, und legen die Zahlen aus Ihrer Buchhaltung bei. Bitte bestätigen Sie uns kurz, dass bis Jahresende keine größeren Einnahmen mehr dazukommen.",
          },
          {
            label: "Vorauszahlungen so lassen",
            tag: "Ohne Antrag",
            paragraph:
              "Wir lassen die neuen Vorauszahlungen so stehen. Was Sie zu viel zahlen, bekommen Sie mit dem Bescheid für 2026 zurück.",
          },
        ],
      },
      sentTag: "Geprüft",
      mail: {
        to: "Markus Lindner",
        salutation: "Guten Tag Herr Lindner,",
        paragraphs: [
          "das Finanzamt hat Ihre Vorauszahlungen ab Dezember von 1.200 € auf 2.050 € je Quartal erhöht. Grundlage ist Ihr guter Gewinn aus 2025.",
          "Laut Ihrer Buchhaltung liegt der Gewinn 2026 deutlich darunter, hochgerechnet bei etwa 49.000 €.",
          "{decision}",
        ],
      },
    },
  ],
};
