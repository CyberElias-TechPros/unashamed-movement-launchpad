import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Globe, Bell, Shield, Users, Palette, Search as SearchIcon, Share2, Image as ImageIcon, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, SiteSettings } from "@/api/settings";
import MediaPicker from "@/components/MediaPicker";

const AdminSettings = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const [siteName, setSiteName] = useState("The Time Is Now");
  const [tagline, setTagline] = useState("Bold faith for today's generation");
  const [siteUrl, setSiteUrl] = useState("https://thetimeisnow.org");
  const [adminEmail, setAdminEmail] = useState(user?.email || "admin@thetimeisnow.com");

  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifyNewSubscriber, setNotifyNewSubscriber] = useState(true);
  const [notifyNewReview, setNotifyNewReview] = useState(true);
  const [notifyNewTestimonial, setNotifyNewTestimonial] = useState(true);

  const [allowRegistration, setAllowRegistration] = useState(false);
  const [moderateReviews, setModerateReviews] = useState(true);
  const [moderateTestimonials, setModerateTestimonials] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Branding fields
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [themeMode, setThemeMode] = useState<"default" | "bw-purple" | "minimal">("default");
  const [brandMediaPickerOpen, setBrandMediaPickerOpen] = useState(false);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoMediaPickerOpen, setSeoMediaPickerOpen] = useState(false);

  // Payment methods (toggled per provider; PayPal is the primary option)
  const [payPaypal, setPayPaypal] = useState(true);
  const [payStripe, setPayStripe] = useState(false);
  const [payPaystack, setPayPaystack] = useState(true);
  const [payFlutterwave, setPayFlutterwave] = useState(true);

  // Social fields
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");

  const { data: remoteSettings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.getAll,
  });

  useEffect(() => {
    if (remoteSettings) {
      setSiteName(remoteSettings.siteName || siteName);
      setTagline(remoteSettings.tagline || tagline);
      setSiteUrl(remoteSettings.siteUrl || siteUrl);
      setAdminEmail(remoteSettings.emailFrom || adminEmail);
      setAllowRegistration(Boolean(remoteSettings.allowRegistration));
      setModerateReviews(Boolean(remoteSettings.moderateReviews));
      setModerateTestimonials(Boolean(remoteSettings.moderateTestimonials));
      setMaintenanceMode(Boolean(remoteSettings.maintenanceMode));
      setLogoUrl(remoteSettings.logoUrl || "");
      setFaviconUrl(remoteSettings.faviconUrl || "");
      setThemeMode(remoteSettings.themeMode || "default");
      setSeoTitle(remoteSettings.seoTitle || "");
      setSeoDescription(remoteSettings.seoDescription || "");
      setSocialTwitter(remoteSettings.socialTwitter || "");
      const pm = remoteSettings.paymentMethods;
      if (pm) {
        setPayPaypal(pm.paypal !== false);
        setPayStripe(Boolean(pm.stripe));
        setPayPaystack(pm.paystack !== false);
        setPayFlutterwave(pm.flutterwave !== false);
      }
      setSocialInstagram(remoteSettings.socialInstagram || "");
      setSocialYoutube(remoteSettings.socialYoutube || "");
      setSocialTiktok(remoteSettings.socialTiktok || "");
    }
  }, [remoteSettings, siteName, tagline, siteUrl, adminEmail]);

  useEffect(() => {
    if (!hasUnsaved) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<SiteSettings>) => settingsApi.save(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setLastSaved(new Date().toLocaleTimeString());
      setHasUnsaved(false);
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync({
        siteName,
        tagline,
        siteUrl,
        emailFrom: adminEmail,
        allowRegistration,
        moderateReviews,
        moderateTestimonials,
        maintenanceMode,
        logoUrl,
        faviconUrl,
        themeMode,
        seoTitle,
        seoDescription,
        socialTwitter,
        socialInstagram,
        socialYoutube,
        socialTiktok,
        paymentMethods: {
          paypal: payPaypal,
          stripe: payStripe,
          paystack: payPaystack,
          flutterwave: payFlutterwave,
        },
      });
      toast({ title: "Settings saved", description: "Your configuration has been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl tracking-wider text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your site configuration.</p>
            {lastSaved && <p className="text-xs text-green-600 mt-1">Last saved: {lastSaved}</p>}
          </div>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto flex overflow-x-auto">
            <TabsTrigger value="general" className="whitespace-nowrap">
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="whitespace-nowrap">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="whitespace-nowrap">
              Security
            </TabsTrigger>
            <TabsTrigger value="account" className="whitespace-nowrap">
              Account
            </TabsTrigger>
            <TabsTrigger value="branding" className="whitespace-nowrap">
              <Palette className="mr-1.5 h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="seo" className="whitespace-nowrap">
              <SearchIcon className="mr-1.5 h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="payments" className="whitespace-nowrap">
              <CreditCard className="mr-1.5 h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="social" className="whitespace-nowrap">
              <Share2 className="mr-1.5 h-4 w-4" />
              Social
            </TabsTrigger>
</TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Core site details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Site URL</Label>
                <Input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Maintenance Mode</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                    <span className="text-sm text-muted-foreground">
                      {maintenanceMode ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Registration</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={allowRegistration} onCheckedChange={setAllowRegistration} />
                    <span className="text-sm text-muted-foreground">
                      {allowRegistration ? "Open" : "Invite only"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>What should notify admins?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { key: "notifyNewOrder", label: "New Order", description: "Alert when a customer places an order." },
                { key: "notifyNewSubscriber", label: "New Subscriber", description: "Alert when someone subscribes." },
                { key: "notifyNewReview", label: "New Review", description: "Alert when a review is submitted." },
                { key: "notifyNewTestimonial", label: "New Testimonial", description: "Alert when a testimony is submitted." },
              ].map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{toggle.label}</Label>
                    <p className="text-xs text-muted-foreground">{toggle.description}</p>
                  </div>
                  <Switch
                    checked={(toggle.key === "notifyNewOrder" ? notifyNewOrder
                      : toggle.key === "notifyNewSubscriber" ? notifyNewSubscriber
                      : toggle.key === "notifyNewReview" ? notifyNewReview
                      : notifyNewTestimonial)}
                    onCheckedChange={(v) => {
                      if (toggle.key === "notifyNewOrder") setNotifyNewOrder(v);
                      else if (toggle.key === "notifyNewSubscriber") setNotifyNewSubscriber(v);
                      else if (toggle.key === "notifyNewReview") setNotifyNewReview(v);
                      else setNotifyNewTestimonial(v);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>What requires manual approval.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Moderate Reviews</Label>
                  <p className="text-xs text-muted-foreground">Approve product reviews before publishing.</p>
                </div>
                <Switch checked={moderateReviews} onCheckedChange={setModerateReviews} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Moderate Testimonials</Label>
                  <p className="text-xs text-muted-foreground">Approve testimonials before publishing.</p>
                </div>
                <Switch checked={moderateTestimonials} onCheckedChange={setModerateTestimonials} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

<TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Account</CardTitle>
              <CardDescription>Manage your admin profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg font-heading bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {adminEmail?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Administrator</p>
                  <p className="text-sm text-muted-foreground">{adminEmail}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Change Password</Label>
                <Input type="password" placeholder="New password" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Logo, favicon, and theme settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Site Logo URL</Label>
                <div className="flex gap-2">
                  <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={() => setBrandMediaPickerOpen(true)}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                {logoUrl && (
                  <img src={logoUrl} alt="Logo preview" className="h-12 w-auto mt-2 border rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
              <div className="space-y-2">
                <Label>Favicon URL</Label>
                <div className="flex gap-2">
                  <Input value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={() => setBrandMediaPickerOpen(true)}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Theme Mode</Label>
                <Select value={themeMode} onValueChange={(v) => setThemeMode(v as typeof themeMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Signature Dark &amp; Gold</SelectItem>
                    <SelectItem value="bw-purple">Dark &amp; Gold (legacy toggle)</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Search engine optimization configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="TTIN - The Time Is Now" maxLength={60} />
                <p className="text-xs text-muted-foreground">{seoTitle.length}/60 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Faith-based movement..." rows={3} maxLength={160} />
                <p className="text-xs text-muted-foreground">{seoDescription.length}/160 characters</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Choose which payment providers customers can use at checkout and for donations.
                PayPal is the primary option and is pre-selected for customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-base">PayPal</Label>
                    <Badge>Primary</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cards, PayPal balance, and Venmo (US) in 200+ markets. Supports USD, EUR, GBP
                    and more — not NGN. Configure PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET /
                    PAYPAL_WEBHOOK_ID / PAYPAL_ENV to go live.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Switch checked={payPaypal} onCheckedChange={setPayPaypal} />
                  <span className="text-sm text-muted-foreground w-10">
                    {payPaypal ? "On" : "Off"}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-base">Paystack</Label>
                  <p className="text-sm text-muted-foreground">
                    Best for Nigeria — cards, bank transfer, USSD, and mobile money in NGN.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Switch checked={payPaystack} onCheckedChange={setPayPaystack} />
                  <span className="text-sm text-muted-foreground w-10">
                    {payPaystack ? "On" : "Off"}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-base">Flutterwave</Label>
                  <p className="text-sm text-muted-foreground">
                    Pan-African coverage across Nigeria, Ghana, Kenya, and beyond.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Switch checked={payFlutterwave} onCheckedChange={setPayFlutterwave} />
                  <span className="text-sm text-muted-foreground w-10">
                    {payFlutterwave ? "On" : "Off"}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-base">Stripe</Label>
                  <p className="text-sm text-muted-foreground">
                    Global cards and wallets (Apple Pay, Google Pay). Not available to Nigerian
                    merchants.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Switch checked={payStripe} onCheckedChange={setPayStripe} />
                  <span className="text-sm text-muted-foreground w-10">
                    {payStripe ? "On" : "Off"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Disabled providers disappear from checkout and donation forms. Until provider keys
                are configured, enabled providers run in dev mode (payments are simulated so you
                can test the full flow).
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connect your social profiles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Twitter/X URL</Label>
                <Input value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} placeholder="https://twitter.com/..." />
              </div>
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-2">
                <Label>YouTube URL</Label>
                <Input value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} placeholder="https://youtube.com/..." />
              </div>
              <div className="space-y-2">
                <Label>TikTok URL</Label>
                <Input value={socialTiktok} onChange={(e) => setSocialTiktok(e.target.value)} placeholder="https://tiktok.com/..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
        <MediaPicker
          open={brandMediaPickerOpen}
          onOpenChange={setBrandMediaPickerOpen}
          onSelect={(url) => {
            setLogoUrl(url);
            setBrandMediaPickerOpen(false);
          }}
        />
      </motion.div>
    </>
  );
};

export default AdminSettings;
