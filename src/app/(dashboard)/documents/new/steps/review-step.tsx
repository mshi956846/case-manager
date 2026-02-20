"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { findDocumentType } from "@/lib/document-types";
import type { DocumentWizardValues } from "@/lib/validations/document-wizard";

export function ReviewStep() {
  const { watch } = useFormContext<DocumentWizardValues>();

  const category = watch("category");
  const documentTypeId = watch("documentTypeId");
  const county = watch("county");
  const court = watch("court");
  const causeNumber = watch("causeNumber");
  const judge = watch("judge");
  const plaintiffName = watch("plaintiffName");
  const plaintiffRole = watch("plaintiffRole");
  const defendantName = watch("defendantName");
  const defendantRole = watch("defendantRole");

  const docType = findDocumentType(documentTypeId);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review your document</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="outline" className="capitalize">{category}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-right">
                {docType?.parentLabel ? `${docType.parentLabel} — ` : ""}
                {docType?.label}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Court</span>
              <span className="font-medium text-right">{court}</span>
            </div>
            {causeNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cause No.</span>
                <span className="font-medium">{causeNumber}</span>
              </div>
            )}
            {judge && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Judge</span>
                <span className="font-medium">Honorable {judge}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">{plaintiffRole || "Plaintiff"}</span>
              <span className="font-medium">{plaintiffName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{defendantRole || "Defendant"}</span>
              <span className="font-medium">{defendantName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Caption Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Caption Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xs leading-relaxed">
              <table className="w-full">
                <tbody>
                  <CaptionRow left="STATE OF INDIANA" right={`IN THE ${court?.toUpperCase()}`} />
                  <CaptionRow left="" right="" />
                  <CaptionRow left={`COUNTY OF ${county?.toUpperCase()}`} right={causeNumber ? `CAUSE NO. ${causeNumber}` : "CAUSE NO. __________"} />
                  <CaptionRow left="" right={judge ? `HONORABLE ${judge.toUpperCase()}` : ""} />
                  <CaptionRow left={`${plaintiffName?.toUpperCase()},`} right="" />
                  <CaptionRow left={`     ${plaintiffRole || "Plaintiff"},`} right="" />
                  <CaptionRow left="" right="" />
                  <CaptionRow left="          v." right="" />
                  <CaptionRow left="" right="" />
                  <CaptionRow left={`${defendantName?.toUpperCase()},`} right="" />
                  <CaptionRow left={`     ${defendantRole || "Defendant"},`} right="" />
                </tbody>
              </table>

              <div className="mt-4 text-center font-bold">
                {docType?.templateTitle}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CaptionRow({ left, right }: { left: string; right: string }) {
  return (
    <tr>
      <td className="pr-1 whitespace-nowrap">{left || "\u00A0"}</td>
      <td className="px-1 text-center w-4">{")"}</td>
      <td className="pl-1 whitespace-nowrap">{right || "\u00A0"}</td>
    </tr>
  );
}
