type AppellateOutcome =
  | "AFFIRMED"
  | "REVERSED"
  | "REVERSED_AND_REMANDED"
  | "REMANDED"
  | "VACATED"
  | "DISMISSED"
  | "TRANSFER_DENIED"
  | "TRANSFER_GRANTED"
  | "OTHER";

type OffenseCategory =
  | "DRUG_DEALING"
  | "DRUG_POSSESSION"
  | "DUI_OWI"
  | "BATTERY"
  | "DOMESTIC_BATTERY"
  | "ASSAULT"
  | "ROBBERY"
  | "BURGLARY"
  | "THEFT"
  | "FRAUD"
  | "WEAPONS"
  | "SEX_OFFENSE"
  | "MURDER_HOMICIDE"
  | "ARSON"
  | "RESISTING"
  | "DRIVING_OFFENSE"
  | "OTHER";

const OUTCOME_PATTERNS: [RegExp, AppellateOutcome][] = [
  [/\breversed\s+and\s+remanded\b/i, "REVERSED_AND_REMANDED"],
  [/\breversed\b/i, "REVERSED"],
  [/\bremanded\b/i, "REMANDED"],
  [/\bvacated\b/i, "VACATED"],
  [/\baffirmed\b/i, "AFFIRMED"],
  [/\bdismissed\b/i, "DISMISSED"],
  [/\btransfer\s+(is\s+)?denied\b/i, "TRANSFER_DENIED"],
  [/\btransfer\s+(is\s+)?granted\b/i, "TRANSFER_GRANTED"],
];

export function parseOutcome(text: string): AppellateOutcome {
  for (const [pattern, outcome] of OUTCOME_PATTERNS) {
    if (pattern.test(text)) return outcome;
  }
  return "OTHER";
}

const COUNTY_PATTERN =
  /\b(\w+(?:\s+\w+)?)\s+(?:Superior|Circuit|County)\s+Court\b/i;

export function parseCounty(caseName: string, snippet: string): string | null {
  // Try to find county in case name first, then snippet
  for (const text of [caseName, snippet]) {
    const match = text.match(COUNTY_PATTERN);
    if (match) {
      const county = match[1];
      // Filter out generic words that aren't counties
      if (
        !["the", "a", "an", "this", "that", "state", "trial"].includes(
          county.toLowerCase()
        )
      ) {
        return county;
      }
    }
  }
  return null;
}

const OFFENSE_PATTERNS: [RegExp, OffenseCategory][] = [
  [/\bdeal(?:ing)?\s+(?:in\s+)?(?:cocaine|heroin|methamphetamine|marijuana|controlled\s+substance|narcotic)/i, "DRUG_DEALING"],
  [/\bpossession\s+(?:of\s+)?(?:cocaine|heroin|methamphetamine|marijuana|controlled\s+substance|narcotic)/i, "DRUG_POSSESSION"],
  [/\b(?:drug|narcotic|controlled\s+substance)\b/i, "DRUG_POSSESSION"],
  [/\b(?:dui|owi|operating\s+while\s+intoxicated|drunk\s+driv)/i, "DUI_OWI"],
  [/\bdomestic\s+batter/i, "DOMESTIC_BATTERY"],
  [/\bbatter/i, "BATTERY"],
  [/\bassault\b/i, "ASSAULT"],
  [/\brobb(?:ery|ing)\b/i, "ROBBERY"],
  [/\bburglary\b/i, "BURGLARY"],
  [/\btheft\b/i, "THEFT"],
  [/\bfraud\b/i, "FRAUD"],
  [/\b(?:firearm|weapon|gun|handgun)\b/i, "WEAPONS"],
  [/\b(?:sex(?:ual)?\s+(?:offense|assault|misconduct)|rape|molest|child\s+(?:molest|exploit))/i, "SEX_OFFENSE"],
  [/\b(?:murder|homicide|manslaughter|killing)\b/i, "MURDER_HOMICIDE"],
  [/\barson\b/i, "ARSON"],
  [/\bresisting\s+(?:law\s+)?enforcement\b/i, "RESISTING"],
  [/\b(?:reckless\s+driving|driving\s+(?:while|with)\s+(?:suspended|revoked))\b/i, "DRIVING_OFFENSE"],
];

export function parseOffenseCategory(
  caseName: string,
  snippet: string
): OffenseCategory | null {
  const text = `${caseName} ${snippet}`;
  for (const [pattern, category] of OFFENSE_PATTERNS) {
    if (pattern.test(text)) return category;
  }
  return null;
}

/**
 * Check if a docket number indicates a criminal case.
 * Indiana appellate dockets: e.g. "24A-CR-2155" — "CR" = criminal
 */
export function isCriminalDocket(docketNumber: string): boolean {
  return /\bCR\b/i.test(docketNumber);
}
