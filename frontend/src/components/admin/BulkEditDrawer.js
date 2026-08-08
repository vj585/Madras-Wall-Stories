"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
    <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const productTypeOptions = [
  'Standard Posters', 'Custom Posters', 'Standard Polaroids', 'Custom Polaroids', 'Standard Stickers'
];

const themeOptions = [
  'Anime', 'Movies', 'Marvel', 'Gaming', 'Cars', 'Music', 'Quotes', 'Sports', 'Nature', 'Travel', 'Minimal', 'Abstract', 'Vintage'
];

export default function BulkEditDrawer({ isOpen, onClose, selectedIds, existingProducts }) {
  const initialFormState = {
    category: '',
    status: '',
    theme: '',
    featured: '',
    trending: '',
    bestSeller: '',
    newArrival: '',
    customPrint: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setProgress(0);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setProgress(0);

    const updates = {};
    if (formData.category) updates.category = formData.category;
    if (formData.status) updates.status = formData.status;
    if (formData.theme) updates.theme = formData.theme;
    
    // Process boolean flags
    const flags = ['featured', 'trending', 'bestSeller', 'newArrival', 'customPrint'];
    flags.forEach(flag => {
      if (formData[flag] === 'Yes') updates[flag] = true;
      if (formData[flag] === 'No') updates[flag] = false;
    });

    if (Object.keys(updates).length === 0) {
      alert("No changes specified.");
      setIsSaving(false);
      return;
    }

    let successCount = 0;
    
    try {
      for (let i = 0; i < selectedIds.length; i++) {
        const id = selectedIds[i];
        
        // Find existing product to merge existing values where needed
        const existingProduct = existingProducts.find(p => p._id === id);
        if (!existingProduct) continue;

        // Construct final payload by merging existing variants (they are required by the PUT API)
        const payload = {
          ...updates,
          variants: existingProduct.variants || []
        };

        const res = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          successCount++;
        }
        
        setProgress(Math.round(((i + 1) / selectedIds.length) * 100));
      }

      if (successCount > 0) {
        onClose(true); // Signal refresh
      } else {
        alert("Failed to update products.");
      }
    } catch (error) {
      console.error("Bulk edit error:", error);
      alert("An error occurred during bulk edit.");
    } finally {
      setIsSaving(false);
    }
  };

  // Prevent background scrolling when open
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
            onClick={() => !isSaving && onClose()}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 z-[110] w-full md:w-[500px] h-[100dvh] bg-gray-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center z-10 shrink-0">
              <div>
                <h2 className="font-heading font-bold text-xl text-black">Bulk Edit</h2>
                <p className="text-xs text-gray-500 mt-0.5">Editing {selectedIds.length} products</p>
              </div>
              {!isSaving && (
                <button 
                  onClick={() => onClose()}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 hide-scrollbar relative">
              
              {isSaving && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-accent-blue mb-4" />
                  <p className="text-sm font-medium text-gray-700">Updating Products...</p>
                  <p className="text-xs text-gray-500 mt-1">{progress}% Complete</p>
                  <div className="w-48 h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-accent-blue transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-sm text-blue-800">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                <p>Only fields with a selected value will be updated. Leave fields as "Keep Existing" to preserve their current values.</p>
              </div>

              <Section title="General">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Product Type (Category)</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue"
                  >
                    <option value="">Keep Existing</option>
                    {productTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Theme / Collection</label>
                  <select 
                    name="theme" 
                    value={formData.theme} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue"
                  >
                    <option value="">Keep Existing</option>
                    {themeOptions.map(theme => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue"
                  >
                    <option value="">Keep Existing</option>
                    <option value="Active">Active (Visible)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </Section>

              <Section title="Visibility Flags">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['featured', 'trending', 'bestSeller', 'newArrival', 'customPrint'].map(flag => (
                    <div key={flag}>
                      <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
                        {flag.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <select 
                        name={flag} 
                        value={formData[flag]} 
                        onChange={handleChange} 
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue"
                      >
                        <option value="">Keep Existing</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  ))}
                </div>
              </Section>

            </div>

            {/* Footer */}
            <div className="bg-white p-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => onClose()}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Apply Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

