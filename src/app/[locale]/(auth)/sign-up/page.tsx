'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/browser';

export default function SignUpPage() {
  const t = useTranslations('auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p className="eyebrow" style={{ marginBottom: '16px' }}>
          {t('eyebrow')}
        </p>
        <h2 className="serif" style={{ marginBottom: '16px' }}>
          {t('checkEmailTitle')}
        </h2>
        <p className="muted" style={{ fontSize: '14px', lineHeight: '1.7' }}>
          {t('checkEmailBody', { email })}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="section-head" style={{ marginBottom: '32px' }}>
        <p className="eyebrow" style={{ marginBottom: '12px' }}>
          {t('eyebrow')}
        </p>
        <h2 className="serif">{t('signUpTitle')}</h2>
      </div>

      {/* Error region */}
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

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" className="field-label">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label htmlFor="confirm" className="field-label">
            {t('confirmPassword')}
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t('confirmPasswordPlaceholder')}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={loading}
        >
          {loading ? t('signingUp') : t('signUpButton')}
        </button>
      </form>

      <p
        className="muted"
        style={{ textAlign: 'center', fontSize: '13px', marginTop: '24px' }}
      >
        {t('haveAccount')}{' '}
        <a
          href="../sign-in"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
        >
          {t('signInLink')}
        </a>
      </p>
    </>
  );
}
