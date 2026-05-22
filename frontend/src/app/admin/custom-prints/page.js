"use client";
import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export default function CustomPricingAdmin() {
  const [pricing, setPricing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/custom-pricing');
      const data = await res.json();
      if (data.success) {
        setPricing(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/custom-pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Pricing updated successfully!');
      } else {
        setMessage('Failed to update pricing.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error saving pricing.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChange = (category, key, value) => {
    setPricing(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value === '' ? '' : Number(value)
      }
    }));
  };

  if (isLoading) return <div className="p-8 text-center">Loading pricing settings...</div>;
  if (!pricing) return <div className="p-8 text-center text-red-500">Failed to load settings.</div>;

  const renderSection = (title, category) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(pricing[category] || {}).map(([key, val]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{key} (₹)</label>
            <input 
              type="number" 
              value={val === '' ? '' : Number(val).toString()}
              onChange={(e) => handleChange(category, key, e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Custom Print Pricing</h1>
          <p className="text-gray-500">Manage base prices and add-on costs for all custom products.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-black text-white rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-70"
        >
          <Save className="w-5 h-5" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle className="w-5 h-5" /> {message}
        </div>
      )}

      {renderSection('Base Prices', 'basePrices')}
      {renderSection('Size Add-ons', 'sizes')}
      {renderSection('Frame Add-ons', 'frames')}
      {renderSection('Finish Add-ons', 'finishes')}
    </div>
  );
}
