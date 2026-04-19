
import React from 'react';
import './BrandLogo.css';

type Props = {
  size?: number;
  showWordmark?: boolean;
};

/**
 * Track the Thesis logo — a crosshair/target reticle intersecting with a
 * ledger checkmark. "Tracking" + "receipts" in one compact mark.
 * Initials "TT" are implied by the two vertical strokes forming the target.
 */
export default function BrandLogo({ size = 36, showWordmark = true }: Props) {
  return (
    <div className="brand-logo" style={{ gap: showWordmark ? 10 : 0 }}>
      <svg
        className="brand-mark-svg"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        aria-label="Track the Thesis"
      >
        {/* outer ring */}
        <circle cx="24" cy="24" r="20" fill="#1a1a1a" />
        <circle cx="24" cy="24" r="20" fill="none" stroke="#1a1a1a" strokeWidth="1" />

        {/* crosshair reticle */}
        <line x1="24" y1="4"  x2="24" y2="11" stroke="#fafaf7" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="24" y1="37" x2="24" y2="44" stroke="#fafaf7" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="4"  y1="24" x2="11" y2="24" stroke="#fafaf7" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="37" y1="24" x2="44" y2="24" stroke="#fafaf7" strokeWidth="1.6" strokeLinecap="round" />

        {/* inner ring */}
        <circle cx="24" cy="24" r="11" fill="none" stroke="#fafaf7" strokeWidth="1.3" opacity="0.55" />

        {/* TT monogram — two serifed uprights sharing a bar = target + initials */}
        <g>
          {/* shared top bar */}
          <rect x="13.5" y="16.8" width="21" height="2.2" rx="0.6" fill="#fafaf7" />
          {/* left T stem */}
          <rect x="18.6" y="19" width="2.2" height="11.5" rx="0.6" fill="#fafaf7" />
          {/* right T stem */}
          <rect x="27.2" y="19" width="2.2" height="11.5" rx="0.6" fill="#fafaf7" />
        </g>

        {/* tiny accent dot — the "receipt" */}
        <circle cx="36" cy="34" r="2.2" fill="#f7931a" stroke="#1a1a1a" strokeWidth="0.8" />
      </svg>

      {showWordmark && (
        <div className="brand-wordmark">
          <span className="brand-word-top">Track the</span>
          <span className="brand-word-bot">Thesis</span>
        </div>
      )}
    </div>
  );
}
