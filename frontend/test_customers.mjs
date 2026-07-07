import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    
    const customers = await db.collection('customers').find({}).toArray();
    console.log(JSON.stringify(customers, null, 2));
    
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
