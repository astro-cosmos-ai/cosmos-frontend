type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Auth shell layout — no navigation bar, vertically and horizontally centred.
 * Intentionally minimal: the ambient sky background from globals.css shows
 * through and the card style is applied here.
 */
export default async function AuthLayout({ children }: Props) {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="sky-bg" aria-hidden="true" />
      <div
        className="card w-full fade-in"
        style={{ maxWidth: '420px' }}
      >
        {children}
      </div>
    </main>
  );
}
