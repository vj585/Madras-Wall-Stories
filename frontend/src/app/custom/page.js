"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';
import { motion } from 'framer-motion';
import { Upload, X, Crop, Type, Image as ImageIcon, ShoppingCart, Frame, Maximize2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CustomPrintBuilder() {
  const { addToCart } = useCart();
  const fileInputRef = useRef(null);
  
  // State
  const [image, setImage] = useState(null); // Final cropped image
  const [originalImage, setOriginalImage] = useState(null); // Image for cropper
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [productType, setProductType] = useState('Poster');
  const [size, setSize] = useState('A3');
  const [frame, setFrame] = useState('Black Frame');
  const [finish, setFinish] = useState('Matte');
  const [caption, setCaption] = useState('');
  const [price, setPrice] = useState(0);
  const [pricingConfig, setPricingConfig] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Options
  const productTypes = ['Poster', 'Polaroid', 'Mini Prints', 'Photo Booth Strip'];
  const sizes = {
    'Poster': ['A5 (6x8")', 'A4 (8x12")', 'A3 (12x18")', 'A2 (16x24")'],
    'Polaroid': ['Standard (3.5x4.2")', 'Mini (2.1x3.4")'],
    'Mini Prints': ['Square (4x4")', 'Landscape (4x6")'],
    'Photo Booth Strip': ['Standard (2x6")']
  };
  const frames = ['No Frame', 'Black Frame', 'White Frame', 'Wooden Frame'];
  const finishes = ['Matte', 'Glossy'];

  // Fetch dynamic pricing
  useEffect(() => {
    fetch('/api/custom-pricing')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPricingConfig(data.data);
      })
      .catch(console.error);
  }, []);

  // Calculate Price dynamically
  useEffect(() => {
    if (!pricingConfig) return;
    
    let basePrice = pricingConfig.basePrices[productType] || 0;
    
    if (pricingConfig.sizes[size]) basePrice += pricingConfig.sizes[size];
    
    if (productType === 'Poster' && pricingConfig.frames[frame]) {
      basePrice += pricingConfig.frames[frame];
    }
    
    if (pricingConfig.finishes[finish]) {
      basePrice += pricingConfig.finishes[finish];
    }
    
    setPrice(basePrice);
  }, [productType, size, frame, finish, pricingConfig]);

  // Update size options when product type changes
  useEffect(() => {
    setSize(sizes[productType][0]);
  }, [productType]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Derive crop aspect ratio
  const getCropAspect = () => {
    if (productType === 'Poster') return 2/3;
    if (productType === 'Polaroid') {
      return size.includes('Mini') ? 2.1/3.4 : 1/1; // 1:1 square for standard polaroid
    }
    if (productType === 'Mini Prints') {
      return size.includes('Square') ? 1/1 : 4/6;
    }
    if (productType === 'Photo Booth Strip') {
      return 1/1; // Crop as a square, which will be repeated 3 times in the strip
    }
    return 1;
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(
        originalImage,
        croppedAreaPixels
      );
      setImage(croppedImage);
      setShowCropModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = async () => {
    if (!image) {
      alert("Please upload an image first!");
      return;
    }
    
    setIsUploading(true);
    try {
      // Convert base64 to Blob
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], 'custom-print.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('image', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      
      if (!uploadData.success || !uploadData.imageUrl) {
        throw new Error(uploadData.error || 'Failed to upload image correctly.');
      }

      addToCart({
        id: `custom-${Date.now()}`,
        name: `Custom ${productType}`,
        price: price,
        image: uploadData.imageUrl, // Fix: use imageUrl from API response
        size: size,
        frame: frame,
        quantity: 1,
        isCustom: true,
        customDetails: { finish, caption }
      });
      
      // Provide visual feedback instead of an alert, or a small toast
      alert("Added to cart successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("There was an issue processing your image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50 text-foreground">
      
      {/* Crop Modal */}
      {showCropModal && originalImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl m-4 flex flex-col h-[80vh] md:h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">Crop your image</h3>
              <button onClick={() => setShowCropModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative flex-1 bg-black">
              <Cropper
                image={originalImage}
                crop={crop}
                zoom={zoom}
                aspect={getCropAspect()}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="w-full sm:w-1/2 flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full accent-black"
                />
              </div>
              <button 
                onClick={handleSaveCrop}
                className="w-full sm:w-auto px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
              >
                Save & Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">Create Custom Print</h1>
          <p className="text-gray-500 max-w-2xl">Turn your favorite memories into premium aesthetic wall art. Upload, customize, and preview in real-time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: Preview Area (Sticky on Desktop) */}
          <div className="lg:col-span-7">
            <div className="sticky top-28 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[500px] overflow-hidden relative">
              
              {!image ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full h-full min-h-[400px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 transition-all cursor-pointer ${isDragging ? 'border-accent-blue bg-accent-blue/5' : 'border-gray-300 hover:border-accent-blue hover:bg-gray-50'}`}
                  onClick={() => fileInputRef.current.click()}
                >
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-20 h-20 bg-accent-blue/10 rounded-full flex items-center justify-center mb-6 text-accent-blue"
                  >
                    <Upload className="w-8 h-8" />
                  </motion.div>
                  <h3 className="font-heading font-bold text-xl mb-2">Drag & Drop your image here</h3>
                  <p className="text-gray-500 text-sm mb-6">Supports JPG, PNG, WEBP (Max 20MB)</p>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current.click();
                    }}
                    className="px-6 py-3 bg-primary text-secondary rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Upload Photo
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center relative">
                  <div className="absolute top-0 right-0 z-20 flex gap-2">
                    <button onClick={() => fileInputRef.current.click()} className="p-3 bg-white/80 backdrop-blur-md rounded-full hover:text-accent-blue transition-colors shadow-lg" title="Replace Image">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => {
                      setImage(null);
                      setOriginalImage(null);
                    }} className="p-3 bg-white/80 backdrop-blur-md rounded-full hover:text-red-500 transition-colors shadow-lg" title="Remove">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Real-time Mockup Renderer based on Product Type and Frame */}
                  <div className={`relative transition-all duration-500 ${productType === 'Polaroid' ? 'p-4 pb-12 bg-white shadow-xl' : productType === 'Photo Booth Strip' ? 'p-4 bg-white shadow-xl' : ''} ${productType === 'Poster' && frame === 'Black Frame' ? 'border-[16px] border-[#1a1a1a] shadow-2xl' : productType === 'Poster' && frame === 'White Frame' ? 'border-[16px] border-[#f5f5f5] shadow-2xl' : productType === 'Poster' && frame === 'Wooden Frame' ? 'border-[16px] border-[#8b5a2b] shadow-2xl' : 'shadow-lg'}`}>
                    
                    {finish === 'Glossy' && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none z-10 mix-blend-overlay"></div>
                    )}

                    {productType === 'Photo Booth Strip' ? (
                      <div className="flex flex-col gap-2 bg-white">
                         <img src={image} alt="Preview" className="w-[120px] h-[120px] object-cover" />
                         <img src={image} alt="Preview" className="w-[120px] h-[120px] object-cover" />
                         <img src={image} alt="Preview" className="w-[120px] h-[120px] object-cover" />
                      </div>
                    ) : (
                      <img 
                        src={image} 
                        alt="Preview" 
                        className={`object-cover ${productType === 'Poster' ? 'w-[300px] h-[400px] md:w-[400px] md:h-[550px]' : productType === 'Polaroid' ? 'w-[250px] h-[250px]' : 'w-[300px] h-[300px]'}`} 
                      />
                    )}

                    {productType === 'Polaroid' && caption && (
                      <div className="absolute bottom-4 left-0 right-0 text-center font-heading font-medium text-black text-xl px-4 truncate">
                        {caption}
                      </div>
                    )}
                  </div>

                  {/* Wall Mockup Background Text */}
                  <div className="mt-8 text-sm text-gray-500 flex items-center gap-2">
                    <Maximize2 className="w-4 h-4" /> Live preview updates automatically based on your selections
                  </div>
                </div>
              )}
              
              {/* Hidden file input must be always mounted for refs to work */}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          </div>

          {/* Right: Controls Area */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Product Type */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Frame className="w-5 h-5" /> Select Product</h3>
              <div className="grid grid-cols-2 gap-3">
                {productTypes.map(type => (
                  <button 
                    key={type}
                    onClick={() => setProductType(type)}
                    className={`py-4 px-3 rounded-xl border text-sm font-medium transition-all ${
                      productType === type 
                        ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Finish */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Crop className="w-5 h-5" /> Select Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sizes[productType]?.map(s => (
                    <button 
                      key={s}
                      onClick={() => setSize(s)}
                      className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                        size === s 
                          ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Paper Finish</h3>
                <div className="flex gap-4">
                  {finishes.map(f => (
                    <button 
                      key={f}
                      onClick={() => setFinish(f)}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                        finish === f 
                          ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Frame Options (Only for Poster) */}
            {productType === 'Poster' && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-4">Select Frame</h3>
                <div className="grid grid-cols-2 gap-3">
                  {frames.map(f => (
                    <button 
                      key={f}
                      onClick={() => setFrame(f)}
                      className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                        frame === f 
                          ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Caption (For Polaroids) */}
            {productType === 'Polaroid' && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Type className="w-5 h-5" /> Add Caption</h3>
                <input 
                  type="text" 
                  maxLength={30}
                  placeholder="e.g. Summer 2024"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-blue transition-colors"
                />
                <p className="text-right text-xs text-gray-500 mt-2">{caption.length}/30 characters</p>
              </div>
            )}

            {/* Checkout Sticky Bar (Mobile) / Block (Desktop) */}
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:relative md:bottom-auto md:p-6 md:rounded-3xl md:border md:shadow-sm z-40">
              <div className="container mx-auto flex items-center justify-between gap-4 md:flex-col md:items-stretch">
                <div className="md:flex md:justify-between md:items-center md:mb-4">
                  <div>
                    <p className="text-sm text-gray-500 hidden md:block">Total Price</p>
                    <p className="text-2xl font-bold">₹{price}</p>
                  </div>
                  <p className="text-sm font-medium text-green-500 hidden md:block">Ready to print in high quality</p>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={isUploading}
                  className={`flex-1 md:w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl ${isUploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-secondary hover:bg-accent-blue hover:text-white'}`}
                >
                  <ShoppingCart className="w-5 h-5" /> {isUploading ? 'Processing...' : 'Add to Cart'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
