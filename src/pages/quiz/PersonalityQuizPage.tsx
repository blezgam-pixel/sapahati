import React, { useState } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { PersonalityQuizSection } from '../../components/user/PersonalityQuizSection';
import { Header } from '../../components/user/Header';
import { MobileHeader } from '../../components/user/MobileHeader';
import { MobileBottomNav } from '../../components/user/MobileBottomNav';
import { NavigationDrawer } from '../../components/user/NavigationDrawer';
import { PsikologModal } from '../../components/psychologist/PsikologModal';
import { CurhatAiModal } from '../../components/user/CurhatAiModal';
import { APP_IMAGES } from '../../data/appImages';

interface PersonalityQuizPageProps {
  onBackToHome: () => void;
  onOpenDashboard: () => void;
  onOpenPsikotes: () => void;
  onOpenJournal?: () => void;
  onOpenMitra?: () => void;
  onStartCurhat?: () => void;
  onOpenPsikolog?: () => void;
}

export const PersonalityQuizPage: React.FC<PersonalityQuizPageProps> = ({
  onBackToHome,
  onOpenDashboard,
  onOpenPsikotes,
  onOpenJournal,
  onOpenMitra,
  onStartCurhat,
  onOpenPsikolog,
}) => {
  const [isPsikologOpen, setIsPsikologOpen] = useState(false);
  const [isCurhatAiOpen, setIsCurhatAiOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleOpenPsikolog = onOpenPsikolog || (() => setIsPsikologOpen(true));

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#1D123B] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-purple-200 overflow-x-hidden w-full pb-20 md:pb-10">
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header
          onOpenNav={() => setIsNavOpen(true)}
          onStartCurhat={onStartCurhat || (() => setIsCurhatAiOpen(true))}
          onOpenPsikolog={handleOpenPsikolog}
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
      <main className="flex-1 pt-16 md:pt-20 px-2 sm:px-4 max-w-6xl mx-auto w-full">
        <PersonalityQuizSection
          onOpenPsikolog={handleOpenPsikolog}
        />
      </main>

      {/* Mobile Fixed Bottom Nav */}
      <MobileBottomNav
        activeTab="none"
        onGoHome={onBackToHome}
        onOpenJournal={onOpenJournal}
        onOpenMitra={onOpenMitra}
        onOpenPsikolog={handleOpenPsikolog}
        onStartCurhat={onStartCurhat || (() => setIsCurhatAiOpen(true))}
        onOpenPsikotes={onOpenPsikotes}
        onOpenNav={onBackToHome}
      />

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onGoHome={onBackToHome}
        onStartCurhat={onStartCurhat || (() => setIsCurhatAiOpen(true))}
        onOpenPsikolog={handleOpenPsikolog}
        onOpenDashboard={onOpenDashboard}
        onOpenJournal={onOpenJournal}
        onOpenMitra={onOpenMitra}
        onOpenPsikotes={onOpenPsikotes}
      />

      {/* Modals */}
      <PsikologModal
        isOpen={isPsikologOpen}
        onClose={() => setIsPsikologOpen(false)}
      />

      <CurhatAiModal
        isOpen={isCurhatAiOpen}
        onClose={() => setIsCurhatAiOpen(false)}
        onOpenPsikolog={handleOpenPsikolog}
        botAvatar={APP_IMAGES.botAvatar}
      />
    </div>
  );
};
