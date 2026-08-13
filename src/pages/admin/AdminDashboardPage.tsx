import React, { useState, useEffect } from 'react';
import { GoogleSheetsSyncBar } from '../../components/admin/GoogleSheetsSyncBar';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Phone,
  User,
  Clock,
  CreditCard,
  MessageSquare,
  Video,
  MapPin,
  Trash2,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  ExternalLink,
  RefreshCw,
  Eye,
  Check,
  X,
  AlertCircle,
  Menu,
  KeyRound,
  QrCode,
  Sparkles,
  Upload,
  Edit,
  Image as ImageIcon
} from 'lucide-react';
import {
  getPsychologists,
  savePsychologist,
  updatePsychologist,
  deletePsychologist,
  updatePsychologistSchedules,
  getBookings,
  updateBookingStatus,
  deleteBooking,
  clearAllBookings,
  subscribeStore,
  syncWithGoogleSheetsNow,
} from '../../data/psychologistStore';
import { BookingSession, Psychologist, ConsultationMethod } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import { getPsychologistInitials } from '../../utils/initials';
import { CmsAdminTab } from '../../components/admin/CmsAdminTab';
import { verifyAdminLoginInServer } from '../../services/googleSheets';

interface AdminDashboardPageProps {
  onBackToMainApp: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBackToMainApp }) => {
  // Admin Auth State
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    return sessionStorage.getItem('sapahati_admin_authed') === 'true';
  });

  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Tabs & Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'add_psychologist' | 'directory' | 'schedules' | 'cms'>('sessions');
  const [bookings, setBookings] = useState<BookingSession[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('pending');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; name: string; patientName: string } | null>(null);

  // Form state for adding new psychologist
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newExp, setNewExp] = useState(5);
  const [newSpecialties, setNewSpecialties] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [priceChat, setPriceChat] = useState(75000);
  const [priceVideo, setPriceVideo] = useState(150000);
  const [priceOffline, setPriceOffline] = useState(250000);
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [qrisUrl, setQrisUrl] = useState('');
  const [newScheduleSlotsText, setNewScheduleSlotsText] = useState('');

  // Editing psychologist modal state
  const [editingPsychologist, setEditingPsychologist] = useState<Psychologist | null>(null);

  // Input state for schedule slot additions
  const [slotInputs, setSlotInputs] = useState<{ [psychId: string]: string }>({});
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    setBookings(getBookings());
    setPsychologists(getPsychologists());

    const unsubscribe = subscribeStore(() => {
      setBookings(getBookings());
      setPsychologists(getPsychologists());
    });
    return () => unsubscribe();
  }, []);

  // Handle Admin Login submit against Google Sheets Admin Users sheet
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) return;

    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await verifyAdminLoginInServer(emailInput, passwordInput);
      if (res.success) {
        sessionStorage.setItem('sapahati_admin_authed', 'true');
        if (res.admin?.email) {
          sessionStorage.setItem('sapahati_admin_email', res.admin.email);
        }
        setIsAuthed(true);
        setLoginError('');
      } else {
        setLoginError(res.message || 'Email atau Password Salah.');
      }
    } catch (err: any) {
      setLoginError('Gagal menghubungi server untuk memverifikasi login. Silakan coba lagi.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickDemoLogin = () => {
    sessionStorage.setItem('sapahati_admin_authed', 'true');
    setIsAuthed(true);
    setLoginError('');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('sapahati_admin_authed');
    setIsAuthed(false);
  };

  // Delete Confirmation Modal State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    id: string;
    name: string;
    type: 'single_session' | 'all_sessions' | 'psychologist';
  } | null>(null);

  // Status Handlers
  const handleUpdateStatus = (bookingId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    updateBookingStatus(bookingId, status);
  };

  const handleDeleteSingleBooking = (bookingId: string, patientName: string) => {
    setDeleteConfirmTarget({
      id: bookingId,
      name: patientName,
      type: 'single_session',
    });
  };

  const handleClearAllSessions = () => {
    setDeleteConfirmTarget({
      id: 'all',
      name: 'Semua Sesi Pasien',
      type: 'all_sessions',
    });
  };

  const handleDeletePsychologist = (id: string, name: string) => {
    setDeleteConfirmTarget({
      id,
      name,
      type: 'psychologist',
    });
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === 'single_session') {
      deleteBooking(deleteConfirmTarget.id);
      setBookings(getBookings());
    } else if (deleteConfirmTarget.type === 'all_sessions') {
      clearAllBookings();
      setBookings(getBookings());
    } else if (deleteConfirmTarget.type === 'psychologist') {
      deletePsychologist(deleteConfirmTarget.id);
      setPsychologists(getPsychologists());
    }

    setDeleteConfirmTarget(null);
  };

  const getWaLinkToPsychologist = (booking: BookingSession) => {
    const targetPsych = psychologists.find((p) => p.id === booking.psychologistId || p.name === booking.psychologistName);
    const psychWa = targetPsych?.whatsapp || '081298765432';
    let cleaned = psychWa.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    const msg = `Halo ${booking.psychologistName}, terdapat pendaftaran pasien baru di Sapahati:\n\n- Nama Pasien: ${booking.patientName} (${booking.patientAge} Tahun)\n- WA Pasien: ${booking.patientWhatsapp}\n- Paket Sesi: ${booking.methodTitle}\n- Slot Jadwal: ${booking.timeSlot}\n\nMohon untuk menghubungi pasien tersebut untuk pelaksanaan konsultasi. Terima kasih!`;
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`;
  };

  const getWaLinkToPatient = (booking: BookingSession) => {
    let cleaned = booking.patientWhatsapp.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    const msg = `Halo Kak ${booking.patientName}, terima kasih telah mendaftar sesi konsultasi di Sapahati dengan ${booking.psychologistName} (${booking.timeSlot}). Pembayaran dan jadwal Kakak telah terkonfirmasi. Silakan balas pesan ini jika ada pertanyaan. Terima kasih!`;
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`;
  };

  const handleAddPsychologistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTitle.trim()) return;

    const specs = newSpecialties
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const initialSlots = newScheduleSlotsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    savePsychologist({
      name: newName,
      title: newTitle,
      experienceYears: Number(newExp) || 3,
      rating: 5.0,
      reviewCount: 1,
      avatar: newAvatar.trim(),
      specialties: specs.length > 0 ? specs : ['Konseling Umum'],
      prices: {
        chat: Number(priceChat) || 75000,
        video: Number(priceVideo) || 150000,
        offline: Number(priceOffline) || 250000,
      },
      bankAccount: {
        bankName: bankName || 'BCA',
        accountNumber: accountNumber || '1234567890',
        accountHolder: accountHolder || newName,
        qrisCodeUrl: qrisUrl.trim(),
      },
      whatsapp: newWhatsapp.trim(),
      scheduleSlots: initialSlots,
      available: true,
    });

    setFormSuccess(`Psikolog ${newName} berhasil ditambahkan!`);
    setTimeout(() => {
      setFormSuccess('');
      setActiveTab('directory');
      setNewName('');
      setNewTitle('');
      setNewWhatsapp('');
      setNewSpecialties('');
      setNewAvatar('');
      setAccountNumber('');
      setAccountHolder('');
      setQrisUrl('');
      setNewScheduleSlotsText('');
    }, 1200);
  };

  const handleAddSlotToPsychologist = (psychId: string) => {
    const val = (slotInputs[psychId] || '').trim();
    if (!val) return;

    const targetPsych = psychologists.find((p) => p.id === psychId);
    if (!targetPsych) return;

    const currentSlots = targetPsych.scheduleSlots || [];
    if (currentSlots.includes(val)) {
      alert('Slot jadwal ini sudah ada.');
      return;
    }

    const updated = [...currentSlots, val];
    updatePsychologistSchedules(psychId, updated);
    setSlotInputs((prev) => ({ ...prev, [psychId]: '' }));
    setPsychologists(getPsychologists());
  };

  const handleRemoveSlotFromPsychologist = (psychId: string, slotToRemove: string) => {
    const targetPsych = psychologists.find((p) => p.id === psychId);
    if (!targetPsych) return;

    const currentSlots = targetPsych.scheduleSlots || [];
    const updated = currentSlots.filter((s) => s !== slotToRemove);
    updatePsychologistSchedules(psychId, updated);
    setPsychologists(getPsychologists());
  };

  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  const getMethodIcon = (m: ConsultationMethod) => {
    if (m === 'chat') return <MessageSquare className="w-3.5 h-3.5 text-purple-600" />;
    if (m === 'video') return <Video className="w-3.5 h-3.5 text-teal-600" />;
    return <MapPin className="w-3.5 h-3.5 text-amber-600" />;
  };

  // IF NOT AUTHENTICATED -> RENDER LOGIN SCREEN
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#120B2E] text-white font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between selection:bg-purple-500 selection:text-white">
        
        {/* Top Navbar */}
        <header className="p-4 sm:p-6 border-b border-[#2A1859] bg-[#1A0E40]/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C47FF] to-[#A78BFA] p-2 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  Sapahati Admin Portal
                </h1>
                <p className="text-xs text-purple-200/70 font-medium">
                  Portal khusus Psikolog, Admin, & Manajemen
                </p>
              </div>
            </div>

            <button
              onClick={onBackToMainApp}
              className="px-4 py-2 rounded-xl bg-[#241748] hover:bg-[#2D1C59] text-purple-100 text-xs font-bold border border-[#3B2580] flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-purple-300" />
              <span>Kembali ke Website Utama</span>
            </button>
          </div>
        </header>

        {/* Central Login Card */}
        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md bg-[#1A0E42] border border-[#2E1D66] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6C47FF]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 mb-1">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Login Admin & Psikolog</h2>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">Email Admin</label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Masukkan email admin"
                  className="w-full px-4 py-3 rounded-2xl bg-[#0E0726] border border-[#2E1D66] text-white text-sm focus:outline-hidden focus:border-[#6C47FF] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 rounded-2xl bg-[#0E0726] border border-[#2E1D66] text-white text-sm focus:outline-hidden focus:border-[#6C47FF] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6C47FF] to-[#8B5CF6] hover:from-[#5835FF] hover:to-[#7C3AED] disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <span>Masuk ke Dashboard Admin</span>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="p-4 text-center text-xs text-purple-300/60 border-t border-[#241652]">
          Sapahati Dashboard Admin & Psikolog © {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // IF AUTHENTICATED -> RENDER STANDALONE DASHBOARD WITH PROFESSIONAL SIDEBAR
  return (
    <div className="h-screen w-full bg-[#FAF8FF] text-[#1D123B] font-['Plus_Jakarta_Sans',sans-serif] flex overflow-hidden">
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-[#0A061B]/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* 1. PROFESSIONAL SIDEBAR NAVIGATION (FIXED ON DESKTOP) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-72 bg-[#120B2E] text-white flex flex-col justify-between border-r border-[#261754] shadow-2xl transition-transform duration-300 ease-in-out shrink-0 h-full ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-4 sm:p-5 border-b border-[#261754] flex items-center justify-between shrink-0 bg-[#0B061D]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#6C47FF] to-[#8B5CF6] text-white font-black shadow-md shadow-purple-500/25 shrink-0">
              <UserCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-white tracking-tight">Sapahati Admin</h2>
                <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black text-[9px] uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-purple-200/60 font-medium">
                Portal Psikolog & Manajemen
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl bg-[#22144B] text-purple-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Menu Links */}
        <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-purple-300/60">
            Navigasi Utama
          </div>

          {/* 1. Kelola Sesi */}
          <button
            onClick={() => {
              setActiveTab('sessions');
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'sessions'
                ? 'bg-gradient-to-r from-[#6C47FF] to-[#8B5CF6] text-white font-black shadow-lg shadow-purple-900/40'
                : 'text-purple-200/80 hover:bg-[#22144B] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Sesi & Bukti Bayar</span>
            </div>
            {bookings.filter((b) => b.status === 'pending').length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse ${
                activeTab === 'sessions' ? 'bg-[#120B2E] text-amber-300' : 'bg-amber-500 text-slate-950'
              }`}>
                {bookings.filter((b) => b.status === 'pending').length}
              </span>
            )}
          </button>

          {/* 2. Tambah Psikolog */}
          <button
            onClick={() => {
              setActiveTab('add_psychologist');
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'add_psychologist'
                ? 'bg-gradient-to-r from-[#6C47FF] to-[#8B5CF6] text-white font-black shadow-lg shadow-purple-900/40'
                : 'text-purple-200/80 hover:bg-[#22144B] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle className={`w-4 h-4 shrink-0 ${activeTab === 'add_psychologist' ? 'text-white' : 'text-purple-400'}`} />
              <span>Tambah Psikolog</span>
            </div>
          </button>

          {/* 3. Direktori Psikolog */}
          <button
            onClick={() => {
              setActiveTab('directory');
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-gradient-to-r from-[#6C47FF] to-[#8B5CF6] text-white font-black shadow-lg shadow-purple-900/40'
                : 'text-purple-200/80 hover:bg-[#22144B] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 shrink-0" />
              <span>Direktori Psikolog</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'directory' ? 'bg-[#120B2E] text-white' : 'bg-[#22144B] text-purple-300'
            }`}>
              {psychologists.length}
            </span>
          </button>

          {/* 4. Slot Jadwal Praktik */}
          <button
            onClick={() => {
              setActiveTab('schedules');
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'schedules'
                ? 'bg-gradient-to-r from-[#6C47FF] to-[#8B5CF6] text-white font-black shadow-lg shadow-purple-900/40'
                : 'text-purple-200/80 hover:bg-[#22144B] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Jadwal Praktik</span>
            </div>
          </button>

          {/* 5. Pengaturan Tampilan & CMS Spreadsheet */}
          <button
            onClick={() => {
              setActiveTab('cms');
              setIsSidebarOpen(false);
            }}
            className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'cms'
                ? 'bg-gradient-to-r from-[#6C47FF] to-[#8B5CF6] text-white font-black shadow-lg shadow-purple-900/40'
                : 'text-purple-200/80 hover:bg-[#22144B] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Pengaturan Tampilan (CMS)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 uppercase">
              NEW
            </span>
          </button>
        </div>

        {/* Sidebar Footer / User Profile & Logout Actions */}
        <div className="p-3.5 border-t border-[#261754] space-y-2.5 bg-[#0B061D] shrink-0">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1C1145] border border-[#2E1B6B]">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">Admin Sapahati</p>
              <p className="text-[10px] text-purple-300 truncate font-semibold">Online • Verified</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onBackToMainApp}
              className="py-2 px-2.5 rounded-xl bg-[#22144B] hover:bg-[#2B1A5E] text-purple-100 text-xs font-bold border border-[#38227B] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Kembali ke Website Pasien"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Website</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="py-2 px-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Keluar dari Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F8FAFC]">
        
        {/* FIXED TOP HEADER & STATS CONTAINER */}
        <div className="shrink-0 z-20 bg-white border-b border-slate-200/80 shadow-2xs">
          
          {/* Realtime Google Sheets Sync Bar */}
          <GoogleSheetsSyncBar />

          {/* TOP HEADER BAR */}
          <header className="px-4 sm:px-6 py-3 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto w-full">
              
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile & Tablet Sidebar Toggle Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  aria-label="Buka Menu Sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {activeTab === 'sessions' && 'Kelola Sesi & Bukti Transfer Pasien'}
                    {activeTab === 'add_psychologist' && 'Tambah Psikolog Mitra Baru'}
                    {activeTab === 'directory' && 'Direktori & Profil Psikolog'}
                    {activeTab === 'schedules' && 'Kelola Slot Jadwal Praktik'}
                  </h1>
                  <p className="text-[11px] text-slate-500 truncate hidden xs:block font-medium">
                    Dashboard Manajemen Konsultasi Kesehatan Mental Sapahati
                  </p>
                </div>
              </div>



            </div>
          </header>

          {/* QUICK STATS METRICS (FIXED AT TOP) */}
          <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 bg-[#F8FAFC]/60">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500">Menunggu ACC</p>
                  <p className="text-lg sm:text-2xl font-black text-amber-600">
                    {bookings.filter((b) => b.status === 'pending').length}
                  </p>
                </div>
                <div className="p-2.5 sm:p-3 bg-amber-50 rounded-xl sm:rounded-2xl text-amber-600 shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500">Terkonfirmasi</p>
                  <p className="text-lg sm:text-2xl font-black text-emerald-600">
                    {bookings.filter((b) => b.status === 'confirmed').length}
                  </p>
                </div>
                <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-xl sm:rounded-2xl text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500">Total Sesi</p>
                  <p className="text-lg sm:text-2xl font-black text-purple-600">
                    {bookings.length}
                  </p>
                </div>
                <div className="p-2.5 sm:p-3 bg-purple-50 rounded-xl sm:rounded-2xl text-purple-600 shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500">Psikolog Aktif</p>
                  <p className="text-lg sm:text-2xl font-black text-teal-600">
                    {psychologists.length}
                  </p>
                </div>
                <div className="p-2.5 sm:p-3 bg-teal-50 rounded-xl sm:rounded-2xl text-teal-600 shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* SCROLLABLE MAIN TAB CONTENT BODY */}
        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          
          {/* TAB 1: SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(['pending', 'confirmed', 'completed', 'cancelled', 'all'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'pending' && 'Menunggu ACC'}
                      {st === 'confirmed' && 'Terkonfirmasi'}
                      {st === 'completed' && 'Selesai'}
                      {st === 'cancelled' && 'Dibatalkan'}
                      {st === 'all' && 'Semua Sesi'}
                    </button>
                  ))}
                </div>

                {bookings.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllSessions}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer self-end sm:self-auto border border-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua Sesi</span>
                  </button>
                )}
              </div>

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">Tidak ada pendaftaran sesi</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Belum ada transaksi pendaftaran pasien dalam kategori status ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        
                        {/* Top Header */}
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                              ID: {b.id.slice(-8)}
                            </span>
                            <h4 className="text-base font-bold text-slate-900">{b.patientName} ({b.patientAge} th)</h4>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 shrink-0 ${
                              b.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : b.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : b.status === 'completed'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {b.status === 'pending' && 'Menunggu ACC'}
                            {b.status === 'confirmed' && 'Terkonfirmasi'}
                            {b.status === 'completed' && 'Selesai'}
                            {b.status === 'cancelled' && 'Dibatalkan'}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50 p-2.5 rounded-xl space-y-0.5">
                            <span className="text-slate-400 font-medium block text-[10px]">Psikolog Mitra</span>
                            <span className="font-bold text-slate-800 truncate block">{b.psychologistName}</span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl space-y-0.5">
                            <span className="text-slate-400 font-medium block text-[10px]">Sesi / Metode</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                              {getMethodIcon(b.method)}
                              <span className="truncate">{b.methodTitle}</span>
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl space-y-0.5">
                            <span className="text-slate-400 font-medium block text-[10px]">Slot Jadwal</span>
                            <span className="font-bold text-slate-800 truncate block">{b.timeSlot}</span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl space-y-0.5">
                            <span className="text-slate-400 font-medium block text-[10px]">Total Bayar</span>
                            <span className="font-extrabold text-teal-700 block">{formatRupiah(b.price)}</span>
                          </div>
                        </div>

                        {/* Receipt file preview */}
                        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-purple-50/80 border border-purple-100 text-xs">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {b.paymentReceiptUrl ? (
                              <img
                                src={b.paymentReceiptUrl}
                                alt="Bukti Transfer"
                                className="w-9 h-9 object-cover rounded-lg border border-purple-200 shrink-0 bg-white shadow-2xs"
                              />
                            ) : (
                              <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
                            )}
                            <div className="overflow-hidden">
                              <span className="text-slate-400 text-[10px] block leading-tight">Bukti Transfer Pasien</span>
                              <span className="text-purple-950 font-bold truncate block">
                                {b.paymentReceiptName || 'Bukti_Transfer.jpg'}
                              </span>
                            </div>
                          </div>
                          {b.paymentReceiptUrl && (
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt({
                                url: b.paymentReceiptUrl!,
                                name: b.paymentReceiptName || 'Bukti_Transfer.jpg',
                                patientName: b.patientName,
                              })}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer ml-1 transition-all shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Bukti</span>
                            </button>
                          )}
                        </div>

                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                          {b.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>ACC Sesi</span>
                            </button>
                          )}

                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'completed')}
                              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <Check className="w-4 h-4" />
                              <span>Selesai</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Batal</span>
                          </button>

                          <button
                            onClick={() => handleDeleteSingleBooking(b.id, b.patientName)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Hapus record sesi ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* WhatsApp links */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <a
                            href={getWaLinkToPsychologist(b)}
                            target="_blank"
                            rel="noreferrer"
                            className="py-1.5 px-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl flex items-center justify-center gap-1.5 text-center transition-all truncate border border-teal-100"
                          >
                            <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate">WA Psikolog</span>
                          </a>
                          <a
                            href={getWaLinkToPatient(b)}
                            target="_blank"
                            rel="noreferrer"
                            className="py-1.5 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl flex items-center justify-center gap-1.5 text-center transition-all truncate border border-purple-100"
                          >
                            <Phone className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="truncate">WA Pasien</span>
                          </a>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD PSYCHOLOGIST */}
          {activeTab === 'add_psychologist' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 max-w-3xl mx-auto shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  Tambah Profil Psikolog Mitra Baru
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Isi data lengkap psikolog mitra yang akan ditampilkan pada daftar konsultasi pasien.
                </p>
              </div>

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddPsychologistSubmit} className="space-y-5 text-xs">
                
                {/* 1. Informasi Diri */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>1. Informasi Diri Psikolog</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                      <input
                        type="text"
                        placeholder="Contoh: Maya Kartika, M.Psi., Psikolog"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-xs font-medium bg-slate-50/50 focus:bg-white transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Spesialisasi Utama / Title</label>
                      <input
                        type="text"
                        placeholder="Contoh: Psikolog Klinis Dewasa"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-xs font-medium bg-slate-50/50 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Psikolog</label>
                      <input
                        type="text"
                        placeholder="Contoh: 081234567890"
                        value={newWhatsapp}
                        onChange={(e) => setNewWhatsapp(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-xs font-medium bg-slate-50/50 focus:bg-white transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pengalaman (Tahun)</label>
                      <input
                        type="number"
                        value={newExp}
                        onChange={(e) => setNewExp(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-xs font-medium bg-slate-50/50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Daftar Keahlian Spesialisasi (Dipisah koma)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kecemasan, Depresi, Masalah Relasi, Stress Kerja"
                      value={newSpecialties}
                      onChange={(e) => setNewSpecialties(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-xs font-medium bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Foto Profil Psikolog */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-800 text-xs">Foto Profil Psikolog (Opsional)</label>
                      <span className="text-[10px] text-slate-500">Jika dikosongkan, hanya inisial nama yang akan ditampilkan</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">1. Unggah Foto (HP/Laptop)</label>
                        <div className="relative border-2 border-dashed border-teal-200 hover:border-teal-400 bg-white rounded-xl p-2.5 text-center transition-all cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressImageFile(file, 300, 300, 0.7);
                                  setNewAvatar(compressed);
                                } catch (err) {
                                  console.error('Compress photo error:', err);
                                }
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <div className="flex items-center justify-center gap-1.5 text-teal-800 font-bold text-xs py-1">
                            <Upload className="w-4 h-4 text-teal-600" />
                            <span>Pilih Foto Profil</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">2. Atau Tempel Link URL Foto</label>
                        <input
                          type="text"
                          placeholder="https://.../foto.jpg"
                          value={newAvatar}
                          onChange={(e) => setNewAvatar(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                        />
                      </div>
                    </div>
                    {newAvatar && newAvatar.trim() !== '' && (
                      <div className="flex items-center gap-3 p-2 bg-teal-50/80 rounded-xl border border-teal-200 mt-1">
                        <img
                          src={newAvatar}
                          alt="Preview Foto"
                          className="w-12 h-12 object-cover rounded-xl border border-teal-300 bg-white shrink-0 shadow-2xs"
                        />
                        <div className="flex-1 overflow-hidden">
                          <span className="text-xs font-bold text-teal-950 block">Foto Profil Terpasang</span>
                          <p className="text-[10px] text-teal-700">Foto profil ini akan dilihat pasien saat mendaftar sesi.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewAvatar('')}
                          className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-lg text-[10px] transition-all cursor-pointer shrink-0"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Tarif & Rekening */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>2. Tarif Konsultasi & Rekening Pembayaran</span>
                  </h4>

                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                    <span className="font-bold text-slate-800 block text-xs">Tarif Sesi Konsultasi Pasien (Rp)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Sesi Chat</label>
                        <input
                          type="number"
                          value={priceChat}
                          onChange={(e) => setPriceChat(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Video Call</label>
                        <input
                          type="number"
                          value={priceVideo}
                          onChange={(e) => setPriceVideo(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Tatap Muka</label>
                        <input
                          type="number"
                          value={priceOffline}
                          onChange={(e) => setPriceOffline(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                    <span className="font-bold text-slate-800 block text-xs">Detail Bank Pembayaran Pasien</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Nama Bank</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="BCA / Mandiri / BNI / BRI"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">No Rekening</label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="1234567890"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Atas Nama</label>
                        <input
                          type="text"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          placeholder="Nama Pemilik Rekening"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* QRIS Input Box */}
                    <div className="pt-2 border-t border-slate-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-purple-600" />
                          <span>Gambar QRIS Kustom Psikolog (Opsional)</span>
                        </span>
                        {qrisUrl && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Gambar QRIS Tersimpan
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1 font-semibold">1. Unggah Foto QRIS (Dari HP / Laptop)</label>
                          <div className="relative border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white rounded-xl p-2.5 text-center transition-all cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const compressed = await compressImageFile(file);
                                    setQrisUrl(compressed);
                                  } catch (err) {
                                    console.error('Compress image error:', err);
                                  }
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs py-1">
                              <Upload className="w-4 h-4 text-purple-600" />
                              <span className="font-bold text-purple-800">Pilih File Foto QRIS</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1 font-semibold">2. Atau Tempel Link URL Gambar QRIS</label>
                          <input
                            type="text"
                            placeholder="https://.../foto-qris.jpg"
                            value={qrisUrl}
                            onChange={(e) => setQrisUrl(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                          />
                        </div>
                      </div>

                      {qrisUrl && (
                        <div className="flex items-center gap-3 p-2.5 bg-purple-50/80 rounded-xl border border-purple-200">
                          <img
                            src={qrisUrl}
                            alt="Preview QRIS Kustom"
                            className="w-16 h-16 object-contain rounded-lg border border-purple-300 bg-white shadow-2xs shrink-0"
                          />
                          <div className="flex-1 overflow-hidden">
                            <span className="text-xs font-bold text-purple-950 block truncate">Gambar QRIS Kustom Aktif</span>
                            <p className="text-[10px] text-purple-700 leading-tight">
                              Pasien akan melihat gambar QRIS ini saat melakukan transfer pembayaran.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setQrisUrl('')}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-lg text-[10px] transition-all cursor-pointer shrink-0"
                          >
                            Hapus QRIS
                          </button>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-500 italic">
                        *Jika dikosongkan, sistem secara otomatis merender QR Code dinamis standar berdasarkan No. Rekening & Bank di atas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Slot Jadwal */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>3. Slot Jadwal Praktik Awal</span>
                  </h4>

                  <input
                    type="text"
                    placeholder="Contoh: Hari Ini 16:00 WIB, Hari Ini 19:00 WIB, Besok 10:00 WIB"
                    value={newScheduleSlotsText}
                    onChange={(e) => setNewScheduleSlotsText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-xs font-medium bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Simpan Psikolog Baru</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {psychologists.map((p) => (
                <div key={p.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      {p.avatar && p.avatar.trim() !== '' ? (
                        <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-2xs" />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 border border-teal-200 shadow-2xs">
                          {getPsychologistInitials(p.name)}
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{p.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{p.title}</p>
                        <p className="text-[11px] text-teal-700 font-semibold truncate">WA: {p.whatsapp}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingPsychologist(p)}
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
                          title="Edit Data, Bank & QRIS"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePsychologist(p.id, p.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Hapus dari daftar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1 mt-3 text-[11px]">
                      {p.specialties.map((sp, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-semibold">
                          {sp}
                        </span>
                      ))}
                    </div>

                    {/* Bank & QRIS summary info */}
                    <div className="mt-3 p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-purple-900 flex items-center justify-between gap-2">
                      <div className="overflow-hidden">
                        <span className="font-bold block truncate">
                          Rekening: {p.bankAccount.bankName} - {p.bankAccount.accountNumber} ({p.bankAccount.accountHolder})
                        </span>
                        <span className="text-[10px] text-purple-700 flex items-center gap-1 mt-0.5 font-medium">
                          <QrCode className="w-3 h-3 text-purple-600" />
                          {p.bankAccount.qrisCodeUrl && p.bankAccount.qrisCodeUrl.trim() !== '' ? 'QRIS Kustom Terpasang' : 'QRIS Dinamis Otomatis'}
                        </span>
                      </div>
                      <button
                        onClick={() => setEditingPsychologist(p)}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[10px] shrink-0 transition-all cursor-pointer shadow-2xs"
                      >
                        Edit QRIS / Bank
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-1 border border-slate-100 font-medium">
                    <span>Chat: <strong className="text-slate-900">{formatRupiah(p.prices.chat)}</strong></span>
                    <span>Video: <strong className="text-slate-900">{formatRupiah(p.prices.video)}</strong></span>
                    <span>Tatap Muka: <strong className="text-slate-900">{formatRupiah(p.prices.offline)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SCHEDULES */}
          {activeTab === 'schedules' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">Atur Slot Jadwal Konsultasi Per Psikolog</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tambah atau hapus jam praktik yang dapat dipilih oleh pasien saat mendaftar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {psychologists.map((p) => (
                  <div key={p.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                      {p.avatar && p.avatar.trim() !== '' ? (
                        <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-teal-200">
                          {getPsychologistInitials(p.name)}
                        </div>
                      )}
                      <span className="font-bold text-slate-900 text-xs truncate">{p.name}</span>
                    </div>

                    {/* Existing Slots */}
                    <div className="flex flex-wrap gap-1.5">
                      {(p.scheduleSlots || []).map((slot, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold flex items-center gap-1.5"
                        >
                          <span>{slot}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlotFromPsychologist(p.id, slot)}
                            className="hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Slot Control */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Contoh: 19:30 WIB Besok"
                        value={slotInputs[p.id] || ''}
                        onChange={(e) =>
                          setSlotInputs((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSlotToPsychologist(p.id)}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CMS CONFIGURATION & SPREADSHEET */}
          {activeTab === 'cms' && <CmsAdminTab />}

        </main>
      </div>

      {/* RECEIPT IMAGE PREVIEW MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl relative border border-purple-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-base text-slate-900">Bukti Transfer / QRIS Pasien</h4>
                <p className="text-xs text-purple-700 font-semibold mt-0.5">
                  Pasien: <span className="font-black text-slate-900">{selectedReceipt.patientName}</span> ({selectedReceipt.name})
                </p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto flex items-center justify-center bg-slate-900/5 rounded-2xl p-2 border border-slate-200">
              {selectedReceipt.url.startsWith('data:image') || selectedReceipt.url.startsWith('http') ? (
                <img
                  src={selectedReceipt.url}
                  alt="Bukti Transfer Pasien"
                  className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-md"
                />
              ) : (
                <div className="p-8 text-center text-slate-600 space-y-2">
                  <CreditCard className="w-10 h-10 mx-auto text-purple-600" />
                  <p className="text-xs font-bold">{selectedReceipt.name}</p>
                  <a
                    href={selectedReceipt.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs hover:bg-purple-700 transition-all"
                  >
                    Buka / Unduh File Bukti
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href={selectedReceipt.url}
                target="_blank"
                rel="noreferrer"
                download={selectedReceipt.name}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Buka Gambar Ukuran Penuh</span>
              </a>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-xs"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-[#0A061B]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#180E3B] border border-[#2B1B61] text-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setDeleteConfirmTarget(null)}
              className="absolute top-4 right-4 p-2 text-purple-300 hover:text-white bg-[#261754] rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Konfirmasi Hapus</h3>
                <p className="text-purple-200/70 text-xs">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#10092B] rounded-2xl border border-[#2B1B61] text-xs text-purple-200 mb-5 leading-relaxed">
              {deleteConfirmTarget.type === 'single_session' && (
                <p>
                  Apakah Anda yakin ingin menghapus record pendaftaran sesi pasien <strong className="text-white font-bold">{deleteConfirmTarget.name}</strong>?
                </p>
              )}
              {deleteConfirmTarget.type === 'all_sessions' && (
                <p>
                  Apakah Anda yakin ingin <strong className="text-rose-400 font-black">MENGHAPUS SEMUA DATA SESI PASIEN</strong>? Data pada Google Sheets (jika terhubung) juga akan dikosongkan.
                </p>
              )}
              {deleteConfirmTarget.type === 'psychologist' && (
                <p>
                  Apakah Anda yakin ingin menghapus psikolog <strong className="text-white font-bold">{deleteConfirmTarget.name}</strong> dari direktori?
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2.5 bg-[#261754] hover:bg-[#311E6A] text-purple-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT PSIKOLOG & QRIS */}
      {editingPsychologist && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 border border-purple-100">
            <button
              type="button"
              onClick={() => setEditingPsychologist(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Edit Data, Rekening & Gambar QRIS</h3>
                <p className="text-xs text-slate-500">
                  Ubah rincian pembayaran & foto QRIS kustom untuk <strong className="text-purple-700">{editingPsychologist.name}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              {/* Form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Psikolog</label>
                  <input
                    type="text"
                    value={editingPsychologist.name}
                    onChange={(e) => setEditingPsychologist({ ...editingPsychologist, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Psikolog</label>
                  <input
                    type="text"
                    value={editingPsychologist.whatsapp}
                    onChange={(e) => setEditingPsychologist({ ...editingPsychologist, whatsapp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* Foto Profil Psikolog */}
              <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 block">Foto Profil Psikolog</span>
                  <span className="text-[10px] text-slate-500">Kosongkan jika hanya ingin menampilkan inisial</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">1. Unggah Foto Baru</label>
                    <div className="relative border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white rounded-xl p-2.5 text-center transition-all cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImageFile(file, 300, 300, 0.7);
                              setEditingPsychologist((prev) => prev ? ({ ...prev, avatar: compressed }) : null);
                            } catch (err) {
                              console.error('Compress photo error:', err);
                            }
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="flex items-center justify-center gap-1.5 text-purple-800 font-bold text-xs py-1">
                        <Upload className="w-4 h-4 text-purple-600" />
                        <span>Pilih Foto Profil</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">2. Atau Tempel Link URL Foto</label>
                    <input
                      type="text"
                      placeholder="https://.../foto.jpg"
                      value={editingPsychologist.avatar || ''}
                      onChange={(e) => setEditingPsychologist({ ...editingPsychologist, avatar: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                    />
                  </div>
                </div>
                {editingPsychologist.avatar && editingPsychologist.avatar.trim() !== '' ? (
                  <div className="flex items-center gap-3 p-2 bg-purple-100/70 rounded-xl border border-purple-200 mt-2">
                    <img
                      src={editingPsychologist.avatar}
                      alt="Preview Foto"
                      className="w-12 h-12 object-cover rounded-xl border border-purple-300 bg-white shrink-0 shadow-2xs"
                    />
                    <div className="flex-1 overflow-hidden">
                      <span className="text-xs font-bold text-purple-950 block">Foto Profil Terpasang</span>
                      <p className="text-[10px] text-purple-700">Foto ini akan muncul saat pasien mendaftar sesi.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingPsychologist({ ...editingPsychologist, avatar: '' })}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-lg text-[10px] transition-all cursor-pointer shrink-0"
                    >
                      Hapus Foto (Gunakan Inisial)
                    </button>
                  </div>
                ) : (
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Sistem akan menampilkan <strong>Inisial Nama ({getPsychologistInitials(editingPsychologist.name)})</strong> karena foto profil belum diunggah.</span>
                  </div>
                )}
              </div>

              {/* Bank Account Details */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block">Detail Bank & Rekening Pembayaran</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold font-sans">Nama Bank</label>
                    <input
                      type="text"
                      value={editingPsychologist.bankAccount.bankName}
                      onChange={(e) => setEditingPsychologist({
                        ...editingPsychologist,
                        bankAccount: { ...editingPsychologist.bankAccount, bankName: e.target.value }
                      })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">No Rekening</label>
                    <input
                      type="text"
                      value={editingPsychologist.bankAccount.accountNumber}
                      onChange={(e) => setEditingPsychologist({
                        ...editingPsychologist,
                        bankAccount: { ...editingPsychologist.bankAccount, accountNumber: e.target.value }
                      })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Atas Nama</label>
                    <input
                      type="text"
                      value={editingPsychologist.bankAccount.accountHolder}
                      onChange={(e) => setEditingPsychologist({
                        ...editingPsychologist,
                        bankAccount: { ...editingPsychologist.bankAccount, accountHolder: e.target.value }
                      })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs"
                    />
                  </div>
                </div>

                {/* QRIS Upload / URL */}
                <div className="pt-3 border-t border-slate-200/80 space-y-2">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-purple-600" />
                    <span>Gambar QRIS Kustom Psikolog</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1 font-semibold">1. Unggah Foto QRIS Kustom</label>
                      <div className="relative border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white rounded-xl p-2.5 text-center transition-all cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressed = await compressImageFile(file);
                                setEditingPsychologist((prev) => prev ? ({
                                  ...prev,
                                  bankAccount: { ...prev.bankAccount, qrisCodeUrl: compressed }
                                }) : null);
                              } catch (err) {
                                console.error('Compress image error:', err);
                              }
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        <div className="flex items-center justify-center gap-1.5 text-purple-800 font-bold text-xs py-1">
                          <Upload className="w-4 h-4 text-purple-600" />
                          <span>Pilih Foto QRIS</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1 font-semibold">2. Atau Tempel Link URL QRIS</label>
                      <input
                        type="text"
                        placeholder="https://.../qris.jpg"
                        value={editingPsychologist.bankAccount.qrisCodeUrl || ''}
                        onChange={(e) => setEditingPsychologist({
                          ...editingPsychologist,
                          bankAccount: { ...editingPsychologist.bankAccount, qrisCodeUrl: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                      />
                    </div>
                  </div>

                  {editingPsychologist.bankAccount.qrisCodeUrl && (
                    <div className="flex items-center gap-3 p-2.5 bg-purple-50/80 rounded-xl border border-purple-200 mt-2">
                      <img
                        src={editingPsychologist.bankAccount.qrisCodeUrl}
                        alt="Preview QRIS"
                        className="w-16 h-16 object-contain rounded-lg border border-purple-300 bg-white shrink-0 shadow-2xs"
                      />
                      <div className="flex-1 overflow-hidden">
                        <span className="text-xs font-bold text-purple-950 block">Gambar QRIS Kustom Terpasang</span>
                        <p className="text-[10px] text-purple-700">Pasien akan melihat gambar QRIS ini saat mendaftar sesi.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingPsychologist({
                          ...editingPsychologist,
                          bankAccount: { ...editingPsychologist.bankAccount, qrisCodeUrl: '' }
                        })}
                        className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-lg text-[10px] transition-all cursor-pointer shrink-0"
                      >
                        Hapus QRIS
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Prices */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Tarif Sesi Konsultasi (Rp)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Sesi Chat</label>
                    <input
                      type="number"
                      value={editingPsychologist.prices.chat}
                      onChange={(e) => setEditingPsychologist({
                        ...editingPsychologist,
                        prices: { ...editingPsychologist.prices, chat: Number(e.target.value) }
                      })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Video Call</label>
                    <input
                      type="number"
                      value={editingPsychologist.prices.video}
                      onChange={(e) => setEditingPsychologist({
                        ...editingPsychologist,
                        prices: { ...editingPsychologist.prices, video: Number(e.target.value) }
                      })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Tatap Muka</label>
                    <input
                      type="number"
                      value={editingPsychologist.prices.offline}
                      onChange={(e) => setEditingPsychologist({
                        ...editingPsychologist,
                        prices: { ...editingPsychologist.prices, offline: Number(e.target.value) }
                      })}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingPsychologist(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingPsychologist) {
                    updatePsychologist(editingPsychologist.id, editingPsychologist);
                    setPsychologists(getPsychologists());
                    setFormSuccess(`Data & QRIS ${editingPsychologist.name} berhasil diperbarui dan disinkronkan ke Google Sheets!`);
                    setTimeout(() => setFormSuccess(''), 5000);
                    setEditingPsychologist(null);
                  }
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};
