import * as path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: path.resolve(process.cwd(), ".env"), override: true });

export const COURTLISTENER_API_BASE = "https://www.courtlistener.com/api/rest/v4";
export const COURTLISTENER_TOKEN = process.env.COURTLISTENER_TOKEN || "";

// Indiana courts on CourtListener
export const COURTS = {
  SUPREME_COURT: "ind",
  COURT_OF_APPEALS: "indctapp",
} as const;

export const COURT_ID_MAP: Record<string, "SUPREME_COURT" | "COURT_OF_APPEALS"> = {
  ind: "SUPREME_COURT",
  indctapp: "COURT_OF_APPEALS",
};

// Rate limiting: 1 request per second (well under 5k/hr)
export const REQUEST_DELAY_MS = 1000;

// Pagination
export const PAGE_SIZE = 20;
export const MAX_BACKFILL_PAGES = 500; // ~10,000 opinions max

// Sync state file
export const SYNC_STATE_FILE = path.resolve(__dirname, ".sync-state.json");
