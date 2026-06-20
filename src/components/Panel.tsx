import { useState, type ReactNode } from "react";

interface Props {
  title: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

/** Collapsible card panel matching the legacy .panel / .ph / .pbody markup. */
export default function Panel({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel">
      <div className="ph" onClick={() => setOpen((o) => !o)}>
        <div>
          <h3>{title}</h3>
          <small>{subtitle}</small>
        </div>
        <button
          className="btn ghost"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open && <div className="pbody">{children}</div>}
    </div>
  );
}
