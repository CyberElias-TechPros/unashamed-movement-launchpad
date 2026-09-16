import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, UserPlus, Mail, Lock, User, ShieldCheck } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { settingsApi } from "@/api/settings";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: settingsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
  const registrationOpen = settings?.allowRegistration !== false; // open unless explicitly disabled

  const [form, setForm] = useState({ name: "", email: "", password: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const passwordIssues: string[] = [];
  if (form.password && form.password.length < 8) passwordIssues.push("at least 8 characters");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      toast({ title: "Account created 🎉", description: "Welcome to the movement!" });
      setNeedsVerification(true);
    } catch (err) {
      const message = (err as { message?: string })?.message || "Could not create your account";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (needsVerification) {
    return (
      <Layout>
        <SEO title="Verify Your Email" description="Check your inbox to verify your email address." />
        <section className="section-padding bg-primary pt-28 pb-20">
          <div className="container-custom max-w-md text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-8"
            >
              <ShieldCheck className="w-14 h-14 text-accent mx-auto mb-4" />
              <h1 className="font-heading text-3xl tracking-wider mb-3">One more step</h1>
              <p className="text-muted-foreground mb-6">
                We sent a verification link to <strong>{form.email}</strong>. Click it to activate
                your account — then you're all set.
              </p>
              <Button variant="hero" onClick={() => navigate("/account")}>
                Continue to my account
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Create Account" description="Join The Time Is Now — create an account to shop, track orders and be part of the movement." />
      <section className="section-padding bg-primary pt-28 pb-20">
        <div className="container-custom max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card rounded-2xl border border-border p-8 shadow-xl"
          >
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl tracking-wider mb-2">Join the Movement</h1>
              <p className="text-muted-foreground font-body text-sm">
                Create your free account
              </p>
            </div>

            {!registrationOpen ? (
              <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground text-center">
                Registration is currently closed. Please check back soon — or{" "}
                <Link to="/contact" className="text-accent hover:underline">
                  contact us
                </Link>{" "}
                to be notified.
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot — hidden from humans, irresistible to bots */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                  <div>
                    <label htmlFor="reg-name" className="font-body text-sm mb-2 block">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-name"
                        autoComplete="name"
                        placeholder="Grace Ade"
                        className="pl-10"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        minLength={2}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="reg-email" className="font-body text-sm mb-2 block">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="reg-password" className="font-body text-sm mb-2 block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="pl-10"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        minLength={8}
                        aria-describedby="password-hint"
                      />
                    </div>
                    {passwordIssues.length > 0 && (
                      <p id="password-hint" className="text-xs text-muted-foreground mt-1">
                        Password needs {passwordIssues.join(", ")}.
                      </p>
                    )}
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" /> Create Account
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-center font-body text-sm text-muted-foreground mt-6">
                  By creating an account you agree to our{" "}
                  <Link to="/terms" className="text-accent hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
                <p className="text-center font-body text-sm text-muted-foreground mt-3">
                  Already have an account?{" "}
                  <Link to="/login" className="text-accent hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
