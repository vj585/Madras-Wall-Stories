import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function auditDB() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const report = [];

    for (const collection of collections) {
      const name = collection.name;
      const count = await db.collection(name).countDocuments();
      report.push({ collection: name, count });
    }

    console.log("\n--- COLLECTION AUDIT ---");
    console.table(report);

    // Also get product stock info
    const products = await db.collection('products').find({}).toArray();
    console.log("\n--- PRODUCT INVENTORY AUDIT ---");
    let hasReducedStock = false;
    for (const p of products) {
      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          if (v.stock < 100) { // arbitrary threshold to show potentially reduced stock, or just print them all
             console.log(`Product: ${p.title} | Variant: ${v.size} | Stock: ${v.stock}`);
             hasReducedStock = true;
          }
        }
      } else {
        if (p.stock < 100) {
          console.log(`Product: ${p.title} | Stock: ${p.stock}`);
          hasReducedStock = true;
        }
      }
    }
    if (!hasReducedStock) {
      console.log("No unusually low stock found.");
    }

    // Coupons
    const coupons = await db.collection('coupons').find({}).toArray();
    console.log("\n--- COUPON AUDIT ---");
    for (const c of coupons) {
      console.log(`Coupon Code: ${c.code} | Discount: ${c.discountType === 'percentage' ? c.discountValue + '%' : '₹' + c.discountValue} | Active: ${c.isActive}`);
    }

    console.log("\nDone.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

auditDB();
