"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Mail, Lock, Phone, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useEffect } from 'react';

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role === 'ADMIN' || session?.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
      } else {
        // We rely on the useEffect to do the redirect, but we can also trigger a router.refresh() 
        // to fast-track the session status update.
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Sign in for faster checkout, order tracking & wishlist.</p>
        </div>

        {/* Guest Checkout Shortcut */}
        <Link href="/checkout" className="block w-full py-3.5 text-center border-2 border-dashed border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-medium text-sm transition-all mb-6">
          Continue as Guest → No account needed
        </Link>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400">Or sign in for perks</span></div>
        </div>

        {/* Login Method Toggle */}
        <div className="flex p-1 bg-gray-50 rounded-xl mb-8">
          <button 
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
          >
            Email
          </button>
          <button 
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
          >
            Phone
          </button>
        </div>

        {/* Social Login */}
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
          Continue with Google
        </motion.button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {loginMethod === 'email' ? (
              <motion.form 
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
                onSubmit={handleEmailLogin}
              >
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-sm" 
                      placeholder="you@example.com" 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <button type="button" onClick={() => alert('Password reset will be available soon.')} className="text-xs font-medium text-accent-blue hover:text-blue-700">Forgot?</button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-sm" 
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none transition-colors mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                </button>
              </motion.form>
          ) : (
            <motion.form 
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
                    +91
                  </span>
                  <input type="tel" className="flex-1 min-w-0 block w-full px-4 py-3.5 rounded-none rounded-r-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-sm" placeholder="98765 43210" />
                </div>
              </div>
              <button type="button" className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none transition-colors mt-6">
                Send OTP <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-accent-blue hover:text-blue-700">
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
