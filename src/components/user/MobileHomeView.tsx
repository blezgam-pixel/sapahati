import React, { useState, useEffect, useRef } from 'react';
import { MobileHeader } from './MobileHeader';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';
import { TransparentImage } from '../common/TransparentImage';
import { 
  ArrowRight, 
  Quote,
  Sparkles,
  Heart,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MobileHomeViewProps {
  onStartCurhat: () => void;
  onOpenPsikolog: () => void;
  onOpenMoodTracker: () => void;
  onOpenPsikotes: () => void;
  onOpenQuiz?: () => void;
  onOpenNav: () => void;
  onOpenDashboard: () => void;
}

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  onStartCurhat,
  onOpenPsikolog,
  onOpenMoodTracker,
  onOpenPsikotes,
  onOpenQuiz,
  onOpenNav,
  onOpenDashboard,
}) => {
  const [cms, setCms] = useState(() => getCmsConfig());
  const [activeTestiIndex, setActiveTestiIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const testimonials = cms.testimonials?.items && cms.testimonials.items.length > 0
    ? cms.testimonials.items
    : [
        {
          id: 't1',
          name: 'Anisa R.',
          role: 'Mahasiswi (22 th)',
          service: 'Sesi Curhat & Chat',
          comment: 'Awalnya cemas banget pas lagi burnout tugas akhir. Sesi Curhat langsung responsif 24 jam tanpa menghakimi, lalu lanjut sesi chat dengan Psikolog. Lega banget bisa rilis beban emosi!',
          rating: 5,
          date: '3 hari yang lalu',
          avatarBg: 'bg-purple-600 text-white',
        },
        {
          id: 't2',
          name: 'Budi Santoso',
          role: 'Karyawan Swasta (29 th)',
          service: 'Video Call Psikolog',
          comment: 'Psikolognya sangat komunikatif dan empatik. Dalam 60 menit sesi video call, saya dapet sudut pandang baru untuk atasi masalah kecemasan kerja. Proses pendaftarannya juga praktis!',
          rating: 5,
          date: '1 minggu yang lalu',
          avatarBg: 'bg-teal-600 text-white',
        },
        {
          id: 't3',
          name: 'Clarissa M.',
          role: 'Freelancer (25 th)',
          service: 'Konsultasi Tatap Muka',
          comment: 'Privasi benar-benar terjamin. Tempat tatap mukanya nyaman dan psikolog mendengar cerita saya dengan sabar tanpa memberi penilaian negatif. Recomended bgt!',
          rating: 5,
          date: '2 minggu yang lalu',
          avatarBg: 'bg-indigo-600 text-white',
        },
      ];

  // Auto-scroll / move testimonials every 4.5 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setActiveTestiIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % testimonials.length;
        if (scrollContainerRef.current) {
          const cardWidth = scrollContainerRef.current.clientWidth;
          scrollContainerRef.current.scrollTo({
            left: nextIndex * cardWidth,
            behavior: 'smooth',
          });
        }
        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = scrollContainerRef.current.clientWidth;
      if (cardWidth > 0) {
        const newIndex = Math.round(scrollLeft / cardWidth);
        if (newIndex !== activeTestiIndex && newIndex >= 0 && newIndex < testimonials.length) {
          setActiveTestiIndex(newIndex);
        }
      }
    }
  };

  const scrollToTesti = (index: number) => {
    setActiveTestiIndex(index);
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  // Dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Hai, Selamat Pagi! 👋';
    if (hour < 15) return 'Hai, Selamat Siang! 👋';
    if (hour < 18) return 'Hai, Selamat Sore! 👋';
    return 'Hai, Selamat Malam! 👋';
  };

  return (
    <div className="block md:hidden w-full bg-[#FAF8FF] min-h-screen pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. Header Navbar (Logo + Sapa Hati) */}
      <MobileHeader />

      <div className="px-4 pt-16 space-y-4">

        {/* 2. Hero Card (Greeting & Girl Hugging Purple Heart) */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FAF5FF] via-[#F3EAFF] to-[#ECE2FF] p-4 border border-purple-100/80 shadow-2xs relative overflow-hidden">
          
          {/* Floating Hearts Background graphics */}
          <div className="absolute top-2 right-12 w-4 h-4 text-pink-400 opacity-60 animate-pulse">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div className="absolute bottom-4 right-2 w-6 h-6 text-purple-400 opacity-40">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>

          <div className="flex items-center justify-between gap-2">
            
            {/* Left Content */}
            <div className="space-y-2 flex-1 max-w-[55%] z-10">
              <h1 className="text-lg sm:text-xl font-black text-[#1D123B] leading-tight">
                {getGreeting()}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug font-medium">
                Apa yang kamu rasakan hari ini?<br />
                Yuk, curhat dan jaga kesehatan mentalmu.
              </p>
            </div>

            {/* Right Illustration: Hero Banner Image synced with Spreadsheet / CMS */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 shrink-0 z-10 flex items-center justify-center -my-3 -mr-2">
              <TransparentImage 
                src={cms.hero.heroImage} 
                alt="Hero Illustration" 
                className="w-full h-full object-contain"
              />
            </div>

          </div>
        </div>

        {/* 3. 4-Grid Feature Icons (Mulai Curhat, Konsultasi Psikolog, Psikotes Digital, Jurnal Harian) */}
        <div className="grid grid-cols-4 gap-2.5">
          
          {/* 1. Mulai Curhat */}
          <button 
            onClick={onStartCurhat}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white border border-purple-100/80 shadow-2xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#F2EDFF] text-[#6C47FF] flex items-center justify-center p-2.5 shadow-2xs group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
                <defs>
                  <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6C47FF" />
                  </linearGradient>
                </defs>
                <path d="M 20 25 C 20 15, 80 15, 80 25 L 80 65 C 80 75, 50 75, 40 85 L 42 75 C 20 75, 20 65, 20 65 Z" fill="url(#bubbleGrad)" />
                <circle cx="38" cy="45" r="5" fill="#FFFFFF" />
                <circle cx="50" cy="45" r="5" fill="#FFFFFF" />
                <circle cx="62" cy="45" r="5" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Mulai<br />Curhat
            </span>
          </button>

          {/* 2. Konsultasi Psikolog */}
          <button 
            onClick={onOpenPsikolog}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white border border-purple-100/80 shadow-2xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#FFEBF0] text-[#EC4899] flex items-center justify-center p-2.5 shadow-2xs group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
                <defs>
                  <linearGradient id="doctorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B8B" />
                    <stop offset="100%" stopColor="#E11D48" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="35" r="20" fill="url(#doctorGrad)" />
                <path d="M 20 85 C 20 60, 35 55, 50 55 C 65 55, 80 60, 80 85 Z" fill="url(#doctorGrad)" />
                <circle cx="50" cy="35" r="8" fill="#FFFFFF" opacity="0.3" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Konsultasi<br />Psikolog
            </span>
          </button>

          {/* 3. Psikotes Digital */}
          <button 
            onClick={onOpenPsikotes}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white border border-purple-100/80 shadow-2xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#FFF3E8] text-[#F59E0B] flex items-center justify-center p-2.5 shadow-2xs group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
                <defs>
                  <linearGradient id="clipboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                <rect x="25" y="25" width="50" height="65" rx="10" fill="url(#clipboardGrad)" />
                <rect x="40" y="15" width="20" height="15" rx="4" fill="#78350F" />
                <line x1="38" y1="42" x2="62" y2="42" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                <line x1="38" y1="56" x2="62" y2="56" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                <line x1="38" y1="70" x2="52" y2="70" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Psikotes<br />Digital
            </span>
          </button>

          {/* 4. Jurnal Harian */}
          <button 
            onClick={onOpenMoodTracker}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white border border-purple-100/80 shadow-2xs active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#ECEBFF] text-[#6366F1] flex items-center justify-center p-2.5 shadow-2xs group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
                <defs>
                  <linearGradient id="journalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
                <rect x="25" y="20" width="50" height="65" rx="8" fill="url(#journalGrad)" />
                <rect x="20" y="20" width="10" height="65" rx="3" fill="#312E81" />
                <line x1="42" y1="38" x2="62" y2="38" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                <line x1="42" y1="52" x2="62" y2="52" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">
              Jurnal<br />Harian
            </span>
          </button>

        </div>

        {/* 4. Featured Purple Card Banner (Kuis Tes Kepribadian) */}
        <div 
          onClick={onOpenQuiz || onOpenPsikotes}
          className="rounded-3xl bg-gradient-to-r from-[#4E32D0] via-[#5D3BE2] to-[#6C47FF] p-4 text-white relative overflow-hidden shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-transform cursor-pointer"
        >
          {/* Sparkle background elements */}
          <div className="absolute top-3 left-32 text-purple-200 opacity-60">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="absolute bottom-6 left-12 text-purple-200 opacity-40">
            <Sparkles className="w-3 h-3" />
          </div>

          <div className="flex items-center justify-between gap-3 relative z-10">
            
            {/* Left Content */}
            <div className="space-y-2 max-w-[62%]">
              <h2 className="text-lg font-black leading-tight tracking-tight">
                Kuis Tes<br />Kepribadian
              </h2>
              <p className="text-[11px] text-purple-100 leading-snug">
                Kenali dirimu lebih dalam dan temukan potensi terbaikmu.
              </p>

              <div className="pt-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenQuiz) onOpenQuiz();
                    else onOpenPsikotes();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white text-[#5034D4] text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
                >
                  <span>Mulai Kuis</span>
                  <div className="w-4 h-4 rounded-full bg-[#5034D4] text-white flex items-center justify-center">
                    <ArrowRight className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </button>
              </div>
            </div>

            {/* Right Illustration: 3D Clipboard Checklist Profile & Pink Brain */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg">
                <defs>
                  <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                  </linearGradient>
                  <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF85A1" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>

                {/* Clipboard */}
                <rect x="25" y="20" width="85" height="115" rx="12" fill="url(#boardGrad)" stroke="#CBD5E1" strokeWidth="3" />
                <rect x="52" y="12" width="30" height="16" rx="4" fill="#94A3B8" />

                {/* Profile Circle Icon on Board */}
                <circle cx="68" cy="45" r="16" fill="#8B5CF6" />
                <path d="M 58 43 C 58 37, 78 37, 78 43 Z" fill="#FFFFFF" />
                <path d="M 54 58 C 54 50, 82 50, 82 58 Z" fill="#FFFFFF" />

                {/* Checklines */}
                <line x1="42" y1="72" x2="92" y2="72" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
                <line x1="42" y1="88" x2="92" y2="88" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
                <line x1="42" y1="104" x2="82" y2="104" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />

                {/* Checkmarks */}
                <path d="M 32 72 L 36 76 L 42 68" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 32 88 L 36 92 L 42 84" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* 3D Pink Brain Graphic on right */}
                <g transform="translate(85, 70)">
                  <circle cx="35" cy="35" r="28" fill="url(#brainGrad)" />
                  <path d="M 20 28 Q 30 18 45 28 Q 50 38 35 48" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round" />
                  <path d="M 25 40 Q 35 32 45 42" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round" />
                </g>
              </svg>
            </div>

          </div>
        </div>

        {/* 5. "Kata Mereka" / Testimonials Section (Ulasan Pengguna seperti di mode web) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#1D123B] flex items-center gap-1.5">
              <span>Kata Mereka</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#6C47FF] border border-purple-200">
                Ulasan Pengguna
              </span>
            </h2>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-black bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9</span>
              <span className="text-[9px] text-slate-500 font-normal ml-0.5">(1.2k+)</span>
            </div>
          </div>

          {/* Auto-sliding & Swipeable Testimonial Cards */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory rounded-2xl -mx-1 px-1 scroll-smooth"
          >
            {testimonials.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="w-full shrink-0 snap-center p-0.5"
              >
                <div className="w-full rounded-2xl p-4 bg-white border border-purple-100/90 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[155px]">
                  
                  {/* Subtle Background Quote Icon */}
                  <Quote className="absolute top-3 right-3 w-10 h-10 text-purple-100/60 pointer-events-none" />

                  {/* Header: Star Rating & Service Tag */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6C47FF] border border-purple-200/80">
                      {item.service}
                    </span>
                  </div>

                  {/* Review Text */}
                  <div className="my-2.5 relative z-10">
                    <p className="text-xs font-normal leading-relaxed text-slate-700 italic">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  </div>

                  {/* Footer Author & Verification */}
                  <div className="flex items-center justify-between pt-2 relative z-10 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${item.avatarBg || 'bg-[#6C47FF] text-white'} font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                        {item.name.charAt(0)}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-slate-800 leading-tight flex items-center gap-1">
                          {item.name}
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-medium">
                          {item.role || 'Pengguna Terverifikasi'}
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-[9px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                      {item.date || 'Terverifikasi'}
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {testimonials.map((_, dotIndex) => (
              <button 
                key={dotIndex}
                onClick={() => scrollToTesti(dotIndex)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeTestiIndex === dotIndex ? 'w-6 bg-[#6C47FF]' : 'w-2 bg-purple-200 hover:bg-purple-300'
                }`}
                title={`Ulasan ${dotIndex + 1}`}
              />
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
