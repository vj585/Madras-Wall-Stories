"use client";
import { useState } from 'react';
import { Search, Plus, Image as ImageIcon } from 'lucide-react';
import UploadBannerDrawer from '@/components/admin/UploadBannerDrawer';

export default function BannersPage() {
  const [banners, setBanners] = useState([]); // Empty state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Banners</h1>
          <p className="text-gray-500">Manage homepage banners and promotional images.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Upload Banner
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search banners..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-accent-blue outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
        {banners.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No banners uploaded</h2>
            <p className="text-gray-500 max-w-sm mb-6">Upload banners to highlight offers, new arrivals, or featured collections on your homepage.</p>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Upload Banner
            </button>
          </div>
        ) : (
          <div className="p-6">
            <p>Banners list.</p>
          </div>
        )}
      </div>

      <UploadBannerDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
