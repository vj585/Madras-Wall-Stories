import nextDynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import Marquee from '@/components/home/Marquee';
import Categories from '@/components/home/Categories';
import Trending from '@/components/home/Trending';
import Memories from '@/components/home/Memories';

const Inspiration = nextDynamic(() => import('@/components/home/Inspiration'));
const Testimonials = nextDynamic(() => import('@/components/home/Testimonials'));
const CustomHighlight = nextDynamic(() => import('@/components/home/CustomHighlight'));
import { getStorefrontProducts } from '@/lib/products';
import { getStorefrontBanners } from '@/lib/banners';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getStorefrontProducts();
  const banners = await getStorefrontBanners();

  return (
    <>
      <Hero initialBanners={banners} />
      <Marquee />
      <Categories products={products} />
      <Memories banners={banners} />
      <Trending products={products} />
      <CustomHighlight banners={banners} />
      <Testimonials />
      <Inspiration banners={banners} />
    </>
  );
}
