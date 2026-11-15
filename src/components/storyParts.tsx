import type { ReactNode } from "react";

// Gemeinsame Bausteine der Demos mit drei Spalten (Anfragen, Angebote).

// Nummerierte Überschrift über einer Spalte
export function ColumnLabel({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  return (
    <span className="mailbox-column-label">
      <span aria-hidden="true">{number}</span>
      {children}
    </span>
  );
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Hebt die Textstellen hervor, die der Assistent übernimmt. Die Markierung
// erscheint per CSS nacheinander, sobald der Behälter data-marked trägt.
export function Marked({ text, marks }: { text: string; marks: string[] }) {
  if (!marks.length) return text;
  const pattern = new RegExp(`(${marks.map(escape).join("|")})`);
  return text.split(pattern).map((part, position) =>
    marks.includes(part) ? (
      <mark
        key={position}
        style={{ transitionDelay: `${marks.indexOf(part) * 160}ms` }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
