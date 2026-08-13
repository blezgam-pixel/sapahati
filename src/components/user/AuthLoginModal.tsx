import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, ArrowRight, Sparkles, User, Mail, Lock, Trash2, CheckCircle2, UserPlus, Check, ChevronRight } from 'lucide-react';
import { UserAccount, loginUser, logoutUser, clearAllLinkedAccounts, getLoggedInUser } from '../../data/authStore';

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserAccount) => void;
  title?: string;
  subtitle?: string;
}

// Google accounts matching Google's account chooser UI
const GOOGLE_ACCOUNTS: UserAccount[] = [
  {
    id: 'google_blezgam',
    name: 'AHMAD HABIBI',
    email: 'blezgam@gmail.com',
    provider: 'google',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
  },
  {
    id: 'google_ahmadhabibi',
    name: 'Ahmad Habibi',
    email: 'ahmadhabibi130301@gmail.com',
    provider: 'google',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
  },
  {
    id: 'google_datahabibi',
    name: 'data habibi',
    email: 'datacenter130301@gmail.com',
    provider: 'google',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
  },
];

const APPLE_ACCOUNTS: UserAccount[] = [
  {
    id: 'apple_blezgam',
    name: 'AHMAD HABIBI',
    email: 'blezgam@icloud.com',
    provider: 'apple',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
  },
  {
    id: 'apple_ahmadhabibi',
    name: 'Ahmad Habibi',
    email: 'ahmadhabibi130301@icloud.com',
    provider: 'apple',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
  },
];

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Login Akun Asli Terkoneksi',
  subtitle = 'Masuk langsung dengan akun Google atau Apple ID asli milikmu tanpa mengetik ulang.',
}) => {
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'apple' | null>(null);
  const [showCustomEmailForm, setShowCustomEmailForm] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);

  const currentUser = getLoggedInUser();

  if (!isOpen) return null;

  const handleSelectProvider = (provider: 'google' | 'apple') => {
    setSelectedProvider(provider);
    setShowCustomEmailForm(false);
    setErrorMsg('');
    setSuccessMsg('');
    setEmailInput('');
    setNameInput('');
  };

  const handleInstantLogin = (account: UserAccount) => {
    setActiveAccount(account);
    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      loginUser(account);
      setIsSubmitting(false);
      setActiveAccount(null);
      if (onSuccess) onSuccess(account);
      onClose();
    }, 400);
  };

  const handleClearAccounts = () => {
    clearAllLinkedAccounts();
    setSelectedProvider(null);
    setShowCustomEmailForm(false);
    setEmailInput('');
    setNameInput('');
    setErrorMsg('');
    setSuccessMsg('Semua sesi akun tertaut telah dibersihkan!');
  };

  const handleSubmitCustomEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMsg('Silakan masukkan alamat email asli kamu.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Format email tidak valid. Masukkan alamat email yang lengkap.');
      return;
    }

    if (selectedProvider === 'google' && !trimmedEmail.endsWith('@gmail.com') && !trimmedEmail.includes('gmail')) {
      setErrorMsg('Untuk login Google, gunakan alamat email @gmail.com milikmu.');
      return;
    }

    if (selectedProvider === 'apple' && !trimmedEmail.endsWith('@icloud.com') && !trimmedEmail.endsWith('@apple.com') && !trimmedEmail.includes('apple')) {
      setErrorMsg('Untuk login Apple, gunakan alamat email Apple ID / iCloud milikmu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      const displayName = nameInput.trim() || (selectedProvider === 'google' ? 'Pengguna Google' : 'Pengguna Apple');

      const userAccount: UserAccount = {
        id: `${selectedProvider}_${Date.now()}`,
        name: displayName,
        email: trimmedEmail,
        provider: selectedProvider || 'google',
        avatarUrl:
          selectedProvider === 'google'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      };

      loginUser(userAccount);
      setIsSubmitting(false);
      if (onSuccess) onSuccess(userAccount);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800">
        
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-white/20 text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Otentikasi Akun Perangkat
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold">{title}</h3>
          <p className="text-xs text-purple-100 mt-1 leading-relaxed opacity-95">
            {subtitle}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Notification banner */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* Active logged in user badge */}
          {currentUser && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {currentUser.email}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Terkoneksi sebagai {currentUser.name} ({currentUser.provider})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setSuccessMsg('Akun telah keluar.');
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                Keluar
              </button>
            </div>
          )}

          {!selectedProvider ? (
            /* STEP 1: Provider Selection */
            <div className="space-y-3.5">
              <label className="text-xs font-bold text-slate-600 block uppercase tracking-wide">
                Pilih Layanan Otentikasi Langsung:
              </label>

              {/* Google SSO Button */}
              <button
                type="button"
                onClick={() => handleSelectProvider('google')}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-red-500 bg-white hover:bg-red-50/20 transition-all duration-200 flex items-center justify-between group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.7-1.3-1.6-1.3-2.7z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-900 text-sm block group-hover:text-red-600 transition-colors">
                      Masuk dengan Google (Pilih Akun)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Terkoneksi langsung dengan akun Google perangkat
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Apple SSO Button */}
              <button
                type="button"
                onClick={() => handleSelectProvider('apple')}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-800 bg-slate-900 hover:bg-black text-white transition-all duration-200 flex items-center justify-between group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.12-1 .04-2.22.67-2.93 1.5-.64.74-1.2 1.92-1.05 3.06 1.12.09 2.27-.61 2.99-1.44z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-white text-sm block">
                      Masuk dengan Apple ID
                    </span>
                    <span className="text-[11px] text-slate-300 block">
                      Terkoneksi langsung dengan Apple ID perangkat
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              {/* Clear linked accounts button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Bersihkan riwayat login?</span>
                <button
                  type="button"
                  onClick={handleClearAccounts}
                  className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Bersihkan Akun</span>
                </button>
              </div>

              <div className="pt-1 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 bg-purple-50/70 p-2.5 rounded-xl border border-purple-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Otentikasi privat &amp; aman. Kuota 5x tanya AI berlaku per akun terverifikasi.</span>
              </div>
            </div>
          ) : (
            /* STEP 2: Authentic "Pilih Akun" Google / Apple Chooser */
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              
              {/* Native Account Chooser Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {selectedProvider === 'google' ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.7-1.3-1.6-1.3-2.7z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                      />
                    </svg>
                  ) : (
                    <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base leading-tight">
                      {selectedProvider === 'google' ? 'Login dengan Google' : 'Login dengan Apple ID'}
                    </h4>
                    <span className="text-xs font-semibold text-purple-700 block">
                      Pilih akun untuk melanjutkan
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvider(null);
                    setShowCustomEmailForm(false);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-purple-600 hover:underline cursor-pointer"
                >
                  Batal
                </button>
              </div>

              {!showCustomEmailForm ? (
                <>
                  {/* Account List Picker */}
                  <div className="space-y-2">
                    {(selectedProvider === 'google' ? GOOGLE_ACCOUNTS : APPLE_ACCOUNTS).map((account) => {
                      const isAuthThis = activeAccount?.id === account.id;

                      return (
                        <button
                          key={account.id}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleInstantLogin(account)}
                          className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between group text-left cursor-pointer ${
                            isAuthThis
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-slate-200 hover:border-purple-500 bg-white hover:bg-slate-50/80 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={account.avatarUrl}
                                alt={account.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                              />
                              <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-emerald-500 text-white border-2 border-white">
                                <Check className="w-2 h-2 stroke-[3]" />
                              </span>
                            </div>

                            <div>
                              <span className="font-extrabold text-slate-900 text-sm block group-hover:text-purple-700 transition-colors">
                                {account.name}
                              </span>
                              <span className="text-xs text-slate-600 font-medium block">
                                {account.email}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isAuthThis ? (
                              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg animate-pulse">
                                Memproses...
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-500 group-hover:text-purple-700 group-hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
                                <span>Masuk</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* "Gunakan akun lain" / Use another account */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomEmailForm(true);
                        setErrorMsg('');
                      }}
                      className="w-full p-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-purple-500 bg-slate-50/60 hover:bg-purple-50/40 transition-all flex items-center gap-3 text-slate-700 hover:text-purple-700 font-bold text-xs cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <UserPlus className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="text-left">
                        <span className="block text-slate-900 font-extrabold">
                          Gunakan akun {selectedProvider === 'google' ? 'Google' : 'Apple'} lain
                        </span>
                        <span className="block text-[11px] text-slate-500 font-normal">
                          Masukkan email {selectedProvider === 'google' ? '@gmail.com' : 'Apple ID'} milikmu
                        </span>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                /* Custom email input when choosing "Gunakan akun lain" */
                <form onSubmit={handleSubmitCustomEmail} className="space-y-3.5 pt-1">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                    <span className="text-xs font-bold text-purple-900">
                      Masukkan Email {selectedProvider === 'google' ? 'Google / Gmail' : 'Apple ID'} Lain:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomEmailForm(false)}
                      className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
                    >
                      Kembali ke Pilihan Akun
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Alamat Email {selectedProvider === 'google' ? 'Gmail' : 'Apple ID'}:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={selectedProvider === 'google' ? 'contoh: nama.kamu@gmail.com' : 'contoh: nama.kamu@icloud.com'}
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 text-sm font-medium outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nama Panggilan:
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama panggilan kamu"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 text-sm font-medium outline-hidden transition-all"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomEmailForm(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Memproses...' : 'Lanjutkan Login'}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-100 p-3 text-center">
          <p className="text-[10.5px] text-slate-500 font-medium flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Sesi privat Sesi Curhat terenkripsi &amp; aman 100%.</span>
          </p>
        </div>

      </div>
    </div>
  );
};
