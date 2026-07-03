require('dotenv').config({ path: 'frontend/.env.local' });

async function run() {
  const { connectDB } = await import('./frontend/src/lib/mongodb.js');
  await connectDB();
  const mongoose = require('mongoose');
  const { default: Product } = await import('./frontend/src/models/Product.js');
  
  const products = await Product.find({}).lean();
  console.log('Total products:', products.length);
  products.forEach(p => {
    console.log('- Title:', p.title, '| Category:', p.category, '| Theme:', p.theme, '| Subcat:', p.subcategory, '| Tags:', p.tags);
  });
  process.exit(0);
}

run().catch(console.error);
