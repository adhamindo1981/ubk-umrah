import React from "react";

interface SocialMediaIconsProps {
  className?: string;
  showHandle?: boolean;
}

export function SocialMediaIcons({ className = "", showHandle = true }: SocialMediaIconsProps) {
  const socials = [
    {
      name: "Instagram",
      href: "https://instagram.com/ubkumrah",
      colorClass: "hover:text-pink-400 hover:border-pink-500/50 hover:shadow-pink-500/20",
      svg: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://tiktok.com/@ubkumrah",
      colorClass: "hover:text-cyan-400 hover:border-cyan-500/50 hover:shadow-cyan-500/20",
      svg: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.38a6.34 6.34 0 0 0-.86-.06A6.33 6.33 0 0 0 3.12 15.65 6.34 6.34 0 0 0 9.46 22a6.33 6.33 0 0 0 6.33-6.33V9.17a8.28 8.28 0 0 0 4.8 1.52v-3.5a4.86 4.86 0 0 1-1-.5z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://facebook.com/ubkumrah",
      colorClass: "hover:text-blue-400 hover:border-blue-500/50 hover:shadow-blue-500/20",
      svg: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          title={`${s.name} @ubkumrah`}
          className={`w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-md ${s.colorClass}`}
        >
          {s.svg}
        </a>
      ))}

      {showHandle && (
        <span
          className="h-10 px-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-mono text-sm font-black flex items-center justify-center tracking-wider shadow-md transition select-all"
          title="Username: @ubkumrah"
        >
          @ubkumrah
        </span>
      )}
    </div>
  );
}
