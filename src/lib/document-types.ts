export type DocumentCategory = "motion" | "brief" | "appeal";

export interface DocumentTypeNode {
  id: string;
  label: string;
  parentLabel?: string;
  category: DocumentCategory;
  templateTitle: string;
  subtypes?: DocumentTypeNode[];
}

export const DOCUMENT_TYPES: Record<DocumentCategory, DocumentTypeNode[]> = {
  motion: [
    {
      id: "motion-dismiss",
      label: "Motion to Dismiss",
      category: "motion",
      templateTitle: "MOTION TO DISMISS",
      subtypes: [
        {
          id: "motion-dismiss-failure-claim",
          label: "Failure to State a Claim",
          parentLabel: "Motion to Dismiss",
          category: "motion",
          templateTitle: "MOTION TO DISMISS FOR FAILURE TO STATE A CLAIM",
        },
        {
          id: "motion-dismiss-jurisdiction",
          label: "Lack of Jurisdiction",
          parentLabel: "Motion to Dismiss",
          category: "motion",
          templateTitle: "MOTION TO DISMISS FOR LACK OF JURISDICTION",
        },
        {
          id: "motion-dismiss-due-process",
          label: "Due Process Violation",
          parentLabel: "Motion to Dismiss",
          category: "motion",
          templateTitle: "MOTION TO DISMISS FOR DUE PROCESS VIOLATION",
        },
        {
          id: "motion-dismiss-speedy-trial",
          label: "Speedy Trial Violation",
          parentLabel: "Motion to Dismiss",
          category: "motion",
          templateTitle: "MOTION TO DISMISS FOR SPEEDY TRIAL VIOLATION",
        },
      ],
    },
    {
      id: "motion-suppress",
      label: "Motion to Suppress",
      category: "motion",
      templateTitle: "MOTION TO SUPPRESS",
      subtypes: [
        {
          id: "motion-suppress-statement",
          label: "Statement",
          parentLabel: "Motion to Suppress",
          category: "motion",
          templateTitle: "MOTION TO SUPPRESS STATEMENT",
        },
        {
          id: "motion-suppress-evidence",
          label: "Evidence",
          parentLabel: "Motion to Suppress",
          category: "motion",
          templateTitle: "MOTION TO SUPPRESS EVIDENCE",
        },
        {
          id: "motion-suppress-identification",
          label: "Identification",
          parentLabel: "Motion to Suppress",
          category: "motion",
          templateTitle: "MOTION TO SUPPRESS IDENTIFICATION",
        },
      ],
    },
    {
      id: "motion-compel",
      label: "Motion to Compel",
      category: "motion",
      templateTitle: "MOTION TO COMPEL",
    },
    {
      id: "motion-limine",
      label: "Motion in Limine",
      category: "motion",
      templateTitle: "MOTION IN LIMINE",
    },
    {
      id: "motion-continuance",
      label: "Motion for Continuance",
      category: "motion",
      templateTitle: "MOTION FOR CONTINUANCE",
    },
    {
      id: "motion-strike",
      label: "Motion to Strike",
      category: "motion",
      templateTitle: "MOTION TO STRIKE",
    },
    {
      id: "motion-discovery",
      label: "Motion for Discovery",
      category: "motion",
      templateTitle: "MOTION FOR DISCOVERY",
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
