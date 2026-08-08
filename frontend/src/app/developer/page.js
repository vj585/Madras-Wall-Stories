"use client";
import { motion } from 'framer-motion';
import { Phone, Mail, Code, Heart, Coffee } from 'lucide-react';

export default function MeetTheDeveloper() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header Section */}
          <div className="relative h-48 bg-gradient-to-r from-accent-blue via-accent-blue/80 to-accent-saffron">
            <div className="absolute inset-0 opacity-20 madras-bg mix-blend-overlay"></div>
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center p-4">
                <Code className="w-16 h-16 text-accent-blue" />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="pt-20 px-8 pb-12 text-center">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-heading font-bold mb-2 text-primary"
            >
              Vijay
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-accent-saffron font-medium mb-6 tracking-wide uppercase text-sm"
            >
              Full Stack Developer
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto text-gray-600 leading-relaxed mb-10"
            >
              <p>
                The architect behind the Madras Prints digital experience. 
                Passionate about crafting beautiful, high-performance web applications 
                that blend modern aesthetics with seamless functionality.
              </p>
            </motion.div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              <motion.a 
                href="tel:8148224345"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group"
              >
                <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-accent-blue" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">Phone</h3>
                <p className="text-gray-500 text-sm">8148224345</p>
              </motion.a>

              <motion.a 
                href="mailto:vijaym0520@gmail.com"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group"
              >
                <div className="w-12 h-12 rounded-full bg-accent-saffron/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-accent-saffron" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">Email</h3>
                <p className="text-gray-500 text-sm">vijaym0520@gmail.com</p>
              </motion.a>

              <motion.a 
                href="https://instagram.com/vijay.05_"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col items-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">Instagram</h3>
                <p className="text-gray-500 text-sm">@vijay.05_</p>
              </motion.a>
            </div>

            {/* Footer Note */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-sm text-gray-400"
            >
              Built with <Heart className="w-4 h-4 text-red-400" /> and <Coffee className="w-4 h-4 text-amber-700" /> in Chennai
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

