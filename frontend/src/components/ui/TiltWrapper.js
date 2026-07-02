"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

export default function TiltWrapper({ children, className = "" }) {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);

  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  const handleMouseMove = (e) => {
    if (!isDesktop) return;
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseEnter = () => {
    if (isDesktop) setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    if (!isDesktop) return;
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isDesktop ? rotateX : 0,
        rotateY: isDesktop ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-2xl ${className}`}
    >
      {/* Glare effect */}
      {isDesktop && (
        <motion.div 
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl transition-opacity duration-300"
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)",
            opacity: isHovered ? 1 : 0,
            left: glareX,
            top: glareY,
            width: "200%",
            height: "200%",
            transform: "translate(-50%, -50%)",
            mixBlendMode: "overlay"
          }}
        />
      )}
      
      {/* Content wrapper with depth */}
      <div 
        style={{ transform: isHovered ? "translateZ(30px)" : "translateZ(0px)" }}
        className="transition-transform duration-300 ease-out h-full w-full rounded-2xl relative z-10"
      >
        {children}
      </div>
    </motion.div>
  );
}
