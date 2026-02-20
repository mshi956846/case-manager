import { extractText } from "unpdf";
import { readFileSync } from "fs";

const CAPTION_COL = 36;

function stripParens(s) { return s.replace(/\)/g, "").trim(); }
function isEmptyParenLine(l) { const s = l.trim(); return s === ")" || s === "" || s === "vvvvvv"; }
function isDocTitle(t_) { const t = t_.replace/[20182019]/g, "'"/;
  return [/^(MOTION|ORDER|PETITION|BRIEF|MEMORANDUM|AFFIDAVIT|DEMAND|OBJECTION)/i, /^(CITY'S|STATE'S|DEFENDANT'S|PLAINTIFF'S)\s+(MOTION|BRIEF|MEMORANDUM|RESPONSE|OBJECTION)/i, /^MEMORANDUM OF LAW/i].some(p => p.test(t));
}

function parseCaption(lines) {
  const c = { state: "INDIANA", county: "", court: "", division: "", causeNumber: "", ss: false, parties: [] };
  let i = 0;
  while (i < lines.length && /^(Filed:|Clerk$|Page \d)/i.test(lines[i].trim())) i++;
  while (i < lines.length && !lines[i].trim()) i++;
  while (i < lines.length && (/County,\s*Indiana/i.test(lines[i].trim()) || /^\w+\s+(Superior|Circuit|Supreme)\s+Court/i.test(lines[i].trim()))) i++;
  while (i < lines.length && !lines[i].trim()) i++;

  let found = false;
  const lim = Math.min(i + 15, lines.length);
  for (; i < lim; i++) {
    const l = lines[i].trim();
    if (/^STATE OF/i.test(l)) { found = true; break; }
    if (l.length > 0 && !isEmptyParenLine(l)) break;
  }
  if (!found) return { captionData: null, bodyStartIndex: 0 };

  const hdr = [];
  const hs = i;
  let sawCounty = false;
  while (i < lines.length && i < hs + 10) {
    const l = lines[i].trim();
    const cl = stripParens(l);
    if (/^(Plaintiffs?|Defendants?|Respondents?|Petitioners?|Appellees?|Appellants?)[,.\s]*$/i.test(cl) || isDocTitle(cl)) break;
    if (/^v[s]?\.?\s*$/i.test(cl)) break;
    if (hdr.length > 0 && /^STATE OF/i.test(cl) && sawCounty) break;
    if (/^COUNTY OF/i.test(cl)) sawCounty = true;
    if (sawCounty && cl && !/^(COUNTY|STATE|CAUSE|SS|IN THE|\))/i.test(cl) && !/SUPERIOR COURT|CIRCUIT COURT|SUPREME COURT/i.test(cl)) break;
    hdr.push(l);
    i++;
  }

  for (const hl of hdr) {
    const cl = stripParens(hl);
    if (!cl) continue;
    const scm = cl.match(/^STATE OF\s+(\w+)\s+IN THE\s+(.+)/i);
    if (scm) { c.state = scm[1].toUpperCase(); c.court = scm[2].trim(); continue; }
    const so = cl.match(/^STATE OF\s+(\w+)\s*(.*)/i);
    if (so && !c.court) { c.state = so[1].toUpperCase(); const r = so[2].trim(); if (/IN THE/i.test(r)) c.court = r.replace(/^IN THE\s*/i, "").trim(); else if (r) c.court = r; continue; }
    if (/SS:?/i.test(cl) && cl.length < 50) { c.ss = true; const dm = cl.match(/SS:?\s*(.*)/i); if (dm && dm[1].trim()) c.division = dm[1].trim(); continue; }
    if (/^COUNTY OF/i.test(cl)) {
      const cm = cl.match(/^COUNTY OF\s+(\w+)\s*(.*)/i);
      if (cm) { c.county = cm[1].toUpperCase(); const r = cm[2].trim(); if (/CAUSE\s*NO/i.test(r)) { const cn = r.match(/CAUSE\s*NO\.?:?\s*(.*)/i); if (cn) c.causeNumber = cn[1].trim(); } else if (/SS/i.test(r)) { c.ss = true; } }
      continue;
    }
    if (/CAUSE\s*NO/i.test(cl)) { const cn = cl.match(/CAUSE\s*NO\.?:?\s*(.*)/i); if (cn) c.causeNumber = cn[1].trim(); continue; }
  }

  // Parse parties
  let curP = [], lastR = "", plaintiff = null, defs = [], seenV = false;
  while (i < lines.length) {
    const l = lines[i].trim();
    const cl = stripParens(l);
    if (!cl || cl === "vvvvvv") { i++; continue; }
    if (isDocTitle(cl)) break;
    if (/^v[s]?\.?\s*$/i.test(cl)) {
      if (curP.length) { plaintiff = { name: curP.join(" ").replace(/,\s*$/, ""), role: lastR || "Plaintiff" }; curP = []; lastR = ""; }
      seenV = true; i++; continue;
    }
    if (/^(Plaintiffs?|Defendants?|Respondents?|Petitioners?|Appellees?|Appellants?)[,.\s]*$/i.test(cl)) {
      const role = cl.replace(/[s,.\s]+$/i, "").replace(/s$/i, "").trim();
      const isPlural = /s[,.\s]*$/i.test(cl.replace(/[.\s]+$/, ""));
      if (curP.length > 0) {
        if (isPlural && curP.length > 1) {
          for (const p of curP) { const n = p.replace(/,\s*$/, "").trim(); if (n) { if (!seenV && !plaintiff) plaintiff = { name: n, role }; else defs.push({ name: n, role }); } }
        } else {
          const nm = curP.join(" ").replace(/,\s*$/, "");
          if (!seenV) plaintiff = { name: nm, role }; else defs.push({ name: nm, role });
        }
        curP = [];
      }
      lastR = role; i++; continue;
    }
    if (cl.length < 80) { curP.push(cl.replace(/,\s*$/, "")); i++; continue; }
    break;
  }
  if (curP.length) { const nm = curP.join(" ").replace(/,\s*$/, ""); const role = lastR || (seenV ? "Defendant" : "Plaintiff"); if (!seenV && !plaintiff) plaintiff = { name: nm, role }; else defs.push({ name: nm, role }); }
  if (plaintiff) c.parties.push(plaintiff);
  for (const d of defs) c.parties.push(d);
  return { captionData: c, bodyStartIndex: i };
}

function pad(s, n) { return s.padEnd(n); }
function fmtCaption(c) {
  const P = CAPTION_COL, lines = [];
  lines.push(pad("STATE OF " + c.state, P) + ")       IN THE " + c.court.toUpperCase());
  if (c.ss) lines.push(pad("", P) + ")  SS:" + (c.division ? "   " + c.division : ""));
  lines.push(pad("COUNTY OF " + c.county, P) + ")       " + (c.causeNumber ? "CAUSE NO.: " + c.causeNumber : ""));
  lines.push("");
  if (c.parties.length > 0) {
    const p = c.parties[0];
    lines.push(pad(p.name + ",", P) + ")");
    lines.push(pad("     " + p.role + ",", P) + ")");
    lines.push(pad("", P) + ")");
    lines.push(pad("v.", P) + ")");
    lines.push(pad("", P) + ")");
    const defP = c.parties.slice(1);
    for (let d = 0; d < defP.length; d++) {
      lines.push(pad(defP[d].name + ",", P) + ")");
      if (d === defP.length - 1) {
        const rl = defP.length > 1 ? defP[d].role + "s" : defP[d].role;
        lines.push(pad("     " + rl + ".", P) + ")");
      }
    }
  }
  return lines;
}

const files = ["Antoni Williams Demand for Speed (1).pdf", "Brian Motion to Produce.pdf", "City of Richmond-Motion to Dismiss-Angela Wilson.pdf", "Brief - Motion to Dismiss-Improper charge.pdf"];

for (const file of files) {
  try {
    const buf = readFileSync("./uploads/documents/" + file);
    const result = await extractText(new Uint8Array(buf));
    const allLines = [];
    for (const pt of result.text) { for (const l of pt.split("\n")) allLines.push(l); }
    const { captionData, bodyStartIndex } = parseCaption(allLines);
    console.log("=== " + file.substring(0, 50) + " ===");
    if (captionData) {
      console.log("Parties:", captionData.parties.map(p => p.name + " (" + p.role + ")").join(" | "));
      console.log("Caption:");
      fmtCaption(captionData).forEach(l => console.log("|" + l + "|"));
      console.log("Body@" + bodyStartIndex + ":", allLines[bodyStartIndex]?.substring(0, 60));
    } else { console.log("No caption found"); }
    console.log("");
  } catch (e) { console.error(file + ":", e.message); }
}
