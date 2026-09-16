import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  Package,
  Heart,
  MailCheck,
  MailWarning,
  KeyRound,
  Save,
  ShieldCheck,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const Account = () => {
  const { user, refreshUser, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState({ name: "", email: "", avatar: "" });
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // Sync form with the logged-in user once it loads.
  if (!profileInitialized && user) {
    setProfile({ name: user.name || "", email: user.email, avatar: user.avatar || "" });
    setProfileInitialized(true);
  }

  const [sendingVerify, setSendingVerify] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authApi.updateProfile({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
      });
      await refreshUser();
      toast({ title: "Profile saved", description: "Your details were updated." });
    } catch (err) {
      toast({
        title: "Could not save profile",
        description: (err as { message?: string })?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (pw.newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwError("New passwords don't match.");
      return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword({
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      toast({ title: "Password changed", description: "Use your new password next time you sign in." });
    } catch (err) {
      setPwError((err as { message?: string })?.message || "Could not change password");
    } finally {
      setSavingPw(false);
    }
  };

  const resendVerification = async () => {
    setSendingVerify(true);
    try {
      await authApi.sendVerification({ email: user?.email || profile.email });
      toast({ title: "Verification email sent", description: "Check your inbox (and spam folder)." });
    } catch (err) {
      toast({
        title: "Could not send email",
        description: (err as { message?: string })?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSendingVerify(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <SEO title="My Account" description="Manage your TTIN account." />
        <section className="section-padding bg-background pt-28 pb-20">
          <div className="container-custom max-w-md text-center">
            <h1 className="font-heading text-3xl tracking-wider mb-4">My Account</h1>
            <p className="text-muted-foreground mb-6">
              Please{" "}
              <Link to="/login" className="text-accent hover:underline">
                sign in
              </Link>{" "}
              to view your account.
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="My Account" description="Manage your TTIN profile, password and email verification." />
      <section className="section-padding bg-primary pt-28 pb-16">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-2">
              My Account
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl tracking-wider text-primary-foreground">
              Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl space-y-8">
          {/* Verification status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4 ${
              user?.emailVerified
                ? "border-green-500/30 bg-green-500/5"
                : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            <div className="flex items-center gap-3">
              {user?.emailVerified ? (
                <MailCheck className="w-6 h-6 text-green-600" />
              ) : (
                <MailWarning className="w-6 h-6 text-amber-600" />
              )}
              <div>
                <p className="font-heading text-lg">
                  {user?.emailVerified ? "Email verified" : "Email not verified"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.emailVerified
                    ? "Thanks for confirming your address."
                    : "Verify your email to secure your account."}
                </p>
              </div>
            </div>
            {!user?.emailVerified && (
              <Button variant="outline" onClick={resendVerification} disabled={sendingVerify}>
                {sendingVerify ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MailCheck className="w-4 h-4 mr-2" />}
                Resend verification email
              </Button>
            )}
          </motion.div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/orders"
              className="rounded-2xl border border-border bg-card p-5 hover:border-accent transition-colors flex items-center gap-4"
            >
              <Package className="w-8 h-8 text-accent" />
              <div>
                <p className="font-heading text-lg">My Orders</p>
                <p className="text-sm text-muted-foreground">Track purchases & downloads</p>
              </div>
            </Link>
            <Link
              to="/wishlist"
              className="rounded-2xl border border-border bg-card p-5 hover:border-accent transition-colors flex items-center gap-4"
            >
              <Heart className="w-8 h-8 text-accent" />
              <div>
                <p className="font-heading text-lg">Wishlist</p>
                <p className="text-sm text-muted-foreground">Items you saved for later</p>
              </div>
            </Link>
          </div>

          {/* Profile */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={saveProfile}
            className="bg-card rounded-2xl border border-border p-6 space-y-4"
          >
            <h2 className="font-heading text-xl tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" /> Profile Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="acc-name" className="font-body text-sm mb-2 block">Full Name</label>
                <Input id="acc-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required minLength={2} />
              </div>
              <div>
                <label htmlFor="acc-email" className="font-body text-sm mb-2 block">Email</label>
                <Input id="acc-email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
              </div>
            </div>
            <div>
              <label htmlFor="acc-avatar" className="font-body text-sm mb-2 block">
                Avatar URL <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input id="acc-avatar" placeholder="https://…" value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">
                Changing your email will require re-verification.
              </p>
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Profile
            </Button>
          </motion.form>

          {/* Password */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={changePassword}
            className="bg-card rounded-2xl border border-border p-6 space-y-4"
          >
            <h2 className="font-heading text-xl tracking-wider flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-accent" /> Change Password
            </h2>
            {pwError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {pwError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pw-current" className="font-body text-sm mb-2 block">Current</label>
                <Input id="pw-current" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="pw-new" className="font-body text-sm mb-2 block">New</label>
                <Input id="pw-new" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required minLength={8} />
              </div>
              <div>
                <label htmlFor="pw-confirm" className="font-body text-sm mb-2 block">Confirm New</label>
                <Input id="pw-confirm" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={savingPw}>
              {savingPw ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
              Update Password
            </Button>
          </motion.form>
        </div>
      </section>
    </Layout>
  );
};

export default Account;
