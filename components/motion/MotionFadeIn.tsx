"use client";

import React, { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface MotionFadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  cascade?: boolean;
  className?: string;
}

/**
 * مكوّن حركة Framer Motion للظهور التفاعلي عند التمرير
 */
export function MotionFadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
  ...props
}: MotionFadeInProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: 28, opacity: 0 };
      case "down":
        return { y: -28, opacity: 0 };
      case "left":
        return { x: 28, opacity: 0 };
      case "right":
        return { x: -28, opacity: 0 };
      case "none":
      default:
        return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
