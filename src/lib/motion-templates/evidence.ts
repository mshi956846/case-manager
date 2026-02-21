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

export const EVIDENCE_TEMPLATES: Record<string, BodyBuilder> = {
  "motion-suppress": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to suppress evidence obtained in violation of the "),
      text(data.defendantRole), text("'s constitutional rights. The basis for suppression is: "),
      dropdownField("suppression-basis", "Suppression Basis"), text(". In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tOn or about [date], law enforcement officers [describe the search, seizure, or interrogation]."),
      ])],
      [paragraph([
        text("\t\tThe evidence obtained as a result of this [search/seizure/interrogation] should be suppressed because [describe the constitutional violation]."),
      ])],
      [paragraph([
        text("\t\tThe exclusionary rule requires suppression of evidence obtained in violation of the Fourth Amendment to the United States Constitution and Article 1, Section 11 of the Indiana Constitution. "),
        italic("Mapp v. Ohio"),
        text(", 367 U.S. 643 (1961); "),
        italic("Litchfield v. State"),
        text(", 824 N.E.2d 356 (Ind. 2005)."),
      ])],
    ]),
  ],

  "motion-suppress-statement": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to suppress any and all statements attributed to the "),
      text(data.defendantRole), text(" obtained in violation of the Fifth and Sixth Amendments to the United States Constitution, Article 1, Sections 13 and 14 of the Indiana Constitution, and "),
      italic("Miranda v. Arizona"),
      text(", 384 U.S. 436 (1966). In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tOn or about [date], law enforcement officers interrogated the "), text(data.defendantRole),
        text(" while "), text(data.defendantRole === "Defendant" ? "he/she" : "they"),
        text(" was in custody."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" was not properly advised of "), text(data.defendantRole === "Defendant" ? "his/her" : "their"),
        text(" Miranda rights prior to the interrogation, or alternatively, the "),
        text(data.defendantRole), text(" invoked "),
        text(data.defendantRole === "Defendant" ? "his/her" : "their"),
        text(" right to remain silent and/or right to counsel, and the interrogation continued."),
      ])],
      [paragraph([
        text("\t\tAny statements obtained in violation of "),
        italic("Miranda"),
        text(" must be suppressed, along with any evidence derived therefrom as fruit of the poisonous tree. "),
        italic("Wong Sun v. United States"),
        text(", 371 U.S. 471 (1963)."),
      ])],
      [paragraph([
        text("\t\tAdditionally, under Indiana law, the voluntariness of a statement is determined by examining the totality of the circumstances. "),
        italic("Carter v. State"),
        text(", 730 N.E.2d 155 (Ind. 2000). The "),
        text(data.defendantRole), text("'s statement was involuntary because [describe coercive circumstances]."),
      ])],
    ]),
  ],

  "motion-suppress-evidence": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to suppress all physical evidence seized in this case as the product of an unlawful search and seizure in violation of the Fourth Amendment and Article 1, Section 11 of the Indiana Constitution. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tOn or about [date], law enforcement officers conducted a search of [location/vehicle/person] and seized [describe evidence]."),
      ])],
      [paragraph([
        text("\t\tThe search was conducted without a warrant and does not fall within any recognized exception to the warrant requirement. The State bears the burden of proving that the warrantless search was justified. "),
        italic("Krise v. State"),
        text(", 746 N.E.2d 957 (Ind. 2001)."),
      ])],
      [paragraph([
        text("\t\tUnder the separate analysis required by Article 1, Section 11 of the Indiana Constitution, the Court must evaluate the reasonableness of the police conduct under the totality of the circumstances. "),
        italic("Litchfield v. State"),
        text(", 824 N.E.2d 356 (Ind. 2005)."),
      ])],
    ]),
  ],

  "motion-suppress-identification": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to suppress identification testimony as the product of an unduly suggestive identification procedure in violation of the Due Process Clause of the Fourteenth Amendment. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tOn or about [date], law enforcement officers conducted a [show-up/photo array/lineup] identification procedure involving the "), text(data.defendantRole), text("."),
      ])],
      [paragraph([
        text("\t\tThe identification procedure was unduly suggestive because [describe the suggestive aspects — e.g., single photo, suggestive instructions, only suspect matching description, etc.]."),
      ])],
      [paragraph([
        text("\t\tUnder the two-part test established in "),
        italic("Manson v. Brathwaite"),
        text(", 432 U.S. 98 (1977), and adopted in "),
        italic("Serano v. State"),
        text(", 555 N.E.2d 487 (Ind. 1990), the identification must be suppressed if the procedure was so impermissibly suggestive as to give rise to a very substantial likelihood of irreparable misidentification."),
      ])],
    ]),
  ],

  "motion-suppress-search": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to suppress all evidence obtained as a result of the illegal search and seizure conducted on or about [date] in violation of the Fourth Amendment to the United States Constitution and Article 1, Section 11 of the Indiana Constitution. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tLaw enforcement officers conducted a [traffic stop/search of residence/search of vehicle/pat-down search] of the "),
        text(data.defendantRole), text(" on or about [date] at [location]."),
      ])],
      [paragraph([
        text("\t\tThe [stop/search/seizure] lacked probable cause and/or reasonable suspicion. The officers did not have a valid warrant, and no exception to the warrant requirement applies."),
      ])],
      [paragraph([
        text("\t\tUnder the Fourth Amendment and "),
        italic("Terry v. Ohio"),
        text(", 392 U.S. 1 (1968), an officer must have at least reasonable suspicion of criminal activity to justify a stop, and probable cause to conduct a search. Neither standard was met here."),
      ])],
      [paragraph([
        text("\t\tUnder Indiana's separate constitutional analysis pursuant to "),
        italic("Litchfield v. State"),
        text(", 824 N.E.2d 356 (Ind. 2005), the Court considers: (1) the degree of concern, suspicion, or knowledge that a violation has occurred; (2) the degree of intrusion the method of the search or seizure imposes on the individual's ordinary activities; and (3) the extent of law enforcement needs."),
      ])],
    ]),
  ],

  "motion-suppress-breath-blood": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to suppress the results of the breath/blood test administered on or about [date]. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tOn or about [date], law enforcement administered a [breath/blood] test to the "),
        text(data.defendantRole), text(" at [location]."),
      ])],
      [paragraph([
        text("\t\tThe test results should be suppressed because [the test was not administered in compliance with Ind. Code § 9-30-6 / the testing device was not properly certified or maintained / the operator was not certified / the blood draw was performed without proper legal authority / the implied consent advisement was defective]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 9-30-6-6, a chemical test must be administered in accordance with the rules adopted by the Indiana Department of Toxicology. Failure to comply renders the results inadmissible. "),
        italic("State v. Bisard"),
        text(", 973 N.E.2d 1229 (Ind. Ct. App. 2012)."),
      ])],
    ]),
  ],

  "motion-limine": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order in Limine prohibiting the State from introducing the following evidence at trial pursuant to "),
      dropdownField("evidence-rule", "Evidence Rule"),
      text(". In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State should be prohibited from introducing [describe evidence] because such evidence is [irrelevant / unfairly prejudicial / hearsay / improper character evidence / etc.]."),
      ])],
      [paragraph([
        text("\t\tUnder Indiana Rule of Evidence 403, relevant evidence may be excluded if its probative value is substantially outweighed by the danger of unfair prejudice, confusion of the issues, misleading the jury, undue delay, or needless presentation of cumulative evidence."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requests that the Court order the State and its witnesses not to mention, refer to, or attempt to introduce [the described evidence] without first obtaining leave of Court outside the presence of the jury."),
      ])],
    ]),
  ],

  "motion-limine-prior-bad-acts": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order in Limine excluding evidence of prior bad acts pursuant to Indiana Rule of Evidence 404(b). In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State intends to introduce evidence of [describe prior bad acts evidence] at trial."),
      ])],
      [paragraph([
        text("\t\tIndiana Rule of Evidence 404(b)(1) prohibits evidence of a crime, wrong, or other act to prove a person's character in order to show that on a particular occasion the person acted in accordance with the character."),
      ])],
      [paragraph([
        text("\t\tThe evidence does not fall within any of the permissible purposes listed in Rule 404(b)(2) (motive, opportunity, intent, preparation, plan, knowledge, identity, absence of mistake, or lack of accident), or if it does, its probative value is substantially outweighed by the danger of unfair prejudice under Rule 403."),
      ])],
      [paragraph([
        text("\t\tThe Indiana Supreme Court has consistently held that 404(b) evidence must be relevant for a purpose other than to show propensity, and the court must balance probative value against prejudice. "),
        italic("Hicks v. State"),
        text(", 690 N.E.2d 215 (Ind. 1997)."),
      ])],
    ]),
  ],

  "motion-limine-character": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order in Limine excluding improper character evidence pursuant to Indiana Rule of Evidence 404(a). In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State should be prohibited from introducing evidence of the "), text(data.defendantRole),
        text("'s character or character traits to prove action in conformity therewith on the occasion in question."),
      ])],
      [paragraph([
        text("\t\tIndiana Rule of Evidence 404(a)(1) prohibits the prosecution from initiating evidence of the defendant's character trait unless the defendant first opens the door."),
      ])],
    ]),
  ],

  "motion-limine-hearsay": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for an Order in Limine excluding hearsay testimony pursuant to Indiana Rules of Evidence 801 and 802. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State intends to introduce out-of-court statements made by [declarant] through the testimony of [witness]. These statements are offered for the truth of the matter asserted and constitute inadmissible hearsay under Ind. R. Evid. 801 and 802."),
      ])],
      [paragraph([
        text("\t\tNo exception to the hearsay rule under Rules 803 or 804 applies to these statements."),
      ])],
      [paragraph([
        text("\t\tAdmission of these statements would also violate the "), text(data.defendantRole),
        text("'s rights under the Confrontation Clause of the Sixth Amendment. "),
        italic("Crawford v. Washington"),
        text(", 541 U.S. 36 (2004)."),
      ])],
    ]),
  ],

  "motion-brady": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to order the State to disclose all exculpatory and impeachment evidence pursuant to "),
      italic("Brady v. Maryland"),
      text(", 373 U.S. 83 (1963), and its progeny. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tUnder "), italic("Brady v. Maryland"),
        text(", 373 U.S. 83 (1963), the prosecution has a constitutional duty to disclose evidence favorable to the accused that is material to guilt or punishment."),
      ])],
      [paragraph([
        text("\t\tThis duty extends to impeachment evidence. "),
        italic("Giglio v. United States"),
        text(", 405 U.S. 150 (1972)."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" specifically requests disclosure of: (a) any evidence tending to negate the guilt of the accused; (b) any evidence that would reduce the punishment of the accused; (c) any evidence affecting the credibility of State's witnesses, including prior inconsistent statements, criminal records, pending charges, promises or inducements, and any agreements with the State; (d) any police reports or notes not previously disclosed; and (e) any exculpatory results of scientific tests or experiments."),
      ])],
    ]),
  ],

  "motion-produce-evidence": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to order the State to produce the following evidence for inspection and testing. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requests that the State produce the following physical evidence for inspection, testing, and/or copying: [describe evidence requested]."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. Code § 35-36-2-1 and Indiana Trial Rule 34, the "), text(data.defendantRole),
        text(" is entitled to inspect and test physical evidence in the State's possession that is material to the defense."),
      ])],
    ]),
  ],

  "motion-prelim-admissibility": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for a preliminary hearing on the admissibility of evidence pursuant to Indiana Rule of Evidence 104. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State intends to introduce [describe evidence] at trial. The admissibility of this evidence is in dispute."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. R. Evid. 104(a), the Court must determine preliminary questions concerning the admissibility of evidence. The "),
        text(data.defendantRole), text(" requests that such determination be made outside the hearing of the jury pursuant to Rule 104(c)."),
      ])],
    ]),
  ],

  "motion-third-party-defense": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court for permission to present evidence of third-party culpability at trial. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" intends to present evidence that a third party, [name or description], committed the charged offense."),
      ])],
      [paragraph([
        text("\t\tThe evidence supporting this defense includes [describe evidence — witness testimony, physical evidence, opportunity, motive, etc.]."),
      ])],
      [paragraph([
        text("\t\tEvidence of third-party guilt is admissible when it raises a reasonable inference of the defendant's innocence. "),
        italic("Harrison v. State"),
        text(", 644 N.E.2d 1243 (Ind. 1995). The evidence need not definitively prove that someone else committed the crime; it need only create a reasonable doubt."),
      ])],
    ]),
  ],

  "motion-narrow-exhibits": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to narrow the exhibits that the State intends to introduce at trial. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State has listed [number] proposed exhibits. Many of these exhibits are cumulative, duplicative, or irrelevant to the issues at trial."),
      ])],
      [paragraph([
        text("\t\tPursuant to Ind. R. Evid. 403, even relevant evidence should be excluded when its probative value is substantially outweighed by undue delay or needless presentation of cumulative evidence."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" requests that the Court require the State to narrow its exhibit list and exclude [describe specific exhibits or categories]."),
      ])],
    ]),
  ],

  "motion-cross-exam-lab": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to compel the attendance of the laboratory report author for cross-examination at trial pursuant to the Confrontation Clause of the Sixth Amendment. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe State intends to introduce a laboratory report prepared by [analyst name] of [laboratory] at trial."),
      ])],
      [paragraph([
        text("\t\tPursuant to "),
        italic("Melendez-Diaz v. Massachusetts"),
        text(", 557 U.S. 305 (2009), and "),
        italic("Bullcoming v. New Mexico"),
        text(", 564 U.S. 647 (2011), forensic laboratory reports are testimonial evidence subject to the Confrontation Clause. The analyst who prepared the report must testify at trial and be subject to cross-examination."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" demands the right to confront and cross-examine the analyst who actually conducted the testing and prepared the report at issue."),
      ])],
    ]),
  ],

  "motion-officer-cell": (data) => [
    paragraph([
      text("\t\tThe "), text(data.defendantRole), text(", "), text(data.defendantName),
      text(", by counsel, respectfully moves this Court to order the inspection of the arresting/investigating officer's cellular telephone records and personal device for evidence relevant to the defense. In support thereof:"),
    ]),
    emptyParagraph(),
    orderedList([
      [paragraph([
        text("\t\tThe investigating officer(s) in this case may have communicated via personal cell phone regarding the investigation, stop, or arrest of the "), text(data.defendantRole), text("."),
      ])],
      [paragraph([
        text("\t\tSuch communications may contain exculpatory evidence, impeachment material, or evidence of the officer's activities and attention at the time of the relevant events (e.g., texting while driving/observing the "),
        text(data.defendantRole), text(")."),
      ])],
      [paragraph([
        text("\t\tThe "), text(data.defendantRole),
        text(" has a constitutional right to obtain favorable evidence in the State's possession or control. "),
        italic("Brady v. Maryland"),
        text(", 373 U.S. 83 (1963). The "), text(data.defendantRole),
        text(" requests an in camera inspection of the officer's phone records for the relevant time period."),
      ])],
    ]),
  ],
};
