import nextDynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import Trending from '@/components/home/Trending';
import Memories from '@/components/home/Memories';

const Inspiration = nextDynamic(() => import('@/components/home/Inspiration'));
const Testimonials = nextDynamic(() => import('@/components/home/Testimonials'));
const CustomHighlight = nextDynamic(() => import('@/components/home/CustomHighlight'));
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
