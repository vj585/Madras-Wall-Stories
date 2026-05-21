"use client";
import { useState } from 'react';
import { Search, Filter, Users, Download, Mail } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]); // Empty state
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Customers</h1>
          <p className="text-gray-500">Manage your customer relationships and view order history.</p>
        </div>
        <button className="bg-white text-black border border-gray-200 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Name, Email, or Phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-accent-blue outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <select className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none whitespace-nowrap min-w-[120px]">
            <option value="All">All Customers</option>
            <option value="Returning">Returning</option>
            <option value="New">New</option>
          </select>
          <button className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none flex items-center gap-2 whitespace-nowrap hover:bg-gray-100 transition-colors">
            <Filter className="w-4 h-4" /> More Filters
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
        {customers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No customers yet</h2>
            <p className="text-gray-500 max-w-sm mb-6">Your customer directory will populate here once you start receiving orders or account registrations.</p>
            <button className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2 cursor-not-allowed opacity-50">
              <Mail className="w-4 h-4" /> Send Welcome Campaign
            </button>
          </div>
        ) : (
          <div className="p-6">
            <p>Customers list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
