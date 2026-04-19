
import React from 'react';

type IconProps = {
  name: 'heart' | 'search' | 'share' | 'folder' | 'tag' | 'reply' | 'sparkle' | 'send' | 'close' | 'edit' | 'trash' | 'check' | 'copy' | 'link';
  size?: number;
  filled?: boolean;
  className?: string;
};

const paths: Record<string, (filled?: boolean) => React.ReactNode> = {
  heart: (f) => (
    <path
      d="M12 21s-7-4.35-9.5-8.5C.5 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 6 4 4 7.5C19 16.65 12 21 12 21z"
      fill={f ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  search: () => (
    <>
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  share: () => (
    <>
      <circle cx="6" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="6" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11l8-4M8 13l8 4" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  folder: () => (
    <path
      d="M3 6.5A1.5 1.5 0 014.5 5h4l2 2h9A1.5 1.5 0 0121 8.5v9A1.5 1.5 0 0119.5 19h-15A1.5 1.5 0 013 17.5v-11z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  tag: () => (
    <>
      <path
        d="M3 12V4h8l10 10-8 8L3 12z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
    </>
  ),
  reply: () => (
    <path
      d="M10 8V4L3 11l7 7v-4c4 0 7 1 10 5-1-7-5-11-10-11z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  sparkle: () => (
    <path
      d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16z"
      fill="currentColor"
    />
  ),
  send: () => (
    <path
      d="M3 11l18-8-8 18-2-8-8-2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  close: () => (
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  ),
  edit: () => (
    <path
      d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  trash: () => (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  check: () => (
    <path d="M5 12l4 4 10-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  copy: () => (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  link: () => (
    <>
      <path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 10-5.66-5.66L11.5 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 105.66 5.66L12.5 17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
};

export function Icon({ name, size = 18, filled, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {paths[name](filled)}
    </svg>
  );
}

export default Icon;
