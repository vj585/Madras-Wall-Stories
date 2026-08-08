import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PackageOpen, ChevronLeft, ChevronRight, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Order from '@/models/Order';
import { connectDB } from '@/lib/mongodb';
import Image from 'next/image';

export const metadata = {
  title: 'My Orders | Madras Prints',
};

// Helper for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'Packed': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'Shipped':
    case 'Out For Delivery': return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
    case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
    default: return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'customer') {
    redirect('/login?callbackUrl=/account/orders');
  }

  await connectDB();
  const orders = await Order.find({ email: session.user.email }).sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-surface-alt pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/account" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">Track and manage your purchases</p>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <PackageOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wall stories will appear here.</h2>
            <p className="text-gray-500 mb-8 max-w-md">You haven't placed any orders yet. Discover our collection of premium posters and start styling your walls.</p>
            <Link href="/" className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors shadow-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id.toString()} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="p-5 md:p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-0.5">Order Number</p>
                      <p className="font-bold text-gray-900">#{order._id.toString().slice(-6).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-0.5">Order Date</p>
                      <p className="font-bold text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-0.5">Total Amount</p>
                      <p className="font-bold text-gray-900">₹{order.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.shippingStatus || order.orderStatus)}`}>
                      {order.shippingStatus || order.orderStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="p-5 md:p-6 divide-y divide-gray-50">
                  {order.products.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                      <div className="w-20 h-24 md:w-24 md:h-32 relative rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        {item.image ? (
                          <Image src={item.image} alt={item.title || 'Product'} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base md:text-lg truncate mb-1">{item.title}</h3>
                        <div className="text-sm text-gray-500 space-y-0.5 mb-2">
                          {item.size && <p>Size: <span className="text-gray-900 font-medium">{item.size}</span></p>}
                          {item.frame && item.frame !== 'No Frame' && <p>Frame: <span className="text-gray-900 font-medium">{item.frame}</span></p>}
                          <p>Qty: <span className="text-gray-900 font-medium">{item.quantity}</span></p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 md:px-6 md:py-4 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-3 justify-end border-t border-gray-50">
                  {order.trackingId && (
                    <Link href={`/account/orders/${order._id}`} className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors text-center">
                      Track Order
                    </Link>
                  )}
                  <Link 
                    href={`/account/orders/${order._id}`} 
                    className="w-full sm:w-auto px-5 py-2.5 bg-black text-white font-medium rounded-xl text-sm hover:bg-gray-800 transition-colors text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

