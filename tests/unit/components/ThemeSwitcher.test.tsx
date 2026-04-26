import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const messages = {
  nav: {
    theme: 'Theme',
    theme_dusk: 'Dusk',
    theme_dawn: 'Dawn',
    theme_mist: 'Mist',
  },
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeSwitcher', () => {
  it('renders three theme buttons', () => {
    render(
      <Wrapper>
        <ThemeSwitcher />
      </Wrapper>,
    );
    expect(screen.getByRole('tab', { name: /dusk/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /dawn/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /mist/i })).toBeInTheDocument();
  });

  it('marks dusk as selected by default (no saved preference)', () => {
    render(
      <Wrapper>
        <ThemeSwitcher />
      </Wrapper>,
    );
    expect(screen.getByRole('tab', { name: /dusk/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /dawn/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: /mist/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('sets data-theme to "dawn" when dawn button is clicked', async () => {
    render(
      <Wrapper>
        <ThemeSwitcher />
      </Wrapper>,
    );
    await userEvent.click(screen.getByRole('tab', { name: /dawn/i }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dawn');
  });

  it('sets data-theme to "mist" when mist button is clicked', async () => {
    render(
      <Wrapper>
        <ThemeSwitcher />
      </Wrapper>,
    );
    await userEvent.click(screen.getByRole('tab', { name: /mist/i }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('mist');
  });

  it('sets data-theme to empty string when dusk is selected', async () => {
    render(
      <Wrapper>
        <ThemeSwitcher />
      </Wrapper>,
    );
    // Switch to dawn first, then back to dusk
    await userEvent.click(screen.getByRole('tab', { name: /dawn/i }));
    await userEvent.click(screen.getByRole('tab', { name: /dusk/i }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('');
  });

  it('persists the chosen theme to localStorage', async () => {
    render(
      <Wrapper>
        <ThemeSwitcher />
      </Wrapper>,
    );
    await userEvent.click(screen.getByRole('tab', { name: /dawn/i }));
    expect(localStorage.getItem('cosmos-theme')).toBe('dawn');
  });

  it('marks the clicked tab as selected', async () => {
    render(
      <Wrapper>
        <ThemeSwitcher />
      </Wrapper>,
    );
    await userEvent.click(screen.getByRole('tab', { name: /mist/i }));
    expect(screen.getByRole('tab', { name: /mist/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /dusk/i })).toHaveAttribute('aria-selected', 'false');
  });
});
