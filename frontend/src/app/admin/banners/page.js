"use client";
import { useState, useEffect } from 'react';
import { Search, Plus, Image as ImageIcon, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import UploadBannerDrawer from '@/components/admin/UploadBannerDrawer';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners?all=true');
      const data = await res.json();
      if (data.success) setBanners(data.data);
    } catch (e) {
      console.error('Failed to load banners:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSave = (newBanner) => {
    setBanners(prev => [newBanner, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setBanners(prev => prev.filter(b => b._id !== id));
    } catch (e) {
      alert('Failed to delete banner.');
    }
  };

  const handleToggleStatus = async (banner) => {
    const newStatus = banner.status === 'Active' ? 'Draft' : 'Active';
    try {
      const res = await fetch(`/api/banners/${banner._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners(prev => prev.map(b => b._id === banner._id ? { ...b, status: newStatus } : b));
      }
    } catch (e) {
      alert('Failed to update banner status.');
    }
  };

  const filtered = banners.filter(b =>
    !searchQuery || b.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative">
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
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No banners yet</h2>
            <p className="text-gray-500 max-w-sm mb-6">Upload banners to highlight offers, new arrivals, or featured collections on your homepage.</p>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Upload Banner
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((banner) => (
              <div key={banner._id} className="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors items-center">
                {/* Thumbnail */}
                <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{banner.title || 'Untitled Banner'}</p>
                  {banner.targetUrl && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{banner.targetUrl}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(banner.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${banner.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {banner.status}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    title={banner.status === 'Active' ? 'Set to Draft' : 'Set to Active'}
                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {banner.status === 'Active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {banner.image && (
                    <a href={banner.image} target="_blank" rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadBannerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

