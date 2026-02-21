import { Suspense } from "react";
import { Send } from "lucide-react";
import { FilingWizard } from "./filing-wizard";

export default function NewFilingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">New Filing</h1>
          <p className="text-sm text-muted-foreground">
            Prepare a document for filing with the Indiana E-Filing System
          </p>
        </div>
      </div>
      <Suspense>
        <FilingWizard />
      </Suspense>
    </div>
  );
}
