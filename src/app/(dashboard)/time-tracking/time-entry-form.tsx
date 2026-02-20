"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimeEntry } from "@prisma/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  timeEntrySchema,
  TimeEntryFormValues,
} from "@/lib/validations/time-entry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MatterSelect } from "@/components/matter-select";

interface TimeEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: TimeEntry | null;
  defaultDuration?: number;
}

export function TimeEntryForm({
  open,
  onOpenChange,
  entry,
  defaultDuration,
}: TimeEntryFormProps) {
  const router = useRouter();
  const isEditing = !!entry;

  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      description: entry?.description ?? "",
      date: entry?.date
        ? format(new Date(entry.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      durationMinutes: defaultDuration ?? entry?.durationMinutes ?? 60,
      hourlyRate: entry?.hourlyRate ?? 0,
      billable: entry?.billable ?? true,
      matterId: entry?.matterId ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        description: entry?.description ?? "",
        date: entry?.date
          ? format(new Date(entry.date), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        durationMinutes: defaultDuration ?? entry?.durationMinutes ?? 60,
        hourlyRate: entry?.hourlyRate ?? 0,
        billable: entry?.billable ?? true,
        matterId: entry?.matterId ?? "",
      });
    }
  }, [open, entry, defaultDuration, form]);

  async function onSubmit(values: TimeEntryFormValues) {
    try {
      const url = isEditing
        ? `/api/time-entries/${entry.id}`
        : "/api/time-entries";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success(isEditing ? "Entry updated" : "Entry created");
        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ? String(data.error) : "Something went wrong");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Time Entry" : "New Time Entry"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate ($/hr)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="billable"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Billable</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="matterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matter (optional)</FormLabel>
                  <FormControl>
                    <MatterSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
