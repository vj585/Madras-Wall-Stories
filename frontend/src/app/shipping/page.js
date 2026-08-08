"use client";
import { motion } from 'framer-motion';

export default function ShippingPage() {
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
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">Shipping Policy</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Information on delivery times, shipping costs, and order tracking.
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
          <p className="text-lg text-gray-900 font-medium border-b border-gray-100 pb-6">
            Madras Prints currently ships across India.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Processing</h2>
            <ul className="list-disc pl-5 space-y-3">
              <li>Orders are generally processed within 1–3 business days.</li>
              <li>Custom print products may require additional preparation time.</li>
              <li>Production timelines can vary depending on demand and product customization.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Estimated Delivery Timelines</h2>
            <p className="font-semibold mb-3 text-gray-900">Typical delivery estimates:</p>
            <div className="bg-gray-50 rounded-xl p-5 mb-4 border border-gray-100">
              <ul className="space-y-3">
                <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-medium text-gray-900">Metro Cities</span>
                  <span>3–5 business days</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-medium text-gray-900">Other Locations</span>
                  <span>5–8 business days</span>
                </li>
                <li className="flex justify-between items-center pt-1">
                  <span className="font-medium text-gray-900">Remote Locations</span>
                  <span className="text-right">Delivery may take additional time</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 italic">
              * Delivery timelines are estimates and may vary due to logistics, weather conditions, or courier delays.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Charges</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Shipping charges will be displayed during checkout.</li>
              <li>Free shipping promotions may apply periodically.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tracking Orders</h2>
            <p className="mb-2">Tracking information will be shared through:</p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>Email</li>
              <li>SMS</li>
            </ul>
            <p>once the order is dispatched.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Attempts</h2>
            <p className="mb-2">Please ensure accurate address and contact information.</p>
            <p>Failed delivery attempts due to incorrect details may result in additional shipping charges.</p>
          </section>

          <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Delays</h2>
            <p className="mb-3">
              Unexpected delays can occur during high-volume seasons, public holidays, or operational disruptions.
            </p>
            <p className="font-medium text-gray-900">
              We appreciate your patience while we work to deliver your stories safely.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  );
}

