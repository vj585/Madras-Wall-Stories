"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getUniqueBanners } from '@/utils/bannerUtils';

import { useState, useEffect } from 'react';

export default function Memories({ banners = [] }) {
  const [idx1, setIdx1] = useState(3);
  const [idx2, setIdx2] = useState(4);
  const [idx3, setIdx3] = useState(5);

  useEffect(() => {
    if (banners.length === 0) return;
    
    const int1 = setInterval(() => {
      setIdx1(prev => (prev + 1) % banners.length);
    }, 6000);

    const int2 = setInterval(() => {
      setIdx2(prev => (prev + 1) % banners.length);
    }, 8500);

    const int3 = setInterval(() => {
      setIdx3(prev => (prev + 1) % banners.length);
    }, 11000);

    return () => {
      clearInterval(int1);
      clearInterval(int2);
      clearInterval(int3);
    };
  }, [banners.length]);

  const fallbacks = ["/images/master.jpg", "/images/michael.jpg", "/images/batman.jpg"];
  const uniqueImages = getUniqueBanners(banners, [idx1, idx2, idx3], fallbacks);
  
  const img1 = uniqueImages[0]?.image;
  const img2 = uniqueImages[1]?.image;
  const img3 = uniqueImages[2]?.image;

  return (
    <section className="py-12 md:py-20 bg-surface text-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight">
              Made With <br />
              <span className="text-accent-blue italic font-light tracking-wide">Memories.</span>
            </h2>
            <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-lg">
              We believe walls shouldn't be blank. They should tell the story of who you are, what you love, and the moments you cherish. Turn your digital photos into physical treasures.
            </p>
            <Link href="/custom">
              <button className="btn-primary px-8 py-4 bg-black text-white rounded-full font-semibold flex items-center gap-3 mt-4">
                <div className="btn-primary-inner"></div>
                Start Creating <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>

          {/* ─── Scrapbook Clothesline Board ─────────────────────────────────────
               Madras-textured board with a twine clothesline. Photos hang from 
               wooden clothespins; one rests pinned with tape. A living mood board
               that captures the "Stories" brand promise visually.
          ─────────────────────────────────────────────────────────────────────── */}
          <div className="relative min-h-[520px] lg:min-h-[560px]">

            {/* Madras check board background */}
            <div className="absolute inset-0 rounded-3xl madras-bg border border-amber-100/60 overflow-hidden" />

            {/* Clothesline rope — twine string across the top third */}
            <div className="absolute z-10 left-6 right-6" style={{ top: '90px' }}>
              <div
                className="w-full rounded-full"
                style={{
                  height: '1.5px',
                  background: 'linear-gradient(90deg, transparent, rgba(120,60,10,0.4) 12%, rgba(120,60,10,0.55) 50%, rgba(120,60,10,0.4) 88%, transparent)',
                  boxShadow: '0 1.5px 4px rgba(100,40,5,0.18)'
                }}
              />
            </div>

            {/* ── Center polaroid — hung from the line ── */}
            <motion.div
              initial={{ opacity: 0, y: -20, rotate: 1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, type: 'spring', bounce: 0.3 }}
              className="absolute z-20"
              style={{ top: '64px', left: 'calc(50% - 96px)' }}
            >
              {/* Wooden clothespin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-px">
                <div className="w-3 h-6 rounded-[2px] shadow-sm" style={{ background: 'linear-gradient(180deg, #92400e 0%, #78350f 100%)' }} />
                <div className="w-5 h-[1.5px] rounded-full" style={{ background: 'rgba(120,60,10,0.4)' }} />
              </div>
              {/* Polaroid */}
              <div className="w-48 bg-white" style={{ boxShadow: '3px 6px 28px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)' }}>
                <div className="p-2.5 pb-0">
                  <div className="w-full aspect-[3/4] relative overflow-hidden bg-gray-100">
                    <Image src={img1} fill sizes="192px" className="object-cover" alt="Memory" />
                  </div>
                </div>
                <div className="px-3 py-3 text-center">
                  <p className="font-script text-sm text-gray-400">my story ✨</p>
                </div>
              </div>
            </motion.div>

            {/* ── Left polaroid — hung, tilted left ── */}
            <motion.div
              initial={{ opacity: 0, x: -16, rotate: -8 }}
              whileInView={{ opacity: 1, x: 0, rotate: -8 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, type: 'spring', bounce: 0.25 }}
              className="absolute z-10"
              style={{ top: '62px', left: '7%' }}
            >
              {/* Clothespin */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30">
                <div className="w-2.5 h-5 rounded-[2px] shadow-sm" style={{ background: 'linear-gradient(180deg, #92400e, #78350f)' }} />
              </div>
              {/* Polaroid */}
              <div className="w-36 bg-white" style={{ boxShadow: '2px 4px 18px rgba(0,0,0,0.14)' }}>
                <div className="p-2 pb-0">
                  <div className="w-full aspect-square relative overflow-hidden bg-gray-100">
                    <Image src={img2} fill sizes="144px" className="object-cover" alt="Memory 2" />
                  </div>
                </div>
                <div className="h-8" />
              </div>
              {/* Tape strip — amber translucent */}
              <div
                className="absolute -top-1 right-0 w-8 h-3 rounded-sm"
                style={{ background: 'rgba(245,217,90,0.52)', transform: 'rotate(8deg) translateX(6px)' }}
              />
            </motion.div>

            {/* ── Bottom-right photo — taped, resting at an angle ── */}
            <motion.div
              initial={{ opacity: 0, x: 16, rotate: 7 }}
              whileInView={{ opacity: 1, x: 0, rotate: 7 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4, type: 'spring', bounce: 0.25 }}
              className="absolute z-10"
              style={{ bottom: '28px', right: '6%' }}
            >
              {/* Tape across top */}
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 rounded-sm"
                style={{ background: 'rgba(245,217,90,0.52)', transform: 'rotate(-7deg)' }}
              />
              {/* Polaroid */}
              <div className="w-40 bg-white" style={{ boxShadow: '2px 4px 18px rgba(0,0,0,0.14)' }}>
                <div className="p-2 pb-0">
                  <div className="w-full aspect-[4/3] relative overflow-hidden bg-gray-100">
                    <Image src={img3} fill sizes="160px" className="object-cover" alt="Memory 3" />
                  </div>
                </div>
                <div className="px-2 py-2.5 text-center">
                  <p className="font-script text-xs text-gray-400">Chennai 🌊</p>
                </div>
              </div>
            </motion.div>

            {/* Decorative — subtle pushpin and gold star accents */}
            <div className="absolute bottom-10 left-10 text-xl select-none" style={{ opacity: 0.18 }}>📌</div>
            <div className="absolute top-1/3 right-8 font-bold text-2xl select-none" style={{ color: 'rgba(212,175,55,0.22)' }}>✦</div>
          </div>

        </div>
      </div>
    </section>
  );
}
