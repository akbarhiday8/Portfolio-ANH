'use client';

import { useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

type CmsBulletListEditorProps = {
  id: string;
  items: string[];
  label: string;
  onBlur: () => void;
  onChange: (items: string[]) => void;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
};

export function CmsBulletListEditor({
  id,
  items,
  label,
  onBlur,
  onChange,
  ariaDescribedBy,
  ariaInvalid = false,
}: CmsBulletListEditorProps) {
  const inputRefs = useRef<Array<HTMLTextAreaElement | null>>([]);
  const rows = items.length ? items : [''];

  function focusItem(index: number, position: 'start' | 'end' = 'start') {
    window.requestAnimationFrame(() => {
      const input = inputRefs.current[index];
      if (!input) return;
      input.focus();
      const cursor = position === 'end' ? input.value.length : 0;
      input.setSelectionRange(cursor, cursor);
    });
  }

  function updateItem(index: number, value: string) {
    onChange(rows.map((item, itemIndex) => itemIndex === index ? value : item));
  }

  function removeItem(index: number) {
    if (rows.length === 1) {
      onChange(['']);
      focusItem(0);
      return;
    }
    onChange(rows.filter((_, itemIndex) => itemIndex !== index));
    focusItem(Math.max(0, index - 1), 'end');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>, index: number) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const input = event.currentTarget;
      if (!input.value.trim() && rows.length > 1) {
        removeItem(index);
        return;
      }
      const cursor = input.selectionStart;
      const before = input.value.slice(0, cursor);
      const after = input.value.slice(input.selectionEnd);
      onChange([...rows.slice(0, index), before, after, ...rows.slice(index + 1)]);
      focusItem(index + 1);
      return;
    }

    if (event.key === 'Backspace' && index > 0 && event.currentTarget.selectionStart === 0 && event.currentTarget.selectionEnd === 0) {
      event.preventDefault();
      const previousLength = rows[index - 1].length;
      onChange([
        ...rows.slice(0, index - 1),
        `${rows[index - 1]}${rows[index]}`,
        ...rows.slice(index + 1),
      ]);
      window.requestAnimationFrame(() => {
        const input = inputRefs.current[index - 1];
        input?.focus();
        input?.setSelectionRange(previousLength, previousLength);
      });
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>, index: number) {
    const pasted = event.clipboardData.getData('text');
    if (!/\r?\n/.test(pasted)) return;
    event.preventDefault();
    const input = event.currentTarget;
    const pastedRows = pasted.split(/\r?\n/).filter((item, itemIndex, source) => item || itemIndex < source.length - 1);
    const before = input.value.slice(0, input.selectionStart);
    const after = input.value.slice(input.selectionEnd);
    const replacements = pastedRows.map((item, itemIndex) => {
      if (itemIndex === 0) return `${before}${item}`;
      if (itemIndex === pastedRows.length - 1) return `${item}${after}`;
      return item;
    });
    onChange([...rows.slice(0, index), ...replacements, ...rows.slice(index + 1)]);
    focusItem(index + replacements.length - 1, 'end');
  }

  return (
    <div className={`cms-bullet-editor${ariaInvalid ? ' has-error' : ''}`}>
      <div className="cms-bullet-editor-list">
        {rows.map((item, index) => (
          <div className="cms-bullet-editor-row" key={`${id}-${index}`}>
            <span aria-hidden="true">{'\u2022'}</span>
            <Textarea
              ref={(element) => { inputRefs.current[index] = element; }}
              id={index === 0 ? id : `${id}-${index}`}
              aria-label={`${label} butir ${index + 1}`}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedBy}
              value={item}
              rows={1}
              onChange={(event) => updateItem(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onPaste={(event) => handlePaste(event, index)}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              aria-label={`Hapus ${label.toLowerCase()} butir ${index + 1}`}
              title="Hapus butir"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        className="cms-bullet-editor-add"
        type="button"
        onClick={() => {
          onChange([...rows, '']);
          focusItem(rows.length);
        }}
      >
        <Plus size={14} />Tambah butir
      </button>
    </div>
  );
}
