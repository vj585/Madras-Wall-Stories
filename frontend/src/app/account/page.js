import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, MapPin, Heart, LogOut, User as UserIcon, ChevronRight } from 'lucide-react';
import Customer from '@/models/Customer';
import { connectDB } from '@/lib/mongodb';

export const metadata = {
  title: 'My Account | Madras Wall Stories',
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'customer') {
    redirect('/login?callbackUrl=/account');
  }

  await connectDB();
  const customer = await Customer.findById(session.user.id).lean();

  return (
    <div className="min-h-screen bg-surface-alt pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3 text-gray-900">My Account</h1>
          <p className="text-gray-500 text-lg">Manage your orders, addresses, and wishlist.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm mb-8 flex items-center gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
            {customer?.avatar ? (
              <img src={customer.avatar} alt={session.user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{session.user.name}</h2>
            <p className="text-gray-500">{session.user.email}</p>
          </div>
        </div>

        {/* Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Link href="/account/orders" className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-accent-blue/10 transition-colors">
                <Package className="w-6 h-6 text-gray-600 group-hover:text-accent-blue" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">My Orders</h3>
                <p className="text-sm text-gray-500">Track and view past orders</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent-blue transition-colors" />
          </Link>

          <Link href="/account/addresses" className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-accent-blue/10 transition-colors">
                <MapPin className="w-6 h-6 text-gray-600 group-hover:text-accent-blue" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Saved Addresses</h3>
                <p className="text-sm text-gray-500">Manage delivery locations</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent-blue transition-colors" />
          </Link>

          <Link href="/wishlist" className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
                <Heart className="w-6 h-6 text-gray-600 group-hover:text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Wishlist</h3>
                <p className="text-sm text-gray-500">Your curated favorites</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
          </Link>
          
          {/* Logout uses an API call or client component, we'll use a Client Component Wrapper for logout or just a button that calls next-auth signOut */}
          <AccountLogoutButton />
        </div>

      </div>
    </div>
  );
}

// Inline Client Component for Logout to keep page.js clean
import AccountLogoutButton from './AccountLogoutButton';
