"use client";
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              How we collect, use, and protect your information.
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
          <p className="text-sm text-gray-500 font-medium">Effective Date: [01/06/2026]</p>
          
          <p className="text-lg text-gray-900 font-medium">
            Madras Prints values your privacy and is committed to protecting your information.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <p className="mb-4">We may collect:</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Shipping address</li>
                  <li>Billing details</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Account Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Login information</li>
                  <li>Google account information (if using Google Login)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Order Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Purchase history</li>
                  <li>Product preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Technical Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Browser information</li>
                  <li>Device information</li>
                  <li>IP address</li>
                  <li>Usage analytics</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Information</h2>
            <p className="mb-3">We use collected information to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process orders</li>
              <li>Deliver products</li>
              <li>Send order confirmations</li>
              <li>Improve website performance</li>
              <li>Provide customer support</li>
              <li>Prevent fraud</li>
              <li>Send promotional communications (if opted in)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Security</h2>
            <p className="mb-2">Payments are processed securely through third-party payment providers.</p>
            <p className="font-medium text-gray-900">Madras Prints does not store complete card information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
            <p>We may use cookies to improve browsing experience, analytics, and personalization.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p>We implement reasonable technical and organizational measures to protect customer information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="mb-3">We may use trusted third-party providers including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Payment gateways</li>
              <li>Shipping providers</li>
              <li>Analytics services</li>
              <li>Authentication providers</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
            <p className="mb-2">Questions regarding privacy:</p>
            <a href="mailto:madraswallstories.orders@gmail.com" className="font-semibold text-accent-blue hover:underline">
              madraswallstories.orders@gmail.com
            </a>
          </section>

        </motion.div>
      </div>
    </div>
  );
}

