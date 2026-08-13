import React, { useState, useEffect } from 'react';
import { Heart, UserCheck, MessageCircle } from 'lucide-react';
import { SponsorTicker } from './SponsorTicker';
import { PersonalityQuizSection } from './PersonalityQuizSection';
import { TestimonialsSection } from './TestimonialsSection';
import { MotivationalPsychologistsSection } from '../psychologist/MotivationalPsychologistsSection';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';

interface FooterProps {
  onOpenDashboard?: () => void;
  onOpenPsikolog?: () => void;
  hideExtraSections?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPsikolog, hideExtraSections = false }) => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const branding = cms.branding;
  const mitra = cms.mitraKarir;
  const rawWa = branding.contactWhatsapp || '6281298765432';
  const cleanWa = rawWa.replace(/\D/g, '');
  const formattedWa = rawWa.startsWith('+') ? rawWa : `+${cleanWa}`;
  const whatsappUrl = `https://wa.me/${cleanWa}?text=Halo%20Admin%20${encodeURIComponent(branding.brandName)},%20saya%20ingin%20mendaftar%20sebagai%20Psikolog%20Mitra`;

  return (
    <footer className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 sm:gap-6">
        
        {!hideExtraSections && (
          <>
            {/* Kuis Tes Kepribadian 6 Soal */}
            {onOpenPsikolog && (
              <PersonalityQuizSection onOpenPsikolog={onOpenPsikolog} />
            )}

            {/* Kata Mereka (Testimonials Section) */}
            <TestimonialsSection />

            {/* Seksi Motivasi Psikolog (2 Foto & Balon Kata) */}
            <MotivationalPsychologistsSection />

            {/* Sponsor & Mitra Logo Grid (Posisi tepat di atas Mitra & Karir Psikolog) */}
            <div className="w-full">
              <SponsorTicker />
            </div>

            {/* Banner pendaftaran psikolog mitra */}
            <div className="w-full bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50/50 border border-teal-200/80 rounded-3xl p-5 sm:p-7 shadow-2xs text-left flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-extrabold border border-teal-200 inline-block">
                  Mitra &amp; Karir Psikolog
                </span>
                <h4 className="text-base sm:text-xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2 pt-1">
                  <UserCheck className="w-5 h-5 text-teal-600 shrink-0" />
                  {mitra.bannerTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {mitra.bannerDescription}
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-5 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>{mitra.buttonText || 'Hubungi WA Admin'} ({formattedWa})</span>
              </a>
            </div>
          </>
        )}

        {/* Bottom Tagline */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-purple-100/50 text-[#525B75] text-xs sm:text-sm font-medium border border-purple-200/40">
          <span>Untuk setiap hati yang ingin didengar</span>
          <Heart className="w-3.5 h-3.5 text-[#7A52F4] fill-[#7A52F4]" />
        </div>

        <div className="text-[11px] sm:text-xs text-slate-400">
          © {new Date().getFullYear()} {branding.brandName}. {branding.brandSubtitle}.
        </div>

      </div>
    </footer>
  );
};
