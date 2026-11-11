// Handwerkersoftware, an die sich der Ablauf anbinden lässt.
// Nur Programme eintragen, für die tatsächlich eine Anbindung oder ein
// Vertrag besteht. Logos liegen in public/assets/integrations; ihre Anzeige
// ist vom Betreiber der Seite freigegeben. Ohne `logo` erscheint der Name als
// Text.
export type Integration = {
  name: string;
  logo?: string;
  // Logohöhe in px, damit Logos mit unterschiedlichem Seitenverhältnis und
  // Innenabstand optisch gleich gewichtet wirken.
  logoHeight?: number;
  // Logo ist für dunklen Hintergrund gedacht (weiße Schrift).
  onDark?: boolean;
};

export const integrations: Integration[] = [
  { name: "HERO", logo: "/assets/integrations/hero.svg", logoHeight: 28 },
  {
    name: "plancraft",
    logo: "/assets/integrations/plancraft-dark.svg",
    logoHeight: 31,
  },
  {
    name: "ToolTime",
    logo: "/assets/integrations/tooltime.svg",
    logoHeight: 26,
  },
];
