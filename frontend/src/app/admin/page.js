"use client";
import { useState, useEffect } from 'react';
import { IndianRupee, ShoppingBag, Package, Printer, CheckCircle, Truck, XCircle, ShoppingCart, Loader2, AlertTriangle, Plus, ListOrdered, Tag, Image as ImageIcon, Users, Settings } from 'lucide-react';
import Link from 'next/link';

// Indian formatting helper
const formatINR = (amount) => {
  if (!amount || amount === 0) return '₹0';
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
      <div className="space-y-8 pb-10 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <div className="w-48 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-64 h-4 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 h-32"></div>
          ))}
        </div>
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
    { title: "Today's Orders", value: d.todaysOrders || 0, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: "Today's Revenue", value: formatINR(d.todaysRevenue), icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-50' },
    { title: "Today's Courier Cost", value: formatINR(d.todaysCourierCost), icon: Truck, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: "Avg Courier Cost", value: formatINR(d.averageCourierCost), icon: IndianRupee, color: 'text-gray-500', bg: 'bg-gray-100' },
    { title: "Awaiting Printing", value: d.awaitingPrinting || 0, icon: Printer, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: "Awaiting QA", value: d.awaitingQualityCheck || 0, icon: CheckCircle, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: "Packed", value: d.packed || 0, icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: "Shipped", value: d.shipped || 0, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: "Delivered", value: d.delivered || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { title: "Cancelled", value: d.cancelledOrders || 0, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const recentOrders = d.recentOrders || [];
  const lowStockProducts = d.lowStockProducts || [];

  return (
    <div className="space-y-8 pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Dashboard</h1>
          <p className="text-gray-500">Welcome to your business overview.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
          <span className="text-sm text-gray-500">Top Selling:</span>
          <span className="font-bold text-sm">{d.topSellingProduct || 'N/A'}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <h3 className="text-gray-500 text-xs font-medium mb-1">{stat.title}</h3>
            <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <Link href="/admin/products" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group">
            <Plus className="w-6 h-6 mb-2 text-gray-500 group-hover:text-black" />
            <span className="text-xs font-medium">Add Product</span>
          </Link>
          <Link href="/admin/orders" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group">
            <ListOrdered className="w-6 h-6 mb-2 text-gray-500 group-hover:text-black" />
            <span className="text-xs font-medium">View Orders</span>
          </Link>
          <Link href="/admin/custom-prints" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group">
            <Printer className="w-6 h-6 mb-2 text-gray-500 group-hover:text-black" />
            <span className="text-xs font-medium">Custom Prints</span>
          </Link>
          <Link href="/admin/coupons" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group">
            <Tag className="w-6 h-6 mb-2 text-gray-500 group-hover:text-black" />
            <span className="text-xs font-medium">Coupons</span>
          </Link>
          <Link href="/admin/banners" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group">
            <ImageIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-black" />
            <span className="text-xs font-medium">Banners</span>
          </Link>
          <Link href="/admin/customers" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group">
            <Users className="w-6 h-6 mb-2 text-gray-500 group-hover:text-black" />
            <span className="text-xs font-medium">Customers</span>
          </Link>
          <Link href="/admin/settings" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group">
            <Settings className="w-6 h-6 mb-2 text-gray-500 group-hover:text-black" />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-lg">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-accent-blue hover:underline">View All</Link>
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
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
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

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-lg">Low Stock Alerts</h2>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <Package className="w-12 h-12 text-gray-200 mb-3" />
              <h3 className="font-bold text-gray-900 text-sm mb-1">Stock is healthy</h3>
              <p className="text-xs text-gray-500">All products have sufficient inventory.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-2">
              {lowStockProducts.map((product) => (
                <div key={product._id} className={`flex justify-between items-center p-3 rounded-xl border ${product.stock === 0 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                  <span className="font-medium text-sm line-clamp-1 flex-1 pr-3">{product.title}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} Left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
