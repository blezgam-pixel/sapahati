import React, { useState, useEffect } from 'react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';

export const SponsorTicker: React.FC = () => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const sponsors = cms.sponsors && cms.sponsors.length > 0 ? cms.sponsors : [];

  // Jika tidak ada data sponsor dari Spreadsheet, sembunyikan section
  if (sponsors.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-6 select-none">
      {/* Clean White Container */}
      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-2xs py-6 px-4 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6 lg:gap-8">
          {/* Label "Didukung Oleh:" */}
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
                {item.logoUrl && item.logoUrl.trim().length > 0 ? (
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    className="max-h-12 sm:max-h-14 max-w-[130px] sm:max-w-[150px] object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs tracking-tight shadow-2xs">
                    {item.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
