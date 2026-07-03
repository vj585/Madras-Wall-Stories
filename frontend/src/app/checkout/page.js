"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import {
  MapPin, Truck, CreditCard, CheckCircle2, ChevronRight,
  ShieldCheck, ArrowLeft, ArrowRight, User, Mail, Sparkles, Gift, Package, AlertCircle, Loader2
} from 'lucide-react';
import { calculateShippingFee } from '@/utils/shippingUtils';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';

const inputClass =
  "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-sm";

export default function Checkout() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart, setIsCartOpen } = useCart();
  const [step, setStep] = useState(0); // 0: Contact, 1: Address, 2: Delivery, 3: Payment, 4: Success
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [saveAccount, setSaveAccount] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  const { data: session, status } = useSession();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [invalidCartItems, setInvalidCartItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [isValidatingCart, setIsValidatingCart] = useState(true);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, cartTotal })
      });
      const data = await res.json();
      
      if (data.success) {
        setAppliedCoupon(data.data);
        setCouponInput('');
      } else {
        setCouponError(data.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      setIsValidatingCart(false);
      return;
    }
    fetch('/api/cart/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        if (data.invalidItems && data.invalidItems.length > 0) {
          setInvalidCartItems(data.invalidItems);
        } else {
          setInvalidCartItems([]);
        }
        if (data.outOfStockItems && data.outOfStockItems.length > 0) {
          setOutOfStockItems(data.outOfStockItems);
        } else {
          setOutOfStockItems([]);
        }
      } else {
        setInvalidCartItems([]);
        setOutOfStockItems([]);
      }
    })
    .catch(err => console.error("Cart validation failed", err))
    .finally(() => setIsValidatingCart(false));
  }, [cartItems]);

  useEffect(() => {
    if (status === 'loading') {
      setIsSessionLoading(true);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      setGuestEmail(session.user.email);
      if (session.user.name) {
        const nameParts = session.user.name.split(' ');
        setAddress(prev => ({
          ...prev,
          firstName: prev.firstName || nameParts[0] || '',
          lastName: prev.lastName || nameParts.slice(1).join(' ') || ''
        }));
      }
      fetch('/api/account/addresses')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            if (data.data.customerPhone) {
              setGuestPhone(prev => prev || data.data.customerPhone);
              setAddress(prev => ({ ...prev, phone: prev.phone || data.data.customerPhone }));
            }
            if (data.data.savedAddresses && data.data.savedAddresses.length > 0) {
              setSavedAddresses(data.data.savedAddresses);
              const defaultAddress = data.data.savedAddresses.find(a => a._id === data.data.defaultAddress);
              setSelectedSavedAddress(defaultAddress || data.data.savedAddresses[0]);
              setIsAddingNewAddress(false);
            } else {
              setIsAddingNewAddress(true);
            }
          } else {
            setIsAddingNewAddress(true);
          }
          setStep(1); // Skip Contact step for logged-in users
        })
        .catch(console.error)
        .finally(() => setIsSessionLoading(false));
    } else {
      setIsAddingNewAddress(true);
      setIsSessionLoading(false);
    }
  }, [status, session]);

  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    pincode: '',
    state: 'Tamil Nadu',
  });

  const [deliveryOptions, setDeliveryOptions] = useState(() => {
    return {
      standard: { available: true, fee: calculateShippingFee(cartTotal), partner: 'Standard', estimatedDays: '3-5 Business Days' },
      sameDay: { available: false, fee: 0, partner: 'Porter' }
    };
  });
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    setDeliveryOptions(prev => ({
      ...prev,
      standard: {
        ...prev.standard,
        fee: calculateShippingFee(cartTotal)
      }
    }));
  }, [cartTotal]);

  const fetchDeliveryOptions = async (targetCity) => {
    setIsCalculatingDelivery(true);
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cartTotal, 
          city: targetCity 
        })
      });
      const data = await res.json();
      if (data.success) {
        setDeliveryOptions({
          standard: data.standard
        });
        setSelectedDelivery('standard');
      } else {
        throw new Error('Failed to fetch delivery options');
      }
    } catch (error) {
      console.error('Failed to calculate delivery. Using fallback.', error);
      // Fallback if the API completely fails
      setDeliveryOptions({
        standard: { available: true, fee: calculateShippingFee(cartTotal), partner: 'Standard', estimatedDays: '3-5 Business Days' }
      });
      setSelectedDelivery('standard');
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  const deliveryFee = deliveryOptions[selectedDelivery]?.fee || 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxes = 0;
  const total = cartTotal - discountAmount + deliveryFee;

  const steps = [
    { id: 0, title: 'Contact', icon: User },
    { id: 1, title: 'Shipping', icon: MapPin },
    { id: 2, title: 'Delivery', icon: Truck },
    { id: 3, title: 'Payment', icon: CreditCard },
  ];

  if (cartItems.length === 0 && step < 4) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-background flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold font-heading mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/shop" className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  if (isValidatingCart && step < 4) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-blue mb-4" />
        <p className="text-gray-500">Validating your cart...</p>
      </div>
    );
  }

  if (invalidCartItems.length > 0 && step < 4) {
    return (
      <div className="pt-32 pb-20 min-h-[70vh] bg-background flex flex-col items-center justify-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-center">Some items are no longer available</h2>
        <p className="text-gray-500 max-w-md text-center mb-6">
          The following items have been removed from our catalog or are no longer active. Please remove them from your cart to proceed with checkout.
        </p>
        <div className="space-y-4 mb-8 w-full max-w-md">
          {invalidCartItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="p-4 border border-red-200 bg-red-50 rounded-xl flex justify-between items-center gap-4">
              <span className="font-medium text-red-800 line-clamp-1">{item.name}</span>
              <button 
                onClick={() => {
                  const idx = cartItems.findIndex(ci => ci.id === item.id && ci.size === item.size);
                  if(idx !== -1) removeFromCart(idx);
                }} 
                className="text-sm bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-medium shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (outOfStockItems.length > 0 && step < 4) {
    return (
      <div className="pt-32 pb-20 min-h-[70vh] bg-background flex flex-col items-center justify-center px-4">
        <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-center">Some items are out of stock</h2>
        <p className="text-gray-500 max-w-md text-center mb-6">
          The following items have insufficient stock. Please remove them from your cart to proceed with checkout.
        </p>
        <div className="space-y-4 mb-8 w-full max-w-md">
          {outOfStockItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="p-4 border border-orange-200 bg-orange-50 rounded-xl flex justify-between items-center gap-4">
              <span className="font-medium text-orange-800 line-clamp-1">{item.name}</span>
              <button 
                onClick={() => {
                  const idx = cartItems.findIndex(ci => ci.id === item.id && ci.size === item.size);
                  if(idx !== -1) removeFromCart(idx);
                }} 
                className="text-sm bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition-colors font-medium shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const customerName = selectedSavedAddress ? selectedSavedAddress.fullName : `${address.firstName} ${address.lastName}`.trim() || guestEmail.split('@')[0] || 'Guest';
      const customerPhone = selectedSavedAddress ? selectedSavedAddress.phone : (address.phone || guestPhone || '0000000000');
      
      const orderData = {
        customerName,
        email: guestEmail || 'guest@example.com',
        phone: customerPhone,
        amount: total,
        subtotal: cartTotal,
        shipping: deliveryFee,
        grandTotal: total,
        freeShippingApplied: deliveryFee === 0,
        paymentStatus: 'Pending',
        shippingAddress: address, // Keep legacy format
        addressSnapshot: selectedSavedAddress ? {
          fullName: selectedSavedAddress.fullName,
          phone: selectedSavedAddress.phone,
          houseOrApartment: selectedSavedAddress.houseOrApartment,
          street: selectedSavedAddress.street,
          areaOrLocality: selectedSavedAddress.areaOrLocality,
          landmark: selectedSavedAddress.landmark,
          city: selectedSavedAddress.city,
          state: selectedSavedAddress.state,
          pincode: selectedSavedAddress.pincode,
          addressType: selectedSavedAddress.addressType
        } : {
          fullName: customerName,
          phone: customerPhone,
          houseOrApartment: address.address1,
          street: address.address1,
          areaOrLocality: address.address2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          addressType: 'Home'
        },
        products: cartItems.map(item => ({
          productId: item.id?.startsWith('custom-') ? null : (item._id || null),
          slug: item.id?.startsWith('custom-') ? null : item.id,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          frame: item.frame,
          image: item.image,
          isCustom: item.id?.startsWith('custom-'),
          customDetails: item.customDetails
        })),
        deliveryMode: selectedDelivery === 'sameDay' ? 'Same Day' : 'Standard',
        deliveryPartner: deliveryOptions[selectedDelivery]?.partner || 'Standard',
        courierCost: deliveryFee,
        coupon: appliedCoupon ? appliedCoupon.code : undefined
      };

      if (paymentMethod === 'cod') {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...orderData, paymentMethod: 'COD' })
        });
        const data = await res.json();
        if (data.success) {
          setPlacedOrder(data.data);
          clearCart();
          setStep(4);
        } else {
          alert("Failed to place COD order: " + data.error);
        }
        setIsPlacingOrder(false);
        return;
      }

      // Razorpay Flow
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("We couldn't connect to our secure payment gateway. Please check your internet connection and try again.");
        setIsPlacingOrder(false);
        return;
      }

      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, orderDetails: orderData })
      });
      const orderDataApi = await orderRes.json();

      if (!orderDataApi.success) {
        console.error("Create order API failed:", orderDataApi.error);
        setPaymentError(orderDataApi.error || 'Failed to initialize payment. Please try again.');
        setIsPlacingOrder(false);
        return;
      }
      console.log("Razorpay order created:", orderDataApi.orderId);

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        console.error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID in frontend");
        setPaymentError('Payment configuration error. Please contact support.');
        setIsPlacingOrder(false);
        return;
      }
      const options = {
        key: razorpayKey,
        amount: orderDataApi.amount,
        currency: orderDataApi.currency,
        name: "Madras Wall Stories",
        description: "Premium Art Prints",
        image: "/logo.png",
        order_id: orderDataApi.orderId,
        handler: async function (response) {
          try {
            console.log("Razorpay callback received:", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: orderData
              })
            });

            const verifyData = await verifyRes.json();
            console.log("Verify API response:", verifyData);
            if (verifyData.success) {
              setPlacedOrder(verifyData.data);
              clearCart();
              setStep(4);
            } else {
              console.error("Payment verify failed:", verifyData.error);
              setPaymentError(verifyData.error || 'Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Payment handler error:', err);
            setPaymentError('Unexpected error during payment. Please try again.');
          }
        },
        prefill: {
          name: orderData.customerName,
          email: orderData.email,
          contact: orderData.phone
        },
        theme: {
          color: "#000000"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        console.error('Razorpay payment.failed event:', response.error);
        setPaymentError(response.error?.description || 'Payment failed. Please try a different method.');
      });
      paymentObject.open();

    } catch (error) {
      console.error('handlePlaceOrder error:', error);
      setPaymentError(error.message || 'Unexpected error placing order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-3">Order Placed! 🎉</h1>
          <p className="text-gray-500 mb-2">Thank you for shopping with Madras Wall Stories ❤️</p>
          <p className="text-gray-500 mb-6 text-sm">We are now preparing your artwork. You will receive an email when your order has been dispatched.</p>
          
          {placedOrder && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left text-sm border border-gray-100">
              <div className="flex justify-between mb-3 border-b border-gray-200 pb-3">
                <span className="text-gray-500">Order Number</span>
                <span className="font-bold font-mono">#{placedOrder._id?.toString().slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between mb-3 border-b border-gray-200 pb-3">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-bold">{placedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}</span>
              </div>
              <div className="flex justify-between mb-3 border-b border-gray-200 pb-3">
                <span className="text-gray-500">Expected Dispatch</span>
                <span className="font-bold">1–2 Business Days</span>
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-gray-500">Delivery Address</span>
                <span className="font-bold text-right max-w-[60%] line-clamp-2">
                  {placedOrder.addressSnapshot?.street || placedOrder.shippingAddress?.address1}, {placedOrder.addressSnapshot?.city || placedOrder.shippingAddress?.city}
                </span>
              </div>
            </div>
          )}

          {session ? (
            <Link href="/account/orders" className="block w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all text-center mb-4 shadow-md">
              View Orders
            </Link>
          ) : (
            <Link href="/track" className="block w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all text-center mb-4 shadow-md">
              Track Order
            </Link>
          )}
          <Link href="/" className="block w-full py-4 rounded-xl font-bold transition-all text-center bg-gray-100 text-gray-700 hover:bg-gray-200">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50 text-foreground">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => {
              router.push('/shop');
              setTimeout(() => setIsCartOpen(true), 100);
            }} 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
          </button>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">Checkout</h1>
          <p className="text-gray-400 text-sm mt-1">No account needed — just fill your details and go.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Column: Steps */}
          <div className="lg:col-span-7">

            {/* Stepper */}
            <div className="flex items-center mb-8 relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
              {steps.map((s) => (
                <div key={s.id} className="flex-1 flex flex-col items-center relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all duration-300 ${
                    step > s.id ? 'bg-black text-white scale-100' : step === s.id ? 'bg-black text-white ring-4 ring-gray-200' : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}>
                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id + 1}
                  </div>
                  <span className={`text-[11px] font-semibold hidden sm:block ${step >= s.id ? 'text-black' : 'text-gray-400'}`}>{s.title}</span>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* STEP 0: Contact Info (Guest-first) */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
                >
                  <h2 className="text-xl font-bold mb-1">How should we contact you?</h2>
                  <p className="text-gray-400 text-sm mb-6">For your order confirmation and delivery updates.</p>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!guestEmail || (!guestPhone && !session)) {
                      alert("Please provide both email and phone number.");
                      return;
                    }
                    setAddress(prev => ({ ...prev, phone: prev.phone || guestPhone }));
                    setStep(1);
                  }}>

                  {/* Google Sign-in — optional */}
                  {!session && (
                    <>
                      <button onClick={() => signIn('google')} type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-3.5 rounded-xl font-medium transition-colors mb-4 shadow-sm">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google <span className="text-xs text-gray-400">(Optional — autofills your details)</span>
                      </button>

                      <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                        <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400">Or continue as guest</span></div>
                      </div>
                    </>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(for order confirmation)</span></label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        className={inputClass}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile <span className="text-gray-400 font-normal">(for delivery updates)</span></label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">+91</span>
                        <input
                          type="tel"
                          value={guestPhone}
                          onChange={e => setGuestPhone(e.target.value)}
                          className="flex-1 min-w-0 block w-full px-4 py-3.5 rounded-none rounded-r-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-sm"
                          placeholder="98765 43210"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 mt-6 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md"
                  >
                    Continue to Shipping <ArrowRight className="w-5 h-5" />
                  </button>
                  </form>
                  <p className="text-center text-xs text-gray-400 mt-3">No account required. Your data is safe with us 🔒</p>
                </motion.div>
              )}

              {/* STEP 1: Shipping Address */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Shipping Address</h2>
                    {savedAddresses.length > 0 && (
                      <button onClick={() => setIsAddingNewAddress(!isAddingNewAddress)} className="text-accent-blue text-sm font-bold hover:underline">
                        {isAddingNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                      </button>
                    )}
                  </div>
                  
                  {!isAddingNewAddress && savedAddresses.length > 0 ? (
                    <div className="space-y-4">
                      {savedAddresses.map(addr => (
                        <label key={addr._id} className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedSavedAddress?._id === addr._id ? 'border-accent-blue bg-blue-50/20' : 'border-gray-100 hover:border-gray-200'}`}>
                          <input type="radio" name="savedAddress" checked={selectedSavedAddress?._id === addr._id} onChange={() => setSelectedSavedAddress(addr)} className="mt-1 w-4 h-4 accent-accent-blue mr-3 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-bold text-gray-900">{addr.fullName} <span className="ml-2 bg-gray-100 text-gray-600 text-[10px] uppercase px-2 py-0.5 rounded-full">{addr.addressType}</span></p>
                            <p className="text-gray-600 mt-1">{addr.houseOrApartment}, {addr.street}</p>
                            <p className="text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                            <p className="text-gray-500 mt-1">Phone: {addr.phone}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input type="text" value={address.firstName} onChange={e => setAddress({...address, firstName: e.target.value})} className={inputClass} placeholder="Riya" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input type="text" value={address.lastName} onChange={e => setAddress({...address, lastName: e.target.value})} className={inputClass} placeholder="Kumar" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className={inputClass} placeholder="98765 43210" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                        <input type="text" value={address.address1} onChange={e => setAddress({...address, address1: e.target.value})} className={inputClass} placeholder="Flat 12, Rose Apartments" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input type="text" value={address.address2} onChange={e => setAddress({...address, address2: e.target.value})} className={inputClass} placeholder="Near Metro Station" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className={inputClass} placeholder="Chennai" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                          <input type="text" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className={inputClass} placeholder="600001" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <select value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className={inputClass}>
                          <option>Tamil Nadu</option>
                          <option>Maharashtra</option>
                          <option>Karnataka</option>
                          <option>Delhi</option>
                          <option>Gujarat</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </form>
                  )}
                  <div className="flex gap-4 mt-6">
                    <button onClick={() => setStep(0)} className="w-1/3 py-4 bg-gray-100 text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                      <ArrowLeft className="w-5 h-5 stroke-[2.5]" /> Back
                    </button>
                    <button onClick={async () => {
                      if (isAddingNewAddress) {
                        if (!address.firstName || !address.address1 || !address.city || !address.pincode || !address.phone) {
                          alert("Please fill out all required address fields, including phone number.");
                          return;
                        }
                        await fetchDeliveryOptions(address.city);
                      } else if (!selectedSavedAddress) {
                         alert("Please select a shipping address.");
                         return;
                      } else {
                         await fetchDeliveryOptions(selectedSavedAddress.city);
                      }
                      setStep(2);
                    }} className="w-2/3 py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md disabled:opacity-50"
                    disabled={isCalculatingDelivery}>
                      {isCalculatingDelivery ? 'Calculating...' : 'Continue to Delivery'} <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Delivery */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
                >
                  <h2 className="text-xl font-bold mb-6">Delivery Method</h2>
                  <div className="space-y-4">
                    {deliveryOptions.standard.available && (
                      <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedDelivery === 'standard' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="delivery" checked={selectedDelivery === 'standard'} onChange={() => setSelectedDelivery('standard')} className="w-4 h-4 accent-black" />
                          <div>
                            <p className="font-bold">Standard Delivery</p>
                            <p className="text-xs text-gray-500">{deliveryOptions.standard.estimatedDays} • Standard</p>
                          </div>
                        </div>
                        <span className={`font-bold ${deliveryOptions.standard.fee === 0 ? 'text-green-600' : ''}`}>
                          {deliveryOptions.standard.fee === 0 ? 'Free' : `₹${deliveryOptions.standard.fee}`}
                        </span>
                      </label>
                    )}
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button onClick={() => setStep(1)} className="w-1/3 py-4 bg-gray-100 text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                      <ArrowLeft className="w-5 h-5 stroke-[2.5]" /> Back
                    </button>
                    <button onClick={() => setStep(3)} className="w-2/3 py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md">
                      Continue to Payment <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-green-500" /> Secure Payment
                  </h2>

                  <div className="space-y-3 mb-8">
                    {[
                      { id: 'upi', label: 'UPI — GPay, PhonePe, Paytm', tag: 'Most Popular' },
                      { id: 'card', label: 'Credit / Debit Card', tag: null },
                      { id: 'cod', label: 'Cash on Delivery', tag: null },
                    ].map(option => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === option.id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input type="radio" name="payment" checked={paymentMethod === option.id} onChange={() => setPaymentMethod(option.id)} className="w-4 h-4 accent-black" />
                          <span className="font-medium text-sm">{option.label}</span>
                        </div>
                        {option.tag && (
                          <span className="text-[10px] font-bold text-accent-blue bg-accent-blue/10 px-2 py-1 rounded-full">{option.tag}</span>
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl mb-8 border border-gray-100">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-500">Secured by</span>
                    <span className="text-sm font-bold tracking-wider text-blue-600">RAZORPAY</span>
                  </div>

                  {paymentError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-700 text-sm">Payment Error</p>
                        <p className="text-red-600 text-sm">{paymentError}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button onClick={() => { setPaymentError(''); setStep(2); }} className="w-1/3 py-4 bg-gray-100 text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                      <ArrowLeft className="w-5 h-5 stroke-[2.5]" /> Back
                    </button>
                    <button
                      onClick={() => { setPaymentError(''); handlePlaceOrder(); }}
                      disabled={isPlacingOrder}
                      className="w-2/3 py-4 bg-accent-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md disabled:opacity-70"
                    >
                      {isPlacingOrder ? "Processing..." : `Pay ₹${total} Securely`} {!isPlacingOrder && <ArrowRight className="w-5 h-5 stroke-[2.5]" />}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-28">
              <h2 className="text-lg font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[280px] overflow-y-auto pr-1 hide-scrollbar">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Your cart is empty.</p>
                ) : cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Qty: {item.quantity} • {item.size}
                      </p>
                      {item.id?.startsWith('custom-') && (
                        <div className="text-[10px] text-accent-blue font-medium mt-0.5 flex gap-1 flex-wrap">
                          {item.customDetails?.finish && <span>{item.customDetails.finish}</span>}
                          {item.customDetails?.caption && <span>• "{item.customDetails.caption}"</span>}
                        </div>
                      )}
                      <p className="font-bold text-sm mt-1">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6">
                {appliedCoupon ? (
                  <div className="flex justify-between items-center bg-green-50 border border-green-200 p-4 rounded-xl">
                    <div>
                      <span className="text-sm font-bold text-green-700 block uppercase tracking-wider">{appliedCoupon.code}</span>
                      <span className="text-xs font-medium text-green-600 block mt-0.5">Coupon applied successfully!</span>
                    </div>
                    <button 
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Discount Code" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className={`flex-1 px-4 py-2.5 bg-gray-50 border ${couponError ? 'border-red-300' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:border-black uppercase`} 
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="px-4 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                      >
                        {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 font-medium px-1">{couponError}</p>}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">₹{cartTotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold text-green-600">-₹{appliedCoupon.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                    {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                  </span>
                </div>
                {step >= 3 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="font-semibold capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Est. Dispatch</span>
                  <span className="font-semibold">1-2 Business Days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Est. Delivery</span>
                  <span className="font-semibold">{deliveryOptions[selectedDelivery]?.estimatedDays || '3-5 Business Days'}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl">₹{total}</span>
              </div>

              {/* Trust icons */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
                <div className="flex flex-col items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span>Secure Pay</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Truck className="w-5 h-5 text-accent-blue" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Gift className="w-5 h-5 text-amber-500" />
                  <span>Gift Ready</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
