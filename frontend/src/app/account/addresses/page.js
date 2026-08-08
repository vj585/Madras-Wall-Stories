import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Customer from '@/models/Customer';
import { connectDB } from '@/lib/mongodb';
import AddressClient from './AddressClient';

export const metadata = {
  title: 'Saved Addresses | Madras Prints',
};

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'customer') {
    redirect('/login?callbackUrl=/account/addresses');
  }

  await connectDB();
  const customer = await Customer.findById(session.user.id).lean();

  if (!customer) {
    redirect('/login?callbackUrl=/account/addresses');
  }

  // Ensure addresses are plain objects with string IDs for Next.js serialization
  const initialAddresses = (customer.savedAddresses || []).map(a => ({
    ...a,
    _id: a._id.toString()
  }));

  const defaultAddressId = customer.defaultAddress ? customer.defaultAddress.toString() : null;

  return (
    <div className="min-h-screen bg-surface-alt pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/account" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Saved Addresses</h1>
            <p className="text-sm text-gray-500">Manage where your wall stories are delivered</p>
          </div>
        </div>

        <AddressClient initialAddresses={initialAddresses} defaultAddressId={defaultAddressId} />

      </div>
    </div>
  );
}

