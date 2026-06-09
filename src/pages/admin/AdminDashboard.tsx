import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";
import { TrendingUp, Eye, Users, FileDown, ShoppingBag, Star, Mail, Video, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  totalSubscribers: number;
  totalDownloads: number;
  totalViews: number;
  totalTestimonials: number;
  totalProducts: number;
  totalOrders: number;
  totalReviews: number;
}

interface RecentActivity {
  action: string;
  time: string;
  icon: "eye" | "users" | "star" | "mail" | "shopping" | "file";
  type: "success" | "warning" | "info" | "error";
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api.get<DashboardStats>("/analytics/dashboard"),
  });

  const quickActions = [
    { label: "Add Product", icon: ShoppingBag, path: "/admin/products", color: "bg-blue-500/10 text-blue-600" },
    { label: "Add Video", icon: Video, path: "/admin/videos", color: "bg-purple-500/10 text-purple-600" },
    { label: "Send Newsletter", icon: Mail, path: "/admin/newsletter", color: "bg-amber-500/10 text-amber-600" },
    { label: "View Analytics", icon: TrendingUp, path: "/admin/analytics", color: "bg-green-500/10 text-green-600" },
  ];

  const recentActivity: RecentActivity[] = [
    { action: "New subscriber joined", time: "2 minutes ago", icon: "mail", type: "success" },
    { action: "Product purchased: Unashamed T-Shirt", time: "15 minutes ago", icon: "shopping", type: "info" },
    { action: "Testimonial submitted by Sarah M.", time: "1 hour ago", icon: "star", type: "success" },
    { action: "Resource downloaded: Prayer Guide", time: "2 hours ago", icon: "file", type: "info" },
    { action: "Video watched: Episode 12", time: "3 hours ago", icon: "eye", type: "info" },
    { action: "New order received #2847", time: "5 hours ago", icon: "shopping", type: "warning" },
  ];

  const iconMap: Record<string, React.ElementType> = {
    mail: Mail,
    shopping: ShoppingBag,
    star: Star,
    file: FileDown,
    eye: Eye,
    users: Users,
  };

  const typeStyles: Record<string, string> = {
    success: "bg-green-500/10 text-green-600",
    info: "bg-blue-500/10 text-blue-600",
    warning: "bg-amber-500/10 text-amber-600",
    error: "bg-red-500/10 text-red-600",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.email || "Administrator"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")}>
            <TrendingUp className="mr-2 h-4 w-4" />
            View Site
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Page Views", value: stats?.totalViews?.toLocaleString() ?? "0", change: "+24%", up: true, icon: Eye, color: "text-purple-600 bg-purple-500/10" },
          { label: "Subscribers", value: stats?.totalSubscribers?.toLocaleString() ?? "0", change: "+12%", up: true, icon: Users, color: "text-green-600 bg-green-500/10" },
          { label: "Downloads", value: stats?.totalDownloads?.toLocaleString() ?? "0", change: "+8%", up: true, icon: FileDown, color: "text-amber-600 bg-amber-500/10" },
          { label: "Testimonials", value: stats?.totalTestimonials?.toLocaleString() ?? "0", change: "+5%", up: true, icon: Star, color: "text-pink-600 bg-pink-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-heading tracking-wider">{stat.value}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <span className={`inline-flex items-center gap-0.5 font-medium ${stat.up ? "text-green-600" : "text-red-600"}`}>
                      {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.change}
                    </span>
                    <span>from last month</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, idx) => {
                const IconComponent = iconMap[item.icon] || Eye;
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${typeStyles[item.type]}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto flex-col gap-3 py-5 hover:shadow-md transition-all"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
