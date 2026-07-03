"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, UploadCloud, AlertCircle, Plus, Check } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
    <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const categoryOptions = ['Posters', 'Standard Posters', 'Premium Posters', 'Polaroids', 'Stickers', 'Custom Prints', 'Apparel'];

export default function AddProductDrawer({ isOpen, onClose, editingProduct = null, existingProducts = [] }) {
  // Form State
  const initialFormState = {
    name: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    category: 'Standard Posters',
    theme: '',
    subcategory: '',
    tags: '',
    seoKeywords: '',
    variants: [
      { size: 'A4', price: '', salePrice: '', costPrice: '', stock: '', gst: '0', frames: [], enabled: true }
    ],
    status: 'Draft',
    orientation: 'Portrait',
    finish: 'Matte',
    featured: false,
    trending: false,
    bestSeller: false,
    newArrival: false,
    customPrint: false,
    weight: '',
    packagingType: 'Tube',
    shippingClass: 'Standard',
    freeShipping: false,
    metaTitle: '',
    metaDescription: '',
    displayOrder: 0
  };

  const [formData, setFormData] = useState(initialFormState);

  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [errors, setErrors] = useState({});
  const [primaryImage, setPrimaryImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        const themeValue = editingProduct.theme || editingProduct.subcategory || '';
        const isCustom = themeValue && !themeOptions.includes(themeValue);
        
        setFormData({
          ...initialFormState,
          name: editingProduct.title || '',
          slug: editingProduct.slug || '',
          shortDescription: editingProduct.shortDescription || '',
          fullDescription: editingProduct.description || '',
          category: editingProduct.category || 'Standard Posters',
          theme: themeValue,
          subcategory: editingProduct.subcategory || '',
          tags: editingProduct.tags?.join(', ') || '',
          variants: editingProduct.variants?.length > 0 ? editingProduct.variants : initialFormState.variants,
          status: editingProduct.status || 'Draft',
          orientation: editingProduct.orientation || 'Portrait',
          finish: editingProduct.printFinish || 'Matte',
          featured: editingProduct.featured || false,
          trending: editingProduct.trending || false,
          newArrival: editingProduct.newArrival || false,
        });
        setIsSlugManual(true);
        setIsCustomTheme(isCustom);
        if (editingProduct.images && editingProduct.images.length > 0) {
          setPrimaryImage(editingProduct.images[0]);
          setGalleryImages(editingProduct.images.slice(1));
        } else {
          setPrimaryImage(null);
          setGalleryImages([]);
        }
      } else {
        setFormData(initialFormState);
        setIsSlugManual(false);
        setIsCustomTheme(false);
        setPrimaryImage(null);
        setGalleryImages([]);
        setErrors({});
      }
    }
  }, [isOpen, editingProduct]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isSlugManual) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, isSlugManual]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'slug') {
      setIsSlugManual(true);
    }

    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'slug' && typeof finalValue === 'string') {
      finalValue = finalValue.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    // Clear error if user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const productTypeOptions = [
    'Standard Posters', 'Custom Posters', 'Standard Polaroids', 'Custom Polaroids', 'Standard Stickers'
  ];

  const themeOptions = [
    'Anime', 'Movies', 'Marvel', 'Gaming', 'Cars', 'Music', 'Quotes', 'Sports', 'Nature', 'Travel', 'Minimal', 'Abstract', 'Vintage'
  ];

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const handleVariantFrameToggle = (index, frame) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const variant = { ...newVariants[index] };
      const frames = variant.frames || [];
      if (frames.includes(frame)) {
        variant.frames = frames.filter(f => f !== frame);
      } else {
        variant.frames = [...frames, frame];
      }
      newVariants[index] = variant;
      return { ...prev, variants: newVariants };
    });
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { size: 'A3', price: '', salePrice: '', costPrice: '', stock: '', gst: '0', frames: [], enabled: true }
      ]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Utility to compress images client-side before upload
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      // If file is already small (< 2MB), skip compression
      if (file.size < 2 * 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image(); // Use window.Image to avoid conflict with lucide-react Image
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions (e.g., 2000px max width/height for web viewing)
          const MAX_SIZE = 2000;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 80% quality
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleImageUpload = async (e) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    try {
      setIsUploading(true);
      const file = await compressImage(rawFile);
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error('Image is too large (exceeds Vercel 4.5MB limit). Please compress the image.');
        }
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setPrimaryImage(data.imageUrl);
        setErrors(prev => ({ ...prev, primaryImage: null }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setIsUploadingGallery(true);
      
      const uploadPromises = files.map(async (rawFile) => {
        const file = await compressImage(rawFile);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });
        
        if (!res.ok) {
          if (res.status === 413) throw new Error('One or more images are too large (exceeds Vercel 4.5MB limit).');
          throw new Error(`Upload failed with status ${res.status}`);
        }

        const data = await res.json();
        if (data.success) return data.imageUrl;
        throw new Error(data.error);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setGalleryImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Gallery upload error:', error);
      alert('Failed to upload some gallery images.');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...galleryImages];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    
    setGalleryImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  const removeGalleryImage = (indexToRemove) => {
    setGalleryImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Product Name required";
    if (!formData.category) newErrors.category = "Category required";
    if (!primaryImage) newErrors.primaryImage = "Primary Image required";
    if (formData.variants.length === 0) newErrors.variants = "At least one variant is required";
    formData.variants.forEach((v, i) => {
      if (!v.price) newErrors[`variant_${i}_price`] = "Price required";
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status) => {
    if (status === 'Active' && !validate()) {
      return; // Prevent publishing if invalid
    }
    
    try {
      setIsSaving(true);
      const payload = {
        title: formData.name,
        slug: formData.slug,
        description: formData.fullDescription,
        shortDescription: formData.shortDescription,
        category: formData.category,
        subcategory: formData.subcategory,
        images: primaryImage ? [primaryImage, ...galleryImages] : galleryImages,
        variants: formData.variants.map(v => ({
          ...v,
          price: Number(v.price),
          salePrice: v.salePrice ? Number(v.salePrice) : undefined,
          costPrice: v.costPrice ? Number(v.costPrice) : undefined,
          stock: Number(v.stock) || 0,
          gst: 0,
        })),
        featured: formData.featured,
        trending: formData.trending,
        newArrival: formData.newArrival,
        bestSeller: formData.bestSeller,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        orientation: formData.orientation,
        printFinish: formData.finish,
        status: status,
        theme: formData.theme,
        displayOrder: Number(formData.displayOrder) || 0,
      };

      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        onClose(true); // Signal parent to refresh
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 z-[110] w-full md:w-[80%] lg:w-[600px] h-[100dvh] bg-gray-50 flex flex-col shadow-2xl"
          >
            {/* Header - Fixed */}
            <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center z-10 shrink-0">
              <div>
                <h2 className="font-heading font-bold text-xl text-black">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{editingProduct ? 'Update existing product' : 'Create a new poster or print'}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 hide-scrollbar">
              
              <Section title="1. Basic Info">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} list="existing-products" className={`w-full px-3 py-2 bg-white border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-accent-blue'} rounded-lg text-sm outline-none focus:ring-1`} placeholder="e.g., Spider Man Across Poster" />
                  <datalist id="existing-products">
                    {Array.from(new Set(existingProducts.map(p => p.title))).map((title, idx) => (
                      <option key={idx} value={title} />
                    ))}
                  </datalist>
                  <datalist id="existing-prices">
                    {Array.from(new Set(existingProducts.flatMap(p => p.variants?.map(v => v.price) || []).filter(Boolean))).sort((a,b)=>a-b).map((price, idx) => (
                      <option key={idx} value={price} />
                    ))}
                  </datalist>
                  <datalist id="existing-sale-prices">
                    {Array.from(new Set(existingProducts.flatMap(p => p.variants?.map(v => v.salePrice) || []).filter(Boolean))).sort((a,b)=>a-b).map((price, idx) => (
                      <option key={idx} value={price} />
                    ))}
                  </datalist>
                  <datalist id="existing-cost-prices">
                    {Array.from(new Set(existingProducts.flatMap(p => p.variants?.map(v => v.costPrice) || []).filter(Boolean))).sort((a,b)=>a-b).map((price, idx) => (
                      <option key={idx} value={price} />
                    ))}
                  </datalist>
                  {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slug *</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="2" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Description</label>
                  <textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange} rows="4" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue resize-none"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Type *</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue"
                    >
                      {productTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Theme / Collection</label>
                    <select 
                      name="themeSelect" 
                      value={isCustomTheme ? 'Other' : (themeOptions.includes(formData.theme) ? formData.theme : (formData.theme ? 'Other' : ''))} 
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          setIsCustomTheme(true);
                          if(themeOptions.includes(formData.theme)) {
                            setFormData(prev => ({ ...prev, theme: '' }));
                          }
                        } else {
                          setIsCustomTheme(false);
                          setFormData(prev => ({ ...prev, theme: e.target.value }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue"
                    >
                      <option value="">Select Theme (Optional)</option>
                      {themeOptions.map(theme => (
                        <option key={theme} value={theme}>{theme}</option>
                      ))}
                      <option value="Other">Other (Specify below)</option>
                    </select>
                  </div>
                </div>
                
                {isCustomTheme && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Custom Theme</label>
                    <input 
                      type="text" 
                      name="theme" 
                      value={formData.theme} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" 
                      placeholder="e.g. Cyberpunk" 
                    />
                  </div>
                )}

                <div className="mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" placeholder="e.g. Marvel, Miles Morales, Action" />
                  </div>
                </div>
              </Section>

              <Section title="2. Pricing & Variants">
                {errors.variants && <p className="text-red-500 text-xs mb-3 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.variants}</p>}
                
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative">
                      {formData.variants.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeVariant(index)}
                          className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 pr-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Size *</label>
                          <select 
                            value={variant.size} 
                            onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue"
                          >
                            <option>A5</option>
                            <option>A4</option>
                            <option>A3</option>
                            <option>A2</option>
                            <option>13x19</option>
                            <option>Custom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Base Price (MRP) ₹ *</label>
                          <input 
                            type="number" 
                            value={variant.price} 
                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                            list="existing-prices"
                            className={`w-full px-3 py-2 bg-white border ${errors[`variant_${index}_price`] ? 'border-red-300' : 'border-gray-200'} rounded-lg text-sm outline-none focus:ring-1`} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Sale Price ₹</label>
                          <input 
                            type="number" 
                            value={variant.salePrice || ''} 
                            onChange={(e) => handleVariantChange(index, 'salePrice', e.target.value)}
                            list="existing-sale-prices"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Cost Price ₹</label>
                          <input 
                            type="number" 
                            value={variant.costPrice || ''} 
                            onChange={(e) => handleVariantChange(index, 'costPrice', e.target.value)}
                            list="existing-cost-prices"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                          <input 
                            type="number" 
                            value={variant.stock || ''} 
                            onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" 
                          />
                        </div>

                      </div>

                      <div className="border-t border-gray-200 pt-3 mt-1">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Frames Available</label>
                        <div className="flex flex-wrap gap-2">
                          {['Black', 'White', 'Wood', 'No Frame'].map(frame => (
                            <label key={frame} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs cursor-pointer hover:bg-gray-50 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={(variant.frames || []).includes(frame)} 
                                onChange={() => handleVariantFrameToggle(index, frame)} 
                                className="rounded text-accent-blue" 
                              />
                              {frame}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={addVariant}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-accent-blue hover:text-accent-blue hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Size Variant
                  </button>
                </div>
              </Section>

              <Section title="3. Media (Images)">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Primary Image *</label>
                  <label className={`w-full h-32 border-2 border-dashed ${errors.primaryImage ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-accent-blue hover:bg-blue-50/50 transition-colors overflow-hidden relative`}>
                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleImageUpload} disabled={isUploading} />
                    {primaryImage ? (
                      <img src={primaryImage} alt="Primary" className="w-full h-full object-contain" />
                    ) : (
                      <>
                        <UploadCloud className={`w-6 h-6 mb-2 ${errors.primaryImage ? 'text-red-400' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium text-gray-600">
                          {isUploading ? 'Uploading...' : 'Drop image here or click to upload'}
                        </span>
                        {!isUploading && <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP</span>}
                      </>
                    )}
                  </label>
                  {errors.primaryImage && <p className="text-red-500 text-xs mt-1">{errors.primaryImage}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Gallery Images (Drag to reorder)</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 min-h-[5rem]">
                    {galleryImages.map((imgUrl, index) => (
                      <div 
                        key={imgUrl + index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className="relative w-20 h-20 shrink-0 border border-gray-200 rounded-lg overflow-hidden cursor-move group"
                      >
                        <img src={imgUrl} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 shrink-0 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-accent-blue bg-gray-50 overflow-hidden relative">
                      <input type="file" multiple className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleGalleryUpload} disabled={isUploadingGallery} />
                      {isUploadingGallery ? (
                        <span className="text-[10px] text-gray-500 font-medium">Uploading...</span>
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                    </label>
                  </div>
                </div>
              </Section>

              <Section title="4. Poster Settings">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Orientation</label>
                    <select name="orientation" value={formData.orientation} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue">
                      <option>Portrait</option>
                      <option>Landscape</option>
                      <option>Square</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Print Finish</label>
                    <select name="finish" value={formData.finish} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue">
                      <option>Matte</option>
                      <option>Glossy</option>
                      <option>Premium Matte</option>
                    </select>
                  </div>
                </div>
                
              </Section>

              <Section title="5. Visibility & Ordering">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue">
                      <option value="Active">Active (Visible)</option>
                      <option value="Inactive">Inactive (Hidden)</option>
                      <option value="Draft">Draft</option>
                      <option value="Hidden">Hidden (Legacy)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Display Order (0 is default)</label>
                    <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-3 pt-3 border-t border-gray-100">
                  {['featured', 'trending', 'bestSeller', 'newArrival', 'customPrint'].map(flag => (
                    <label key={flag} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name={flag} checked={formData[flag]} onChange={handleChange} className="w-4 h-4 rounded text-accent-blue" />
                      <span className="text-sm text-gray-700 capitalize">{flag.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
              </Section>

              <Section title="6. Shipping">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Weight (grams)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Packaging Type</label>
                    <select name="packagingType" value={formData.packagingType} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue">
                      <option>Tube</option>
                      <option>Flat Mailer</option>
                      <option>Box</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Shipping Class</label>
                    <select name="shippingClass" value={formData.shippingClass} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue">
                      <option>Standard</option>
                      <option>Heavy/Bulky</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-5">
                      <input type="checkbox" name="freeShipping" checked={formData.freeShipping} onChange={handleChange} className="w-4 h-4 rounded text-accent-blue" />
                      <span className="text-sm text-gray-700">Free Shipping Eligible</span>
                    </label>
                  </div>
                </div>
              </Section>

              <Section title="7. SEO">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Meta Title</label>
                  <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" placeholder={formData.name || "Title"} />
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows="2" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue resize-none"></textarea>
                </div>
              </Section>

              {/* Extra spacing at bottom for scrolling past the footer if needed on mobile */}
              <div className="h-10"></div>
            </div>

            {/* Footer - Fixed */}
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
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-100 text-gray-900 font-medium hover:bg-gray-200 rounded-xl transition-colors text-sm"
                >
                  Save Draft
                </button>
                <button 
                  onClick={() => handleSave('Active')}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-black text-white font-medium hover:bg-gray-800 rounded-xl transition-colors text-sm shadow-sm"
                >
                  {isSaving ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
