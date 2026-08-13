import React from 'react';
import { Home, MessageSquare, BookOpen, UserCheck, Heart } from 'lucide-react';
import { useCmsConfig } from '../../data/cmsStore';
import { APP_IMAGES } from '../../data/appImages';
import { TransparentImage } from '../common/TransparentImage';

export interface MobileBottomNavProps {
  activeTab?: string;
  onGoHome?: () => void;
  onStartCurhat?: () => void;
  onOpenJournal?: () => void;
  onOpenMoodTracker?: () => void;
  onOpenMitra?: () => void;
  onOpenPsikolog?: () => void;
  onOpenPsikotes?: () => void;
  onOpenDashboard?: () => void;
  onOpenNav?: () => void;
}

const SapaHatiLogoIcon: React.FC = () => (
  <div className="relative flex items-center justify-center">
    <Heart className="w-6.5 h-6.5 text-white fill-white drop-shadow-sm" />
  </div>
);

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab = 'home',
  onGoHome,
  onStartCurhat,
  onOpenJournal,
  onOpenMoodTracker,
  onOpenMitra,
  onOpenPsikolog,
  onOpenPsikotes,
  onOpenDashboard,
  onOpenNav,
}) => {
  const cms = useCmsConfig();
  const rawLogo = cms?.branding?.appIcon || APP_IMAGES.appIcon || cms?.branding?.logoImage || APP_IMAGES.logoImage;
  const isExternalImage = typeof rawLogo === 'string' && rawLogo.startsWith('http') && !rawLogo.includes('data:image/svg');

  const handleJournalClick = () => {
    if (onOpenJournal) {
      onOpenJournal();
    } else if (onOpenMoodTracker) {
      onOpenMoodTracker();
    }
  };

  const handleMitraClick = () => {
    if (onOpenMitra) {
      onOpenMitra();
    } else if (onOpenNav) {
      onOpenNav();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-purple-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] py-1.5 px-3 md:hidden flex items-center justify-between max-w-md mx-auto">
      {/* 1. Beranda */}
      <button
        onClick={onGoHome}
        className={`flex flex-col items-center gap-0.5 flex-1 transition-colors cursor-pointer ${
          activeTab === 'home' ? 'text-[#6C47FF] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Home className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[9.5px]">Beranda</span>
      </button>

      {/* 2. Mulai Curhat */}
      <button
        onClick={onStartCurhat}
        className={`flex flex-col items-center gap-0.5 flex-1 transition-colors cursor-pointer ${
          activeTab === 'chat' || activeTab === 'curhat' ? 'text-[#6C47FF] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <MessageSquare className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[9.5px]">Mulai Curhat</span>
      </button>

      {/* 3. Center Floating Circle Button: Transparent Logo Sapa Hati Icon (No background box & No text) */}
      <div className="relative -mt-6 flex flex-col items-center px-1">
        <button
          onClick={onGoHome}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#6C47FF] via-[#5034D4] to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/35 border-4 border-white active:scale-95 transition-transform cursor-pointer p-2.5"
          title="Beranda Sapa Hati"
        >
          {isExternalImage ? (
            <TransparentImage 
              src={rawLogo} 
              alt="Logo Sapa Hati" 
              className="w-full h-full object-contain"
            />
          ) : (
            <SapaHatiLogoIcon />
          )}
        </button>
      </div>

      {/* 4. Jurnal */}
      <button
        onClick={handleJournalClick}
        className={`flex flex-col items-center gap-0.5 flex-1 transition-colors cursor-pointer ${
          activeTab === 'journal' || activeTab === 'jurnal' || activeTab === 'aktivitas' ? 'text-[#6C47FF] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <BookOpen className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[9.5px]">Jurnal</span>
      </button>

      {/* 5. Daftar Mitra */}
      <button
        onClick={handleMitraClick}
        className={`flex flex-col items-center gap-0.5 flex-1 transition-colors cursor-pointer ${
          activeTab === 'mitra' || activeTab === 'daftar-mitra' ? 'text-[#6C47FF] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <UserCheck className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[9.5px]">Daftar Mitra</span>
      </button>
    </nav>
  );
};
