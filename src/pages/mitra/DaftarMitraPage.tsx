import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  UserCheck, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Award, 
  Send, 
  Sparkles,
  PhoneCall,
  Briefcase
} from 'lucide-react';
import { Header } from '../../components/user/Header';
import { MobileHeader } from '../../components/user/MobileHeader';
import { MobileBottomNav } from '../../components/user/MobileBottomNav';
import { NavigationDrawer } from '../../components/user/NavigationDrawer';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';

interface DaftarMitraPageProps {
  onBackToHome: () => void;
  onOpenPsikolog: () => void;
  onOpenPsikotes: () => void;
  onStartCurhat: () => void;
  onOpenDashboard: () => void;
  onOpenJournal: () => void;
  onOpenMitra?: () => void;
}

export const DaftarMitraPage: React.FC<DaftarMitraPageProps> = ({
  onBackToHome,
  onOpenPsikolog,
  onOpenPsikotes,
  onStartCurhat,
  onOpenDashboard,
  onOpenJournal,
  onOpenMitra,
}) => {
  const [cms, setCms] = useState(() => getCmsConfig());
  const [fullname, setFullname] = useState('');
  const [sipp, setSipp] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [specialty, setSpecialty] = useState('Psikolog Klinis Dewasa');
  const [submitted, setSubmitted] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  const adminWa = cms.branding.contactWhatsapp || '6281298765432';
  const cleanWa = adminWa.replace(/\D/g, '');
  const formattedWa = adminWa.startsWith('+') ? adminWa : `+${cleanWa}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname || !whatsapp) return;

    // Direct to WhatsApp
    const message = encodeURIComponent(
      `Halo Tim Rekrutmen Sapahati,\nSaya berminat mendaftar sebagai Psikolog Mitra.\n\n*Nama:* ${fullname}\n*No. SIPP:* ${sipp || '-'}\n*Spesialisasi:* ${specialty}\n*WhatsApp:* ${whatsapp}\n\nMohon informasi langkah pendaftaran selanjutnya. Terima kasih!`
    );
    window.open(`https://wa.me/${cleanWa}?text=${message}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#1D123B] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-purple-200 overflow-x-hidden w-full pb-24 md:pb-10">
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header
          onOpenNav={() => setIsNavOpen(true)}
          onStartCurhat={onStartCurhat}
          onOpenPsikolog={onOpenPsikolog}
          onOpenDashboard={onOpenDashboard}
          onOpenMoodTracker={onOpenJournal}
          onOpenPsikotes={onOpenPsikotes}
          onGoHome={onBackToHome}
        />
      </div>

      {/* Mobile Top Header */}
      <div className="block md:hidden">
        <MobileHeader onGoHome={onBackToHome} onOpenNav={() => setIsNavOpen(true)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-20 px-3 sm:px-4 max-w-3xl mx-auto w-full space-y-4">
        
        {/* Main Card exact match from screenshot */}
        <div className="rounded-3xl bg-emerald-50/80 border border-emerald-100/90 p-5 sm:p-7 space-y-4 relative overflow-hidden shadow-2xs">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mitra &amp; Karir Psikolog</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-lg sm:text-2xl font-black text-[#1D123B] leading-snug">
              Ingin Daftar Sebagai Psikolog Mitra &amp; Karir?
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bergabunglah bersama psikolog profesional lainnya di Sapahati. Dapatkan fleksibilitas jam praktik, jam konsultasi digital, dan jangkauan klien yang lebih luas dari seluruh Indonesia.
            </p>
          </div>

          {/* Quick Direct WA Button matching screenshot */}
          <a
            href={`https://wa.me/${cleanWa}?text=Halo%20Tim%20Sapahati,%20saya%20tertarik%20mendaftar%20sebagai%20Psikolog%20Mitra.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#00A884] hover:bg-[#008f70] text-white font-black text-xs sm:text-sm shadow-md active:scale-[0.98] transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#00A884]" />
            <span>Daftar Mitra Psikolog ({formattedWa})</span>
          </a>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6C47FF] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#1D123B] pt-1">Jam Praktik Fleksibel</h3>
            <p className="text-[10.5px] text-slate-500 leading-tight">Atur jadwal sesi chat, video call, atau offline sesuai kenyamananmu.</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#1D123B] pt-1">Sistem Resmi &amp; Aman</h3>
            <p className="text-[10.5px] text-slate-500 leading-tight">Dilengkapi verifikasi SIPP resmi dan manajemen rekam konseling aman.</p>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-2xs space-y-4">
          <div className="border-b border-purple-50 pb-3">
            <h2 className="text-sm font-extrabold text-[#1D123B] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#6C47FF]" /> Form Pendaftaran Mitra
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Isi data singkat berikut untuk langsung tersambung dengan Tim HRD Sapahati.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap &amp; Gelar *</label>
              <input
                type="text"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Contoh: Dr. Sarah Aulia, M.Psi., Psikolog"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nomor SIPP *</label>
                <input
                  type="text"
                  value={sipp}
                  onChange={(e) => setSipp(e.target.value)}
                  placeholder="Contoh: 1209384-SIPP"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Aktif *</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="08xxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Bidang Spesialisasi Utama</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30"
              >
                <option value="Psikolog Klinis Dewasa">Psikolog Klinis Dewasa</option>
                <option value="Spesialis Kecemasan & Depresi">Spesialis Kecemasan &amp; Depresi</option>
                <option value="Konselor Pasangan & Pernikahan">Konselor Pasangan &amp; Pernikahan</option>
                <option value="Psikolog Anak & Remaja">Psikolog Anak &amp; Remaja</option>
                <option value="Pengembangan Karir & Organisasi">Pengembangan Karir &amp; Organisasi</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#00A884] hover:bg-[#008f70] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pendaftaran via WhatsApp</span>
            </button>
          </form>

          {submitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Aplikasi terkirim! Tim kami akan menghubungi WhatsApp Anda segera.</span>
            </div>
          )}
        </div>

        {/* Footnote */}
        <div className="text-center py-2">
          <p className="text-[11px] text-purple-700 font-semibold bg-purple-50 py-1.5 px-4 rounded-full inline-block">
            Untuk setiap hati yang ingin didengar 💜
          </p>
        </div>

      </main>

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
        onOpenPsikotes={onOpenPsikotes}
      />

      {/* Mobile Fixed Bottom Nav */}
      <MobileBottomNav
        activeTab="mitra"
        onGoHome={onBackToHome}
        onOpenMitra={() => {}}
        onOpenJournal={onOpenJournal}
        onOpenPsikolog={onOpenPsikolog}
        onStartCurhat={onStartCurhat}
        onOpenPsikotes={onOpenPsikotes}
        onOpenNav={onBackToHome}
      />
    </div>
  );
};
