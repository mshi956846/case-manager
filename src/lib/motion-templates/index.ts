import { DocumentWizardValues } from "@/lib/validations/document-wizard";
import { TipTapNode } from "./helpers";
import { PRE_TRIAL_TEMPLATES } from "./pre-trial";
import { EVIDENCE_TEMPLATES } from "./evidence";
import { DISCOVERY_TEMPLATES } from "./discovery";
import { PROCEDURAL_TEMPLATES } from "./procedural";
import { TRIAL_TEMPLATES } from "./trial";
import { POST_TRIAL_TEMPLATES } from "./post-trial";
import { FINANCIAL_TEMPLATES } from "./financial";

type BodyBuilder = (data: DocumentWizardValues) => TipTapNode[];

const TEMPLATE_REGISTRY: Record<string, BodyBuilder> = {
  ...PRE_TRIAL_TEMPLATES,
  ...EVIDENCE_TEMPLATES,
  ...DISCOVERY_TEMPLATES,
  ...PROCEDURAL_TEMPLATES,
  ...TRIAL_TEMPLATES,
  ...POST_TRIAL_TEMPLATES,
  ...FINANCIAL_TEMPLATES,
};

export function getMotionTemplateBody(
  motionId: string,
  data: DocumentWizardValues
): TipTapNode[] | null {
  const builder = TEMPLATE_REGISTRY[motionId];
  if (!builder) return null;
  return builder(data);
}
