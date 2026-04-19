
import React from 'react';
import './ConvictionBadge.css';

type Props = {
  value: number;
};

function bandFor(n: number): { label: string; className: string } {
  if (n >= 90) return { label: 'Iron-clad', className: 'cb-iron' };
  if (n >= 75) return { label: 'High', className: 'cb-high' };
  if (n >= 55) return { label: 'Constructive', className: 'cb-mid' };
  if (n >= 35) return { label: 'Cautious', className: 'cb-low' };
  if (n > 0) return { label: 'Weak', className: 'cb-weak' };
  return { label: 'Unset', className: 'cb-none' };
}

export default function ConvictionBadge({ value }: Props) {
  const n = Math.max(0, Math.min(100, Math.round(value)));
  const band = bandFor(n);
  return (
    <div className={`conviction-badge ${band.className}`} title={`Conviction ${n}/100 — ${band.label}`}>
      <div className="cb-label">
        <span className="cb-label-text">Conviction</span>
        <span className="cb-band-text">{band.label}</span>
      </div>
      <div className="cb-meter" aria-hidden="true">
        <div className="cb-meter-fill" style={{ width: `${n}%` }} />
      </div>
      <div className="cb-number">
        <span className="cb-n">{n}</span>
        <span className="cb-total">/100</span>
      </div>
    </div>
  );
}
