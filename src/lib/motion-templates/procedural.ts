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

export const PROCEDURAL_TEMPLATES: Record<string, BodyBuilder> = {
  "motion-transport": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order directing the Sheriff of [county] County or the Indiana Department of Correction to transport the "),
      text(data.defendantRole), text(" for a hearing in this matter. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" is currently incarcerated at [facility name and location]."),
      ])],
      [paragraph([
        text("\t\tA "), dropdownField("hearing-type", "Hearing Type"),
        text(" is scheduled for [date] at [time] before this Court."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text("'s presence is required at this hearing. The "), text(data.defendantRole),
        text(" has a constitutional right to be present at all critical stages of the proceedings."),
      ])],
      [paragraph([
        text("\t\tThe Court should enter a transport order directing [the Sheriff / the Indiana DOC] to transport the "),
        text(data.defendantRole), text(" to the "), text(data.court),
        text(" on the date of the scheduled hearing and return "),
        text(data.defendantRole === "Defendant" ? "him/her" : "them"),
        text(" to the facility following the hearing."),
      ])],
    ]),
  ],

  "motion-travel": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for permission to travel outside the jurisdiction. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" is currently released on bond with conditions that include remaining within the jurisdiction of this Court."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requests permission to travel to [destination] from [start date] to [end date] for the purpose of [employment / family obligation / medical treatment / other reason]."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" will comply with all other conditions of bond and will provide contact information for the duration of the travel."),
      ])],
    ]),
  ],

  "motion-interpreter": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to appoint a qualified interpreter for all proceedings in this cause. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text("'s primary language is [language]. The "), text(data.defendantRole),
        text(" has limited English proficiency and cannot meaningfully participate in the proceedings without the assistance of a qualified interpreter."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 34-45-1-3 and the Due Process Clause of the Fourteenth Amendment, the "),
        text(data.defendantRole),
        text(" is entitled to the appointment of a competent interpreter to ensure effective communication with counsel and meaningful participation in all proceedings."),
      ])],
      [paragraph([
        text("\t\tThe Court should appoint a certified [language] interpreter for all hearings, trial proceedings, and attorney-client conferences in this matter."),
      ])],
    ]),
  ],

  "motion-quash": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to quash the subpoena issued to [name/entity] in this cause. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tA subpoena was issued to [name/entity] on or about [date] requiring [testimony / production of documents / both]."),
      ])],
      [paragraph([
        text("\t\tThe subpoena should be quashed because [it is unreasonable or oppressive / the records sought are privileged / the subpoena was not properly served / the subpoena seeks irrelevant information / compliance would impose an undue burden]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Trial Rule 45(B), the Court may quash or modify a subpoena if compliance would be unreasonable or oppressive."),
      ])],
    ]),
  ],

  "motion-non-party": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order compelling the production of records from non-party [name/entity]. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" seeks records from [non-party name] including [describe records]."),
      ])],
      [paragraph([
        text("\t\tThese records are relevant and material to the defense because [explain relevance]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Trial Rule 34(C) and Indiana Trial Rule 45, a party may obtain discovery from a non-party through a subpoena for production of documents."),
      ])],
    ]),
  ],

  "motion-withdraw": (data) => [
    paragraph([
      text("\t\tCounsel for the "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", respectfully moves this Court for leave to withdraw appearance in this cause. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tCounsel has represented the "), text(data.defendantRole),
        text(" in this matter since [date of appearance]."),
      ])],
      [paragraph([
        text("\t\tWithdrawal is appropriate because [the representation has concluded / the attorney-client relationship has broken down / the client has retained new counsel / other good cause]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Indiana Professional Conduct Rule 1.16, a lawyer may withdraw from representing a client if withdrawal can be accomplished without material adverse effect on the interests of the client, or if [other basis under Rule 1.16]."),
      ])],
      [paragraph([
        text("\t\t[New counsel, [name], has entered an appearance / The "), text(data.defendantRole),
        text(" has been advised of the need to retain new counsel / The "), text(data.defendantRole),
        text(" has been advised of upcoming court dates]."),
      ])],
    ]),
  ],

  "motion-reinstate-firearm": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully petitions this Court for restoration of the right to possess a firearm pursuant to Ind. Code § 35-47-4-7. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe Petitioner was convicted of [offense] on or about [date] in [court]. This conviction resulted in the loss of the right to possess a firearm."),
      ])],
      [paragraph([
        text("\t\tMore than [five/fifteen] years have elapsed since the date of the conviction [or release from incarceration/probation, whichever is later]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 35-47-4-7, a person who has been convicted of a qualifying offense may petition for restoration of the right to possess a firearm if: (a) the required waiting period has elapsed; (b) the person has no pending criminal charges; and (c) the person has not been convicted of a crime of domestic violence."),
      ])],
      [paragraph([
        text("\t\tThe Petitioner meets all statutory requirements and requests that the Court restore "),
        text(data.defendantRole === "Defendant" ? "his/her" : "their"),
        text(" right to possess a firearm."),
      ])],
    ]),
  ],

  "motion-return-property": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order directing the return of property seized by law enforcement. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tOn or about [date], law enforcement officers seized the following property belonging to the "),
        text(data.defendantRole), text(": [describe property]."),
      ])],
      [paragraph([
        text("\t\tThe property is not contraband, was not used in the commission of a crime, and is not needed as evidence in any pending proceeding."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 35-33-5-5, when seized property is no longer needed for evidentiary purposes, it shall be returned to the rightful owner. The "),
        text(data.defendantRole), text(" requests the immediate return of said property."),
      ])],
    ]),
  ],

  "motion-transcript": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order directing the preparation of a transcript at public expense. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" has been found to be indigent and is represented by [public defender / court-appointed counsel / pro bono counsel]."),
      ])],
      [paragraph([
        text("\t\tA transcript of the [hearing type and date] is necessary for [preparation of a motion / appeal / other purpose]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 33-40-7-2 and "),
        italic("Griffin v. Illinois"),
        text(", 351 U.S. 12 (1956), an indigent defendant is entitled to a transcript at public expense when needed for an effective defense or appeal."),
      ])],
    ]),
  ],

  "motion-mandamus": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully petitions this Court for a Writ of Mandamus directing [name of official/body] to [describe the action sought]. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe Petitioner has a clear legal right to [describe the right or duty]."),
      ])],
      [paragraph([
        text("\t\t[Name of official/body] has a clear, absolute duty to [describe the duty], and has failed or refused to perform said duty."),
      ])],
      [paragraph([
        text("\t\tThe Petitioner has no adequate remedy at law."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 34-27-3-1, a writ of mandamus may be issued to compel the performance of a duty when: (1) the petitioner has a clear right to the relief sought; (2) the respondent has an absolute duty to act; and (3) there is no other adequate remedy available."),
      ])],
    ]),
  ],
};
