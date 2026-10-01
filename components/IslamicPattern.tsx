import React from "react";

interface IslamicPatternProps {
  className?: string;
  opacity?: number;
  color?: string; // hex or CSS color
  scale?: number;
  variant?: "girih" | "arch" | "arabesque" | "ubk";
}

/**
 * Rich Authentic Islamic Girih & Arabesque Pattern with UBK Emblem Monogram.
 * Seamlessly integrates the signature UBK royal gold Kaaba emblem into each
 * interlocking geometric diamond cell, replacing generic polygons while preserving
 * authentic Islamic arabesque gridlines, geometry, and subtle watermark transparency.
 */
export function IslamicPattern({
  className = "",
  opacity = 0.12,
  color = "#d97706", // Royal Islamic Amber/Gold
  scale = 88,
  variant = "ubk",
}: IslamicPatternProps) {
  const rawId = React.useId();
  // Ensure valid CSS identifier
  const patternId = "ubk-pattern-" + rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <defs>
          <filter id={`${patternId}-gold-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor={color} floodOpacity="0.35" />
          </filter>

          <pattern
            id={patternId}
            width={scale}
            height={scale}
            patternUnits="userSpaceOnUse"
          >
            {/* Interlocking Arabesque Diamond Grid & Corner Circles */}
            <g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Outer Arabesque Diamond Lattice (Dashed) */}
              <polygon
                points={`0,${scale * 0.5} ${scale * 0.5},0 ${scale},${scale * 0.5} ${scale * 0.5},${scale}`}
                strokeWidth="0.85"
                strokeDasharray="4,2"
              />

              {/* Corner Interlocking Rosettes / Circles */}
              <circle cx="0" cy="0" r={scale * 0.2} strokeWidth="0.9" />
              <circle cx={scale} cy="0" r={scale * 0.2} strokeWidth="0.9" />
              <circle cx="0" cy={scale} r={scale * 0.2} strokeWidth="0.9" />
              <circle cx={scale} cy={scale} r={scale * 0.2} strokeWidth="0.9" />

              {/* Delicate Geometric Circular Ring Framing the UBK Emblem */}
              <circle
                cx={scale * 0.5}
                cy={scale * 0.5}
                r={scale * 0.3}
                strokeWidth="0.8"
                strokeDasharray="2.5,2"
                opacity="0.75"
              />

              {/* Corner Star Accent Diamonds */}
              <rect
                x={-scale * 0.03}
                y={-scale * 0.03}
                width={scale * 0.06}
                height={scale * 0.06}
                transform={`rotate(45 0 0)`}
                fill={color}
                strokeWidth="0"
              />
              <rect
                x={scale - scale * 0.03}
                y={-scale * 0.03}
                width={scale * 0.06}
                height={scale * 0.06}
                transform={`rotate(45 ${scale} 0)`}
                fill={color}
                strokeWidth="0"
              />
              <rect
                x={-scale * 0.03}
                y={scale - scale * 0.03}
                width={scale * 0.06}
                height={scale * 0.06}
                transform={`rotate(45 0 ${scale})`}
                fill={color}
                strokeWidth="0"
              />
              <rect
                x={scale - scale * 0.03}
                y={scale - scale * 0.03}
                width={scale * 0.06}
                height={scale * 0.06}
                transform={`rotate(45 ${scale} ${scale})`}
                fill={color}
                strokeWidth="0"
              />
            </g>

            {/* Authentic UBK Logo Emblem in the center of each cell */}
            <image
              href="/images/logo-emblem.png"
              xlinkHref="/images/logo-emblem.png"
              x={scale * 0.23}
              y={scale * 0.17}
              width={scale * 0.54}
              height={scale * 0.66}
              preserveAspectRatio="xMidYMid meet"
              opacity="0.9"
              filter={`url(#${patternId}-gold-glow)`}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

/**
 * Islamic Mihrab Arch Silhouette Frame
 * Can be placed at the top of cards or sections to give a mosque archway aesthetic
 */
export function IslamicArchHeader({ title, subtitle, className = "" }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={`relative flex flex-col items-center justify-center pt-6 pb-4 px-4 ${className}`}>
      {/* Arch Outline SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 120">
        <path
          d="M 0,120 L 0,60 Q 0,0 200,0 Q 400,0 400,60 L 400,120 Z"
          fill="rgba(6, 78, 59, 0.08)"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeDasharray="6,3"
        />
        {/* Ornate Arch Keystones */}
        <polygon points="195,15 200,2 205,15" fill="#f59e0b" />
      </svg>
      <span className="relative z-10 text-[10px] font-black text-amber-600 uppercase tracking-widest">
        {subtitle}
      </span>
      <h3 className="relative z-10 text-lg sm:text-xl font-black text-slate-900 mt-1">
        {title}
      </h3>
    </div>
  );
}
