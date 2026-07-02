"use client";
import { motion } from 'framer-motion';

export default function Marquee() {
  const announcements = [
    "FLASH SALE — UP TO 50% OFF",
    "PREMIUM AESTHETIC POSTERS",
    "FREE SHIPPING ON ORDERS OVER ₹999",
    "CUSTOM POLAROIDS AVAILABLE",
    "TRENDING DESIGNS RESTOCKED",
    "MADE FOR WALLS, MADE FOR YOU",
  ];

  // Duplicate the array to create a seamless loop
  const marqueeItems = [...announcements, ...announcements, ...announcements];

  return (
    <div className="w-full bg-accent-blue text-white overflow-hidden relative z-10" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
      {/* Subtle gold top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-accent-yellow opacity-30" />

      <motion.div
        className="flex whitespace-nowrap items-center"
        animate={{ x: ["0%", "-33.333333%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 40,
            ease: "linear",
          },
        }}
      >
        {marqueeItems.map((text, idx) => (
          <span key={idx} className="flex items-center gap-4 sm:gap-8 px-4 sm:px-8">
            <span className="font-medium tracking-[0.15em] text-[10px] sm:text-xs uppercase font-heading">
              {text}
            </span>
            {/* Gold diamond separator */}
            <span className="text-accent-yellow opacity-60 text-[8px] leading-none">◆</span>
          </span>
        ))}
      </motion.div>

      {/* Subtle gold bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-accent-yellow opacity-30" />
    </div>
  );
}
