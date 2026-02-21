import * as cron from "node-cron";
import { sync, disconnect } from "./importer";

console.log("Appellate Opinion Scheduler started.");
console.log("Will sync nightly at 2:00 AM.\n");

// Run at 2:00 AM every day
cron.schedule("0 2 * * *", async () => {
  console.log(`[${new Date().toISOString()}] Starting nightly sync...`);
  try {
    await sync();
    console.log(`[${new Date().toISOString()}] Nightly sync complete.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Sync error:`, err);
  }
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down scheduler...");
  await disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnect();
  process.exit(0);
});
