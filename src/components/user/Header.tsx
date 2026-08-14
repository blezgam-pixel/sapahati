import React, { useState, useEffect } from 'react';
import { Menu, UserCheck, Home, MessageSquare, User, Smile, Brain } from 'lucide-react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';
import { TransparentImage } from '../common/TransparentImage';

interface HeaderProps {
  onOpenNav: () => void;
  onStartCurhat?: () => void;
  onOpenPsikolog?: () => void;
  onOpenDashboard?: () => void;
  onOpenMoodTracker?: () => void;
  onOpenPsikotes?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNav,
  onStartCurhat,
  onOpenPsikolog,
  onOpenDashboard,
  onOpenMoodTracker,
  onOpenPsikotes,
  onGoHome,
}) => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const handleHomeClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const branding = cms.branding;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8FF]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 border-b border-purple-100/80 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo and Brand Name */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer select-none shrink-0"
          onClick={handleHomeClick}
        >
          {branding.logoImage && (
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
            <TransparentImage 
              src={branding.logoImage} 
              alt={`${branding.brandName || 'App'} Logo`} 
              className="w-full h-full object-contain"
            />
          </div>
          )}
          {(branding.brandName || branding.brandSubtitle) && (
          <div className="flex flex-col">
            {branding.brandName && (
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D123B] group-hover:text-[#6C47FF] transition-colors leading-none">
              {branding.brandName}
            </span>
            )}
            {branding.brandSubtitle && (
            <span className="text-[10px] sm:text-xs text-purple-600 font-medium tracking-wide hidden sm:block">
              {branding.brandSubtitle}
            </span>
            )}
          </div>
          )}
        </div>

        {/* Navigation Menu - Visible on Desktop (lg: >= 1024px) */}
        <nav className="hidden lg:flex items-center gap-0.5 lg:gap-1 xl:gap-2">
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-1.5 px-2 lg:px-2.5 xl:px-3 py-2 rounded-xl text-slate-700 hover:text-[#6C47FF] hover:bg-purple-50 text-xs lg:text-xs xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            <Home className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Beranda</span>
          </button>

          {onOpenPsikotes && (
            <button
              onClick={onOpenPsikotes}
              className="flex items-center gap-1.5 px-2 lg:px-2.5 xl:px-3 py-2 rounded-xl text-slate-700 hover:text-[#6C47FF] hover:bg-purple-50 text-xs lg:text-xs xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <Brain className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Psikotes</span>
            </button>
          )}

          {onStartCurhat && (
            <button
              onClick={onStartCurhat}
              className="flex items-center gap-1.5 px-2 lg:px-2.5 xl:px-3 py-2 rounded-xl text-slate-700 hover:text-[#6C47FF] hover:bg-purple-50 text-xs lg:text-xs xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Sesi Curhat</span>
            </button>
          )}

          {onOpenPsikolog && (
            <button
              onClick={onOpenPsikolog}
              className="flex items-center gap-1.5 px-2 lg:px-2.5 xl:px-3 py-2 rounded-xl text-slate-700 hover:text-teal-700 hover:bg-teal-50 text-xs lg:text-xs xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <User className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Konsultasi Psikolog</span>
            </button>
          )}

          {onOpenMoodTracker && (
            <button
              onClick={onOpenMoodTracker}
              className="flex items-center gap-1.5 px-2 lg:px-2.5 xl:px-3 py-2 rounded-xl text-slate-700 hover:text-amber-700 hover:bg-amber-50 text-xs lg:text-xs xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <Smile className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Mood Tracker</span>
            </button>
          )}

        </nav>

        {/* Mobile & Tablet Hamburger Menu Controls - Visible on screens under lg (< 1024px) */}
        <div className="flex lg:hidden items-center gap-2">

          <button
            onClick={onOpenNav}
            className="w-9 h-9 rounded-full bg-white hover:bg-purple-50 border border-purple-100 shadow-2xs flex items-center justify-center text-[#1D123B] transition-all active:scale-95 focus:outline-hidden cursor-pointer"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

      </div>
    </header>
  );
};
