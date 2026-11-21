import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { Integration } from "../integrations";
import type { OverviewSet, UseCaseCard } from "../overviewFlows";
import type { Result } from "../contact";

// Inhalte einer Branchenseite (z. B. /handwerk). Aufbau, Stil und Demos sind
// für alle Branchen gleich; hier stehen nur Texte, Anwendungsfälle und
// Beispieldaten. Anrede (du/Sie) ergibt sich aus den Texten.

export type IconComponent = ComponentType<{
  size?: number;
  strokeWidth?: number;
}>;

export type Branch = {
  // Erste Angabe ist die Adresse der Seite, weitere leiten darauf um.
  paths: string[];
  meta: { title: string; description: string };
  header: {
    icon: LucideIcon;
    name: string;
    tag: string;
    explore: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    // Zwei Sätze; auf breiten Bildschirmen steht der zweite in neuer Zeile.
    lead: [string, string];
    primaryCta: string;
    secondaryCta: string;
    // Kennzahlen im Einstieg: alle Einträge aus author.results mit teaser.
    // Ohne proof entfällt der Block.
    proof?: { label: string; link: string };
  };
  useCases: {
    kicker: string;
    title: string;
    intro: string;
    sets: OverviewSet[];
    // Geplante Fälle ohne Demo, als Zeile unter den Karten
    upcoming: UseCaseCard[];
  };
  overview: {
    title: string;
    intro: string;
    inputsTitle: string;
    // Nur Eingänge, die auch in den Demos vorkommen.
    inputs: { name: string; icon: IconComponent; strokeWidth?: number }[];
    softwareTitle: string;
    integrations: Integration[];
    // Weitere Einträge unter den Logos: Symbol oder kleines Bild
    extras: { name: string; icon?: LucideIcon; image?: string }[];
    assistantText: string;
    teamTitle: string;
    teamText: string;
  };
  process: {
    intro: string;
    steps: { title: string; text: string }[];
    faqs: { question: string; answer: string }[];
  };
  closing: {
    kicker: string;
    title: string;
    paragraphs: string[];
    personRole: string;
    cta: string;
  };
  author: {
    intro: string;
    builds: string[];
    // Leer: Der Block „Zahlen aus Kundenprojekten“ entfällt.
    results: Result[];
    resultsNote: string;
    strengthsTitle: string;
    strengths: { title: string; text: string }[];
    contactTitle: string;
    contactText: string;
    form: {
      submitLabel: string;
      messagePlaceholder: string;
      doneText: string;
      thanks: string;
      privacyNote: string;
      errorFallback: string;
    };
  };
  footer: string;
};
