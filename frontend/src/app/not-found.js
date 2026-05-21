import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-alt px-4 text-center">
      <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">404</h2>
      <h3 className="text-2xl font-semibold mb-4">Page Not Found</h3>
      <p className="text-gray-500 mb-8 max-w-md">The page you're looking for doesn't exist, has been moved, or is temporarily unavailable.</p>
      <Link href="/shop" className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
        Browse All Prints
      </Link>
    </div>
  );
}
