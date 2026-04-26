'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/browser';

type Props = {
  params: Promise<{ locale: string }>;
};

export default function SignInPage({ params }: Props) {
  const t = useTranslations('auth');
  const router = useRouter();
  const { locale } = use(params);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/chart`);
    router.refresh();
  }

  async function handleOAuth() {
    const supabase = createClient();
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/${locale}/callback`,
      },
    });
  }

  return (
    <>
      {/* Logo mark */}
      <div className="section-head" style={{ marginBottom: '32px' }}>
        <p className="eyebrow" style={{ marginBottom: '12px' }}>
          {t('eyebrow')}
        </p>
        <h2 className="serif">{t('signInTitle')}</h2>
      </div>

      {/* Error region — always present in DOM for screen readers */}
      <div
        role="alert"
        aria-live="polite"
        style={{ minHeight: '24px', marginBottom: error ? '20px' : '0' }}
      >
        {error && (
          <p
            style={{
              color: 'var(--red)',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
            }}
          >
            <span aria-hidden="true">&#x26A0;</span>
            {error}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="email" className="field-label">
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label htmlFor="password" className="field-label">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={loading}
        >
          {loading ? t('signingIn') : t('signInButton')}
        </button>
      </form>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '24px 0',
        }}
      >
        <hr className="divider" style={{ flex: 1, margin: 0 }} />
        <span className="dim" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
          {t('orContinueWith')}
        </span>
        <hr className="divider" style={{ flex: 1, margin: 0 }} />
      </div>

      <button
        type="button"
        className="btn"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={handleOAuth}
      >
        {t('googleButton')}
      </button>

      <p
        className="muted"
        style={{ textAlign: 'center', fontSize: '13px', marginTop: '24px' }}
      >
        {t('noAccount')}{' '}
        <a
          href="../sign-up"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
        >
          {t('signUpLink')}
        </a>
      </p>
    </>
  );
}
