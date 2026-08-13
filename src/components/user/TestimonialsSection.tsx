import React, { useState, useEffect, useRef } from 'react';
import { Star, Quote, CheckCircle2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';

export const TestimonialsSection: React.FC = () => {
  const [cms, setCms] = useState(() => getCmsConfig());
  const [filter, setFilter] = useState<string>('ALL');
  const [activeMobileIndex, setActiveMobileIndex] = useState<number>(0);
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const testimonialsConfig = cms.testimonials;
  const testimonials = testimonialsConfig.items && testimonialsConfig.items.length > 0
    ? testimonialsConfig.items
    : [
        {
          id: 't1',
          name: 'Anisa R.',
          role: 'Mahasiswi (22 th)',
          avatarBg: 'bg-purple-600 text-white',
          rating: 5,
          service: 'Sesi Curhat & Chat',
          comment: 'Awalnya cemas banget pas lagi burnout tugas akhir. Sesi Curhat langsung responsif 24 jam tanpa menghakimi, lalu lanjut sesi chat dengan Psikolog. Lega banget bisa rilis beban emosi!',
          date: '3 hari yang lalu',
        },
      ];

  const filteredTestimonials = filter === 'ALL' 
    ? testimonials 
    : testimonials.filter((t) => (t.service || '').toLowerCase().includes(filter.toLowerCase()));

  // Reset active index when filter changes
  useEffect(() => {
    setActiveMobileIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [filter]);

  // Auto-scroll loop for mobile view
  useEffect(() => {
    if (filteredTestimonials.length <= 1) return;

    const interval = setInterval(() => {
      if (isUserInteracting) return;

      setActiveMobileIndex((prev) => {
        const next = (prev + 1) % filteredTestimonials.length;
        if (scrollRef.current) {
          const cardWidth = scrollRef.current.firstElementChild
            ? (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 12 // gap-3 = 12px
            : 280;
          scrollRef.current.scrollTo({
            left: next * cardWidth,
            behavior: 'smooth',
          });
        }
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [filteredTestimonials.length, isUserInteracting]);

  // Handle user scroll detection on mobile to sync dots index
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + 12
      : 280;
    const newIndex = Math.round(container.scrollLeft / cardWidth);
    if (newIndex >= 0 && newIndex < filteredTestimonials.length) {
      setActiveMobileIndex(newIndex);
    }
  };

  // Pause auto-scroll when user touches/swipes and resume after 4s
  const handleInteractionStart = () => {
    setIsUserInteracting(true);
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
  };

  const handleInteractionEnd = () => {
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 4000);
  };

  const scrollToIndex = (index: number) => {
    setActiveMobileIndex(index);
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild
        ? (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 12
        : 280;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  const handlePrev = () => {
    handleInteractionStart();
    const prev = (activeMobileIndex - 1 + filteredTestimonials.length) % filteredTestimonials.length;
    scrollToIndex(prev);
    handleInteractionEnd();
  };

  const handleNext = () => {
    handleInteractionStart();
    const next = (activeMobileIndex + 1) % filteredTestimonials.length;
    scrollToIndex(next);
    handleInteractionEnd();
  };

  return (
    <div className="w-full bg-gradient-to-b from-purple-50/60 via-white to-purple-50/40 border border-purple-100/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xs text-left space-y-4 sm:space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 sm:gap-4 border-b border-purple-100/80 pb-4 sm:pb-5">
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-purple-100 text-[#6C47FF] text-[11px] sm:text-xs font-extrabold border border-purple-200">
            <span>Kata Mereka</span>
          </div>
          <h3 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#1D123B] tracking-tight">
            {testimonialsConfig.sectionTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {testimonialsConfig.sectionSubtitle}
          </p>
        </div>

        {/* Aggregate Satisfaction Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-purple-100 shadow-2xs shrink-0 w-full md:w-auto justify-between md:justify-start">
          <div className="text-center px-1 sm:px-2">
            <div className="flex items-center gap-1 text-amber-500 font-extrabold text-base sm:text-xl">
              <span>4.9</span>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Dari 1.200+ Ulasan</span>
          </div>
          <div className="h-7 sm:h-8 w-px bg-slate-200" />
          <div className="text-xs font-bold text-slate-700">
            <span className="text-emerald-600 font-extrabold block text-xs sm:text-xs">98% Merasa Lega</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal">Setelah konsultasi pertama</span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'ALL'
              ? 'bg-[#6C47FF] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          Semua Ulasan
        </button>
        <button
          onClick={() => setFilter('Chat')}
          className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'Chat'
              ? 'bg-[#6C47FF] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          Sesi Chat &amp; AI
        </button>
        <button
          onClick={() => setFilter('Video')}
          className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'Video'
              ? 'bg-[#6C47FF] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          Video Call
        </button>
        <button
          onClick={() => setFilter('Tatap Muka')}
          className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'Tatap Muka'
              ? 'bg-[#6C47FF] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          Tatap Muka
        </button>
      </div>

      {/* Testimonials Cards Container - Auto & Manual Slider across all screen modes */}
      <div className="relative group/slider">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
          onMouseEnter={handleInteractionStart}
          onMouseLeave={handleInteractionEnd}
          className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1 px-0.5 scroll-smooth"
        >
          {filteredTestimonials.map((item) => (
            <div
              key={item.id}
              className="w-[85vw] sm:w-[380px] lg:w-[420px] shrink-0 snap-start bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-purple-100/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 sm:gap-4 relative group"
            >
              {/* Top Quote Icon Background */}
              <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 text-purple-100 group-hover:text-purple-200/80 transition-colors pointer-events-none" />

              <div className="space-y-2 sm:space-y-3 relative z-10">
                {/* Rating & Service Badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full border border-purple-200 bg-purple-100 text-purple-800">
                    {item.service}
                  </span>
                </div>

                {/* Comment text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-snug sm:leading-relaxed font-normal italic">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${item.avatarBg || 'bg-purple-600 text-white'} font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1">
                      <span>{item.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 fill-teal-100" />
                    </h4>
                    <span className="text-[10px] sm:text-[11px] text-slate-500">{item.role}</span>
                  </div>
                </div>

                <span className="text-[9px] sm:text-[10px] text-slate-400">{item.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls & Indicators (Active for all screen modes) */}
        {filteredTestimonials.length > 1 && (
          <div className="flex items-center justify-between pt-3">
            {/* Dots */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[70%] scrollbar-none py-1">
              {filteredTestimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleInteractionStart();
                    scrollToIndex(idx);
                    handleInteractionEnd();
                  }}
                  aria-label={`Lihat ulasan ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeMobileIndex === idx
                      ? 'w-6 bg-[#6C47FF]'
                      : 'w-2 bg-purple-200 hover:bg-purple-300'
                  }`}
                />
              ))}
            </div>

            {/* Prev & Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Ulasan Sebelumnya"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-purple-200 text-purple-700 flex items-center justify-center shadow-2xs hover:bg-purple-50 hover:border-purple-300 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Ulasan Selanjutnya"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-purple-200 text-purple-700 flex items-center justify-center shadow-2xs hover:bg-purple-50 hover:border-purple-300 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

