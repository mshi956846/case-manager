import { ContactType, MatterStatus, MatterContactRole, Priority, TaskStatus, EventType, InvoiceStatus } from "@prisma/client";

export type { ContactType, MatterStatus, MatterContactRole, Priority, TaskStatus, EventType, InvoiceStatus };

export interface DashboardStats {
  openMatters: number;
  pendingTasks: number;
  unbilledHours: number;
  outstandingInvoices: number;
}
