import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync, mkdirSync, statSync } from "fs";
import { basename, extname, resolve } from "path";

const prisma = new PrismaClient();

const UPLOAD_DIR = resolve(__dirname, "../uploads/documents");

const MOTION_FILES = [
  // Downloads - Case Filings
  "C:/Users/micha/Downloads/Brian Motion to Produce.pdf.pdf",
  "C:/Users/micha/Downloads/Dismiss - Motion.pdf",
  "C:/Users/micha/Downloads/Motion (1).pdf",
  "C:/Users/micha/Downloads/Motion Filed (1).pdf",
  "C:/Users/micha/Downloads/Motion Filed (2).pdf",
  "C:/Users/micha/Downloads/Motion Filed.pdf",
  "C:/Users/micha/Downloads/Motion for Change of Venue Filed.pdf",
  "C:/Users/micha/Downloads/Motion for Continuance of Hearin.pdf",
  "C:/Users/micha/Downloads/Motion for Enlargement of TIme t.pdf",
  "C:/Users/micha/Downloads/Motion for Extension of Time to.pdf",
  "C:/Users/micha/Downloads/Motion for Home Detention Screen.pdf",
  "C:/Users/micha/Downloads/Motion in Limine.pdf",
  "C:/Users/micha/Downloads/Motion to Continue Hearing.pdf.pdf",
  "C:/Users/micha/Downloads/Motion to Dismiss Filed.pdf",
  "C:/Users/micha/Downloads/Motion to Modify Order on Motion.pdf",
  "C:/Users/micha/Downloads/Motion to Proceed In Forma Paupe.pdf",
  "C:/Users/micha/Downloads/Motion to Suppress (1).pdf",
  "C:/Users/micha/Downloads/Motion to Suppress.pdf",
  "C:/Users/micha/Downloads/Motion to Withdraw Request for I.pdf",
  "C:/Users/micha/Downloads/Motion.pdf",
  "C:/Users/micha/Downloads/Objection to State's Motion to A.pdf",
  "C:/Users/micha/Downloads/State's Motion Opposing Continua.pdf",
  // OneDrive - Shipman Law Templates & Case Motions
  "C:/Users/micha/OneDrive - Shipman Law/Documents/Mike's Templates/Motion to Supress-Statement.docx",
  "C:/Users/micha/OneDrive - Shipman Law/Forfeiture/Enlargement of time/Motion Enlargement of time - Hennessy.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/OWI/OWI/Judgment on the Evidence/Motion for a directed verdict Rathburn OWI trial in Hamilton County.docx",
  "C:/Users/micha/OneDrive - Shipman Law/OWI/OWI/License Suspension/Motion to remove license suspensesion 2.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/OWI/OWI/License Suspension/Motion to remove license suspension.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/OWI/OWI/Suppression/motion to supress.pdf.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Post-Trial/Appeal/Motion proceed in forma pauperis for appellate expenses.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Post-Trial/Appeal/Motion to extend time to file appellant's brief.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Post-Trial/Sentence Modification/Motion for Audio Transcript.pdf.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Post-Trial/Sentence Modification/Motion for Release of IDOC Recor.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Post-Trial/Sentence Modification/Motion-Progress Report.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Post-Trial/Sentencing/Motion to File Under Seal.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Post-Trial/Sentencing/Motion to Suppress Confession re Benkert.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Bail/Motion-Bail/Motion modify conditions of bail.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Bail/Motion-Bail/Motion to Modify Condition of Bail.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Bail/Motion-Bail/Motion to Modify Condition of Release-Uliana.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Bail/Motion-Bail/Motion to Revoke Bond.pdf (1).pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Bail/Motion-Bail/Motion-Release bond attorney fees.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Bail/Motion-Bail/Reduce Bail-Ron Moore.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Bail/Motion-Bail/Release-Lack of Probable Cause-Bail.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Child Molesting/Motion in Limine-Child Abuse Syndrome-How kids typically act.docx",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Discovery/Depositions/Motion to Take Depos Public Expense- Uliana.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Discovery/Motion for Discovery-Uliana.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Discovery/Motion to Exclude Late Discovery.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Discovery/Motion-Narrow items prosecution intends to introduce/Motion-Narrow items prosecution intends to introduce at trial.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Grand Jury/Motion to Dismiss-John Kautzman.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-404(b)/Phillip Lee.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Change of Plea Hearing/Motion for Change of Plea-Uliana.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Charging Information/Motion for More Definite Statement.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Discharge/Motion for Discharge.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Dismiss/Beyond One year -Rathburn.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Dismiss/Brief - Motion to Dismiss-Improper charge.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Dismiss/Motion - Charged improperly.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Dismiss/Zaki Ali-Bozarth-Failure to preserve in car video evidence.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Disqualify Judge/Motion Disqualify Judge-Richard Allen.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Drug case/Defendant's Motion to Disclose Identity of and Information related to Confidential Informant.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Elected Judge/Motion-Elected Judge to Preside.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Ex parte hearing - Expert fees/Motion for ex parte hearing on expert fees.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Fee Waiver/signed motion to waive outstanding fees.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Franks hearing/Franks Motion.pdf-1-Richard Allen.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Funds for depositions/Motion for Funds for Depositions.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Funds for depositions/Motion -Funds for court reporter and experts.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Funds hire forensic examiner/Motion for Funds for Forensic Ex.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-In Limine/Motion In Limine - Hennessy.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-In Limine/Motion in Limine-Rape Case.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-In Limine/OWI-Motion in Limine - Rathburn.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-In Limine/Limine - Jud McMillan.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-In Limine/Limine-Jud McMillin 2.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-In Limine/Mot in Limine-Privileged Commun_.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-In Limine/REsponse to STate's motion in limine.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Indigency Determination/Motion indigency determination-Kamish.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Interlocutory Appeal/Motion -Interlocutory Appeal-Voyles.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Interpreter/Rathburn-Motion for Interpreter.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Jury Rule-Unconsitutional/Kamish - Motion to declare jury rule unconstituional.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Quash Subpoena/Fidler Motion to Quash.pdf.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Release DOC Records/Motion for Release of IDOC Recor.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Return Property/Motion for Return of Property-Uliana.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Reveal agreements/Motion to Reveal Agreements Ente.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Speedy Trial/Antoni Williams Demand for Speed (1).pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Motion to Suppress - Traffic Stop-drifting.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Motion to Suppress-Home-Overdose-Lisa Rosenberger.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Motion to Suppress-Information on cell phone.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Motion to Suppress-Memo in support of cell phone results.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Motion to Suppress-NBI.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Motion to Suppress-phone content after warrant.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Motion to Suppress-photo array.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Motion to Supress-Photo array - case law supporting.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Motion to Supress-photo array additional authority.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Olinger (NSC) F2-014 Motion to Suppress.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Rathburn.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Residence-Hennessy.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Ron Moore-Jerem Goodwin 2.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Ron Moore-Jeremy Goodwin.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Search Warrant-Hennessy.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Traffic Stop-Uliana.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Suppress Evidence/Traffic stop.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Transport Order/Motion for Transport Order.pdf (1).pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Travel/Motion for Defendant to Travel-Voyles.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Waive jury/Request to Waive Jury - Hennessy.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Waive jury/Waive Jury-Bill Frederick.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Withdraw/Motion for Leave to Withdraw-Jud McMillin.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Specify exhibits to use at trial.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Pre-Trial/Motions/Motion-Reinstate Firearm/Mathena - Restoration of Firearms - Petition - Mathena - Restoration of Firearms - Verified Petition.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Red Flag/Motion for Continuance of Hearing-Guy Relford.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Red Flag/Motion for Enlargement of TIme.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Red Flag/Motion to Modify Order on Dismissal exclude language of dangerous.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Red Flag/Motion to Stay Firearm Seizure Proceeeding.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Red Flag/Memorandum of Law in Support of Motion to Stay Firearm Seizure Proceeedings.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Tort-Police/Motion to Dismiss/City of Richmond-Motion to Dismiss-Angela Wilson.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Tort-Police/Motion to Dismiss/WSCD-Motion to Dismiss-Angela Wilson.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Tort-Police/Motion to Dismiss/Memorandum in Support MTD-City of Richmond.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Tort-Police/Motion-Amend Complaint/Motion Amend Complaint-Angela Wilson.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Tort-Police/Notice of Removal to federal court/Motion for Removal to federal court.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Tort-Police/Response-Motion to Dismiss/Response to MTD-Angela Wilson.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Traffic/Driver's License Suspension/Motion to Stay Suspension of Driving Privileges.pdf",
  "C:/Users/micha/OneDrive - Shipman Law/Microsoft Copilot Chat Files/Memorandum of Law in Support of Motion to Stay Firearm Seizure Proceeedings.pdf",
];

function getMimeType(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".pdf": return "application/pdf";
    case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".doc": return "application/msword";
    default: return "application/octet-stream";
  }
}

function cleanName(filePath: string): string {
  let name = basename(filePath);
  // Remove double extensions like .pdf.pdf
  if (name.endsWith(".pdf.pdf")) name = name.replace(/\.pdf\.pdf$/, ".pdf");
  if (name.endsWith(".pdf (1).pdf")) name = name.replace(/\.pdf \(1\)\.pdf$/, ".pdf");
  return name;
}

async function main() {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  let imported = 0;
  let skipped = 0;
  const seen = new Set<string>();

  for (const srcPath of MOTION_FILES) {
    if (!existsSync(srcPath)) {
      console.log(`SKIP (not found): ${srcPath}`);
      skipped++;
      continue;
    }

    const name = cleanName(srcPath);

    // Skip duplicates by name
    if (seen.has(name)) {
      console.log(`SKIP (duplicate): ${name}`);
      skipped++;
      continue;
    }
    seen.add(name);

    // Skip temp files
    if (name.startsWith("~$")) {
      skipped++;
      continue;
    }

    const ext = extname(name);
    const stat = statSync(srcPath);
    const destPath = resolve(UPLOAD_DIR, name);

    // Copy file
    copyFileSync(srcPath, destPath);

    // Create DB record
    await prisma.document.create({
      data: {
        name,
        filePath: destPath,
        mimeType: getMimeType(ext),
        sizeBytes: stat.size,
        documentType: "UPLOADED",
      },
    });

    imported++;
    console.log(`OK: ${name}`);
  }

  console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
