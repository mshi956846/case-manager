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

export const FINANCIAL_TEMPLATES: Record<string, BodyBuilder> = {
  "motion-fee-waiver": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to waive all fees and costs in this cause. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" is indigent and unable to pay the fees and costs associated with this proceeding."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 33-37-3-2, the Court may waive court fees for a person who is financially unable to pay. The "),
        text(data.defendantRole), text("'s financial circumstances are as follows: [describe — income, assets, obligations, public assistance received]."),
      ])],
      [paragraph([
        text("\t\tDenial of this waiver would effectively deny the "), text(data.defendantRole),
        text(" access to the courts in violation of the Due Process and Equal Protection Clauses of the Fourteenth Amendment. "),
        italic("Boddie v. Connecticut"),
        text(", 401 U.S. 371 (1971)."),
      ])],
    ]),
  ],

  "motion-indigency": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for a determination of indigency. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" is unable to retain private counsel and requests that the Court determine "),
        text(data.defendantRole === "Defendant" ? "him/her" : "them"),
        text(" to be indigent for purposes of this proceeding."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text("'s current financial situation is as follows:"),
      ])],
      [paragraph([
        text("\t\t(a) Monthly income: $[amount]; (b) Monthly expenses: $[amount]; (c) Assets: [describe]; (d) Debts/obligations: [describe]; (e) Public assistance received: [describe]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 35-33-7-6, the Court shall determine whether a person is indigent based upon the person's income, assets, and financial obligations. The "),
        text(data.defendantRole), text(" satisfies this standard."),
      ])],
    ]),
  ],

  "motion-expert-fees": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully files this Ex Parte Motion for authorization of expert fees. This motion is filed ex parte to protect the "),
      text(data.defendantRole), text("'s work product privilege and right to effective assistance of counsel. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" has been found indigent and is represented by [public defender / court-appointed counsel]."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requires the services of a "), dropdownField("expert-type", "Expert Type"),
        text(" to assist in the preparation and presentation of the defense."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 35-36-2-2(a), upon a showing of materiality, an indigent defendant is entitled to funds for the assistance of experts. "),
        italic("Ake v. Oklahoma"),
        text(", 470 U.S. 68 (1985), further requires that an indigent defendant be provided access to a competent expert where the defendant's sanity, or another issue requiring expert analysis, is a significant factor at trial."),
      ])],
      [paragraph([
        text("\t\tThe estimated cost of the expert's services is $[amount]. The expert's assistance is necessary because [explain why the expert is material to the defense]."),
      ])],
    ]),
  ],

  "motion-deposition-funds": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for funds to conduct depositions in this cause. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" has been found indigent and is represented by [public defender / court-appointed counsel]."),
      ])],
      [paragraph([
        text("\t\tDepositions of the following witnesses are necessary for adequate trial preparation: [list witnesses and reasons]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 35-36-2-2 and Indiana Criminal Rule 21, an indigent defendant is entitled to funds for necessary depositions. The estimated cost is $[amount] for court reporter and transcript fees."),
      ])],
    ]),
  ],

  "motion-expert-witness-funds": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for funds to retain an expert witness. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" has been found indigent and is represented by [public defender / court-appointed counsel]."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requires the testimony of a "), dropdownField("expert-type", "Expert Type"),
        text(" at trial to [explain purpose — rebut the State's expert testimony / explain technical evidence / support the defense theory]."),
      ])],
      [paragraph([
        text("\t\tPursuant to "),
        italic("Ake v. Oklahoma"),
        text(", 470 U.S. 68 (1985), and Ind. Code § 35-36-2-2, an indigent defendant is entitled to the assistance of an expert witness when the issue requiring expert testimony is a significant factor in the case. The estimated cost of the expert witness is $[amount]."),
      ])],
    ]),
  ],

  "motion-forensic-examiner": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for funds to retain a forensic examiner. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" has been found indigent and requires the services of a "), dropdownField("expert-type", "Expert Type"),
        text(" to [analyze physical evidence / conduct independent testing / review the State's forensic analysis]."),
      ])],
      [paragraph([
        text("\t\tThe State has relied upon forensic evidence including [describe — DNA analysis, toxicology results, digital forensics, fingerprints, ballistics, etc.] in its case against the "),
        text(data.defendantRole), text("."),
      ])],
      [paragraph([
        text("\t\tAn independent forensic examination is essential to ensure the reliability of the State's evidence and to provide the "),
        text(data.defendantRole), text(" with a meaningful opportunity to challenge the State's case. "),
        italic("Ake v. Oklahoma"),
        text(", 470 U.S. 68 (1985). The estimated cost is $[amount]."),
      ])],
    ]),
  ],

  "motion-investigator": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for authorization to hire a private investigator at public expense. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" has been found indigent and is charged with [charge], a "), dropdownField("offense-level", "Offense Level"),
        text(", carrying a potential sentence of [potential sentence]."),
      ])],
      [paragraph([
        text("\t\tA private investigator is necessary to [locate and interview witnesses / investigate the crime scene / obtain surveillance footage / verify alibis / gather other evidence critical to the defense]."),
      ])],
      [paragraph([
        text("\t\tThe services of an investigator are essential to ensure the "), text(data.defendantRole),
        text("'s right to effective assistance of counsel and a fair trial under the Sixth and Fourteenth Amendments. The estimated cost is $[amount] for [number] hours of investigation at $[rate] per hour."),
      ])],
    ]),
  ],

  "motion-witness-fees": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order authorizing the payment of witness fees at public expense. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" has been found indigent and intends to call the following witnesses at trial: [list witnesses]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 33-37-2-2 and Ind. Code § 35-37-3-3, witnesses are entitled to fees and mileage for attendance at trial. The "),
        text(data.defendantRole), text(" is unable to pay these fees due to indigency."),
      ])],
      [paragraph([
        text("\t\tThe right to compulsory process for obtaining witnesses, guaranteed by the Sixth Amendment, would be meaningless if an indigent defendant could not afford to pay witness fees. The estimated total witness fees are $[amount]."),
      ])],
    ]),
  ],
};
