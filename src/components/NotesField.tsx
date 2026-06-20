// A private, local-only note bound to a boat id (or any key). Autosaves to the
// browser's IndexedDB via useNote — never networked. Shows a clear save state and
// a privacy reminder so the user trusts where the text lives.
import { useNote } from "../lib/notes";

const DEFAULT_PLACEHOLDER =
  "Private notes — survey findings, broker contacts, questions to ask at the sea-trial, your gut feel after a viewing. Saved only in this browser.";

export default function NotesField({
  id,
  placeholder,
  rows = 6,
}: {
  id: string;
  placeholder?: string;
  rows?: number;
}) {
  const { text, update, status, loaded } = useNote(id);
  return (
    <div className="notebox">
      <textarea
        className="noteta"
        value={text}
        placeholder={placeholder ?? DEFAULT_PLACEHOLDER}
        onChange={(e) => update(e.target.value)}
        disabled={!loaded}
        rows={rows}
        spellCheck
      />
      <div className="notemeta">
        <span className="notepriv">
          🔒 Stored only on this device — never uploaded
        </span>
        <span className={"notestat n-" + status}>
          {status === "saving"
            ? "Saving…"
            : status === "saved"
              ? "Saved ✓"
              : text.length > 0
                ? `${text.length.toLocaleString()} characters`
                : ""}
        </span>
      </div>
    </div>
  );
}
