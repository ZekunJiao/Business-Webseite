import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Check,
  ContactRound,
  FileText,
  Folder,
  List,
  Mail,
  MapPin,
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
const history = [
  {
    id: "maintenance-2024",
    title: "Wartung 2024",
    status: "Abgeschlossen",
    type: "Wartungsauftrag",
    summary: "Abgeschlossene Wartung der Wärmepumpe am Musterweg 14.",
    documents: ["Wartungsbericht", "Rechnung"],
    next: "Abgeschlossen. Keine Aufgabe offen.",
  },
  {
    id: "repair-2025",
    title: "Reparaturanfrage 2025",
    status: "Abgeschlossen",
    type: "Reparaturanfrage",
    summary: "Frühere Rückfrage zur Anlage. Der Vorgang wurde abgeschlossen.",
    documents: ["E-Mail-Verlauf", "Gesprächsnotiz"],
    next: "Abgeschlossen. Keine Aufgabe offen.",
  },
  {
    id: "new",
    title: "Neue Wartungsanfrage",
    status: "Angebot vorbereiten",
    type: "Anfrage · noch kein Auftrag",
    summary:
      "Wartung und Prüfung eines Startgeräuschs. Zeitfenster und Kostenfragen sind in der Kundenmail genannt.",
    documents: ["Aktuelle Kundenmail", "Erfasste Angaben"],
    next: "Anlagenmodell bestätigen, Startgeräusch fachlich einschätzen und Angebot inklusive möglicher Zusatzkosten vorbereiten.",
  },
];
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
  const records = processed ? history : history.slice(0, 2);
  const record = records.find((item) => item.id === recordId);
  const rows = (
    <Table className="customer-table">
      <TableHeader>
        <TableRow>
          <TableHead>Vorgang</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((item) => (
          <TableRow
            key={item.id}
            className={item.id === "new" ? "new-record-row" : ""}
          >
            <TableCell>
              <button
                className="record-open"
                onClick={() => setRecordId(item.id)}
                aria-label={`${item.title} öffnen`}
              >
                <Folder size={15} />
                <span>
                  {item.title}
                  {item.id === "new" && (
                    <span className="new-record-tag">Neu</span>
                  )}
                </span>
                <ArrowUpRight size={13} />
              </button>
            </TableCell>
            <TableCell>
              <span
                className={`record-status ${item.id === "new" ? "pending" : ""}`}
              >
                {item.id !== "new" && <Check size={11} />} {item.status}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
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
          Liste
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
          <p className="record-description">{record.summary}</p>
          <div className="record-owner">
            <ContactRound size={15} />
            <span>Lena Hoffmann</span>
            <MapPin size={14} />
            <span>Musterweg 14</span>
          </div>
          <h4>
            {record.id === "new"
              ? "Aus der E-Mail erfasst"
              : "Zugeordnete Dokumente"}
          </h4>
          {record.id === "new" ? (
            <>
              <dl className="record-facts">
                {customerExtractions.map((item, i) => {
                  const field = customer.crmFields.find(
                    (f) => f.label === item.field,
                  )!;
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
                          <span
                            className="extraction-reserved"
                            aria-hidden="true"
                          >
                            {field.value}
                          </span>
                          <span
                            className="extraction-value"
                            style={{
                              visibility: captured ? "visible" : "hidden",
                              animationPlayState: running
                                ? "running"
                                : "paused",
                            }}
                          >
                            {field.value}
                          </span>
                          {!captured && (
                            <span
                              className="extraction-placeholder"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </dd>
                      <span className="extraction-source-label">
                        Quelle: {item.reference}
                      </span>
                    </div>
                  );
                })}
              </dl>
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
            <ul className="record-documents">
              {record.documents.map((doc) => (
                <li key={doc}>
                  <FileText size={15} />
                  {doc}
                </li>
              ))}
            </ul>
          )}
          <div
            className="record-next"
            style={
              extracting && extraction.phase !== "done"
                ? { visibility: "hidden" }
                : undefined
            }
          >
            <strong>Nächste Aufgabe</strong>
            <p>{record.next}</p>
          </div>
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
                    Luft/Wasser-Wärmepumpe · Baujahr 2021
                    <br />
                    Modell noch zu bestätigen
                  </p>
                </div>
              </div>
            </div>
          )}
          {view === "list" && (
            <div className="customer-list-heading">
              <strong>Lena Hoffmann</strong>
              <small>Musterweg 14 · Wärmepumpe</small>
            </div>
          )}
          <div className="customer-record-count">
            <span>
              {view === "customer"
                ? "VORGÄNGE DIESER KUNDIN"
                : "ANFRAGEN & AUFTRÄGE"}
            </span>
            <Badge variant="outline">{records.length} Vorgänge</Badge>
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
                Neue Anfrage angelegt. Kundenmail und{" "}
                {customer.questions.length} Anliegen zugeordnet. Klicke auf den
                Vorgang, um die Angaben zu prüfen.
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
