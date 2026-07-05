"use client";
import { motion, useReducedMotion } from 'framer-motion';

const items = [
  { icon: "⚡", text: "FLASH SALE — UP TO 50% OFF" },
  { icon: "✦", text: "FREE SHIPPING ABOVE ₹999" },
  { icon: "🎨", text: "PREMIUM AESTHETIC POSTERS" },
  { icon: "📸", text: "CUSTOM POLAROIDS AVAILABLE" },
  { icon: "🔥", text: "TRENDING DESIGNS RESTOCKED" },
  { icon: "✦", text: "NEW DROP EVERY FRIDAY" },
  { icon: "💛", text: "MADE WITH LOVE IN CHENNAI" },
  { icon: "✦", text: "RATED 5★ BY 500+ CUSTOMERS" },
];

// Triple-duplicate for seamless infinite loop
const marqueeItems = [...items, ...items, ...items];

// Glowing dot separator
function Dot() {
  return (
    <span className="inline-flex items-center mx-3 sm:mx-5">
      <span
        className="block w-1.5 h-1.5 rounded-full bg-amber-400"
        style={{ boxShadow: "0 0 6px 2px rgba(251,191,36,0.7)" }}
      />
    </span>
  );
}

export default function Marquee() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="w-full relative overflow-hidden z-10 select-none" style={{ background: "linear-gradient(90deg, #111827 0%, #1e2a40 50%, #111827 100%)" }}>
      {/* Top shimmering gold line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #f59e0b 30%, #fde68a 50%, #f59e0b 70%, transparent)",
        }}
      />

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-12 z-20 pointer-events-none"
        style={{ background: "linear-gradient(to right, #111827, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-12 z-20 pointer-events-none"
        style={{ background: "linear-gradient(to left, #111827, transparent)" }} />

      <motion.div
        className="flex whitespace-nowrap items-center py-2.5 will-change-transform transform-gpu"
        animate={shouldReduce ? {} : { x: ["0%", "-33.333333%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 18,
            ease: "linear",
          },
        }}
      >
        {marqueeItems.map((item, idx) => (
          <span key={idx} className="inline-flex items-center">
            {/* Icon chip */}
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-0.5 mx-2">
              <span className="text-sm leading-none">{item.icon}</span>
              <span
                className="font-heading font-semibold tracking-[0.20em] text-[10px] sm:text-[11px] uppercase"
                style={{ color: "#D4AF37", textShadow: "0 0 12px rgba(212,175,55,0.35)" }}
              >
                {item.text}
              </span>
            </span>
            <Dot />
          </span>
        ))}
      </motion.div>

      {/* Bottom shimmering gold line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #f59e0b 30%, #fde68a 50%, #f59e0b 70%, transparent)",
        }}
      />
    </div>
  );
}
