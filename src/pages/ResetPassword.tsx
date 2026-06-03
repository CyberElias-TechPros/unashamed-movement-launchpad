import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { authApi } from "@/api/auth";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) setError('No token provided');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');
    try {
      const res = await authApi.resetPassword({ token, password });
      setSuccess(res.message || 'Password reset successful');
      setTimeout(() => navigate('/admin/login'), 1500);
    } catch (err: any) {
      setError(err?.message || 'Reset failed');
    }
  };

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh] flex items-center">
        <div className="container-custom max-w-md mx-auto">
          <h1 className="font-heading text-3xl mb-4 text-center">Reset Password</h1>
          {error && <p className="text-red-600 mb-3">{error}</p>}
          {success && <p className="text-green-600 mb-3">{success}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block mb-1">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">Reset Password</button>
              <Link to="/" className="btn btn-ghost">Cancel</Link>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;
