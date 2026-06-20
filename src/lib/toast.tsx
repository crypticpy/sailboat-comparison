// A dependency-free toast: a module-level queue with a tiny pub/sub, plus a
// <Toaster/> you mount once. Call toast("…") from anywhere — no context, no props.
import { useEffect, useState } from "react";

interface ToastItem {
  id: number;
  msg: string;
}

let nextId = 1;
let items: ToastItem[] = [];
const listeners = new Set<(t: ToastItem[]) => void>();
const emit = () => listeners.forEach((l) => l(items));

export function toast(msg: string, ms = 2600): void {
  const id = nextId++;
  items = [...items, { id, msg }];
  emit();
  window.setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, ms);
}

export function Toaster() {
  const [list, setList] = useState<ToastItem[]>(items);
  useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);
  if (!list.length) return null;
  return (
    <div className="toaster" role="status" aria-live="polite">
      {list.map((t) => (
        <div className="toast" key={t.id}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
