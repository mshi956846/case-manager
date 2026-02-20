"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/app-sidebar";

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 bg-card">
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <AppSidebar />
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        {session?.user && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {session.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") ?? <User className="h-4 w-4" />}
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              {session.user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
