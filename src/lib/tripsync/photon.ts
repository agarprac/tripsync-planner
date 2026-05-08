export type CityResult = { label: string; city: string; country: string };

export async function searchCities(query: string): Promise<CityResult[]> {
  if (query.length < 2) return [];
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&layer=city`
    );
    const data = await res.json();
    const seen = new Set<string>();
    return (data.features ?? [])
      .filter((f: any) => f.properties.type === "city" && f.properties.country)
      .map((f: any) => ({
        label: `${f.properties.name}, ${f.properties.country}`,
        city: f.properties.name,
        country: f.properties.country,
      }))
      .filter((c: CityResult) => {
        if (seen.has(c.label)) return false;
        seen.add(c.label);
        return true;
      });
  } catch {
    return [];
  }
}
