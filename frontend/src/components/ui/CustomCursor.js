"use client";
import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

export default function CustomCursor() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const [isHovering, setIsHovering] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only enable on desktop
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const mouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      if (!e.target) return;
      const target = e.target;
      const isClickable = 
        target.tagName?.toLowerCase() === 'button' ||
        target.tagName?.toLowerCase() === 'a' ||
        target.closest?.('button') ||
        target.closest?.('a') ||
        target.classList?.contains('cursor-pointer');
        
      setIsHovering(!!isClickable);
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    // Hide default cursor on body when custom cursor is active
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = 'auto';
    };
  }, [isDesktop, mouseX, mouseY]);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  
  // Create transformed motion values to center the cursor
  const cursorSize = isHovering ? 48 : 16;
  const cursorX = useSpring(useTransform(mouseX, x => x - cursorSize / 2), springConfig);
  const cursorY = useSpring(useTransform(mouseY, y => y - cursorSize / 2), springConfig);
  
  const dotX = useSpring(useTransform(mouseX, x => x - 4), { damping: 40, stiffness: 800, mass: 0.1 });
  const dotY = useSpring(useTransform(mouseY, y => y - 4), { damping: 40, stiffness: 800, mass: 0.1 });

  if (!isDesktop) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-difference hidden lg:block"
        style={{
          x: cursorX,
          y: cursorY,
          width: isHovering ? 48 : 16,
          height: isHovering ? 48 : 16,
          backgroundColor: isHovering ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.4)',
          border: isHovering ? '1px solid #D4AF37' : '1px solid transparent',
        }}
        animate={{
          scale: isHovering ? 1.2 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000] rounded-full bg-accent-yellow hidden lg:block"
        style={{
          x: dotX,
          y: dotY,
          width: 8,
          height: 8,
        }}
        animate={{
          opacity: isHovering ? 0 : 1,
          scale: isHovering ? 0 : 1,
        }}
      />
    </>
  );
}
