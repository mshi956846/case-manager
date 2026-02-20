import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="bg-dot-pattern flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
