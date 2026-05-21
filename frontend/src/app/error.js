"use client";
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-alt px-4 text-center">
      <h2 className="text-3xl font-heading font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-500 mb-8 max-w-md">We encountered an unexpected error while trying to load this page. Please try again.</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          Try again
        </button>
        <Link href="/" className="px-6 py-3 bg-white text-black border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}
