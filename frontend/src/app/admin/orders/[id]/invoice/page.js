import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { notFound } from 'next/navigation';

export default async function InvoicePage({ params }) {
  const { id } = await params;
  
  await connectDB();
  const order = await Order.findById(id).lean();
  
  if (!order) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black print:p-0">
      <div className="flex justify-between items-start border-b pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading mb-2">INVOICE</h1>
          <p className="text-gray-500 text-sm">Order #{order.orderId}</p>
          <p className="text-gray-500 text-sm">Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold font-heading">Madras Wall Stories</h2>
          <p className="text-sm text-gray-500 mt-1">Chennai, Tamil Nadu</p>
          <p className="text-sm text-gray-500">support@madraswallstories.com</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-8">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To</h3>
          <p className="font-bold">{order.customerName}</p>
          <p className="text-sm text-gray-600 mt-1">{order.email}</p>
          <p className="text-sm text-gray-600">{order.phone}</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Shipped To</h3>
          <p className="font-bold">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
          <p className="text-sm text-gray-600 mt-1">
            {order.shippingAddress.address1}
            {order.shippingAddress.address2 && <>, {order.shippingAddress.address2}</>}
          </p>
          <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
          <p className="text-sm text-gray-600 mt-1">Phone: {order.shippingAddress.phone}</p>
        </div>
      </div>

      <table className="w-full mb-8 text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-3 font-bold text-sm">Item</th>
            <th className="py-3 font-bold text-sm text-right">Price</th>
            <th className="py-3 font-bold text-sm text-center">Qty</th>
            <th className="py-3 font-bold text-sm text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {order.products.map((item, idx) => (
            <tr key={idx}>
              <td className="py-4">
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">
                  {item.isCustom ? (
                    <>Custom Size: {item.size} {item.customDetails?.finish && `• ${item.customDetails.finish}`}</>
                  ) : (
                    <>{item.size} {item.frame && `• ${item.frame}`}</>
                  )}
                </p>
              </td>
              <td className="py-4 text-sm text-right">₹{item.price || item.unitPrice}</td>
              <td className="py-4 text-sm text-center">{item.quantity}</td>
              <td className="py-4 text-sm text-right font-medium">₹{(item.price || item.unitPrice) * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>Total</span>
            <span>₹{order.grandTotal}</span>
          </div>
          <div className="text-xs text-gray-400 text-right mt-1">
            Payment Method: {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid (Razorpay)'}
          </div>
        </div>
      </div>

      <div className="mt-16 text-center text-xs text-gray-400 border-t pt-8">
        <p>Thank you for shopping with Madras Wall Stories!</p>
        <p className="mt-1">This is a computer-generated invoice.</p>
      </div>

      <div className="fixed bottom-8 right-8 print:hidden">
        <button onClick={() => window.print()} className="bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 font-bold transition-all">
          Print Invoice
        </button>
      </div>
    </div>
  );
}
