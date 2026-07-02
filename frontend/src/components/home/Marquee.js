"use client";
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function Marquee() {
  const announcements = [
    "⚡ FLASH SALE: UP TO 50% OFF",
    "🎨 PREMIUM AESTHETIC POSTERS",
    "🚚 FREE SHIPPING ON ORDERS OVER ₹999",
    "✨ CUSTOM POLAROIDS AVAILABLE",
    "🔥 TRENDING DESIGNS RESTOCKED"
  ];

  // Duplicate the array to create a seamless loop
  const marqueeItems = [...announcements, ...announcements, ...announcements];

  return (
    <div className="w-full bg-accent-blue text-white overflow-hidden py-3 border-y border-white/10 flex items-center shadow-inner relative z-10">
      <motion.div
        className="flex whitespace-nowrap items-center font-medium tracking-widest text-xs sm:text-sm uppercase"
        animate={{ x: ["0%", "-33.333333%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 35,
            ease: "linear",
          },
        }}
      >
        {marqueeItems.map((text, idx) => (
          <span key={idx} className="flex items-center gap-6 px-6">
            <span>{text}</span>
            <Star className="w-3 h-3 text-accent-yellow fill-accent-yellow opacity-70" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
