import React, { useState, useEffect } from 'react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';

export const SponsorTicker: React.FC = () => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const defaultSponsors = [
    { id: 's1', name: 'tem.peh', logoUrl: '' },
    { id: 's2', name: 'Sinlube Oils', logoUrl: '' },
    { id: 's3', name: 'Ai-KA Coffee & Tea', logoUrl: '' },
    { id: 's4', name: 'chicco', logoUrl: '' },
    { id: 's5', name: 'Eaton', logoUrl: '' },
    { id: 's6', name: 'UNITED', logoUrl: '' },
    { id: 's7', name: 'WEDRINK', logoUrl: '' },
    { id: 's8', name: 'FLY.INC', logoUrl: '' },
    { id: 's9', name: 'ZHENGDA', logoUrl: '' },
    { id: 's10', name: 'ISOTEMA', logoUrl: '' },
    { id: 's11', name: 'coocaa', logoUrl: '' },
    { id: 's12', name: 'KWANMANEE', logoUrl: '' },
  ];

  const sponsors = cms.sponsors && cms.sponsors.length > 0 ? cms.sponsors : defaultSponsors;

  // Render vector SVG logos matching screenshot brands if logoUrl is empty
  const renderLogo = (name: string, logoUrl: string) => {
    if (logoUrl && logoUrl.trim().length > 0) {
      return (
        <img
          src={logoUrl}
          alt={name}
          className="max-h-12 sm:max-h-14 max-w-[130px] sm:max-w-[150px] object-contain transition-transform duration-300 hover:scale-105"
        />
      );
    }

    const n = name.toLowerCase();

    if (n.includes('tem.peh') || n.includes('tempeh')) {
      return (
        <span className="font-serif text-2xl sm:text-3xl tracking-tight text-slate-900 font-normal select-none">
          tem<span className="text-slate-900 mx-0.5">•</span>peh
        </span>
      );
    }

    if (n.includes('sinlube')) {
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <svg className="w-6 h-6 text-red-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-8h2v8z" />
          </svg>
          <span className="font-black text-red-600 text-sm sm:text-base tracking-tighter uppercase italic font-sans">
            Sinlube Oils
          </span>
        </div>
      );
    }

    if (n.includes('ai-ka') || n.includes('aika')) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold border border-amber-300 shadow-2xs">
            🦥
          </div>
          <span className="font-extrabold text-[#7c2d12] text-[11px] tracking-tight leading-none uppercase mt-0.5 font-sans">
            Ai-KA
          </span>
          <span className="text-[7px] font-bold text-amber-900 tracking-widest uppercase mt-0.5 font-sans">
            COFFEE &amp; TEA
          </span>
        </div>
      );
    }

    if (n.includes('chicco')) {
      return (
        <div className="px-3.5 py-1 rounded-full border-2 border-blue-900 bg-white shadow-2xs flex items-center justify-center">
          <span className="font-extrabold text-blue-900 text-lg sm:text-xl tracking-tight font-sans relative">
            chicc<span className="text-red-600">o</span>
          </span>
        </div>
      );
    }

    if (n.includes('eaton')) {
      return (
        <div className="flex flex-col items-center justify-center text-center px-4 py-2 bg-[#f5f0ea] rounded-md">
          <span className="font-serif italic font-bold text-[#800000] text-xl sm:text-2xl tracking-tight leading-none">
            Eaton
          </span>
          <span className="text-[8px] italic font-medium text-amber-900 tracking-wider mt-0.5">
            Since 1995
          </span>
        </div>
      );
    }

    if (n.includes('united')) {
      return (
        <div className="flex items-center justify-center">
          <span className="font-black text-red-600 text-xl sm:text-2xl tracking-tighter italic font-sans flex items-center">
            UNIT<span className="text-red-700 flex items-center">E<span className="text-red-600 ml-0.5">D</span></span>
          </span>
        </div>
      );
    }

    if (n.includes('wedrink')) {
      return (
        <div className="bg-[#00a896] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
          <span className="text-base">🐥</span>
          <div className="flex flex-col leading-none text-left">
            <span className="font-black text-xs sm:text-sm tracking-wide font-sans">WEDRINK</span>
            <span className="text-[6px] tracking-widest uppercase font-semibold text-teal-100 font-sans mt-0.5">ICE CREAM • TEA</span>
          </div>
        </div>
      );
    }

    if (n.includes('fly.inc') || n.includes('fly')) {
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-black text-xs italic">
            ✈
          </div>
          <span className="font-black text-blue-950 text-base sm:text-lg tracking-tight italic font-sans">
            FLY.INC
          </span>
        </div>
      );
    }

    if (n.includes('zhengda')) {
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <span className="text-lg">🐔</span>
          <div className="flex flex-col leading-none text-left">
            <span className="font-extrabold text-red-600 text-xs sm:text-sm tracking-tight font-sans">ZHENGDA</span>
            <span className="text-[6px] font-bold text-slate-700 tracking-widest uppercase font-sans mt-0.5">CHICKEN STEAK</span>
          </div>
        </div>
      );
    }

    if (n.includes('isotema')) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center font-black text-sm sm:text-base tracking-tight font-sans">
            <span className="text-slate-900">ISO</span>
            <span className="text-amber-500">TEMA</span>
          </div>
          <span className="text-[5px] font-bold text-slate-500 tracking-tighter uppercase font-sans mt-0.5">
            FIRST SOLUTION IN TECHNOLOGY AND MACHINERY
          </span>
        </div>
      );
    }

    if (n.includes('coocaa')) {
      return (
        <div className="flex items-center justify-center">
          <span className="font-bold text-orange-500 text-xl sm:text-2xl tracking-wide font-sans">
            coocaa
          </span>
        </div>
      );
    }

    if (n.includes('kwanmanee')) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-7 h-7 border border-amber-600/80 rotate-45 flex items-center justify-center mb-1">
            <span className="-rotate-45 font-serif text-amber-700 text-sm font-bold">K</span>
          </div>
          <span className="font-serif text-[9px] font-bold text-amber-800/90 tracking-widest uppercase">
            KWANMANEE
          </span>
          <span className="text-[6px] text-amber-600 italic">Since 1985</span>
        </div>
      );
    }

    // Default fallback graphic logo for any custom name
    return (
      <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs tracking-tight shadow-2xs">
        {name}
      </div>
    );
  };

  return (
    <div className="w-full my-6 select-none">
      {/* Clean White Container matching screenshot */}
      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-2xs py-6 px-4 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6 lg:gap-8">
          {/* Label "Didukung Oleh:" - tulisan saja tanpa card */}
          <div className="shrink-0 flex flex-col justify-center">
            <span className="text-xs sm:text-sm font-bold text-slate-600 leading-tight tracking-wide">Didukung</span>
            <span className="text-sm sm:text-base font-black text-purple-700 leading-tight tracking-tight">Oleh:</span>
          </div>

          {/* Grid / Flex daftar logo sponsor */}
          <div className="flex-1 w-full flex flex-wrap items-center justify-center md:justify-start gap-x-6 sm:gap-x-8 gap-y-4">
            {sponsors.map((item) => (
              <div
                key={item.id}
                className="h-12 sm:h-14 min-w-[100px] max-w-[160px] flex items-center justify-center p-2 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer group"
                title={item.name}
              >
                {renderLogo(item.name, item.logoUrl)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
