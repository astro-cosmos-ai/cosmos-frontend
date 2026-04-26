import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Nav } from '@/components/Nav';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;

  // If the user is already authenticated, send them to the chart overview.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(`/${locale}/chart`);
  }

  const t = await getTranslations({ locale, namespace: 'landing' });

  return (
    <>
      <div className="sky-bg" aria-hidden="true" />
      <Nav />

      <main className="page fade-slow">
        {/* Hero */}
        <section
          className="section-head"
          style={{ paddingTop: 'clamp(80px, 12vw, 140px)', marginBottom: 72 }}
        >
          {/* Glowing orb */}
          <div
            aria-hidden="true"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              margin: '0 auto 36px',
              background:
                'radial-gradient(circle at 35% 35%, var(--accent), transparent 70%)',
              opacity: 0.65,
              animation: 'breathe 5s ease-in-out infinite',
            }}
          />

          <p className="eyebrow">{t('eyebrow')}</p>

          <h1
            className="serif"
            style={{ marginBottom: 20, letterSpacing: '-0.01em' }}
          >
            {t('headline')}
          </h1>

          <p
            style={{
              fontSize: 'clamp(17px, 2vw, 20px)',
              color: 'var(--ink-soft)',
              marginBottom: 14,
              maxWidth: 480,
              marginInline: 'auto',
              lineHeight: 1.6,
            }}
          >
            {t('tagline')}
          </p>

          <p
            style={{
              fontSize: 15,
              color: 'var(--ink-mute)',
              maxWidth: 480,
              marginInline: 'auto',
              lineHeight: 1.8,
              marginBottom: 40,
            }}
          >
            {t('description')}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/sign-up"
              className="btn btn-primary"
              style={{ padding: '13px 28px', fontSize: 14 }}
            >
              {t('getStarted')}
            </Link>
          </div>

          <p style={{ marginTop: 20 }}>
            <Link
              href="/sign-in"
              style={{
                color: 'var(--ink-mute)',
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              {t('signIn')}
            </Link>
          </p>
        </section>

        {/* Feature cards */}
        <section
          aria-label={t('eyebrow')}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            maxWidth: 900,
            marginInline: 'auto',
          }}
        >
          {(
            [
              { title: t('feature1Title'), body: t('feature1Body') },
              { title: t('feature2Title'), body: t('feature2Body') },
              { title: t('feature3Title'), body: t('feature3Body') },
            ] as { title: string; body: string }[]
          ).map(({ title, body }) => (
            <div
              key={title}
              className="card"
              style={{ padding: '28px 30px' }}
            >
              <h3
                className="serif"
                style={{
                  fontSize: 19,
                  fontWeight: 400,
                  marginBottom: 10,
                  color: 'var(--ink)',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
