export interface PlaceResult {
  name: string;
  lat: number;
  lon: number;
}

export interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  county?: string;
  state?: string;
  country?: string;
}

export interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

export async function searchPlaces(query: string): Promise<NominatimPlace[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'cosmos-frontend/1.0' },
  });
  if (!res.ok) throw new Error(`Places search failed: ${res.status}`);
  return res.json() as Promise<NominatimPlace[]>;
}
