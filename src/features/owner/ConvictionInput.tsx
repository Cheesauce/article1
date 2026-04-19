
import React from 'react';
import './ConvictionInput.css';

type Props = {
  value: number | null;
  onChange: (n: number | null) => void;
};

function bandFor(n: number): { label: string; className: string } {
  if (n >= 90) return { label: 'Iron-clad', className: 'band-iron' };
  if (n >= 75) return { label: 'High', className: 'band-high' };
  if (n >= 55) return { label: 'Constructive', className: 'band-mid' };
  if (n >= 35) return { label: 'Cautious', className: 'band-low' };
  if (n > 0) return { label: 'Weak', className: 'band-weak' };
  return { label: 'Unset', className: 'band-none' };
}

export default function ConvictionInput({ value, onChange }: Props) {
  const active = typeof value === 'number';
  const n = active ? (value as number) : 0;
  const band = bandFor(n);

  const setNum = (raw: string) => {
    if (raw.trim() === '') {
      onChange(null);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return;
    onChange(Math.max(0, Math.min(100, parsed)));
  };

  const clear = () => onChange(null);

  return (
    <div className={`conviction-input ${active ? 'active' : ''}`}>
      <div className="conv-head">
        <div className="conv-label-wrap">
          <span className="conv-label">Conviction</span>
          <span className="conv-sub">How sure are you? (0–100)</span>
        </div>
        <div className="conv-readout">
          {active ? (
            <>
              <span className="conv-number">{n}</span>
              <span className="conv-total">/100</span>
              <span className={`conv-band ${band.className}`}>{band.label}</span>
              <button
                type="button"
                className="conv-clear"
                onClick={clear}
                title="Clear conviction"
              >
                Clear
              </button>
            </>
          ) : (
            <button type="button" className="conv-set" onClick={() => onChange(73)}>
              + Set conviction
            </button>
          )}
        </div>
      </div>

      {active && (
        <>
          <div className="conv-slider-row">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={n}
              onChange={(e) => onChange(parseInt(e.target.value, 10))}
              className={`conv-slider ${band.className}`}
              style={{ ['--pct' as any]: `${n}%` }}
            />
            <input
              type="number"
              min={0}
              max={100}
              value={n}
              onChange={(e) => setNum(e.target.value)}
              className="conv-number-input"
              aria-label="Conviction score"
            />
          </div>
          <div className="conv-presets">
            {[25, 50, 73, 85, 95].map((p) => (
              <button
                key={p}
                type="button"
                className={`conv-preset ${n === p ? 'active' : ''}`}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
