export interface FieldOptionSet {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

export const FIELD_OPTION_SETS: FieldOptionSet[] = [
  {
    id: "offense-level",
    label: "Offense Level",
    options: [
      { value: "murder", label: "Murder" },
      { value: "level-1-felony", label: "Level 1 Felony" },
      { value: "level-2-felony", label: "Level 2 Felony" },
      { value: "level-3-felony", label: "Level 3 Felony" },
      { value: "level-4-felony", label: "Level 4 Felony" },
      { value: "level-5-felony", label: "Level 5 Felony" },
      { value: "level-6-felony", label: "Level 6 Felony" },
      { value: "class-a-misdemeanor", label: "Class A Misdemeanor" },
      { value: "class-b-misdemeanor", label: "Class B Misdemeanor" },
      { value: "class-c-misdemeanor", label: "Class C Misdemeanor" },
      { value: "infraction", label: "Infraction" },
    ],
  },
  {
    id: "suppression-basis",
    label: "Suppression Basis",
    options: [
      { value: "4th-amendment", label: "Fourth Amendment — Unreasonable Search & Seizure" },
      { value: "5th-amendment", label: "Fifth Amendment — Self-Incrimination" },
      { value: "6th-amendment", label: "Sixth Amendment — Right to Counsel" },
      { value: "14th-amendment", label: "Fourteenth Amendment — Due Process" },
      { value: "art1-sec11", label: "Ind. Const. Art. 1, § 11 — Search & Seizure" },
      { value: "miranda", label: "Miranda Violation" },
      { value: "fruit-poisonous-tree", label: "Fruit of the Poisonous Tree" },
      { value: "involuntary-statement", label: "Involuntary Statement" },
    ],
  },
  {
    id: "dismissal-basis",
    label: "Dismissal Basis",
    options: [
      { value: "failure-state-claim", label: "Failure to State a Claim" },
      { value: "lack-jurisdiction", label: "Lack of Subject Matter Jurisdiction" },
      { value: "due-process", label: "Due Process Violation" },
      { value: "speedy-trial", label: "Speedy Trial Violation (Crim. Rule 4)" },
      { value: "double-jeopardy", label: "Double Jeopardy" },
      { value: "statute-limitations", label: "Statute of Limitations" },
      { value: "prosecutorial-misconduct", label: "Prosecutorial Misconduct" },
      { value: "insufficient-evidence", label: "Insufficient Evidence" },
    ],
  },
  {
    id: "evidence-rule",
    label: "Evidence Rule",
    options: [
      { value: "rule-401", label: "Rule 401 — Relevance" },
      { value: "rule-402", label: "Rule 402 — Admissibility of Relevant Evidence" },
      { value: "rule-403", label: "Rule 403 — Prejudice vs. Probative Value" },
      { value: "rule-404a", label: "Rule 404(a) — Character Evidence" },
      { value: "rule-404b", label: "Rule 404(b) — Prior Bad Acts" },
      { value: "rule-602", label: "Rule 602 — Lack of Personal Knowledge" },
      { value: "rule-702", label: "Rule 702 — Expert Testimony" },
      { value: "rule-801", label: "Rule 801 — Hearsay Definition" },
      { value: "rule-802", label: "Rule 802 — Hearsay Rule" },
    ],
  },
  {
    id: "constitutional-amendment",
    label: "Constitutional Amendment",
    options: [
      { value: "1st", label: "First Amendment — Free Speech" },
      { value: "2nd", label: "Second Amendment — Right to Bear Arms" },
      { value: "4th", label: "Fourth Amendment — Search & Seizure" },
      { value: "5th", label: "Fifth Amendment — Due Process / Self-Incrimination" },
      { value: "6th", label: "Sixth Amendment — Right to Counsel / Confrontation" },
      { value: "8th", label: "Eighth Amendment — Cruel & Unusual Punishment" },
      { value: "14th", label: "Fourteenth Amendment — Equal Protection / Due Process" },
    ],
  },
  {
    id: "hearing-type",
    label: "Hearing Type",
    options: [
      { value: "initial", label: "Initial Hearing" },
      { value: "omnibus", label: "Omnibus Hearing" },
      { value: "pretrial", label: "Pre-Trial Conference" },
      { value: "suppression", label: "Suppression Hearing" },
      { value: "change-of-plea", label: "Change of Plea Hearing" },
      { value: "sentencing", label: "Sentencing Hearing" },
      { value: "bench-trial", label: "Bench Trial" },
      { value: "jury-trial", label: "Jury Trial" },
    ],
  },
  {
    id: "expert-type",
    label: "Expert Type",
    options: [
      { value: "forensic-psychologist", label: "Forensic Psychologist" },
      { value: "forensic-pathologist", label: "Forensic Pathologist" },
      { value: "toxicologist", label: "Toxicologist" },
      { value: "dna-analyst", label: "DNA Analyst" },
      { value: "digital-forensics", label: "Digital Forensics Expert" },
      { value: "accident-reconstruction", label: "Accident Reconstruction Expert" },
      { value: "ballistics", label: "Ballistics Expert" },
      { value: "medical", label: "Medical Expert" },
    ],
  },
];

export function getFieldOptionSet(id: string): FieldOptionSet | undefined {
  return FIELD_OPTION_SETS.find((s) => s.id === id);
}
