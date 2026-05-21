"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, UploadCloud, AlertCircle, Plus } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
    <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export default function AddProductDrawer({ isOpen, onClose, editingProduct = null }) {
  // Form State
  const initialFormState = {
    name: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    category: 'Posters',
    subcategory: '',
    tags: '',
    seoKeywords: '',
    price: '',
    salePrice: '',
    costPrice: '',
    stock: '',
    outOfStock: false,
    lowStockAlert: '',
    gst: '18',
    status: 'Draft',
    orientation: 'Portrait',
    sizes: [],
    frames: [],
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
    metaDescription: ''
  };

  const [formData, setFormData] = useState(initialFormState);

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
        setFormData({
          ...initialFormState,
          name: editingProduct.title || '',
          slug: editingProduct.slug || '',
          shortDescription: editingProduct.shortDescription || '',
          fullDescription: editingProduct.description || '',
          category: editingProduct.category || 'Posters',
          subcategory: editingProduct.subcategory || '',
          tags: editingProduct.tags?.join(', ') || '',
          price: editingProduct.price || '',
          salePrice: editingProduct.salePrice || '',
          stock: editingProduct.stock || '',
          outOfStock: editingProduct.stock === 0,
          status: editingProduct.status || 'Draft',
          orientation: editingProduct.orientation || 'Portrait',
          sizes: editingProduct.sizes || [],
          frames: editingProduct.frameOptions || [],
          finish: editingProduct.printFinish || 'Matte',
          featured: editingProduct.featured || false,
          trending: editingProduct.trending || false,
          newArrival: editingProduct.newArrival || false,
        });
        setIsSlugManual(true);
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

  const handleCheckboxGroup = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();
      
      if (data.success) {
        setPrimaryImage(data.imageUrl);
        setErrors(prev => ({ ...prev, primaryImage: null }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setIsUploadingGallery(true);
      
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });
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
    if (!formData.price) newErrors.price = "Price required";
    if (!formData.category) newErrors.category = "Category required";
    if (!primaryImage) newErrors.primaryImage = "Primary Image required";
    
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
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        category: formData.category,
        subcategory: formData.subcategory,
        images: primaryImage ? [primaryImage, ...galleryImages] : galleryImages,
        sizes: formData.sizes,
        frameOptions: formData.frames,
        stock: formData.outOfStock ? 0 : (Number(formData.stock) || 0),
        featured: formData.featured,
        trending: formData.trending,
        newArrival: formData.newArrival,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        orientation: formData.orientation,
        printFinish: formData.finish,
        status: status,
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
            className="fixed inset-y-0 right-0 z-[110] w-full md:w-[80%] lg:w-[600px] bg-gray-50 flex flex-col shadow-2xl safe-top safe-bottom"
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
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-3 py-2 bg-white border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-accent-blue'} rounded-lg text-sm outline-none focus:ring-1`} placeholder="e.g., Spider Man Across Poster" />
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue">
                      <option>Posters</option>
                      <option>Polaroids</option>
                      <option>Custom Prints</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Subcategory</label>
                    <input type="text" name="subcategory" value={formData.subcategory} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" placeholder="e.g. Movies" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" placeholder="e.g. Marvel, Miles Morales, Action" />
                </div>
              </Section>

              <Section title="2. Pricing & Inventory">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className={`w-full px-3 py-2 bg-white border ${errors.price ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-accent-blue'} rounded-lg text-sm outline-none focus:ring-1`} />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sale Price (₹)</label>
                    <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cost Price (₹)</label>
                    <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">GST %</label>
                    <select name="gst" value={formData.gst} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue">
                      <option value="18">18% (Standard)</option>
                      <option value="12">12%</option>
                      <option value="5">5%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Stock Quantity</label>
                      <input 
                        type="number" 
                        name="stock" 
                        value={formData.stock || ''} 
                        onChange={handleChange} 
                        disabled={formData.outOfStock}
                        className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue ${formData.outOfStock ? 'bg-gray-100 text-gray-400' : 'bg-white'}`} 
                      />
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, outOfStock: !prev.outOfStock }))}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 ${formData.outOfStock ? 'bg-red-500' : 'bg-gray-300'}`}
                        >
                          <span className="sr-only">Toggle Out of Stock</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.outOfStock ? 'translate-x-4' : 'translate-x-0'}`}
                          />
                        </button>
                        <span className="text-sm font-medium text-gray-700">Mark as Out of Stock</span>
                      </div>
                    </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Alert</label>
                    <input type="number" name="lowStockAlert" value={formData.lowStockAlert} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent-blue" placeholder="e.g. 5" />
                  </div>
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
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {['A4', 'A3', 'A2', '13x19', 'Custom'].map(size => (
                      <label key={size} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={formData.sizes.includes(size)} onChange={() => handleCheckboxGroup('sizes', size)} className="rounded text-accent-blue" />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Frame Options</label>
                  <div className="flex flex-wrap gap-2">
                    {['Black', 'White', 'Wood', 'No Frame'].map(frame => (
                      <label key={frame} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={formData.frames.includes(frame)} onChange={() => handleCheckboxGroup('frames', frame)} className="rounded text-accent-blue" />
                        {frame}
                      </label>
                    ))}
                  </div>
                </div>
              </Section>

              <Section title="5. Visibility Flags">
                <div className="grid grid-cols-2 gap-y-3">
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
