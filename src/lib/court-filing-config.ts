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

// Conversion helpers
export const INCHES_TO_TWIPS = 1440; // 1 inch = 1440 twips (for docx)
export const INCHES_TO_PT = 72; // 1 inch = 72 points (for PDF)
