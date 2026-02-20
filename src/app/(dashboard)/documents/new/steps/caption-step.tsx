"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { INDIANA_COUNTIES, getCourtsForCounty, getCauseNumberPrefix } from "@/lib/indiana-courts";
import { MatterSelect } from "@/components/matter-select";
import type { DocumentWizardValues } from "@/lib/validations/document-wizard";

export function CaptionStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<DocumentWizardValues>();

  const county = watch("county");
  const court = watch("court");
  const causeNumber = watch("causeNumber");
  const plaintiffName = watch("plaintiffName");
  const plaintiffRole = watch("plaintiffRole");
  const defendantName = watch("defendantName");
  const defendantRole = watch("defendantRole");

  const courts = county ? getCourtsForCounty(county) : [];

  function handleCountyChange(value: string) {
    setValue("county", value, { shouldValidate: true });
    setValue("court", "", { shouldValidate: false });
    setValue("causeNumber", "");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Enter caption details</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Fields */}
        <div className="space-y-4">
          {/* Court Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Court Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>County</Label>
                <Select value={county || ""} onValueChange={handleCountyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIANA_COUNTIES.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.county && <p className="text-sm text-destructive">{errors.county.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Court</Label>
                <Select
                  value={court || ""}
                  onValueChange={(v) => {
                    setValue("court", v, { shouldValidate: true });
                    const prefix = getCauseNumberPrefix(v);
                    if (prefix) {
                      setValue("causeNumber", prefix);
                    }
                  }}
                  disabled={!county}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={county ? "Select court..." : "Select county first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.court && <p className="text-sm text-destructive">{errors.court.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Cause Number</Label>
              <Input
                placeholder="e.g. 89D03-2401-F5-000123"
                value={causeNumber || ""}
                onChange={(e) => setValue("causeNumber", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Parties */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Parties</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Plaintiff Name</Label>
                <Input
                  placeholder="State of Indiana"
                  value={plaintiffName || ""}
                  onChange={(e) => setValue("plaintiffName", e.target.value, { shouldValidate: true })}
                />
                {errors.plaintiffName && <p className="text-sm text-destructive">{errors.plaintiffName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Plaintiff Role</Label>
                <Input
                  placeholder="Plaintiff"
                  value={plaintiffRole || "Plaintiff"}
                  onChange={(e) => setValue("plaintiffRole", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Defendant Name</Label>
                <Input
                  placeholder="John Doe"
                  value={defendantName || ""}
                  onChange={(e) => setValue("defendantName", e.target.value, { shouldValidate: true })}
                />
                {errors.defendantName && <p className="text-sm text-destructive">{errors.defendantName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Defendant Role</Label>
                <Input
                  placeholder="Defendant"
                  value={defendantRole || "Defendant"}
                  onChange={(e) => setValue("defendantRole", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Matter Link */}
          <div className="space-y-1.5">
            <Label>Link to Matter (optional)</Label>
            <MatterSelect
              value={watch("matterId") || ""}
              onValueChange={(v) => setValue("matterId", v)}
            />
          </div>
        </div>

        {/* Live Caption Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Caption Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <CaptionPreview
              county={county}
              court={court}
              causeNumber={causeNumber}
              plaintiffName={plaintiffName}
              plaintiffRole={plaintiffRole}
              defendantName={defendantName}
              defendantRole={defendantRole}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CaptionPreview({
  county,
  court,
  causeNumber,
  plaintiffName,
  plaintiffRole,
  defendantName,
  defendantRole,
}: {
  county?: string;
  court?: string;
  causeNumber?: string;
  plaintiffName?: string;
  plaintiffRole?: string;
  defendantName?: string;
  defendantRole?: string;
}) {
  const left = [
    "STATE OF INDIANA",
    "",
    county ? `COUNTY OF ${county.toUpperCase()}` : "COUNTY OF __________",
    "",
    plaintiffName ? `${plaintiffName.toUpperCase()},` : "__________,",
    `     ${plaintiffRole || "Plaintiff"},`,
    "",
    "          v.",
    "",
    defendantName ? `${defendantName.toUpperCase()},` : "__________,",
    `     ${defendantRole || "Defendant"},`,
  ];

  const right = [
    court ? `IN THE ${court.toUpperCase()}` : "IN THE __________ COURT",
    "",
    causeNumber ? `CAUSE NO. ${causeNumber}` : "CAUSE NO. __________",
    "", "", "", "", "", "", "", "",
  ];

  return (
    <div className="font-mono text-xs leading-relaxed">
      <table className="w-full">
        <tbody>
          {left.map((l, i) => (
            <tr key={i}>
              <td className="pr-1 whitespace-nowrap">{l || "\u00A0"}</td>
              <td className="px-1 text-center w-4">{")"}</td>
              <td className="pl-1 whitespace-nowrap">{right[i] || "\u00A0"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
