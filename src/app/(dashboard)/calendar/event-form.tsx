"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarEvent } from "@prisma/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { eventSchema, EventFormValues } from "@/lib/validations/event";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MatterSelect } from "@/components/matter-select";
import { Trash2 } from "lucide-react";

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultDate?: Date | null;
  onDelete?: (id: string) => void;
}

export function EventForm({
  open,
  onOpenChange,
  event,
  defaultDate,
  onDelete,
}: EventFormProps) {
  const router = useRouter();
  const isEditing = !!event;

  const defaultStartDate = event?.startDate
    ? format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm")
    : defaultDate
    ? format(defaultDate, "yyyy-MM-dd'T'09:00")
    : "";

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      startDate: defaultStartDate,
      endDate: event?.endDate
        ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm")
        : "",
      allDay: event?.allDay ?? false,
      type: event?.type ?? "MEETING",
      matterId: event?.matterId ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      const startDate = event?.startDate
        ? format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm")
        : defaultDate
        ? format(defaultDate, "yyyy-MM-dd'T'09:00")
        : "";
      form.reset({
        title: event?.title ?? "",
        description: event?.description ?? "",
        startDate,
        endDate: event?.endDate
          ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm")
          : "",
        allDay: event?.allDay ?? false,
        type: event?.type ?? "MEETING",
        matterId: event?.matterId ?? "",
      });
    }
  }, [open, event, defaultDate, form]);

  async function onSubmit(values: EventFormValues) {
    try {
      const url = isEditing ? `/api/events/${event.id}` : "/api/events";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success(isEditing ? "Event updated" : "Event created");
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
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? "Edit Event" : "New Event"}
            </DialogTitle>
            {isEditing && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => onDelete(event.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
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
                        <SelectItem value="HEARING">Hearing</SelectItem>
                        <SelectItem value="DEADLINE">Deadline</SelectItem>
                        <SelectItem value="MEETING">Meeting</SelectItem>
                        <SelectItem value="REMINDER">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allDay"
                render={({ field }) => (
                  <FormItem className="flex items-end gap-2 pb-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">All Day</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="matterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case (optional)</FormLabel>
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
