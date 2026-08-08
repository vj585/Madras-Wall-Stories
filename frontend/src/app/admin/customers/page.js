"use client";
import { useState, useEffect } from 'react';
import { Search, Filter, Users, Download, Mail, User as UserIcon } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('All');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      (customer.name && customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchQuery));
    
    let matchesType = true;
    if (customerFilter === 'Returning') {
      matchesType = customer.orders && customer.orders.length > 1;
    } else if (customerFilter === 'New') {
      matchesType = !customer.orders || customer.orders.length <= 1;
    }

    return matchesSearch && matchesType;
  });

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
          <select 
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none whitespace-nowrap min-w-[120px]"
          >
            <option value="All">All Customers</option>
            <option value="Returning">Returning</option>
            <option value="New">New</option>
          </select>
          <button className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none flex items-center gap-2 whitespace-nowrap hover:bg-gray-100 transition-colors cursor-not-allowed opacity-50">
            <Filter className="w-4 h-4" /> More Filters
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-center text-gray-500">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No customers found</h2>
            <p className="text-gray-500 max-w-sm mb-6">Your customer directory will populate here once you start receiving orders or account registrations.</p>
            <button className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2 cursor-not-allowed opacity-50">
              <Mail className="w-4 h-4" /> Send Welcome Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium text-center">Orders</th>
                  <th className="px-6 py-4 font-medium">Total Spent</th>
                  <th className="px-6 py-4 font-medium">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => {
                  const orderCount = customer.orders?.length || 0;
                  const totalSpent = customer.orders?.reduce((acc, order) => acc + (order.amount || 0), 0) || 0;
                  const lastOrderDate = customer.orders && customer.orders.length > 0 
                    ? new Date(Math.max(...customer.orders.map(o => new Date(o.createdAt).getTime()))).toLocaleDateString()
                    : 'N/A';

                  return (
                    <tr key={customer._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                            {customer.avatar ? (
                              <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.authProvider === 'google' ? 'Google Auth' : 'Email Auth'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 font-medium">{customer.email}</p>
                        <p className="text-gray-500 text-xs">{customer.phone || 'No phone'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full">
                          {orderCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        ₹{totalSpent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {lastOrderDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

