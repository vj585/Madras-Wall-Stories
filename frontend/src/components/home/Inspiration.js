"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';

const inspirations = [
  { id: 1, image: '/images/michael.jpg', height: 'h-64' },
  { id: 2, image: '/images/batman.jpg', height: 'h-96' },
  { id: 3, image: '/images/master.jpg', height: 'h-72' },
  { id: 4, image: '/images/pennywise.jpg', height: 'h-80' },
  { id: 5, image: '/images/spiderman.jpg', height: 'h-64' },
  { id: 6, image: '/images/michael.jpg', height: 'h-96' },
];

export default function Inspiration() {
  return (
    <section className="py-24 bg-surface text-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-gray-900">Style Inspiration</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
            See how our community is styling their spaces. Tag us <span className="text-accent-blue font-semibold">@madras.wall</span> to get featured.
          </p>
        </motion.div>

        {/* Masonry Layout approximation */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {inspirations.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="break-inside-avoid relative group rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`relative w-full ${item.height}`}>
                <Image 
                  src={item.image} 
                  alt="Aesthetic Room Inspiration" 
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <button className="bg-white text-black px-8 py-3 rounded-full font-semibold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Shop the Look
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
