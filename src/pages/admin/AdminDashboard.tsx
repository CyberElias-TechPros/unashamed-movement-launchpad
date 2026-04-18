import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Video,
  FileText,
  ShoppingBag,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  FileDown,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalSubscribers: number;
  totalDownloads: number;
  totalViews: number;
  totalTestimonials: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalSubscribers: 0,
    totalDownloads: 0,
    totalViews: 0,
    totalTestimonials: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminAuth = localStorage.getItem("ttin_admin_auth");
    if (!adminAuth) {
      navigate("/admin/login");
      return;
    }

    const subscribers = JSON.parse(localStorage.getItem("ttin_subscribers") || "[]");
    const testimonials = JSON.parse(localStorage.getItem("ttin_testimonials") || "[]");

    setStats({
      totalSubscribers: subscribers.length,
      totalDownloads: 158,
      totalViews: 12500,
      totalTestimonials: testimonials.length,
    });
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("ttin_admin_auth");
    navigate("/admin/login");
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview and statistics",
      path: "/admin/dashboard",
      badge: "current",
    },
    {
      title: "Content",
      icon: FileText,
      description: "Manage page content",
      path: "/admin/content",
      badge: "2 new",
    },
    {
      title: "Videos",
      icon: Video,
      description: "Manage video content",
      path: "/admin/videos",
      badge: null,
    },
    {
      title: "Testimonials",
      icon: Users,
      description: "Manage testimonials",
      path: "/admin/testimonials",
      badge: stats.totalTestimonials > 0 ? `${stats.totalTestimonials} new` : null,
    },
    {
      title: "Resources",
      icon: FileDown,
      description: "Manage downloads",
      path: "/admin/resources",
      badge: null,
    },
    {
      title: "Newsletter",
      icon: Mail,
      description: "Manage subscribers",
      path: "/admin/newsletter",
      badge: `${stats.totalSubscribers}`,
    },
    {
      title: "Analytics",
      icon: BarChart3,
      description: "View site analytics",
      path: "/admin/analytics",
      badge: null,
    },
    {
      title: "Settings",
      icon: Settings,
      description: "Site settings",
      path: "/admin/settings",
      badge: null,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-card border-r border-border p-6">
          <div className="mb-8">
            <h1 className="font-heading text-2xl tracking-wider text-foreground">
              TTIN Admin
            </h1>
            <p className="text-sm text-muted-foreground">Dashboard</p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  item.badge === "current"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-body text-sm">{item.title}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={item.badge === "current" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-3xl tracking-wider text-foreground">
                  Dashboard
                </h2>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening.
                </p>
              </div>
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: "Subscribers",
                  value: stats.totalSubscribers,
                  icon: Users,
                  change: "+12%",
                  color: "text-green-500",
                },
                {
                  title: "Downloads",
                  value: stats.totalDownloads,
                  icon: FileDown,
                  change: "+8%",
                  color: "text-blue-500",
                },
                {
                  title: "Page Views",
                  value: stats.totalViews.toLocaleString(),
                  icon: Eye,
                  change: "+24%",
                  color: "text-purple-500",
                },
                {
                  title: "Testimonials",
                  value: stats.totalTestimonials,
                  icon: Mail,
                  change: "+5%",
                  color: "text-orange-500",
                },
              ].map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-heading tracking-wider">
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-green-500">{stat.change}</span> from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest actions on your site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "New subscriber", time: "2 minutes ago", icon: Mail },
                      { action: "Resource downloaded", time: "15 minutes ago", icon: FileDown },
                      { action: "Testimonial submitted", time: "1 hour ago", icon: Users },
                      { action: "Video watched", time: "2 hours ago", icon: Video },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm text-foreground">
                            {item.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.time}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { title: "Add Video", icon: Video },
                      { title: "Add Resource", icon: FileDown },
                      { title: "Send Newsletter", icon: Mail },
                      { title: "View Reports", icon: BarChart3 },
                    ].map((action) => (
                      <Button
                        key={action.title}
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                      >
                        <action.icon className="w-5 h-5" />
                        <span className="text-sm">{action.title}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;