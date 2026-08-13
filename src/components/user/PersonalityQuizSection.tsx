import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, UserCheck, ArrowRight, Brain, Heart, Compass, ShieldCheck } from 'lucide-react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';

interface QuestionOption {
  text: string;
  category: 'A' | 'B' | 'C' | 'D';
}

interface Question {
  id: number;
  title: string;
  options: QuestionOption[];
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    title: 'Gimana cara utamamu ngadepin tumpukan tugas atau hari yang berat?',
    options: [
      { text: 'Tetap jalan terus walau pusing, rasa capek dipendam dulu.', category: 'A' },
      { text: 'Cari pelarian cepat (scroll sosmed, jajan boba, nonton film).', category: 'B' },
      { text: 'Overthinking duluan, mikirin kemungkinan terburuk.', category: 'C' },
      { text: 'Langsung curhat sama teman terdekat atau nulis catetan emosi.', category: 'D' },
    ],
  },
  {
    id: 2,
    title: 'Kalau ada konflik atau masalah mendadak, reaksi pertamamu biasanya apa?',
    options: [
      { text: '"Gak apa-apa, aku bisa beresin sendiri kok!" (Tahan banting sendiri).', category: 'A' },
      { text: 'Merasa cemas berlebihan sampai kepikiran seharian.', category: 'C' },
      { text: 'Menepi sejenak dari keramaian buat merapikan emosi.', category: 'B' },
      { text: 'Mencari orang terpercaya buat cerita dan minta saran.', category: 'D' },
    ],
  },
  {
    id: 3,
    title: 'Gimana kondisi pikiranmu pas udah rebahan dan mau tidur?',
    options: [
      { text: 'Replay percakapan lampau atau cemas sama hari esok.', category: 'C' },
      { text: 'Pikiran rame banget, masih main HP sampai mata capek.', category: 'B' },
      { text: 'Merasa kesepian atau kepikiran beban yang belum kelar.', category: 'A' },
      { text: 'Bisa tenang kalau udah meluapkan curhatan hari ini.', category: 'D' },
    ],
  },
  {
    id: 4,
    title: 'Apa me-time impianmu saat energi mentalmu lagi benar-benar drop?',
    options: [
      { text: 'Menyendiri di tempat tenang tanpa diganggu siapa pun.', category: 'B' },
      { text: 'Deep talk santai sama orang yang bikin merasa aman.', category: 'D' },
      { text: 'Tidur pulas seharian penuh tanpa mikirin beban kerjaan.', category: 'A' },
      { text: 'Melakukan hal kreatif atau jalan-jalan ke tempat baru.', category: 'C' },
    ],
  },
  {
    id: 5,
    title: 'Seberapa sering kamu merasa harus "kelihatan kuat" di depan orang lain?',
    options: [
      { text: 'Hampir selalu, gak mau kelihatan lemah atau merepotkan orang.', category: 'A' },
      { text: 'Sering, cuma orang tertentu yang boleh lihat sisi rapuhku.', category: 'B' },
      { text: 'Kadang-kadang, kalau emosiku udah benar-benar meluap.', category: 'C' },
      { text: 'Jarang, aku cukup terbuka kalau lagi butuh bantuan.', category: 'D' },
    ],
  },
  {
    id: 6,
    title: 'Apa kalimat penyemangat yang paling kamu butuhkan saat ini?',
    options: [
      { text: '"Kamu udah berjuang hebat banget, gak apa-apa kalau mau istirahat."', category: 'A' },
      { text: '"Semua perasaanmu valid, kamu gak sendirian melewati ini."', category: 'D' },
      { text: '"Tenang saja, setiap rasa cemas ini pasti ada jalan keluarnya."', category: 'C' },
      { text: '"Langkah pelanmu tetaplah sebuah kemajuan yang berarti."', category: 'B' },
    ],
  },
];

interface PersonalityResult {
  title: string;
  tagline: string;
  badge: string;
  traits: string[];
  description: string;
  recommendation: string;
}

const RESULTS_MAP: Record<string, PersonalityResult> = {
  A: {
    title: 'Si Pejuang Mandiri Berhati Baja',
    tagline: 'Kamu terbiasa menanggung segala beban sendiri tanpa ingin merepotkan orang lain.',
    badge: 'Tipe Mandiri & Tangguh',
    traits: ['Bertanggung Jawab Tinggi', 'Sering Memendam Emosi', 'Sengaja Kelihatan Kuat'],
    description: 'Kamu adalah sosok yang sangat diandalkan oleh orang-orang di sekitarmu. Namun, sering kali kamu lupa bahwa kamu juga manusia yang butuh rehat dan ruang untuk bersandar. Memendam emosi sendirian dalam waktu lama bisa memicu kelelahan mental (burnout).',
    recommendation: 'Gak ada salahnya membagi beban emosionalmu. Psikolog profesional dapat membantu memberikan ruang aman tanpa penilaian agar kamu bisa merilis rasa lelah terpendam dan belajar merawat dirimu sendiri.',
  },
  B: {
    title: 'Si Penjelajah Jiwa yang Butuh Ketenangan',
    tagline: 'Kamu peka dan sering mencari cara untuk meredakan kepenatan hidup.',
    badge: 'Tipe Adaptif & Reflektif',
    traits: ['Sensitif terhadap Suasana', 'Butuh Jeda Berkala', 'Kreatif Mencari Hiburan'],
    description: 'Kamu pandai mencari hiburan saat stres, tapi terkadang distraksi singkat belum cukup menyelesaikan akar emosi yang mengganjal. Kamu butuh metode pemulihan yang lebih mendalam agar ketenangan batinmu bertahan lebih lama.',
    recommendation: 'Diskusi bersama psikolog dapat membantumu menemukan strategi pemulihan emosi (coping mechanism) yang sesuai dengan ritme hidup dan kepribadianmu.',
  },
  C: {
    title: 'Si Pemikir Dalam (The Overthinker)',
    tagline: 'Otakmu selalu bekerja aktif menganalisis setiap detail dan kemungkinan.',
    badge: 'Tipe Analitis & Perhatian',
    traits: ['Pikirannya Aktif 24/7', 'Perfeksionis', 'Sering Cemas Masa Depan'],
    description: 'Kemampuan analisismu luar biasa, tapi overthinking yang terlalu sering bisa bikin energi mentalmu terkuras cepat, bahkan bikin susah tidur. Pikiran berulang (rumination) sering kali berasal dari rasa cemas yang belum terurai.',
    recommendation: 'Psikolog dapat memandumu memetakan pola pikir overthinking, mengajarkan teknik grounding, serta membantu membedakan hal yang bisa kamu kontrol dan yang perlu dilepaskan.',
  },
  D: {
    title: 'Si Pendengar Empatis Berhati Lembut',
    tagline: 'Kamu punya empati tinggi dan sangat menghargai hubungan yang hangat.',
    badge: 'Tipe Empatis & Terbuka',
    traits: ['Empati Tinggi', 'Pendengar yang Baik', 'Peka Perasaan Orang Lain'],
    description: 'Kamu sangat menghargai teman cerita dan selalu ada untuk orang lain. Namun karena empati tinggi, kamu rentan menyerap emosi negatif orang sekitar sampai merasa kelelahan emosional.',
    recommendation: 'Melakukan konseling dengan psikolog dapat membantumu menetapkan batasan emosional (emotional boundaries) yang sehat tanpa mengurangi rasa kepedulianmu pada sesama.',
  },
};

interface PersonalityQuizSectionProps {
  onOpenPsikolog: () => void;
}

// Helper to shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomizedQuestions(): Question[] {
  return shuffleArray(
    QUIZ_QUESTIONS.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }))
  );
}

export const PersonalityQuizSection: React.FC<PersonalityQuizSectionProps> = ({ onOpenPsikolog }) => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const quizConfig = cms.personalityQuiz;

  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>(() => getRandomizedQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [result, setResult] = useState<PersonalityResult | null>(null);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const handleSelectOption = (category: 'A' | 'B' | 'C' | 'D') => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: category };
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate Result
      calculateResult(updatedAnswers);
    }
  };

  const calculateResult = (finalAnswers: Record<number, 'A' | 'B' | 'C' | 'D'>) => {
    const counts: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(finalAnswers).forEach((cat) => {
      counts[cat] = (counts[cat] || 0) + 1;
    });

    let topCategory: 'A' | 'B' | 'C' | 'D' = 'A';
    let maxCount = -1;

    (Object.keys(counts) as Array<'A' | 'B' | 'C' | 'D'>).forEach((cat) => {
      if (counts[cat] > maxCount) {
        maxCount = counts[cat];
        topCategory = cat;
      }
    });

    setResult(RESULTS_MAP[topCategory] || RESULTS_MAP.A);
  };

  const handleReset = () => {
    setShuffledQuestions(getRandomizedQuestions());
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-4 sm:my-5 px-2 sm:px-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-4 sm:gap-5">
        
        {/* LEFT DECORATIVE CARDS (Fills left white space on desktop) */}
        <div className="hidden lg:flex flex-col gap-3.5 w-60 xl:w-64 text-left shrink-0 my-auto">
          <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-purple-100/90 shadow-sm hover:shadow-md transition-all group">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C47FF] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-xs text-slate-900 mb-1">100% Anonim & Rahasia</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jawab dengan santai tanpa rasa khawatir, hasil kuis pribadi untukmu.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-purple-100/90 shadow-sm hover:shadow-md transition-all group">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-xs text-slate-900 mb-1">6 Pertanyaan Reflektif</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Ringkas & menyenangkan untuk mengenali caramu merespons tekanan.
            </p>
          </div>
        </div>

        {/* MAIN PURPLE QUIZ CARD */}
        <div className="flex-1 w-full max-w-2xl mx-auto bg-[#7C5CFC] bg-gradient-to-br from-[#8566FF] via-[#7C5CFC] to-[#6C47FF] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-purple-300/40 overflow-hidden relative">
          
          {/* Decorative background glow elements */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />

          {/* DECORATIVE LEFT HAND WITH HEART */}
          <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center pointer-events-none z-0 opacity-80 transition-transform duration-500">
            <div className="relative w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 flex items-center justify-center">
              <svg viewBox="0 0 100 130" fill="none" className="w-full h-full text-white drop-shadow-md">
                <path d="M50 25 C50 18, 57 12, 64 17 C71 12, 78 18, 78 25 C78 35, 64 45, 64 45 C64 45, 50 35, 50 25 Z" fill="#FFB4D6" opacity="0.95" />
                <circle cx="36" cy="22" r="2.5" fill="#FFFFFF" opacity="0.8" />
                <circle cx="75" cy="18" r="1.5" fill="#FFFFFF" opacity="0.8" />
                <path d="M10 115 C25 110, 40 100, 52 88 C60 80, 68 65, 62 58 C56 52, 48 60, 40 70 C32 80, 20 92, 10 98 Z" fill="rgba(255, 255, 255, 0.3)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" />
                <path d="M22 125 C38 118, 55 105, 68 90 C76 80, 80 66, 74 60 C68 54, 60 64, 50 78 C38 94, 25 108, 15 115 Z" fill="rgba(255, 255, 255, 0.22)" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" />
                <path d="M5 125 Q25 120 40 128" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* DECORATIVE RIGHT HAND WITH HEART */}
          <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center pointer-events-none z-0 opacity-80 transition-transform duration-500">
            <div className="relative w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 flex items-center justify-center">
              <svg viewBox="0 0 100 130" fill="none" className="w-full h-full text-white drop-shadow-md">
                <path d="M50 25 C50 18, 43 12, 36 17 C29 12, 22 18, 22 25 C22 35, 36 45, 36 45 C36 45, 50 35, 50 25 Z" fill="#DDD6FE" opacity="0.95" />
                <circle cx="64" cy="22" r="2.5" fill="#FFFFFF" opacity="0.8" />
                <circle cx="25" cy="18" r="1.5" fill="#FFFFFF" opacity="0.8" />
                <path d="M90 115 C75 110, 60 100, 48 88 C40 80, 32 65, 38 58 C44 52, 52 60, 60 70 C68 80, 80 92, 90 98 Z" fill="rgba(255, 255, 255, 0.3)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" />
                <path d="M78 125 C62 118, 45 105, 32 90 C24 80, 20 66, 26 60 C32 54, 40 64, 50 78 C62 94, 75 108, 85 115 Z" fill="rgba(255, 255, 255, 0.22)" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" />
                <path d="M95 125 Q75 120 60 128" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* SECTION HEADER */}
          <div className="relative z-10 text-center max-w-xl mx-auto mb-4 sm:mb-5">
            <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white">
              Kuis Tipe Kepribadian & Cara Koping Emosimu
            </h3>
            <p className="text-[11px] sm:text-xs text-purple-100/90 mt-1 leading-relaxed font-normal">
              Temukan tipe caramu menghadapi stres dalam 6 pertanyaan santai berikut!
            </p>
          </div>

          {/* QUIZ CONTENT AREA */}
          {!result ? (
            <div className="relative z-10 max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-white/20 shadow-md">
              
              {/* Progress Bar & Counter */}
              <div className="flex items-center justify-between mb-2.5 text-[11px] sm:text-xs font-semibold text-purple-100">
                <span>Soal {currentQuestionIndex + 1} dari {shuffledQuestions.length}</span>
                <span className="text-white font-bold">{Math.round(((currentQuestionIndex + 1) / shuffledQuestions.length) * 100)}% Selesai</span>
              </div>

              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-white h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Title */}
              <h4 className="text-sm sm:text-base font-bold text-white mb-3.5 leading-snug">
                {currentQuestion.title}
              </h4>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt.category)}
                    className="w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white text-xs font-medium transition-all duration-200 flex items-center justify-between group cursor-pointer active:scale-[0.99] shadow-2xs"
                  >
                    <span className="pr-2.5 leading-relaxed">{opt.text}</span>
                    <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-[#6344FF] flex items-center justify-center shrink-0 transition-colors">
                      <ArrowRight className="w-3 h-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Back Question Button if needed */}
              {currentQuestionIndex > 0 && (
                <div className="mt-3 text-right">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="text-[11px] text-purple-200 hover:text-white font-semibold transition-colors underline cursor-pointer"
                  >
                    ← Kembali ke pertanyaan sebelumnya
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* RESULT VIEW */
            <div className="relative z-10 max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 shadow-lg space-y-4">
              
              {/* Result Badge & Header */}
              <div className="text-center space-y-1">
                <span className="px-3 py-0.5 rounded-full bg-white/20 border border-white/30 text-white text-[11px] font-bold inline-block">
                  ✨ Hasil Kepribadianmu
                </span>
                <h4 className="text-xl sm:text-2xl font-extrabold text-white">
                  {result.title}
                </h4>
                <p className="text-xs text-purple-100 font-semibold italic">
                  "{result.tagline}"
                </p>
              </div>

              {/* Trait Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {result.traits.map((trait, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-white/15 border border-white/25 text-white text-[11px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    <span>{trait}</span>
                  </span>
                ))}
              </div>

              {/* Result Description */}
              <div className="bg-black/20 rounded-xl p-3 sm:p-3.5 border border-white/15 text-xs text-purple-50 leading-relaxed">
                <p className="mb-1.5 font-bold text-white flex items-center gap-1.5 text-xs">
                  <Brain className="w-3.5 h-3.5 text-purple-200" />
                  <span>Gambaran Kepribadian:</span>
                </p>
                {result.description}
              </div>

              {/* MANDATORY PROFESSIONAL PSYCHOLOGIST RECOMMENDATION */}
              <div className="bg-teal-900/60 rounded-xl p-3 sm:p-3.5 border border-teal-400/40 text-xs text-teal-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-teal-200 font-bold text-xs">
                  <Heart className="w-3.5 h-3.5 text-teal-300 fill-teal-300" />
                  <span>Saran Bijak Sapahati:</span>
                </div>
                <p className="leading-relaxed text-teal-100/90 text-xs">
                  {result.recommendation}
                </p>
              </div>

              {/* CTA BUTTONS */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={onOpenPsikolog}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Konsultasi Lebih Dalam dengan Psikolog</span>
                </button>

                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Coba Kuis Lagi</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT DECORATIVE CARDS (Fills right white space on desktop) */}
        <div className="hidden lg:flex flex-col gap-3.5 w-60 xl:w-64 text-left shrink-0 my-auto">
          <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-purple-100/90 shadow-sm hover:shadow-md transition-all group">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-xs text-slate-900 mb-1">Pendampingan Psikolog</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Dapatkan arahan bijak dan akses konsultasi langsung sesuai kebutuhanmu.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-purple-100/90 shadow-sm hover:shadow-md transition-all group">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C5CFC] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Brain className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-xs text-slate-900 mb-1">Gaya Koping Emosi</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Pahami strategi pemulihan mental yang paling cocok dengan dirimu.
            </p>
          </div>
        </div>

      </div>

      {/* MOBILE FEATURE BADGES IN WHITE SPACE BELOW CARD */}
      <div className="grid grid-cols-4 gap-1.5 mt-2.5 lg:hidden">
        <div className="p-1.5 sm:p-2 rounded-xl bg-white/80 border border-purple-100 text-center flex flex-col items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6C47FF] shrink-0" />
          <span className="text-[10px] font-semibold text-slate-700 leading-tight">100% Anonim</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-xl bg-white/80 border border-purple-100 text-center flex flex-col items-center justify-center gap-1">
          <Compass className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-[10px] font-semibold text-slate-700 leading-tight">6 Soal Singkat</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-xl bg-white/80 border border-purple-100 text-center flex flex-col items-center justify-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[10px] font-semibold text-slate-700 leading-tight">Saran Psikolog</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-xl bg-white/80 border border-purple-100 text-center flex flex-col items-center justify-center gap-1">
          <Brain className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0" />
          <span className="text-[10px] font-semibold text-slate-700 leading-tight">Gaya Koping</span>
        </div>
      </div>
    </div>
  );
};
