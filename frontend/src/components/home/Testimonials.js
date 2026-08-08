"use client";
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [];

export default function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-surface-warm relative overflow-hidden">
      {/* Soft gradient backgrounds */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent-yellow/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-blue/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Loved by 10,000+</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Real stories from our amazing community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex text-accent-yellow mb-6">
                {[...Array(t.rating)].map((_, idx) => <Star key={idx} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-8 italic">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue to-accent-yellow flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

