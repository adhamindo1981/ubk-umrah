"use client";

import React, { useRef, useState, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MotionCard3DProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
}

/**
 * مكوّن البطاقة ثلاثية الأبعاد التفاعلية (3D Tilt & Glow) بنمط Framer Studio
 */
export function MotionCard3D({
  children,
  className = "",
  glowColor = "rgba(245, 158, 11, 0.25)",
  intensity = 15,
}: MotionCard3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${intensity}deg`, `-${intensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${intensity}deg`, `${intensity}deg`]);

  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    setGlowPos({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
    });
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.018 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-3xl transition-shadow duration-300 ${className}`}
    >
      {/* توهج تفاعلي يتبع مؤشر الفأرة (Dynamic Radial Glare) */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(550px circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 70%)`,
        }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </motion.div>
  );
}
