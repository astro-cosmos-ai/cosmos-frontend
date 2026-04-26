import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { PlanetCard } from '@/components/PlanetCard';
import type { Planet } from '@/lib/api/types';

const messages = {
  common: {
    retro: 'Retrograde',
    house: 'House',
    sign: 'Sign',
    nakshatra: 'Nakshatra',
    degree: 'Degree',
    lord: 'Lord',
  },
  planetNames: {
    Sun: 'Sun',
    Moon: 'Moon',
    Mars: 'Mars',
    Mercury: 'Mercury',
    Jupiter: 'Jupiter',
    Venus: 'Venus',
    Saturn: 'Saturn',
    Rahu: 'Rahu',
    Ketu: 'Ketu',
    Ascendant: 'Ascendant',
  },
  signs: {
    Aries: 'Aries',
    Taurus: 'Taurus',
    Gemini: 'Gemini',
    Cancer: 'Cancer',
    Leo: 'Leo',
    Virgo: 'Virgo',
    Libra: 'Libra',
    Scorpio: 'Scorpio',
    Sagittarius: 'Sagittarius',
    Capricorn: 'Capricorn',
    Aquarius: 'Aquarius',
    Pisces: 'Pisces',
  },
  nakshatras: {
    Ashwini: 'Ashwini',
    Bharani: 'Bharani',
    Krittika: 'Krittika',
    Rohini: 'Rohini',
    Mrigashira: 'Mrigashira',
    Ardra: 'Ardra',
    Punarvasu: 'Punarvasu',
    Pushya: 'Pushya',
    Ashlesha: 'Ashlesha',
    Magha: 'Magha',
    'Purva Phalguni': 'Purva Phalguni',
    'Uttara Phalguni': 'Uttara Phalguni',
    Hasta: 'Hasta',
    Chitra: 'Chitra',
    Swati: 'Swati',
    Vishakha: 'Vishakha',
    Anuradha: 'Anuradha',
    Jyeshtha: 'Jyeshtha',
    Mula: 'Mula',
    'Purva Ashadha': 'Purva Ashadha',
    'Uttara Ashadha': 'Uttara Ashadha',
    Shravana: 'Shravana',
    Dhanishta: 'Dhanishta',
    Shatabhisha: 'Shatabhisha',
    'Purva Bhadrapada': 'Purva Bhadrapada',
    'Uttara Bhadrapada': 'Uttara Bhadrapada',
    Revati: 'Revati',
  },
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

const sunPlanet: Planet = {
  name: 'Sun',
  current_sign: 3,
  sign: 'Gemini',
  full_degree: 60.45,
  nakshatra: 'Mrigashira',
  nakshatra_pad: 3,
  nakshatraLord: 'Mars',
  house_parashari: 12,
  isRetro: 'false',
};

const saturnRetro: Planet = {
  name: 'Saturn',
  current_sign: 10,
  sign: 'Capricorn',
  full_degree: 285.23,
  nakshatra: 'Uttara Ashadha',
  nakshatra_pad: 1,
  nakshatraLord: 'Sun',
  house_parashari: 7,
  isRetro: 'true',
};

describe('PlanetCard', () => {
  it('renders the translated planet name', () => {
    render(
      <Wrapper>
        <PlanetCard planet={sunPlanet} />
      </Wrapper>,
    );
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('renders the sign label and value', () => {
    render(
      <Wrapper>
        <PlanetCard planet={sunPlanet} />
      </Wrapper>,
    );
    expect(screen.getByText('Sign')).toBeInTheDocument();
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('renders the house number', () => {
    render(
      <Wrapper>
        <PlanetCard planet={sunPlanet} />
      </Wrapper>,
    );
    expect(screen.getByText('House')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders the nakshatra name', () => {
    render(
      <Wrapper>
        <PlanetCard planet={sunPlanet} />
      </Wrapper>,
    );
    expect(screen.getByText('Mrigashira')).toBeInTheDocument();
  });

  it('does not show retrograde badge when isRetro is false', () => {
    render(
      <Wrapper>
        <PlanetCard planet={sunPlanet} />
      </Wrapper>,
    );
    expect(screen.queryByLabelText('Retrograde')).not.toBeInTheDocument();
  });

  it('shows retrograde badge when isRetro is true', () => {
    render(
      <Wrapper>
        <PlanetCard planet={saturnRetro} />
      </Wrapper>,
    );
    expect(screen.getByLabelText('Retrograde')).toBeInTheDocument();
  });

  it('renders the nakshatra lord', () => {
    render(
      <Wrapper>
        <PlanetCard planet={sunPlanet} />
      </Wrapper>,
    );
    expect(screen.getByText('Mars')).toBeInTheDocument();
  });

  it('renders degree formatted to two decimal places', () => {
    render(
      <Wrapper>
        <PlanetCard planet={sunPlanet} />
      </Wrapper>,
    );
    // full_degree 60.45 % 30 = 0.45 → "0.45°"
    const deg = (sunPlanet.full_degree % 30).toFixed(2);
    expect(screen.getByText(`${deg}°`)).toBeInTheDocument();
  });
});
