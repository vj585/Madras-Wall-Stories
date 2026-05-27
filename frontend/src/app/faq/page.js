"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    q: "What products does Madras Wall Stories offer?",
    a: "We offer premium-quality posters, custom prints, polaroids, and artistic wall décor designed to add personality and stories to your space."
  },
  {
    q: "Can I upload my own image for custom printing?",
    a: "Yes! You can upload your favorite photos or artwork through our Custom Prints section, and we'll transform them into beautiful wall pieces."
  },
  {
    q: "What sizes are available?",
    a: "We offer multiple size options including Mini, Standard, A5, A4, A3, A2, Square, Landscape, and other formats depending on the product."
  },
  {
    q: "Do you provide frame options?",
    a: "Yes. Selected products support premium frame upgrades so your wall art arrives ready to display."
  },
  {
    q: "How long does delivery take?",
    a: "Orders are usually processed within 1–3 business days, and delivery timelines depend on your location within India."
  },
  {
    q: "Can I track my order?",
    a: "Order tracking will be available once your order has been shipped. Tracking details will be sent via email and SMS."
  },
  {
    q: "What happens if my poster arrives damaged?",
    a: "Customer satisfaction matters to us. If your order arrives damaged, contact us within 48 hours with photos, and we'll help resolve it."
  },
  {
    q: "Which payment methods are accepted?",
    a: "We support secure online payments including UPI, Debit Cards, Credit Cards, Net Banking, and additional methods depending on availability."
  },
  {
    q: "Can I cancel my order?",
    a: "Orders may be cancelled before production begins. Custom printed products may have different cancellation conditions."
  },
  {
    q: "Are custom print orders refundable?",
    a: "Because custom prints are personalized specifically for you, refund eligibility may vary depending on production status and issue type."
  },
  {
    q: "Do colors look exactly the same as shown online?",
    a: "We work hard to ensure color accuracy, but slight variations can occur because of screen settings and print processes."
  },
  {
    q: "Why choose Madras Wall Stories?",
    a: "Madras Wall Stories combines premium aesthetics, quality materials, custom creativity, and carefully crafted designs to help every wall tell a story."
  },
  {
    q: "Do you deliver across India?",
    a: "Yes, we aim to deliver our products across India."
  },
  {
    q: "How can I contact customer support?",
    a: "You can reach us through our contact page, email support, or social media channels for assistance."
  },
  {
    q: "Can I order posters in bulk?",
    a: "Yes. For events, gifts, offices, or bulk requirements, please contact us directly for assistance."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">Frequently Asked Questions</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to know about our products, shipping, and custom orders.
            </p>
          </motion.div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
              >
                <h3 className="font-semibold text-gray-900 pr-8">{faq.q}</h3>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 text-gray-400"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-50 mt-2 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still have questions */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 bg-gray-50 rounded-3xl p-8 text-center border border-gray-100"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <MessageCircle className="w-6 h-6 text-accent-blue" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h2>
          <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
            Can't find the answer you're looking for? Please chat to our friendly team.
          </p>
          <Link href="/contact" className="inline-block px-8 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg">
            Get in touch
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
