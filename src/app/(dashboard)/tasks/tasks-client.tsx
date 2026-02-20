"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Task, Priority, TaskStatus, Matter } from "@prisma/client";
import { MoreHorizontal, Plus, List, LayoutGrid } from "lucide-react";
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
import { TaskForm } from "./task-form";

type TaskWithMatter = Task & {
  matter: { id: string; title: string } | null;
};

const priorityConfig: Record<Priority, { class: string }> = {
  LOW: { class: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300" },
  MEDIUM: { class: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300" },
  HIGH: { class: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300" },
  URGENT: { class: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300" },
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export function TasksClient({ tasks }: { tasks: TaskWithMatter[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [view, setView] = useState<"list" | "board">("list");

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete task");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const columns: ColumnDef<TaskWithMatter>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityConfig[row.original.priority].class}`}>{row.original.priority}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => statusLabels[row.original.status],
    },
    {
      id: "matter",
      header: "Matter",
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
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) =>
        row.original.dueDate
          ? format(new Date(row.original.dueDate), "MMM d, yyyy")
          : "-",
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
  ];

  const boardColumns: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "board" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("board")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {view === "list" ? (
        <DataTable
          columns={columns}
          data={tasks}
          searchKey="title"
          searchPlaceholder="Search tasks..."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {boardColumns.map((status) => (
            <Card key={status}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {statusLabels[status]} (
                  {tasks.filter((t) => t.status === status).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="rounded-md border p-3 text-sm cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => {
                        setEditing(task);
                        setFormOpen(true);
                      }}
                    >
                      <div className="font-medium">{task.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${priorityConfig[task.priority].class}`}>{task.priority}</span>
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(task.dueDate), "MMM d")}
                          </span>
                        )}
                      </div>
                      {task.matter && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {task.matter.title}
                        </div>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {formOpen && (
        <TaskForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditing(null);
          }}
          task={editing}
        />
      )}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Task"
        description="This will permanently delete this task."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
