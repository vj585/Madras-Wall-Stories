"use client";
import { useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

export function useMobileAdaptive() {
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Check initial
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);

    // Passive listener for resize
    const handleResize = (e) => setIsMobile(e.matches);
    
    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleResize, { passive: true });
      return () => mediaQuery.removeEventListener('change', handleResize);
    } 
    // Fallback for older Safari
    else {
      mediaQuery.addListener(handleResize);
      return () => mediaQuery.removeListener(handleResize);
    }
  }, []);

  // Adaptive configurations
  return {
    isMobile,
    shouldReduceMotion: shouldReduceMotion || false,
    
    // Adaptive Durations
    getDuration: (desktop, mobile) => {
      if (shouldReduceMotion) return 0; // Instant if requested
      return isMobile ? mobile : desktop;
    },
    
    // Adaptive Values (e.g. translateY distances)
    getValue: (desktop, mobile) => {
      if (shouldReduceMotion) return 0; // No motion if requested
      return isMobile ? mobile : desktop;
    },

    // Get optimized variants dynamically
    getVariant: (desktopVariant, mobileVariant) => {
      if (shouldReduceMotion) return { ...mobileVariant, transition: { duration: 0 }};
      return isMobile ? mobileVariant : desktopVariant;
    }
  };
}

