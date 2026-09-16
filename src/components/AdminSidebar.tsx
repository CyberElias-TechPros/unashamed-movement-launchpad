import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Video, FileText, ShoppingBag, Mail, BarChart3, Settings, FileDown, Users, LogOut, Search, Image, Package, Star, Download, ChevronRight, Inbox, CalendarDays, Heart, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "@/components/SearchBar";

interface AdminSidebarProps {
  stats?: {
    totalSubscribers?: number;
    totalTestimonials?: number;
    totalOrders?: number;
    totalProducts?: number;
  };
}

interface AdminMenuItem {
  title: string;
  icon: typeof LayoutDashboard;
  path: string;
  description: string;
  badge?: (stats?: AdminSidebarProps["stats"]) => string | undefined;
}

const menuItems: AdminMenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    description: "Overview & metrics",
  },
  {
    title: "Content",
    icon: FileText,
    path: "/admin/content",
    description: "Pages & sections",
  },
  {
    title: "Media Library",
    icon: Image,
    path: "/admin/media",
    description: "Images & videos",
  },
  {
    title: "Videos",
    icon: Video,
    path: "/admin/videos",
    description: "Embed & manage",
  },
  {
    title: "Products",
    icon: ShoppingBag,
    path: "/admin/products",
    description: "Shop catalog",
    badge: (stats?: AdminSidebarProps["stats"]) => stats?.totalProducts ? `${stats.totalProducts}` : undefined,
  },
  {
    title: "Orders",
    icon: Package,
    path: "/admin/orders",
    description: "Fulfillment",
    badge: (stats?: AdminSidebarProps["stats"]) => stats?.totalOrders ? `${stats.totalOrders}` : undefined,
  },
  {
    title: "Resources",
    icon: FileDown,
    path: "/admin/resources",
    description: "Downloads & guides",
  },
  {
    title: "Reviews",
    icon: Star,
    path: "/admin/reviews",
    description: "Product reviews",
  },
  {
    title: "Testimonials",
    icon: MessageSquareQuote,
    path: "/admin/testimonials",
    description: "Community stories",
    badge: (stats?: AdminSidebarProps["stats"]) => stats?.totalTestimonials ? `${stats.totalTestimonials}` : undefined,
  },
  {
    title: "Events",
    icon: CalendarDays,
    path: "/admin/events",
    description: "Create & manage events",
  },
  {
    title: "Donations",
    icon: Heart,
    path: "/admin/donations",
    description: "Giving & receipts",
  },
  {
    title: "Contacts",
    icon: Inbox,
    path: "/admin/contacts",
    description: "Message inbox",
  },
  {
    title: "Users",
    icon: Users,
    path: "/admin/users",
    description: "Accounts & roles",
  },
  {
    title: "Newsletter",
    icon: Mail,
    path: "/admin/newsletter",
    description: "Subscribers & campaigns",
    badge: (stats?: AdminSidebarProps["stats"]) => stats?.totalSubscribers ? `${stats.totalSubscribers}` : undefined,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
    description: "Insights & reports",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
    description: "Site configuration",
  },
];

export const AdminSidebar = ({ stats }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const currentPath = location.pathname;

  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/50">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
            <span className="font-heading text-lg tracking-wider">T</span>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-lg tracking-wider text-foreground">TTIN Admin</span>
            <span className="text-xs text-muted-foreground">Management Console</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = currentPath === item.path || (item.path !== "/admin/dashboard" && currentPath.startsWith(item.path));
                const badge = typeof item.badge === "function" ? item.badge(stats) : item.badge;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(item.path)}
                      tooltip={item.title}
                      className="h-10"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </SidebarMenuButton>
                    {badge && (
                      <SidebarMenuAction>
                        <Badge variant={isActive ? "secondary" : "outline"} className="h-5 text-[10px] px-1.5 group-data-[collapsible=icon]:hidden">
                          {badge}
                        </Badge>
                      </SidebarMenuAction>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
            Quick Links
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/")}
                  tooltip="View Site"
                  className="h-9"
                >
                  <Search className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden text-sm">View Site</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg border border-sidebar-border">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-heading">
                      {user?.email?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium text-foreground">Administrator</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || "admin@ttin.org"}
                    </span>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                sideOffset={4}
                className="w-[--radix-popper-anchor-width] min-w-56 rounded-lg"
              >
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

interface AdminLayoutProps {
  children: React.ReactNode;
  stats?: AdminSidebarProps["stats"];
  sidebarHeaderExtra?: React.ReactNode;
}

export const AdminLayout = ({ children, stats, sidebarHeaderExtra }: AdminLayoutProps) => {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar stats={stats} />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8" />
              {sidebarHeaderExtra}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <SearchBar />
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminSidebar;
