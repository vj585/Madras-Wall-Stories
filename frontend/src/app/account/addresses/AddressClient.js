"use client";
import { useState } from 'react';
import { Plus, MapPin, MoreVertical, Star, Check, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddressClient({ initialAddresses = [], defaultAddressId = null }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [defaultId, setDefaultId] = useState(defaultAddressId);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const initialForm = {
    fullName: '',
    phone: '',
    houseOrApartment: '',
    street: '',
    areaOrLocality: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
    isDefault: false
  };

  const [formData, setFormData] = useState(initialForm);

  const openAddDrawer = () => {
    setEditingAddress(null);
    setFormData(initialForm);
    setIsDrawerOpen(true);
    setActiveDropdown(null);
  };

  const openEditDrawer = (address) => {
    setEditingAddress(address);
    setFormData({
      ...address,
      isDefault: defaultId === address._id
    });
    setIsDrawerOpen(true);
    setActiveDropdown(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingAddress ? `/api/account/addresses/${editingAddress._id}` : '/api/account/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
        if (formData.isDefault || data.data.length === 1) {
          // Identify the new default ID if it was set
          const targetAddress = editingAddress 
            ? data.data.find(a => a._id === editingAddress._id) 
            : data.data[data.data.length - 1];
            
          if (targetAddress) setDefaultId(targetAddress._id);
        }
        setIsDrawerOpen(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
        if (defaultId === id) setDefaultId(data.data.length > 0 ? data.data[0]._id : null);
      }
    } catch (error) {
      console.error(error);
    }
    setActiveDropdown(null);
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}/default`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setDefaultId(id);
      }
    } catch (error) {
      console.error(error);
    }
    setActiveDropdown(null);
  };

  return (
    <>
      {addresses.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No addresses saved yet</h2>
          <p className="text-gray-500 mb-8 max-w-sm">Save your delivery addresses here for a faster checkout experience.</p>
          <button 
            onClick={openAddDrawer}
            className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add New Button Card */}
          <button 
            onClick={openAddDrawer}
            className="group flex flex-col items-center justify-center p-8 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl hover:border-accent-blue hover:bg-blue-50/30 transition-all duration-300 min-h-[250px]"
          >
            <div className="w-14 h-14 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-4">
              <Plus className="w-6 h-6 text-accent-blue" />
            </div>
            <span className="font-bold text-gray-900 group-hover:text-accent-blue transition-colors">Add New Address</span>
          </button>

          {/* Address Cards */}
          {addresses.map(address => (
            <div key={address._id} className={`relative bg-white p-6 rounded-3xl border ${defaultId === address._id ? 'border-accent-blue shadow-md' : 'border-gray-100 shadow-sm'} transition-all duration-300 flex flex-col min-h-[250px]`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    {address.addressType === 'Home' ? <MapPin className="w-3 h-3"/> : null}
                    {address.addressType}
                  </span>
                  {defaultId === address._id && (
                    <span className="bg-blue-50 text-accent-blue text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-current" /> Default
                    </span>
                  )}
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === address._id ? null : address._id)}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {activeDropdown === address._id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 origin-top-right">
                      <div className="p-1.5 flex flex-col">
                        <button onClick={() => openEditDrawer(address)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium">
                          <Edit2 className="w-4 h-4 text-gray-400" /> Edit Address
                        </button>
                        {defaultId !== address._id && (
                          <button onClick={() => handleSetDefault(address._id)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium">
                            <Check className="w-4 h-4 text-gray-400" /> Set as Default
                          </button>
                        )}
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button onClick={() => handleDelete(address._id)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
                          <Trash2 className="w-4 h-4" /> Delete Address
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-1 text-gray-600 text-sm">
                <p className="font-bold text-gray-900 text-base mb-2">{address.fullName}</p>
                <p>{address.houseOrApartment}, {address.street}</p>
                {address.areaOrLocality && <p>{address.areaOrLocality}</p>}
                {address.landmark && <p>Landmark: {address.landmark}</p>}
                <p>{address.city}, {address.state} {address.pincode}</p>
                <p className="mt-3 text-gray-900 font-medium">Phone: {address.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-[110] w-full md:w-[500px] bg-white flex flex-col shadow-2xl safe-top safe-bottom"
            >
              <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center z-10 bg-white">
                <div>
                  <h2 className="font-heading font-bold text-xl text-gray-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Fill in your delivery details below.</p>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 hide-scrollbar bg-gray-50/30">
                <form id="address-form" onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name *</label>
                      <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number *</label>
                      <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">House / Apartment *</label>
                    <input required type="text" value={formData.houseOrApartment} onChange={e => setFormData({...formData, houseOrApartment: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Street *</label>
                    <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Area / Locality</label>
                      <input type="text" value={formData.areaOrLocality} onChange={e => setFormData({...formData, areaOrLocality: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Landmark</label>
                      <input type="text" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">City *</label>
                      <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">State *</label>
                      <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Pincode *</label>
                      <input required type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Address Type</label>
                    <div className="flex gap-3">
                      {['Home', 'Work', 'Other'].map(type => (
                        <label key={type} className={`flex-1 flex items-center justify-center py-3 rounded-xl border cursor-pointer font-medium text-sm transition-all ${formData.addressType === type ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                          <input type="radio" name="addressType" value={type} checked={formData.addressType === type} onChange={e => setFormData({...formData, addressType: e.target.value})} className="hidden" />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 pb-10">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${formData.isDefault ? 'bg-accent-blue' : 'bg-gray-100 border border-gray-200 group-hover:border-accent-blue'}`}>
                        {formData.isDefault && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <input type="checkbox" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="hidden" />
                      <span className="text-gray-700 font-medium select-none">Set as default delivery address</span>
                    </label>
                  </div>
                </form>
              </div>

              <div className="p-4 md:p-6 bg-white border-t border-gray-100 z-10 shrink-0">
                <button 
                  type="submit" 
                  form="address-form" 
                  disabled={isSaving}
                  className="w-full h-14 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

