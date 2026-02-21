export const MOTION_TYPE_LABELS: Record<string, string> = {
  SUPPRESS_EVIDENCE: "Suppress Evidence",
  SUPPRESS_STATEMENT: "Suppress Statement",
  SUPPRESS_IDENTIFICATION: "Suppress ID",
  DISMISS: "Dismiss",
  CHANGE_OF_VENUE: "Change of Venue",
  CONTINUANCE: "Continuance",
  BOND_REDUCTION: "Bond Reduction",
  COMPEL_DISCOVERY: "Compel Discovery",
  LIMINE: "Motion in Limine",
  RECONSIDER: "Reconsider",
  OTHER: "Other",
};

export const MOTION_RESULT_LABELS: Record<string, string> = {
  GRANTED: "Granted",
  DENIED: "Denied",
  PARTIALLY_GRANTED: "Partially Granted",
  WITHDRAWN: "Withdrawn",
  MOOT: "Moot",
};

export const OFFENSE_LEVEL_LABELS: Record<string, string> = {
  MURDER: "Murder",
  LEVEL_1_FELONY: "Level 1 Felony",
  LEVEL_2_FELONY: "Level 2 Felony",
  LEVEL_3_FELONY: "Level 3 Felony",
  LEVEL_4_FELONY: "Level 4 Felony",
  LEVEL_5_FELONY: "Level 5 Felony",
  LEVEL_6_FELONY: "Level 6 Felony",
  CLASS_A_MISDEMEANOR: "Class A Misdemeanor",
  CLASS_B_MISDEMEANOR: "Class B Misdemeanor",
  CLASS_C_MISDEMEANOR: "Class C Misdemeanor",
  INFRACTION: "Infraction",
};

export const OFFENSE_CATEGORY_LABELS: Record<string, string> = {
  DRUG_DEALING: "Drug Dealing",
  DRUG_POSSESSION: "Drug Possession",
  DUI_OWI: "DUI / OWI",
  BATTERY: "Battery",
  DOMESTIC_BATTERY: "Domestic Battery",
  ASSAULT: "Assault",
  ROBBERY: "Robbery",
  BURGLARY: "Burglary",
  THEFT: "Theft",
  FRAUD: "Fraud",
  WEAPONS: "Weapons",
  SEX_OFFENSE: "Sex Offense",
  MURDER_HOMICIDE: "Murder / Homicide",
  ARSON: "Arson",
  RESISTING: "Resisting Law Enforcement",
  DRIVING_OFFENSE: "Driving Offense",
  OTHER: "Other",
};

export const DISPOSITION_LABELS: Record<string, string> = {
  PLEA_AGREEMENT: "Plea Agreement",
  PLEA_OPEN: "Open Plea",
  BENCH_TRIAL_CONVICTION: "Bench Trial (Conviction)",
  BENCH_TRIAL_ACQUITTAL: "Bench Trial (Acquittal)",
  JURY_TRIAL_CONVICTION: "Jury Trial (Conviction)",
  JURY_TRIAL_ACQUITTAL: "Jury Trial (Acquittal)",
  DISMISSED: "Dismissed",
  DIVERTED: "Diverted",
  OTHER: "Other",
};

export const MOTION_RESULT_COLORS: Record<string, string> = {
  GRANTED: "bg-green-100 text-green-800 border-green-200",
  DENIED: "bg-red-100 text-red-800 border-red-200",
  PARTIALLY_GRANTED: "bg-amber-100 text-amber-800 border-amber-200",
  WITHDRAWN: "bg-gray-100 text-gray-800 border-gray-200",
  MOOT: "bg-slate-100 text-slate-700 border-slate-200",
};

export const DISPOSITION_COLORS: Record<string, string> = {
  PLEA_AGREEMENT: "bg-blue-100 text-blue-800 border-blue-200",
  PLEA_OPEN: "bg-sky-100 text-sky-800 border-sky-200",
  BENCH_TRIAL_CONVICTION: "bg-orange-100 text-orange-800 border-orange-200",
  BENCH_TRIAL_ACQUITTAL: "bg-green-100 text-green-800 border-green-200",
  JURY_TRIAL_CONVICTION: "bg-red-100 text-red-800 border-red-200",
  JURY_TRIAL_ACQUITTAL: "bg-emerald-100 text-emerald-800 border-emerald-200",
  DISMISSED: "bg-gray-100 text-gray-800 border-gray-200",
  DIVERTED: "bg-purple-100 text-purple-800 border-purple-200",
  OTHER: "bg-slate-100 text-slate-700 border-slate-200",
};

export const CHART_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#14b8a6", // teal
];

// Indiana advisory sentencing ranges in months
export const INDIANA_ADVISORY_SENTENCES: Record<string, { min: number; advisory: number; max: number }> = {
  MURDER: { min: 540, advisory: 660, max: 780 },
  LEVEL_1_FELONY: { min: 240, advisory: 360, max: 480 },
  LEVEL_2_FELONY: { min: 120, advisory: 210, max: 360 },
  LEVEL_3_FELONY: { min: 36, advisory: 108, max: 192 },
  LEVEL_4_FELONY: { min: 24, advisory: 72, max: 144 },
  LEVEL_5_FELONY: { min: 12, advisory: 36, max: 72 },
  LEVEL_6_FELONY: { min: 6, advisory: 12, max: 30 },
  CLASS_A_MISDEMEANOR: { min: 0, advisory: 6, max: 12 },
  CLASS_B_MISDEMEANOR: { min: 0, advisory: 3, max: 6 },
  CLASS_C_MISDEMEANOR: { min: 0, advisory: 1, max: 2 },
  INFRACTION: { min: 0, advisory: 0, max: 0 },
};

export const COURT_TYPE_LABELS: Record<string, string> = {
  SUPERIOR: "Superior Court",
  CIRCUIT: "Circuit Court",
};

export const APPELLATE_COURT_LABELS: Record<string, string> = {
  SUPREME_COURT: "Supreme Court",
  COURT_OF_APPEALS: "Court of Appeals",
};

export const APPELLATE_OUTCOME_LABELS: Record<string, string> = {
  AFFIRMED: "Affirmed",
  REVERSED: "Reversed",
  REVERSED_AND_REMANDED: "Reversed & Remanded",
  REMANDED: "Remanded",
  VACATED: "Vacated",
  DISMISSED: "Dismissed",
  TRANSFER_DENIED: "Transfer Denied",
  TRANSFER_GRANTED: "Transfer Granted",
  OTHER: "Other",
};

export const APPELLATE_OUTCOME_COLORS: Record<string, string> = {
  AFFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  REVERSED: "bg-red-100 text-red-800 border-red-200",
  REVERSED_AND_REMANDED: "bg-orange-100 text-orange-800 border-orange-200",
  REMANDED: "bg-amber-100 text-amber-800 border-amber-200",
  VACATED: "bg-purple-100 text-purple-800 border-purple-200",
  DISMISSED: "bg-gray-100 text-gray-800 border-gray-200",
  TRANSFER_DENIED: "bg-slate-100 text-slate-700 border-slate-200",
  TRANSFER_GRANTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  OTHER: "bg-slate-100 text-slate-700 border-slate-200",
};
