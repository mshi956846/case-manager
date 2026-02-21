export interface FilingCode {
  code: string;
  label: string;
  category: string;
}

export const FILING_CODES: FilingCode[] = [
  { code: "MOTN", label: "Motion", category: "Motions" },
  { code: "BREF", label: "Brief", category: "Motions" },
  { code: "RESP", label: "Response", category: "Motions" },
  { code: "REPL", label: "Reply", category: "Motions" },
  { code: "NOTC", label: "Notice", category: "Notices" },
  { code: "ORDR", label: "Proposed Order", category: "Orders" },
  { code: "APEL", label: "Appeal", category: "Appeals" },
  { code: "PETN", label: "Petition", category: "Petitions" },
  { code: "AFDT", label: "Affidavit", category: "Supporting Documents" },
  { code: "STIP", label: "Stipulation", category: "Agreements" },
  { code: "SUBP", label: "Subpoena", category: "Discovery" },
  { code: "CERT", label: "Certificate of Service", category: "Service" },
  { code: "MISC", label: "Miscellaneous", category: "Other" },
];

export function getFilingCode(code: string): FilingCode | undefined {
  return FILING_CODES.find((fc) => fc.code === code);
}

export function getFilingCodesByCategory(): Record<string, FilingCode[]> {
  const grouped: Record<string, FilingCode[]> = {};
  for (const fc of FILING_CODES) {
    if (!grouped[fc.category]) {
      grouped[fc.category] = [];
    }
    grouped[fc.category].push(fc);
  }
  return grouped;
}
