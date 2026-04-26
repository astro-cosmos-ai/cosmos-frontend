'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  county?: string;
  state?: string;
  country?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

type Status = 'idle' | 'loading' | 'no-results' | 'error';

type Props = {
  value: string;
  onChange: (place: { name: string; lat: number; lon: number }) => void;
};

function shortName(r: NominatimResult): string {
  const a = r.address ?? {};
  const city = a.city ?? a.town ?? a.village ?? a.hamlet ?? a.county ?? '';
  const parts = [city, a.state, a.country].filter(Boolean);
  return parts.length > 0
    ? parts.join(', ')
    : r.display_name.split(',').slice(0, 3).join(',').trim();
}

export function PlaceAutocomplete({ value, onChange }: Props) {
  const t = useTranslations('form');
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [highlight, setHighlight] = useState(0);
  const [picked, setPicked] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = 'place-listbox';

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (picked) return;
    if (query.trim().length < 3) {
      setResults([]);
      setStatus('idle');
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setStatus('loading');
    debounceRef.current = setTimeout(() => searchNominatim(query.trim()), 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, picked]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  async function searchNominatim(q: string) {
    const myId = ++requestIdRef.current;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (myId !== requestIdRef.current) return;
      if (!res.ok) { setStatus('error'); setResults([]); setOpen(true); return; }
      const data = (await res.json()) as NominatimResult[];
      if (myId !== requestIdRef.current) return;
      setResults(data);
      setHighlight(0);
      setStatus(data.length === 0 ? 'no-results' : 'idle');
      setOpen(true);
    } catch {
      if (myId !== requestIdRef.current) return;
      setStatus('error');
      setResults([]);
      setOpen(true);
    }
  }

  function handleSelect(place: NominatimResult) {
    const name = shortName(place);
    setQuery(name);
    setPicked(true);
    setOpen(false);
    setResults([]);
    onChange({
      name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
    });
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(results[highlight]);
    }
  }

  const showDropdown = open && (results.length > 0 || status === 'no-results' || status === 'error');

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-activedescendant={
          showDropdown && results.length > 0 ? `place-option-${highlight}` : undefined
        }
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPicked(false); }}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        onKeyDown={onKey}
        placeholder={t('pobPlaceholder')}
        className="input"
        autoComplete="off"
        spellCheck={false}
      />

      {/* Spinner */}
      {status === 'loading' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            width: 14, height: 14, borderRadius: '50%',
            border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent)',
            animation: 'spin 0.9s linear infinite',
          }}
        />
      )}

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('pobPlaceholder')}
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            zIndex: 60, listStyle: 'none', margin: 0, padding: 6,
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-strong)',
            borderRadius: 14,
            maxHeight: 280, overflowY: 'auto',
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          }}
        >
          {results.map((r, i) => {
            const isHi = i === highlight;
            const name = shortName(r);
            const [primary, ...rest] = name.split(',');
            return (
              <li
                key={r.place_id}
                id={`place-option-${i}`}
                role="option"
                aria-selected={isHi}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'var(--ink)',
                  background: isHi ? 'var(--bg-elev)' : 'transparent',
                  transition: 'background .15s',
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{primary}</div>
                {rest.length > 0 && (
                  <div className="dim" style={{ fontSize: 12, lineHeight: 1.3 }}>
                    {rest.join(',').trim()}
                  </div>
                )}
              </li>
            );
          })}

          {results.length === 0 && status === 'no-results' && (
            <li
              role="option"
              aria-selected={false}
              className="dim"
              style={{ padding: '12px 14px', fontSize: 13 }}
            >
              {t('noResults', { query })}
            </li>
          )}

          {results.length === 0 && status === 'error' && (
            <li
              role="option"
              aria-selected={false}
              style={{ padding: '12px 14px', fontSize: 13, color: 'var(--negative)' }}
            >
              {t('searchError')}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
