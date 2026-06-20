// Generic weight-slider grid — drives both the mission-priority weights and the
// selection-pillar blend. Updates are live (the parent re-scores on change).

interface Props<K extends string> {
  dims: [K, string, ...unknown[]][];
  weights: Record<K, number>;
  onChange: (key: K, value: number) => void;
  onReset: () => void;
  resetLabel: string;
  note?: string;
  min: number;
  max: number;
  step: number;
}

export default function WeightSliders<K extends string>({
  dims,
  weights,
  onChange,
  onReset,
  resetLabel,
  note,
  min,
  max,
  step,
}: Props<K>) {
  return (
    <>
      <div className="weights">
        {dims.map(([key, label]) => (
          <div className="wrow" key={key}>
            <label>
              {label} <b>×{weights[key].toFixed(2)}</b>
            </label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={weights[key]}
              onChange={(e) => onChange(key, parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="btn ghost" onClick={onReset}>
          {resetLabel}
        </button>{" "}
        {note && (
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{note}</span>
        )}
      </div>
    </>
  );
}
