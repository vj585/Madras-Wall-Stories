'use client';
import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';

export default function VerifyEmailButton({ email }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (e) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-3">
      {message ? (
        <p className="text-sm font-medium text-green-600 bg-green-50 p-2 rounded-lg inline-block border border-green-100">{message}</p>
      ) : (
        <button 
          onClick={handleResend}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          Verify Email
        </button>
      )}
    </div>
  );
}
