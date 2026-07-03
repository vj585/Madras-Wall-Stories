import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const collectionsToClear = [
  'orders',
  'customers',
  'auditlogs',
  'verificationtokens',
  'reviews',
  'pendingpayments',
  'ratelimits',
  'sessions',
  'wishlists',
  'carts',
  'refunds',
  'activitylogs',
  'webhooklogs',
  'payments',
  'paymentlogs',
  'emailqueue',
  'addresses',
  'notifications',
  'customprints'
];

async function executeReset() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for RESET.");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    let deletedSummary = [];
    
    for (const name of collectionNames) {
      if (collectionsToClear.includes(name)) {
        const count = await db.collection(name).countDocuments();
        if (count > 0) {
          const result = await db.collection(name).deleteMany({});
          deletedSummary.push({ collection: name, deletedCount: result.deletedCount });
        } else {
          deletedSummary.push({ collection: name, deletedCount: 0 });
        }
      }
    }

    console.log("\n--- DELETION SUMMARY ---");
    console.table(deletedSummary);

    // Verify preservation
    console.log("\n--- PRESERVATION VERIFICATION ---");
    const adminusersCount = await db.collection('adminusers').countDocuments();
    const productsCount = await db.collection('products').countDocuments();
    const bannersCount = await db.collection('banners').countDocuments();
    const storeSettingsCount = await db.collection('storesettings').countDocuments();
    
    console.log(`adminusers: ${adminusersCount} (Should be > 0)`);
    console.log(`products: ${productsCount} (Should be > 0)`);
    console.log(`banners: ${bannersCount} (Should be > 0)`);
    console.log(`storesettings: ${storeSettingsCount} (Should be > 0)`);

    console.log("\nReset Complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error during reset:", error);
    process.exit(1);
  }
}

executeReset();
