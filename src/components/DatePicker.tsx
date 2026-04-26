'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
] as const;

const DOW_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const pad = (n: number) => String(n).padStart(2, '0');

function parseISODate(s: string): Date {
  if (!s) return new Date();
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function formatPretty(s: string, locale: string): string {
  if (!s) return '';
  const d = parseISODate(s);
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function tryParseFlexible(s: string): string | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  // ISO: 1997-06-01
  let m = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
  // DD/MM/YYYY or DD-MM-YYYY
  m = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (m) return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;
  // 1 jun 1997 / 01-jun-1997 / 1 june 1997
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  m = trimmed.toLowerCase().match(/^(\d{1,2})[\s/\-.]+([a-z]{3,})[\s/\-.]+(\d{4})$/);
  if (m) {
    const monIdx = months.findIndex((mn) => m![2].startsWith(mn));
    if (monIdx >= 0) return `${m[3]}-${pad(monIdx + 1)}-${pad(+m[1])}`;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return null;
}

type Mode = 'day' | 'month' | 'year';

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  id?: string;
};

export function DatePicker({ value, onChange, placeholder, id }: Props) {
  const t = useTranslations('datepicker');
  const locale = useLocale();
  const isoValue = value ? toISODate(value) : '';

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(value ?? new Date());
  const [mode, setMode] = useState<Mode>('day');
  const [typed, setTyped] = useState('');
  const [typeError, setTypeError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (value) setView(value);
  }, [value]);

  // Keyboard: Escape closes
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false);
  }

  const y = view.getFullYear();
  const m = view.getMonth();
  const firstDOW = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDOW; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function pick(day: number) {
    const picked = new Date(y, m, day);
    onChange(picked);
    setOpen(false);
  }

  const shift = (delta: number) => setView(new Date(y, m + delta, 1));
  const shiftYear = (delta: number) => setView(new Date(y + delta, m, 1));
  const decadeStart = Math.floor(y / 12) * 12;

  return (
    <div ref={ref} style={{ position: 'relative' }} onKeyDown={onKeyDown}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="input"
        style={{
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: isoValue ? 'var(--ink)' : 'var(--ink-mute)',
        }}
      >
        <span>{isoValue ? formatPretty(isoValue, locale) : (placeholder ?? t('placeholder'))}</span>
        <span style={{ color: 'var(--ink-mute)', fontSize: 14 }} aria-hidden="true">◐</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('calendarLabel')}
          className="fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: 320,
            zIndex: 100,
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-strong)',
            borderRadius: 18,
            padding: 20,
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Free-text input — fastest path for distant years */}
          <input
            className="input"
            aria-label={t('typeInputLabel')}
            placeholder={t('typePlaceholder')}
            value={typed}
            onChange={(e) => { setTyped(e.target.value); setTypeError(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const parsed = tryParseFlexible(typed);
                if (parsed) {
                  onChange(parseISODate(parsed));
                  setTyped('');
                  setOpen(false);
                } else {
                  setTypeError(true);
                }
              }
            }}
            style={{
              marginBottom: 14,
              fontSize: 13,
              padding: '10px 12px',
              borderColor: typeError ? 'var(--negative)' : undefined,
            }}
          />

          {/* Month / year nav header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <button
              type="button"
              className="dp-nav"
              aria-label={t('prevLabel')}
              onClick={() =>
                mode === 'day'
                  ? shift(-1)
                  : mode === 'month'
                  ? shiftYear(-1)
                  : setView(new Date(y - 12, m, 1))
              }
            >
              ‹
            </button>
            <button
              type="button"
              className="dp-title"
              onClick={() =>
                setMode(mode === 'day' ? 'month' : mode === 'month' ? 'year' : 'day')
              }
            >
              {mode === 'day' && `${t(MONTH_KEYS[m])} ${y}`}
              {mode === 'month' && y}
              {mode === 'year' && `${decadeStart} – ${decadeStart + 11}`}
            </button>
            <button
              type="button"
              className="dp-nav"
              aria-label={t('nextLabel')}
              onClick={() =>
                mode === 'day'
                  ? shift(1)
                  : mode === 'month'
                  ? shiftYear(1)
                  : setView(new Date(y + 12, m, 1))
              }
            >
              ›
            </button>
          </div>

          {/* Day grid */}
          {mode === 'day' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
                {DOW_KEYS.map((dk) => (
                  <div
                    key={dk}
                    aria-hidden="true"
                    style={{
                      textAlign: 'center',
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      color: 'var(--ink-mute)',
                      textTransform: 'uppercase',
                      padding: '6px 0',
                    }}
                  >
                    {t(dk)}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {cells.map((d, i) => {
                  if (d === null) return <div key={i} />;
                  const cur = new Date(y, m, d);
                  const isSel = toISODate(cur) === isoValue;
                  const isToday = toISODate(cur) === toISODate(today);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pick(d)}
                      className="dp-cell"
                      aria-label={cur.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                      aria-pressed={isSel}
                      data-selected={isSel ? 'true' : undefined}
                      data-today={isToday ? 'true' : undefined}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Month grid */}
          {mode === 'month' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {MONTH_KEYS.map((mk, i) => (
                <button
                  key={mk}
                  type="button"
                  className="dp-cell"
                  style={{ height: 52 }}
                  data-selected={i === m && y === (value?.getFullYear() ?? -1) ? 'true' : undefined}
                  onClick={() => { setView(new Date(y, i, 1)); setMode('day'); }}
                >
                  {t(mk).slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* Year grid */}
          {mode === 'year' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {Array.from({ length: 12 }, (_, i) => decadeStart + i).map((yr) => (
                <button
                  key={yr}
                  type="button"
                  className="dp-cell"
                  style={{ height: 52 }}
                  data-selected={yr === (value?.getFullYear() ?? -1) ? 'true' : undefined}
                  onClick={() => { setView(new Date(yr, m, 1)); setMode('month'); }}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              className="dp-link"
              onClick={() => { onChange(today); setOpen(false); }}
            >
              {t('today')}
            </button>
            <button type="button" className="dp-link" onClick={() => setOpen(false)}>
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
