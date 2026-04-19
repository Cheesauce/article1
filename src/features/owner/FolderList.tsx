
import React from 'react';
import Icon from '../../components/Icon';
import './FolderList.css';

type Props = {
  folders: [string, number][];
  active: string | null;
  onSelect: (folder: string) => void;
};

export default function FolderList({ folders, active, onSelect }: Props) {
  if (folders.length === 0) return null;
  return (
    <div className="folder-list">
      {folders.map(([name, count]) => (
        <button
          key={name}
          className={`folder-chip ${active === name ? 'active' : ''}`}
          onClick={() => onSelect(name)}
        >
          <Icon name="folder" size={13} />
          <span>{name}</span>
          <span className="folder-count">{count}</span>
        </button>
      ))}
    </div>
  );
}
