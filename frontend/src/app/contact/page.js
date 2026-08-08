"use client";
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4 mb-12">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">Get in touch</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Have a question about your order, custom prints, or just want to say hi? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Contact Information Cards */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <div className="w-12 h-12 bg-blue-50 text-accent-blue rounded-xl flex items-center justify-center mb-6">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Our friendly team is here to help. We usually respond within 24 hours during business days.
              </p>
              <a href="mailto:madraswallstories.orders@gmail.com" className="inline-flex items-center text-black font-semibold hover:text-accent-blue transition-colors">
                madraswallstories.orders@gmail.com
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Social Media</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Send us a direct message on Instagram for quick queries or to see our latest drops.
              </p>
              <a href="https://www.instagram.com/madras.wallstories/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-black font-semibold hover:text-pink-500 transition-colors">
                @madras.wallstories
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </motion.div>
          </div>

          {/* Quick FAQ / Form area */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 p-8 sm:p-10 rounded-3xl border border-gray-200 h-full flex flex-col justify-center"
          >
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">Looking for quick answers?</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We might have already answered your question. Check out our frequently asked questions about shipping, returns, and custom prints.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-2" />
                <p className="text-sm text-gray-700 font-medium">How long does delivery take?</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-2" />
                <p className="text-sm text-gray-700 font-medium">Can I upload my own image?</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-2" />
                <p className="text-sm text-gray-700 font-medium">Are custom prints refundable?</p>
              </div>
            </div>

            <Link href="/faq" className="w-full inline-flex justify-center items-center py-4 px-6 bg-white border-2 border-black text-black rounded-xl font-bold hover:bg-black hover:text-white transition-all shadow-sm hover:shadow-md">
              Visit FAQ Page
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

