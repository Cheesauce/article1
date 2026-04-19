

import React, { useRef, useState } from 'react';
import './TagEditor.css';
import { Tag } from '../posts/types';
import TagPill from '../../components/TagPill';
import Icon from '../../components/Icon';

type Props = {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
};

const PRESET_LABELS = [
  'Champion',
  'Proxy',
  'Price',
  'Conviction',
  'Theme',
  'Horizon',
  'Risk',
  'Sector',
];

export default function TagEditor({ tags, onChange }: Props) {
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const valueRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);

  const commit = (l: string, v: string) => {
    const lt = l.trim();
    const vt = v.trim();
    if (!lt || !vt) return false;
    onChange([...tags, { label: lt, value: vt }]);
    setLabel('');
    setValue('');
    // Keep focus on the label input for fast successive tagging
    setTimeout(() => labelRef.current?.focus(), 0);
    return true;
  };

  const addTag = () => commit(label, value);

  const remove = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  const onLabelKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (label.trim() && !value.trim()) {
        e.preventDefault();
        valueRef.current?.focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    }
  };

  const onValueKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !value && label) {
      // Easy: clear value empty, backspace removes last typed label char naturally
    } else if (e.key === 'Backspace' && !value && !label && tags.length > 0) {
      e.preventDefault();
      remove(tags.length - 1);
    }
  };

  // Smart paste: "Champion: Elon Musk" splits into label/value automatically
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>, target: 'label' | 'value') => {
    const text = e.clipboardData.getData('text');
    if (text.includes(':')) {
      const [l, ...rest] = text.split(':');
      const v = rest.join(':').trim();
      if (l.trim() && v) {
        e.preventDefault();
        setLabel(l.trim());
        setValue(v);
        setTimeout(() => valueRef.current?.focus(), 0);
      }
    }
  };

  const usePreset = (preset: string) => {
    setLabel(preset);
    setTimeout(() => valueRef.current?.focus(), 0);
  };

  const previewTag: Tag | null =
    label.trim() && value.trim() ? { label: label.trim(), value: value.trim() } : null;

  const canAdd = !!label.trim() && !!value.trim();

  return (
    <div className="tag-editor">
      {tags.length > 0 && (
        <div className="tag-editor-list">
          {tags.map((t, i) => (
            <span key={i} className="tag-editor-item">
              <TagPill tag={t} />
              <button
                className="tag-remove"
                onClick={() => remove(i)}
                aria-label={`Remove ${t.label}: ${t.value}`}
                type="button"
                title="Remove tag"
              >
                <Icon name="close" size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className={`tag-editor-inputs ${canAdd ? 'ready' : ''}`}>
        <input
          ref={labelRef}
          className="tag-label-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={onLabelKey}
          onPaste={(e) => onPaste(e, 'label')}
          placeholder="Label"
          list="tag-label-suggestions"
          aria-label="Tag label"
        />
        <datalist id="tag-label-suggestions">
          {PRESET_LABELS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <span className="tag-arrow" aria-hidden="true">:</span>
        <input
          ref={valueRef}
          className="tag-value-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onValueKey}
          onPaste={(e) => onPaste(e, 'value')}
          placeholder={label.trim() ? `${label.trim()}…` : 'Value'}
          aria-label="Tag value"
        />
        <button
          type="button"
          className="tag-add-btn"
          onClick={addTag}
          disabled={!canAdd}
          title="Add tag (Enter)"
        >
          <Icon name="check" size={12} />
          Add
        </button>
      </div>

      {/* Live preview */}
      {previewTag && (
        <div className="tag-preview">
          <span className="tag-preview-label">Preview:</span>
          <TagPill tag={previewTag} />
        </div>
      )}

      {/* Preset quick-picks */}
      <div className="tag-presets">
        <span className="tag-presets-label">Quick labels:</span>
        {PRESET_LABELS.map((p) => (
          <button
            key={p}
            type="button"
            className={`tag-preset-chip ${label.trim() === p ? 'active' : ''}`}
            onClick={() => usePreset(p)}
            title={`Use "${p}" as label`}
          >
            {p}
          </button>
        ))}
      </div>

      {tags.length === 0 && !previewTag && (
        <div className="tag-hint">
          Pick a <strong>Label</strong> (like <em>Champion</em>) then type a <strong>Value</strong>{' '}
          (like <em>Elon Musk</em>). They'll appear as <strong>Champion: Elon Musk</strong>. Tip: paste{' '}
          <code>Champion: Elon Musk</code> to split automatically.
        </div>
      )}
    </div>
  );
}
