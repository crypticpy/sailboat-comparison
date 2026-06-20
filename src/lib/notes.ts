// Personal notes & comments — stored ONLY in the user's browser, never networked.
// Primary store is IndexedDB (db "sailnotes", store "notes"); if IndexedDB is
// unavailable (private mode, old browser) we fall back to localStorage so a note
// is never silently lost. A tiny pub/sub keeps note indicators (the ✎ badge on
// cards) in sync the instant a note is added or cleared, without prop-drilling.
import { useCallback, useEffect, useReducer, useState } from "react";

const DB_NAME = "sailnotes";
const STORE = "notes";
const VERSION = 1;
const LS_PREFIX = "sailnote:"; // fallback keyspace

export interface Note {
  id: string;
  text: string;
  updated: number;
}

// ── connection (memoised, lazy) ──────────────────────────────────────────────
let dbPromise: Promise<IDBDatabase> | null = null;
let idbBroken = false;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(STORE))
        d.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }).catch((e) => {
    idbBroken = true;
    throw e;
  });
  return dbPromise;
}

function idbReq<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const t = d.transaction(STORE, mode);
        const r = run(t.objectStore(STORE));
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      }),
  );
}

// ── localStorage fallback ────────────────────────────────────────────────────
function lsGet(id: string): string {
  try {
    return localStorage.getItem(LS_PREFIX + id) ?? "";
  } catch {
    return "";
  }
}
function lsSet(id: string, text: string): void {
  try {
    if (text) localStorage.setItem(LS_PREFIX + id, text);
    else localStorage.removeItem(LS_PREFIX + id);
  } catch {
    /* quota / disabled */
  }
}
function lsAll(): Note[] {
  const out: Note[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LS_PREFIX))
        out.push({
          id: k.slice(LS_PREFIX.length),
          text: localStorage.getItem(k) ?? "",
          updated: 0,
        });
    }
  } catch {
    /* ignore */
  }
  return out;
}

// ── live index of which ids carry a note (for badges) ────────────────────────
const idsWithNotes = new Set<string>();
let idsLoaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribeNotes(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

async function ensureIdsLoaded(): Promise<void> {
  if (idsLoaded) return;
  idsLoaded = true;
  try {
    const all = await allNotes();
    for (const n of all) if (n.text.trim()) idsWithNotes.add(n.id);
  } catch {
    /* leave empty */
  }
  emit();
}

function markId(id: string, hasText: boolean): void {
  const had = idsWithNotes.has(id);
  if (hasText) idsWithNotes.add(id);
  else idsWithNotes.delete(id);
  if (had !== hasText) emit();
}

// ── public async API ─────────────────────────────────────────────────────────
export async function getNote(id: string): Promise<string> {
  if (idbBroken) return lsGet(id);
  try {
    const n = await idbReq<Note | undefined>("readonly", (s) => s.get(id));
    return n?.text ?? "";
  } catch {
    return lsGet(id);
  }
}

export async function setNote(id: string, text: string): Promise<void> {
  const clean = text;
  markId(id, !!clean.trim());
  if (idbBroken) {
    lsSet(id, clean);
    return;
  }
  try {
    if (clean)
      await idbReq("readwrite", (s) =>
        s.put({ id, text: clean, updated: Date.now() }),
      );
    else await idbReq("readwrite", (s) => s.delete(id));
  } catch {
    lsSet(id, clean);
  }
}

export async function allNotes(): Promise<Note[]> {
  if (idbBroken) return lsAll();
  try {
    const all = await idbReq<Note[]>("readonly", (s) => s.getAll());
    return all.filter((n) => n.text?.trim());
  } catch {
    return lsAll();
  }
}

export async function deleteNote(id: string): Promise<void> {
  return setNote(id, "");
}

/** Replace the whole notebook (used by import). Returns count written. */
export async function importNotes(notes: Note[]): Promise<number> {
  let n = 0;
  for (const note of notes) {
    if (note && typeof note.id === "string" && typeof note.text === "string") {
      await setNote(note.id, note.text);
      n++;
    }
  }
  return n;
}

// ── React bindings ───────────────────────────────────────────────────────────
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export type SaveStatus = "idle" | "saving" | "saved";

/** Editable note bound to a boat id, with debounced persistence + status. */
export function useNote(id: string) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    getNote(id).then((t) => {
      if (alive) {
        setText(t);
        setStatus("idle");
        setLoaded(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const update = useCallback(
    (t: string) => {
      setText(t);
      setStatus("saving");
      const prev = timers.get(id);
      if (prev) clearTimeout(prev);
      timers.set(
        id,
        setTimeout(() => {
          setNote(id, t).then(() => setStatus("saved"));
          timers.delete(id);
        }, 450),
      );
    },
    [id],
  );

  return { text, update, status, loaded };
}

/** Live set of ids that currently have a note — re-renders on any note change. */
export function useNoteIds(): Set<string> {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    ensureIdsLoaded();
    return subscribeNotes(force);
  }, []);
  return idsWithNotes;
}
