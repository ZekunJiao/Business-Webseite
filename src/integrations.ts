// Handwerkersoftware, an die sich der Ablauf anbinden lässt.
// Nur Programme eintragen, für die tatsächlich eine Anbindung oder ein
// Vertrag besteht. Logos liegen in public/assets/integrations; ihre Anzeige
// ist vom Betreiber der Seite freigegeben. Ohne `logo` erscheint der Name als
// Text.
export type Integration = {
  name: string;
  logo?: string;
  // Logo ist für dunklen Hintergrund gedacht (weiße Schrift).
  onDark?: boolean;
};

export const integrations: Integration[] = [
  { name: "plancraft", logo: "/assets/integrations/plancraft.svg" },
  {
    name: "ToolTime",
    logo: "/assets/integrations/tooltime-inverted.svg",
    onDark: true,
  },
];

export const integrationsNote =
  "Logos und Namen sind Marken der jeweiligen Anbieter. Sie nennen mögliche Anbindungen, keine Empfehlung durch den Anbieter.";
