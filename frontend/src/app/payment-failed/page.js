import Link from 'next/link';
import { XCircle, RefreshCcw } from 'lucide-react';

export default function PaymentFailed() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 sm:p-12 text-center shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-8 text-sm">
          We couldn't process your payment. Don't worry, no money was deducted from your account. Please try again.
        </p>
        
        <Link 
          href="/checkout" 
          className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md"
        >
          <RefreshCcw className="w-5 h-5" /> Retry Payment
        </Link>
        <Link 
          href="/contact" 
          className="block w-full text-sm text-gray-500 hover:text-black mt-6 transition-colors"
        >
          Need help? Contact Support
        </Link>
      </div>
    </div>
  );
}
