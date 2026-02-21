import { PrismaClient } from "@prisma/client";
import { searchOpinions, fetchAllPages, CourtListenerResult } from "./client";
import {
  COURTS,
  COURT_ID_MAP,
  MAX_BACKFILL_PAGES,
  SYNC_STATE_FILE,
} from "./config";
import {
  parseOutcome,
  parseCounty,
  parseOffenseCategory,
  isCriminalDocket,
} from "./parsers";
import * as fs from "fs";

const prisma = new PrismaClient();

interface SyncState {
  lastSyncDate: string | null;
  lastBackfillCursor: string | null;
  backfillComplete: boolean;
}

function loadSyncState(): SyncState {
  try {
    if (fs.existsSync(SYNC_STATE_FILE)) {
      return JSON.parse(fs.readFileSync(SYNC_STATE_FILE, "utf-8"));
    }
  } catch {
    // ignore
  }
  return { lastSyncDate: null, lastBackfillCursor: null, backfillComplete: false };
}

function saveSyncState(state: SyncState): void {
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(state, null, 2));
}

function buildOpinionData(result: CourtListenerResult) {
  const snippet =
    result.opinions?.[0]?.snippet || result.snippet || "";
  const fullText = `${result.caseName} ${snippet}`;

  return {
    courtListenerId: result.cluster_id,
    court: COURT_ID_MAP[result.court_id] || ("COURT_OF_APPEALS" as const),
    caseName: result.caseName || "Unknown",
    docketNumber: result.docketNumber || `CL-${result.cluster_id}`,
    dateFiled: new Date(result.dateFiled),
    authors: result.judge || "",
    panel: result.judge || "",
    outcome: parseOutcome(fullText) as any,
    summary: snippet || null,
    pdfUrl: result.opinions?.[0]?.download_url || null,
    sourceUrl: `https://www.courtlistener.com${result.absolute_url}`,
    county: parseCounty(result.caseName, snippet),
    offenseCategory: parseOffenseCategory(result.caseName, snippet) as any,
    citeCount: result.citeCount || 0,
  };
}

async function upsertOpinion(result: CourtListenerResult): Promise<boolean> {
  const data = buildOpinionData(result);

  try {
    await prisma.appellateOpinion.upsert({
      where: { courtListenerId: data.courtListenerId },
      create: data,
      update: {
        caseName: data.caseName,
        outcome: data.outcome,
        summary: data.summary,
        pdfUrl: data.pdfUrl,
        county: data.county,
        offenseCategory: data.offenseCategory,
        citeCount: data.citeCount,
      },
    });
    return true;
  } catch (err: any) {
    // Handle unique constraint on docketNumber by updating via docketNumber
    if (err.code === "P2002") {
      try {
        await prisma.appellateOpinion.update({
          where: { docketNumber: data.docketNumber },
          data: {
            courtListenerId: data.courtListenerId,
            caseName: data.caseName,
            outcome: data.outcome,
            summary: data.summary,
            pdfUrl: data.pdfUrl,
            county: data.county,
            offenseCategory: data.offenseCategory,
            citeCount: data.citeCount,
          },
        });
        return true;
      } catch {
        // skip duplicates silently
      }
    }
    console.warn(`  Skipping opinion ${data.docketNumber}: ${err.message}`);
    return false;
  }
}

export async function sync(): Promise<void> {
  const state = loadSyncState();
  const courtParam = [COURTS.SUPREME_COURT, COURTS.COURT_OF_APPEALS];

  // Default: look back 30 days if no prior sync
  const filedAfter =
    state.lastSyncDate ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  console.log(`Syncing opinions filed after ${filedAfter}...`);

  const results = await fetchAllPages(
    {
      courts: courtParam,
      filed_after: filedAfter,
      order_by: "dateFiled desc",
    },
    50 // max 50 pages for sync
  );

  console.log(`  Fetched ${results.length} total results from CourtListener.`);

  // Filter to criminal cases
  const criminal = results.filter((r) => isCriminalDocket(r.docketNumber));
  console.log(`  ${criminal.length} criminal appeals (CR docket).`);

  let imported = 0;
  for (const result of criminal) {
    if (await upsertOpinion(result)) imported++;
  }

  console.log(`  Imported/updated ${imported} opinions.`);

  // Update sync state
  state.lastSyncDate = new Date().toISOString().split("T")[0];
  saveSyncState(state);
}

export async function backfill(): Promise<void> {
  const state = loadSyncState();

  if (state.backfillComplete) {
    console.log("Backfill already complete. Use --sync for incremental updates.");
    return;
  }

  const courtParam = [COURTS.SUPREME_COURT, COURTS.COURT_OF_APPEALS];

  console.log("Starting backfill of criminal appellate opinions...");
  console.log("This may take a while with rate limiting. Press Ctrl+C to stop (progress is saved).\n");

  let page = 0;
  let cursor = state.lastBackfillCursor || undefined;
  let totalImported = 0;

  while (page < MAX_BACKFILL_PAGES) {
    try {
      console.log(`  Page ${page + 1}...`);
      const response = await searchOpinions({
        courts: courtParam,
        order_by: "dateFiled desc",
        cursor,
      });

      const criminal = response.results.filter((r) =>
        isCriminalDocket(r.docketNumber)
      );

      let pageImported = 0;
      for (const result of criminal) {
        if (await upsertOpinion(result)) pageImported++;
      }

      totalImported += pageImported;
      console.log(
        `    ${response.results.length} results, ${criminal.length} criminal, ${pageImported} imported.`
      );

      if (!response.next) {
        state.backfillComplete = true;
        saveSyncState(state);
        break;
      }

      // Extract cursor
      const nextUrl = new URL(response.next);
      cursor = nextUrl.searchParams.get("cursor") || undefined;
      if (!cursor) break;

      // Save progress after each page
      state.lastBackfillCursor = cursor;
      saveSyncState(state);

      page++;
    } catch (err: any) {
      console.error(`  Error on page ${page + 1}: ${err.message}`);
      console.log("  Progress saved. Run --backfill again to resume.");
      saveSyncState(state);
      break;
    }
  }

  console.log(`\nBackfill complete. Imported ${totalImported} opinions total.`);
}

export async function status(): Promise<void> {
  const state = loadSyncState();

  const [total, byCourt, byOutcome, recentFive] = await Promise.all([
    prisma.appellateOpinion.count(),
    prisma.appellateOpinion.groupBy({
      by: ["court"],
      _count: { id: true },
    }),
    prisma.appellateOpinion.groupBy({
      by: ["outcome"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.appellateOpinion.findMany({
      take: 5,
      orderBy: { dateFiled: "desc" },
      select: { caseName: true, docketNumber: true, dateFiled: true, outcome: true },
    }),
  ]);

  console.log("=== Appellate Opinions Status ===\n");
  console.log(`Total opinions: ${total}`);
  console.log(`Last sync: ${state.lastSyncDate || "never"}`);
  console.log(`Backfill complete: ${state.backfillComplete ? "yes" : "no"}\n`);

  console.log("By Court:");
  for (const row of byCourt) {
    console.log(`  ${row.court}: ${row._count.id}`);
  }

  console.log("\nBy Outcome:");
  for (const row of byOutcome) {
    console.log(`  ${row.outcome}: ${row._count.id}`);
  }

  if (recentFive.length > 0) {
    console.log("\nMost Recent:");
    for (const op of recentFive) {
      console.log(
        `  ${op.dateFiled.toISOString().split("T")[0]} | ${op.docketNumber} | ${op.outcome} | ${op.caseName.slice(0, 60)}`
      );
    }
  }
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
