"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { TimeEntry, Matter } from "@prisma/client";
import { MoreHorizontal, Plus, Play, Pause, Square } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TimeEntryForm } from "./time-entry-form";

type TimeEntryWithMatter = TimeEntry & {
  matter: { id: string; title: string } | null;
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function useTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const timerDisplay = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const stop = useCallback(() => {
    setRunning(false);
    const mins = Math.ceil(elapsed / 60);
    setElapsed(0);
    return mins;
  }, [elapsed]);

  return {
    running,
    elapsed,
    timerDisplay,
    elapsedMinutes: Math.ceil(elapsed / 60),
    start: useCallback(() => setRunning(true), []),
    pause: useCallback(() => setRunning(false), []),
    stop,
  };
}

export function TimeTrackingClient({
  entries,
}: {
  entries: TimeEntryWithMatter[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState<number | undefined>();
  const timer = useTimer();

  const totalMinutes = entries.reduce((s, e) => s + e.durationMinutes, 0);
  const billableMinutes = entries
    .filter((e) => e.billable)
    .reduce((s, e) => s + e.durationMinutes, 0);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/time-entries/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Time entry deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete time entry");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const columns: ColumnDef<TimeEntryWithMatter>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy"),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.description}</span>
        ),
      },
      {
        id: "matter",
        header: "Case",
        cell: ({ row }) =>
          row.original.matter ? (
            <Link
              href={`/matters/${row.original.matter.id}`}
              className="hover:underline"
            >
              {row.original.matter.title}
            </Link>
          ) : (
            "-"
          ),
      },
      {
        accessorKey: "durationMinutes",
        header: "Duration",
        cell: ({ row }) => formatDuration(row.original.durationMinutes),
      },
      {
        accessorKey: "hourlyRate",
        header: "Rate",
        cell: ({ row }) => `$${row.original.hourlyRate.toFixed(2)}/hr`,
      },
      {
        accessorKey: "billable",
        header: "Billable",
        cell: ({ row }) =>
          row.original.billable ? (
            <Badge>Yes</Badge>
          ) : (
            <Badge variant="outline">No</Badge>
          ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditing(row.original);
                  setTimerMinutes(undefined);
                  setFormOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteId(row.original.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(totalMinutes)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Billable Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(billableMinutes)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">
                {timer.timerDisplay}
              </span>
              <div className="flex gap-1">
                {!timer.running ? (
                  <Button size="icon" variant="outline" onClick={timer.start}>
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="icon" variant="outline" onClick={timer.pause}>
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="outline"
                  disabled={timer.elapsed === 0}
                  onClick={() => {
                    const mins = timer.stop();
                    if (mins > 0) {
                      setTimerMinutes(mins);
                      setEditing(null);
                      setFormOpen(true);
                    }
                  }}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setTimerMinutes(undefined);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={entries}
        searchKey="description"
        searchPlaceholder="Search time entries..."
      />

      {formOpen && (
        <TimeEntryForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditing(null);
              setTimerMinutes(undefined);
            }
          }}
          entry={editing}
          defaultDuration={timerMinutes}
        />
      )}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Time Entry"
        description="This will permanently delete this time entry."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
