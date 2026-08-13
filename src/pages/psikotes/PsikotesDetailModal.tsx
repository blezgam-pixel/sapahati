import React, { useState } from 'react';
import { X, CheckCircle2, Building2, GraduationCap, Globe2, Send, Calendar, User, Phone, Mail, FileText, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { getCmsConfig } from '../../data/cmsStore';

export type PsikotesCategory = 'perusahaan' | 'sekolah' | 'cpimi';

interface PsikotesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: PsikotesCategory | null;
  onSelectCategory?: (cat: PsikotesCategory) => void;
}

const CATEGORY_DATA = {
  perusahaan: {
    title: 'Psikotes Perusahaan & Korporat',
    badge: 'Corporate & HR Solutions',
    icon: Building2,
    color: 'from-purple-600 to-indigo-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    textAccent: 'text-[#6C47FF]',
    description: 'Layanan asesmen psikologi komprehensif untuk proses Rekrutmen, Evaluasi Promosi Jabatan, Talent Mapping, dan Leadership Assessment karyawan perusahaan.',
    subOptions: [
      'Rekrutmen & Seleksi Karyawan Baru',
      'Talent Mapping & Assessment Center',
      'Tes Penempatan & Promosi Jabatan',
      'Tes Intelegensi, Kepribadian & Bakat Minat'
    ],
  },
  sekolah: {
    title: 'Psikotes Sekolah & Pendidikan',
    badge: 'Educational Assessment',
    icon: GraduationCap,
    color: 'from-teal-600 to-emerald-600',
    lightBg: 'bg-teal-50',
    border: 'border-teal-200',
    textAccent: 'text-teal-700',
    description: 'Pemeriksaan potensi siswa mulai dari Tes Kesiapan Masuk Sekolah (TK/SD), Pemetaan Minat Bakat (SMP/SMA), hingga Rekomendasi Jurusan Perguruan Tinggi.',
    subOptions: [
      'Tes Kesiapan Masuk Sekolah Dasar (TK/SD)',
      'Tes IQ & Pemetaan Gaya Belajar (VAK)',
      'Tes Minat Bakat & Jurusan SMA/SMK',
      'Rekomendasi Jurusan Kuliah & Kesiapan Perguruan Tinggi'
    ],
  },
  cpimi: {
    title: 'Psikotes CPMI (Calon Pekerja Migran Indonesia)',
    badge: 'CPMI / P3MI Assessment',
    icon: Globe2,
    color: 'from-amber-600 to-orange-600',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    textAccent: 'text-amber-800',
    description: 'Tes Evaluasi Kesehatan Jiwa & Adaptasi Mental khusus Calon Pekerja Migran Indonesia (CPMI) sesuai regulasi kelayakan penempatan tenaga kerja luar negeri.',
    subOptions: [
      'Pemeriksaan Untuk Persyaratan CPMI',
      'Pemeriksaan Psikologis Kolektif Lembaga Penempatan (P3MI)',
      'Penerbitan Surat Keterangan / Laporan Hasil Pemeriksaan Psikologi (LHP) Resmi'
    ],
  }
};

export const PsikotesDetailModal: React.FC<PsikotesDetailModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  if (!isOpen || !category) return null;

  const data = CATEGORY_DATA[category];
  const IconComponent = data.icon;

  // Form State
  const [selectedSubOption, setSelectedSubOption] = useState<string>(data.subOptions[0]);
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [participantsCount, setParticipantsCount] = useState('1 Orang (Individu)');
  const [proposedDate, setProposedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cms = getCmsConfig();
    const adminWa = cms.branding.contactWhatsapp || '6281234567890';

    const message = `*PENDAFTARAN & KONSULTASI PSIKOTES ONLINE*
----------------------------------------
📌 *Kategori Psikotes:* ${data.title}
🎯 *Layanan Dituju:* ${selectedSubOption}

👤 *Nama Lengkap / Kontak:* ${fullName}
🏢 *Instansi / Sekolah / PT:* ${institution || '-'}
📱 *No. WhatsApp:* ${whatsapp}
✉️ *Email:* ${email || '-'}
👥 *Jumlah Peserta:* ${participantsCount}
📅 *Rencana Tanggal Pelaksanaan:* ${proposedDate || 'Segera (Disesuaikan)'}

📝 *Catatan / Kebutuhan Tambahan:*
${notes || 'Mohon info mengenai tata cara pelaksanaan tes, durasi, dan rincian biaya.'}
----------------------------------------
_Dikirim via Website Sapahati Psikotes_`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${adminWa}?text=${encoded}`;

    setIsSubmitted(true);
    // Execute directly in user gesture context to avoid popup blocker on mobile Safari/Chrome
    window.open(waUrl, '_blank');

    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col my-auto transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className={`p-5 sm:p-6 bg-gradient-to-r ${data.color} text-white flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3.5 pr-2">
            <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shrink-0">
              <IconComponent className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white inline-block mb-1">
                {data.badge}
              </span>
              <h3 className="text-lg sm:text-xl font-bold leading-tight">{data.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          
          {/* Deskripsi Singkat */}
          <div className={`p-4 rounded-2xl ${data.lightBg} border ${data.border} text-xs sm:text-sm text-slate-700 leading-relaxed`}>
            {data.description}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            
            {/* 1. Pilih Spesifikasi Layanan */}
            <div>
              <label className="block font-bold text-slate-900 mb-2">
                1. Pilih Jenis Layanan Psikotes:
              </label>
              <div className="space-y-2">
                {data.subOptions.map((opt) => (
                  <label
                    key={opt}
                    onClick={() => setSelectedSubOption(opt)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedSubOption === opt
                        ? 'bg-white border-[#6C47FF] shadow-xs ring-1 ring-[#6C47FF] text-slate-900 font-bold'
                        : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subOption"
                      checked={selectedSubOption === opt}
                      onChange={() => setSelectedSubOption(opt)}
                      className="mt-0.5 accent-[#6C47FF]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Form Informasi Pendaftar */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 border-b pb-2">
                <User className="w-4 h-4 text-[#6C47FF]" />
                2. Data Pemohon / Penanggung Jawab
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso, M.Si."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6C47FF] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Nama Perusahaan / Sekolah / P3MI (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Sumber Jaya / SMA Negeri 1"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6C47FF] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0812xxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6C47FF] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Email Aktif (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6C47FF] outline-none text-xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Estimasi Jumlah Peserta Tes *
                  </label>
                  <select
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6C47FF] outline-none text-xs font-semibold text-slate-800 transition-all cursor-pointer"
                  >
                    <option value="1 Orang (Individu)">1 Orang (Individu)</option>
                    <option value="2 - 10 Orang (Kelompok Kecil)">2 - 10 Orang (Kelompok Kecil)</option>
                    <option value="11 - 50 Orang (Sedang)">11 - 50 Orang (Sedang)</option>
                    <option value="51 - 100 Orang (Massal)">51 - 100 Orang (Massal)</option>
                    <option value="> 100 Orang (Korporat Besar / Angkatan)"> Lebih dari 100 Orang</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Rencana Tanggal Pelaksanaan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 15 Agustus 2026"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6C47FF] outline-none text-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">
                  Catatan Kebutuhan Khusus / Pertanyaan
                </label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan jika ada kebutuhan khusus (misal: butuh penawaran resmi PDF, tes dilaksanakan online/onsite, dsb)."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6C47FF] outline-none text-xs transition-all"
                />
              </div>
            </div>

            {/* Note Enkripsi & Psikolog Profesional */}
            <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 flex items-center gap-2 border border-purple-100">
              <ShieldCheck className="w-4 h-4 text-[#6C47FF] shrink-0" />
              <span>Tes ditangani langsung oleh Psikolog Profesional & Terverifikasi SIKIPP secara rahasia.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitted}
              className="w-full py-3.5 bg-[#6C47FF] hover:bg-[#5835EE] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              {isSubmitted ? (
                <span>Mengarahkan ke Tim Psikotes...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Permohonan & Konsultasi Psikotes via WhatsApp</span>
                </>
              )}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};
