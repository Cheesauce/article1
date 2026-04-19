

import React from 'react';
import './TagPill.css';
import { Tag } from '../features/posts/types';

type Props = {
  tag: Tag;
  onClick?: () => void;
  size?: 'sm' | 'md';
};

// Expanded palette — each tag VALUE gets a consistent, deterministic color.
// So "Bitcoin" always looks the same everywhere ("tracking" via hash).
const PALETTE: { border: string; bg: string; text: string; dot: string }[] = [
  { border: '#cfe3c2', bg: '#eef7e6', text: '#2f5320', dot: '#6ea544' }, // green
  { border: '#cdd9ee', bg: '#e8eff9', text: '#26447a', dot: '#4f7ac4' }, // blue
  { border: '#f2d9c0', bg: '#fcefe0', text: '#7a4414', dot: '#d18b4a' }, // amber
  { border: '#e8cde0', bg: '#f7e8f1', text: '#6b2756', dot: '#b25596' }, // plum
  { border: '#c8e1dd', bg: '#e3f1ee', text: '#164f46', dot: '#3f9e8e' }, // teal
  { border: '#efc9c9', bg: '#fbe5e5', text: '#7a2525', dot: '#c64e4e' }, // red
  { border: '#d5cfea', bg: '#ece8f7', text: '#3a3378', dot: '#7266c4' }, // indigo
  { border: '#e6dfc2', bg: '#f5eed6', text: '#5a4c14', dot: '#b09a3a' }, // olive
  { border: '#c2dfe8', bg: '#e0eff5', text: '#1b4a5c', dot: '#4892ad' }, // cyan
  { border: '#f1cfd9', bg: '#fbe6ed', text: '#7a1f46', dot: '#cc4e7a' }, // rose
  { border: '#d4e3c4', bg: '#e8f2db', text: '#3a5a1a', dot: '#7fa945' }, // lime
  { border: '#e0cfe8', bg: '#efe4f5', text: '#4e2668', dot: '#8e5ab0' }, // violet
  { border: '#f2d4b8', bg: '#fce5d1', text: '#7a3514', dot: '#d0713a' }, // orange
  { border: '#c8d5d5', bg: '#e2ebeb', text: '#2a4444', dot: '#5c7a7a' }, // slate
  { border: '#d8c9b2', bg: '#efe2cc', text: '#5a3e1a', dot: '#a07a45' }, // sand
  { border: '#c5d9e8', bg: '#dceaf4', text: '#1f3e5c', dot: '#4d7aa3' }, // steel
];

// Special semantic overrides — certain well-known values deserve signature colors.
const SEMANTIC_OVERRIDES: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  bitcoin: { border: '#f5d9b8', bg: '#fdeed6', text: '#7a4410', dot: '#f7931a' },
  btc: { border: '#f5d9b8', bg: '#fdeed6', text: '#7a4410', dot: '#f7931a' },
  ethereum: { border: '#c9cfe8', bg: '#e1e5f5', text: '#2a2f6b', dot: '#627eea' },
  eth: { border: '#c9cfe8', bg: '#e1e5f5', text: '#2a2f6b', dot: '#627eea' },
  tesla: { border: '#ecc8c8', bg: '#fae0e0', text: '#7a1a1a', dot: '#cc0000' },
  tsla: { border: '#ecc8c8', bg: '#fae0e0', text: '#7a1a1a', dot: '#cc0000' },
  solana: { border: '#d9c8e8', bg: '#ebdcf5', text: '#4a2470', dot: '#9945ff' },
  sol: { border: '#d9c8e8', bg: '#ebdcf5', text: '#4a2470', dot: '#9945ff' },
  gold: { border: '#ead9a8', bg: '#faeec9', text: '#6b4f10', dot: '#d4af37' },
};

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

// Color is tied to the tag VALUE (so "Bitcoin" always looks the same).
export function paletteFor(value: string) {
  const key = value.trim().toLowerCase();
  if (SEMANTIC_OVERRIDES[key]) return SEMANTIC_OVERRIDES[key];
  return PALETTE[hashStr(key) % PALETTE.length];
}

export default function TagPill({ tag, onClick, size = 'sm' }: Props) {
  const p = paletteFor(tag.value);
  const Comp: any = onClick ? 'button' : 'span';
  return (
    <Comp
      className={`tag-pill tag-pill-${size}${onClick ? ' clickable' : ''}`}
      onClick={onClick}
      style={{
        borderColor: p.border,
        background: p.bg,
        color: p.text,
      }}
      title={`${tag.label}: ${tag.value}`}
    >
      <span className="tag-pill-dot" style={{ background: p.dot }} />
      <span className="tag-pill-label">{tag.label}:</span>
      <span className="tag-pill-value">{tag.value}</span>
    </Comp>
  );
}

