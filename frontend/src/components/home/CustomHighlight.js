"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Wand2, Frame, Upload } from 'lucide-react';
import { getUniqueBanners } from '@/utils/bannerUtils';

import { useState, useEffect } from 'react';

export default function CustomHighlight({ banners = [] }) {
  const [idx1, setIdx1] = useState(6);
  const [idx2, setIdx2] = useState(7);

  useEffect(() => {
    if (banners.length === 0) return;
    
    const int1 = setInterval(() => {
      setIdx1(prev => (prev + 1) % banners.length);
    }, 6500);

    const int2 = setInterval(() => {
      setIdx2(prev => (prev + 1) % banners.length);
    }, 9500);

    return () => {
      clearInterval(int1);
      clearInterval(int2);
    };
  }, [banners.length]);

  const fallbacks = ["/images/spiderman.jpg", "/images/pennywise.jpg"];
  const uniqueImages = getUniqueBanners(banners, [idx1, idx2], fallbacks);
  
  const img1 = uniqueImages[0]?.image;
  const img2 = uniqueImages[1]?.image;

  return (
    <section className="py-12 md:py-20 bg-surface-warm text-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row">
          
          <div className="lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue/10 text-accent-blue rounded-full text-sm font-semibold mb-8 self-start">
              <Wand2 className="w-4 h-4" /> Studio
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-gray-900 leading-tight">
              Create Your Own <br />
              <span className="italic font-light text-gray-500">Masterpiece.</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 font-light">
              Don't just buy art. Make it. Upload your favorite photos from your camera roll, Instagram, or Pinterest and we'll turn them into premium gallery-quality prints.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Upload className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">1. Upload Image</h4>
                  <p className="text-sm text-gray-500">From any device</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Frame className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">2. Customize</h4>
                  <p className="text-sm text-gray-500">Choose size, frame & finish</p>
                </div>
              </div>
            </div>

            <Link href="/custom">
              <button className="px-8 py-4 bg-black text-white rounded-full font-bold flex items-center gap-3 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 w-fit">
                Open Print Studio <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>

          <div className="lg:w-1/2 relative bg-gray-50 min-h-[400px] lg:min-h-full flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 opacity-50"></div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
              viewport={{ once: true }}
              className="relative z-10 w-64 bg-white p-3 rounded-2xl shadow-2xl border border-gray-200"
            >
              <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden">
                <Image src={img1} fill sizes="256px" className="object-cover" alt="Preview" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 bg-white p-2 rounded-xl shadow-xl border border-gray-100">
                <div className="w-full aspect-square relative mb-2">
                  <Image src={img2} fill sizes="128px" className="object-cover" alt="Polaroid" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
