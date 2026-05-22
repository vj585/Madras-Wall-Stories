"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ReturnsPage() {
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
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">Returns & Refund Policy</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to know about returns, damaged items, and our refund process.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm text-gray-700 leading-relaxed space-y-8"
        >
          <p className="text-lg text-gray-900 font-medium">
            At Madras Wall Stories, every wall piece is crafted with care and attention to quality. We want you to love your purchase, but if something isn't right, we're here to help.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Damaged or Incorrect Orders</h2>
            <p className="mb-4">If your order arrives damaged, defective, or incorrect, please contact us within 48 hours of delivery.</p>
            <p className="font-semibold mb-2 text-gray-900">Please include:</p>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>Order ID</li>
              <li>Photos of the damaged item</li>
              <li>Photos of packaging (if applicable)</li>
              <li>Brief description of the issue</li>
            </ul>
            <p className="font-semibold mb-2 text-gray-900">Once verified, we may provide:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Replacement product</li>
              <li>Refund</li>
              <li>Store credit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Custom Print Orders</h2>
            <p className="mb-4">
              Custom prints are personalized specifically for you and generally cannot be returned or refunded once production has started.
            </p>
            <p className="font-semibold mb-2 text-gray-900">Exceptions may apply for:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Damaged products</li>
              <li>Printing defects</li>
              <li>Wrong item delivered</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancellation Policy</h2>
            <p className="mb-2">Orders can only be cancelled before production or processing begins.</p>
            <p>Once printing or production starts, cancellation requests may not be accepted.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Processing</h2>
            <p className="mb-2">Approved refunds will typically be processed within 5–10 business days to the original payment method.</p>
            <p>Bank processing timelines may vary.</p>
          </section>

          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <p className="mb-4">For refund or return assistance:</p>
            <p className="mb-6">
              Email: <a href="mailto:madraswallstories.orders@gmail.com" className="font-semibold text-accent-blue hover:underline">madraswallstories.orders@gmail.com</a>
            </p>
            <p className="text-sm text-gray-500 italic">
              Madras Wall Stories reserves the right to evaluate refund eligibility on a case-by-case basis.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
