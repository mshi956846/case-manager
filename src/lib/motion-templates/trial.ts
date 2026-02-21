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

export const TRIAL_TEMPLATES: Record<string, BodyBuilder> = {
  "motion-jury-demand": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, hereby demands a trial by jury in the above-captioned cause pursuant to the Sixth Amendment to the United States Constitution, Article 1, Section 13 of the Indiana Constitution, and Ind. Code § 35-37-1-2. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole), text(" is charged with [charge], a "),
        dropdownField("offense-level", "Offense Level"), text("."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 35-37-1-2, in all criminal cases where the defendant is charged with a misdemeanor, the defendant may demand a trial by jury by filing a written demand at least ten (10) days before the omnibus date."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" hereby makes a timely demand for jury trial in this cause."),
      ])],
    ]),
  ],

  "motion-reserve-jury": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to reserve the "), text(data.defendantRole),
      text("'s right to a jury trial. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" wishes to preserve the right to a trial by jury while exploring other options including [plea negotiations / bench trial / other dispositions]."),
      ])],
      [paragraph([
        text("\t\tReserving this right does not prejudice either party and preserves the "),
        text(data.defendantRole), text("'s constitutional right to a jury trial under the Sixth and Fourteenth Amendments."),
      ])],
    ]),
  ],

  "motion-waive-jury": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for permission to waive the right to a jury trial and proceed with a bench trial. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(", after consultation with counsel, voluntarily, knowingly, and intelligently waives the right to a trial by jury."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" understands that by waiving a jury trial, the case will be tried to the bench, and the judge alone will determine guilt or innocence."),
      ])],
      [paragraph([
        text("\t\tThe State [consents / does not object] to a bench trial."),
      ])],
    ]),
  ],

  "motion-jury-selection": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court regarding jury selection procedures for the trial of this cause. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requests that the Court implement the following jury selection procedures:"),
      ])],
      [paragraph([
        text("\t\t(a) Individual voir dire on sensitive topics including [pretrial publicity / knowledge of the case / bias regarding specific issues];"),
      ])],
      [paragraph([
        text("\t\t(b) Submission of a written juror questionnaire prior to oral voir dire;"),
      ])],
      [paragraph([
        text("\t\t(c) Sufficient time for meaningful questioning of each prospective juror;"),
      ])],
      [paragraph([
        text("\t\t(d) Attorney-conducted voir dire in addition to Court-conducted questioning."),
      ])],
      [paragraph([
        text("\t\tThese procedures are necessary to ensure the "), text(data.defendantRole),
        text("'s Sixth Amendment right to a fair and impartial jury."),
      ])],
    ]),
  ],

  "motion-jury-unconstitutional": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to declare [specific jury rule or statute] unconstitutional. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\t[Identify the specific jury rule, statute, or practice being challenged] violates the "),
        text(data.defendantRole), text("'s rights under the "),
        dropdownField("constitutional-amendment", "Constitutional Amendment"),
        text(" to the United States Constitution and/or the Indiana Constitution."),
      ])],
      [paragraph([
        text("\t\tSpecifically, [describe how the rule is unconstitutional — e.g., discriminatory application, violation of equal protection, due process concerns]."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" preserves this issue for appellate review."),
      ])],
    ]),
  ],

  "motion-mini-opening": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for permission to deliver a mini opening statement during voir dire. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tA brief opening statement during jury selection will allow the "),
        text(data.defendantRole),
        text(" to provide jurors with sufficient context to give meaningful answers during voir dire questioning."),
      ])],
      [paragraph([
        text("\t\tWithout a brief summary of the case, jurors may not understand the relevance of defense counsel's questions regarding [describe topics — bias, experience with certain types of cases, etc.]."),
      ])],
      [paragraph([
        text("\t\tCourts routinely permit mini opening statements during voir dire to facilitate intelligent jury selection. This practice promotes the "),
        text(data.defendantRole), text("'s Sixth Amendment right to an impartial jury."),
      ])],
    ]),
  ],

  "motion-strike": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to strike [testimony / evidence / allegations] from the record. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tDuring [hearing/trial], [witness name] testified regarding [describe testimony], or the State introduced [describe evidence]."),
      ])],
      [paragraph([
        text("\t\tThis [testimony/evidence] should be stricken because it is [inadmissible hearsay / not relevant / unfairly prejudicial / in violation of a prior court order / not properly disclosed in discovery]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Trial Rule 12(F) and the applicable Indiana Rules of Evidence, the "),
        text(data.defendantRole),
        text(" requests that the Court strike the [testimony/evidence] and instruct the jury to disregard it."),
      ])],
    ]),
  ],

  "motion-objection-instructions": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully objects to the Court's proposed jury instructions and/or the State's tendered jury instructions. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" objects to Proposed Instruction No. [number] because [it misstates the law / it is not supported by the evidence / it is confusing or misleading / it omits essential elements / it is argumentative]."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" tenders alternative Instruction No. [number] which accurately states the applicable law. See "),
        italic("Indiana Pattern Jury Instructions — Criminal"),
        text(" [cite specific instruction]."),
      ])],
      [paragraph([
        text("\t\tThe giving of an erroneous instruction that misleads the jury is reversible error. "),
        italic("Dill v. State"),
        text(", 741 N.E.2d 1230 (Ind. 2001)."),
      ])],
    ]),
  ],

  "motion-specify-exhibits": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to order both parties to specify and exchange trial exhibits in advance of trial. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe trial in this matter is scheduled for [date]."),
      ])],
      [paragraph([
        text("\t\tIn the interest of judicial efficiency and to avoid unnecessary delays during trial, the "),
        text(data.defendantRole),
        text(" requests that both parties be ordered to exchange a list of all exhibits intended to be introduced at trial at least [number] days before the trial date."),
      ])],
      [paragraph([
        text("\t\tPre-marking and pre-identification of exhibits will streamline the trial process and allow for timely resolution of any evidentiary objections."),
      ])],
    ]),
  ],
};
