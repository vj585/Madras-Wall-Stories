"use client";
import { motion } from 'framer-motion';

export default function TermsPage() {
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
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Please read these terms carefully before using our services.
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
            By accessing or purchasing from Madras Prints, you agree to these terms.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Products & Pricing</h2>
            <p className="mb-4">We strive to ensure accurate product information and pricing.</p>
            <p className="font-semibold mb-2 text-gray-900">Madras Prints reserves the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Update pricing</li>
              <li>Modify products</li>
              <li>Correct errors</li>
              <li>Discontinue products</li>
            </ul>
            <p className="italic text-sm text-gray-500">without prior notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Custom Print Responsibility</h2>
            <p className="mb-4">Customers are responsible for ensuring uploaded custom print images:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Do not violate copyrights</li>
              <li>Do not contain prohibited material</li>
              <li>Are owned or authorized by the customer</li>
            </ul>
            <p className="font-medium text-gray-900">Madras Prints reserves the right to reject inappropriate submissions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders</h2>
            <p className="mb-2">We reserve the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Refuse orders</li>
              <li>Limit quantities</li>
              <li>Cancel suspicious transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
            <p>Customers are responsible for maintaining account security and login credentials.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="mb-2">All website designs, branding, content, graphics, and visual assets remain property of Madras Prints.</p>
            <p className="font-medium text-gray-900">Unauthorized reproduction or use is prohibited.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p>Madras Prints shall not be liable for indirect, incidental, or consequential damages arising from use of the platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p>These terms shall be governed by applicable laws of India.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="mb-2">We may update these terms periodically.</p>
            <p>Continued use of the platform indicates acceptance of revised terms.</p>
          </section>

          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
            <p className="mb-2">Questions regarding terms:</p>
            <a href="mailto:madraswallstories.orders@gmail.com" className="font-semibold text-accent-blue hover:underline">
              madraswallstories.orders@gmail.com
            </a>
          </section>

        </motion.div>
      </div>
    </div>
  );
}

