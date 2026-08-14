import React, { useState, useEffect } from 'react';
import { ChevronRight, Lock, ShieldCheck, Heart } from 'lucide-react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';
import { APP_IMAGES } from '../../data/appImages';
import { TransparentImage } from '../common/TransparentImage';

interface BannerSectionProps {
  onStartCurhat?: () => void;
}

export const BannerSection: React.FC<BannerSectionProps> = ({
  onStartCurhat,
}) => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const kamuTidakSendiri = cms.kamuTidakSendiri;
  const bannerImgSrc = kamuTidakSendiri.bannerImage || (kamuTidakSendiri.items && kamuTidakSendiri.items[0]?.image) || APP_IMAGES.bannerImage;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 max-w-6xl mx-auto">
      <div className="bg-gradient-to-b from-[#EFEBFF] via-[#E8E1FF] to-[#E2DAFF] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-purple-100/80 shadow-2xs relative overflow-hidden">
        
        {/* Upper Content Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 mb-4 sm:mb-6">
          
          {/* Text Info */}
          <div className="space-y-1.5 sm:space-y-3 text-left w-full md:max-w-xl">
            {kamuTidakSendiri.sectionTitle && (
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-[#1D123B] tracking-tight">
              {kamuTidakSendiri.sectionTitle}
            </h2>
            )}
            {kamuTidakSendiri.sectionSubtitle && (
            <p className="text-[#475569] text-xs sm:text-base leading-relaxed font-normal">
              {kamuTidakSendiri.sectionSubtitle}
            </p>
            )}
          </div>

          {/* Banner Graphic Image — hanya tampil jika ada gambar dari Spreadsheet */}
          {bannerImgSrc && (
          <div className="relative w-full md:w-80 lg:w-96 max-h-48 md:max-h-none aspect-16/9 md:aspect-4/3 flex items-center justify-center shrink-0 p-1">
            <TransparentImage 
              src={bannerImgSrc} 
              alt="Sapahati Banner Support" 
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
          )}

        </div>

        {/* CTA Button: "Mulai Cerita Sekarang" */}
        {onStartCurhat && (
          <button
            onClick={onStartCurhat}
            className="w-full py-3 sm:py-4 px-5 rounded-xl sm:rounded-2xl bg-[#7C5CFC] hover:bg-[#6C47FF] text-white font-bold text-sm sm:text-lg flex items-center justify-center gap-2 shadow-md shadow-purple-300/60 hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer mb-3 sm:mb-6"
          >
            <span>Mulai Cerita Sekarang</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        )}

        {/* 3 Security Badges matching target design */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-3 sm:pt-4 border-t border-purple-200/50">
          
          {/* Badge 1: 100% Rahasia */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-purple-50/60 text-center sm:text-left">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#E2D5FF] text-[#7C3AED] flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] sm:text-sm font-bold text-[#334155] leading-tight">100% Rahasia</span>
          </div>

          {/* Badge 2: Aman & Terpercaya */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-50/60 text-center sm:text-left">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] sm:text-sm font-bold text-[#334155] leading-tight">Aman & Terpercaya</span>
          </div>

          {/* Badge 3: Tanpa Penilaian */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-amber-50/60 text-center sm:text-left">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2] fill-[#EA580C]" />
            </div>
            <span className="text-[10px] sm:text-sm font-bold text-[#334155] leading-tight">Tanpa Penilaian</span>
          </div>

        </div>

      </div>
    </section>
  );
};
