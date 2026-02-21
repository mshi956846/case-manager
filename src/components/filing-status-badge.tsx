import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
  READY: { label: "Ready", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  SUBMITTED: { label: "Submitted", className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100" },
  ACCEPTED: { label: "Accepted", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  RETURNED: { label: "Returned", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
} as const;

interface FilingStatusBadgeProps {
  status: keyof typeof STATUS_CONFIG;
  className?: string;
}

export function FilingStatusBadge({ status, className }: FilingStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
