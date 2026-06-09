import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  Eye,
  FileDown,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { analyticsAdminApi } from "@/api/analyticsAdmin";

type Period = "7d" | "30d" | "90d";

const AdminAnalytics = () => {
  const [period, setPeriod] = useState<Period>("30d");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [isLive, setIsLive] = useState(false);

  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => analyticsAdminApi.dashboard(),
    refetchInterval: isLive ? 5000 : false,
  });

  const { data: series = [], isLoading: seriesLoading } = useQuery({
    queryKey: ["analytics", "timeseries", days],
    queryFn: () => analyticsAdminApi.timeseries(days),
    refetchInterval: isLive ? 5000 : false,
  });

  const statCards = [
    { label: "Page Views", value: stats?.totalViews ?? 0, change: "+24%", up: true, icon: Eye, color: "text-purple-600 bg-purple-500/10", format: (v: number) => v.toLocaleString() },
    { label: "Subscribers", value: stats?.totalSubscribers ?? 0, change: "+12%", up: true, icon: Users, color: "text-green-600 bg-green-500/10", format: (v: number) => v.toLocaleString() },
    { label: "Downloads", value: stats?.totalDownloads ?? 0, change: "+8%", up: true, icon: FileDown, color: "text-amber-600 bg-amber-500/10", format: (v: number) => v.toLocaleString() },
    { label: "Testimonials", value: stats?.totalTestimonials ?? 0, change: "+5%", up: true, icon: Star, color: "text-pink-600 bg-pink-500/10", format: (v: number) => v.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Detailed views, growth tracking, and reporting.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className={isLive ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {isLive ? "Live" : "Static"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-7 w-16 bg-muted rounded animate-pulse" />
              ) : (
                <>
                  <div className="text-2xl font-heading tracking-wider">{stat.format(stat.value)}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className={`inline-flex items-center gap-0.5 font-medium ${stat.up ? "text-green-600" : "text-red-600"}`}>
                      {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.change}
                    </span>
                    <span>vs. previous</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Activity Over Time</CardTitle>
              <CardDescription>Daily events across {days} days.</CardDescription>
            </div>
            <Tabs value={chartType} onValueChange={(v: "bar" | "line") => setChartType(v)} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="bar" className="text-xs h-6 px-3">Bar</TabsTrigger>
                <TabsTrigger value="line" className="text-xs h-6 px-3">Line</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {seriesLoading ? (
            <div className="h-72 w-full bg-muted/50 rounded animate-pulse" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Events" />
                  </BarChart>
                ) : (
                  <LineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} name="Events" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
