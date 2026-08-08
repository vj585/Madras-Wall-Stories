"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search, ShoppingCart, Eye, Package, X, Printer,
  MapPin, Phone, Mail, CreditCard, Truck, CheckCircle2,
  Clock, ExternalLink, Download, Tag, Frame, Maximize2,
  ChevronDown, User, Calendar, Hash, CheckSquare
} from 'lucide-react';

// Safely download cross-origin images (Cloudinary etc.) without navigating away
async function downloadImage(url, filename = 'custom-print.jpg') {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
  } catch (e) {
    // Fallback: open in new tab if fetch fails (e.g. CORS)
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

const STATUS_STYLES = {
  'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Processing': 'bg-green-100 text-green-700 border-green-200',
  'Printing': 'bg-blue-100 text-blue-700 border-blue-200',
  'Quality Check': 'bg-purple-100 text-purple-700 border-purple-200',
  'Packed': 'bg-orange-100 text-orange-700 border-orange-200',
  'Shipped': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Out For Delivery': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Delivered': 'bg-green-100 text-green-700 border-green-200',
  'Cancelled': 'bg-red-100 text-red-700 border-red-200',
};

const ALL_STATUSES = ['Pending', 'Processing', 'Printing', 'Quality Check', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];

function ImageModal({ src, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full max-h-[95vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors">
          <X className="w-7 h-7" />
        </button>
        <img
          src={src}
          alt="Full-size custom print"
          className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
        <div className="flex gap-3 mt-4">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Open Original
          </a>
          <button
            onClick={() => downloadImage(src, 'custom-print.jpg')}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-blue text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Download for Print
          </button>
        </div>
        <p className="text-white/40 text-xs mt-3">Click outside to close</p>
      </div>
    </div>
  );
}

function OrderDrawer({ order, onClose, onStatusChange }) {
  const [status, setStatus] = useState(order.orderStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [fullscreenImg, setFullscreenImg] = useState(null);
  
  const [checklist, setChecklist] = useState({
    printed: false,
    sizeVerified: false,
    qualityChecked: false,
    packagingComplete: false,
    ready: false
  });
  
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [dispatchData, setDispatchData] = useState({
    courierCompany: 'India Post',
    customCourierName: '',
    trackingNumber: '',
    trackingUrl: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    estimatedDelivery: '',
    shippingNotes: '',
    courierCharge: '',
    packageWeight: ''
  });

  const isChecklistComplete = Object.values(checklist).every(Boolean);

  const toggleChecklist = (field) => {
    setChecklist(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleManualDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchData.trackingNumber) return alert("Tracking number is required.");

    const courierName = dispatchData.courierCompany === 'Other' ? dispatchData.customCourierName : dispatchData.courierCompany;

    const confirmMessage = `Confirm Manual Dispatch?
    
Courier: ${courierName}
Tracking Number: ${dispatchData.trackingNumber}
Estimated Delivery: ${dispatchData.estimatedDelivery || 'N/A'}
Courier Charge: ₹${dispatchData.courierCharge || 0}
Weight: ${dispatchData.packageWeight || 0}kg

This will mark the order as Shipped and notify the customer. Proceed?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsSaving(true);
    
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: 'Shipped',
          shippingStatus: 'Shipped',
          courierName,
          deliveryPartner: courierName,
          trackingNumber: dispatchData.trackingNumber,
          trackingUrl: dispatchData.trackingUrl,
          dispatchDate: dispatchData.dispatchDate,
          estimatedDelivery: dispatchData.estimatedDelivery,
          shippingNotes: dispatchData.shippingNotes,
          courierCharge: Number(dispatchData.courierCharge) || 0,
          packageWeight: Number(dispatchData.packageWeight) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Order Dispatched Successfully!");
        onStatusChange(order._id, 'Shipped');
        window.location.reload();
      } else {
        alert("Failed to dispatch: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error dispatching order.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      const data = await res.json();
      if (data.success) {
        onStatusChange(order._id, status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order? This will restore stock and mark it as Cancelled.")) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert("Order cancelled successfully.");
        onStatusChange(order._id, 'Cancelled');
        setStatus('Cancelled');
      } else {
        alert("Failed to cancel order: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error cancelling order.");
    } finally {
      setIsSaving(false);
    }
  };

  const addr = order.shippingAddress;
  const fullAddress = addr
    ? [addr.address1, addr.address2, addr.city, addr.state, addr.pincode, addr.country]
        .filter(Boolean).join(', ')
    : '—';

  return (
    <>
      {fullscreenImg && <ImageModal src={fullscreenImg} onClose={() => setFullscreenImg(null)} />}

      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Order #{order._id.slice(-6).toUpperCase()}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/orders/${order._id}/invoice`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Invoice
              </Link>
              <Link
                href={`/admin/orders/${order._id}/packingslip`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Packing Slip
              </Link>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors ml-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6">

            {/* Status Updater */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Order Status</p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none appearance-none cursor-pointer"
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isSaving || status === order.orderStatus}
                  className="px-5 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Update'}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 items-center justify-between border-t border-gray-200 pt-3">
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${status === s ? STATUS_STYLES[s] + ' scale-105' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50 mt-2 sm:mt-0"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Logistics & Delivery */}
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Logistics & Dispatch
                </p>
                <span className="text-[10px] font-bold bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                  {order.deliveryMode || 'Standard'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Courier Company</p>
                  <p className="font-semibold text-gray-900">{order.courierName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tracking Number</p>
                  <p className="font-semibold text-gray-900">{order.trackingNumber || '—'}</p>
                </div>
                {order.trackingUrl && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Tracking URL</p>
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-blue hover:underline break-all">
                      {order.trackingUrl}
                    </a>
                  </div>
                )}
                {order.dispatchDate && (
                  <div>
                    <p className="text-xs text-gray-500">Dispatch Date</p>
                    <p className="font-semibold text-gray-900">{new Date(order.dispatchDate).toLocaleDateString()}</p>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div>
                    <p className="text-xs text-gray-500">Est. Delivery</p>
                    <p className="font-semibold text-gray-900">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                  </div>
                )}
                {order.shippingNotes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Shipping Notes</p>
                    <p className="text-sm text-gray-800 italic">{order.shippingNotes}</p>
                  </div>
                )}
              </div>

              {order.statusTimeline && order.statusTimeline.length > 0 && (
                <div className="mb-4 bg-white p-3 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Delivery Timeline</p>
                  <div className="space-y-2">
                    {order.statusTimeline.map((tl, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-gray-800">{tl.status}</span>
                        <span className="text-gray-400">{new Date(tl.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Packing Checklist */}
              {!order.trackingNumber && !showDispatchForm && (
                <div className="mb-4 bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                  <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" /> Packing Checklist
                  </p>
                  <div className="space-y-3">
                    {[
                      { id: 'printed', label: 'Poster Printed' },
                      { id: 'sizeVerified', label: 'Correct Size Verified' },
                      { id: 'qualityChecked', label: 'Quality Check Complete' },
                      { id: 'packagingComplete', label: 'Packaging Complete' },
                      { id: 'ready', label: 'Ready For Courier' }
                    ].map(item => (
                      <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={checklist[item.id]} 
                          onChange={() => toggleChecklist(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm select-none transition-colors ${checklist[item.id] ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-black'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowDispatchForm(true)}
                    disabled={!isChecklistComplete}
                    className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
                  >
                    Manual Dispatch (Enter Tracking)
                  </button>
                </div>
              )}

              {showDispatchForm && !order.trackingNumber && (
                <form onSubmit={handleManualDispatch} className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm space-y-3">
                  <p className="font-bold text-gray-900 mb-2">Enter Courier Details</p>
                  
                  <div>
                    <label className="text-xs text-gray-500">Courier Company *</label>
                    <select 
                      value={dispatchData.courierCompany}
                      onChange={e => setDispatchData({...dispatchData, courierCompany: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm"
                      required
                    >
                      <option>India Post</option>
                      <option>DTDC</option>
                      <option>Blue Dart</option>
                      <option>Delhivery</option>
                      <option>Professional Couriers</option>
                      <option>ST Courier</option>
                      <option>XpressBees</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {dispatchData.courierCompany === 'Other' && (
                    <div>
                      <label className="text-xs text-gray-500">Custom Courier Name *</label>
                      <input 
                        type="text"
                        value={dispatchData.customCourierName}
                        onChange={e => setDispatchData({...dispatchData, customCourierName: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-500">Tracking Number *</label>
                    <input 
                      type="text"
                      value={dispatchData.trackingNumber}
                      onChange={e => setDispatchData({...dispatchData, trackingNumber: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Tracking URL</label>
                    <input 
                      type="url"
                      value={dispatchData.trackingUrl}
                      onChange={e => setDispatchData({...dispatchData, trackingUrl: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Dispatch Date *</label>
                      <input 
                        type="date"
                        value={dispatchData.dispatchDate}
                        onChange={e => setDispatchData({...dispatchData, dispatchDate: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Estimated Delivery</label>
                      <input 
                        type="date"
                        value={dispatchData.estimatedDelivery}
                        onChange={e => setDispatchData({...dispatchData, estimatedDelivery: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Courier Charge (₹)</label>
                      <input 
                        type="number"
                        value={dispatchData.courierCharge}
                        onChange={e => setDispatchData({...dispatchData, courierCharge: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Package Weight (kg)</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={dispatchData.packageWeight}
                        onChange={e => setDispatchData({...dispatchData, packageWeight: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Shipping Notes</label>
                    <textarea 
                      value={dispatchData.shippingNotes}
                      onChange={e => setDispatchData({...dispatchData, shippingNotes: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm"
                      rows="2"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setShowDispatchForm(false)} className="flex-1 p-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700">Cancel</button>
                    <button type="submit" disabled={isSaving} className="flex-1 p-2 bg-black text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                      {isSaving ? 'Dispatching...' : 'Dispatch Order'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Products — Detailed */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Products Ordered</p>
              <div className="space-y-4">
                {order.products?.map((prod, idx) => (
                  <div key={idx} className={`rounded-2xl border overflow-hidden ${prod.isCustom ? 'border-accent-blue/30 bg-blue-50/30' : 'border-gray-100 bg-white'}`}>
                    {/* Product header */}
                    <div className="flex gap-4 p-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {prod.image ? (
                          <div className="relative group cursor-pointer" onClick={() => setFullscreenImg(prod.image)}>
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-20 h-24 object-cover rounded-xl border border-gray-200 shadow-sm group-hover:opacity-80 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                              <Maximize2 className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 h-24 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                            <Package className="w-7 h-7 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-gray-900 leading-snug">{prod.title}</p>
                          {prod.isCustom && (
                            <span className="flex-shrink-0 text-[10px] font-bold bg-accent-blue text-white px-2 py-0.5 rounded-full uppercase tracking-wide">Custom</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">Qty: <span className="font-semibold text-gray-900">{prod.quantity}</span></p>
                        <p className="text-sm font-bold text-gray-900 mt-1">₹{(prod.price * prod.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 bg-gray-50/50">
                      {prod.size && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500">Size</span>
                          <span className="text-xs font-semibold text-gray-800 ml-auto">{prod.size}</span>
                        </div>
                      )}
                      {prod.frame && (
                        <div className="flex items-center gap-2">
                          <Frame className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500">Frame</span>
                          <span className="text-xs font-semibold text-gray-800 ml-auto">{prod.frame}</span>
                        </div>
                      )}
                      {prod.customDetails?.finish && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Finish</span>
                          <span className="text-xs font-semibold text-gray-800 ml-auto">{prod.customDetails.finish}</span>
                        </div>
                      )}
                      {prod.customDetails?.caption && (
                        <div className="col-span-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">Caption</span>
                          <span className="text-xs font-semibold text-gray-800 ml-2 italic">"{prod.customDetails.caption}"</span>
                        </div>
                      )}
                    </div>

                    {/* Custom print — Full resolution actions */}
                    {prod.isCustom && prod.image && (
                      <div className="border-t border-accent-blue/20 px-4 py-3 bg-blue-50/50 flex gap-3 flex-wrap">
                        <p className="w-full text-xs font-semibold text-accent-blue mb-1">🖨 Custom Print — Action Required</p>
                        <button
                          onClick={() => setFullscreenImg(prod.image)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-accent-blue/30 text-accent-blue rounded-xl text-xs font-semibold hover:bg-accent-blue hover:text-white transition-all"
                        >
                          <Maximize2 className="w-3.5 h-3.5" /> View Full Size
                        </button>
                        <a
                          href={prod.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Original URL
                        </a>
                        <button
                          onClick={() => downloadImage(prod.image, `${prod.title || 'custom-print'}.jpg`)}
                          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Download for Print
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{(order.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">{order.shipping > 0 ? `₹${order.shipping}` : (order.freeShippingApplied ? 'Free' : (order.shipping === 0 ? 'Free' : '—'))}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
                  <span>Total Paid</span>
                  <span className="text-lg">₹{order.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${order.email}`} className="text-sm text-accent-blue hover:underline break-all">{order.email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${order.phone}`} className="text-sm text-gray-700">{order.phone}</a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900">{order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                      order.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{order.paymentStatus}</span>
                    {order.refundStatus === 'Refund Required' && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-300 animate-pulse">
                        Refund Required
                      </span>
                    )}
                  </div>
                  {order.razorpayPaymentId && (
                    <div className="flex items-center gap-1 mt-1">
                      <Hash className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-400 font-mono break-all">{order.razorpayPaymentId}</span>
                    </div>
                  )}
                  {order.razorpayOrderId && (
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-400 font-mono break-all">{order.razorpayOrderId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Address</p>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {[addr?.firstName, addr?.lastName].filter(Boolean).join(' ') || order.customerName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{fullAddress}</p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success) setOrders(data.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    if (selectedOrder?._id === orderId) {
      setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = searchQuery === '' ||
      o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    const matchPayment = paymentFilter === 'All' ||
      (paymentFilter === 'COD' && o.paymentMethod === 'COD') ||
      (paymentFilter === 'Prepaid' && o.paymentMethod === 'Razorpay' && o.refundStatus !== 'Refund Required') ||
      (paymentFilter === 'Refund' && o.refundStatus === 'Refund Required');
    return matchSearch && matchStatus && matchPayment;
  });

  return (
    <>
      <AnimatePresence>
        {selectedOrder && (
          <OrderDrawer
            key={selectedOrder._id}
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Orders</h1>
            <p className="text-gray-500">Manage and fulfill customer orders.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{filtered.length} of {orders.length} orders</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-accent-blue outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none whitespace-nowrap min-w-[130px]"
            >
              <option value="All">All Status</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none whitespace-nowrap min-w-[130px]"
            >
              <option value="All">All Payment</option>
              <option value="Prepaid">Razorpay</option>
              <option value="COD">Cash on Delivery</option>
              <option value="Refund">Refund Queue</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
              <p className="text-gray-500 max-w-sm">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                    <th className="p-4 font-medium">Order ID</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Products</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Payment</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <span className="font-mono font-semibold text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-sm text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.email}</p>
                        <p className="text-xs text-gray-400">{order.phone}</p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          {order.products?.map((prod, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                              {prod.image ? (
                                <img src={prod.image} alt={prod.title} className="w-10 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                  <Package className="w-4 h-4 text-gray-300" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 leading-tight">
                                  {prod.title} <span className="text-gray-400 font-normal text-xs">×{prod.quantity}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {[prod.size, prod.frame, prod.customDetails?.finish].filter(Boolean).join(' • ')}
                                </p>
                                {prod.isCustom && (
                                  <span className="text-[10px] font-bold text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded-full">Custom Print</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">₹{order.amount.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <div className="flex flex-col items-start">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                            order.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.paymentStatus}
                          </span>
                          {order.refundStatus === 'Refund Required' && (
                            <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-300 animate-pulse">
                              Refund Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{order.paymentMethod}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.orderStatus] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

