import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyticsAdminApi } from "@/api/analyticsAdmin";

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("30d");
  const [stats, setStats] = useState({ totalViews: 0, totalSubscribers: 0, totalTestimonials: 0, totalDownloads: 0 });
  const [series, setSeries] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    Promise.all([analyticsAdminApi.dashboard(), analyticsAdminApi.timeseries(days)])
      .then(([dash, ts]) => {
        setStats(dash);
        setSeries(ts);
      })
      .catch(console.error);
  }, [period]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-3xl tracking-wider">Analytics</h2>
          <p className="text-muted-foreground">Live data from analytics events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>Back</Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardHeader><CardTitle className="text-sm">Page views</CardTitle></CardHeader><CardContent className="text-2xl font-heading">{stats.totalViews}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Subscribers</CardTitle></CardHeader><CardContent className="text-2xl font-heading">{stats.totalSubscribers}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Testimonies</CardTitle></CardHeader><CardContent className="text-2xl font-heading">{stats.totalTestimonials}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Downloads</CardTitle></CardHeader><CardContent className="text-2xl font-heading">{stats.totalDownloads}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Events over time</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
