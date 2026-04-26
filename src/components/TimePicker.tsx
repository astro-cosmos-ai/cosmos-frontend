'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

const pad2 = (n: number) => String(n).padStart(2, '0');

function formatTime(s: string): string {
  if (!s) return '';
  const [hh, mm] = s.split(':').map(Number);
  const h12 = ((hh + 11) % 12) + 1;
  const period = hh >= 12 ? 'PM' : 'AM';
  return `${h12}:${pad2(mm)} ${period}`;
}

function tryParseTime(s: string): string | null {
  const trimmed = s.trim().toLowerCase();
  if (!trimmed) return null;
  let m = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
  if (!m) m = trimmed.match(/^(\d{1,2})(\d{2})\s*(am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3];
  if (h > 23 || min > 59) return null;
  if (ampm === 'pm' && h < 12) h += 12;
  else if (ampm === 'am' && h === 12) h = 0;
  return `${pad2(h)}:${pad2(min)}`;
}

type Props = {
  /** HH:MM (24-hour) */
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
};

type StepperProps = {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  wrap?: boolean;
  padValue?: boolean;
};

function Stepper({ label, value, onChange, min, max, wrap, padValue }: StepperProps) {
  function dec() {
    const next = value - 1;
    onChange(next < min ? (wrap ? max : min) : next);
  }
  function inc() {
    const next = value + 1;
    onChange(next > max ? (wrap ? min : max) : next);
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="field-label" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-elev)', borderRadius: 10, padding: 4,
      }}>
        <button type="button" className="step-btn" onClick={dec} aria-label={`Decrease ${label}`}>−</button>
        <span className="serif" style={{ fontSize: 20, fontWeight: 300, minWidth: 32, textAlign: 'center' }}>
          {padValue ? pad2(value) : value}
        </span>
        <button type="button" className="step-btn" onClick={inc} aria-label={`Increase ${label}`}>+</button>
      </div>
    </div>
  );
}

export function TimePicker({ value, onChange, placeholder }: Props) {
  const t = useTranslations('timepicker');
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [typeError, setTypeError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [hh, mm] = (value || '00:00').split(':').map(Number);
  const period: 'AM' | 'PM' = hh >= 12 ? 'PM' : 'AM';
  const h12 = ((hh + 11) % 12) + 1;

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false);
  }

  function setH12(newH12: number) {
    const newH24 = period === 'AM' ? newH12 % 12 : (newH12 % 12) + 12;
    onChange(`${pad2(newH24)}:${pad2(mm)}`);
  }

  function setMin(newMin: number) {
    onChange(`${pad2(hh)}:${pad2(((newMin % 60) + 60) % 60)}`);
  }

  function setPeriod(p: 'AM' | 'PM') {
    let newH = hh;
    if (p === 'AM' && hh >= 12) newH = hh - 12;
    else if (p === 'PM' && hh < 12) newH = hh + 12;
    onChange(`${pad2(newH)}:${pad2(mm)}`);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }} onKeyDown={onKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="input"
        style={{
          textAlign: 'left', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: value ? 'var(--ink)' : 'var(--ink-mute)',
        }}
      >
        <span>{value ? formatTime(value) : (placeholder ?? t('placeholder'))}</span>
        <span style={{ color: 'var(--ink-mute)', fontSize: 14 }} aria-hidden="true">◴</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('dialogLabel')}
          className="fade-in"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 280, zIndex: 100,
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-strong)',
            borderRadius: 18, padding: 24,
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Free-text input */}
          <input
            className="input"
            placeholder={t('typePlaceholder')}
            value={typed}
            onChange={(e) => { setTyped(e.target.value); setTypeError(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const parsed = tryParseTime(typed);
                if (parsed) {
                  onChange(parsed);
                  setTyped('');
                  setOpen(false);
                } else {
                  setTypeError(true);
                }
              }
            }}
            style={{
              marginBottom: 16, fontSize: 13, padding: '10px 12px',
              borderColor: typeError ? 'var(--negative)' : undefined,
            }}
          />

          {/* Large time display */}
          <div style={{
            textAlign: 'center', marginBottom: 20,
            fontFamily: 'var(--font-serif)', fontWeight: 300, color: 'var(--ink)',
          }}>
            <span style={{ fontSize: 44 }}>{pad2(h12)}</span>
            <span style={{ fontSize: 36, color: 'var(--ink-mute)', margin: '0 4px' }}>:</span>
            <span style={{ fontSize: 44 }}>{pad2(mm)}</span>
            <span style={{ fontSize: 16, marginLeft: 10, color: 'var(--accent)', letterSpacing: '0.1em' }}>{period}</span>
          </div>

          {/* Hour / minute steppers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <Stepper label={t('hour')} value={h12} onChange={setH12} min={1} max={12} wrap />
            <Stepper label={t('minute')} value={mm} onChange={setMin} min={0} max={59} wrap padValue />
          </div>

          {/* AM / PM toggle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {(['AM', 'PM'] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={period === p}
                onClick={() => setPeriod(p)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  background: period === p ? 'var(--bg-elev)' : 'transparent',
                  color: period === p ? 'var(--ink)' : 'var(--ink-soft)',
                  border: 0, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.14em',
                  transition: 'all .3s',
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            paddingTop: 14, borderTop: '1px solid var(--border)',
          }}>
            <button
              type="button"
              className="dp-link"
              onClick={() => {
                const now = new Date();
                onChange(`${pad2(now.getHours())}:${pad2(now.getMinutes())}`);
              }}
            >
              {t('now')}
            </button>
            <button type="button" className="dp-link" onClick={() => setOpen(false)}>
              {t('done')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
