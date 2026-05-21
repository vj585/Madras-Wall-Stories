"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Memories() {
  return (
    <section className="py-24 bg-surface text-foreground overflow-hidden">
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
              <button className="px-8 py-4 bg-black text-white rounded-full font-semibold flex items-center gap-3 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-4">
                Start Creating <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>

          <div className="relative">
            {/* Main Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[2rem] overflow-hidden shadow-2xl z-10 bg-white p-4"
            >
              <div className="w-full aspect-[4/5] relative rounded-xl overflow-hidden">
                <Image 
                  src="/images/master.jpg" 
                  alt="Master Poster" 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Floating Polaroids */}
            <motion.div 
              initial={{ opacity: 0, y: 50, rotate: -15 }}
              whileInView={{ opacity: 1, y: 0, rotate: -10 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="absolute -bottom-10 -left-10 w-48 p-4 bg-white rounded-xl shadow-2xl z-20 border border-gray-100"
            >
              <div className="w-full aspect-square relative mb-4 rounded-lg overflow-hidden">
                <Image 
                  src="/images/michael.jpg" 
                  alt="Michael Jackson Polaroid" 
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
              <p className="text-center font-heading font-medium text-sm">Legend</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -50, rotate: 15 }}
              whileInView={{ opacity: 1, y: 0, rotate: 12 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -top-10 -right-10 w-40 p-3 bg-white rounded-xl shadow-2xl z-20 border border-gray-100"
            >
              <div className="w-full aspect-square relative mb-3 rounded-lg overflow-hidden">
                <Image 
                  src="/images/batman.jpg" 
                  alt="Batman Polaroid" 
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <p className="text-center font-heading font-medium text-xs">Vengeance</p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
