import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';

/**
 * Cute Hand-Drawn / Glossy Floating Heart SVG
 * Recreates the floating heart aesthetic with romantic gradient fill, 
 * glossy shine highlight, and trailing mini hearts & wind swirls.
 */
const CuteFloatingHeartSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 135 105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0px 8px 16px rgba(225, 29, 72, 0.4))' }}
    >
      {/* 1. WIND SWIRLS / CURLY TRAIL (Behind the heart) */}
      <g stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6">
        {/* Top curly swirl */}
        <path d="M 82 38 C 88 34, 94 44, 90 47 C 86 50, 96 42, 104 38" />
        {/* Middle curly swirl */}
        <path d="M 88 65 C 96 61, 102 72, 98 75 C 94 78, 106 69, 118 70" />
      </g>

      {/* Mini Trailing Hearts */}
      <path
        d="M 95 32 C 93 29 89 29 89 32.5 C 89 36 95 40 95 40 C 95 40 101 36 101 32.5 C 101 29 97 29 95 32 Z"
        fill="#F43F5E"
        opacity="0.85"
      />
      <path
        d="M 112 60 C 110 58 107 58 107 60.5 C 107 63 112 66 112 66 C 112 66 117 63 117 60.5 C 117 58 114 58 112 60 Z"
        fill="#FB7185"
        opacity="0.85"
      />

      {/* 2. MAIN HEART BODY */}
      <g>
        {/* Heart Fill with Gradient */}
        <path
          d="M 48 22 C 34 8 10 22 10 44 C 10 68 48 92 48 92 C 48 92 86 68 86 44 C 86 22 62 8 48 22 Z"
          fill="url(#heartGradient)"
          stroke="#9F1239"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glossy Highlight Curve */}
        <path
          d="M 22 30 C 26 20 38 20 42 26"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <circle cx="20" cy="38" r="2.5" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* SVG Gradient Definitions */}
      <defs>
        <linearGradient id="heartGradient" x1="10" y1="10" x2="86" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF4D6D" />
          <stop offset="0.5" stopColor="#E01E5A" />
          <stop offset="1" stopColor="#C9184A" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const FlyingAirplane: React.FC = () => {
  const [isLooping, setIsLooping] = useState(false);

  // Trigger a quick 360-degree pulse & roll when clicked!
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLooping(true);
    setTimeout(() => setIsLooping(false), 800);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden hidden sm:block">
      <motion.div
        className="absolute top-0 left-0 pointer-events-auto cursor-pointer group"
        initial={{ x: '-140px', y: '15vh', rotate: -10 }}
        animate={{
          x: [
            '-140px',    // Start offscreen left
            '25vw',      // Swoop right
            '55vw',      // Soar middle
            '85vw',      // Glide right
            '110vw',     // Exit offscreen right
            '110vw',     // Turn offscreen right
            '75vw',      // Fly back left
            '35vw',      // Rise left
            '-140px',    // Exit offscreen left
            '-140px',    // Reset
          ],
          y: [
            '15vh',
            '28vh',
            '12vh',
            '42vh',
            '60vh',
            '78vh',
            '72vh',
            '45vh',
            '20vh',
            '15vh',
          ],
          rotate: [
            -10,
            -25,
            -5,
            10,
            -5,
            150,
            165,
            145,
            170,
            -10,
          ],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div 
          onClick={handleHeartClick}
          className="relative flex items-center justify-center p-2 group-hover:scale-125 transition-transform duration-300"
          title="Klik hati melayang Sapahati untuk kejutan kasih!"
        >
          {/* Heart Container with barrel roll animation on click */}
          <motion.div
            animate={{ rotate: isLooping ? 360 : 0, scale: isLooping ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="relative flex items-center justify-center"
          >
            {/* Cute Floating Heart SVG */}
            <CuteFloatingHeartSVG className="w-16 sm:w-20 h-auto" />

            {/* Sparkle effect on loop */}
            {isLooping && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center text-rose-500 pointer-events-none"
              >
                <div className="flex items-center gap-1">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                  <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Little message tag on hover */}
          <span className="absolute left-full ml-1 px-3 py-1 rounded-full bg-[#1D123B] text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-rose-400/40 flex items-center gap-1">
            💖 Kasih &amp; Dengar Sapahati
          </span>
        </div>
      </motion.div>
    </div>
  );
};
