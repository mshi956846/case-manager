export interface CourtInfo {
  type: "Superior" | "Circuit";
  divisions?: number;
}

export interface CountyData {
  name: string;
  courts: CourtInfo[];
}

export const INDIANA_COUNTIES: CountyData[] = [
  { name: "Wayne", courts: [{ type: "Superior", divisions: 3 }, { type: "Circuit" }] },
  { name: "Randolph", courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Union", courts: [{ type: "Circuit" }] },
  { name: "Henry", courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Fayette", courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Hancock", courts: [{ type: "Superior", divisions: 5 }, { type: "Circuit" }] },
  { name: "Delaware", courts: [{ type: "Superior", divisions: 6 }, { type: "Circuit" }] },
  { name: "Hamilton", courts: [{ type: "Superior", divisions: 6 }, { type: "Circuit" }] },
  { name: "Marion", courts: [{ type: "Superior", divisions: 16 }, { type: "Circuit" }] },
  { name: "Johnson", courts: [{ type: "Superior", divisions: 4 }, { type: "Circuit" }] },
  { name: "Boone", courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Rush", courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Shelby", courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
];

export function getCourtsForCounty(countyName: string): string[] {
  const county = INDIANA_COUNTIES.find((c) => c.name === countyName);
  if (!county) return [];

  const courts: string[] = [];
  for (const court of county.courts) {
    if (court.divisions && court.divisions > 1) {
      for (let i = 1; i <= court.divisions; i++) {
        courts.push(`${county.name} ${court.type} Court ${i}`);
      }
    } else {
      courts.push(`${county.name} ${court.type} Court`);
    }
  }
  return courts;
}
