export interface CourtInfo {
  type: "Superior" | "Circuit";
  divisions?: number;
}

export interface CountyData {
  name: string;
  number: number;
  courts: CourtInfo[];
}

export const INDIANA_COUNTIES: CountyData[] = [
  { name: "Boone", number: 6, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Delaware", number: 18, courts: [{ type: "Superior", divisions: 6 }, { type: "Circuit" }] },
  { name: "Fayette", number: 21, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Hamilton", number: 29, courts: [{ type: "Superior", divisions: 6 }, { type: "Circuit" }] },
  { name: "Hancock", number: 30, courts: [{ type: "Superior", divisions: 5 }, { type: "Circuit" }] },
  { name: "Henry", number: 33, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Johnson", number: 41, courts: [{ type: "Superior", divisions: 4 }, { type: "Circuit" }] },
  { name: "Marion", number: 49, courts: [{ type: "Superior", divisions: 16 }, { type: "Circuit" }] },
  { name: "Randolph", number: 68, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Rush", number: 70, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Shelby", number: 73, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Union", number: 81, courts: [{ type: "Circuit" }] },
  { name: "Wayne", number: 89, courts: [{ type: "Superior", divisions: 3 }, { type: "Circuit" }] },
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

/**
 * Generate the cause number prefix for a given court name.
 * Format: {countyNumber}{courtTypeLetter}{divisionNumber}-
 * Superior = D, Circuit = C. Division is zero-padded to 2 digits.
 * Examples: "Wayne Superior Court 3" → "89D03-", "Randolph Circuit Court" → "68C01-"
 */
export function getCauseNumberPrefix(courtName: string): string {
  // Parse: "{County} {Superior|Circuit} Court {division?}"
  const match = courtName.match(/^(\w+)\s+(Superior|Circuit)\s+Court\s*(\d+)?$/);
  if (!match) return "";

  const [, countyName, courtType, divisionStr] = match;
  const county = INDIANA_COUNTIES.find((c) => c.name === countyName);
  if (!county) return "";

  const countyNum = String(county.number).padStart(2, "0");
  const typeLetter = courtType === "Superior" ? "D" : "C";
  const division = divisionStr ? String(parseInt(divisionStr)).padStart(2, "0") : "01";

  return `${countyNum}${typeLetter}${division}-`;
}
