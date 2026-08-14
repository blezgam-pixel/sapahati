import React, { useState, useEffect } from 'react';
import { Quote, Heart, Sparkles, ShieldCheck, Award } from 'lucide-react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';

export const MotivationalPsychologistsSection: React.FC = () => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const mp = cms.motivationalPsychologists;

  // Jika tidak ada data psikolog dari Spreadsheet, sembunyikan section
  if (!mp.leftName && !mp.rightName && !mp.leftQuote && !mp.rightQuote) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-purple-50/80 via-white to-indigo-50/80 border border-purple-100/90 rounded-3xl p-5 sm:p-8 shadow-2xs relative overflow-hidden text-left my-2">
      {/* Decorative ambient background blur */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-teal-200/40 rounded-full blur-2xl pointer-events-none" />

      {/* Header Label */}
      <div className="text-center max-w-xl mx-auto space-y-1.5 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6C47FF] text-xs font-extrabold border border-purple-200">
          <Heart className="w-3.5 h-3.5 fill-[#6C47FF]" />
          <span>{mp.sectionTitle}</span>
        </div>
        <h3 className="text-lg sm:text-2xl font-extrabold text-[#1D123B] tracking-tight">
          Kamu Berharga &amp; Layak Didengar
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          {mp.sectionSubtitle}
        </p>
      </div>

      {/* Main Grid Layout with 2 Psychologists (Left & Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-end max-w-4xl mx-auto relative z-10">
        
        {/* Left Psychologist (With Speech Bubble / Balon Kata Motivasi) */}
        <div className="flex flex-col items-center md:items-start space-y-3 relative group">
          
          {/* Balon Kata Motivasi (Speech Bubble) */}
          <div className="relative bg-gradient-to-br from-[#6C47FF] via-[#5B33D4] to-[#4822B8] text-white p-4 sm:p-5 rounded-2xl rounded-bl-none shadow-md border border-purple-400/30 max-w-md transition-transform group-hover:-translate-y-1">
            <div className="flex items-start gap-2.5">
              <Quote className="w-6 h-6 text-amber-300 shrink-0 fill-amber-300/30 rotate-180" />
              <p className="text-xs sm:text-sm font-medium leading-relaxed tracking-wide text-purple-50">
                &ldquo;{mp.leftQuote}&rdquo;
              </p>
            </div>

            {/* Speech Bubble Tail Arrow */}
            <div className="absolute -bottom-2.5 left-6 w-4 h-4 bg-[#4822B8] rotate-45 border-r border-b border-purple-400/30" />
          </div>

          {/* Psychologist Info Card (Left) */}
          <div className="flex items-center gap-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 pr-5 rounded-2xl border border-purple-100 shadow-sm w-full sm:w-auto">
            <div className="relative shrink-0">
              <img
                src={mp.leftPhoto}
                alt={mp.leftName}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl object-cover border-3 border-purple-200 shadow-sm"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-teal-500 text-white rounded-full p-1 shadow-xs">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-[#1D123B] flex items-center gap-1">
                <span>{mp.leftName}</span>
              </h4>
              {mp.leftTitle && mp.leftTitle !== 'Psychologist' && mp.leftTitle !== 'Psikolog' && (
                <p className="text-xs font-semibold text-purple-600 mt-0.5">{mp.leftTitle}</p>
              )}
              {mp.leftExp && mp.leftExp !== 'Pengalaman 8+ Tahun' && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500 font-medium">
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{mp.leftExp}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Psychologist */}
        <div className="flex flex-col items-center md:items-end space-y-3 relative group">
          
          {/* Additional Quote Badge / Encouragement Card for Right Psychologist */}
          <div className="bg-white p-4 rounded-2xl rounded-br-none shadow-xs border border-teal-100 max-w-md text-slate-700 space-y-1.5 transition-transform group-hover:-translate-y-1">
            <div className="flex items-center gap-1.5 text-teal-700 font-extrabold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Satu Langkah Kecil Hari Ini</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              &ldquo;{mp.rightQuote}&rdquo;
            </p>
            {/* Speech Tail Arrow Right */}
            <div className="hidden md:block absolute -bottom-2.5 right-6 w-4 h-4 bg-white rotate-45 border-r border-b border-teal-100" />
          </div>

          {/* Psychologist Info Card (Right) */}
          <div className="flex items-center gap-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 pr-5 rounded-2xl border border-teal-100 shadow-sm w-full sm:w-auto">
            <div className="relative shrink-0">
              <img
                src={mp.rightPhoto}
                alt={mp.rightName}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl object-cover border-3 border-teal-200 shadow-sm"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-teal-500 text-white rounded-full p-1 shadow-xs">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-[#1D123B] flex items-center gap-1">
                <span>{mp.rightName}</span>
              </h4>
              {mp.rightTitle && mp.rightTitle !== 'Chief Psychologist Officer' && (
                <p className="text-xs font-semibold text-teal-700 mt-0.5">{mp.rightTitle}</p>
              )}
              {mp.rightExp && mp.rightExp !== 'Pengalaman 6+ Tahun' && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500 font-medium">
                  <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{mp.rightExp}</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
