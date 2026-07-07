"use client";
import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [framePricing, setFramePricing] = useState([]);
  const [deliverySettings, setDeliverySettings] = useState({
    freeShippingThreshold: 599,
    lowCartDeliveryFee: 49,
    mediumCartDeliveryFee: 29,
    sameDayChennaiFee: 99,
    serviceableCities: 'Chennai',
    pickupLat: 13.0827,
    pickupLng: 80.2707
  });
  const [businessDetails, setBusinessDetails] = useState({
    businessName: 'Madras Wall Stories',
    gstNumber: '',
    supportEmail: 'support@madraswallstories.com',
    phone: '+91 ',
    businessAddress: '',
    whatsappNumber: '',
    instagramProfile: '',
    returnPolicy: ''
  });
  const [marqueeItems, setMarqueeItems] = useState([
    { icon: "⚡", text: "FLASH SALE — UP TO 50% OFF" }
  ]);
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
        setDeliverySettings({
          freeShippingThreshold: data.data.freeShippingThreshold || 599,
          lowCartDeliveryFee: data.data.lowCartDeliveryFee || 49,
          mediumCartDeliveryFee: data.data.mediumCartDeliveryFee || 29,
          sameDayChennaiFee: data.data.sameDayChennaiFee || 99,
          serviceableCities: (data.data.serviceableCities || ['Chennai']).join(', '),
          pickupLat: data.data.pickupCoordinates?.latitude || 13.0827,
          pickupLng: data.data.pickupCoordinates?.longitude || 80.2707,
        });
        setBusinessDetails({
          businessName: data.data.businessName || 'Madras Wall Stories',
          gstNumber: data.data.gstNumber || '',
          supportEmail: data.data.supportEmail || 'support@madraswallstories.com',
          phone: data.data.phone || '+91 ',
          businessAddress: data.data.businessAddress || '',
          whatsappNumber: data.data.whatsappNumber || '',
          instagramProfile: data.data.instagramProfile || '',
          returnPolicy: data.data.returnPolicy || ''
        });
        if (data.data.marqueeItems && data.data.marqueeItems.length > 0) {
          setMarqueeItems(data.data.marqueeItems);
        }
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
        body: JSON.stringify({ 
          framePricing,
          marqueeItems,
          freeShippingThreshold: Number(deliverySettings.freeShippingThreshold),
          lowCartDeliveryFee: Number(deliverySettings.lowCartDeliveryFee),
          mediumCartDeliveryFee: Number(deliverySettings.mediumCartDeliveryFee),
          sameDayChennaiFee: Number(deliverySettings.sameDayChennaiFee),
          serviceableCities: deliverySettings.serviceableCities.split(',').map(c => c.trim()).filter(Boolean),
          pickupCoordinates: {
            latitude: Number(deliverySettings.pickupLat),
            longitude: Number(deliverySettings.pickupLng)
          },
          ...businessDetails
        })
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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Store Settings</h1>
          <p className="text-gray-500">Manage global store configurations and pricing rules.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 pr-3">
          {message && (
            <span className={`text-sm font-medium px-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Global Frame Pricing (Dynamic) */}
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

            </div>
          </div>

          {/* Marquee Settings */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-bold">Marquee Announcement Bar</h2>
              </div>
              <button 
                onClick={() => setMarqueeItems([...marqueeItems, { icon: '✦', text: 'NEW ANNOUNCEMENT' }])}
                className="text-sm font-medium text-accent-blue hover:text-blue-700"
              >
                + Add Item
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-2">
                Manage the scrolling text banner shown on the home page.
              </p>
              {marqueeItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={item.icon} 
                    onChange={(e) => {
                      const updated = [...marqueeItems];
                      updated[index].icon = e.target.value;
                      setMarqueeItems(updated);
                    }}
                    className="w-16 px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue text-center"
                    placeholder="Icon (e.g. ⚡)"
                  />
                  <input 
                    type="text" 
                    value={item.text} 
                    onChange={(e) => {
                      const updated = [...marqueeItems];
                      updated[index].text = e.target.value;
                      setMarqueeItems(updated);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue"
                    placeholder="Announcement Text"
                  />
                  <button 
                    onClick={() => {
                      const updated = marqueeItems.filter((_, i) => i !== index);
                      setMarqueeItems(updated);
                    }}
                    className="p-2 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              {marqueeItems.length === 0 && (
                <div className="text-sm text-gray-400 italic py-4">No marquee items added.</div>
              )}
            </div>
          </div>

          {/* Business Details (Static Mockup Restored) */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Business Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Business Name</label>
                <input type="text" value={businessDetails.businessName} onChange={(e) => setBusinessDetails({...businessDetails, businessName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">GST Number</label>
                <input type="text" value={businessDetails.gstNumber} onChange={(e) => setBusinessDetails({...businessDetails, gstNumber: e.target.value})} placeholder="e.g. 33AAAAA0000A1Z5" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Support Email</label>
                <input type="email" value={businessDetails.supportEmail} onChange={(e) => setBusinessDetails({...businessDetails, supportEmail: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Phone</label>
                <input type="text" value={businessDetails.phone} onChange={(e) => setBusinessDetails({...businessDetails, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-gray-500">Business Address</label>
                <textarea rows="2" value={businessDetails.businessAddress} onChange={(e) => setBusinessDetails({...businessDetails, businessAddress: e.target.value})} placeholder="Enter full business address" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue resize-none"></textarea>
              </div>
            </div>
          </div>

          {/* Delivery Configuration */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Delivery Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Free Shipping Threshold (₹)</label>
                <input type="number" value={deliverySettings.freeShippingThreshold} onChange={(e) => setDeliverySettings({...deliverySettings, freeShippingThreshold: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Low Cart Fee (Cart &lt; ₹299)</label>
                <input type="number" value={deliverySettings.lowCartDeliveryFee} onChange={(e) => setDeliverySettings({...deliverySettings, lowCartDeliveryFee: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Medium Cart Fee (Cart ₹299-₹599)</label>
                <input type="number" value={deliverySettings.mediumCartDeliveryFee} onChange={(e) => setDeliverySettings({...deliverySettings, mediumCartDeliveryFee: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Same Day Chennai Base Fee (₹)</label>
                <input type="number" value={deliverySettings.sameDayChennaiFee} onChange={(e) => setDeliverySettings({...deliverySettings, sameDayChennaiFee: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-gray-500">Serviceable Cities (Comma separated)</label>
                <input type="text" value={deliverySettings.serviceableCities} onChange={(e) => setDeliverySettings({...deliverySettings, serviceableCities: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" placeholder="Chennai" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Pickup Latitude</label>
                <input type="number" step="any" value={deliverySettings.pickupLat} onChange={(e) => setDeliverySettings({...deliverySettings, pickupLat: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Pickup Longitude</label>
                <input type="number" step="any" value={deliverySettings.pickupLng} onChange={(e) => setDeliverySettings({...deliverySettings, pickupLng: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue" />
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
          
          {/* Social Links (Static Mockup Restored) */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Social Links</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">WhatsApp Number</label>
                <input type="text" value={businessDetails.whatsappNumber} onChange={(e) => setBusinessDetails({...businessDetails, whatsappNumber: e.target.value})} placeholder="+91 " className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Instagram Profile</label>
                <input type="text" value={businessDetails.instagramProfile} onChange={(e) => setBusinessDetails({...businessDetails, instagramProfile: e.target.value})} placeholder="https://instagram.com/madraswallstories" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue text-sm" />
              </div>
            </div>
          </div>

          {/* Legal Pages (Static Mockup Restored) */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Legal & Policies</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Return Policy</label>
                <textarea rows="4" value={businessDetails.returnPolicy} onChange={(e) => setBusinessDetails({...businessDetails, returnPolicy: e.target.value})} placeholder="Enter return policy details" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-accent-blue resize-none text-sm"></textarea>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
