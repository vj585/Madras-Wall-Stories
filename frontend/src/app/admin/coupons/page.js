"use client";
import { useState } from 'react';
import { Search, Plus, Tag } from 'lucide-react';
import CreateCouponDrawer from '@/components/admin/CreateCouponDrawer';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]); // Empty state
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Coupons</h1>
          <p className="text-gray-500">Create and manage discount codes for your customers.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search coupons..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-accent-blue outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
        {coupons.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Tag className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No coupons created</h2>
            <p className="text-gray-500 max-w-sm mb-6">Create promotional codes to offer discounts to your customers.</p>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </div>
        ) : (
          <div className="p-6">
            <p>Coupons list.</p>
          </div>
        )}
      </div>

      <CreateCouponDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
