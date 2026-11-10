// Browserfenster mit Beschriftung, Eingabefeld und Absenden-Schaltfläche:
// steht für ein Formular auf der Homepage. Gezeichnet im Stil der
// Lucide-Symbole (24er Raster, Linie).
export function FormWindowIcon({
  size = 24,
  strokeWidth = 1.5,
}: {
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="18" rx="2.5" />
      <path d="M2 8h20" />
      <path d="M5.5 11.2h5.5" />
      <rect x="5.5" y="13.2" width="13" height="2.8" rx="1" />
      <rect
        x="14.5"
        y="17.4"
        width="4"
        height="1.8"
        rx="0.9"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
