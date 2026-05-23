"use client";
import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [framePricing, setFramePricing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setFramePricing(data.data.framePricing || []);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkupChange = (index, value) => {
    const updated = [...framePricing];
    updated[index].markup = Number(value);
    setFramePricing(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ framePricing })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error("Failed to save", error);
      setMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 pb-10 max-w-4xl">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Store Settings</h1>
        <p className="text-gray-500">Manage global store configurations and pricing rules.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <Settings className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-bold">Global Frame Pricing</h2>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">
            Set the price markup for each frame type. This markup will be added to the base variant price dynamically on the storefront.
          </p>

          <div className="space-y-4 max-w-md">
            {framePricing.map((frame, index) => (
              <div key={frame.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-medium text-gray-900">{frame.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium">₹</span>
                  <input 
                    type="number" 
                    value={frame.markup} 
                    onChange={(e) => handleMarkupChange(index, e.target.value)}
                    className="w-24 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue font-medium"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            {message && (
              <span className={`text-sm font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
