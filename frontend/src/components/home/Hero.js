"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Truck, ShieldCheck, ChevronDown } from 'lucide-react';
import { useMobileAdaptive } from '@/hooks/useMobileAdaptive';

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isMobile, getValue, getVariant } = useMobileAdaptive();

  // Fetch banners
  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setBanners(data.data);
        }
      })
      .catch(console.error);
  }, []);

  // Slowly cycle through banners if there are many
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const headingText = "Turn Your Walls";
  
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 20 : 0 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        staggerChildren: isMobile ? 0 : 0.05, 
        delayChildren: 0.1,
        duration: isMobile ? 0.7 : undefined,
        ease: isMobile ? "easeOut" : undefined
      }
    }
  };

  const letterVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      y: isMobile ? 0 : 50, 
      filter: isMobile ? 'blur(0px)' : 'blur(10px)', 
      rotateX: isMobile ? 0 : -90 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      rotateX: 0,
      transition: { type: 'spring', damping: 12, stiffness: 150 }
    }
  };

  const glowVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      filter: isMobile ? 'blur(0px)' : 'blur(20px)', 
      scale: isMobile ? 1 : 0.8 
    },
    visible: { 
      opacity: 1, 
      filter: 'blur(0px)',
      scale: 1,
      transition: { duration: 1.5, ease: "easeOut", delay: 0.8 }
    }
  };

  // Determine images to show based on banners or fallbacks
  const img1 = banners.length > 0 ? banners[currentSlide % banners.length]?.image : "/images/batman.jpg";
  const img2 = banners.length > 1 ? banners[(currentSlide + 1) % banners.length]?.image : (banners.length === 1 ? banners[0]?.image : "/images/pennywise.jpg");
  const img3 = banners.length > 2 ? banners[(currentSlide + 2) % banners.length]?.image : (banners.length > 0 ? banners[0]?.image : "/images/michael.jpg");

  return (
    <motion.section 
      animate={{ 
        backgroundColor: ["#fff0d4", "#e3efff", "#ffe3ea", "#eafaf1", "#fff0d4"] 
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      className="relative w-full min-h-[100svh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden text-foreground pt-20"
    >
      {/* Background Soft Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-accent-yellow/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-accent-blue/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container relative z-10 px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center">
        
        {/* Left: Text Content */}
        <div className="max-w-2xl text-center lg:text-left pt-10 perspective-[1000px]">
          <motion.h1 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`text-[2.5rem] sm:text-[3rem] md:text-[4.5rem] lg:text-[5.5rem] font-heading font-black tracking-tighter mb-4 md:mb-6 leading-[1] md:leading-[0.95] text-gray-900 ${isMobile ? 'will-change-transform will-change-opacity' : ''}`}
          >
            <div className="flex flex-wrap justify-center lg:justify-start">
              {headingText.split("").map((char, index) => (
                <motion.span 
                  key={index} 
                  variants={letterVariants}
                  className={char === " " ? "w-3 sm:w-4 md:w-6 lg:w-8" : "inline-block"}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            
            <motion.span 
              variants={glowVariants}
              className="inline-block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-purple-500 to-accent-yellow italic font-bold pr-2 animate-gradient-text font-fancy will-change-transform will-change-opacity"
            >
              Into Stories.
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-500 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
          >
            Aesthetic posters, custom polaroids, and minimalist frames crafted to make your space feel perfectly yours.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link href="/shop" className="w-full sm:w-auto px-8 py-4 bg-black text-white font-semibold rounded-2xl hover:bg-gray-900 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 flex items-center justify-center gap-2">
              Shop Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 font-medium"
          >
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-accent-blue" /> Fast Chennai Delivery</div>
            <div className="flex items-center gap-2"><Star className="w-4 h-4 fill-accent-yellow text-accent-yellow" /> 4.9/5 Rating</div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500" /> Secure Checkout</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-10 flex flex-col items-center lg:items-start cursor-pointer group"
            onClick={() => window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' })}
          >
            <span className="text-2xl font-fancy italic font-bold text-gray-500 group-hover:text-black transition-colors mb-1">Discover The Collections</span>
            <motion.div 
              animate={{ y: [0, 5, 0] }} 
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-5 h-5 text-gray-300 group-hover:text-accent-blue transition-colors" />
            </motion.div>
          </motion.div>
        </div>

        {/* Right: Floating Images */}
        <div className="relative h-[400px] md:h-[500px] mt-2 lg:mt-0 w-full max-w-lg mx-auto block">
          
          {/* Main Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 h-64 sm:h-96 bg-white p-2 sm:p-3 rounded-2xl shadow-2xl border border-gray-100 z-20 will-change-transform"
          >
            <div className="w-full h-full relative rounded-xl overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={img1}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image 
                    src={img1} 
                    fill 
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover" 
                    alt="Main Display" 
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Floating Polaroid 1 */}
          <motion.div 
            animate={{ 
              y: [0, getValue(-15, -6), 0], 
              rotate: [-10, getValue(-12, -11), -10] 
            }}
            transition={{ repeat: Infinity, duration: getValue(5, 7), ease: "easeInOut" }}
            className="absolute top-8 sm:top-16 left-6 sm:left-20 w-28 sm:w-40 p-2 sm:p-3 bg-white rounded-xl shadow-xl border border-gray-100 z-30 will-change-transform"
          >
            <div className="w-full aspect-[3/4] relative mb-2 sm:mb-3 rounded-lg overflow-hidden bg-gray-100">
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={img2}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image 
                    src={img2} 
                    fill 
                    priority
                    sizes="(max-width: 768px) 33vw, 20vw"
                    className="object-cover" 
                    alt="Polaroid Display" 
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="text-center font-heading font-medium text-xs">Vintage</p>
          </motion.div>

          {/* Floating Poster 2 */}
          <motion.div 
            animate={{ 
              y: [0, getValue(15, 8), 0], 
              rotate: [12, getValue(15, 13), 12] 
            }}
            transition={{ repeat: Infinity, duration: getValue(6, 8), ease: "easeInOut", delay: 1 }}
            className="absolute bottom-8 sm:bottom-16 right-4 sm:right-16 w-32 sm:w-48 p-2 bg-white rounded-xl shadow-xl border border-gray-100 z-10 will-change-transform"
          >
            <div className="w-full h-40 sm:h-64 relative rounded-lg overflow-hidden bg-gray-100">
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={img3}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image 
                    src={img3} 
                    fill 
                    priority
                    sizes="(max-width: 768px) 33vw, 20vw"
                    className="object-cover" 
                    alt="Secondary Poster" 
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
}
