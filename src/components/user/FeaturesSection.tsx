import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Smile } from 'lucide-react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';
import { motion } from 'motion/react';

interface FeaturesSectionProps {
  onStartCurhat: () => void;
  onOpenPsikolog: () => void;
  onOpenMoodTracker: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  onStartCurhat,
  onOpenPsikolog,
  onOpenMoodTracker,
}) => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const kamiHadir = cms.kamiHadir;
  const items = kamiHadir.items && kamiHadir.items.length >= 3 ? kamiHadir.items : [];

  // Jika tidak ada data "Kami Hadir" dari Spreadsheet, sembunyikan section
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-6xl mx-auto">
      {/* Section Title */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-4 sm:mb-6"
      >
        <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-[#1D123B] tracking-tight">
          {kamiHadir.sectionTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
          {kamiHadir.sectionSubtitle}
        </p>
        <div className="w-10 sm:w-12 h-1 bg-[#7A52F4] rounded-full mx-auto mt-2"></div>
      </motion.div>

      {/* 3 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
        
        {/* Card 1: Curhat dengan AI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={onStartCurhat}
          className="bg-white hover:bg-purple-50/40 rounded-xl sm:rounded-3xl p-3.5 sm:p-7 border border-purple-100/80 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-3.5 sm:gap-0 group relative overflow-hidden active:scale-[0.98]"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#EFE8FF] text-[#7A52F4] flex items-center justify-center shrink-0 sm:mb-5 group-hover:scale-110 transition-transform shadow-2xs">
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2] fill-[#7A52F4]/20" />
          </div>

          <div className="flex-1 min-w-0 sm:w-full">
            <div className="flex items-center justify-between gap-2 sm:block mb-1 sm:mb-2">
              <h3 className="text-sm sm:text-xl font-bold text-[#1D123B] group-hover:text-[#6C47FF] transition-colors truncate sm:whitespace-normal">
                {items[0].title}
              </h3>
              <span className="inline-block sm:hidden text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 shrink-0">
                {items[0].badge}
              </span>
            </div>

            <p className="text-[#64748B] text-xs sm:text-sm leading-snug sm:leading-relaxed mb-0 sm:mb-6 font-normal line-clamp-2 sm:line-clamp-none">
              {items[0].description}
            </p>
          </div>

          <div className="hidden sm:block w-12 h-1 bg-[#8B5CF6]/50 rounded-full mt-auto"></div>
        </motion.div>

        {/* Card 2: Konsultasi Psikolog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={onOpenPsikolog}
          className="bg-white hover:bg-teal-50/40 rounded-xl sm:rounded-3xl p-3.5 sm:p-7 border border-teal-100/80 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-3.5 sm:gap-0 group relative overflow-hidden active:scale-[0.98]"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#E3F6F1] text-[#0D9488] flex items-center justify-center shrink-0 sm:mb-5 group-hover:scale-110 transition-transform shadow-2xs">
            <User className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2] fill-[#0D9488]/20" />
          </div>

          <div className="flex-1 min-w-0 sm:w-full">
            <div className="flex items-center justify-between gap-2 sm:block mb-1 sm:mb-2">
              <h3 className="text-sm sm:text-xl font-bold text-[#1D123B] group-hover:text-[#0D9488] transition-colors truncate sm:whitespace-normal">
                {items[1].title}
              </h3>
              <span className="inline-block sm:hidden text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 shrink-0">
                {items[1].badge}
              </span>
            </div>

            <p className="text-[#64748B] text-xs sm:text-sm leading-snug sm:leading-relaxed mb-0 sm:mb-6 font-normal line-clamp-2 sm:line-clamp-none">
              {items[1].description}
            </p>
          </div>

          <div className="hidden sm:block w-12 h-1 bg-[#0D9488]/50 rounded-full mt-auto"></div>
        </motion.div>

        {/* Card 3: Kenali Dirimu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={onOpenMoodTracker}
          className="bg-white hover:bg-amber-50/40 rounded-xl sm:rounded-3xl p-3.5 sm:p-7 border border-amber-100/80 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-3.5 sm:gap-0 group relative overflow-hidden active:scale-[0.98] sm:col-span-2 lg:col-span-1"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 sm:mb-5 group-hover:scale-110 transition-transform shadow-2xs">
            <Smile className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2] fill-[#D97706]/20" />
          </div>

          <div className="flex-1 min-w-0 sm:w-full">
            <div className="flex items-center justify-between gap-2 sm:block mb-1 sm:mb-2">
              <h3 className="text-sm sm:text-xl font-bold text-[#1D123B] group-hover:text-[#D97706] transition-colors truncate sm:whitespace-normal">
                {items[2].title}
              </h3>
              <span className="inline-block sm:hidden text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                {items[2].badge}
              </span>
            </div>

            <p className="text-[#64748B] text-xs sm:text-sm leading-snug sm:leading-relaxed mb-0 sm:mb-6 font-normal line-clamp-2 sm:line-clamp-none">
              {items[2].description}
            </p>
          </div>

          <div className="hidden sm:block w-12 h-1 bg-[#F59E0B]/50 rounded-full mt-auto"></div>
        </motion.div>

      </div>
    </section>
  );
};
