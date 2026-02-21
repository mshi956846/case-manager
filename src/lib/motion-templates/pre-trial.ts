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

export const PRE_TRIAL_TEMPLATES: Record<string, BodyBuilder> = {
  "motion-dismiss": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to dismiss the charges filed against "),
      text(data.defendantRole === "Defendant" ? "him/her" : "them"),
      text(" in the above-captioned cause. In support thereof, the "),
      text(data.defendantRole), text(" states as follows:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State of Indiana filed a charging information on or about [date], charging the "),
        text(data.defendantRole), text(" with [charge], a "),
        dropdownField("offense-level", "Offense Level"), text("."),
      ])],
      [paragraph([
        text("\t\tThe charges against the "), text(data.defendantRole),
        text(" should be dismissed on the basis of "), dropdownField("dismissal-basis", "Dismissal Basis"), text("."),
      ])],
      [paragraph([
        text("\t\t[Set forth specific factual and legal basis for dismissal]"),
      ])],
    ]),
  ],

  "motion-dismiss-failure-claim": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to dismiss the charging information for failure to state a claim upon which relief can be granted, pursuant to Indiana Trial Rule 12(B)(6). In support thereof, the "),
      text(data.defendantRole), text(" states as follows:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State filed a charging information on or about [date], charging the "),
        text(data.defendantRole), text(" with [charge], a "),
        dropdownField("offense-level", "Offense Level"), text("."),
      ])],
      [paragraph([
        text("\t\tThe charging information fails to state facts sufficient to constitute a criminal offense under Indiana law. Specifically, [explain deficiency]."),
      ])],
      [paragraph([
        text("\t\tEven accepting all well-pleaded factual allegations as true, the charging information does not allege each essential element of the offense. See "),
        italic("State v. Hurst"),
        text(", 88 N.E.3d 1070 (Ind. 2018)."),
      ])],
    ]),
  ],

  "motion-dismiss-jurisdiction": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to dismiss the charges for lack of subject matter jurisdiction pursuant to Indiana Trial Rule 12(B)(1). In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThis Court lacks subject matter jurisdiction over the charged offense(s) because [explain — e.g., offense occurred outside the county/state, court lacks authority over the offense level]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 35-32-2-1, criminal actions shall be tried in the county where the offense was committed. The alleged conduct occurred in [county/location], which is outside this Court's territorial jurisdiction."),
      ])],
    ]),
  ],

  "motion-dismiss-due-process": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to dismiss the charges due to violations of the "),
      text(data.defendantRole), text("'s right to due process of law under the Fourteenth Amendment to the United States Constitution and Article 1, Section 12 of the Indiana Constitution. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text("'s due process rights have been violated because [specify — pre-indictment delay, destruction of evidence, outrageous government conduct, etc.]."),
      ])],
      [paragraph([
        text("\t\tThe Due Process Clause requires fundamental fairness in criminal proceedings. "),
        italic("Doggett v. United States"),
        text(", 505 U.S. 647 (1992). The government's conduct in this case falls below the minimum standards of due process."),
      ])],
    ]),
  ],

  "motion-dismiss-speedy-trial": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to dismiss the charges due to violation of the "),
      text(data.defendantRole), text("'s right to a speedy trial under Indiana Criminal Rule 4 and the Sixth Amendment to the United States Constitution. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" was arrested/charged on or about [date]. As of "), dateNode(), text(", more than [number] days have elapsed since that date."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Crim. Rule 4(C), no person shall be held on recognizance or otherwise to answer a criminal charge for a period embracing more than one (1) year from the date the criminal charge is filed, or from the date of arrest, whichever is later."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" has not caused or contributed to any delays. The State bears the burden to bring the case to trial within the prescribed time limits. "),
        italic("Austin v. State"),
        text(", 997 N.E.2d 1027 (Ind. 2013)."),
      ])],
      [paragraph([
        text("\t\tDismissal with prejudice is the mandatory remedy for a Criminal Rule 4 violation. "),
        italic("Clark v. State"),
        text(", 659 N.E.2d 548 (Ind. 1995)."),
      ])],
    ]),
  ],

  "motion-discharge": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order of Discharge pursuant to Indiana Criminal Rule 4. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" was charged on or about [date of charging information/indictment]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Crim. Rule 4(C), the State had one (1) year from the date of filing to bring this case to trial."),
      ])],
      [paragraph([
        text("\t\tAs of "), dateNode(),
        text(", more than one year has elapsed. The "), text(data.defendantRole),
        text(" has not caused or acquiesced in any delay. The "), text(data.defendantRole),
        text(" is therefore entitled to discharge as a matter of right."),
      ])],
    ]),
  ],

  "motion-speedy-trial": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, hereby demands a speedy trial pursuant to Indiana Criminal Rule 4(B) and the Sixth Amendment to the United States Constitution. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" is currently charged with [charge], a "), dropdownField("offense-level", "Offense Level"),
        text(", and is being held [in custody / on bond]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Crim. Rule 4(B), upon motion of the defendant, the court shall set the cause for trial not later than seventy (70) days from the date of such motion."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" hereby invokes this right and demands that this cause be set for trial within seventy (70) days of the filing of this motion, specifically on or before [70-day deadline]."),
      ])],
    ]),
  ],

  "motion-change-plea": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for permission to change "),
      text(data.defendantRole === "Defendant" ? "his/her" : "their"),
      text(" plea in this matter. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" is charged with [charge], a "), dropdownField("offense-level", "Offense Level"), text("."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" previously entered a plea of [not guilty/guilty] and now wishes to change said plea to [guilty/not guilty]."),
      ])],
      [paragraph([
        text("\t\tThis change of plea is made knowingly, intelligently, and voluntarily, and is in the best interest of justice."),
      ])],
    ]),
  ],

  "motion-charging-info": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to order the State to amend the charging information in this cause. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe charging information currently charges the "), text(data.defendantRole),
        text(" with [current charge(s)]."),
      ])],
      [paragraph([
        text("\t\tThe charging information should be amended because [specify deficiencies — duplicitous counts, incorrect charge level, missing essential elements, etc.]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 35-34-1-5, the court may permit the filing of an amended information at any time before trial if no additional or different offense is charged and the substantial rights of the defendant are not prejudiced."),
      ])],
    ]),
  ],

  "motion-404b": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an order requiring the State to disclose any evidence it intends to offer under Indiana Rule of Evidence 404(b), and for a hearing on the admissibility of such evidence. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tIndiana Rule of Evidence 404(b) provides that evidence of other crimes, wrongs, or acts is not admissible to prove the character of a person in order to show action in conformity therewith."),
      ])],
      [paragraph([
        text("\t\tSuch evidence may be admissible only for other purposes, such as proof of motive, opportunity, intent, preparation, plan, knowledge, identity, absence of mistake, or lack of accident. "),
        italic("Hicks v. State"),
        text(", 690 N.E.2d 215 (Ind. 1997)."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requests that the State provide reasonable notice prior to trial of any 404(b) evidence it intends to introduce, and that the Court conduct a hearing outside the presence of the jury to determine admissibility."),
      ])],
    ]),
  ],

  "motion-franks": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for a Franks hearing to challenge the veracity of the affidavit submitted in support of the search warrant issued in this case, pursuant to "),
      italic("Franks v. Delaware"),
      text(", 438 U.S. 154 (1978). In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tA search warrant was issued on or about [date] by [judge/magistrate] based upon the affidavit of [affiant]."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" has made a substantial preliminary showing that the affiant included a false statement knowingly and intentionally, or with reckless disregard for the truth. Specifically, [describe the false or misleading statements in the affidavit]."),
      ])],
      [paragraph([
        text("\t\tThe alleged false statement(s) are material to the finding of probable cause. If the false material is set aside, the remaining content of the affidavit is insufficient to establish probable cause for the warrant."),
      ])],
      [paragraph([
        text("\t\tUnder "),
        italic("Franks v. Delaware"),
        text(", 438 U.S. 154 (1978), and "),
        italic("Hoop v. State"),
        text(", 121 N.E.3d 1039 (Ind. Ct. App. 2019), the "),
        text(data.defendantRole),
        text(" is entitled to a hearing on this issue."),
      ])],
    ]),
  ],

  "motion-disqualify-judge": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to recuse/disqualify the presiding judge in this matter pursuant to Indiana Code of Judicial Conduct Rule 2.11 and Indiana Criminal Rule 12. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe presiding judge should be disqualified because [the judge has a personal bias or prejudice concerning a party / the judge has personal knowledge of disputed evidentiary facts / other basis]."),
      ])],
      [paragraph([
        text("\t\tSpecifically, [describe the facts giving rise to the appearance of bias or conflict of interest]."),
      ])],
      [paragraph([
        text("\t\tUnder Indiana Code of Judicial Conduct Rule 2.11(A), a judge shall disqualify himself or herself in any proceeding in which the judge's impartiality might reasonably be questioned."),
      ])],
    ]),
  ],

  "motion-elected-judge": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for the appointment of a special judge pursuant to Indiana Criminal Rule 12. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requests a change of judge from the Honorable [Judge Name] in this matter."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Crim. Rule 12, a defendant is entitled to a change of judge as a matter of right if a timely and proper motion is filed."),
      ])],
      [paragraph([
        text("\t\tThis motion is timely filed within thirty (30) days of the initial hearing, and the "),
        text(data.defendantRole), text(" has not previously exercised this right in this cause."),
      ])],
    ]),
  ],

  "motion-continuance": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for a continuance of the "),
      dropdownField("hearing-type", "Hearing Type"),
      text(" currently scheduled for [current date]. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThis matter is currently set for "), dropdownField("hearing-type", "Hearing Type"),
        text(" on [date] at [time]."),
      ])],
      [paragraph([
        text("\t\tA continuance is necessary because [counsel has a scheduling conflict / additional time is needed to prepare / witness unavailability / pending discovery / other good cause]."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" [waives / does not waive] any speedy trial rights implicated by this continuance pursuant to Ind. Crim. Rule 4."),
      ])],
    ]),
  ],

  "motion-interlocutory-appeal": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to certify its Order of [date] for interlocutory appeal pursuant to Indiana Appellate Rule 14(B). In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tOn [date], this Court entered an Order [describe the order — e.g., denying the Motion to Suppress]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. App. Rule 14(B), an interlocutory appeal may be taken from an order if the trial court certifies and the Court of Appeals accepts jurisdiction."),
      ])],
      [paragraph([
        text("\t\tThe order involves a substantial question of law, the resolution of which will (1) promote a more orderly disposition of the case, (2) establish a precedent beneficial to the administration of justice, or (3) substantially reduce the danger of further litigation."),
      ])],
    ]),
  ],

  "motion-garrity": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order suppressing any statements made by the "),
      text(data.defendantRole), text(" under compulsion of employment, pursuant to "),
      italic("Garrity v. New Jersey"),
      text(", 385 U.S. 493 (1967). In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" was employed by [employer] at the time of the investigation giving rise to the charges in this case."),
      ])],
      [paragraph([
        text("\t\tDuring an internal investigation, the "), text(data.defendantRole),
        text(" was compelled to provide statements under threat of termination or other employment consequences."),
      ])],
      [paragraph([
        text("\t\tUnder "),
        italic("Garrity v. New Jersey"),
        text(", 385 U.S. 493 (1967), statements obtained from a public employee under threat of removal from office are involuntary and cannot be used in subsequent criminal proceedings."),
      ])],
    ]),
  ],
};
