import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { authApi } from "@/api/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
try {
       const response = await authApi.forgotPassword({ email });
       setMessage(response.resetUrl ? `Reset link generated. Check console or email.` : 'If that email exists, a reset link has been sent.');
     } catch (err) {
       setError((err as Error)?.message || "Failed to request password reset.");
     } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh] flex items-center">
        <div className="container-custom max-w-md mx-auto">
          <h1 className="font-heading text-3xl mb-4 text-center">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your email and we will send a password reset link.</p>
          {error && <p className="text-red-600 mb-3">{error}</p>}
          {message && <p className="text-green-600 mb-3">{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Email address</label>
              <input
                type="email"
                className="w-full rounded-lg border p-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/login')}>
                Back to login
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default ForgotPassword;
