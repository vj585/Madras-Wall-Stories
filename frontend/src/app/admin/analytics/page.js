"use client";
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Analytics</h1>
          <p className="text-gray-500">Track your business growth and performance.</p>
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm outline-none shadow-sm font-medium">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-lg">Revenue Trend</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <BarChart3 className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-sm">Waiting for customer activity</h3>
            <p className="text-xs text-gray-500 max-w-[200px]">Analytics available after your first customer activity.</p>
          </div>
        </div>

        {/* Orders Trend */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-lg">Orders Trend</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Activity className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-sm">Waiting for customer activity</h3>
            <p className="text-xs text-gray-500 max-w-[200px]">Analytics available after your first customer activity.</p>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-lg">Top Categories</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <PieChart className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-sm">Waiting for customer activity</h3>
            <p className="text-xs text-gray-500 max-w-[200px]">Analytics available after your first customer activity.</p>
          </div>
        </div>

        {/* Custom Print Orders */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-lg">Custom Print Orders</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <BarChart3 className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-sm">Waiting for customer activity</h3>
            <p className="text-xs text-gray-500 max-w-[200px]">Analytics available after your first customer activity.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

