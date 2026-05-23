export const dynamic = 'force-dynamic';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import ProductClient from './ProductClient';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import StoreSettings from '@/models/StoreSettings';

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams?.slug || '');

  const product = await getProductBySlug(slug);

  // 404 state — product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-24 px-4 text-center">
        <h1 className="text-4xl font-heading font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-8">This poster could not be found.</p>
        <Link
          href="/"
          className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all"
        >
          Back to Homepage
        </Link>
      </div>
    );
  }

  const related = await getRelatedProducts(slug, product.category);

  await connectDB();
  const settings = await StoreSettings.findOne({ singletonId: 'global_settings' }).lean().exec();
  const framePricing = JSON.parse(JSON.stringify(settings?.framePricing || []));

  return <ProductClient product={product} related={related} framePricing={framePricing} />;
}
