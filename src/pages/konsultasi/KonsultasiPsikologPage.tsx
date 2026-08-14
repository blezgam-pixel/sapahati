import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  Video, 
  MapPin, 
  Shield, 
  Clock, 
  ChevronRight,
  User,
  CreditCard,
  QrCode,
  Upload,
  FileCheck,
  Sparkles,
  Check,
  Calendar,
  Copy,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { Psychologist, ConsultationMethod, BookingSession } from '../../types';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { APP_IMAGES } from '../../data/appImages';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getCmsConfig } from '../../data/cmsStore';
import { 
  getPsychologists, 
  getBookings, 
  createBooking, 
  subscribeStore 
} from '../../data/psychologistStore';
import { useCmsConfig } from '../../data/cmsStore';
import { getPsychologistInitials } from '../../utils/initials';
import { Header } from '../../components/user/Header';
import { MobileHeader } from '../../components/user/MobileHeader';
import { MobileBottomNav } from '../../components/user/MobileBottomNav';
import { NavigationDrawer } from '../../components/user/NavigationDrawer';

interface KonsultasiPsikologPageProps {
  onBackToHome: () => void;
  onOpenPsikotes: () => void;
  onStartCurhat: () => void;
  onOpenDashboard: () => void;
  onOpenJournal?: () => void;
  onOpenMitra?: () => void;
}

const DEFAULT_TIME_SLOTS = [
  '19:00 WIB Hari Ini',
  '20:30 WIB Hari Ini',
  '10:00 WIB Besok',
  '15:00 WIB Besok',
];

const METHODS_CONFIG: {
  id: ConsultationMethod;
  title: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    id: 'chat',
    title: 'Sesi Chat Teks',
    icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
    desc: 'Diskusi privat via pesan teks fleksibel',
  },
  {
    id: 'video',
    title: 'Video Call HD',
    icon: <Video className="w-4 h-4 text-[#6C47FF]" />,
    desc: 'Konsultasi tatap muka online dari mana saja',
  },
  {
    id: 'offline',
    title: 'Ketemu Langsung',
    icon: <MapPin className="w-4 h-4 text-amber-600" />,
    desc: 'Sesi tatap muka di Klinik Mitra Sapahati',
  },
];

const formatRupiah = (amount: number) => {
  return 'Rp ' + amount.toLocaleString('id-ID');
};

export const KonsultasiPsikologPage: React.FC<KonsultasiPsikologPageProps> = ({
  onBackToHome,
  onOpenPsikotes,
  onStartCurhat,
  onOpenDashboard,
  onOpenJournal,
  onOpenMitra,
}) => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [bookings, setBookings] = useState<BookingSession[]>([]);
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Semua');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('ALL');

  // Firebase Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Booking Flow States
  const [selectedPsikolog, setSelectedPsikolog] = useState<Psychologist | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<ConsultationMethod>('video');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isCustomTimeMode, setIsCustomTimeMode] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('');
  
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientWhatsapp, setPatientWhatsapp] = useState('');

  const [step, setStep] = useState<0 | 1 | 2>(0); // 0 = Directory, 1 = Form & Payment, 2 = Confirmation
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Payment upload & mode state
  const [proofSubmissionMode, setProofSubmissionMode] = useState<'upload' | 'whatsapp'>('upload');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const receiptRef = React.useRef<HTMLDivElement>(null);

  const downloadReceiptPDF = async () => {
    if (!receiptRef.current) return;
    try {
      const el = receiptRef.current;
      
      // html-to-image supports modern CSS like oklch
      const imgData = await htmlToImage.toPng(el, { 
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });
      
      // Get dimensions of the element to scale PDF correctly
      const width = el.offsetWidth;
      const height = el.offsetHeight;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [width, height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('Struk_Konsultasi_SapaHati.pdf');
    } catch (err) {
      console.error('Failed to generate PDF receipt', err);
      alert('Maaf, gagal membuat PDF: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    if (step === 2) {
      // Small delay to ensure the DOM is fully rendered before capturing
      const timer = setTimeout(() => {
        downloadReceiptPDF();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    setPsychologists(getPsychologists());
    setBookings(getBookings());

    const unsubscribe = subscribeStore(() => {
      setPsychologists(getPsychologists());
      setBookings(getBookings());
    });

    // Check for redirect result to finalize login on mobile browsers
    getRedirectResult(auth).catch((error) => {
      console.error('Redirect login error:', error);
      if (error.code === 'auth/unauthorized-domain') {
         alert('Gagal memverifikasi login. Pastikan domain sudah diizinkan di Firebase.');
      }
    });

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        // Restore booking draft if it exists after redirect login
        const draftStr = sessionStorage.getItem('sapahati_booking_draft');
        if (draftStr) {
          try {
             const draft = JSON.parse(draftStr);
             const psychs = getPsychologists();
             const targetPsych = psychs.find(p => p.id === draft.psychId);
             if (targetPsych) {
               setSelectedPsikolog(targetPsych);
               setSelectedMethod(draft.method);
               setSelectedTime(draft.time);
               setPatientName(draft.patientName || '');
               setPatientAge(draft.patientAge || '');
               setPatientWhatsapp(draft.patientWhatsapp || '');
               setStep(1); // Return directly to the form/payment step
             }
             sessionStorage.removeItem('sapahati_booking_draft');
          } catch(e) {
             console.error('Failed to parse draft', e);
          }
        }
      }
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      // signInWithPopup is most compatible with standard Firebase authDomain
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed', error);
      // If popup was blocked (common on mobile), fall back to redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          // Save draft before redirect so user doesn't lose their selection
          const draft = {
            psychId: selectedPsikolog?.id,
            method: selectedMethod,
            time: selectedTime,
            patientName,
            patientAge,
            patientWhatsapp,
          };
          sessionStorage.setItem('sapahati_booking_draft', JSON.stringify(draft));
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError: any) {
          console.error('Redirect login also failed', redirectError);
          alert('Login gagal. Pastikan domain "sapahati.vercel.app" sudah ada di Authorized Domains di Firebase Console.');
        }
      } else {
        alert('Login gagal: ' + error.message);
      }
    }
  };

  // Get schedule slots for a psychologist
  const getPsychSlots = (psych: Psychologist): string[] => {
    if (psych.scheduleSlots && psych.scheduleSlots.length > 0) {
      return psych.scheduleSlots;
    }
    return DEFAULT_TIME_SLOTS;
  };

  // Check if slot is booked
  const isSlotBooked = (psychId: string, time: string) => {
    return bookings.some(
      (b) => b.psychologistId === psychId && b.timeSlot === time && (b.status === 'pending' || b.status === 'confirmed')
    );
  };

  // Check if psychologist is full
  const isPsychologistFull = (psychId: string) => {
    const target = psychologists.find((p) => p.id === psychId);
    if (!target) return false;
    const slots = getPsychSlots(target);
    return slots.every((time) => isSlotBooked(psychId, time));
  };

  // Collect all unique time slots across psychologists
  const allAvailableTimeSlots = useMemo(() => {
    const slotsSet = new Set<string>();
    psychologists.forEach((p) => {
      const slots = getPsychSlots(p);
      slots.forEach((s) => slotsSet.add(s));
    });
    if (slotsSet.size === 0) {
      DEFAULT_TIME_SLOTS.forEach((s) => slotsSet.add(s));
    }
    return Array.from(slotsSet);
  }, [psychologists]);

  const getOpenPsychCountForSlot = (slot: string) => {
    if (slot === 'ALL') return psychologists.filter((p) => !isPsychologistFull(p.id)).length;
    return psychologists.filter((p) => getPsychSlots(p).includes(slot) && !isSlotBooked(p.id, slot)).length;
  };

  const topics = ['Semua', 'Kecemasan', 'Depresi', 'Karir', 'Pasangan & Hubungan', 'Self Growth'];

  // Filter psychologists based on Search, Topic, and Time Slot
  const filteredPsychologists = useMemo(() => {
    return psychologists.filter((p) => {
      const specs = p.specialties || (p as any).specializations || [];
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specs.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Topic filter
      if (selectedTopic !== 'Semua') {
        const matchesTopic = specs.some((s: string) =>
          s.toLowerCase().includes(selectedTopic.toLowerCase())
        );
        if (!matchesTopic) return false;
      }

      // Time Slot filter
      if (selectedTimeFilter && selectedTimeFilter !== 'ALL') {
        const slots = getPsychSlots(p);
        if (!slots.includes(selectedTimeFilter)) return false;
      }

      return true;
    });
  }, [psychologists, searchQuery, selectedTopic, selectedTimeFilter, bookings]);

  const handleSelectPsikolog = (
    psikolog: Psychologist,
    method: ConsultationMethod = 'video',
    preferredTime?: string
  ) => {
    setSelectedPsikolog(psikolog);
    setSelectedMethod(method);

    const slots = getPsychSlots(psikolog);

    if (
      preferredTime &&
      preferredTime !== 'ALL' &&
      slots.includes(preferredTime) &&
      !isSlotBooked(psikolog.id, preferredTime)
    ) {
      setSelectedTime(preferredTime);
    } else {
      const openSlot = slots.find((time) => !isSlotBooked(psikolog.id, time));
      if (openSlot) {
        setSelectedTime(openSlot);
      } else if (slots.length > 0) {
        setSelectedTime(slots[0]);
      } else {
        setSelectedTime(DEFAULT_TIME_SLOTS[0]);
      }
    }

    setStep(1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setReceiptFileName(file.name);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_SIZE = 700;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > MAX_SIZE) {
                  height = Math.round((height * MAX_SIZE) / width);
                  width = MAX_SIZE;
                }
              } else {
                if (height > MAX_SIZE) {
                  width = Math.round((width * MAX_SIZE) / height);
                  height = MAX_SIZE;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const compressedUrl = canvas.toDataURL('image/jpeg', 0.75);
                setReceiptDataUrl(compressedUrl);
              } else {
                setReceiptDataUrl(result);
              }
            };
            img.onerror = () => {
              setReceiptDataUrl(result);
            };
            img.src = result;
          }
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setReceiptDataUrl((event.target?.result as string) || '');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCopyAccount = (num: string) => {
    navigator.clipboard.writeText(num);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Silakan login terlebih dahulu untuk membuat pesanan.');
      return;
    }
    if (!selectedPsikolog || !patientName.trim() || !patientAge || !patientWhatsapp.trim()) return;

    if (isSlotBooked(selectedPsikolog.id, selectedTime)) {
      alert(`Jadwal ${selectedTime} untuk ${selectedPsikolog.name} sudah terisi. Silakan pilih jadwal lain.`);
      return;
    }

    setIsSubmitting(true);

    const price = selectedPsikolog.prices?.[selectedMethod] || (selectedPsikolog as any).price || 150000;
    const methodTitle = METHODS_CONFIG.find((m) => m.id === selectedMethod)?.title || 'Konsultasi';

    try {
      const created = await createBooking({
        patientName,
        patientAge: Number(patientAge),
        patientWhatsapp,
        psychologistId: selectedPsikolog.id,
        psychologistName: selectedPsikolog.name,
        method: selectedMethod,
        methodTitle,
        timeSlot: selectedTime,
        price,
        paymentReceiptName: receiptFileName || 'Bukti_Transfer_QRIS.jpg',
        paymentReceiptUrl: receiptDataUrl || undefined,
        userId: user.uid,
        userEmail: user.email || undefined,
      });

      setCreatedBookingId(created.id);
      setStep(2);
    } catch (err) {
      console.error('Failed to create booking', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPrice = selectedPsikolog
    ? selectedPsikolog.prices?.[selectedMethod] || (selectedPsikolog as any).price || 150000
    : 0;

  // Cek jika pengguna memiliki pemesanan aktif
  const activeBooking = useMemo(() => {
    if (!user) return null;
    // Cari booking milik user ini yang statusnya pending atau confirmed
    return bookings.find((b) => b.userId === user.uid && (b.status === 'pending' || b.status === 'confirmed'));
  }, [user, bookings]);

  // Cek status booking yang baru saja dibuat di step 2
  const currentCreatedStatus = useMemo(() => {
    if (!createdBookingId) return 'pending';
    const b = bookings.find((bk) => bk.id === createdBookingId);
    return b ? b.status : 'pending';
  }, [createdBookingId, bookings]);

  const cms = useCmsConfig();
  const adminWa = cms.branding?.contactWhatsapp || '6281298765432';
  const cleanWa = adminWa.replace(/\D/g, '');
  const formattedWa = adminWa.startsWith('+') ? adminWa : `+${cleanWa}`;

  const handleSendBuktiWa = () => {
    if (!selectedPsikolog) return;
    const methodTitle = METHODS_CONFIG.find((m) => m.id === selectedMethod)?.title || 'Konsultasi';
    const priceFormatted = formatRupiah(currentPrice);

    const text =
      `Halo Admin Sapahati,\n\n` +
      `Saya ingin mengonfirmasi pendaftaran & mengirimkan bukti pembayaran konsultasi:\n\n` +
      `📌 *DATA PASIEN*\n` +
      `• Nama Pasien: ${patientName || '-'}\n` +
      `• Usia: ${patientAge ? patientAge + ' Tahun' : '-'}\n` +
      `• No. WhatsApp: ${patientWhatsapp || '-'}\n\n` +
      `👩‍⚕️ *DETAIL KONSULTASI*\n` +
      `• Psikolog: ${selectedPsikolog.name}\n` +
      `• Jadwal: ${selectedTime || '-'}\n` +
      `• Metode Sesi: ${methodTitle}\n` +
      `• Total Biaya: ${priceFormatted}\n` +
      `• File Bukti Transfer: ${receiptFileName || 'Bukti_Transfer_QRIS.jpg'}\n\n` +
      `Mohon verifikasi pendaftaran saya ya Min. Bukti transfer sudah terlampir. Terima kasih! 🙏`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#1D123B] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-purple-200 overflow-x-hidden w-full pb-24 md:pb-10">
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header
          onOpenNav={() => setIsNavOpen(true)}
          onStartCurhat={onStartCurhat}
          onOpenPsikolog={() => setStep(0)}
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
      <main className="flex-1 pt-16 md:pt-20 px-3 sm:px-4 max-w-5xl mx-auto w-full space-y-4">
        
        {step === 0 && (
          <>
            {/* Status Pesanan Aktif (Jika Ada) */}
            {activeBooking && (
              <div className={`rounded-3xl p-4 sm:p-5 shadow-sm mb-6 animate-fade-in border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${activeBooking.status === 'confirmed' ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activeBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                    {activeBooking.status === 'confirmed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className={`text-sm sm:text-base font-black ${activeBooking.status === 'confirmed' ? 'text-emerald-800' : 'text-orange-800'}`}>
                        {activeBooking.status === 'confirmed' ? 'Sesi Terkonfirmasi' : 'Menunggu ACC Admin'}
                      </h2>
                      <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold ${activeBooking.status === 'confirmed' ? 'bg-emerald-200 text-emerald-800' : 'bg-orange-200 text-orange-800'}`}>
                        {activeBooking.status === 'confirmed' ? 'Selesai' : 'Pending'}
                      </span>
                    </div>
                    <p className={`text-[11px] sm:text-xs ${activeBooking.status === 'confirmed' ? 'text-emerald-700' : 'text-orange-700'}`}>
                      <strong>{activeBooking.psychologistName}</strong> • {activeBooking.timeSlot}
                    </p>
                  </div>
                </div>

                {/* Tombol Download Struk dari Status */}
                <button 
                  onClick={downloadReceiptPDF}
                  className={`text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer bg-white px-4 py-2.5 rounded-xl border shadow-xs transition-all active:scale-95 w-full sm:w-auto ${activeBooking.status === 'confirmed' ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50' : 'text-orange-700 border-orange-200 hover:bg-orange-50'}`}
                >
                  <FileCheck className="w-4 h-4" /> Download Struk
                </button>

                {/* Hidden Receipt UI specifically for activeBooking PDF generation */}
                <div className="fixed -left-[9999px] -top-[9999px] w-[500px] z-[-50]">
                  <div ref={receiptRef} className="bg-white p-6 rounded-xl space-y-5 text-center shadow-none">
                    <div className="flex items-center justify-center gap-2 mb-4">
                       {(getCmsConfig().branding.logoImage || APP_IMAGES.logoImage) && (
                         <img src={getCmsConfig().branding.logoImage || APP_IMAGES.logoImage} alt="Sapa Hati Logo" className="h-8" />
                       )}
                       <span className="font-extrabold text-[#1D123B] text-xl tracking-tight">Sapa Hati</span>
                    </div>

                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xs ${activeBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                      {activeBooking.status === 'confirmed' ? <Check className="w-10 h-10 stroke-[3]" /> : <Clock className="w-10 h-10 stroke-[3]" />}
                    </div>

                    <div className="space-y-2">
                      <span className={`px-3.5 py-1 rounded-full text-xs font-black border inline-block ${activeBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-orange-100 text-orange-800 border-orange-300'}`}>
                        {activeBooking.status === 'confirmed' ? 'Sesi Telah Dikonfirmasi' : 'Pendaftaran Terkirim'}
                      </span>
                      <h2 className="text-xl font-black text-[#1D123B]">Sesi {activeBooking.status === 'confirmed' ? 'Di-ACC' : 'Pending'}</h2>
                      
                      <div className={`border rounded-xl p-4 mt-4 mb-2 flex items-start gap-3 text-left ${activeBooking.status === 'confirmed' ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activeBooking.status === 'confirmed' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                          {activeBooking.status === 'confirmed' ? <CheckCircle2 className={`w-4 h-4 ${activeBooking.status === 'confirmed' ? 'text-emerald-600' : 'text-orange-600'}`} /> : <Clock className={`w-4 h-4 ${activeBooking.status === 'confirmed' ? 'text-emerald-600' : 'text-orange-600'}`} />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${activeBooking.status === 'confirmed' ? 'text-emerald-800' : 'text-orange-800'}`}>
                            {activeBooking.status === 'confirmed' ? 'Sesi Terkonfirmasi (ACC)' : 'Menunggu Proses (Pending)'}
                          </p>
                          <p className={`text-xs mt-0.5 ${activeBooking.status === 'confirmed' ? 'text-emerald-600' : 'text-orange-600'}`}>
                            {activeBooking.status === 'confirmed' ? 'Admin telah menyetujui jadwal konsultasi ini. Psikolog siap.' : 'Sesi kamu sedang diproses oleh admin. Silakan tunggu.'}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mt-2">
                        Jadwal konsultasimu bersama <strong>{activeBooking.psychologistName}</strong> untuk waktu <strong>{activeBooking.timeSlot}</strong>.
                      </p>
                    </div>

                    <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 text-left space-y-2 text-xs">
                      <div className="flex justify-between border-b pb-1.5 border-purple-100">
                        <span className="text-slate-500">Pasien:</span>
                        <span className="font-bold text-slate-900">{activeBooking.patientName} ({activeBooking.patientAge} th)</span>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-purple-100">
                        <span className="text-slate-500">No. WhatsApp:</span>
                        <span className="font-bold text-[#6C47FF]">{activeBooking.patientWhatsapp}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-purple-100">
                        <span className="text-slate-500">Metode Sesi:</span>
                        <span className="font-bold text-slate-900">{activeBooking.methodTitle || activeBooking.method}</span>
                      </div>
                      <div className="flex justify-between pt-1 font-bold">
                        <span className="text-slate-600">Total Biaya:</span>
                        <span className="text-[#6C47FF]">{formatRupiah(activeBooking.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Banner Promo */}
            <div className="rounded-3xl bg-gradient-to-r from-[#6C47FF] via-purple-600 to-[#5034D4] p-5 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-1.5">
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
                  Privasi Terjaga 100% • Spreadsheet Sync
                </span>
                <h1 className="text-lg sm:text-2xl font-black leading-snug">
                  Konsultasi Psikolog Berpengalaman
                </h1>
                <p className="text-xs text-purple-100 max-w-xl">
                  Pilih jam konsultasi sesuai jadwal yang dibuka psikolog, hubungkan via Chat, Video Call, atau Tatap Muka.
                </p>
              </div>
            </div>

            {/* Time Slot Filter Pills Bar (Synced with Spreadsheet/Dashboard Data) */}
            <div className="p-4 bg-white rounded-3xl border border-purple-100/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6C47FF] shrink-0" />
                  <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">
                    Filter Jadwal Jam Konsultasi
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {allAvailableTimeSlots.length} Pilihan Sesi Jam
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                {/* All Schedules Chip */}
                <button
                  type="button"
                  onClick={() => setSelectedTimeFilter('ALL')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    selectedTimeFilter === 'ALL'
                      ? 'bg-[#6C47FF] text-white shadow-xs'
                      : 'bg-purple-50/70 border border-purple-100 text-slate-700 hover:bg-purple-100/80'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Semua Jadwal</span>
                  <span className={`px-1.5 py-0.5 text-[9.5px] rounded-md font-extrabold ${
                    selectedTimeFilter === 'ALL' ? 'bg-purple-800 text-white' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {psychologists.length}
                  </span>
                </button>

                {/* Specific Time Slots Chips */}
                {allAvailableTimeSlots.map((slot) => {
                  const isSelected = selectedTimeFilter === slot;
                  const openCount = getOpenPsychCountForSlot(slot);

                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedTimeFilter(slot)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#6C47FF] text-white shadow-xs'
                          : 'bg-white border border-purple-100 text-slate-700 hover:bg-purple-50'
                      }`}
                    >
                      <Clock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#6C47FF]'}`} />
                      <span>{slot}</span>
                      <span className={`px-1.5 py-0.5 text-[9.5px] rounded-md font-extrabold ${
                        isSelected
                          ? 'bg-purple-800 text-white'
                          : openCount > 0
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {openCount > 0 ? `${openCount} Ada` : 'Full'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama psikolog..."
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-purple-100 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30 shadow-2xs"
              />
            </div>

            {/* Psychologists List Grid */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-slate-700">
                  Daftar Psikolog Tersedia{' '}
                  {selectedTimeFilter && selectedTimeFilter !== 'ALL' && (
                    <span className="text-[#6C47FF]">({selectedTimeFilter})</span>
                  )}
                </span>
                <span className="text-[11px] text-slate-500">
                  {filteredPsychologists.length} Psikolog Ditemukan
                </span>
              </div>

              {filteredPsychologists.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-3xl border border-purple-100 text-slate-500 text-xs space-y-2">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-800 text-sm">Tidak ada psikolog yang cocok</p>
                  <p className="text-slate-500 text-xs">Coba ganti filter jam atau topik pencarian Anda di atas.</p>
                </div>
              ) : (
                filteredPsychologists.map((p) => {
                  const avatarSrc = p.avatar || (p as any).imageUrl || (p as any).avatarUrl;
                  const isSlotAvailable = selectedTimeFilter && selectedTimeFilter !== 'ALL'
                    ? !isSlotBooked(p.id, selectedTimeFilter)
                    : !isPsychologistFull(p.id);

                  return (
                    <div
                      key={p.id}
                      className="p-4 bg-white rounded-3xl border border-purple-100/90 shadow-2xs hover:shadow-md transition-all space-y-3.5"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Avatar Image (Taken directly from Spreadsheet/Dashboard) */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-100 text-[#6C47FF] font-black text-xl flex items-center justify-center shrink-0 overflow-hidden border border-purple-200 shadow-2xs">
                          {avatarSrc && avatarSrc.trim() !== '' ? (
                            <img src={avatarSrc} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            getPsychologistInitials(p.name)
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h3 className="text-sm sm:text-base font-black text-[#1D123B] truncate">{p.name}</h3>
                              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                            </div>

                            {isSlotAvailable ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 shrink-0">
                                Tersedia {selectedTimeFilter && selectedTimeFilter !== 'ALL' ? selectedTimeFilter : 'Sesi'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-200 shrink-0">
                                Jadwal Full
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 font-medium">{p.title || 'Psikolog Klinis'}</p>

                          <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{p.rating || 5.0}</span>
                            </div>
                            <span>•</span>
                            <span>Pengalaman {p.experienceYears || 0} Tahun</span>
                          </div>

                          {/* Specialization Badges */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {(p.specialties || (p as any).specializations || []).map((spec: string, i: number) => (
                              <span
                                key={i}
                                className="px-2.5 py-0.5 bg-purple-50 text-[#6C47FF] text-[10px] font-semibold rounded-lg border border-purple-100"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Method Options & Rates */}
                      <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100/70 space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 block">
                          Pilihan Metode Konsultasi & Tarif (Spreadsheet Sync):
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectPsikolog(p, 'chat', selectedTimeFilter)}
                            className="p-2.5 bg-white hover:bg-purple-100/60 border border-purple-200/80 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-purple-600" />
                              <span className="font-bold text-slate-800 group-hover:text-[#6C47FF]">Chat Teks</span>
                            </div>
                            <span className="font-black text-[#6C47FF]">
                              {formatRupiah(p.prices?.chat || 50000)}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectPsikolog(p, 'video', selectedTimeFilter)}
                            className="p-2.5 bg-white hover:bg-purple-100/60 border border-purple-200/80 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-[#6C47FF]" />
                              <span className="font-bold text-slate-800 group-hover:text-[#6C47FF]">Video Call</span>
                            </div>
                            <span className="font-black text-[#6C47FF]">
                              {formatRupiah(p.prices?.video || 100000)}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectPsikolog(p, 'offline', selectedTimeFilter)}
                            className="p-2.5 bg-white hover:bg-amber-50 border border-purple-200/80 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-amber-600" />
                              <span className="font-bold text-slate-800 group-hover:text-amber-700">Tatap Muka</span>
                            </div>
                            <span className="font-black text-amber-700">
                              {formatRupiah(p.prices?.offline || 200000)}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Bottom Action */}
                      <div className="pt-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>Jam Diinput Psikolog: <strong>{getPsychSlots(p).length} Sesi</strong></span>
                        </div>
                        <button
                          onClick={() => handleSelectPsikolog(p, 'video', selectedTimeFilter)}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6C47FF] to-[#5034D4] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform cursor-pointer"
                        >
                          Pilih Sesi Konsultasi →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Step 1: Form & Payment OR Login Prompt */}
        {step === 1 && selectedPsikolog && (
          <div className="animate-fade-in max-w-2xl mx-auto space-y-4 sm:space-y-6 pb-20">
            {isAuthLoading ? (
               <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : !user ? (
               <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm text-center space-y-6 my-10">
                 <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                   <User className="w-8 h-8 text-purple-600" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-[#1D123B]">Login untuk Melanjutkan</h2>
                   <p className="text-sm text-slate-600 mt-2">Masuk dengan akun Google agar jadwal konsultasimu tersimpan aman dan kamu bisa memantau statusnya tanpa takut sesi ter-reset.</p>
                 </div>
                 <button onClick={handleLogin} type="button" className="w-full py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.98]">
                   <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                   Lanjutkan dengan Google
                 </button>
               </div>
            ) : (
            <form onSubmit={handleCreateBooking} className="bg-white rounded-3xl p-4 sm:p-6 border border-purple-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-purple-50 pb-3">
                <div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs text-[#6C47FF] font-bold hover:underline mb-1 inline-block cursor-pointer"
                  >
                    ← Kembali pilih psikolog lain
                  </button>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1D123B]">
                  Jadwalkan Konsultasi & Pembayaran
                </h2>
                <p className="text-xs text-slate-500">
                  Bersama {selectedPsikolog.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Psychologist & Method & Schedule & Data Diri */}
              <div className="space-y-5">
                
                {/* Selected Psychologist Summary Card */}
                <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-100 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#6C47FF] font-black text-lg flex items-center justify-center shrink-0 overflow-hidden border border-purple-200">
                      {selectedPsikolog.avatar || (selectedPsikolog as any).imageUrl ? (
                        <img
                          src={selectedPsikolog.avatar || (selectedPsikolog as any).imageUrl}
                          alt={selectedPsikolog.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getPsychologistInitials(selectedPsikolog.name)
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{selectedPsikolog.name}</h4>
                      <p className="text-xs text-slate-500">{selectedPsikolog.title || 'Psikolog Klinis'}</p>
                    </div>
                  </div>

                  {isPsychologistFull(selectedPsikolog.id) ? (
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black border border-rose-200 shrink-0">
                      Jadwal Full
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200 shrink-0">
                      Sesi Tersedia
                    </span>
                  )}
                </div>

                {/* 1. Method Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    1. Pilih Metode Konsultasi
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {METHODS_CONFIG.map((method) => {
                      const isSelected = selectedMethod === method.id;
                      const price = selectedPsikolog.prices?.[method.id] || (selectedPsikolog as any).price || 150000;

                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedMethod(method.id)}
                          className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#6C47FF] bg-purple-50 ring-2 ring-[#6C47FF]/20 shadow-2xs'
                              : 'border-purple-100 bg-white hover:bg-purple-50/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="p-1.5 rounded-xl bg-white shadow-2xs border border-purple-100">
                                {method.icon}
                              </span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#6C47FF]" />}
                            </div>
                            <p className="text-xs font-bold text-[#1D123B]">{method.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{method.desc}</p>
                          </div>
                          <p className="text-xs font-black text-[#6C47FF] mt-2 pt-1 border-t border-purple-100">
                            {formatRupiah(price)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Time Slot Selection (Inputted by Psychologist in Dashboard/Spreadsheet) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      2. Pilih Waktu Konsultasi (Sesuai Input Dashboard Psikolog)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomTimeMode(!isCustomTimeMode);
                        if (!isCustomTimeMode && customTimeInput) {
                          setSelectedTime(customTimeInput);
                        }
                      }}
                      className="text-xs text-[#6C47FF] font-bold underline cursor-pointer"
                    >
                      {isCustomTimeMode ? '← Pilih Slot Psikolog' : '+ Jam Khusus'}
                    </button>
                  </div>

                  {!isCustomTimeMode ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getPsychSlots(selectedPsikolog).map((time) => {
                        const booked = isSlotBooked(selectedPsikolog.id, time);
                        const isSelected = selectedTime === time && !booked;

                        return (
                          <button
                            type="button"
                            key={time}
                            disabled={booked}
                            onClick={() => {
                              if (!booked) {
                                setSelectedTime(time);
                                setCustomTimeInput('');
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left text-xs font-extrabold transition-all flex items-center justify-between ${
                              booked
                                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                : isSelected
                                ? 'border-[#6C47FF] bg-[#6C47FF] text-white shadow-xs cursor-pointer'
                                : 'border-purple-100 bg-white text-slate-700 hover:bg-purple-50 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Clock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#6C47FF]'}`} />
                              <span className={booked ? 'line-through' : ''}>{time}</span>
                            </div>
                            {booked ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-100 text-rose-700 border border-rose-200 rounded shrink-0">
                                Full
                              </span>
                            ) : isSelected ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-black bg-purple-800 text-white rounded shrink-0">
                                Dipilih
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                      <label className="block text-xs font-bold text-purple-900">
                        Tentukan Hari & Jam Konsultasi Khusus:
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Sabtu, 15 Agustus 2026 jam 14:00 WIB"
                        value={customTimeInput}
                        onChange={(e) => {
                          setCustomTimeInput(e.target.value);
                          setSelectedTime(e.target.value);
                        }}
                        className="w-full p-2.5 rounded-xl border border-purple-300 bg-white text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#6C47FF]"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Form Data Diri Pasien */}
                <div className="p-4 bg-white border border-purple-100 rounded-2xl space-y-3 shadow-2xs">
                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#6C47FF]" />
                    3. Masukkan Data Diri Pasien
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Nama Lengkap Pasien *</label>
                      <input
                        type="text"
                        required
                        placeholder="Masukkan nama lengkap"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6C47FF] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Usia (Tahun) *</label>
                        <input
                          type="number"
                          required
                          min={12}
                          max={100}
                          placeholder="Usia (contoh: 24)"
                          value={patientAge}
                          onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6C47FF] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">No. WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          placeholder="08xxxxxxxxxx"
                          value={patientWhatsapp}
                          onChange={(e) => setPatientWhatsapp(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#6C47FF] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Complete Payment Section (QRIS, Bank Transfer, E-Wallet, Upload Bukti) */}
              <div className="space-y-5 md:sticky md:top-20">
                
                {/* 4. Payment Section Box */}
                <div className="p-4 bg-gradient-to-br from-purple-50 via-purple-50/50 to-teal-50/30 border border-purple-200 rounded-3xl space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#6C47FF]" />
                      4. Metode Pembayaran & Transfer
                    </h4>
                    <span className="text-xs font-black text-[#6C47FF] bg-white px-3 py-1 rounded-full border border-purple-200 shadow-2xs">
                      {formatRupiah(currentPrice)}
                    </span>
                  </div>

                  {/* QRIS Code & Bank Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-white p-3.5 rounded-2xl border border-purple-100">
                    {/* QRIS Code Box */}
                    <div className="text-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-600 mb-1">Scan QRIS (BCA, Mandiri, GoPay, OVO, Dana)</p>
                      <img
                        src={
                          selectedPsikolog.bankAccount?.qrisCodeUrl &&
                          selectedPsikolog.bankAccount.qrisCodeUrl.trim() !== '' &&
                          !selectedPsikolog.bankAccount.qrisCodeUrl.includes('QRIS-SAPAHATI')
                            ? selectedPsikolog.bankAccount.qrisCodeUrl
                            : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                `PEMBAYARAN KONSULTASI PSIKOLOG SAPAHATI\nBank: ${selectedPsikolog.bankAccount?.bankName || 'BCA'}\nNo. Rekening: ${selectedPsikolog.bankAccount?.accountNumber || ''}\nAtas Nama: ${selectedPsikolog.bankAccount?.accountHolder || ''}\nNominal: Rp ${currentPrice.toLocaleString('id-ID')}`
                              )}`
                        }
                        alt="QRIS Code"
                        className="w-32 h-32 mx-auto object-contain rounded-lg border border-slate-300 shadow-2xs"
                      />
                      <span className="text-[10px] text-[#6C47FF] font-bold mt-1.5 block">
                        No. Rek: {selectedPsikolog.bankAccount?.accountNumber || '-'} ({selectedPsikolog.bankAccount?.bankName || 'BCA'})
                      </span>
                    </div>

                    {/* Bank Transfer Info */}
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-500 text-[10px] font-bold">Transfer Bank Manual:</p>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                        <div>
                          <span className="text-slate-400 text-[9.5px] block">Bank Tujuan:</span>
                          <span className="font-black text-slate-900 text-xs">
                            {selectedPsikolog.bankAccount?.bankName || 'BCA'}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-slate-400 text-[9.5px] block">Nomor Rekening:</span>
                          <div className="flex items-center justify-between font-extrabold text-[#6C47FF] text-xs">
                            <span>{selectedPsikolog.bankAccount?.accountNumber || '1234567890'}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount(selectedPsikolog.bankAccount?.accountNumber || '1234567890')}
                              className="p-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-[#6C47FF] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[9.5px] block">Atas Nama:</span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {selectedPsikolog.bankAccount?.accountHolder || selectedPsikolog.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mode Selector for Submitting Payment Proof */}
                  <div className="space-y-3 pt-2 border-t border-purple-100">
                    <label className="block text-xs font-extrabold text-slate-800">
                      Pilih Metode Konfirmasi Bukti Pembayaran *
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setProofSubmissionMode('upload')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          proofSubmissionMode === 'upload'
                            ? 'bg-white text-[#6C47FF] shadow-xs border border-purple-200 font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>Mode 1: Unggah di Web</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProofSubmissionMode('whatsapp')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          proofSubmissionMode === 'whatsapp'
                            ? 'bg-[#00A884] text-white shadow-xs font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>Mode 2: Kirim via WA</span>
                      </button>
                    </div>

                    {/* Mode 1 Content: Web File Upload */}
                    {proofSubmissionMode === 'upload' && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="relative border-2 border-dashed border-purple-300 hover:border-[#6C47FF] bg-white rounded-2xl p-3.5 text-center transition-all cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            required={proofSubmissionMode === 'upload'}
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          {receiptDataUrl && receiptDataUrl.startsWith('data:image') ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="relative">
                                <img
                                  src={receiptDataUrl}
                                  alt="Preview Bukti Transfer"
                                  className="w-20 h-20 object-cover rounded-xl border border-purple-200 shadow-sm"
                                />
                                <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-purple-900 font-bold">
                                <FileCheck className="w-4 h-4 text-emerald-600" />
                                <span className="truncate max-w-[200px]">{receiptFileName}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">Klik untuk mengganti foto bukti</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs py-2">
                              <Upload className="w-4 h-4 text-[#6C47FF]" />
                              {receiptFileName ? (
                                <span className="font-bold text-purple-800 truncate">{receiptFileName}</span>
                              ) : (
                                <span>Pilih file / foto bukti transfer dari perangkat</span>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={!patientName || !patientWhatsapp || isSubmitting}
                          className="w-full py-3.5 bg-gradient-to-r from-[#6C47FF] to-[#5034D4] hover:opacity-95 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-md transition-all text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                        >
                          {isSubmitting ? (
                            <span>Memproses Pendaftaran...</span>
                          ) : (
                            <span>Kirim Pendaftaran & Unggah Bukti ({formatRupiah(currentPrice)})</span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Mode 2 Content: Direct WhatsApp Send */}
                    {proofSubmissionMode === 'whatsapp' && (
                      <div className="space-y-3 animate-fade-in bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80 text-left">
                        <div className="flex items-start gap-2 text-emerald-950 font-bold text-xs">
                          <MessageCircle className="w-4.5 h-4.5 text-[#00A884] shrink-0 fill-emerald-100 mt-0.5" />
                          <p className="leading-relaxed text-[11.5px]">
                            Setelah melakukan transfer, klik tombol di bawah untuk langsung mengirimkan konfirmasi pendaftaran beserta foto bukti pembayaran ke WhatsApp Admin Sapahati (<strong>{formattedWa}</strong>).
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            handleCreateBooking(e);
                            handleSendBuktiWa();
                          }}
                          disabled={!patientName || !patientWhatsapp || isSubmitting}
                          className="w-full py-3.5 px-4 bg-[#00A884] hover:bg-[#008f70] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-md transition-all text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                        >
                          <MessageCircle className="w-4.5 h-4.5 fill-white text-[#00A884]" />
                          <span>Kirim Pendaftaran via WA Admin ({formattedWa})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl text-[11px] text-slate-600 flex items-center gap-2 border border-purple-100">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Privasi dan seluruh sesi terlindungi 100% oleh kode etik psikolog.</span>
                  </div>
                </div>

              </div>
            </div>
          </form>
          )}
          </div>
        )}

        {/* Step 2: Success Confirmation */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm text-center space-y-5 animate-fade-in max-w-lg mx-auto my-6">
            
            {/* Download PDF Trigger Button (Fallback if auto download is blocked) */}
            <div className="flex justify-end">
              <button 
                onClick={downloadReceiptPDF}
                className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" /> Download Struk PDF
              </button>
            </div>

            {/* The area to be captured for PDF */}
            <div ref={receiptRef} className="bg-white p-2 rounded-xl space-y-5">
              {/* Logo specifically for the PDF receipt */}
              <div className="flex items-center justify-center gap-2 mb-4">
                 {(getCmsConfig().branding.logoImage || APP_IMAGES.logoImage) && (
                   <img 
                     src={getCmsConfig().branding.logoImage || APP_IMAGES.logoImage} 
                     alt="Sapa Hati Logo" 
                     className="h-8" 
                   />
                 )}
                 <span className="font-extrabold text-[#1D123B] text-xl tracking-tight">Sapa Hati</span>
              </div>

              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <span className={`px-3.5 py-1 rounded-full text-xs font-black border inline-block ${currentCreatedStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-orange-100 text-orange-800 border-orange-300'}`}>
                  {currentCreatedStatus === 'confirmed' ? 'Sesi Telah Dikonfirmasi' : 'Pendaftaran & Bukti Transfer Terkirim'}
                </span>
                <h2 className="text-xl font-black text-[#1D123B]">Sesi {currentCreatedStatus === 'confirmed' ? 'Di-ACC!' : 'Berhasil Dipesan!'}</h2>
                
                {/* Status Loading Menunggu Proses Admin atau Terkonfirmasi */}
                <div className={`border rounded-xl p-4 mt-4 mb-2 flex items-start gap-3 text-left ${currentCreatedStatus === 'confirmed' ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${currentCreatedStatus === 'confirmed' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                    {currentCreatedStatus === 'confirmed' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-orange-600 animate-pulse" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${currentCreatedStatus === 'confirmed' ? 'text-emerald-800' : 'text-orange-800'}`}>
                      {currentCreatedStatus === 'confirmed' ? 'Sesi Terkonfirmasi (ACC)' : 'Menunggu Proses (Pending)'}
                    </p>
                    <p className={`text-xs mt-0.5 ${currentCreatedStatus === 'confirmed' ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {currentCreatedStatus === 'confirmed' ? 'Admin telah menyetujui jadwal konsultasi ini. Psikolog siap.' : 'Sesi kamu sedang diproses oleh admin. Silakan tunggu konfirmasi melalui WhatsApp.'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Terima kasih! Jadwal konsultasimu bersama <strong>{selectedPsikolog?.name}</strong> untuk waktu <strong>{selectedTime}</strong> telah berhasil dicatat.
                </p>
              </div>

              {/* Summary details */}
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1.5 border-purple-100">
                  <span className="text-slate-500">Pasien:</span>
                  <span className="font-bold text-slate-900">{patientName} ({patientAge} th)</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-purple-100">
                  <span className="text-slate-500">No. WhatsApp:</span>
                  <span className="font-bold text-[#6C47FF]">{patientWhatsapp}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-purple-100">
                  <span className="text-slate-500">Metode Sesi:</span>
                  <span className="font-bold text-slate-900">
                    {METHODS_CONFIG.find((m) => m.id === selectedMethod)?.title}
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-bold">
                  <span className="text-slate-600">Total Biaya:</span>
                  <span className="text-[#6C47FF]">{formatRupiah(currentPrice)}</span>
                </div>
              </div>
            </div>

            {/* Prominent WhatsApp Admin Confirmation Box */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-left space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs sm:text-sm">
                <MessageCircle className="w-5 h-5 text-[#00A884] shrink-0 fill-emerald-100" />
                <span>Kirim Bukti Pembayaran ke WA Admin</span>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                Kirim pesan konfirmasi beserta foto bukti transfermu langsung ke WhatsApp Admin Sapahati (<strong>{formattedWa}</strong>) agar jadwalmu langsung diverifikasi.
              </p>
              <button
                type="button"
                onClick={handleSendBuktiWa}
                className="w-full py-3.5 px-4 rounded-xl bg-[#00A884] hover:bg-[#008f70] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <MessageCircle className="w-4.5 h-4.5 fill-white text-[#00A884]" />
                <span>Kirim Bukti Pembayaran via WA Admin ({formattedWa})</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 text-left">
              📱 Tim Sapahati &amp; Psikolog akan memverifikasi bukti transfer dan menghubungi WhatsApp <strong>{patientWhatsapp}</strong> mendekati waktu sesi.
            </p>

            <button
              onClick={() => {
                setStep(0);
                setSelectedPsikolog(null);
                setPatientName('');
                setPatientAge('');
                setPatientWhatsapp('');
                setReceiptFile(null);
                setReceiptDataUrl('');
                onBackToHome();
              }}
              className="w-full py-3.5 rounded-2xl bg-[#6C47FF] text-white text-xs font-bold cursor-pointer hover:bg-purple-700 transition-colors shadow-md"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}

      </main>

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onGoHome={onBackToHome}
        onStartCurhat={onStartCurhat}
        onOpenPsikolog={() => setStep(0)}
        onOpenDashboard={onOpenDashboard}
        onOpenJournal={onOpenJournal}
        onOpenMitra={onOpenMitra}
        onOpenPsikotes={onOpenPsikotes}
      />

      {/* Mobile Fixed Bottom Nav */}
      <MobileBottomNav
        activeTab="none"
        onGoHome={onBackToHome}
        onOpenMitra={onOpenMitra}
        onOpenJournal={onOpenJournal}
        onOpenPsikolog={() => setStep(0)}
        onStartCurhat={onStartCurhat}
        onOpenPsikotes={onOpenPsikotes}
        onOpenNav={onBackToHome}
      />
    </div>
  );
};
