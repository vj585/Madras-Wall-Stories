"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [emailForResend, setEmailForResend] = useState('');
  const [resendStatus, setResendStatus] = useState(''); // 'idle', 'loading', 'success'

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (err) {
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!emailForResend) return;

    setResendStatus('loading');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForResend })
      });
      const data = await res.json();

      if (res.ok) {
        setResendStatus('success');
        setMessage(data.message);
      } else {
        setResendStatus('idle');
        alert(data.error || 'Failed to resend. Please try again.');
      }
    } catch (err) {
      setResendStatus('idle');
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-12 h-12 text-accent-blue animate-spin mb-4" />
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Verifying your email...</h2>
            <p className="text-gray-500 text-sm">Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">Email Verified!</h2>
            <p className="text-gray-500 text-sm mb-8">{message}</p>
            <Link href="/login" className="w-full flex justify-center py-4 px-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
              Continue to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">Verification Failed</h2>
            <p className="text-red-600 text-sm font-medium mb-8 bg-red-50 p-4 rounded-xl border border-red-100">{message}</p>
            
            {resendStatus === 'success' ? (
              <div className="w-full bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                <p className="text-green-700 text-sm font-medium">New verification link sent! Please check your inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleResend} className="w-full text-left bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6">
                <h3 className="font-semibold text-sm mb-1 text-gray-900">Link expired?</h3>
                <p className="text-xs text-gray-500 mb-4">Enter your email to get a new verification link.</p>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    required
                    value={emailForResend}
                    onChange={(e) => setEmailForResend(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={resendStatus === 'loading'}
                    className="px-4 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {resendStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            )}

            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}

