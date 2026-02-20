"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Calendar,
  Clock,
  FileText,
  FileEdit,
  LogOut,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/matters", label: "Matters", icon: Briefcase },
  { href: "/documents", label: "Documents", icon: FileEdit },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/time-tracking", label: "Time Tracking", icon: Clock },
  { href: "/invoices", label: "Invoices", icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Scale className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-sidebar-primary-foreground">
            Shipman Law
          </span>
          <span className="text-xs text-sidebar-foreground/60">
            Case Manager
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-sidebar-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator className="bg-sidebar-border" />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
