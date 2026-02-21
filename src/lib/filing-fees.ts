export interface FilingFeeResult {
  amount: number;
  description: string;
  waived: boolean;
}

export function calculateFilingFee(options: {
  filingType: "INITIAL" | "SUBSEQUENT" | "SERVICE_ONLY";
  category?: "criminal" | "civil" | "appellate";
  feeWaived?: boolean;
}): FilingFeeResult {
  const { filingType, category = "criminal", feeWaived = false } = options;

  if (feeWaived) {
    return { amount: 0, description: "Fee waived", waived: true };
  }

  // Criminal defense motions are typically $0
  if (category === "criminal") {
    return { amount: 0, description: "Criminal defense filing — no fee", waived: false };
  }

  if (category === "appellate") {
    return { amount: 250, description: "Appellate filing fee", waived: false };
  }

  // Civil filings
  if (filingType === "INITIAL") {
    return { amount: 157, description: "Civil initial filing fee", waived: false };
  }

  if (filingType === "SERVICE_ONLY") {
    return { amount: 0, description: "Service only — no filing fee", waived: false };
  }

  // Subsequent civil filing
  return { amount: 0, description: "Subsequent filing — no additional fee", waived: false };
}
