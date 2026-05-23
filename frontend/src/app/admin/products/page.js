"use client";
import { useState, useEffect } from 'react';
import { Search, Plus, Filter, PackageOpen } from 'lucide-react';
import AddProductDrawer from '@/components/admin/AddProductDrawer';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchProducts();
        }
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    }
  };

  const handleToggleStock = async (product) => {
    const displayStock = product.variants?.length > 0 
      ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0) 
      : product.stock;
      
    const newStockValue = displayStock > 0 ? 0 : 10;
    
    const updatedVariants = (product.variants || []).map(v => ({
      ...v,
      stock: newStockValue
    }));

    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants: updatedVariants })
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to update stock", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Products</h1>
          <p className="text-gray-500">Manage your catalog, pricing, and stock.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setIsDrawerOpen(true);
          }}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Product Name or Slug..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-accent-blue outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none whitespace-nowrap min-w-[120px]"
          >
            <option value="All">All Categories</option>
            <option value="Posters">Posters</option>
            <option value="Polaroids">Polaroids</option>
            <option value="Custom">Custom Prints</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none whitespace-nowrap min-w-[120px]"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <button className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none flex items-center gap-2 whitespace-nowrap hover:bg-gray-100 transition-colors">
            <Filter className="w-4 h-4" /> More Filters
          </button>
        </div>
      </div>

      {/* Products Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-center text-gray-500">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Upload your first poster</h2>
            <p className="text-gray-500 max-w-sm mb-6">Add products to your catalog to start selling. Make sure you have high-quality images ready.</p>
            <button 
              onClick={() => {
                setEditingProduct(null);
                setIsDrawerOpen(true);
              }}
              className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const displayPrice = product.variants?.length > 0 ? product.variants[0].price : product.price;
                  const displayStock = product.variants?.length > 0 ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : product.stock;
                  
                  return (
                  <tr key={product._id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><PackageOpen className="w-5 h-5"/></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.title}</p>
                          <p className="text-xs text-gray-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">₹{displayPrice}{product.variants?.length > 1 ? '+' : ''}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${displayStock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {displayStock > 0 ? `${displayStock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleToggleStock(product)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 ${displayStock > 0 ? 'bg-green-500' : 'bg-gray-300'}`}
                          title={displayStock > 0 ? 'In Stock (Click to Mark OOS)' : 'Out of Stock (Click to Restock)'}
                        >
                          <span className="sr-only">Toggle stock</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${displayStock > 0 ? 'translate-x-4' : 'translate-x-0'}`}
                          />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setIsDrawerOpen(true);
                          }}
                          className="text-accent-blue hover:text-blue-700 font-medium text-xs"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddProductDrawer 
        isOpen={isDrawerOpen} 
        editingProduct={editingProduct}
        onClose={(shouldRefresh) => {
          setIsDrawerOpen(false);
          setEditingProduct(null);
          if (shouldRefresh === true) fetchProducts();
        }} 
      />
    </div>
  );
}
