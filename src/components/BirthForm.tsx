'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCreateChart } from '@/lib/query/chart';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { PlaceAutocomplete } from './PlaceAutocomplete';

type PlaceSelection = {
  name: string;
  lat: number;
  lon: number;
};

type Props = {
  onSuccess: (chartId: string) => void;
};

export function BirthForm({ onSuccess }: Props) {
  const t = useTranslations('form');
  const tc = useTranslations('common');

  const [name, setName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [tob, setTob] = useState('');
  const [place, setPlace] = useState<PlaceSelection | null>(null);

  const createChart = useCreateChart();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !dob || !tob || !place) return;

    const pad = (n: number) => String(n).padStart(2, '0');
    const dobStr = `${dob.getFullYear()}-${pad(dob.getMonth() + 1)}-${pad(dob.getDate())}`;
    const tobStr = tob.length === 5 ? `${tob}:00` : tob;

    // Rough UTC offset from longitude (±0.5 h precision)
    const timezone = Math.round((place.lon / 15) * 2) / 2;

    try {
      const chart = await createChart.mutateAsync({
        name: name.trim(),
        dob: dobStr,
        tob: tobStr,
        pob_name: place.name,
        pob_lat: place.lat,
        pob_lon: place.lon,
        timezone,
      });
      onSuccess(chart.id);
    } catch {
      // error rendered from createChart.error below
    }
  }

  const isReady = !!name.trim() && !!dob && !!tob && !!place;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: 24 }}>
        <label className="field-label" htmlFor="birth-name">
          {t('name')}
        </label>
        <input
          id="birth-name"
          type="text"
          className="input"
          placeholder={t('namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <label className="field-label" htmlFor="birth-dob">
            {t('dob')}
          </label>
          <DatePicker value={dob} onChange={setDob} id="birth-dob" />
        </div>
        <div>
          <label className="field-label" htmlFor="birth-tob">
            {t('tob')}
          </label>
          <TimePicker value={tob} onChange={setTob} id="birth-tob" />
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <label className="field-label" htmlFor="birth-pob">
          {t('pob')}
        </label>
        <PlaceAutocomplete
          value={place?.name ?? ''}
          onChange={(p) => setPlace(p)}
        />
        {place && (
          <div
            className="dim"
            style={{ marginTop: 6, fontSize: 12, paddingLeft: 4 }}
          >
            {t('lat')}: {place.lat.toFixed(4)} · {t('lon')}: {place.lon.toFixed(4)}
          </div>
        )}
      </div>

      {createChart.isError && (
        <p
          role="alert"
          style={{
            color: 'var(--negative)',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {tc('errorMessage')}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={!isReady || createChart.isPending}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {createChart.isPending ? t('loadingMessage') : t('submitButton')}
      </button>
    </form>
  );
}
