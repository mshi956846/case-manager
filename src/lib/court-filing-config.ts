export const COURT_FILING = {
  font: {
    family: "Times New Roman",
    size: 12,
  },
  page: {
    width: 8.5, // inches
    height: 11, // inches
    margins: {
      top: 1, // inches
      bottom: 1,
      left: 1,
      right: 1,
    },
  },
  lineSpacing: 2, // double-spaced
  pageNumbers: {
    position: "bottom-center" as const,
  },
  lineNumbers: {
    enabled: true,
    restartPerPage: true,
  },
} as const;

// Indiana Trial Rule 10 & Appellate Rule 43 approved fonts
export const INDIANA_APPROVED_FONTS = [
  "Arial",
  "Baskerville",
  "Book Antiqua",
  "Bookman",
  "Bookman Old Style",
  "Century",
  "Century Schoolbook",
  "Calisto MT",
  "CG Times",
  "Garamond",
  "Georgia",
  "New Baskerville",
  "New Century Schoolbook",
  "Palatino",
  "Times New Roman",
] as const;

// Indiana-specific court filing rules
export const INDIANA_COURT_RULES = {
  // Trial Rule 10
  trialRule10: {
    fontSizeMin: 12, // 12-point or larger
    lineSpacing: 2, // double-spaced
    margins: { top: 1, bottom: 1, left: 1, right: 1 }, // 1 inch all sides
    paperSize: { width: 8.5, height: 11 }, // letter size
    defaultFont: "Times New Roman",
  },
  // Appellate Rule 43
  appellateRule43: {
    fontSizeMin: 12, // 12-point or larger (body and footnotes)
    lineSpacing: 2, // double-spaced
    singleSpacedElements: ["footnotes", "tables", "block_quotes"], // single-spaced with 4pt spacing
    margins: { top: 1, bottom: 1, left: 1, right: 1 },
    paperSize: { width: 8.5, height: 11 },
    pageNumbers: "bottom-consecutive" as const,
    header: {
      enabled: true,
      skipFirstPage: true, // no header on front page
      alignment: "left" as const,
      content: ["party_name", "document_name"], // left-aligned header
    },
    defaultFont: "Times New Roman",
  },
} as const;

// Conversion helpers
export const INCHES_TO_TWIPS = 1440; // 1 inch = 1440 twips (for docx)
export const INCHES_TO_PT = 72; // 1 inch = 72 points (for PDF)
