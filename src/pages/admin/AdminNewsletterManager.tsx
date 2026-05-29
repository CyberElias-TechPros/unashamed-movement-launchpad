import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Download, Trash2, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { newsletterApi } from "@/api/newsletter";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

const AdminNewsletterManager = () => {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await newsletterApi.getSubscribers();
        setSubscribers(
          data.map((s: { _id?: string; id?: string; email: string; createdAt?: string; subscribedAt?: string; active: boolean }) => ({
            id: s._id || s.id || s.email,
            email: s.email,
            subscribedAt: s.createdAt || s.subscribedAt || new Date().toISOString(),
            active: s.active,
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleUnsubscribe = async (email: string) => {
    try {
      await newsletterApi.unsubscribe(email);
      setSubscribers((prev) => prev.filter((s) => s.email !== email));
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCsv = () => {
    const rows = [["email", "subscribedAt", "active"], ...filtered.map((s) => [s.email, s.subscribedAt, String(s.active)])];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="font-heading text-3xl tracking-wider text-foreground mb-2">
              Newsletter Management
            </h2>
            <p className="text-muted-foreground">
              Manage your email subscribers and campaigns
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>
                  Email campaigns require Mailchimp or SendGrid integration. Export CSV and import to your provider.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscribers</CardTitle>
                <CardDescription>
                  {subscribers.length} total subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search subscribers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="button" onClick={exportCsv} disabled={filtered.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                <div className="space-y-2">
                  {filtered.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No subscribers found</p>
                    </div>
                  ) : (
                    filtered.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-body">{sub.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Subscribed: {new Date(sub.subscribedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={sub.active ? "default" : "secondary"}>
                            {sub.active ? "Active" : "Unsubscribed"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnsubscribe(sub.email)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminNewsletterManager;