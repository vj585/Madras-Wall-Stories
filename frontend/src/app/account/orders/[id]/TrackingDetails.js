"use client";
import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function TrackingDetails({ order }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(order.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order.trackingNumber) {
    return <p className="text-sm text-gray-500 mb-6">Tracking details will be updated once your order is shipped.</p>;
  }

  return (
    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-6">
      <div className="flex flex-wrap gap-6 justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Courier Partner</p>
          <p className="font-bold text-gray-900">{order.courierName || order.deliveryPartner || 'Standard Shipping'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Tracking Number</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 font-mono break-all">{order.trackingNumber}</span>
            <button onClick={handleCopy} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors" title="Copy Tracking Number">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-accent-blue" />}
            </button>
          </div>
        </div>
        {order.estimatedDelivery && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Est. Delivery</p>
            <p className="font-bold text-gray-900">
              {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
      
      {order.trackingUrl && (
        <div className="mt-4 pt-4 border-t border-blue-100/50 flex justify-end">
          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm"
          >
            Track Order <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {order.shippingNotes && (
        <div className="mt-3 pt-3 border-t border-blue-100/50">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Shipping Notes</p>
          <p className="text-sm text-gray-800 italic">{order.shippingNotes}</p>
        </div>
      )}
    </div>
  );
}
