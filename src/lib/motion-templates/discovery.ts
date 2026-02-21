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

export const DISCOVERY_TEMPLATES: Record<string, BodyBuilder> = {
  "motion-discovery": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order directing the State to provide discovery in this cause pursuant to Ind. Code § 35-36-2-1 et seq. and Indiana Criminal Rule 21. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole), text(" is charged with [charge], a "),
        dropdownField("offense-level", "Offense Level"), text("."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requests the State to provide the following discovery:"),
      ])],
      [paragraph([
        text("\t\t(a) The names and last known addresses of persons whom the State intends to call as witnesses, together with their relevant written or recorded statements;"),
      ])],
      [paragraph([
        text("\t\t(b) Any written or recorded statements made by the "), text(data.defendantRole), text(";"),
      ])],
      [paragraph([
        text("\t\t(c) Any reports or results of physical or mental examinations, scientific tests, or experiments;"),
      ])],
      [paragraph([
        text("\t\t(d) Any books, papers, documents, photographs, or tangible objects the State intends to use at trial or that were obtained from the "), text(data.defendantRole), text(";"),
      ])],
      [paragraph([
        text("\t\t(e) All police reports, incident reports, investigation reports, and supplemental reports;"),
      ])],
      [paragraph([
        text("\t\t(f) All body camera footage, dash camera footage, surveillance video, and audio recordings;"),
      ])],
      [paragraph([
        text("\t\t(g) All 911 call recordings and dispatch records;"),
      ])],
      [paragraph([
        text("\t\t(h) Any evidence favorable to the "), text(data.defendantRole),
        text(" as required by "), italic("Brady v. Maryland"),
        text(", 373 U.S. 83 (1963);"),
      ])],
      [paragraph([
        text("\t\t(i) Any record of prior criminal convictions of State's witnesses that may be used for impeachment purposes."),
      ])],
    ]),
  ],

  "motion-compel": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to compel the State to comply with its discovery obligations. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tOn or about [date], the "), text(data.defendantRole),
        text(" filed a Motion for Discovery requesting the State to provide [describe discovery requested]."),
      ])],
      [paragraph([
        text("\t\tDespite the passage of [number] days, the State has failed to comply with its discovery obligations by [describe specific failures — not producing documents, not disclosing witnesses, etc.]."),
      ])],
      [paragraph([
        text("\t\tThe requested discovery is material to the "), text(data.defendantRole),
        text("'s defense and is necessary for adequate trial preparation."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 35-36-2-1 and Indiana Criminal Rule 21, the Court should order the State to provide the requested discovery and impose appropriate sanctions for the State's non-compliance, including but not limited to exclusion of evidence and/or continuance of the trial date."),
      ])],
    ]),
  ],

  "motion-reveal-agreements": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to order the State to disclose all plea agreements, immunity grants, and other inducements provided to witnesses in this case. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State intends to call witnesses who may have received favorable treatment, plea agreements, grants of immunity, or other consideration in exchange for their testimony."),
      ])],
      [paragraph([
        text("\t\tPursuant to "),
        italic("Giglio v. United States"),
        text(", 405 U.S. 150 (1972), the prosecution must disclose any agreements, promises, or inducements made to witnesses in exchange for testimony. This includes informal as well as formal agreements."),
      ])],
      [paragraph([
        text("\t\tFailure to disclose such agreements violates the "), text(data.defendantRole),
        text("'s right to due process and the right to effective cross-examination under the Sixth Amendment."),
      ])],
    ]),
  ],

  "motion-drug-informant": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to order the State to disclose the identity of the confidential informant used in this case. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State's case relies upon information provided by a confidential informant who [participated in the transaction / provided information to obtain the search warrant / was present during the events in question]."),
      ])],
      [paragraph([
        text("\t\tThe identity of the confidential informant is relevant and helpful to the defense of this case. The informant [was a participant in the alleged offense / may provide exculpatory testimony / the informant's credibility is central to the State's case]."),
      ])],
      [paragraph([
        text("\t\tUnder "),
        italic("Roviaro v. United States"),
        text(", 353 U.S. 53 (1957), and "),
        italic("Alford v. State"),
        text(", 699 N.E.2d 247 (Ind. 1998), where the disclosure of an informant's identity is relevant and helpful to the defense or is essential to a fair determination of a case, the privilege must give way."),
      ])],
    ]),
  ],

  "motion-doc-records": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order directing the Indiana Department of Correction to release records pertaining to [witness/co-defendant name]. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tA witness in this case, [name], is currently or was previously incarcerated with the Indiana Department of Correction."),
      ])],
      [paragraph([
        text("\t\tThe DOC records may contain information relevant to the witness's credibility, including disciplinary records, mental health records, informant status, and communications with law enforcement."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 11-8-5-2 and the "), text(data.defendantRole),
        text("'s constitutional right to obtain favorable evidence, the Court should order the release of relevant records for in camera review."),
      ])],
    ]),
  ],

  "motion-officer-disciplinary": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to order the disclosure of internal affairs and disciplinary records for the officers involved in this case. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe following officers are witnesses and/or participated in the investigation, arrest, or search of the "),
        text(data.defendantRole), text(": [list officers]."),
      ])],
      [paragraph([
        text("\t\tThe officers' disciplinary records may contain evidence relevant to their credibility, pattern of conduct, and propensity for [excessive force / dishonesty / improper search procedures / planting evidence]."),
      ])],
      [paragraph([
        text("\t\tUnder "), italic("Brady v. Maryland"),
        text(", 373 U.S. 83 (1963), impeachment evidence must be disclosed. The "),
        text(data.defendantRole),
        text(" requests in camera review and disclosure of any relevant disciplinary records pertaining to these officers."),
      ])],
    ]),
  ],

  "motion-seal": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to seal the following documents from public access pursuant to Indiana Administrative Rule 9. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requests that the Court seal the following documents: [identify documents]."),
      ])],
      [paragraph([
        text("\t\tSealing is necessary to protect [the Defendant's right to a fair trial / confidential personal information / ongoing investigation / safety concerns / trade secrets or proprietary information]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Admin. Rule 9(G)(1), the Court may restrict public access to court records upon a showing that: (a) the grounds for exclusion are supported by specific facts; (b) the interests in excluding the records from public access outweigh the presumption of open records; and (c) no reasonable alternative exists."),
      ])],
    ]),
  ],
};
