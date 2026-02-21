import { sync, backfill, status, disconnect } from "./importer";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case "--sync":
      await sync();
      break;
    case "--backfill":
      await backfill();
      break;
    case "--status":
      await status();
      break;
    default:
      console.log("Appellate Opinion Importer");
      console.log("Usage:");
      console.log("  --sync       Sync recent criminal appellate opinions");
      console.log("  --backfill   Backfill historical opinions (resumable)");
      console.log("  --status     Show import status and counts");
      break;
  }
}

main()
  .catch(console.error)
  .finally(disconnect);
