import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function checkAdmins() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const customers = await db.collection('customers').find({ role: 'admin' }).toArray();
  console.log("Admins in customers collection:", customers.length);
  
  const adminusers = await db.collection('adminusers').find({}).toArray();
  console.log("Admins in adminusers collection:", adminusers.length);

  process.exit(0);
}

checkAdmins();
