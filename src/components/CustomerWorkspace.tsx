import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Check,
  Circle,
  ContactRound,
  FileText,
  Folder,
  List,
  Mail,
  MapPin,
  UserCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  customerExtractions,
  type ExtractionState,
} from "../customerExtraction";
import { scenarios } from "../data";
const customer = scenarios.partial;
type Row = {
  id: string;
  customer: string;
  title: string;
  status: string;
  open: boolean;
};
// Vorgänge der Beispielkundin, neuester zuerst.
const history = [
  {
    id: "new",
    title: "Neue Wartungsanfrage",
    status: "Neu · Prüfung offen",
    type: "Anfrage · noch kein Auftrag",
    summary: "",
    documents: ["Aktuelle Kundenmail", "Erfasste Angaben"],
    tasks: [
      "Anlagenmodell bestätigen",
      "Startgeräusch fachlich einschätzen",
      "Termin persönlich abstimmen",
      "Angebot mit Anfahrt und möglichen Zusatzkosten vorbereiten",
    ],
  },
  {
    id: "repair-2025",
    title: "Reparaturanfrage 2025",
    status: "Abgeschlossen",
    type: "Reparaturanfrage",
    summary: "Frühere Rückfrage zur Anlage. Der Vorgang wurde abgeschlossen.",
    documents: ["E-Mail-Verlauf", "Gesprächsnotiz"],
    tasks: [],
  },
  {
    id: "maintenance-2024",
    title: "Wartung 2024",
    status: "Abgeschlossen",
    type: "Wartungsauftrag",
    summary: "Abgeschlossene Wartung der Wärmepumpe am Musterweg 14.",
    documents: ["Wartungsbericht", "Rechnung"],
    tasks: [],
  },
];
// Weitere fiktive Beispielkunden, damit die Gesamtübersicht nicht nur eine Kundin zeigt.
const otherRows: Row[] = [
  {
    id: "other-krause",
    customer: "Familie Krause",
    title: "Heizkörper werden nicht warm",
    status: "Angebot gesendet",
    open: false,
  },
  {
    id: "other-brandt",
    customer: "Herr Brandt",
    title: "Wartung Gasheizung",
    status: "Termin bestätigt",
    open: false,
  },
];
const infoFields = customerExtractions.filter((e) => e.group === "info");
const taskFields = customerExtractions.filter((e) => e.group === "task");
export function CustomerWorkspace({
  processed,
  onInteract,
  extraction,
  extracting,
  running,
  inspected,
  onSelectField,
  onHoverField,
}: {
  processed: boolean;
  extraction: ExtractionState;
  extracting: boolean;
  running: boolean;
  inspected: string | null;
  onSelectField: (id: string) => void;
  onHoverField: (id: string | null) => void;
  onInteract: () => void;
}) {
  const [view, setView] = useState<"list" | "customer">("list");
  const [recordId, setRecordId] = useState<string | null>(null);
  useEffect(() => {
    if (processed) setRecordId("new");
    else setRecordId((id) => (id === "new" ? null : id));
  }, [processed]);
  const reduced = useReducedMotion();
  const records = processed
    ? history
    : history.filter((item) => item.id !== "new");
  const record = records.find((item) => item.id === recordId);
  const ownRows: Row[] = records.map((item) => ({
    id: item.id,
    customer: "Lena Hoffmann",
    title: item.title,
    status: item.status,
    open: true,
  }));
  const showAll = view === "list";
  const tableRows: Row[] = showAll
    ? [
        ...ownRows.filter((item) => item.id === "new"),
        ...otherRows,
        ...ownRows.filter((item) => item.id !== "new"),
      ]
    : ownRows;
  const rows = (
    <Table className="customer-table">
      <TableHeader>
        <TableRow>
          <TableHead>Vorgang</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableRows.map((item) => {
          const label = (
            <span>
              {showAll && (
                <small className="record-customer">{item.customer}</small>
              )}
              {item.title}
              {item.id === "new" && <span className="new-record-tag">Neu</span>}
            </span>
          );
          return (
            <TableRow
              key={item.id}
              className={item.id === "new" ? "new-record-row" : ""}
            >
              <TableCell>
                {item.open ? (
                  <button
                    className="record-open"
                    onClick={() => setRecordId(item.id)}
                    aria-label={`${item.title} öffnen`}
                  >
                    <Folder size={15} />
                    {label}
                    <ArrowUpRight size={13} />
                  </button>
                ) : (
                  <div className="record-open static">
                    <Folder size={15} />
                    {label}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`record-status ${item.id === "new" ? "pending" : ""}`}
                >
                  {item.status === "Abgeschlossen" && <Check size={11} />}{" "}
                  {item.status}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
  const renderField = (item: (typeof customerExtractions)[number]) => {
    const i = customerExtractions.findIndex((e) => e.id === item.id);
    const field = customer.crmFields.find((f) => f.label === item.field)!;
    const captured = extraction.completed > i;
    return (
      <div
        key={item.id}
        data-crm-field={field.label}
        data-crm-field-id={item.id}
        className={`extraction-field ${captured ? "is-captured" : ""}`}
        data-inspected={inspected === item.id || undefined}
      >
        <dt>
          {field.label}
          <Check
            size={13}
            className="extraction-check"
            aria-hidden="true"
            style={{ opacity: captured ? 1 : 0 }}
          />
        </dt>
        <dd>
          <button
            type="button"
            className="extraction-inspect"
            disabled={!captured}
            aria-label={`${field.label}: ${field.value}. Textquelle anzeigen`}
            aria-pressed={inspected === item.id}
            onMouseEnter={() => captured && onHoverField(item.id)}
            onMouseLeave={() => onHoverField(null)}
            onFocus={() => onHoverField(item.id)}
            onBlur={() => onHoverField(null)}
            onClick={() => onSelectField(item.id)}
          >
            <span className="extraction-reserved" aria-hidden="true">
              {field.value}
            </span>
            <span
              className="extraction-value"
              style={{
                visibility: captured ? "visible" : "hidden",
                animationPlayState: running ? "running" : "paused",
              }}
            >
              {field.value}
            </span>
            {!captured && (
              <span className="extraction-placeholder" aria-hidden="true" />
            )}
          </button>
        </dd>
        <span className="extraction-source-label">
          Quelle: {item.reference}
        </span>
      </div>
    );
  };
  return (
    <div className="customer-workspace" onClickCapture={onInteract}>
      <div
        className="customer-view-switch"
        aria-label="Ansicht der Kundenverwaltung"
      >
        <Button
          size="sm"
          variant={view === "list" ? "default" : "ghost"}
          aria-pressed={view === "list"}
          onClick={() => {
            setView("list");
            setRecordId(null);
          }}
        >
          <List size={14} />
          Alle Vorgänge
        </Button>
        <Button
          size="sm"
          variant={view === "customer" ? "default" : "ghost"}
          aria-pressed={view === "customer"}
          onClick={() => {
            setView("customer");
            setRecordId(null);
          }}
        >
          <ContactRound size={14} />
          Kundenakte
        </Button>
      </div>
      <div
        className={`customer-match ${processed ? "matched" : ""}`}
        role="status"
      >
        {processed ? <Check size={14} /> : <Mail size={14} />}
        <span>
          {processed
            ? "Absender erkannt · Kunde zugeordnet"
            : "Beispiel-Kundenbestand · noch kein Mailabgleich"}
        </span>
      </div>
      {record ? (
        <div className="record-detail">
          <Button
            variant="ghost"
            size="sm"
            className="record-back"
            onClick={() => setRecordId(null)}
          >
            <ArrowLeft size={13} />
            Zur Übersicht
          </Button>
          <span className="record-detail-type">{record.type}</span>
          <h3>{record.title}</h3>
          <Badge variant="outline">{record.status}</Badge>
          {record.summary && (
            <p className="record-description">{record.summary}</p>
          )}
          <div className="record-owner">
            <ContactRound size={15} />
            <span>Lena Hoffmann</span>
            <MapPin size={14} />
            <span>Musterweg 14</span>
          </div>
          {record.id === "new" ? (
            <>
              <p className="record-meta">
                Eingang heute, 09:41 · Zuständig: noch offen
              </p>
              <p className="record-review">
                <UserCheck size={14} />
                Vorschlag aus der E-Mail. Das Büro prüft und gibt frei.
              </p>
              <h4>Angaben aus der E-Mail</h4>
              <dl className="record-facts">{infoFields.map(renderField)}</dl>
              <h4>Aufgaben</h4>
              <dl className="record-facts">{taskFields.map(renderField)}</dl>
              <div
                className="record-next"
                style={
                  extracting && extraction.phase !== "done"
                    ? { visibility: "hidden" }
                    : undefined
                }
              >
                <strong>Intern im Büro</strong>
                <ul className="task-list">
                  {record.tasks.map((task) => (
                    <li key={task}>
                      <Circle size={11} aria-hidden="true" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
              <details className="record-original">
                <summary>
                  <Mail size={14} />
                  Ursprüngliche Kundenmail ansehen
                </summary>
                <p>{customer.intro}</p>
                {customer.questions.map((q) => (
                  <p key={q}>{q}</p>
                ))}
                <p>
                  {customer.sender} · {customer.email}
                </p>
              </details>
            </>
          ) : (
            <>
              <h4>Zugeordnete Dokumente</h4>
              <ul className="record-documents">
                {record.documents.map((doc) => (
                  <li key={doc}>
                    <FileText size={15} />
                    {doc}
                  </li>
                ))}
              </ul>
              <div className="record-next">
                <strong>Aufgaben</strong>
                <p>Abgeschlossen. Keine Aufgabe offen.</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {view === "customer" && (
            <div className="customer-file">
              <div className="customer-identity">
                <span className="avatar">LH</span>
                <div>
                  <strong>Lena Hoffmann</strong>
                  <small>
                    Bestandskundin · Kontaktdaten & Rechnungsadresse
                  </small>
                </div>
              </div>
              <div className="customer-address">
                <Mail size={14} />
                <span>{customer.email}</span>
              </div>
              <div className="customer-address">
                <MapPin size={14} />
                <span>Musterweg 14 · Rechnungsadresse</span>
              </div>
              <div className="customer-installation">
                <Building2 size={19} />
                <div>
                  <strong>Objekt & Anlage</strong>
                  <p>
                    Musterweg 14
                    <br />
                    Luft/Wasser-Wärmepumpe
                    <br />
                    Modell nicht hinterlegt
                    {processed && (
                      <>
                        <br />
                        Baujahr 2021 laut E-Mail · zu bestätigen
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="customer-record-count">
            <span>
              {view === "customer" ? "VORGÄNGE DIESER KUNDIN" : "ALLE VORGÄNGE"}
            </span>
            <Badge variant="outline">{tableRows.length} Vorgänge</Badge>
          </div>
          {rows}
          {processed ? (
            <motion.div
              key="new-record"
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="customer-new-note"
            >
              <Check size={15} />
              <span>
                Vorschlag für einen neuen Vorgang angelegt. Kundenmail und{" "}
                {customer.questions.length} Fragen sind zugeordnet. Das Büro
                prüft und gibt frei. Öffne den Vorgang, um die Angaben zu sehen.
              </span>
            </motion.div>
          ) : (
            <div className="customer-new-note idle">
              <Mail size={15} />
              <span>
                Beim Abspielen wird die neue Kundenmail zugeordnet. Die
                bisherigen Vorgänge bleiben erhalten.
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
