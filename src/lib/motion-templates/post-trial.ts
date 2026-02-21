import { DocumentWizardValues } from "@/lib/validations/document-wizard";
import {
  TipTapNode,
  text,
  bold,
  italic,
  paragraph,
  emptyParagraph,
  dateNode,
  dropdownField,
  orderedList,
} from "./helpers";

type BodyBuilder = (data: DocumentWizardValues) => TipTapNode[];

export const POST_TRIAL_TEMPLATES: Record<string, BodyBuilder> = {
  "motion-post-trial": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully files the following post-trial motions pursuant to Indiana Trial Rule 59 and Indiana Criminal Rule 16. In support thereof:"),
    ]),
    emptyParagraph(),
    paragraph([bold("I. MOTION FOR JUDGMENT ON THE EVIDENCE / JUDGMENT OF ACQUITTAL")]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tPursuant to Ind. Trial Rule 50(A), the "), text(data.defendantRole),
        text(" moves for judgment on the evidence. The State failed to present sufficient evidence upon which a reasonable jury could find the "),
        text(data.defendantRole), text(" guilty beyond a reasonable doubt."),
      ])],
      [paragraph([
        text("\t\tSpecifically, the State failed to prove [identify the missing or insufficient element(s)]."),
      ])],
    ]),
    emptyParagraph(),
    paragraph([bold("II. MOTION FOR NEW TRIAL")]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tPursuant to Ind. Trial Rule 59(A), the "), text(data.defendantRole),
        text(" moves for a new trial on the following grounds:"),
      ])],
      [paragraph([
        text("\t\t(a) The verdict is contrary to law;"),
      ])],
      [paragraph([
        text("\t\t(b) The verdict is not supported by sufficient evidence;"),
      ])],
      [paragraph([
        text("\t\t(c) Error of law occurring at the trial, specifically [identify errors];"),
      ])],
      [paragraph([
        text("\t\t(d) [Other grounds — jury misconduct, newly discovered evidence, prosecutorial misconduct, etc.]."),
      ])],
    ]),
    emptyParagraph(),
    paragraph([bold("III. MOTION TO CORRECT ERROR")]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tPursuant to Ind. Trial Rule 59(E), the "), text(data.defendantRole),
        text(" requests the Court to correct the following errors: [identify specific errors]."),
      ])],
    ]),
  ],

  "motion-self-defense-notice": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, hereby provides notice of intent to assert self-defense pursuant to Ind. Code § 35-41-3-2. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" intends to present a defense of self-defense at trial. Pursuant to Ind. Code § 35-41-3-2, a person is justified in using reasonable force against another person to protect "),
        text(data.defendantRole === "Defendant" ? "himself/herself" : "themselves"),
        text(" if "), text(data.defendantRole === "Defendant" ? "he/she" : "they"),
        text(" reasonably believes that the force is necessary to prevent serious bodily injury or the commission of a forcible felony."),
      ])],
      [paragraph([
        text("\t\tIndiana's Stand Your Ground law, Ind. Code § 35-41-3-2(c), provides that a person who is not engaged in unlawful activity and is in a place where the person has a right to be has no duty to retreat before using reasonable force."),
      ])],
      [paragraph([
        text("\t\tThe factual basis for this defense is as follows: [describe the factual basis for self-defense claim]."),
      ])],
    ]),
  ],
};
