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
  { name: "Adams", number: 1, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Allen", number: 2, courts: [{ type: "Superior", divisions: 9 }, { type: "Circuit" }] },
  { name: "Bartholomew", number: 3, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Benton", number: 4, courts: [{ type: "Circuit" }] },
  { name: "Blackford", number: 5, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Boone", number: 6, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Brown", number: 7, courts: [{ type: "Circuit" }] },
  { name: "Carroll", number: 8, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Cass", number: 9, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Clark", number: 10, courts: [{ type: "Circuit" }] },
  { name: "Clay", number: 11, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Clinton", number: 12, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Crawford", number: 13, courts: [{ type: "Circuit" }] },
  { name: "Daviess", number: 14, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Dearborn", number: 15, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Decatur", number: 16, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "DeKalb", number: 17, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Delaware", number: 18, courts: [{ type: "Circuit" }] },
  { name: "Dubois", number: 19, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Elkhart", number: 20, courts: [{ type: "Superior", divisions: 6 }, { type: "Circuit" }] },
  { name: "Fayette", number: 21, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Floyd", number: 22, courts: [{ type: "Superior", divisions: 3 }, { type: "Circuit" }] },
  { name: "Fountain", number: 23, courts: [{ type: "Circuit" }] },
  { name: "Franklin", number: 24, courts: [{ type: "Circuit" }] },
  { name: "Fulton", number: 25, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Gibson", number: 26, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Grant", number: 27, courts: [{ type: "Superior", divisions: 3 }, { type: "Circuit" }] },
  { name: "Greene", number: 28, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Hamilton", number: 29, courts: [{ type: "Superior", divisions: 7 }, { type: "Circuit" }] },
  { name: "Hancock", number: 30, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Harrison", number: 31, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Hendricks", number: 32, courts: [{ type: "Superior", divisions: 5 }, { type: "Circuit" }] },
  { name: "Henry", number: 33, courts: [{ type: "Circuit" }] },
  { name: "Howard", number: 34, courts: [{ type: "Superior", divisions: 4 }, { type: "Circuit" }] },
  { name: "Huntington", number: 35, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Jackson", number: 36, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Jasper", number: 37, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Jay", number: 38, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Jefferson", number: 39, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Jennings", number: 40, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Johnson", number: 41, courts: [{ type: "Superior", divisions: 4 }, { type: "Circuit" }] },
  { name: "Knox", number: 42, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Kosciusko", number: 43, courts: [{ type: "Superior", divisions: 4 }, { type: "Circuit" }] },
  { name: "LaGrange", number: 44, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Lake", number: 45, courts: [{ type: "Superior", divisions: 16 }, { type: "Circuit" }] },
  { name: "LaPorte", number: 46, courts: [{ type: "Superior", divisions: 4 }, { type: "Circuit" }] },
  { name: "Lawrence", number: 47, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Madison", number: 48, courts: [{ type: "Circuit" }] },
  { name: "Marion", number: 49, courts: [{ type: "Superior", divisions: 36 }, { type: "Circuit" }] },
  { name: "Marshall", number: 50, courts: [{ type: "Superior", divisions: 3 }, { type: "Circuit" }] },
  { name: "Martin", number: 51, courts: [{ type: "Circuit" }] },
  { name: "Miami", number: 52, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Monroe", number: 53, courts: [{ type: "Circuit" }] },
  { name: "Montgomery", number: 54, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Morgan", number: 55, courts: [{ type: "Superior", divisions: 3 }, { type: "Circuit" }] },
  { name: "Newton", number: 56, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Noble", number: 57, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Ohio", number: 58, courts: [{ type: "Circuit" }] },
  { name: "Orange", number: 59, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Owen", number: 60, courts: [{ type: "Circuit" }] },
  { name: "Parke", number: 61, courts: [{ type: "Circuit" }] },
  { name: "Perry", number: 62, courts: [{ type: "Circuit" }] },
  { name: "Pike", number: 63, courts: [{ type: "Circuit" }] },
  { name: "Porter", number: 64, courts: [{ type: "Superior", divisions: 6 }, { type: "Circuit" }] },
  { name: "Posey", number: 65, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Pulaski", number: 66, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Putnam", number: 67, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Randolph", number: 68, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Ripley", number: 69, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Rush", number: 70, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "St. Joseph", number: 71, courts: [{ type: "Superior", divisions: 8 }, { type: "Circuit" }] },
  { name: "Scott", number: 72, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Shelby", number: 73, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Spencer", number: 74, courts: [{ type: "Circuit" }] },
  { name: "Starke", number: 75, courts: [{ type: "Circuit" }] },
  { name: "Steuben", number: 76, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Sullivan", number: 77, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Switzerland", number: 78, courts: [{ type: "Circuit" }] },
  { name: "Tippecanoe", number: 79, courts: [{ type: "Superior", divisions: 7 }, { type: "Circuit" }] },
  { name: "Tipton", number: 80, courts: [{ type: "Circuit" }] },
  { name: "Union", number: 81, courts: [{ type: "Circuit" }] },
  { name: "Vanderburgh", number: 82, courts: [{ type: "Superior", divisions: 7 }, { type: "Circuit" }] },
  { name: "Vermillion", number: 83, courts: [{ type: "Circuit" }] },
  { name: "Vigo", number: 84, courts: [{ type: "Superior", divisions: 6 }, { type: "Circuit" }] },
  { name: "Wabash", number: 85, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Warren", number: 86, courts: [{ type: "Circuit" }] },
  { name: "Warrick", number: 87, courts: [{ type: "Superior", divisions: 2 }, { type: "Circuit" }] },
  { name: "Washington", number: 88, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Wayne", number: 89, courts: [{ type: "Superior", divisions: 3 }, { type: "Circuit" }] },
  { name: "Wells", number: 90, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "White", number: 91, courts: [{ type: "Superior" }, { type: "Circuit" }] },
  { name: "Whitley", number: 92, courts: [{ type: "Superior" }, { type: "Circuit" }] },
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
  const match = courtName.match(/^(.+?)\s+(Superior|Circuit)\s+Court\s*(\d+)?$/);
  if (!match) return "";

  const [, countyName, courtType, divisionStr] = match;
  const county = INDIANA_COUNTIES.find((c) => c.name === countyName);
  if (!county) return "";

  const countyNum = String(county.number).padStart(2, "0");
  const typeLetter = courtType === "Superior" ? "D" : "C";
  const division = divisionStr ? String(parseInt(divisionStr)).padStart(2, "0") : "01";

  return `${countyNum}${typeLetter}${division}-`;
}
