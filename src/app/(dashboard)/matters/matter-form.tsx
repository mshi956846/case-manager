"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Matter } from "@prisma/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { matterSchema, MatterFormValues } from "@/lib/validations/matter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface MatterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matter?: Matter | null;
}

export function MatterForm({ open, onOpenChange, matter }: MatterFormProps) {
  const router = useRouter();
  const isEditing = !!matter;

  const form = useForm<MatterFormValues>({
    resolver: zodResolver(matterSchema),
    defaultValues: {
      title: matter?.title ?? "",
      caseNumber: matter?.caseNumber ?? "",
      status: matter?.status ?? "OPEN",
      practiceArea: matter?.practiceArea ?? "",
      description: matter?.description ?? "",
      openDate: matter?.openDate
        ? format(new Date(matter.openDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      closeDate: matter?.closeDate
        ? format(new Date(matter.closeDate), "yyyy-MM-dd")
        : "",
      statuteOfLimitations: matter?.statuteOfLimitations
        ? format(new Date(matter.statuteOfLimitations), "yyyy-MM-dd")
        : "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: matter?.title ?? "",
        caseNumber: matter?.caseNumber ?? "",
        status: matter?.status ?? "OPEN",
        practiceArea: matter?.practiceArea ?? "",
        description: matter?.description ?? "",
        openDate: matter?.openDate
          ? format(new Date(matter.openDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        closeDate: matter?.closeDate
          ? format(new Date(matter.closeDate), "yyyy-MM-dd")
          : "",
        statuteOfLimitations: matter?.statuteOfLimitations
          ? format(new Date(matter.statuteOfLimitations), "yyyy-MM-dd")
          : "",
      });
    }
  }, [open, matter, form]);

  async function onSubmit(values: MatterFormValues) {
    try {
      const url = isEditing ? `/api/matters/${matter.id}` : "/api/matters";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success(isEditing ? "Case updated" : "Case created");
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
            {isEditing ? "Edit Case" : "New Case"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="caseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="practiceArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Practice Area</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Family Law, Criminal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="openDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="closeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Close Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="statuteOfLimitations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statute of Lim.</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
