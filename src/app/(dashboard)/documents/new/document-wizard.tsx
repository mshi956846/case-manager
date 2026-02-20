"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { documentWizardSchema, type DocumentWizardValues } from "@/lib/validations/document-wizard";
import { StepIndicator } from "./step-indicator";
import { CategoryStep } from "./steps/category-step";
import { DocumentTypeStep } from "./steps/document-type-step";
import { CaptionStep } from "./steps/caption-step";
import { ReviewStep } from "./steps/review-step";
import type { DocumentCategory } from "@/lib/document-types";

const STEP_FIELDS: Record<number, (keyof DocumentWizardValues)[]> = {
  1: ["category"],
  2: ["documentTypeId"],
  3: ["county", "court", "plaintiffName", "defendantName"],
  4: [],
};

export function DocumentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);

  const form = useForm<DocumentWizardValues>({
    resolver: zodResolver(documentWizardSchema),
    defaultValues: {
      category: undefined,
      documentTypeId: "",
      county: "",
      court: "",
      causeNumber: "",
      judge: "",
      plaintiffName: "State of Indiana",
      plaintiffRole: "Plaintiff",
      defendantName: "",
      defendantRole: "Defendant",
      matterId: "",
    },
  });

  async function validateAndAdvance() {
    const fields = STEP_FIELDS[step];
    if (fields && fields.length > 0) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, 4));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleCategorySelect(category: DocumentCategory) {
    form.setValue("category", category, { shouldValidate: true });
    // Reset document type when category changes
    form.setValue("documentTypeId", "");
    setStep(2);
  }

  function handleDocumentTypeSelect(typeId: string) {
    form.setValue("documentTypeId", typeId, { shouldValidate: true });
    setStep(3);
  }

  async function handleCreate() {
    const valid = await form.trigger();
    if (!valid) return;

    setCreating(true);
    try {
      const data = form.getValues();
      const res = await fetch("/api/documents/from-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ? "Validation failed" : "Failed to create document");
        return;
      }

      const doc = await res.json();
      toast.success("Document created");
      router.push(`/documents/${doc.id}/edit`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <StepIndicator currentStep={step} />

        <Card>
          <CardContent className="pt-6">
            {step === 1 && (
              <CategoryStep
                value={form.watch("category")}
                onSelect={handleCategorySelect}
              />
            )}
            {step === 2 && form.watch("category") && (
              <DocumentTypeStep
                category={form.watch("category")}
                value={form.watch("documentTypeId")}
                onSelect={handleDocumentTypeSelect}
              />
            )}
            {step === 3 && <CaptionStep />}
            {step === 4 && <ReviewStep />}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {step < 3 && (
              <Button onClick={validateAndAdvance}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 3 && (
              <Button onClick={validateAndAdvance}>
                Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 4 && (
              <Button onClick={handleCreate} disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Document
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
