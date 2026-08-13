import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Globe2, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Award, 
  ChevronRight, 
  Send,
  Brain,
  ArrowRight,
  ArrowDown
} from 'lucide-react';
import { Header } from '../../components/user/Header';
import { MobileHeader } from '../../components/user/MobileHeader';
import { Footer } from '../../components/user/Footer';
import { NavigationDrawer } from '../../components/user/NavigationDrawer';
import { MobileBottomNav } from '../../components/user/MobileBottomNav';
import { PsikotesDetailModal, PsikotesCategory } from './PsikotesDetailModal';

interface PsikotesPageProps {
  onBackToHome: () => void;
  onOpenDashboard?: () => void;
  onOpenJournal?: () => void;
  onOpenMitra?: () => void;
  onStartCurhat?: () => void;
  onOpenPsikolog?: () => void;
}

export const PsikotesPage: React.FC<PsikotesPageProps> = ({
  onBackToHome,
  onOpenDashboard,
  onOpenJournal,
  onOpenMitra,
  onStartCurhat,
  onOpenPsikolog,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PsikotesCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openCategoryModal = (category: PsikotesCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#1D123B] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-purple-200 overflow-x-hidden w-full">
      
      {/* Mobile Top Header */}
      <div className="block md:hidden">
        <MobileHeader onGoHome={onBackToHome} onOpenNav={() => setIsNavOpen(true)} />
      </div>

      {/* Header Bar */}
      <div className="hidden md:block">
        <Header
          onOpenNav={() => setIsNavOpen(true)}
          onStartCurhat={onStartCurhat}
          onOpenPsikolog={onOpenPsikolog}
          onOpenDashboard={onOpenDashboard}
          onOpenMoodTracker={onOpenJournal}
          onOpenPsikotes={() => {}}
          onGoHome={onBackToHome}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-20 sm:pt-24 pb-12">
        
        {/* HERO BANNER SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#1D123B] via-[#2D1B5E] to-[#4A2E9E] text-white p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xl border border-purple-900/40">
            {/* Background Glow Effect */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-300 text-xs font-extrabold">
                <Brain className="w-4 h-4 text-amber-300" />
                <span>Layanan Asesmen & Evaluasi Psikologi Terintegrasi</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Layanan <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-teal-300">Psikotes Online</span> Sapahati
              </h1>

              <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed">
                Platform tes psikologi profesional untuk evaluasi potensi diri, seleksi kerja perusahaan, pemetaan bakat minat sekolah, hingga tes kelayakan mental Calon Pekerja Migran Indonesia (CPMI).
              </p>

              {/* Key Badges */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold text-purple-100">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Psikolog Profesional</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>LHP Resmi</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Hasil Cepat</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-purple-300 shrink-0" />
                  <span>Data Enkripsi</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE CATEGORIES SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#1D123B] tracking-tight">
              Pilih Kategori Psikotes Sesuai Kebutuhan Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Setiap kategori dirancang khusus sesuai dengan standar evaluasi psikologi yang berlaku di Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* 1. PSIKOTES PERUSAHAAN */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-purple-50 text-[#6C47FF] border border-purple-100 group-hover:bg-[#6C47FF] group-hover:text-white transition-colors shadow-2xs">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-[#6C47FF] border border-purple-200">
                    Korporat &amp; HR
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1D123B] group-hover:text-[#6C47FF] transition-colors">
                    Psikotes Perusahaan
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Solusi komprehensif rekrutmen karyawan, talent mapping, dan pemetaan kepemimpinan.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Seleksi Rekrutmen Karyawan Baru</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Tes Penempatan &amp; Promosi Jabatan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Tes Intelegensi, Kepribadian &amp; Bakat Minat</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Laporan LHP Kolektif HRD</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <button
                  onClick={() => openCategoryModal('perusahaan')}
                  className="w-full py-3 px-4 bg-[#6C47FF] hover:bg-[#5734ED] text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-md"
                >
                  <span>Pilih Psikotes Perusahaan</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. PSIKOTES SEKOLAH */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-teal-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-2xs">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    Edukasi &amp; Sekolah
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1D123B] group-hover:text-teal-700 transition-colors">
                    Psikotes Sekolah
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluasi potensi minat bakat siswa, kesiapan SD, hingga penjurusan perguruan tinggi.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Tes Kesiapan Masuk SD (Kognitif)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Pemetaan Gaya Belajar Siswa (VAK)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Tes Minat Bakat &amp; Penjurusan SMA/K</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Rekomendasi Jurusan Perguruan Tinggi</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <button
                  onClick={() => openCategoryModal('sekolah')}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-md"
                >
                  <span>Pilih Psikotes Sekolah</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3. PSIKOTES CPMI */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-2xs">
                    <Globe2 className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    CPMI / P3MI
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1D123B] group-hover:text-amber-700 transition-colors">
                    Psikotes CPMI
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluasi kelayakan mental & kesiapan adaptasi Calon Pekerja Migran Indonesia.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Pemeriksaan Untuk Persyaratan CPMI</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Sertifikat / Surat Keterangan Psikologi</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Kerjasama Lembaga Penempatan (P3MI)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <button
                  onClick={() => openCategoryModal('cpimi')}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-md"
                >
                  <span>Pilih Psikotes CPMI</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ALUR PELAKSANAAN PSIKOTES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-sm space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-black uppercase text-[#6C47FF] tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Langkah Mudah &amp; Cepat
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1D123B]">
                Alur Pelaksanaan Psikotes Online Sapahati
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 relative">
              
              {[
                {
                  num: 1,
                  title: 'Pengajuan & Konsultasi',
                  desc: 'Pilih kategori tes, isi formulir permohonan, atau hubungi tim psikotes kami untuk konsultasi awal.',
                },
                {
                  num: 2,
                  title: 'Pelaksanaan Tes',
                  desc: 'Peserta mengerjakan tes psikologi secara online di platform Sapahati atau jadwal on-site terkoordinasi.',
                },
                {
                  num: 3,
                  title: 'Scoring & Analisis',
                  desc: 'Hasil tes diolah dan ditinjau secara ketat oleh tim Psikolog Profesional & Terverifikasi SIKIPP.',
                },
                {
                  num: 4,
                  title: 'Penyerahan LHP & Feedback',
                  desc: 'Laporan Hasil Pemeriksaan Psikologi (LHP) diserahkan lengkap beserta sesi penjelasan hasil.',
                },
              ].map((step, idx, arr) => (
                <React.Fragment key={step.num}>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative flex flex-col justify-between group hover:border-purple-300 transition-all shadow-2xs hover:shadow-md">
                    <div>
                      <div className="w-8 h-8 rounded-full bg-[#6C47FF] text-white font-extrabold text-sm flex items-center justify-center shadow-2xs mb-3">
                        {step.num}
                      </div>
                      <h4 className="font-bold text-sm text-[#1D123B] mb-1">{step.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    {/* Desktop Right Arrow (for steps 1, 2, 3) */}
                    {idx < arr.length - 1 && (
                      <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-purple-200 text-[#6C47FF] items-center justify-center shadow-md">
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  {/* Mobile / Tablet Down Arrow */}
                  {idx < arr.length - 1 && (
                    <div className="flex lg:hidden justify-center my-0.5 text-[#6C47FF]">
                      <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center shadow-2xs">
                        <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}

            </div>
          </div>
        </section>

        {/* FAQ & CONTACT CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-100 via-teal-50 to-purple-50 rounded-3xl p-6 sm:p-10 border border-purple-200/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-lg sm:text-2xl font-extrabold text-[#1D123B]">
                Punya Pertanyaan atau Kebutuhan Paket Khusus?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Tim psikotes Sapahati siap membantu penyesuaian alat tes, jadwal massal perusahaan, atau proposal pengajuan sekolah &amp; P3MI.
              </p>
            </div>

            <button
              onClick={() => openCategoryModal('perusahaan')}
              className="px-6 py-3.5 bg-[#6C47FF] hover:bg-[#5532EE] text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Konsultasikan Paket Psikotes</span>
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer hideExtraSections={true} />

      {/* Category Modal */}
      <PsikotesDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onGoHome={onBackToHome}
        onStartCurhat={onStartCurhat}
        onOpenPsikolog={onOpenPsikolog}
        onOpenDashboard={onOpenDashboard}
        onOpenJournal={onOpenJournal}
        onOpenMitra={onOpenMitra}
        onOpenPsikotes={() => setIsNavOpen(false)}
      />

      {/* Mobile Fixed Bottom Nav */}
      <MobileBottomNav
        activeTab="none"
        onGoHome={onBackToHome}
        onOpenJournal={onOpenJournal}
        onOpenMitra={onOpenMitra}
        onStartCurhat={onStartCurhat}
        onOpenPsikolog={onOpenPsikolog}
      />

    </div>
  );
};
