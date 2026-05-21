"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, AlertCircle } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
    <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export default function UploadBannerDrawer({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    targetUrl: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});
  const [bannerImage, setBannerImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Banner Title required";
    if (!bannerImage) newErrors.bannerImage = "Banner Image required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (status) => {
    if (status === 'Active' && !validate()) return;
    console.log("Saving Banner:", { ...formData, status, bannerImage });
    onClose();
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
                <h2 className="font-heading font-bold text-xl text-black">Upload Banner</h2>
                <p className="text-xs text-gray-500 mt-0.5">Add a new hero banner to your homepage</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 hide-scrollbar">
              
              <Section title="Media">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Banner Image (Desktop & Mobile) *</label>
                  <div className={`w-full h-40 border-2 border-dashed ${errors.bannerImage ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-accent-blue hover:bg-blue-50/50 transition-colors`}>
                    <UploadCloud className={`w-6 h-6 mb-2 ${errors.bannerImage ? 'text-red-400' : 'text-gray-400'}`} />
                    <span className="text-xs font-medium text-gray-600">Drop image here or click to upload</span>
                    <span className="text-[10px] text-gray-400 mt-1">Recommended: 1920x800 for Desktop, 800x800 for Mobile</span>
                  </div>
                  {errors.bannerImage && <p className="text-red-500 text-xs mt-1">{errors.bannerImage}</p>}
                </div>
              </Section>

              <Section title="Banner Details">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Banner Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className={`w-full px-3 py-2 bg-white border ${errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-accent-blue'} rounded-lg text-sm outline-none focus:ring-1`} placeholder="e.g., Summer Sale 2026" />
                  {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.title}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target URL / Link</label>
                  <input type="text" name="targetUrl" value={formData.targetUrl} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" placeholder="e.g., /category/posters" />
                </div>
              </Section>

            </div>

            {/* Footer */}
            <div className="bg-white p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-3 z-10 shrink-0">
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => handleSave('Draft')}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-100 text-gray-900 font-medium hover:bg-gray-200 rounded-xl transition-colors text-sm"
                >
                  Save Draft
                </button>
                <button 
                  onClick={() => handleSave('Active')}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-black text-white font-medium hover:bg-gray-800 rounded-xl transition-colors text-sm shadow-sm"
                >
                  Publish Banner
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
