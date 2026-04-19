
import React from 'react';
import Icon from './Icon';
import './SearchBar.css';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <div className="search-bar">
      <Icon name="search" size={16} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search title, keyword, #tag, or 2024-05…'}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')} aria-label="Clear">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}
