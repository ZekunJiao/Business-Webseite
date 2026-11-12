// Absenderangaben für die Branchenseiten.
// Kontaktfelder bleiben leer, bis echte Angaben eingetragen werden:
// Leere Felder werden auf der Seite nicht angezeigt.
type Contact = {
  name: string;
  role: string;
  intro: string;
  email?: string;
  phone?: string;
};

export const contact: Contact = {
  name: "Zekun Jiao",
  role: "Software, KI und Automatisierung",
  intro:
    "Ich verbinde Softwareentwicklung und Produktdenken, um Geschäftsprozesse verständlicher und einfacher zu machen. Diese Seite zeigt mögliche Abläufe als Beispiele. Sie sind keine fertigen Produkte.",
  email: "",
  phone: "",
};
