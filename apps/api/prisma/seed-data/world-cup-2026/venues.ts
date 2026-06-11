export type VenueDef = {
  externalId: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  source: string;
};

export const VENUES: VenueDef[] = [
  { externalId: 'att-stadium',            name: 'AT&T Stadium',           city: 'Arlington',       country: 'USA',    capacity: 94000, source: 'fifa-wc2026' },
  { externalId: 'estadio-azteca',          name: 'Estadio Azteca',          city: 'Mexico City',     country: 'Mexico', capacity: 83000, source: 'fifa-wc2026' },
  { externalId: 'metlife-stadium',         name: 'MetLife Stadium',         city: 'East Rutherford', country: 'USA',    capacity: 82500, source: 'fifa-wc2026' },
  { externalId: 'mercedes-benz-stadium',   name: 'Mercedes-Benz Stadium',   city: 'Atlanta',         country: 'USA',    capacity: 75000, source: 'fifa-wc2026' },
  { externalId: 'arrowhead-stadium',       name: 'Arrowhead Stadium',       city: 'Kansas City',     country: 'USA',    capacity: 73000, source: 'fifa-wc2026' },
  { externalId: 'nrg-stadium',             name: 'NRG Stadium',             city: 'Houston',         country: 'USA',    capacity: 72000, source: 'fifa-wc2026' },
  { externalId: 'levis-stadium',           name: "Levi's Stadium",          city: 'Santa Clara',     country: 'USA',    capacity: 71000, source: 'fifa-wc2026' },
  { externalId: 'sofi-stadium',            name: 'SoFi Stadium',            city: 'Inglewood',       country: 'USA',    capacity: 70000, source: 'fifa-wc2026' },
  { externalId: 'lincoln-financial-field', name: 'Lincoln Financial Field', city: 'Philadelphia',    country: 'USA',    capacity: 69000, source: 'fifa-wc2026' },
  { externalId: 'lumen-field',             name: 'Lumen Field',             city: 'Seattle',         country: 'USA',    capacity: 69000, source: 'fifa-wc2026' },
  { externalId: 'gillette-stadium',        name: 'Gillette Stadium',        city: 'Foxborough',      country: 'USA',    capacity: 65000, source: 'fifa-wc2026' },
  { externalId: 'hard-rock-stadium',       name: 'Hard Rock Stadium',       city: 'Miami Gardens',   country: 'USA',    capacity: 65000, source: 'fifa-wc2026' },
  { externalId: 'bc-place',               name: 'BC Place',                city: 'Vancouver',       country: 'Canada', capacity: 54000, source: 'fifa-wc2026' },
  { externalId: 'estadio-bbva',            name: 'Estadio BBVA',            city: 'Guadalupe',       country: 'Mexico', capacity: 53500, source: 'fifa-wc2026' },
  { externalId: 'estadio-akron',           name: 'Estadio Akron',           city: 'Zapopan',         country: 'Mexico', capacity: 48000, source: 'fifa-wc2026' },
  { externalId: 'bmo-field',              name: 'BMO Field',               city: 'Toronto',         country: 'Canada', capacity: 45000, source: 'fifa-wc2026' },
];
