"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelOrderButton({ orderId }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Order cancelled successfully.");
        router.refresh();
      } else {
        alert("Failed to cancel order: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while cancelling the order.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isCancelling}
      className="px-4 py-1.5 rounded-full text-sm font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50 shadow-sm"
    >
      {isCancelling ? 'Cancelling...' : 'Cancel Order'}
    </button>
  );
}
