"use client";
import { useState } from 'react';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Settings</h1>
          <p className="text-gray-500">Manage your business details and store preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Business Details */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Business Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Business Name</label>
                <input type="text" defaultValue="Madras Wall Stories" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">GST Number</label>
                <input type="text" placeholder="e.g. 33AAAAA0000A1Z5" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Support Email</label>
                <input type="email" defaultValue="support@madraswallstories.com" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Phone</label>
                <input type="text" defaultValue="+91 " className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-gray-500">Business Address</label>
                <textarea rows="2" placeholder="Enter full business address" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue resize-none"></textarea>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Shipping & Payments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Shipping Charge (₹)</label>
                <input type="number" defaultValue="0" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Free Shipping Threshold (₹)</label>
                <input type="number" defaultValue="1000" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
            </div>
            
            <h3 className="text-sm font-bold mb-3 text-gray-700">Payment Methods</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Cash on Delivery (COD)</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-accent-blue accent-black rounded" />
              </label>
              <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">UPI & Cards (Razorpay)</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-accent-blue accent-black rounded" />
              </label>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Social Links */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Social Links</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">WhatsApp Number</label>
                <input type="text" placeholder="+91 " className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Instagram Profile</label>
                <input type="text" placeholder="https://instagram.com/madraswallstories" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue text-sm" />
              </div>
            </div>
          </div>

          {/* Legal Pages */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Legal & Policies</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Return Policy</label>
                <textarea rows="4" placeholder="Enter return policy details" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue resize-none text-sm"></textarea>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
