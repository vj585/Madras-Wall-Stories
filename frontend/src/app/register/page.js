"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password requirements
  const reqLength = formData.password.length >= 8;
  const reqUpper = /[A-Z]/.test(formData.password);
  const reqLower = /[a-z]/.test(formData.password);
  const reqNum = /[0-9]/.test(formData.password);
  const isMatch = formData.password === formData.confirmPassword && formData.password.length > 0;

  const isValid = reqLength && reqUpper && reqLower && reqNum && isMatch && formData.name && formData.email && formData.phone;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to register. Please try again.');
        setIsLoading(false);
      } else {
        // Auto login after registration
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError('Account created, but auto-login failed. Please sign in manually.');
          setIsLoading(false);
        } else {
          router.push('/account');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">Check your inbox</h2>
          <p className="text-gray-500 mb-8">{successMsg}</p>
          <Link href="/login" className="block w-full py-3.5 px-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-500 text-sm">Join us and start collecting memories.</p>
        </div>

        <motion.button 
          type="button"
          whileHover={{ scale: 1.015, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md px-4 py-3.5 rounded-xl font-medium transition-all duration-300 mb-6 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </motion.button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-sm" 
                placeholder="Riya Kumar" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-sm" 
                placeholder="you@example.com" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative flex">
              <span className="inline-flex items-center px-4 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm rounded-l-xl">
                +91
              </span>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="flex-1 min-w-0 block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-none rounded-r-xl focus:bg-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-sm" 
                placeholder="98765 43210" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-sm" 
                placeholder="••••••••" 
              />
            </div>
            {/* Password Validation Requirements */}
            {formData.password.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className={`text-xs flex items-center gap-1.5 ${reqLength ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                  {reqLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} 8+ chars
                </p>
                <p className={`text-xs flex items-center gap-1.5 ${reqUpper ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                  {reqUpper ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} Uppercase
                </p>
                <p className={`text-xs flex items-center gap-1.5 ${reqLower ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                  {reqLower ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} Lowercase
                </p>
                <p className={`text-xs flex items-center gap-1.5 ${reqNum ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                  {reqNum ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} Number
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input 
                type="password" 
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all text-sm ${formData.confirmPassword.length > 0 ? (isMatch ? 'border-green-300 focus:ring-1 focus:ring-green-400' : 'border-red-300 focus:ring-1 focus:ring-red-400') : 'border-gray-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue'}`} 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !isValid}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent-blue hover:text-blue-700">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
