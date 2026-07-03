import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/ui/PrintButton';
export default async function PackingSlipPage({ params }) {
  const { id } = await params;
  
  await connectDB();
  const order = await Order.findById(id).lean();
  
  if (!order) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black print:p-0">
      <div className="flex justify-between items-start border-b pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading mb-2 uppercase tracking-wider">Packing Slip</h1>
          <p className="text-gray-500 font-medium">Order #{order.orderId}</p>
          <p className="text-gray-500 text-sm">Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold font-heading">Madras Wall Stories</h2>
        </div>
      </div>

      <div className="mb-8 p-6 border-2 border-gray-900 rounded-xl">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Ship To</h3>
        <p className="font-bold text-lg">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
        <p className="text-md mt-1">
          {order.shippingAddress.address1}
          {order.shippingAddress.address2 && <>, {order.shippingAddress.address2}</>}
        </p>
        <p className="text-md">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
        <p className="text-md font-bold mt-2">Phone: {order.shippingAddress.phone}</p>
      </div>

      <table className="w-full mb-8 text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-900 bg-gray-50">
            <th className="py-4 px-4 font-bold text-sm uppercase tracking-wider">Item Details</th>
            <th className="py-4 px-4 font-bold text-sm text-center uppercase tracking-wider">Qty</th>
            <th className="py-4 px-4 font-bold text-sm text-center uppercase tracking-wider">Packed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {order.products.map((item, idx) => (
            <tr key={idx}>
              <td className="py-5 px-4">
                <p className="font-bold text-lg">{item.title}</p>
                <p className="text-md text-gray-600 mt-1">
                  {item.isCustom ? (
                    <>Custom Size: {item.size} {item.customDetails?.finish && `• ${item.customDetails.finish}`}</>
                  ) : (
                    <>{item.size} {item.frame && `• ${item.frame}`}</>
                  )}
                </p>
              </td>
              <td className="py-5 px-4 text-xl font-bold text-center">{item.quantity}</td>
              <td className="py-5 px-4 text-center">
                <div className="w-8 h-8 border-2 border-gray-400 mx-auto rounded"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {order.courierName && order.trackingNumber && (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Fulfillment Details</h3>
          <p className="font-medium text-lg">Courier: {order.courierName}</p>
          <p className="font-medium text-lg">Tracking: {order.trackingNumber}</p>
          <p className="text-sm text-gray-600 mt-2">Charge: ₹{order.courierCharge || 0} | Weight: {order.packageWeight || 0}kg</p>
        </div>
      )}

      <PrintButton label="Print Packing Slip" />
    </div>
  );
}
