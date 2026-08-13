import React, { useState, useEffect } from 'react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';
import { TransparentImage } from '../common/TransparentImage';

interface MobileHeaderProps {
  onGoHome?: () => void;
  onOpenNav?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onGoHome }) => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const branding = cms.branding;

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-purple-50/80 shadow-2xs">
      {/* Brand Logo & Title Synced with Spreadsheet / CMS Data */}
      <div 
        onClick={onGoHome}
        className="flex items-center gap-2.5 cursor-pointer select-none"
      >
        {/* Brand Logo Image from Spreadsheet / CMS */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
          <TransparentImage 
            src={branding.logoImage} 
            alt={`${branding.brandName} Logo`} 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-[#1D123B] tracking-tight leading-none">
            {branding.brandName}
          </span>
          <span className="text-[7.5px] font-bold tracking-widest text-[#6C47FF] mt-0.5 uppercase">
            {branding.brandSubtitle}
          </span>
        </div>
      </div>
    </div>
  );
};

