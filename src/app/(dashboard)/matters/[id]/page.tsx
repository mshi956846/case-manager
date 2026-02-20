export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const statusConfig: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800 border-blue-200",
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityConfig: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-blue-100 text-blue-800 border-blue-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  URGENT: "bg-red-100 text-red-800 border-red-200",
};

export default async function MatterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matter = await prisma.matter.findUnique({
    where: { id },
    include: {
      contacts: { include: { contact: true } },
      tasks: { orderBy: { createdAt: "desc" } },
      timeEntries: { orderBy: { date: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
      events: { orderBy: { startDate: "asc" } },
    },
  });

  if (!matter) notFound();

  const totalMinutes = matter.timeEntries.reduce(
    (sum, te) => sum + te.durationMinutes,
    0
  );
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/matters">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{matter.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig[matter.status]}`}>{matter.status}</span>
            {matter.caseNumber && (
              <span className="text-sm text-muted-foreground">
                #{matter.caseNumber}
              </span>
            )}
            {matter.practiceArea && (
              <span className="text-sm text-muted-foreground">
                {matter.practiceArea}
              </span>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts ({matter.contacts.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({matter.tasks.length})
          </TabsTrigger>
          <TabsTrigger value="time">
            Time ({totalHours}h)
          </TabsTrigger>
          <TabsTrigger value="documents">
            Docs ({matter.documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Open Date
                </p>
                <p>{format(new Date(matter.openDate), "MMM d, yyyy")}</p>
              </div>
              {matter.closeDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Close Date
                  </p>
                  <p>
                    {format(new Date(matter.closeDate), "MMM d, yyyy")}
                  </p>
                </div>
              )}
              {matter.statuteOfLimitations && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Statute of Limitations
                  </p>
                  <p>
                    {format(
                      new Date(matter.statuteOfLimitations),
                      "MMM d, yyyy"
                    )}
                  </p>
                </div>
              )}
              {matter.description && (
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="whitespace-pre-wrap">{matter.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardContent className="pt-6">
              {matter.contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No contacts linked to this matter.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matter.contacts.map((mc) => (
                      <TableRow key={mc.id}>
                        <TableCell>
                          <Link
                            href={`/contacts/${mc.contact.id}`}
                            className="font-medium hover:underline"
                          >
                            {mc.contact.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{mc.role}</Badge>
                        </TableCell>
                        <TableCell>{mc.contact.email ?? "-"}</TableCell>
                        <TableCell>{mc.contact.phone ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="pt-6">
              {matter.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matter.tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          {task.title}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityConfig[task.priority]}`}>{task.priority}</span>
                        </TableCell>
                        <TableCell>{task.status.replace("_", " ")}</TableCell>
                        <TableCell>
                          {task.dueDate
                            ? format(new Date(task.dueDate), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardContent className="pt-6">
              {matter.timeEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No time entries yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Billable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matter.timeEntries.map((te) => (
                      <TableRow key={te.id}>
                        <TableCell>
                          {format(new Date(te.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{te.description}</TableCell>
                        <TableCell>
                          {Math.floor(te.durationMinutes / 60)}h{" "}
                          {te.durationMinutes % 60}m
                        </TableCell>
                        <TableCell>{te.billable ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              {matter.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No documents yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matter.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {doc.documentType === "WORD_PROCESSOR" ? (
                            <Link
                              href={`/documents/${doc.id}`}
                              className="hover:underline"
                            >
                              {doc.name}
                            </Link>
                          ) : (
                            doc.name
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.documentType === "WORD_PROCESSOR" ? (
                            <Badge variant="outline">Word Processor</Badge>
                          ) : (
                            doc.mimeType ?? "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
