"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
    <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

export default function UploadBannerDrawer({ isOpen, onClose, onSave }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ title: '', targetUrl: '' });
  const [errors, setErrors] = useState({});
  const [bannerImage, setBannerImage] = useState(null);   // Cloudinary URL
  const [previewUrl, setPreviewUrl] = useState(null);     // local preview
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Reset when drawer opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ title: '', targetUrl: '' });
      setErrors({});
      setBannerImage(null);
      setPreviewUrl(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // ─── Upload to Cloudinary via /api/upload ────────────────────────────────
  const uploadFile = async (file) => {
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, bannerImage: 'Only JPG, PNG, or WEBP allowed.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, bannerImage: 'File exceeds 10MB limit.' }));
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setBannerImage(null);
    setErrors(prev => ({ ...prev, bannerImage: null }));

    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setBannerImage(data.imageUrl);
      } else {
        setErrors(prev => ({ ...prev, bannerImage: data.error || 'Upload failed.' }));
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error('Banner upload error:', err);
      setErrors(prev => ({ ...prev, bannerImage: 'Upload failed. Check your connection.' }));
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => uploadFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const removeImage = () => {
    setBannerImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Validate ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Banner Title is required.';
    if (!bannerImage) newErrors.bannerImage = isUploading ? 'Please wait for upload to finish.' : 'Banner Image is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Save ────────────────────────────────────────────────────────────────
  const handleSave = async (status) => {
    if (status === 'Active' && !validate()) return;
    if (isSaving || isUploading) return;

    try {
      setIsSaving(true);
      const payload = {
        image: bannerImage || '',
        title: formData.title,
        targetUrl: formData.targetUrl,
        status,
      };

      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        if (onSave) onSave(data.data);
        onClose();
      } else {
        alert(data.error || 'Failed to save banner.');
      }
    } catch (err) {
      console.error('Banner save error:', err);
      alert('Something went wrong saving the banner.');
    } finally {
      setIsSaving(false);
    }
  };

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
            className="fixed inset-y-0 right-0 z-[110] w-full md:w-[80%] lg:w-[520px] bg-gray-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
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
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Banner Image (Desktop &amp; Mobile) *
                  </label>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* Upload Zone */}
                  {!previewUrl ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
                        ${isDragging ? 'border-accent-blue bg-blue-50 scale-[1.01]' : errors.bannerImage ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-accent-blue hover:bg-blue-50/40'}`}
                    >
                      <UploadCloud className={`w-8 h-8 mb-2 ${errors.bannerImage ? 'text-red-400' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-600">
                        {isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-1">JPG, PNG, WEBP · Max 10MB</span>
                      <span className="text-[11px] text-gray-400">Recommended: 1920×800 for Desktop</span>
                    </div>
                  ) : (
                    /* Preview with overlay */
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <img src={previewUrl} alt="Banner preview" className="w-full h-full object-cover" />

                      {/* Upload progress overlay */}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                          <span className="text-white text-sm font-medium">Uploading to Cloudinary…</span>
                        </div>
                      )}

                      {/* Done overlay */}
                      {!isUploading && bannerImage && (
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>

                      {/* Re-upload button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 text-xs bg-white/90 hover:bg-white text-gray-700 font-medium px-3 py-1.5 rounded-full shadow transition-colors"
                      >
                        Change Image
                      </button>
                    </div>
                  )}

                  {errors.bannerImage && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.bannerImage}
                    </p>
                  )}
                </div>
              </Section>

              <Section title="Banner Details">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Banner Title *</label>
                  <input
                    type="text" name="title" value={formData.title} onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white border ${errors.title ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-accent-blue'} rounded-lg text-sm outline-none focus:ring-1`}
                    placeholder="e.g., Summer Sale 2026"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.title}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target URL / Link</label>
                  <input
                    type="text" name="targetUrl" value={formData.targetUrl} onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue"
                    placeholder="e.g., /category/posters"
                  />
                </div>
              </Section>

            </div>

            {/* Footer */}
            <div className="bg-white p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-3 shrink-0">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleSave('Draft')}
                  disabled={isSaving || isUploading}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-100 text-gray-900 font-medium hover:bg-gray-200 rounded-xl transition-colors text-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving…' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSave('Active')}
                  disabled={isSaving || isUploading}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-black text-white font-medium hover:bg-gray-800 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Publishing…' : 'Publish Banner'}
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
