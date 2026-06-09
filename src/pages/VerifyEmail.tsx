import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { authApi } from "@/api/auth";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || '';
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) return;
      setStatus('loading');
try {
         const res = await authApi.verifyEmail({ token });
         setStatus('success');
         setMessage(res.message || 'Email verified successfully');
       } catch (err) {
         setStatus('error');
         setMessage((err as Error)?.message || 'Verification failed');
       }
    };
    verify();
  }, [token]);

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh] flex items-center">
        <div className="container-custom max-w-lg mx-auto text-center">
          <h1 className="font-heading text-3xl mb-4">Verify Email</h1>
          {status === 'loading' && <p>Verifying...</p>}
          {status === 'success' && (
            <div>
              <p className="mb-4 text-green-600">{message}</p>
              <Link to="/admin/login" className="underline text-primary">Go to login</Link>
            </div>
          )}
          {status === 'error' && (
            <div>
              <p className="mb-4 text-red-600">{message}</p>
              <p>If the link expired you can request a new verification from your account.</p>
            </div>
          )}
          {!token && (
            <div>
              <p className="mb-4">No token provided. Please use the link sent to your email.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default VerifyEmail;
