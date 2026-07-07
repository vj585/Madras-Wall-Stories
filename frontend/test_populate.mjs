import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const CustomerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  role: String,
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, { collection: 'customers' });

const OrderSchema = new mongoose.Schema({
  amount: Number,
  status: String,
  createdAt: Date
}, { collection: 'orders' });

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
    const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
    
    try {
      const customers = await Customer.find({ role: 'customer' })
        .populate('orders', 'amount createdAt status')
        .sort({ createdAt: -1 })
        .lean();
      
      console.log('API logic returned length:', customers.length);
      if (customers.length > 0) {
         console.log(JSON.stringify(customers[0], null, 2));
      }
    } catch(e) {
      console.error('Error in API logic:', e);
    }
    
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
