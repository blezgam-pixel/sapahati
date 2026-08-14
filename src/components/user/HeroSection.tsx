import React, { useState, useEffect } from 'react';
import { ShieldCheck, User } from 'lucide-react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';
import { TransparentImage } from '../common/TransparentImage';

interface HeroSectionProps {
  onStartCurhat?: () => void;
  onOpenPsikolog?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const hero = cms.hero;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-2 sm:py-5 max-w-6xl mx-auto transition-all">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Headline, Subtitle & Badges */}
        <div className="space-y-3 sm:space-y-6 text-left">
          <div className="space-y-1.5 sm:space-y-4">
            {hero.title && (
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1D123B] leading-[1.15] tracking-tight">
              {hero.title}
            </h1>
            )}

            {hero.subtitle && (
            <p className="text-[#64748B] text-xs sm:text-base md:text-lg leading-relaxed font-normal max-w-lg pt-0.5 sm:pt-1">
              {hero.subtitle}
            </p>
            )}
          </div>

          {/* Feature Badges (Pills) */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-3 pt-2">
            {/* Badge 1: Privasi Terjaga */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-2 rounded-xl bg-[#EAF7F1] border border-emerald-100/80 text-[#2D3748] text-[11px] sm:text-sm font-semibold shadow-2xs whitespace-nowrap">
              <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-[#10B981] flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 stroke-[2.5]" />
              </div>
              <span>Privasi Terjaga 100% Rahasia</span>
            </div>

            {/* Badge 2: Psikolog Berpengalaman */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-2 rounded-xl bg-[#F2EEFF] border border-purple-100/80 text-[#2D3748] text-[11px] sm:text-sm font-semibold shadow-2xs whitespace-nowrap">
              <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white shrink-0">
                <User className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 stroke-[2.5]" />
              </div>
              <span>Psikolog Berpengalaman</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image beside text — hanya tampil jika ada gambar */}
        {hero.heroImage && (
        <div className="relative flex items-center justify-center p-0 sm:p-2">
          <div className="relative w-full min-h-[260px] sm:min-h-[360px] md:min-h-[440px] lg:min-h-[480px] flex items-center justify-center p-2 sm:p-4">
            <TransparentImage 
              src={hero.heroImage} 
              alt="Teman Bicara Sapahati" 
              className="w-full h-full object-contain max-h-[500px] transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
        )}

      </div>
    </section>
  );
};
