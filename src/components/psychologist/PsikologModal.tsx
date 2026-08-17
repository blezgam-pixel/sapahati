import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Clock,
  CheckCircle2,
  Shield,
  MessageSquare,
  Video,
  MapPin,
  Sparkles,
  QrCode,
  Upload,
  User,
  Phone,
  Calendar,
  FileCheck,
  CreditCard,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { Psychologist, ConsultationMethod, BookingSession } from '../../types';
import { getPsychologists, getBookings, createBooking, subscribeStore } from '../../data/psychologistStore';
import { getPsychologistInitials } from '../../utils/initials';
import { getLoggedInUser } from '../../data/authStore';
import { sendTelegramNotification } from '../../services/telegramService';

interface PsikologModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_TIME_SLOTS = [
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
  badge: string;
}[] = [
  {
    id: 'chat',
    title: 'Sesi Chat Teks',
    icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
    desc: 'Diskusi privat via pesan teks fleksibel',
    badge: 'Paling Terjangkau',
  },
  {
    id: 'video',
    title: 'Video Call HD',
    icon: <Video className="w-4 h-4 text-teal-600" />,
    desc: 'Konsultasi tatap muka online dari mana saja',
    badge: 'Paling Populer',
  },
  {
    id: 'offline',
    title: 'Ketemu Langsung',
    icon: <MapPin className="w-4 h-4 text-amber-600" />,
    desc: 'Sesi tatap muka di Klinik Mitra Sapahati',
    badge: 'Interaksi Maksimal',
  },
];

const formatRupiah = (amount: number) => {
  return 'Rp ' + amount.toLocaleString('id-ID');
};

export const PsikologModal: React.FC<PsikologModalProps> = ({ isOpen, onClose }) => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [bookings, setBookings] = useState<BookingSession[]>([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('');
  const [selectedPsikolog, setSelectedPsikolog] = useState<Psychologist | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<ConsultationMethod>('video');
  const [selectedTime, setSelectedTime] = useState('19:00 WIB Hari Ini');
  const [isCustomTimeMode, setIsCustomTimeMode] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('');

  // Checkout step state: 0 = directory, 1 = form & QRIS payment, 2 = waiting confirmation
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Form Data Diri
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientWhatsapp, setPatientWhatsapp] = useState('');

  // Payment upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPsychologists(getPsychologists());
      setBookings(getBookings());
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = subscribeStore(() => {
      const freshPsychs = getPsychologists();
      setPsychologists(freshPsychs);
      setBookings(getBookings());
    });
    return () => unsubscribe();
  }, []);

  // Sync selectedPsikolog automatically if psychologist data is updated in real-time
  useEffect(() => {
    if (selectedPsikolog && psychologists.length > 0) {
      const updated = psychologists.find((p) => p.id === selectedPsikolog.id);
      if (updated && (
        updated.bankAccount.qrisCodeUrl !== selectedPsikolog.bankAccount.qrisCodeUrl ||
        updated.bankAccount.accountNumber !== selectedPsikolog.bankAccount.accountNumber ||
        updated.bankAccount.bankName !== selectedPsikolog.bankAccount.bankName ||
        updated.avatar !== selectedPsikolog.avatar ||
        updated.name !== selectedPsikolog.name
      )) {
        setSelectedPsikolog(updated);
      }
    }
  }, [psychologists, selectedPsikolog]);

  // Get active schedule slots for a specific psychologist
  const getPsychSlots = (psych: Psychologist) => {
    if (psych.scheduleSlots && psych.scheduleSlots.length > 0) {
      return psych.scheduleSlots;
    }
    return AVAILABLE_TIME_SLOTS;
  };

  // Check if a specific slot is booked for a psychologist
  const isSlotBooked = (psychId: string, time: string) => {
    return bookings.some(
      (b) => b.psychologistId === psychId && b.timeSlot === time && b.status !== 'cancelled'
    );
  };

  // Check if ALL available slots for a psychologist are booked
  const isPsychologistFull = (psychId: string) => {
    const target = psychologists.find((p) => p.id === psychId);
    if (!target) return false;
    const slots = getPsychSlots(target);
    return slots.every((time) => isSlotBooked(psychId, time));
  };

  // Collect all unique time slots across all psychologists
  const allAvailableTimeSlots = React.useMemo(() => {
    const slotsSet = new Set<string>();
    psychologists.forEach((p) => {
      const slots = getPsychSlots(p);
      slots.forEach((s) => slotsSet.add(s));
    });
    if (slotsSet.size === 0) {
      AVAILABLE_TIME_SLOTS.forEach((s) => slotsSet.add(s));
    }
    return Array.from(slotsSet);
  }, [psychologists, bookings]);

  // Set initial selected time filter if empty
  useEffect(() => {
    if (isOpen && !selectedTimeFilter && allAvailableTimeSlots.length > 0) {
      setSelectedTimeFilter(allAvailableTimeSlots[0]);
    }
  }, [isOpen, allAvailableTimeSlots, selectedTimeFilter]);

  const getPsychCountForSlot = (slot: string) => {
    if (slot === 'ALL') return psychologists.length;
    return psychologists.filter((p) => getPsychSlots(p).includes(slot)).length;
  };

  const getOpenPsychCountForSlot = (slot: string) => {
    if (slot === 'ALL') return psychologists.filter((p) => !isPsychologistFull(p.id)).length;
    return psychologists.filter((p) => getPsychSlots(p).includes(slot) && !isSlotBooked(p.id, slot)).length;
  };

  // Filter psychologists based on selected time slot
  const filteredPsychologists = React.useMemo(() => {
    if (!selectedTimeFilter || selectedTimeFilter === 'ALL') {
      return psychologists;
    }
    return psychologists.filter((p) => getPsychSlots(p).includes(selectedTimeFilter));
  }, [psychologists, selectedTimeFilter, bookings]);

  if (!isOpen) return null;

  const handleSelectPsikolog = (
    psych: Psychologist,
    method: ConsultationMethod = 'video',
    preferredTime?: string
  ) => {
    const allFresh = getPsychologists();
    const targetPsych = allFresh.find((p) => p.id === psych.id) || psych;
    setSelectedPsikolog(targetPsych);
    setSelectedMethod(method);

    const slots = getPsychSlots(targetPsych);

    // If preferredTime is provided and valid/available, use it
    if (
      preferredTime &&
      preferredTime !== 'ALL' &&
      slots.includes(preferredTime) &&
      !isSlotBooked(targetPsych.id, preferredTime)
    ) {
      setSelectedTime(preferredTime);
    } else {
      // Auto select first available open time slot
      const openSlot = slots.find((time) => !isSlotBooked(targetPsych.id, time));
      if (openSlot) {
        setSelectedTime(openSlot);
      } else if (slots.length > 0) {
        setSelectedTime(slots[0]);
      } else {
        setSelectedTime('19:00 WIB Hari Ini');
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

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPsikolog || !patientName.trim() || !patientAge || !patientWhatsapp.trim()) return;

    if (isSlotBooked(selectedPsikolog.id, selectedTime)) {
      alert('Jadwal ' + selectedTime + ' untuk ' + selectedPsikolog.name + ' sudah terisi oleh pasien lain. Silakan pilih jadwal lain yang masih tersedia.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Ambil data user yang sedang login
      const user = getLoggedInUser();
      const userEmail = user?.email || '';

      const created = await createBooking({
        patientName,
        patientAge: Number(patientAge),
        patientWhatsapp,
        psychologistId: selectedPsikolog.id,
        psychologistName: selectedPsikolog.name,
        method: selectedMethod,
        methodTitle: METHODS_CONFIG.find((m) => m.id === selectedMethod)?.title || 'Konsultasi',
        timeSlot: selectedTime,
        price: selectedPsikolog.prices[selectedMethod],
        paymentReceiptName: receiptFileName || 'Bukti_Transfer_QRIS.jpg',
        paymentReceiptUrl: receiptDataUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80',
        userId: user?.id,
        userEmail: userEmail,
      });
      setCreatedBookingId(created.id);

      // --- KIRIM NOTIFIKASI TELEGRAM KE ADMIN ---
      console.log('[PsikologModal] Mengirim notifikasi Telegram ke admin...');
      sendTelegramNotification(created)
        .then((ok) => console.log('[PsikologModal] ✅ Hasil kirim Telegram admin:', ok))
        .catch((err) => console.error('[PsikologModal] ❌ Error kirim Telegram admin:', err));
      // ----------------------------------------

      setStep(2);
    } catch (err) {
      console.error('Failed to create booking', err);
      alert('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setSelectedPsikolog(null);
    setPatientName('');
    setPatientAge('');
    setPatientWhatsapp('');
    setReceiptFile(null);
    setReceiptFileName('');
    setReceiptDataUrl('');
    onClose();
  };

  const currentPrice = selectedPsikolog ? selectedPsikolog.prices[selectedMethod] : 0;

  const activeBooking = bookings.find((b) => b.id === createdBookingId);
  const activeStatus = activeBooking ? activeBooking.status : 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-xl md:max-w-4xl lg:max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col transition-all">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold">Konsultasi Psikolog & Tarif</h3>
            <p className="text-xs text-teal-100 mt-0.5">
              Pendaftaran, data diri, & pembayaran QRIS langsung ke psikolog
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-[#FAF8FF]">
          
          {/* STEP 2: Waiting / Confirmation View */}
          {step === 2 ? (
            <div className="py-6 px-2 text-center space-y-5 animate-fade-in">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner ${
                  activeStatus === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600 animate-pulse'
                }`}
              >
                {activeStatus === 'confirmed' ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <Clock className="w-10 h-10" />
                )}
              </div>

              <div className="space-y-2">
                {activeStatus === 'confirmed' ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    JADWAL TELAH DI-ACC OLEH PSIKOLOG! 🎉
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-300 inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    Status: Menunggu Konfirmasi / ACC Psikolog
                  </span>
                )}
                
                {/* Notification Text */}
                <h4 className="text-base sm:text-lg font-bold text-slate-800 max-w-md mx-auto leading-relaxed pt-2">
                  {activeStatus === 'confirmed'
                    ? `Jadwal Anda telah disetujui! Psikolog ${selectedPsikolog?.name} siap melakukan sesi bersama Anda.`
                    : 'Tunggu sebentar ya biarkan psikolog mengkonfirmasi datamu dan menghubungimu sesuai pilihan paket dan sesi.'}
                </h4>
              </div>

              {/* Booking Summary Box */}
              <div className="bg-white p-4 rounded-2xl border border-teal-100 max-w-md mx-auto text-left space-y-2.5 text-xs shadow-2xs">
                <div className="flex justify-between border-b pb-2 border-slate-100">
                  <span className="text-slate-500">Nama Pasien:</span>
                  <span className="font-bold text-slate-900">{patientName} ({patientAge} th)</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-slate-100">
                  <span className="text-slate-500">No. WhatsApp Pasien:</span>
                  <span className="font-bold text-teal-700">{patientWhatsapp}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-slate-100">
                  <span className="text-slate-500">Psikolog Tujuan:</span>
                  <span className="font-bold text-slate-900">{selectedPsikolog?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-slate-100">
                  <span className="text-slate-500">Metode & Paket:</span>
                  <span className="font-bold text-purple-700">
                    {METHODS_CONFIG.find((m) => m.id === selectedMethod)?.title}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2 border-slate-100">
                  <span className="text-slate-500">Jadwal Sesi:</span>
                  <span className="font-bold text-slate-800">{selectedTime}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Total Tarif (QRIS):</span>
                  <span className="font-extrabold text-teal-700 text-sm">{formatRupiah(currentPrice)}</span>
                </div>
              </div>

              {/* WhatsApp & Confirmation Actions */}
              <div className="max-w-md mx-auto space-y-2.5">
                <button
                  type="button"
                  onClick={() => setBookings(getBookings())}
                  className="w-full py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold border border-teal-200 rounded-xl transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Cek / Refresh Status Konfirmasi ACC</span>
                </button>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-800 text-left max-w-md mx-auto flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Psikolog akan memverifikasi bukti pembayaranmu & menghubungi kontak WhatsApp <strong>{patientWhatsapp}</strong> dalam kurun waktu max 15-30 menit.
                </span>
              </div>

              <button
                onClick={handleReset}
                className="w-full max-w-md py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </div>
          ) : step === 1 && selectedPsikolog ? (
            /* STEP 1: Registration Form + Method + Schedule + Data Diri + QRIS Payment */
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Kembali ke daftar pilihan psikolog
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Left Column: Psikolog Summary + Methods + Schedule + Data Diri */}
                <div className="space-y-4">
                  {/* Selected Psychologist Summary */}
                  <div className="bg-white rounded-2xl p-4 border border-teal-100 flex items-center justify-between gap-3.5 shadow-2xs">
                    <div className="flex items-center gap-3.5">
                      {(selectedPsikolog.avatar || (selectedPsikolog as any).imageUrl) && (selectedPsikolog.avatar || (selectedPsikolog as any).imageUrl).trim() !== '' ? (
                        <img
                          src={selectedPsikolog.avatar || (selectedPsikolog as any).imageUrl}
                          alt={selectedPsikolog.name}
                          className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-xs border border-teal-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs border border-teal-200">
                          {getPsychologistInitials(selectedPsikolog.name)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900">{selectedPsikolog.name}</h4>
                        <p className="text-xs text-slate-500">{selectedPsikolog.title}</p>
                      </div>
                    </div>

                    {isPsychologistFull(selectedPsikolog.id) ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold border border-rose-200 shrink-0">
                        Jadwal Full
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200 shrink-0">
                        Jadwal Tersedia
                      </span>
                    )}
                  </div>

                  {/* Full Schedule Alert Box & Redirection Banner */}
                  {isPsychologistFull(selectedPsikolog.id) && (
                    <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl text-xs space-y-2.5 shadow-2xs animate-fade-in">
                      <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>Seluruh Sesi Jadwal Psikolog Ini Sudah Penuh</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Maaf, semua kuota jadwal untuk <strong>{selectedPsikolog.name}</strong> telah terisi oleh pasien lain. Silakan pilih psikolog mitra kami lainnya yang masih tersedia.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <User className="w-4 h-4" />
                        <span>Arahkan & Pilih Psikolog Lain</span>
                      </button>
                    </div>
                  )}

                  {/* 1. Method Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      1. Pilih Metode Konsultasi & Tarif
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {METHODS_CONFIG.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        const price = selectedPsikolog.prices[method.id];
                        return (
                          <button
                            type="button"
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'border-teal-600 bg-teal-50/70 text-slate-900 shadow-xs ring-1 ring-teal-500'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="p-1 rounded-lg bg-white border border-slate-100 shadow-2xs">
                                  {method.icon}
                                </span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                              </div>
                              <h5 className="font-bold text-xs text-slate-900">{method.title}</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{method.desc}</p>
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-slate-100">
                              <span className="text-xs font-extrabold text-teal-700">
                                {formatRupiah(price)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Schedule Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-800">
                        2. Pilih Jadwal Waktu Konsultasi
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomTimeMode(!isCustomTimeMode);
                          if (!isCustomTimeMode && customTimeInput) {
                            setSelectedTime(customTimeInput);
                          }
                        }}
                        className="text-xs text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                      >
                        {isCustomTimeMode ? '← Pilihan Slot' : '+ Jam Khusus'}
                      </button>
                    </div>

                    {!isCustomTimeMode ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
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
                                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                                  booked
                                    ? 'border-slate-200 bg-slate-100/90 text-slate-400 cursor-not-allowed opacity-85'
                                    : isSelected
                                    ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold shadow-2xs cursor-pointer'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Clock className={`w-3.5 h-3.5 shrink-0 ${booked ? 'text-slate-400' : 'text-teal-600'}`} />
                                  <span className={booked ? 'line-through text-slate-400' : ''}>{time}</span>
                                </div>
                                {booked ? (
                                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 rounded shrink-0">
                                    Full
                                  </span>
                                ) : isSelected ? (
                                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-teal-200/80 text-teal-900 rounded shrink-0">
                                    Dipilih
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1.5">
                          <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Sesi berstatus <strong>Full</strong> tidak dapat dipilih. Harap memilih sesi jam lain.</span>
                        </p>
                      </>
                    ) : (
                      <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
                        <label className="block text-xs font-bold text-teal-900">
                          Tentukan Hari, Tanggal & Jam Konsultasi yang Anda Inginkan:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Contoh: Sabtu, 15 Agustus 2026 jam 14:00 WIB"
                            value={customTimeInput}
                            onChange={(e) => {
                              setCustomTimeInput(e.target.value);
                              setSelectedTime(e.target.value);
                            }}
                            className="flex-1 p-2.5 rounded-xl border border-teal-300 bg-white text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <p className="text-[10px] text-slate-600">
                          Permintaan jadwal khusus ini akan langsung dikirimkan ke psikolog saat Anda menyelesaikan pendaftaran.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3. Form Data Diri */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-2xs">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <User className="w-4 h-4 text-teal-600" />
                      3. Masukkan Data Diri Anda
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap *</label>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan nama lengkap Anda"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Usia (Tahun) *</label>
                          <input
                            type="number"
                            required
                            min={12}
                            max={100}
                            placeholder="Contoh: 24"
                            value={patientAge}
                            onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Nomor WhatsApp *</label>
                          <input
                            type="tel"
                            required
                            placeholder="08xxxxxxxxxx"
                            value={patientWhatsapp}
                            onChange={(e) => setPatientWhatsapp(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: QRIS Payment + Actions */}
                <div className="space-y-4 md:sticky md:top-0">
                  {/* 4. QRIS Payment & Transfer Section */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-teal-50 border border-purple-200/80 rounded-2xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-purple-600" />
                        4. Pembayaran via QRIS / Transfer
                      </h4>
                      <span className="text-[11px] font-black text-teal-800 bg-white px-2.5 py-1 rounded-full border border-teal-200">
                        {formatRupiah(currentPrice)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-white p-3 rounded-xl border border-purple-100">
                      {/* QRIS Code Box */}
                      <div className="text-center p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 mb-1">Pindai QRIS Semua Bank & E-Wallet</p>
                        <img
                          src={
                            selectedPsikolog.bankAccount.qrisCodeUrl &&
                            selectedPsikolog.bankAccount.qrisCodeUrl.trim() !== '' &&
                            !selectedPsikolog.bankAccount.qrisCodeUrl.includes('QRIS-SAPAHATI')
                              ? selectedPsikolog.bankAccount.qrisCodeUrl
                              : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                  `PEMBAYARAN KONSULTASI PSIKOLOG\nBank: ${selectedPsikolog.bankAccount.bankName}\nNo. Rekening: ${selectedPsikolog.bankAccount.accountNumber}\nAtas Nama: ${selectedPsikolog.bankAccount.accountHolder}\nNominal Sesi: Rp ${currentPrice.toLocaleString('id-ID')}`
                                )}`
                          }
                          alt="QRIS Code"
                          className="w-32 h-32 mx-auto object-contain rounded-lg border border-slate-300 shadow-2xs"
                        />
                        <span className="text-[10px] text-teal-700 font-bold mt-1 block">
                          No. Rek: {selectedPsikolog.bankAccount.accountNumber} ({selectedPsikolog.bankAccount.bankName})
                        </span>
                      </div>

                      {/* Bank Account Info */}
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-500 text-[10px]">Atau Transfer Manual Rekening Psikolog:</p>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                          <div className="text-slate-500 text-[10px]">Bank Tujuan:</div>
                          <div className="font-black text-slate-900 text-xs">{selectedPsikolog.bankAccount.bankName}</div>
                          
                          <div className="text-slate-500 text-[10px] mt-1">Nomor Rekening:</div>
                          <div className="flex items-center justify-between font-extrabold text-teal-800 text-xs">
                            <span>{selectedPsikolog.bankAccount.accountNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount(selectedPsikolog.bankAccount.accountNumber)}
                              className="p-1 rounded bg-teal-100 hover:bg-teal-200 text-teal-800 text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                            </button>
                          </div>

                          <div className="text-slate-500 text-[10px] mt-1">Atas Nama:</div>
                          <div className="font-bold text-slate-800 text-[11px]">{selectedPsikolog.bankAccount.accountHolder}</div>
                        </div>
                      </div>
                    </div>

                    {/* Upload Bukti Pembayaran */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        Unggah Bukti Pembayaran (Transfer / QRIS) *
                      </label>
                      
                      <div className="relative border-2 border-dashed border-purple-300 hover:border-purple-500 bg-white rounded-2xl p-3 text-center transition-all cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          required
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        {receiptDataUrl && receiptDataUrl.startsWith('data:image') ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="relative group">
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
                            <span className="text-[10px] text-slate-400">Klik area ini untuk mengganti foto bukti</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-slate-600 text-xs py-2">
                            <Upload className="w-4 h-4 text-purple-600" />
                            {receiptFileName ? (
                              <span className="font-bold text-purple-800 truncate">{receiptFileName}</span>
                            ) : (
                              <span>Pilih file / foto bukti transfer</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Seluruh pembicaraan bersifat rahasia dan terlindungi oleh kode etik psikologi.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Memproses Pendaftaran...</span>
                    ) : (
                      <span>Kirim Pendaftaran & Bukti Transfer ({formatRupiah(currentPrice)})</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* STEP 0: Schedule Time Selection FIRST -> Filtered Psychologist Directory View */
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 flex items-center gap-2.5 text-xs text-teal-800 font-medium">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Pilih jadwal waktu konsultasi yang Anda inginkan untuk melihat psikolog mitra yang siap melayani.</span>
              </div>

              {/* 1. SELEKSI JADWAL WAKTU */}
              <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      1. Pilih Waktu Konsultasi
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {allAvailableTimeSlots.length} Pilihan Sesi Jam
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Option for "Semua Jadwal" */}
                  <button
                    type="button"
                    onClick={() => setSelectedTimeFilter('ALL')}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedTimeFilter === 'ALL'
                        ? 'border-teal-600 bg-teal-600 text-white font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-teal-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>Semua Jadwal Waktu</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold ${
                      selectedTimeFilter === 'ALL' ? 'bg-teal-700 text-teal-50' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {psychologists.length} Psikolog
                    </span>
                  </button>

                  {/* Dynamic Schedule Time Slots */}
                  {allAvailableTimeSlots.map((slot) => {
                    const isSelected = selectedTimeFilter === slot;
                    const openCount = getOpenPsychCountForSlot(slot);

                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedTimeFilter(slot)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-600 text-white font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-teal-50/50 hover:border-teal-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-teal-600'}`} />
                          <span>{slot}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-md font-extrabold ${
                            isSelected
                              ? 'bg-teal-700 text-teal-50'
                              : openCount > 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {openCount > 0 ? `${openCount} Tersedia` : 'Penuh'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. DAFTAR PSIKOLOG TERSEDIA DI JADWAL TERSEBUT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-teal-600" />
                    <span>
                      2. Pilih Psikolog Mitra{' '}
                      {selectedTimeFilter && selectedTimeFilter !== 'ALL' ? (
                        <span className="text-teal-700 font-extrabold">({selectedTimeFilter})</span>
                      ) : (
                        '(Semua Jadwal)'
                      )}
                    </span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {filteredPsychologists.length} Psikolog Ditemukan
                  </span>
                </div>

                {filteredPsychologists.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Psikolog di Jadwal Ini</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Belum ada psikolog yang membuka jadwal waktu <strong>{selectedTimeFilter}</strong>. Silakan pilih jadwal waktu lain di atas.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    {filteredPsychologists.map((psych) => {
                      const isSlotAvailable = selectedTimeFilter && selectedTimeFilter !== 'ALL'
                        ? !isSlotBooked(psych.id, selectedTimeFilter)
                        : !isPsychologistFull(psych.id);

                      return (
                        <div
                          key={psych.id}
                          className={`bg-white p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                            isSlotAvailable
                              ? 'border-slate-200/80 shadow-2xs hover:shadow-md'
                              : 'border-slate-200 bg-slate-50/50 opacity-90'
                          }`}
                        >
                        {/* Top Info */}
                        <div className="flex items-start gap-3.5">
                          {(psych.avatar || (psych as any).imageUrl) && (psych.avatar || (psych as any).imageUrl).trim() !== '' ? (
                            <img
                              src={psych.avatar || (psych as any).imageUrl}
                              alt={psych.name}
                              className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-xs border border-teal-200"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs border border-teal-200">
                              {getPsychologistInitials(psych.name)}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base">{psych.name}</h4>
                              {isSlotAvailable ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200 shrink-0">
                                  Tersedia {selectedTimeFilter && selectedTimeFilter !== 'ALL' ? selectedTimeFilter : 'Sesi'}
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold border border-rose-200 shrink-0">
                                  Jadwal Full
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{psych.title}</p>

                            <div className="flex flex-wrap gap-1">
                              {psych.specialties.map((spec, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-semibold">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Method & Rate Table Options */}
                        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 space-y-2">
                          <span className="text-[11px] font-bold text-slate-600 block">
                            Pilihan Metode Konsultasi & Tarif:
                          </span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectPsikolog(psych, 'chat', selectedTimeFilter)}
                              className="p-2 bg-white hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                                <span className="font-semibold text-slate-700 group-hover:text-purple-700">Chat</span>
                              </div>
                              <span className="font-bold text-purple-700 text-[11px]">
                                {formatRupiah(psych.prices.chat)}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectPsikolog(psych, 'video', selectedTimeFilter)}
                              className="p-2 bg-white hover:bg-teal-50 hover:border-teal-300 border border-slate-200 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5 text-teal-600" />
                                <span className="font-semibold text-slate-700 group-hover:text-teal-700">Video Call</span>
                              </div>
                              <span className="font-bold text-teal-700 text-[11px]">
                                {formatRupiah(psych.prices.video)}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectPsikolog(psych, 'offline', selectedTimeFilter)}
                              className="p-2 bg-white hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                <span className="font-semibold text-slate-700 group-hover:text-amber-700">Tatap Muka</span>
                              </div>
                              <span className="font-bold text-amber-700 text-[11px]">
                                {formatRupiah(psych.prices.offline)}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Main Action CTA */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-500">Mulai dari <strong className="text-slate-800">{formatRupiah(psych.prices.chat)}</strong></span>
                          
                          {!isSlotAvailable ? (
                            <button
                              type="button"
                              onClick={() => handleSelectPsikolog(psych, 'video', selectedTimeFilter)}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl transition-all border border-rose-200 shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Jadwal Full (Lihat)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectPsikolog(psych, 'video', selectedTimeFilter)}
                              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <span>Pilih & Daftar</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
