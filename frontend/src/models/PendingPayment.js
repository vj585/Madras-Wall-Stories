import mongoose from 'mongoose';

const PendingPaymentSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  orderData: { type: Object, required: true }, // Complete snapshot of the cart and customer details
  createdAt: { type: Date, default: Date.now, expires: 3600 } // TTL index: Automatically deletes document after 1 hour (3600 seconds)
});

const PendingPayment = mongoose.models.PendingPayment || mongoose.model('PendingPayment', PendingPaymentSchema);

export default PendingPayment;

