import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar, { AdminSidebar as EnhancedAdminSidebar } from "@/components/AdminSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchBar } from "@/components/SearchBar";
import { cn } from "@/lib/utils";

export const AdminLayout = () => {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <EnhancedAdminSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/70 bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8 md:hidden" />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:block w-72">
                <SearchBar />
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
