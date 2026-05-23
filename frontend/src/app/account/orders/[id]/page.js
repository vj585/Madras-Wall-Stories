import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Package, MapPin, Truck, CheckCircle, Clock, FileText } from 'lucide-react';
import Order from '@/models/Order';
import { connectDB } from '@/lib/mongodb';
import Image from 'next/image';

export const metadata = {
  title: 'Order Details | Madras Wall Stories',
};

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

export default async function OrderDetailsPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'customer') {
    redirect('/login?callbackUrl=/account/orders');
  }

  await connectDB();
  const order = await Order.findOne({ _id: id, email: session.user.email }).lean();

  if (!order) {
    return (
      <div className="min-h-screen bg-surface-alt pt-32 flex flex-col items-center">
        <h1 className="text-3xl font-heading font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-500 mb-8">This order does not exist or you don't have access to it.</p>
        <Link href="/account/orders" className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const shippingStatus = order.shippingStatus || order.orderStatus || 'Pending';
  
  // Calculate subtotal
  const subtotal = order.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = 0; // Update if order has discount logic
  const shippingCharge = order.amount - subtotal + discount > 0 ? order.amount - subtotal + discount : 0; // Rough calc, adjust based on true model if needed

  const defaultTimeline = [
    { status: 'Order Confirmed', timestamp: order.createdAt }
  ];
  
  const timeline = order.statusTimeline && order.statusTimeline.length > 0 
    ? order.statusTimeline 
    : defaultTimeline;

  return (
    <div className="min-h-screen bg-surface-alt pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/account/orders" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm shrink-0">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">Order #{order._id.toString().slice(-6).toUpperCase()}</h1>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className={`self-start md:self-auto px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(shippingStatus)}`}>
            {shippingStatus}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column - Products & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Tracking Placeholder */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <Truck className="w-5 h-5 text-accent-blue" />
                Delivery Status
              </h2>
              
              {order.trackingId ? (
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-6">
                  <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Courier Partner</p>
                      <p className="font-bold text-gray-900">{order.deliveryPartner || 'Standard Shipping'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Tracking ID</p>
                      <p className="font-bold text-accent-blue font-mono">{order.trackingId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Est. Delivery</p>
                      <p className="font-bold text-gray-900">
                        {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Updating...'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-6">Tracking details will be updated once your order is shipped.</p>
              )}

              {/* Timeline */}
              <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {timeline.map((event, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-3 h-3 rounded-full border-2 border-white ${index === timeline.length - 1 ? 'bg-accent-blue ring-4 ring-blue-100' : 'bg-gray-300'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-gray-900 text-sm">{event.status}</div>
                      </div>
                      <div className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                  <Package className="w-5 h-5 text-gray-400" />
                  Items in this order
                </h2>
              </div>
              <div className="p-6 divide-y divide-gray-50">
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
                      <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
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
            </div>

          </div>

          {/* Right Column - Order Summary & Details */}
          <div className="space-y-6">
            
            {/* Price Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <FileText className="w-5 h-5 text-gray-400" />
                Payment Summary
              </h2>
              
              <div className="space-y-3 text-sm mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">{shippingCharge > 0 ? `₹${shippingCharge}` : 'Free'}</span>
                </div>
                {order.coupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({order.coupon})</span>
                    <span className="font-medium">-₹{discount}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">₹{order.amount}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-bold text-gray-900">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Address Snapshot */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <MapPin className="w-5 h-5 text-gray-400" />
                Shipping Address
              </h2>
              
              {order.addressSnapshot ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-bold text-gray-900 mb-1">{order.addressSnapshot.fullName}</p>
                  <p>{order.addressSnapshot.houseOrApartment}, {order.addressSnapshot.street}</p>
                  {order.addressSnapshot.areaOrLocality && <p>{order.addressSnapshot.areaOrLocality}</p>}
                  {order.addressSnapshot.landmark && <p>Landmark: {order.addressSnapshot.landmark}</p>}
                  <p>{order.addressSnapshot.city}, {order.addressSnapshot.state} {order.addressSnapshot.pincode}</p>
                  <p className="mt-2 text-gray-900 font-medium">Phone: {order.addressSnapshot.phone}</p>
                </div>
              ) : (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-bold text-gray-900 mb-1">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                  <p>{order.shippingAddress?.address1}</p>
                  {order.shippingAddress?.address2 && <p>{order.shippingAddress?.address2}</p>}
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                  <p className="mt-2 text-gray-900 font-medium">Phone: {order.phone}</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
