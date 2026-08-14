import React, { useState, useEffect } from 'react';
import { X, MessageSquare, User, Smile, Home, ShieldCheck, UserCheck, Brain, BookOpen, Handshake } from 'lucide-react';
import { getCmsConfig, subscribeCmsConfig } from '../../data/cmsStore';
import { TransparentImage } from '../common/TransparentImage';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCurhat?: () => void;
  onOpenPsikolog?: () => void;
  onOpenDashboard?: () => void;
  onOpenMoodTracker?: () => void;
  onOpenJournal?: () => void;
  onOpenMitra?: () => void;
  onOpenPsikotes?: () => void;
  onGoHome?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onStartCurhat,
  onOpenPsikolog,
  onOpenDashboard,
  onOpenMoodTracker,
  onOpenJournal,
  onOpenMitra,
  onOpenPsikotes,
  onGoHome,
}) => {
  const [cms, setCms] = useState(() => getCmsConfig());

  useEffect(() => {
    const unsub = subscribeCmsConfig((cfg) => setCms(cfg));
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const branding = cms.branding;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-xs sm:max-w-sm h-full shadow-2xl flex flex-col justify-between p-5 sm:p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-purple-100">
            <div className="flex items-center gap-2.5">
              {branding.logoImage && (
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <TransparentImage src={branding.logoImage} alt={`${branding.brandName || 'App'} Logo`} className="w-full h-full object-contain" />
              </div>
              )}
              {branding.brandName && (
              <span className="text-xl font-extrabold text-[#1D123B]">{branding.brandName}</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="py-5 space-y-1.5">
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                else window.scrollTo({ top: 0, behavior: 'smooth' });
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-purple-50 text-slate-700 hover:text-[#7C5CFC] font-semibold text-sm transition-all cursor-pointer"
            >
              <Home className="w-5 h-5 text-purple-600" />
              <span>Beranda Utama</span>
            </button>

            {onOpenPsikotes && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPsikotes();
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-purple-50 text-slate-700 hover:text-[#6C47FF] font-semibold text-sm transition-all cursor-pointer"
              >
                <Brain className="w-5 h-5 text-purple-600" />
                <span>Psikotes Online</span>
              </button>
            )}

            {onStartCurhat && (
              <button
                onClick={() => {
                  onClose();
                  onStartCurhat();
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-purple-50 text-slate-700 hover:text-[#7C5CFC] font-semibold text-sm transition-all cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span>Sesi Curhat</span>
              </button>
            )}

            {onOpenPsikolog && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPsikolog();
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-semibold text-sm transition-all cursor-pointer"
              >
                <User className="w-5 h-5 text-teal-600" />
                <span>Konsultasi Psikolog</span>
              </button>
            )}

            {(onOpenMoodTracker || onOpenJournal) && (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenJournal) onOpenJournal();
                  else if (onOpenMoodTracker) onOpenMoodTracker();
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-semibold text-sm transition-all cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>Jurnal Mood & Kenali Diri</span>
              </button>
            )}

            {onOpenMitra && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMitra();
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-purple-50 text-slate-700 hover:text-[#6C47FF] font-semibold text-sm transition-all cursor-pointer"
              >
                <Handshake className="w-5 h-5 text-purple-600" />
                <span>Daftar Mitra Sapahati</span>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom Drawer Footer */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privasi Terjamin 100%</span>
            </div>
            <p>Aplikasi kesehatan mental dengan enkripsi dan data kerahasiaan penuh.</p>
          </div>

          <div className="text-center text-[11px] text-slate-400">
            Sapahati • Teman bicara yang selalu mengerti
          </div>
        </div>

      </div>
    </div>
  );
};
