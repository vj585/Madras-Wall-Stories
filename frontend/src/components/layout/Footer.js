"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Globe, Link as LinkIcon, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14">
                  <Image
                    src="/images/logo mws.png"
                    alt="Madras Wall Stories"
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col justify-center text-white">
                  <span className="font-heading font-bold text-xl tracking-tight leading-none">MADRAS</span>
                  <span className="font-sans text-[11px] tracking-[0.2em] font-medium text-accent-yellow">WALL STORIES</span>
                </div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Premium posters, polaroids, and aesthetic prints crafted to turn your blank walls into emotional stories.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/madras.wallstories/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent-blue transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Shop</h3>
            <ul className="space-y-4">
              <li><Link href="/category/anime" className="text-gray-400 hover:text-white transition-colors">Anime Posters</Link></li>
              <li><Link href="/category/movies" className="text-gray-400 hover:text-white transition-colors">Movie Posters</Link></li>
              <li><Link href="/polaroids" className="text-gray-400 hover:text-white transition-colors">Polaroid Prints</Link></li>
              <li><Link href="/custom" className="text-gray-400 hover:text-white transition-colors">Custom Prints</Link></li>
              <li><Link href="/frames" className="text-gray-400 hover:text-white transition-colors">Photo Frames</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Help & Info</h3>
            <ul className="space-y-4">
              <li><Link href="/track" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Stay in the loop</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe for exclusive drops, offers, and aesthetic inspiration.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 w-full focus:outline-none focus:border-accent-blue text-sm"
              />
              <button className="bg-accent-blue hover:bg-blue-600 px-4 py-3 rounded-r-lg transition-colors flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Madras Wall Stories. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs flex items-center gap-1">
              Made with <span className="text-red-400">♥</span> in Chennai, India
            </p>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link href="/developer" className="hover:text-white transition-colors">Meet the Developer</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
