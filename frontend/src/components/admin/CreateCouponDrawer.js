"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
    <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export default function CreateCouponDrawer({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    minOrderAmount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase().replace(/\s+/g, '') : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.code) newErrors.code = "Coupon Code required";
    if (!formData.discountValue) newErrors.discountValue = "Discount value required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (status) => {
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          active: status === 'Active',
          discountValue: Number(formData.discountValue),
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
          minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
        })
      });

      const data = await res.json();
      
      if (data.success) {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setFormData({
          code: '',
          discountType: 'Percentage',
          discountValue: '',
          minOrderAmount: '',
          usageLimit: '',
          startDate: '',
          endDate: '',
          status: 'Active'
        });
      } else {
        setErrors({ submit: data.error || 'Failed to create coupon' });
      }
    } catch (err) {
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-[110] w-full md:w-[80%] lg:w-[520px] bg-gray-50 flex flex-col shadow-2xl safe-top safe-bottom"
          >
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center z-10 shrink-0">
              <div>
                <h2 className="font-heading font-bold text-xl text-black">Create Coupon</h2>
                <p className="text-xs text-gray-500 mt-0.5">Generate a new discount code</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 hide-scrollbar">
              
              <Section title="Coupon Details">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Coupon Code *</label>
                  <input type="text" name="code" value={formData.code} onChange={handleChange} className={`w-full px-3 py-2 bg-white border ${errors.code ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-accent-blue'} rounded-lg text-sm outline-none focus:ring-1 uppercase`} placeholder="e.g., WELCOME10" />
                  {errors.code && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.code}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
                    <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue">
                      <option>Percentage</option>
                      <option>Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Value *</label>
                    <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} className={`w-full px-3 py-2 bg-white border ${errors.discountValue ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-accent-blue'} rounded-lg text-sm outline-none focus:ring-1`} placeholder="e.g., 10" />
                  </div>
                </div>
              </Section>

              <Section title="Usage Conditions">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
                    <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Usage Limit</label>
                    <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" placeholder="Total uses" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue text-gray-600" />
                  </div>
                </div>
              </Section>

            </div>

            {/* Footer */}
            <div className="bg-white p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-3 z-10 shrink-0">
              <button 
                onClick={onClose}
                disabled={isSaving}
                className="w-full sm:w-auto px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <div className="flex gap-3 w-full sm:w-auto items-center">
                {errors.submit && <span className="text-red-500 text-xs font-medium mr-2">{errors.submit}</span>}
                <button 
                  onClick={() => handleSave('Draft')}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-100 text-gray-900 font-medium hover:bg-gray-200 rounded-xl transition-colors text-sm disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button 
                  onClick={() => handleSave('Active')}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-black text-white font-medium hover:bg-gray-800 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>}
                  Create Coupon
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

