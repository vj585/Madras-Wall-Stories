"use client";
import { useState, useEffect } from 'react';
import { IndianRupee, ShoppingBag, Users, TrendingUp, Package, FileImage, ShoppingCart, Loader2 } from 'lucide-react';

// Indian formatting helper
const formatINR = (amount) => {
  if (amount === 0) return '₹0';
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl">
        Error: {error}
      </div>
    );
  }

  const d = data || {};

  const stats = [
    { title: 'Total Revenue', value: formatINR(d.totalRevenue || 0), icon: IndianRupee, trend: '0%' },
    { title: 'Total Orders', value: d.totalOrders || '0', icon: ShoppingBag, trend: '0%' },
    { title: 'Pending Orders', value: d.pendingOrders || '0', icon: ShoppingCart, trend: '0%' },
    { title: 'Delivered Orders', value: d.deliveredOrders || '0', icon: Package, trend: '0%' },
    { title: 'Products Listed', value: d.productsListed || '0', icon: Package, trend: '0%' },
    { title: 'Custom Print Orders', value: d.customPrintOrders || '0', icon: FileImage, trend: '0%' },
    { title: 'Average Order Value', value: formatINR(d.averageOrderValue || 0), icon: IndianRupee, trend: '0%' },
    { title: 'Conversion Rate', value: '0%', icon: TrendingUp, trend: '0%' }, // Keep static for now
    { title: 'Cart Abandonment', value: '0%', icon: Users, trend: '0%' }, // Keep static for now
  ];

  const recentOrders = d.recentOrders || [];
  const topCategories = d.topCategories || [];

  return (
    <div className="space-y-8 pb-10">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Overview</h1>
          <p className="text-gray-500">Waiting for first orders. Welcome to your business dashboard.</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm">
          Download Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:border-gray-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{stat.trend}</span>
            </div>
            <h3 className="text-gray-500 text-xs md:text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-lg">Recent Orders</h2>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">No orders yet</h3>
              <p className="text-sm text-gray-500 max-w-sm">When customers place orders on your store, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium whitespace-nowrap">Order ID</th>
                    <th className="p-4 font-medium whitespace-nowrap">Customer</th>
                    <th className="p-4 font-medium whitespace-nowrap">Date</th>
                    <th className="p-4 font-medium whitespace-nowrap">Amount</th>
                    <th className="p-4 font-medium whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium whitespace-nowrap">{order.id}</td>
                      <td className="p-4 whitespace-nowrap">{order.customer}</td>
                      <td className="p-4 text-gray-500 whitespace-nowrap">{order.date}</td>
                      <td className="p-4 font-bold whitespace-nowrap">{formatINR(order.amount)}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="font-bold text-lg mb-6">Top Categories</h2>
          {topCategories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <Package className="w-12 h-12 text-gray-200 mb-3" />
              <h3 className="font-bold text-gray-900 text-sm mb-1">No data available</h3>
              <p className="text-xs text-gray-500">Sales data will appear here.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
              {topCategories.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <span className="font-medium">{cat.name}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">{cat.count} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
