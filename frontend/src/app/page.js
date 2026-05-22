import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import Trending from '@/components/home/Trending';
import Inspiration from '@/components/home/Inspiration';
import Testimonials from '@/components/home/Testimonials';
import Memories from '@/components/home/Memories';
import CustomHighlight from '@/components/home/CustomHighlight';
import { getStorefrontProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getStorefrontProducts();

  return (
    <>
      <Hero />
      <Memories />
      <Categories products={products} />
      <Trending products={products} />
      <CustomHighlight />
      <Testimonials />
      <Inspiration />
    </>
  );
}
