export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  CheckSquare,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";

async function getDashboardData() {
  const [
    openMatters,
    pendingTasks,
    unbilledEntries,
    outstandingInvoices,
    recentMatters,
    upcomingTasks,
    upcomingEvents,
    overdueInvoices,
  ] = await Promise.all([
    prisma.matter.count({ where: { status: "OPEN" } }),
    prisma.task.count({ where: { status: { not: "DONE" } } }),
    prisma.timeEntry.aggregate({
      where: { billable: true, invoiceId: null },
      _sum: { durationMinutes: true },
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ["SENT", "OVERDUE"] } },
      _sum: { total: true },
    }),
    prisma.matter.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        contacts: {
          where: { role: "CLIENT" },
          include: { contact: { select: { name: true } } },
          take: 1,
        },
      },
    }),
    prisma.task.findMany({
      where: { status: { not: "DONE" }, dueDate: { not: null } },
      take: 5,
      orderBy: { dueDate: "asc" },
      include: { matter: { select: { title: true } } },
    }),
    prisma.calendarEvent.findMany({
      where: { startDate: { gte: new Date() } },
      take: 5,
      orderBy: { startDate: "asc" },
    }),
    prisma.invoice.findMany({
      where: { status: "OVERDUE" },
      take: 5,
      orderBy: { dueDate: "asc" },
      include: { contact: { select: { name: true } } },
    }),
  ]);

  return {
    stats: {
      openMatters,
      pendingTasks,
      unbilledHours:
        Math.round(((unbilledEntries._sum.durationMinutes ?? 0) / 60) * 10) /
        10,
      outstandingInvoices: outstandingInvoices._sum.total ?? 0,
    },
    recentMatters,
    upcomingTasks,
    upcomingEvents,
    overdueInvoices,
  };
}

const statusConfig: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800 border-blue-300",
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  CLOSED: "bg-gray-100 text-gray-800 border-gray-300",
};

const priorityConfig: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-300",
  MEDIUM: "bg-blue-100 text-blue-800 border-blue-300",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300",
  URGENT: "bg-red-100 text-red-800 border-red-300",
};

export default async function DashboardPage() {
  const { stats, recentMatters, upcomingTasks, upcomingEvents, overdueInvoices } =
    await getDashboardData();

  const statCards = [
    {
      title: "Open Matters",
      value: stats.openMatters,
      icon: Briefcase,
      iconColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      borderColor: "border-l-blue-500",
      valueColor: "text-blue-700 dark:text-blue-300",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: CheckSquare,
      iconColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      borderColor: "border-l-amber-500",
      valueColor: "text-amber-700 dark:text-amber-300",
    },
    {
      title: "Unbilled Hours",
      value: stats.unbilledHours,
      icon: Clock,
      iconColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
      borderColor: "border-l-purple-500",
      valueColor: "text-purple-700 dark:text-purple-300",
    },
    {
      title: "Outstanding",
      value: `$${stats.outstandingInvoices.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: FileText,
      iconColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      borderColor: "border-l-emerald-500",
      valueColor: "text-emerald-700 dark:text-emerald-300",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className={`border-l-4 ${card.borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconColor}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-t-2 border-t-blue-500/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Matters
              <Link
                href="/matters"
                className="group flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-primary"
              >
                View all
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMatters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matters yet.</p>
            ) : (
              <div className="space-y-3">
                {recentMatters.map((matter) => (
                  <Link
                    key={matter.id}
                    href={`/matters/${matter.id}`}
                    className="flex items-center justify-between rounded-md border p-3 transition-all hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <div>
                        <div className="text-sm font-medium">{matter.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {matter.contacts[0]?.contact.name ?? "No client"}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig[matter.status]}`}>{matter.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-amber-500/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Upcoming Tasks
              <Link
                href="/tasks"
                className="group flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-primary"
              >
                View all
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming tasks.</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <div>
                        <div className="text-sm font-medium">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {task.matter?.title ?? "No matter"}
                          {task.dueDate &&
                            ` - Due ${format(new Date(task.dueDate), "MMM d")}`}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityConfig[task.priority]}`}>{task.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-purple-500/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Upcoming Events
              <Link
                href="/calendar"
                className="group flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-primary"
              >
                View all
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      <div>
                        <div className="text-sm font-medium">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.startDate), "MMM d, yyyy h:mm a")}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-red-500/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Overdue Invoices
              <Link
                href="/invoices"
                className="group flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-primary"
              >
                View all
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No overdue invoices.
              </p>
            ) : (
              <div className="space-y-3">
                {overdueInvoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between rounded-md border p-3 transition-all hover:border-red-200 hover:bg-red-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <div>
                        <div className="text-sm font-medium">
                          {inv.invoiceNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {inv.contact?.name ?? "No client"}
                          {inv.dueDate &&
                            ` - Due ${format(new Date(inv.dueDate), "MMM d")}`}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-destructive">
                      ${inv.total.toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
