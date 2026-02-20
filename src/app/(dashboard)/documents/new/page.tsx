import { DocumentWizard } from "./document-wizard";

export default function NewDocumentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Document</h1>
        <p className="text-muted-foreground">
          Build a document from a template using the step-by-step wizard.
        </p>
      </div>
      <DocumentWizard />
    </div>
  );
}
