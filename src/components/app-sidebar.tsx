"use client";

import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/matters", label: "Cases", icon: Briefcase },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FileEdit },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/time-tracking", label: "Time Tracking", icon: Clock },
  { href: "/invoices", label: "Invoices", icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div
      className="flex h-full w-64 flex-col text-sidebar-foreground"
      style={{
        background:
          "linear-gradient(180deg, var(--gradient-start), var(--gradient-end))",
      }}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg overflow-hidden shadow-md shadow-indigo-500/25">
          <Image
            src="/icon-indiana-defender.svg"
            alt="Indiana Defender"
            width={44}
            height={44}
            className="h-full w-full"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-sidebar-primary-foreground">
            Indiana Defender
          </span>
          <span className="text-sm text-sidebar-foreground/60">
            Criminal Defense Case Management
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
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  "hover:bg-white/8 hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-white/10 text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                )}
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive && "text-sidebar-primary"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator className="bg-white/10" />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-white/8 hover:text-sidebar-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
