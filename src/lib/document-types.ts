export type DocumentCategory = "motion" | "brief" | "appeal";

export type MotionSubcategory =
  | "pre-trial"
  | "evidence"
  | "discovery"
  | "procedural"
  | "trial"
  | "post-trial"
  | "financial";

export interface DocumentTypeNode {
  id: string;
  label: string;
  parentLabel?: string;
  category: DocumentCategory;
  subcategory?: MotionSubcategory;
  templateTitle: string;
  subtypes?: DocumentTypeNode[];
}

export const MOTION_SUBCATEGORIES: Record<MotionSubcategory, string> = {
  "pre-trial": "Pre-Trial",
  evidence: "Evidence",
  discovery: "Discovery",
  procedural: "Procedural",
  trial: "Trial",
  "post-trial": "Post-Trial",
  financial: "Financial",
};

export const DOCUMENT_TYPES: Record<DocumentCategory, DocumentTypeNode[]> = {
  motion: [
    // ── Pre-Trial ─────────────────────────────────────────────
    {
      id: "motion-dismiss",
      label: "Motion to Dismiss",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION TO DISMISS",
      subtypes: [
        {
          id: "motion-dismiss-failure-claim",
          label: "Failure to State a Claim",
          parentLabel: "Motion to Dismiss",
          category: "motion",
          subcategory: "pre-trial",
          templateTitle: "MOTION TO DISMISS FOR FAILURE TO STATE A CLAIM",
        },
        {
          id: "motion-dismiss-jurisdiction",
          label: "Lack of Jurisdiction",
          parentLabel: "Motion to Dismiss",
          category: "motion",
          subcategory: "pre-trial",
          templateTitle: "MOTION TO DISMISS FOR LACK OF JURISDICTION",
        },
        {
          id: "motion-dismiss-due-process",
          label: "Due Process Violation",
          parentLabel: "Motion to Dismiss",
          category: "motion",
          subcategory: "pre-trial",
          templateTitle: "MOTION TO DISMISS FOR DUE PROCESS VIOLATION",
        },
        {
          id: "motion-dismiss-speedy-trial",
          label: "Speedy Trial Violation",
          parentLabel: "Motion to Dismiss",
          category: "motion",
          subcategory: "pre-trial",
          templateTitle: "MOTION TO DISMISS FOR SPEEDY TRIAL VIOLATION",
        },
      ],
    },
    {
      id: "motion-discharge",
      label: "Motion for Discharge",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION FOR DISCHARGE",
    },
    {
      id: "motion-speedy-trial",
      label: "Motion for Speedy Trial",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION FOR SPEEDY TRIAL",
    },
    {
      id: "motion-change-plea",
      label: "Motion for Change of Plea",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION FOR CHANGE OF PLEA",
    },
    {
      id: "motion-charging-info",
      label: "Motion to Amend Charging Information",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION TO AMEND CHARGING INFORMATION",
    },
    {
      id: "motion-404b",
      label: "Motion Regarding 404(b) Evidence",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION REGARDING INDIANA RULE OF EVIDENCE 404(b)",
    },
    {
      id: "motion-franks",
      label: "Motion for Franks Hearing",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION FOR FRANKS HEARING",
    },
    {
      id: "motion-disqualify-judge",
      label: "Motion to Disqualify Judge",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION TO DISQUALIFY JUDGE",
    },
    {
      id: "motion-elected-judge",
      label: "Motion for Elected Judge",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION FOR ELECTED JUDGE",
    },
    {
      id: "motion-continuance",
      label: "Motion for Continuance",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION FOR CONTINUANCE",
    },
    {
      id: "motion-interlocutory-appeal",
      label: "Motion for Interlocutory Appeal",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION TO CERTIFY ORDER FOR INTERLOCUTORY APPEAL",
    },
    {
      id: "motion-garrity",
      label: "Motion for Garrity Protection",
      category: "motion",
      subcategory: "pre-trial",
      templateTitle: "MOTION FOR GARRITY PROTECTION",
    },

    // ── Evidence ──────────────────────────────────────────────
    {
      id: "motion-suppress",
      label: "Motion to Suppress",
      category: "motion",
      subcategory: "evidence",
      templateTitle: "MOTION TO SUPPRESS",
      subtypes: [
        {
          id: "motion-suppress-statement",
          label: "Statement",
          parentLabel: "Motion to Suppress",
          category: "motion",
          subcategory: "evidence",
          templateTitle: "MOTION TO SUPPRESS STATEMENT",
        },
        {
          id: "motion-suppress-evidence",
          label: "Evidence",
          parentLabel: "Motion to Suppress",
          category: "motion",
          subcategory: "evidence",
          templateTitle: "MOTION TO SUPPRESS EVIDENCE",
        },
        {
          id: "motion-suppress-identification",
          label: "Identification",
          parentLabel: "Motion to Suppress",
          category: "motion",
          subcategory: "evidence",
          templateTitle: "MOTION TO SUPPRESS IDENTIFICATION",
        },
        {
          id: "motion-suppress-search",
          label: "Search & Seizure",
          parentLabel: "Motion to Suppress",
          category: "motion",
          subcategory: "evidence",
          templateTitle: "MOTION TO SUPPRESS — ILLEGAL SEARCH AND SEIZURE",
        },
        {
          id: "motion-suppress-breath-blood",
          label: "Breath/Blood Test",
          parentLabel: "Motion to Suppress",
          category: "motion",
          subcategory: "evidence",
          templateTitle: "MOTION TO SUPPRESS BREATH/BLOOD TEST RESULTS",
        },
      ],
    },
    {
      id: "motion-limine",
      label: "Motion in Limine",
      category: "motion",
      subcategory: "evidence",
      templateTitle: "MOTION IN LIMINE",
      subtypes: [
        {
          id: "motion-limine-prior-bad-acts",
          label: "Exclude Prior Bad Acts",
          parentLabel: "Motion in Limine",
          category: "motion",
          subcategory: "evidence",
          templateTitle: "MOTION IN LIMINE TO EXCLUDE PRIOR BAD ACTS",
        },
        {
          id: "motion-limine-character",
          label: "Exclude Character Evidence",
          parentLabel: "Motion in Limine",
          category: "motion",
          subcategory: "evidence",
          templateTitle: "MOTION IN LIMINE TO EXCLUDE CHARACTER EVIDENCE",
        },
        {
          id: "motion-limine-hearsay",
          label: "Exclude Hearsay",
          parentLabel: "Motion in Limine",
          category: "motion",
          subcategory: "evidence",
          templateTitle: "MOTION IN LIMINE TO EXCLUDE HEARSAY",
        },
      ],
    },
    {
      id: "motion-brady",
      label: "Motion for Exculpatory Evidence (Brady)",
      category: "motion",
      subcategory: "evidence",
      templateTitle: "MOTION FOR DISCLOSURE OF EXCULPATORY EVIDENCE",
    },
    {
      id: "motion-produce-evidence",
      label: "Motion to Produce Evidence",
      category: "motion",
      subcategory: "evidence",
      templateTitle: "MOTION TO PRODUCE EVIDENCE",
    },
    {
      id: "motion-prelim-admissibility",
      label: "Motion for Preliminary Hearing on Admissibility",
      category: "motion",
      subcategory: "evidence",
      templateTitle: "MOTION FOR PRELIMINARY HEARING ON ADMISSIBILITY OF EVIDENCE",
    },
    {
      id: "motion-third-party-defense",
      label: "Motion to Present Third-Party Defense",
      category: "motion",
      subcategory: "evidence",
      templateTitle: "MOTION TO PRESENT THIRD-PARTY DEFENSE",
    },
    {
      id: "motion-narrow-exhibits",
      label: "Motion to Narrow Exhibits",
      category: "motion",
      subcategory: "evidence",
      templateTitle: "MOTION TO NARROW EXHIBITS",
    },
    {
      id: "motion-cross-exam-lab",
      label: "Motion to Cross-Examine Lab Report Author",
      category: "motion",
      subcategory: "evidence",
      templateTitle: "MOTION TO CROSS-EXAMINE LABORATORY REPORT AUTHOR",
    },
    {
      id: "motion-officer-cell",
      label: "Motion to Inspect Officer Cell Phone",
      category: "motion",
      subcategory: "evidence",
      templateTitle: "MOTION TO INSPECT OFFICER'S CELLULAR TELEPHONE",
    },

    // ── Discovery ─────────────────────────────────────────────
    {
      id: "motion-discovery",
      label: "Motion for Discovery",
      category: "motion",
      subcategory: "discovery",
      templateTitle: "MOTION FOR DISCOVERY",
    },
    {
      id: "motion-compel",
      label: "Motion to Compel",
      category: "motion",
      subcategory: "discovery",
      templateTitle: "MOTION TO COMPEL",
    },
    {
      id: "motion-reveal-agreements",
      label: "Motion to Reveal Plea Agreements",
      category: "motion",
      subcategory: "discovery",
      templateTitle: "MOTION TO REVEAL PLEA AGREEMENTS WITH WITNESSES",
    },
    {
      id: "motion-drug-informant",
      label: "Motion for Drug Case/Informant Disclosure",
      category: "motion",
      subcategory: "discovery",
      templateTitle: "MOTION FOR DISCLOSURE OF CONFIDENTIAL INFORMANT",
    },
    {
      id: "motion-doc-records",
      label: "Motion to Release DOC Records",
      category: "motion",
      subcategory: "discovery",
      templateTitle: "MOTION TO RELEASE DEPARTMENT OF CORRECTION RECORDS",
    },
    {
      id: "motion-officer-disciplinary",
      label: "Motion for Officer Disciplinary Records",
      category: "motion",
      subcategory: "discovery",
      templateTitle: "MOTION FOR DISCLOSURE OF OFFICER DISCIPLINARY RECORDS",
    },
    {
      id: "motion-seal",
      label: "Motion to Seal Documents",
      category: "motion",
      subcategory: "discovery",
      templateTitle: "MOTION TO SEAL DOCUMENTS",
    },

    // ── Procedural ────────────────────────────────────────────
    {
      id: "motion-transport",
      label: "Motion for Transport Order",
      category: "motion",
      subcategory: "procedural",
      templateTitle: "MOTION FOR TRANSPORT ORDER",
    },
    {
      id: "motion-travel",
      label: "Motion for Permission to Travel",
      category: "motion",
      subcategory: "procedural",
      templateTitle: "MOTION FOR PERMISSION TO TRAVEL",
    },
    {
      id: "motion-interpreter",
      label: "Motion for Interpreter",
      category: "motion",
      subcategory: "procedural",
      templateTitle: "MOTION FOR APPOINTMENT OF INTERPRETER",
    },
    {
      id: "motion-quash",
      label: "Motion to Quash Subpoena",
      category: "motion",
      subcategory: "procedural",
      templateTitle: "MOTION TO QUASH SUBPOENA",
    },
    {
      id: "motion-non-party",
      label: "Motion for Non-Party Records",
      category: "motion",
      subcategory: "procedural",
      templateTitle: "MOTION FOR NON-PARTY RECORDS",
    },
    {
      id: "motion-withdraw",
      label: "Motion to Withdraw Appearance",
      category: "motion",
      subcategory: "procedural",
      templateTitle: "MOTION TO WITHDRAW APPEARANCE",
    },
    {
      id: "motion-reinstate-firearm",
      label: "Motion to Reinstate Firearm Rights",
      category: "motion",
      subcategory: "procedural",
      templateTitle: "MOTION TO REINSTATE RIGHT TO POSSESS FIREARM",
    },
    {
      id: "motion-return-property",
      label: "Motion for Return of Property",
      category: "motion",
      subcategory: "procedural",
      templateTitle: "MOTION FOR RETURN OF PROPERTY",
    },
    {
      id: "motion-transcript",
      label: "Motion for Transcript at Public Expense",
      category: "motion",
      subcategory: "procedural",
      templateTitle: "MOTION FOR TRANSCRIPT AT PUBLIC EXPENSE",
    },
    {
      id: "motion-mandamus",
      label: "Writ of Mandamus",
      category: "motion",
      subcategory: "procedural",
      templateTitle: "PETITION FOR WRIT OF MANDAMUS",
    },

    // ── Trial ─────────────────────────────────────────────────
    {
      id: "motion-jury-demand",
      label: "Jury Demand (Misdemeanor)",
      category: "motion",
      subcategory: "trial",
      templateTitle: "DEMAND FOR JURY TRIAL",
    },
    {
      id: "motion-reserve-jury",
      label: "Motion to Reserve Right to Jury",
      category: "motion",
      subcategory: "trial",
      templateTitle: "MOTION TO RESERVE RIGHT TO JURY TRIAL",
    },
    {
      id: "motion-waive-jury",
      label: "Motion to Waive Jury Trial",
      category: "motion",
      subcategory: "trial",
      templateTitle: "MOTION TO WAIVE JURY TRIAL",
    },
    {
      id: "motion-jury-selection",
      label: "Motion Regarding Jury Selection",
      category: "motion",
      subcategory: "trial",
      templateTitle: "MOTION REGARDING JURY SELECTION PROCEDURES",
    },
    {
      id: "motion-jury-unconstitutional",
      label: "Motion — Jury Rule Unconstitutional",
      category: "motion",
      subcategory: "trial",
      templateTitle: "MOTION CHALLENGING CONSTITUTIONALITY OF JURY RULE",
    },
    {
      id: "motion-mini-opening",
      label: "Motion for Mini Opening Statement",
      category: "motion",
      subcategory: "trial",
      templateTitle: "MOTION FOR MINI OPENING STATEMENT DURING VOIR DIRE",
    },
    {
      id: "motion-strike",
      label: "Motion to Strike",
      category: "motion",
      subcategory: "trial",
      templateTitle: "MOTION TO STRIKE",
    },
    {
      id: "motion-objection-instructions",
      label: "Objection to Jury Instructions",
      category: "motion",
      subcategory: "trial",
      templateTitle: "OBJECTION TO PROPOSED JURY INSTRUCTIONS",
    },
    {
      id: "motion-specify-exhibits",
      label: "Motion to Specify Trial Exhibits",
      category: "motion",
      subcategory: "trial",
      templateTitle: "MOTION TO SPECIFY TRIAL EXHIBITS",
    },

    // ── Post-Trial ────────────────────────────────────────────
    {
      id: "motion-post-trial",
      label: "Post-Trial Motions",
      category: "motion",
      subcategory: "post-trial",
      templateTitle: "POST-TRIAL MOTIONS",
    },
    {
      id: "motion-self-defense-notice",
      label: "Notice of Self-Defense",
      category: "motion",
      subcategory: "post-trial",
      templateTitle: "NOTICE OF SELF-DEFENSE CLAIM",
    },

    // ── Financial ─────────────────────────────────────────────
    {
      id: "motion-fee-waiver",
      label: "Motion for Fee Waiver",
      category: "motion",
      subcategory: "financial",
      templateTitle: "MOTION FOR WAIVER OF FEES AND COSTS",
    },
    {
      id: "motion-indigency",
      label: "Motion for Indigency Determination",
      category: "motion",
      subcategory: "financial",
      templateTitle: "MOTION FOR DETERMINATION OF INDIGENCY",
    },
    {
      id: "motion-expert-fees",
      label: "Ex Parte Motion for Expert Fees",
      category: "motion",
      subcategory: "financial",
      templateTitle: "EX PARTE MOTION FOR AUTHORIZATION OF EXPERT FEES",
    },
    {
      id: "motion-deposition-funds",
      label: "Motion for Funds for Depositions",
      category: "motion",
      subcategory: "financial",
      templateTitle: "MOTION FOR FUNDS FOR DEPOSITIONS",
    },
    {
      id: "motion-expert-witness-funds",
      label: "Motion for Funds for Expert Witness",
      category: "motion",
      subcategory: "financial",
      templateTitle: "MOTION FOR FUNDS FOR EXPERT WITNESS",
    },
    {
      id: "motion-forensic-examiner",
      label: "Motion for Funds for Forensic Examiner",
      category: "motion",
      subcategory: "financial",
      templateTitle: "MOTION FOR FUNDS FOR FORENSIC EXAMINER",
    },
    {
      id: "motion-investigator",
      label: "Motion to Hire Investigator",
      category: "motion",
      subcategory: "financial",
      templateTitle: "MOTION FOR AUTHORIZATION TO HIRE INVESTIGATOR",
    },
    {
      id: "motion-witness-fees",
      label: "Motion for Witness Fees",
      category: "motion",
      subcategory: "financial",
      templateTitle: "MOTION FOR WITNESS FEES",
    },
  ],
  brief: [
    {
      id: "brief-dismiss",
      label: "Brief in Support of Motion to Dismiss",
      category: "brief",
      templateTitle: "BRIEF IN SUPPORT OF MOTION TO DISMISS",
    },
    {
      id: "brief-suppress",
      label: "Brief in Support of Motion to Suppress",
      category: "brief",
      templateTitle: "BRIEF IN SUPPORT OF MOTION TO SUPPRESS",
    },
    {
      id: "brief-memorandum",
      label: "Memorandum of Law",
      category: "brief",
      templateTitle: "MEMORANDUM OF LAW",
    },
    {
      id: "brief-trial",
      label: "Trial Brief",
      category: "brief",
      templateTitle: "TRIAL BRIEF",
    },
  ],
  appeal: [
    {
      id: "appeal-notice",
      label: "Notice of Appeal",
      category: "appeal",
      templateTitle: "NOTICE OF APPEAL",
    },
    {
      id: "appeal-appellant-brief",
      label: "Appellant's Brief",
      category: "appeal",
      templateTitle: "APPELLANT'S BRIEF",
    },
    {
      id: "appeal-pcr",
      label: "Petition for Post-Conviction Relief",
      category: "appeal",
      templateTitle: "PETITION FOR POST-CONVICTION RELIEF",
    },
  ],
};

export function findDocumentType(id: string): DocumentTypeNode | undefined {
  for (const types of Object.values(DOCUMENT_TYPES)) {
    for (const type of types) {
      if (type.id === id) return type;
      if (type.subtypes) {
        const sub = type.subtypes.find((s) => s.id === id);
        if (sub) return sub;
      }
    }
  }
  return undefined;
}

export function getTypesForCategory(category: DocumentCategory): DocumentTypeNode[] {
  return DOCUMENT_TYPES[category] ?? [];
}

export function getTypesGroupedBySubcategory(
  category: DocumentCategory
): Record<string, DocumentTypeNode[]> {
  const types = getTypesForCategory(category);
  const grouped: Record<string, DocumentTypeNode[]> = {};
  for (const type of types) {
    const key = type.subcategory ?? "other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(type);
  }
  return grouped;
}
