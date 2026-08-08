"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, MapPin, Truck, AlertCircle, ChevronRight, FileText } from 'lucide-react';
import Image from 'next/image';
import TrackingDetails from '../account/orders/[id]/TrackingDetails';

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'Processing': return 'bg-green-50 text-green-600 border-green-200';
    case 'Printing': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'Quality Check': return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'Packed': return 'bg-orange-50 text-orange-600 border-orange-200';
    case 'Shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    case 'Out For Delivery': return 'bg-cyan-50 text-cyan-600 border-cyan-200';
    case 'Delivered': return 'bg-green-50 text-green-600 border-green-200';
    case 'Cancelled': return 'bg-red-50 text-red-600 border-red-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const queryOrderId = searchParams.get('orderId');
    if (queryOrderId) {
      setOrderId(queryOrderId);
    }
  }, [searchParams]);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId || !email) {
      setError('Please provide both Order ID and Email.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setOrder(data.data);
      } else {
        setError(data.error || 'Failed to track order.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-gray-500 max-w-lg mx-auto">Enter your Order ID and the Email address used during checkout to see your order status.</p>
        </div>

        {/* Tracking Form */}
        {!order && (
          <form onSubmit={handleTrack} className="max-w-md mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                <input 
                  type="text" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. 64b8a..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
              >
                {loading ? 'Searching...' : 'Track Order'} <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Order Results */}
        {order && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <button onClick={() => setOrder(null)} className="text-sm font-medium text-gray-500 hover:text-black mb-2 inline-flex items-center gap-1 transition-colors">
                  &larr; Track another order
                </button>
                <h2 className="text-2xl font-bold font-heading">Order #{order._id.toString().slice(-6).toUpperCase()}</h2>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold border self-start md:self-auto ${getStatusColor(order.shippingStatus || order.orderStatus || 'Pending')}`}>
                {order.shippingStatus || order.orderStatus || 'Pending'}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Timeline and Tracking */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                    <Truck className="w-5 h-5 text-accent-blue" />
                    Delivery Status
                  </h3>
                  
                  <TrackingDetails order={order} />

                  <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {(order.statusTimeline && order.statusTimeline.length > 0 ? order.statusTimeline : [{ status: 'Order Confirmed', timestamp: order.createdAt }]).map((event, index, arr) => (
                      <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className={`flex items-center justify-center w-3 h-3 rounded-full border-2 border-white ${index === arr.length - 1 ? 'bg-accent-blue ring-4 ring-blue-100' : 'bg-gray-300'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}></div>
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm">
                          <div className="font-bold text-gray-900 text-sm mb-1">{event.status}</div>
                          <div className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                      <Package className="w-5 h-5 text-gray-400" />
                      Items in this order
                    </h3>
                  </div>
                  <div className="p-6 divide-y divide-gray-50">
                    {order.products.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                        <div className="w-20 h-24 relative rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                          {item.image ? (
                            <Image src={item.image} alt={item.title || 'Product'} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-base mb-1">{item.title}</h4>
                          <div className="text-sm text-gray-500 space-y-0.5">
                            {item.size && <p>Size: <span className="text-gray-900 font-medium">{item.size}</span></p>}
                            <p>Qty: <span className="text-gray-900 font-medium">{item.quantity}</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                    <MapPin className="w-5 h-5 text-gray-400" /> Shipping Address
                  </h3>
                  {order.addressSnapshot ? (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-bold text-gray-900 mb-1">{order.addressSnapshot.fullName}</p>
                      <p>{order.addressSnapshot.houseOrApartment}, {order.addressSnapshot.street}</p>
                      <p>{order.addressSnapshot.city}, {order.addressSnapshot.state} {order.addressSnapshot.pincode}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-bold text-gray-900 mb-1">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                      <p>{order.shippingAddress?.address1}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                    <FileText className="w-5 h-5 text-gray-400" /> Order Summary
                  </h3>
                  <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">₹{order.subtotal || order.amount}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium text-gray-900">{order.shipping > 0 ? `₹${order.shipping}` : 'Free'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center font-bold text-gray-900 text-lg">
                    <span>Total</span>
                    <span>₹{order.amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20">Loading...</div>}>
      <TrackOrderForm />
    </Suspense>
  );
}

